-- AI-Enhanced Features Migration
-- Adds AI habit suggestions, task automation, and enhanced schema

-- 1. Create ai_habit_suggestions table
CREATE TABLE IF NOT EXISTS public.ai_habit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  suggestion_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  rejected_reason TEXT,
  ai_provider TEXT NOT NULL,
  ai_model TEXT,
  ai_confidence NUMERIC(3,2) DEFAULT 0.8,
  created_habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add new columns to tasks table
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_habit_suggestions_goal_id ON public.ai_habit_suggestions(goal_id);
CREATE INDEX IF NOT EXISTS idx_ai_habit_suggestions_status ON public.ai_habit_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_tasks_habit_id ON public.tasks(habit_id);
CREATE INDEX IF NOT EXISTS idx_tasks_auto_generated ON public.tasks(auto_generated);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON public.tasks(scheduled_date);

-- 4. Enable RLS on ai_habit_suggestions
ALTER TABLE public.ai_habit_suggestions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for ai_habit_suggestions
CREATE POLICY "Users can view their own habit suggestions"
  ON public.ai_habit_suggestions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create habit suggestions"
  ON public.ai_habit_suggestions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own habit suggestions"
  ON public.ai_habit_suggestions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own habit suggestions"
  ON public.ai_habit_suggestions FOR DELETE
  USING (user_id = auth.uid());

-- 6. Create function to generate recurring tasks from habit
CREATE OR REPLACE FUNCTION public.generate_recurring_tasks_from_habit(
  p_habit_id UUID,
  p_start_date DATE,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_habit RECORD;
  v_task_count INTEGER := 0;
  v_current_date DATE;
  v_end_date DATE;
  v_workspace_id UUID;
  v_created_by UUID;
BEGIN
  -- Get habit details
  SELECT * INTO v_habit FROM public.habits WHERE id = p_habit_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found';
  END IF;
  
  v_workspace_id := v_habit.workspace_id;
  v_created_by := v_habit.created_by;
  v_current_date := p_start_date;
  v_end_date := p_start_date + p_days_ahead;
  
  -- Generate tasks based on frequency
  WHILE v_current_date <= v_end_date LOOP
    -- Check if task already exists for this date
    IF NOT EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE habit_id = p_habit_id 
      AND scheduled_date::DATE = v_current_date
      AND auto_generated = TRUE
    ) THEN
      -- Create task
      INSERT INTO public.tasks (
        workspace_id,
        title,
        description,
        status,
        priority,
        due_date,
        scheduled_date,
        habit_id,
        auto_generated,
        created_by
      ) VALUES (
        v_workspace_id,
        v_habit.title,
        v_habit.description,
        'todo',
        'medium',
        v_current_date,
        v_current_date,
        p_habit_id,
        TRUE,
        v_created_by
      );
      
      v_task_count := v_task_count + 1;
    END IF;
    
    -- Increment date based on frequency
    IF v_habit.frequency = 'daily' THEN
      v_current_date := v_current_date + 1;
    ELSIF v_habit.frequency = 'weekly' THEN
      v_current_date := v_current_date + 7;
    ELSE
      v_current_date := v_current_date + 1;
    END IF;
  END LOOP;
  
  RETURN v_task_count;
END;
$$;

-- 7. Create updated_at trigger for ai_habit_suggestions
CREATE OR REPLACE FUNCTION public.update_ai_habit_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_habit_suggestions_updated_at
  BEFORE UPDATE ON public.ai_habit_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_habit_suggestions_updated_at();