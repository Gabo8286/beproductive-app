-- Create AI Insights Module Schema

-- Create enum for AI providers
CREATE TYPE ai_provider AS ENUM ('openai', 'claude', 'gemini', 'lovable');

-- Create enum for insight types
CREATE TYPE ai_insight_type AS ENUM (
  'productivity_pattern',
  'goal_progress',
  'habit_analysis',
  'time_optimization',
  'task_prioritization',
  'reflection_sentiment',
  'project_health',
  'burnout_risk',
  'achievement_opportunity'
);

-- Create enum for recommendation status
CREATE TYPE ai_recommendation_status AS ENUM ('pending', 'in_progress', 'completed', 'dismissed');

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type ai_insight_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  provider ai_provider NOT NULL DEFAULT 'lovable',
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID REFERENCES ai_insights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_steps JSONB DEFAULT '[]'::jsonb,
  expected_impact TEXT,
  effort_level TEXT CHECK (effort_level IN ('low', 'medium', 'high')),
  status ai_recommendation_status DEFAULT 'pending',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  metadata JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_service_usage table
CREATE TABLE public.ai_service_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider ai_provider NOT NULL,
  model_name TEXT,
  tokens_used INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,6) DEFAULT 0,
  request_type TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_user_preferences table
CREATE TABLE public.ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_provider ai_provider DEFAULT 'lovable',
  auto_generate_insights BOOLEAN DEFAULT true,
  insight_frequency TEXT DEFAULT 'weekly' CHECK (insight_frequency IN ('daily', 'weekly', 'monthly', 'manual')),
  enabled_insight_types JSONB DEFAULT '["productivity_pattern", "goal_progress", "habit_analysis"]'::jsonb,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  privacy_settings JSONB DEFAULT '{"share_anonymous_data": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_service_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_insights
CREATE POLICY "Users can view their own insights"
  ON public.ai_insights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own insights"
  ON public.ai_insights FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own insights"
  ON public.ai_insights FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own recommendations"
  ON public.ai_recommendations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recommendations"
  ON public.ai_recommendations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own recommendations"
  ON public.ai_recommendations FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for ai_service_usage
CREATE POLICY "Users can view their own usage"
  ON public.ai_service_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage"
  ON public.ai_service_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ai_user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.ai_user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON public.ai_user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON public.ai_user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(type);
CREATE INDEX idx_ai_insights_generated_at ON public.ai_insights(generated_at DESC);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_insight_id ON public.ai_recommendations(insight_id);
CREATE INDEX idx_ai_service_usage_user_id ON public.ai_service_usage(user_id);
CREATE INDEX idx_ai_service_usage_created_at ON public.ai_service_usage(created_at DESC);

-- Create trigger for updating updated_at
CREATE TRIGGER update_ai_recommendations_updated_at
  BEFORE UPDATE ON public.ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_user_preferences_updated_at
  BEFORE UPDATE ON public.ai_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Helper function to get user's total AI usage cost
CREATE OR REPLACE FUNCTION get_user_ai_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_cost', COALESCE(SUM(estimated_cost), 0),
    'total_tokens', COALESCE(SUM(tokens_used), 0),
    'request_count', COUNT(*),
    'by_provider', jsonb_object_agg(
      provider,
      jsonb_build_object(
        'cost', COALESCE(SUM(estimated_cost), 0),
        'tokens', COALESCE(SUM(tokens_used), 0),
        'requests', COUNT(*)
      )
    )
  )
  INTO result
  FROM public.ai_service_usage
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY user_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;