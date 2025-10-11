-- ============================================================
-- LUNA FRAMEWORK PERFORMANCE OPTIMIZATIONS (Fixed)
-- Phase 2: Database Performance Enhancements
-- ============================================================

-- ============================================================
-- 1. CREATE PERFORMANCE MONITORING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('render', 'load', 'api_call')),
  duration_ms NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS luna_local_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  handled_locally BOOLEAN NOT NULL,
  execution_time_ms NUMERIC NOT NULL,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE luna_local_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance metrics"
ON performance_metrics FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own performance metrics"
ON performance_metrics FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own Luna Local usage"
ON luna_local_usage FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own Luna Local usage"
ON luna_local_usage FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 2. ADD COMPOSITE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_luna_profiles_user_workspace 
ON luna_productivity_profiles(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_luna_metrics_user_category_time 
ON luna_productivity_metrics(user_id, category, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_luna_metrics_profile_time
ON luna_productivity_metrics(profile_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_luna_insights_active 
ON luna_proactive_insights(user_id, dismissed, expires_at);

CREATE INDEX IF NOT EXISTS idx_luna_profiles_user_id 
ON luna_productivity_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_time
ON performance_metrics(user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_luna_local_usage_user_time
ON luna_local_usage(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_luna_local_usage_handled_locally
ON luna_local_usage(user_id, handled_locally, created_at DESC);

-- ============================================================
-- 3. OPTIMIZED DATABASE FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_luna_dashboard_data(user_id_param UUID, workspace_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p) FROM luna_productivity_profiles p
      WHERE p.user_id = user_id_param AND p.workspace_id = workspace_id_param
      LIMIT 1
    ),
    'recent_metrics', (
      SELECT COALESCE(json_agg(m), '[]'::json) FROM (
        SELECT * FROM luna_productivity_metrics
        WHERE user_id = user_id_param
        ORDER BY recorded_at DESC LIMIT 10
      ) m
    ),
    'active_insights', (
      SELECT COALESCE(json_agg(i), '[]'::json) FROM (
        SELECT * FROM luna_proactive_insights
        WHERE user_id = user_id_param AND dismissed = FALSE
        AND expires_at > NOW()
        ORDER BY priority ASC, created_at DESC
      ) i
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_luna_local_usage(
  user_id_param UUID,
  request_type_param TEXT,
  handled_locally_param BOOLEAN,
  execution_time_param NUMERIC,
  confidence_param NUMERIC DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO luna_local_usage (
    user_id, request_type, handled_locally,
    execution_time_ms, confidence_score
  ) VALUES (
    user_id_param, request_type_param, handled_locally_param,
    execution_time_param, confidence_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_performance_insights(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'api_reduction_percent', (
      SELECT COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE handled_locally = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
        ), 0
      )
      FROM luna_local_usage
      WHERE user_id = user_id_param
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'avg_local_response_time_ms', (
      SELECT COALESCE(ROUND(AVG(execution_time_ms), 2), 0)
      FROM luna_local_usage
      WHERE user_id = user_id_param
      AND handled_locally = true
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'total_requests_7d', (
      SELECT COUNT(*)
      FROM luna_local_usage
      WHERE user_id = user_id_param
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'local_requests_7d', (
      SELECT COUNT(*)
      FROM luna_local_usage
      WHERE user_id = user_id_param
      AND handled_locally = true
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'avg_component_render_time_ms', (
      SELECT COALESCE(ROUND(AVG(duration_ms), 2), 0)
      FROM performance_metrics
      WHERE user_id = user_id_param
      AND metric_type = 'render'
      AND recorded_at > NOW() - INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 4. MATERIALIZED VIEW
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS luna_user_dashboard_summary AS
SELECT
  p.user_id,
  p.workspace_id,
  p.current_stage,
  p.well_being_score,
  p.system_health_score,
  COUNT(DISTINCT i.id) as active_insights_count,
  COALESCE(AVG(m.value), 0) as avg_productivity_score
FROM luna_productivity_profiles p
LEFT JOIN luna_proactive_insights i 
  ON i.profile_id = p.id 
  AND i.dismissed = FALSE 
  AND i.expires_at > NOW()
LEFT JOIN luna_productivity_metrics m 
  ON m.profile_id = p.id 
  AND m.recorded_at > NOW() - INTERVAL '7 days'
GROUP BY p.user_id, p.workspace_id, p.current_stage, p.well_being_score, p.system_health_score;

CREATE UNIQUE INDEX IF NOT EXISTS idx_luna_dashboard_summary_user_workspace
ON luna_user_dashboard_summary(user_id, workspace_id);

CREATE OR REPLACE FUNCTION refresh_luna_dashboard_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY luna_user_dashboard_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 5. ENABLE REAL-TIME
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'luna_productivity_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE luna_productivity_profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'luna_proactive_insights'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE luna_proactive_insights;
  END IF;
END $$;

-- ============================================================
-- 6. OPTIMIZE RLS POLICIES
-- ============================================================

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own Luna profiles" ON luna_productivity_profiles;
  DROP POLICY IF EXISTS "Users can create their own Luna profiles" ON luna_productivity_profiles;
  DROP POLICY IF EXISTS "Users can update their own Luna profiles" ON luna_productivity_profiles;
  
  CREATE POLICY "Optimized Luna profile access" ON luna_productivity_profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can manage their own insights" ON luna_proactive_insights;
  
  CREATE POLICY "Optimized Luna insights access" ON luna_proactive_insights
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can create their own metrics" ON luna_productivity_metrics;
  DROP POLICY IF EXISTS "Users can view their own metrics" ON luna_productivity_metrics;
  
  CREATE POLICY "Optimized Luna metrics access" ON luna_productivity_metrics
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
END $$;