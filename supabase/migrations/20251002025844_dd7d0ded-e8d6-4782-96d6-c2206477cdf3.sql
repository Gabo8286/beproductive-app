-- Add enhanced fields to goal_milestones table
ALTER TABLE goal_milestones
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
  ADD COLUMN IF NOT EXISTS actual_hours INTEGER,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- Create milestone dependencies table
CREATE TABLE IF NOT EXISTS goal_milestone_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES goal_milestones(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES goal_milestones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(milestone_id, depends_on_id)
);

-- Create milestone templates table
CREATE TABLE IF NOT EXISTS milestone_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  milestones JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE goal_milestone_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for milestone dependencies
CREATE POLICY "Users can view milestone dependencies"
  ON goal_milestone_dependencies FOR SELECT
  USING (
    milestone_id IN (
      SELECT gm.id FROM goal_milestones gm
      JOIN goals g ON g.id = gm.goal_id
      WHERE g.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage milestone dependencies"
  ON goal_milestone_dependencies FOR ALL
  USING (
    milestone_id IN (
      SELECT gm.id FROM goal_milestones gm
      JOIN goals g ON g.id = gm.goal_id
      WHERE g.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS policies for milestone templates
CREATE POLICY "Users can view their own templates"
  ON milestone_templates FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own templates"
  ON milestone_templates FOR ALL
  USING (created_by = auth.uid());

-- Enhanced milestone completion function
CREATE OR REPLACE FUNCTION complete_milestone_enhanced(
  milestone_id UUID,
  completion_notes TEXT DEFAULT NULL,
  actual_hours INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  milestone_goal_id UUID;
BEGIN
  UPDATE goal_milestones
  SET 
    completed_at = NOW(),
    updated_at = NOW(),
    completion_notes = COALESCE(complete_milestone_enhanced.completion_notes, completion_notes),
    actual_hours = COALESCE(complete_milestone_enhanced.actual_hours, actual_hours)
  WHERE id = milestone_id
  RETURNING goal_id INTO milestone_goal_id;

  -- Recalculate goal progress
  PERFORM calculate_goal_progress_from_milestones(milestone_goal_id);
END;
$$;

-- Calculate milestone analytics
CREATE OR REPLACE FUNCTION calculate_milestone_analytics(goal_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  overdue_count INTEGER;
  upcoming_count INTEGER;
  avg_completion_days NUMERIC;
  completion_rate NUMERIC;
  weekly_velocity NUMERIC;
  result JSON;
BEGIN
  -- Count totals
  SELECT COUNT(*) INTO total_count
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id;

  SELECT COUNT(*) INTO completed_count
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id
    AND completed_at IS NOT NULL;

  SELECT COUNT(*) INTO overdue_count
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id
    AND completed_at IS NULL
    AND target_date < CURRENT_DATE;

  SELECT COUNT(*) INTO upcoming_count
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id
    AND completed_at IS NULL
    AND target_date >= CURRENT_DATE
    AND target_date <= CURRENT_DATE + INTERVAL '7 days';

  -- Calculate average completion time
  SELECT AVG(EXTRACT(DAY FROM (completed_at - created_at)))
  INTO avg_completion_days
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id
    AND completed_at IS NOT NULL;

  -- Calculate completion rate
  IF total_count > 0 THEN
    completion_rate := (completed_count::NUMERIC / total_count::NUMERIC) * 100;
  ELSE
    completion_rate := 0;
  END IF;

  -- Calculate weekly velocity (completed in last 7 days)
  SELECT COUNT(*)::NUMERIC INTO weekly_velocity
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_milestone_analytics.goal_id
    AND completed_at >= NOW() - INTERVAL '7 days';

  -- Build result
  result := json_build_object(
    'totalMilestones', total_count,
    'completedMilestones', completed_count,
    'overdueMilestones', overdue_count,
    'upcomingMilestones', upcoming_count,
    'averageCompletionTime', COALESCE(avg_completion_days, 0),
    'completionRate', completion_rate,
    'milestoneVelocity', weekly_velocity
  );

  RETURN result;
END;
$$;

-- Bulk milestone operations
CREATE OR REPLACE FUNCTION bulk_milestone_operations(
  operation_type TEXT,
  milestone_ids UUID[],
  operation_data JSON DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  milestone_id UUID;
BEGIN
  CASE operation_type
    WHEN 'complete' THEN
      FOREACH milestone_id IN ARRAY milestone_ids
      LOOP
        PERFORM complete_milestone_enhanced(milestone_id);
      END LOOP;

    WHEN 'delete' THEN
      DELETE FROM goal_milestones
      WHERE id = ANY(milestone_ids);

    WHEN 'update' THEN
      IF operation_data IS NOT NULL THEN
        UPDATE goal_milestones
        SET 
          priority = COALESCE((operation_data->>'priority')::INTEGER, priority),
          tags = COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(operation_data->'tags')),
            tags
          ),
          updated_at = NOW()
        WHERE id = ANY(milestone_ids);
      END IF;

    ELSE
      RAISE EXCEPTION 'Unknown operation type: %', operation_type;
  END CASE;
END;
$$;

-- Apply milestone template
CREATE OR REPLACE FUNCTION apply_milestone_template(
  goal_id UUID,
  template_id UUID,
  start_date DATE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_data RECORD;
  milestone_data JSONB;
  base_date DATE;
  offset_days INTEGER;
BEGIN
  -- Get template
  SELECT * INTO template_data
  FROM milestone_templates
  WHERE id = template_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  base_date := COALESCE(start_date, CURRENT_DATE);

  -- Create milestones from template
  FOR milestone_data IN SELECT * FROM jsonb_array_elements(template_data.milestones)
  LOOP
    offset_days := COALESCE((milestone_data->>'offset_days')::INTEGER, 0);
    
    INSERT INTO goal_milestones (
      goal_id,
      title,
      description,
      target_date,
      priority,
      estimated_hours,
      tags
    ) VALUES (
      apply_milestone_template.goal_id,
      milestone_data->>'title',
      milestone_data->>'description',
      base_date + (offset_days || ' days')::INTERVAL,
      COALESCE((milestone_data->>'priority')::INTEGER, 3),
      (milestone_data->>'estimated_hours')::INTEGER,
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(milestone_data->'tags')),
        ARRAY[]::TEXT[]
      )
    );
  END LOOP;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_milestone_dependencies_milestone ON goal_milestone_dependencies(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_dependencies_depends_on ON goal_milestone_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_milestone_templates_category ON milestone_templates(category);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_priority ON goal_milestones(priority);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_target_date ON goal_milestones(target_date);