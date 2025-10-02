-- Drop existing goals table (incompatible schema)
DROP TABLE IF EXISTS goals CASCADE;

-- Create goal status and category enums
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE goal_category AS ENUM ('personal', 'professional', 'health', 'financial', 'learning', 'relationship', 'other');

-- Goals table with comprehensive fields
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category goal_category DEFAULT 'personal',
  status goal_status DEFAULT 'draft',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT,
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  parent_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (start_date <= target_date),
  CONSTRAINT valid_progress CHECK (
    (target_value IS NULL) OR
    (current_value IS NULL) OR
    (current_value <= target_value)
  )
);

-- Goal milestones for tracking progress
CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX idx_goals_workspace_id ON goals(workspace_id);
CREATE INDEX idx_goals_created_by ON goals(created_by);
CREATE INDEX idx_goals_assigned_to ON goals(assigned_to);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_parent_goal_id ON goals(parent_goal_id);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);

-- Goals RLS policies
CREATE POLICY "Users can view workspace goals"
  ON goals FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create goals in their workspaces"
  ON goals FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update goals in their workspaces"
  ON goals FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (created_by = auth.uid());

-- Goal milestones RLS policies
CREATE POLICY "Users can view goal milestones"
  ON goal_milestones FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage goal milestones"
  ON goal_milestones FOR ALL
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress(
  goal_id UUID,
  new_progress DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE goals
  SET progress = new_progress,
      updated_at = NOW(),
      completed_at = CASE
        WHEN new_progress >= 100 AND completed_at IS NULL THEN NOW()
        WHEN new_progress < 100 THEN NULL
        ELSE completed_at
      END,
      status = CASE
        WHEN new_progress >= 100 THEN 'completed'::goal_status
        WHEN status = 'completed' AND new_progress < 100 THEN 'active'::goal_status
        ELSE status
      END
  WHERE id = goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate goal progress from milestones
CREATE OR REPLACE FUNCTION calculate_goal_progress_from_milestones(goal_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  calculated_progress DECIMAL;
BEGIN
  SELECT COUNT(*) INTO total_milestones
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_goal_progress_from_milestones.goal_id;

  IF total_milestones = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO completed_milestones
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_goal_progress_from_milestones.goal_id
    AND completed_at IS NOT NULL;

  calculated_progress := (completed_milestones::DECIMAL / total_milestones::DECIMAL) * 100;

  PERFORM update_goal_progress(calculate_goal_progress_from_milestones.goal_id, calculated_progress);

  RETURN calculated_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to complete a milestone
CREATE OR REPLACE FUNCTION complete_milestone(milestone_id UUID)
RETURNS VOID AS $$
DECLARE
  milestone_goal_id UUID;
BEGIN
  UPDATE goal_milestones
  SET completed_at = NOW(),
      updated_at = NOW()
  WHERE id = milestone_id
  RETURNING goal_id INTO milestone_goal_id;

  PERFORM calculate_goal_progress_from_milestones(milestone_goal_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goal_milestones_updated_at
  BEFORE UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();