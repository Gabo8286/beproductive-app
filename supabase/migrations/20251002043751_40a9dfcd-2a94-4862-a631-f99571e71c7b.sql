-- =====================================================
-- REFLECTIONS & JOURNALING SYSTEM SCHEMA
-- Sprint 6 - Story REFLECT-060
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Reflection types
CREATE TYPE reflection_type AS ENUM (
  'daily',
  'weekly', 
  'monthly',
  'project',
  'goal',
  'habit',
  'custom'
);

-- Mood levels
CREATE TYPE mood_level AS ENUM (
  'amazing',
  'great',
  'good',
  'neutral',
  'bad',
  'terrible'
);

-- Template categories
CREATE TYPE template_category AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'project',
  'goal_review',
  'habit_review',
  'personal',
  'professional',
  'custom'
);

-- Prompt categories
CREATE TYPE prompt_category AS ENUM (
  'gratitude',
  'challenges',
  'wins',
  'learning',
  'planning',
  'mood',
  'goals',
  'habits',
  'relationships',
  'growth'
);

-- Prompt frequency
CREATE TYPE prompt_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'occasional'
);

-- Goal reflection types
CREATE TYPE goal_reflection_type AS ENUM (
  'progress_review',
  'milestone_achieved',
  'challenge_faced',
  'strategy_adjustment',
  'completion_celebration'
);

-- Habit reflection types
CREATE TYPE habit_reflection_type AS ENUM (
  'streak_milestone',
  'consistency_review',
  'difficulty_adjustment',
  'motivation_analysis',
  'pattern_recognition'
);

-- Analytics periods
CREATE TYPE analytics_period AS ENUM (
  'week',
  'month',
  'quarter',
  'year'
);

-- Share types
CREATE TYPE share_type AS ENUM (
  'read_only',
  'comment_enabled',
  'collaborative'
);

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Main reflections table
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reflection_type reflection_type NOT NULL DEFAULT 'daily',
  mood mood_level,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10),
  gratitude_items TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  wins TEXT[] DEFAULT '{}',
  learnings TEXT[] DEFAULT '{}',
  tomorrow_focus TEXT[] DEFAULT '{}',
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.reflections IS 'Personal and professional reflections with mood tracking and insights';

-- Reflection templates table
CREATE TABLE public.reflection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category template_category NOT NULL DEFAULT 'custom',
  prompts JSONB NOT NULL DEFAULT '[]',
  structure JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.reflection_templates IS 'Templates for guided reflection with structured prompts';

-- Reflection prompts table
CREATE TABLE public.reflection_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text TEXT NOT NULL,
  category prompt_category NOT NULL,
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  frequency prompt_frequency NOT NULL DEFAULT 'daily',
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.reflection_prompts IS 'Dynamic prompts for reflection guidance';

-- Reflection-Goal links table
CREATE TABLE public.reflection_goal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID NOT NULL REFERENCES public.reflections(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  reflection_type goal_reflection_type NOT NULL,
  insights TEXT,
  action_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reflection_id, goal_id)
);

COMMENT ON TABLE public.reflection_goal_links IS 'Links between reflections and goals for integrated review';

-- Reflection-Habit links table
CREATE TABLE public.reflection_habit_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID NOT NULL REFERENCES public.reflections(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  reflection_type habit_reflection_type NOT NULL,
  observations TEXT,
  adjustments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reflection_id, habit_id)
);

COMMENT ON TABLE public.reflection_habit_links IS 'Links between reflections and habits for pattern analysis';

-- Reflection analytics table
CREATE TABLE public.reflection_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_type analytics_period NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_reflections INTEGER DEFAULT 0,
  average_mood NUMERIC(3,2),
  average_energy NUMERIC(3,2),
  average_stress NUMERIC(3,2),
  average_satisfaction NUMERIC(3,2),
  top_themes TEXT[] DEFAULT '{}',
  growth_indicators JSONB DEFAULT '{}',
  pattern_insights JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start)
);

COMMENT ON TABLE public.reflection_analytics IS 'Aggregated analytics for reflection patterns and insights';

-- Reflection sharing table
CREATE TABLE public.reflection_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID NOT NULL REFERENCES public.reflections(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_workspace BOOLEAN DEFAULT false,
  share_type share_type NOT NULL DEFAULT 'read_only',
  shared_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.reflection_shares IS 'Optional sharing of reflections with users or workspaces';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_reflections_workspace_date ON public.reflections(workspace_id, reflection_date DESC);
CREATE INDEX idx_reflections_creator_date ON public.reflections(created_by, reflection_date DESC);
CREATE INDEX idx_reflections_type ON public.reflections(reflection_type);
CREATE INDEX idx_reflections_date ON public.reflections(reflection_date DESC);

CREATE INDEX idx_reflection_goal_links_goal ON public.reflection_goal_links(goal_id);
CREATE INDEX idx_reflection_goal_links_reflection ON public.reflection_goal_links(reflection_id);

CREATE INDEX idx_reflection_habit_links_habit ON public.reflection_habit_links(habit_id);
CREATE INDEX idx_reflection_habit_links_reflection ON public.reflection_habit_links(reflection_id);

CREATE INDEX idx_reflection_analytics_user_period ON public.reflection_analytics(user_id, period_type, period_start DESC);

CREATE INDEX idx_reflection_templates_category ON public.reflection_templates(category);
CREATE INDEX idx_reflection_templates_public ON public.reflection_templates(is_public) WHERE is_public = true;

CREATE INDEX idx_reflection_prompts_category_frequency ON public.reflection_prompts(category, frequency);

CREATE INDEX idx_reflection_shares_reflection ON public.reflection_shares(reflection_id);
CREATE INDEX idx_reflection_shares_user ON public.reflection_shares(shared_with_user_id);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function to generate daily prompts
CREATE OR REPLACE FUNCTION public.generate_daily_prompts(
  p_user_id UUID,
  p_reflection_date DATE
) RETURNS TABLE(prompt_text TEXT, category prompt_category)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.prompt_text,
    rp.category
  FROM reflection_prompts rp
  WHERE rp.frequency = 'daily'
    AND (rp.is_system = true OR rp.created_by = p_user_id)
  ORDER BY RANDOM()
  LIMIT 5;
END;
$$;

-- Function to calculate reflection streak
CREATE OR REPLACE FUNCTION public.calculate_reflection_streak(
  p_user_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_reflection BOOLEAN;
BEGIN
  -- Check consecutive days backwards from today
  LOOP
    SELECT EXISTS(
      SELECT 1 
      FROM reflections r
      WHERE r.created_by = p_user_id
        AND r.reflection_date = v_check_date
    ) INTO v_has_reflection;
    
    EXIT WHEN NOT v_has_reflection;
    
    v_current_streak := v_current_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN v_current_streak;
END;
$$;

-- Function to analyze reflection patterns
CREATE OR REPLACE FUNCTION public.analyze_reflection_patterns(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_avg_mood NUMERIC;
  v_avg_energy NUMERIC;
  v_avg_stress NUMERIC;
  v_common_themes TEXT[];
  v_total_reflections INTEGER;
BEGIN
  -- Calculate averages
  SELECT 
    COUNT(*),
    AVG(CASE mood
      WHEN 'amazing' THEN 6
      WHEN 'great' THEN 5
      WHEN 'good' THEN 4
      WHEN 'neutral' THEN 3
      WHEN 'bad' THEN 2
      WHEN 'terrible' THEN 1
      ELSE NULL
    END),
    AVG(energy_level),
    AVG(stress_level)
  INTO v_total_reflections, v_avg_mood, v_avg_energy, v_avg_stress
  FROM reflections
  WHERE created_by = p_user_id
    AND reflection_date BETWEEN p_start_date AND p_end_date;
  
  -- Get common themes from tags
  SELECT ARRAY_AGG(DISTINCT tag)
  INTO v_common_themes
  FROM (
    SELECT unnest(tags) as tag
    FROM reflections
    WHERE created_by = p_user_id
      AND reflection_date BETWEEN p_start_date AND p_end_date
    LIMIT 10
  ) t;
  
  -- Build result
  v_result := jsonb_build_object(
    'totalReflections', v_total_reflections,
    'averageMood', ROUND(v_avg_mood, 2),
    'averageEnergy', ROUND(v_avg_energy, 2),
    'averageStress', ROUND(v_avg_stress, 2),
    'commonThemes', COALESCE(v_common_themes, ARRAY[]::TEXT[]),
    'periodStart', p_start_date,
    'periodEnd', p_end_date
  );
  
  RETURN v_result;
END;
$$;

-- Function to update reflection analytics
CREATE OR REPLACE FUNCTION public.update_reflection_analytics(
  p_user_id UUID,
  p_period_type analytics_period
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_total INTEGER;
  v_avg_mood NUMERIC;
  v_avg_energy NUMERIC;
  v_avg_stress NUMERIC;
  v_avg_satisfaction NUMERIC;
  v_top_themes TEXT[];
BEGIN
  -- Calculate period dates
  CASE p_period_type
    WHEN 'week' THEN
      v_period_start := date_trunc('week', CURRENT_DATE)::DATE;
      v_period_end := v_period_start + INTERVAL '6 days';
    WHEN 'month' THEN
      v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    WHEN 'quarter' THEN
      v_period_start := date_trunc('quarter', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('quarter', CURRENT_DATE) + INTERVAL '3 months - 1 day')::DATE;
    WHEN 'year' THEN
      v_period_start := date_trunc('year', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE;
  END CASE;
  
  -- Calculate analytics
  SELECT 
    COUNT(*),
    AVG(CASE mood
      WHEN 'amazing' THEN 6
      WHEN 'great' THEN 5
      WHEN 'good' THEN 4
      WHEN 'neutral' THEN 3
      WHEN 'bad' THEN 2
      WHEN 'terrible' THEN 1
      ELSE NULL
    END),
    AVG(energy_level),
    AVG(stress_level),
    AVG(satisfaction_level)
  INTO v_total, v_avg_mood, v_avg_energy, v_avg_stress, v_avg_satisfaction
  FROM reflections
  WHERE created_by = p_user_id
    AND reflection_date BETWEEN v_period_start AND v_period_end;
  
  -- Get top themes
  SELECT ARRAY_AGG(tag ORDER BY tag_count DESC)
  INTO v_top_themes
  FROM (
    SELECT unnest(tags) as tag, COUNT(*) as tag_count
    FROM reflections
    WHERE created_by = p_user_id
      AND reflection_date BETWEEN v_period_start AND v_period_end
    GROUP BY tag
    ORDER BY tag_count DESC
    LIMIT 10
  ) t;
  
  -- Insert or update analytics
  INSERT INTO reflection_analytics (
    user_id,
    period_type,
    period_start,
    period_end,
    total_reflections,
    average_mood,
    average_energy,
    average_stress,
    average_satisfaction,
    top_themes,
    calculated_at
  ) VALUES (
    p_user_id,
    p_period_type,
    v_period_start,
    v_period_end,
    v_total,
    v_avg_mood,
    v_avg_energy,
    v_avg_stress,
    v_avg_satisfaction,
    COALESCE(v_top_themes, ARRAY[]::TEXT[]),
    NOW()
  )
  ON CONFLICT (user_id, period_type, period_start)
  DO UPDATE SET
    period_end = EXCLUDED.period_end,
    total_reflections = EXCLUDED.total_reflections,
    average_mood = EXCLUDED.average_mood,
    average_energy = EXCLUDED.average_energy,
    average_stress = EXCLUDED.average_stress,
    average_satisfaction = EXCLUDED.average_satisfaction,
    top_themes = EXCLUDED.top_themes,
    calculated_at = NOW();
END;
$$;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at on reflections
CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger to update template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.metadata->>'template_id' IS NOT NULL THEN
    UPDATE reflection_templates
    SET usage_count = usage_count + 1
    WHERE id = (NEW.metadata->>'template_id')::UUID;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_template_usage();

-- Trigger to update analytics on reflection changes
CREATE OR REPLACE FUNCTION public.trigger_analytics_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update weekly analytics
  PERFORM update_reflection_analytics(
    COALESCE(NEW.created_by, OLD.created_by),
    'week'::analytics_period
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_analytics_on_reflection
  AFTER INSERT OR UPDATE OR DELETE ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_analytics_update();

-- =====================================================
-- 6. ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_goal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_habit_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_shares ENABLE ROW LEVEL SECURITY;

-- Reflections policies
CREATE POLICY "Users can view reflections in their workspaces"
  ON public.reflections FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shared reflections"
  ON public.reflections FOR SELECT
  USING (
    id IN (
      SELECT reflection_id FROM reflection_shares
      WHERE shared_with_user_id = auth.uid()
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

CREATE POLICY "Users can create reflections in their workspaces"
  ON public.reflections FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own reflections"
  ON public.reflections FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reflections"
  ON public.reflections FOR DELETE
  USING (created_by = auth.uid());

-- Reflection templates policies
CREATE POLICY "Users can view all templates"
  ON public.reflection_templates FOR SELECT
  USING (is_system = true OR is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates"
  ON public.reflection_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON public.reflection_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON public.reflection_templates FOR DELETE
  USING (created_by = auth.uid());

-- Reflection prompts policies
CREATE POLICY "Users can view all prompts"
  ON public.reflection_prompts FOR SELECT
  USING (is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own prompts"
  ON public.reflection_prompts FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own prompts"
  ON public.reflection_prompts FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own prompts"
  ON public.reflection_prompts FOR DELETE
  USING (created_by = auth.uid());

-- Reflection-goal links policies
CREATE POLICY "Users can view reflection-goal links"
  ON public.reflection_goal_links FOR SELECT
  USING (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create reflection-goal links"
  ON public.reflection_goal_links FOR INSERT
  WITH CHECK (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can delete reflection-goal links"
  ON public.reflection_goal_links FOR DELETE
  USING (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

-- Reflection-habit links policies
CREATE POLICY "Users can view reflection-habit links"
  ON public.reflection_habit_links FOR SELECT
  USING (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create reflection-habit links"
  ON public.reflection_habit_links FOR INSERT
  WITH CHECK (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can delete reflection-habit links"
  ON public.reflection_habit_links FOR DELETE
  USING (
    reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

-- Reflection analytics policies
CREATE POLICY "Users can view their own analytics"
  ON public.reflection_analytics FOR SELECT
  USING (user_id = auth.uid());

-- Reflection shares policies
CREATE POLICY "Users can view shares they created or received"
  ON public.reflection_shares FOR SELECT
  USING (
    shared_by = auth.uid() OR shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can create shares for their reflections"
  ON public.reflection_shares FOR INSERT
  WITH CHECK (
    shared_by = auth.uid()
    AND reflection_id IN (SELECT id FROM reflections WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can delete shares they created"
  ON public.reflection_shares FOR DELETE
  USING (shared_by = auth.uid());