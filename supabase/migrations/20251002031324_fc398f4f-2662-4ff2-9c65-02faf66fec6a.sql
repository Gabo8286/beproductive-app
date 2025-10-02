-- =====================================================
-- HABITS SYSTEM DATABASE SCHEMA (FIXED)
-- Sprint 5 - Story 1: Database Foundation
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

CREATE TYPE habit_category AS ENUM (
  'health',
  'productivity',
  'learning',
  'mindfulness',
  'social',
  'financial',
  'creative',
  'other'
);

CREATE TYPE habit_type AS ENUM (
  'build',
  'break',
  'maintain'
);

CREATE TYPE habit_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'custom'
);

CREATE TYPE habit_difficulty AS ENUM (
  'easy',
  'medium',
  'hard',
  'extreme'
);

CREATE TYPE habit_time AS ENUM (
  'morning',
  'afternoon',
  'evening',
  'anytime'
);

CREATE TYPE entry_status AS ENUM (
  'completed',
  'skipped',
  'missed',
  'partial'
);

CREATE TYPE mood_enum AS ENUM (
  'amazing',
  'good',
  'neutral',
  'bad',
  'terrible'
);

CREATE TYPE reminder_type AS ENUM (
  'time_based',
  'location_based',
  'trigger_based'
);

CREATE TYPE period_enum AS ENUM (
  'day',
  'week',
  'month',
  'year',
  'all_time'
);

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT,
  category habit_category NOT NULL DEFAULT 'other',
  type habit_type NOT NULL DEFAULT 'build',
  frequency habit_frequency NOT NULL DEFAULT 'daily',
  custom_frequency JSONB DEFAULT NULL,
  target_streak INTEGER CHECK (target_streak IS NULL OR target_streak > 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  difficulty habit_difficulty NOT NULL DEFAULT 'medium',
  time_of_day habit_time DEFAULT 'anytime',
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  reminder_time TIME,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  color TEXT,
  icon TEXT,
  created_by UUID NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE public.habits IS 'Core habits tracking table';
COMMENT ON COLUMN public.habits.current_streak IS 'Current consecutive completion streak';
COMMENT ON COLUMN public.habits.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.habits.custom_frequency IS 'Custom frequency pattern for non-standard schedules';

CREATE TABLE public.habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status entry_status NOT NULL DEFAULT 'completed',
  value DECIMAL,
  notes TEXT,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  mood mood_enum,
  energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10)),
  difficulty_felt INTEGER CHECK (difficulty_felt IS NULL OR (difficulty_felt >= 1 AND difficulty_felt <= 10)),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, date)
);

COMMENT ON TABLE public.habit_entries IS 'Daily habit completion tracking';
COMMENT ON COLUMN public.habit_entries.value IS 'Measurable value for quantifiable habits';

CREATE TABLE public.habit_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  length INTEGER NOT NULL CHECK (length > 0),
  broken_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.habit_streaks IS 'Historical record of habit streaks';

CREATE TABLE public.habit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category habit_category NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT,
  frequency habit_frequency DEFAULT 'daily',
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  difficulty habit_difficulty DEFAULT 'medium',
  time_of_day habit_time DEFAULT 'anytime',
  icon TEXT,
  color TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  rating DECIMAL CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.habit_templates IS 'Reusable habit templates';
COMMENT ON COLUMN public.habit_templates.is_system IS 'System templates vs user-created';

CREATE TABLE public.habit_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  reminder_type reminder_type NOT NULL DEFAULT 'time_based',
  time TIME,
  days_of_week INTEGER[],
  location JSONB,
  trigger_habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.habit_reminders IS 'Reminder configurations for habits';
COMMENT ON COLUMN public.habit_reminders.days_of_week IS 'Array of integers 0-6 (Sunday-Saturday), validated in application';

CREATE TABLE public.habit_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  period_type period_enum NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  completion_rate DECIMAL CHECK (completion_rate >= 0 AND completion_rate <= 100),
  total_completions INTEGER NOT NULL DEFAULT 0 CHECK (total_completions >= 0),
  total_misses INTEGER NOT NULL DEFAULT 0 CHECK (total_misses >= 0),
  total_skips INTEGER NOT NULL DEFAULT 0 CHECK (total_skips >= 0),
  average_mood DECIMAL CHECK (average_mood IS NULL OR (average_mood >= 1 AND average_mood <= 5)),
  average_energy DECIMAL CHECK (average_energy IS NULL OR (average_energy >= 1 AND average_energy <= 10)),
  average_difficulty DECIMAL CHECK (average_difficulty IS NULL OR (average_difficulty >= 1 AND average_difficulty <= 10)),
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, period_type, period_start)
);

COMMENT ON TABLE public.habit_analytics IS 'Pre-calculated habit analytics by period';

CREATE TABLE public.habit_goal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  contribution_weight DECIMAL NOT NULL DEFAULT 1.0 CHECK (contribution_weight > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, goal_id)
);

COMMENT ON TABLE public.habit_goal_links IS 'Links habits to goals for progress tracking';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_habits_workspace_id ON public.habits(workspace_id);
CREATE INDEX idx_habits_created_by ON public.habits(created_by);
CREATE INDEX idx_habits_archived ON public.habits(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_habits_start_date ON public.habits(start_date);
CREATE INDEX idx_habits_category ON public.habits(category);

CREATE INDEX idx_habit_entries_habit_date ON public.habit_entries(habit_id, date DESC);
CREATE INDEX idx_habit_entries_date ON public.habit_entries(date DESC);
CREATE INDEX idx_habit_entries_status ON public.habit_entries(status);

CREATE INDEX idx_habit_streaks_habit_id ON public.habit_streaks(habit_id);
CREATE INDEX idx_habit_streaks_dates ON public.habit_streaks(start_date, end_date);

CREATE INDEX idx_habit_analytics_habit_period ON public.habit_analytics(habit_id, period_type);
CREATE INDEX idx_habit_analytics_calculated ON public.habit_analytics(calculated_at);

CREATE INDEX idx_habit_reminders_habit_active ON public.habit_reminders(habit_id, is_active);
CREATE INDEX idx_habit_reminders_type ON public.habit_reminders(reminder_type);

CREATE INDEX idx_habit_templates_category ON public.habit_templates(category);
CREATE INDEX idx_habit_templates_system ON public.habit_templates(is_system);

CREATE INDEX idx_habit_goal_links_habit ON public.habit_goal_links(habit_id);
CREATE INDEX idx_habit_goal_links_goal ON public.habit_goal_links(goal_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_goal_links ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

CREATE POLICY "Users can view workspace habits"
  ON public.habits FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create habits in their workspaces"
  ON public.habits FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update habits in their workspaces"
  ON public.habits FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Users can view entries for their habits"
  ON public.habit_entries FOR SELECT
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create entries for their habits"
  ON public.habit_entries FOR INSERT
  WITH CHECK (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update entries for their habits"
  ON public.habit_entries FOR UPDATE
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete entries for their habits"
  ON public.habit_entries FOR DELETE
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view streaks for their habits"
  ON public.habit_streaks FOR SELECT
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view all templates"
  ON public.habit_templates FOR SELECT
  USING (is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates"
  ON public.habit_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON public.habit_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON public.habit_templates FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage reminders for their habits"
  ON public.habit_reminders FOR ALL
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view analytics for their habits"
  ON public.habit_analytics FOR SELECT
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view habit-goal links"
  ON public.habit_goal_links FOR SELECT
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create habit-goal links"
  ON public.habit_goal_links FOR INSERT
  WITH CHECK (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete habit-goal links"
  ON public.habit_goal_links FOR DELETE
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      WHERE h.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 6. CREATE DATABASE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_habit_streak(
  p_habit_id UUID,
  p_date DATE,
  p_status entry_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_completed_date DATE;
  v_is_consecutive BOOLEAN;
BEGIN
  SELECT current_streak, longest_streak INTO v_current_streak, v_longest_streak
  FROM habits WHERE id = p_habit_id;

  IF p_status = 'completed' THEN
    SELECT MAX(date) INTO v_last_completed_date
    FROM habit_entries
    WHERE habit_id = p_habit_id
      AND date < p_date
      AND status = 'completed';

    IF v_last_completed_date IS NULL THEN
      v_is_consecutive := TRUE;
    ELSIF p_date - v_last_completed_date = 1 THEN
      v_is_consecutive := TRUE;
    ELSE
      v_is_consecutive := FALSE;
      
      IF v_current_streak > 0 THEN
        INSERT INTO habit_streaks (habit_id, start_date, end_date, length, broken_at)
        VALUES (
          p_habit_id,
          v_last_completed_date - v_current_streak + 1,
          v_last_completed_date,
          v_current_streak,
          NOW()
        );
      END IF;
    END IF;

    IF v_is_consecutive THEN
      v_current_streak := v_current_streak + 1;
    ELSE
      v_current_streak := 1;
    END IF;

    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;

    UPDATE habits
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        updated_at = NOW()
    WHERE id = p_habit_id;

  ELSIF p_status IN ('missed', 'skipped') THEN
    IF v_current_streak > 0 THEN
      INSERT INTO habit_streaks (habit_id, start_date, end_date, length, broken_at)
      SELECT 
        p_habit_id,
        MAX(date) - v_current_streak + 1,
        MAX(date),
        v_current_streak,
        NOW()
      FROM habit_entries
      WHERE habit_id = p_habit_id
        AND date < p_date
        AND status = 'completed';
    END IF;

    UPDATE habits
    SET current_streak = 0,
        updated_at = NOW()
    WHERE id = p_habit_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_habit_analytics(
  p_habit_id UUID,
  p_period_type period_enum,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_days INTEGER;
  v_completions INTEGER;
  v_misses INTEGER;
  v_skips INTEGER;
  v_avg_mood DECIMAL;
  v_avg_energy DECIMAL;
  v_avg_difficulty DECIMAL;
  v_completion_rate DECIMAL;
BEGIN
  v_total_days := p_end_date - p_start_date + 1;

  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'missed'),
    COUNT(*) FILTER (WHERE status = 'skipped')
  INTO v_completions, v_misses, v_skips
  FROM habit_entries
  WHERE habit_id = p_habit_id
    AND date BETWEEN p_start_date AND p_end_date;

  SELECT
    AVG(CASE mood
      WHEN 'amazing' THEN 5
      WHEN 'good' THEN 4
      WHEN 'neutral' THEN 3
      WHEN 'bad' THEN 2
      WHEN 'terrible' THEN 1
      ELSE NULL
    END),
    AVG(energy_level),
    AVG(difficulty_felt)
  INTO v_avg_mood, v_avg_energy, v_avg_difficulty
  FROM habit_entries
  WHERE habit_id = p_habit_id
    AND date BETWEEN p_start_date AND p_end_date
    AND status = 'completed';

  IF v_total_days > 0 THEN
    v_completion_rate := (v_completions::DECIMAL / v_total_days::DECIMAL) * 100;
  ELSE
    v_completion_rate := 0;
  END IF;

  INSERT INTO habit_analytics (
    habit_id,
    period_type,
    period_start,
    period_end,
    completion_rate,
    total_completions,
    total_misses,
    total_skips,
    average_mood,
    average_energy,
    average_difficulty,
    calculated_at
  ) VALUES (
    p_habit_id,
    p_period_type,
    p_start_date,
    p_end_date,
    v_completion_rate,
    v_completions,
    v_misses,
    v_skips,
    v_avg_mood,
    v_avg_energy,
    v_avg_difficulty,
    NOW()
  )
  ON CONFLICT (habit_id, period_type, period_start)
  DO UPDATE SET
    period_end = EXCLUDED.period_end,
    completion_rate = EXCLUDED.completion_rate,
    total_completions = EXCLUDED.total_completions,
    total_misses = EXCLUDED.total_misses,
    total_skips = EXCLUDED.total_skips,
    average_mood = EXCLUDED.average_mood,
    average_energy = EXCLUDED.average_energy,
    average_difficulty = EXCLUDED.average_difficulty,
    calculated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.check_habit_completion(
  p_habit_id UUID,
  p_date DATE
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM habit_entries
    WHERE habit_id = p_habit_id
      AND date = p_date
      AND status = 'completed'
  );
$$;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_habit_entries_updated_at
  BEFORE UPDATE ON public.habit_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.trigger_update_habit_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_habit_streak(NEW.habit_id, NEW.date, NEW.status);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_streak_on_entry
  AFTER INSERT OR UPDATE OF status ON public.habit_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_habit_streak();