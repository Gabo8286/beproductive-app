-- Create goal_progress_entries table for tracking progress history
CREATE TABLE IF NOT EXISTS public.goal_progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  previous_progress NUMERIC NOT NULL DEFAULT 0,
  new_progress NUMERIC NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('manual', 'milestone', 'automatic', 'sub_goal')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.goal_progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view progress entries for their goals"
ON public.goal_progress_entries
FOR SELECT
USING (
  goal_id IN (
    SELECT id FROM goals
    WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create progress entries for their goals"
ON public.goal_progress_entries
FOR INSERT
WITH CHECK (
  goal_id IN (
    SELECT id FROM goals
    WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  AND created_by = auth.uid()
);

-- Create indexes
CREATE INDEX idx_goal_progress_entries_goal_id ON public.goal_progress_entries(goal_id);
CREATE INDEX idx_goal_progress_entries_created_at ON public.goal_progress_entries(created_at DESC);

-- Function to update goal progress with history tracking
CREATE OR REPLACE FUNCTION public.update_goal_progress_with_history(
  goal_id UUID,
  new_progress NUMERIC,
  change_type TEXT DEFAULT 'manual',
  notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_progress NUMERIC;
BEGIN
  -- Get current progress
  SELECT progress INTO current_progress FROM goals WHERE id = goal_id;
  
  -- Update goal progress
  UPDATE goals
  SET progress = new_progress,
      updated_at = NOW()
  WHERE id = goal_id;
  
  -- Insert progress entry
  INSERT INTO goal_progress_entries (goal_id, previous_progress, new_progress, change_type, notes, created_by)
  VALUES (goal_id, current_progress, new_progress, change_type, notes, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate goal analytics
CREATE OR REPLACE FUNCTION public.calculate_goal_analytics(goal_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_progress NUMERIC;
  weekly_velocity NUMERIC;
  monthly_velocity NUMERIC;
  milestone_count INTEGER;
  completed_milestone_count INTEGER;
  milestone_completion NUMERIC;
  subgoal_count INTEGER;
  completed_subgoal_count INTEGER;
  subgoal_completion NUMERIC;
  avg_daily_progress NUMERIC;
  progress_trend TEXT;
  days_active INTEGER;
  projected_days INTEGER;
  projected_completion TIMESTAMP;
  time_to_target INTEGER;
  confidence_score INTEGER;
  target_date DATE;
BEGIN
  -- Get goal data
  SELECT progress, target_date INTO total_progress, target_date
  FROM goals WHERE id = goal_id;
  
  -- Calculate days active
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER INTO days_active
  FROM goals WHERE id = goal_id;
  
  -- Calculate weekly velocity (last 7 days)
  SELECT COALESCE(SUM(new_progress - previous_progress), 0) INTO weekly_velocity
  FROM goal_progress_entries
  WHERE goal_progress_entries.goal_id = calculate_goal_analytics.goal_id
    AND created_at >= NOW() - INTERVAL '7 days';
  
  -- Calculate monthly velocity (last 30 days)
  SELECT COALESCE(SUM(new_progress - previous_progress), 0) INTO monthly_velocity
  FROM goal_progress_entries
  WHERE goal_progress_entries.goal_id = calculate_goal_analytics.goal_id
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate milestone completion
  SELECT COUNT(*), COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)
  INTO milestone_count, completed_milestone_count
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_goal_analytics.goal_id;
  
  milestone_completion := CASE 
    WHEN milestone_count > 0 THEN (completed_milestone_count::NUMERIC / milestone_count::NUMERIC) * 100
    ELSE 0
  END;
  
  -- Calculate sub-goal completion
  SELECT COUNT(*), COUNT(CASE WHEN status = 'completed' THEN 1 END)
  INTO subgoal_count, completed_subgoal_count
  FROM goals
  WHERE parent_goal_id = goal_id;
  
  subgoal_completion := CASE 
    WHEN subgoal_count > 0 THEN (completed_subgoal_count::NUMERIC / subgoal_count::NUMERIC) * 100
    ELSE 0
  END;
  
  -- Calculate average daily progress
  avg_daily_progress := CASE 
    WHEN days_active > 0 THEN total_progress / days_active
    ELSE 0
  END;
  
  -- Determine progress trend
  progress_trend := CASE
    WHEN weekly_velocity > 5 THEN 'increasing'
    WHEN weekly_velocity < -2 THEN 'decreasing'
    ELSE 'stable'
  END;
  
  -- Calculate projected completion
  IF avg_daily_progress > 0 AND total_progress < 100 THEN
    projected_days := ((100 - total_progress) / avg_daily_progress)::INTEGER;
    projected_completion := NOW() + (projected_days || ' days')::INTERVAL;
  ELSE
    projected_completion := NULL;
  END IF;
  
  -- Calculate time to target
  IF target_date IS NOT NULL THEN
    time_to_target := (target_date - CURRENT_DATE)::INTEGER;
  ELSE
    time_to_target := NULL;
  END IF;
  
  -- Calculate confidence score
  confidence_score := LEAST(100, GREATEST(0, 
    CASE
      WHEN total_progress >= 75 THEN 90
      WHEN weekly_velocity > 5 THEN 80
      WHEN weekly_velocity > 2 THEN 60
      WHEN weekly_velocity > 0 THEN 40
      ELSE 20
    END
  ));
  
  -- Build result JSON
  result := json_build_object(
    'totalProgress', total_progress,
    'weeklyVelocity', weekly_velocity,
    'monthlyVelocity', monthly_velocity,
    'projectedCompletion', projected_completion,
    'milestoneCompletion', milestone_completion,
    'subGoalCompletion', subgoal_completion,
    'averageDailyProgress', avg_daily_progress,
    'progressTrend', progress_trend,
    'timeToTarget', time_to_target,
    'confidenceScore', confidence_score
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get progress suggestions
CREATE OR REPLACE FUNCTION public.get_progress_suggestions(goal_id UUID)
RETURNS JSON AS $$
DECLARE
  suggestions JSON;
  goal_record RECORD;
  analytics JSON;
  suggestion_array JSON[] := '{}';
BEGIN
  -- Get goal data
  SELECT * INTO goal_record FROM goals WHERE id = goal_id;
  
  -- Get analytics
  analytics := calculate_goal_analytics(goal_id);
  
  -- Check for upcoming milestones
  IF EXISTS (
    SELECT 1 FROM goal_milestones
    WHERE goal_milestones.goal_id = get_progress_suggestions.goal_id
      AND completed_at IS NULL
      AND target_date <= CURRENT_DATE + INTERVAL '7 days'
  ) THEN
    suggestion_array := array_append(suggestion_array, json_build_object(
      'type', 'milestone_due',
      'message', 'You have milestones due within the next 7 days',
      'action', 'Review milestones',
      'priority', 'high'
    ));
  END IF;
  
  -- Check if behind schedule
  IF goal_record.target_date IS NOT NULL 
     AND goal_record.progress < 50 
     AND goal_record.target_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    suggestion_array := array_append(suggestion_array, json_build_object(
      'type', 'behind_schedule',
      'message', 'Progress is below expected pace for target date',
      'action', 'Increase effort or adjust target',
      'priority', 'high'
    ));
  END IF;
  
  -- Check if ahead of schedule
  IF goal_record.target_date IS NOT NULL 
     AND goal_record.progress > 75 
     AND goal_record.target_date > CURRENT_DATE + INTERVAL '60 days' THEN
    suggestion_array := array_append(suggestion_array, json_build_object(
      'type', 'ahead_schedule',
      'message', 'Great progress! You are ahead of schedule',
      'action', 'Consider setting a more ambitious target',
      'priority', 'low'
    ));
  END IF;
  
  -- Check for stagnant progress
  IF NOT EXISTS (
    SELECT 1 FROM goal_progress_entries
    WHERE goal_progress_entries.goal_id = get_progress_suggestions.goal_id
      AND created_at >= NOW() - INTERVAL '14 days'
  ) THEN
    suggestion_array := array_append(suggestion_array, json_build_object(
      'type', 'stagnant',
      'message', 'No progress updates in the last 14 days',
      'action', 'Update your progress',
      'priority', 'medium'
    ));
  END IF;
  
  suggestions := array_to_json(suggestion_array);
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function for bulk progress updates
CREATE OR REPLACE FUNCTION public.bulk_update_goal_progress(progress_updates JSON)
RETURNS VOID AS $$
DECLARE
  update_item JSON;
BEGIN
  FOR update_item IN SELECT * FROM json_array_elements(progress_updates)
  LOOP
    PERFORM update_goal_progress_with_history(
      (update_item->>'goalId')::UUID,
      (update_item->>'progress')::NUMERIC,
      'manual',
      update_item->>'notes'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate automatic progress from milestones and sub-goals
CREATE OR REPLACE FUNCTION public.calculate_automatic_progress(goal_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  milestone_progress NUMERIC;
  subgoal_progress NUMERIC;
  final_progress NUMERIC;
  milestone_count INTEGER;
  subgoal_count INTEGER;
BEGIN
  -- Calculate milestone progress
  SELECT 
    COUNT(*),
    COALESCE(AVG(CASE WHEN completed_at IS NOT NULL THEN 100 ELSE 0 END), 0)
  INTO milestone_count, milestone_progress
  FROM goal_milestones
  WHERE goal_milestones.goal_id = calculate_automatic_progress.goal_id;
  
  -- Calculate sub-goal progress
  SELECT 
    COUNT(*),
    COALESCE(AVG(CASE WHEN status = 'completed' THEN 100 ELSE progress END), 0)
  INTO subgoal_count, subgoal_progress
  FROM goals
  WHERE parent_goal_id = goal_id;
  
  -- Calculate weighted average
  IF milestone_count > 0 AND subgoal_count > 0 THEN
    final_progress := (milestone_progress * 0.5) + (subgoal_progress * 0.5);
  ELSIF milestone_count > 0 THEN
    final_progress := milestone_progress;
  ELSIF subgoal_count > 0 THEN
    final_progress := subgoal_progress;
  ELSE
    final_progress := 0;
  END IF;
  
  -- Update goal with calculated progress
  PERFORM update_goal_progress_with_history(
    goal_id,
    final_progress,
    'automatic',
    'Auto-calculated from milestones and sub-goals'
  );
  
  RETURN final_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;