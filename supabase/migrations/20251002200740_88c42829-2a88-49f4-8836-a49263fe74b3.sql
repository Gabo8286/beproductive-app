-- API Management Module Database Schema
-- Creator-only access for managing API connections, usage tracking, and cost monitoring

-- Create enum for API provider types
CREATE TYPE api_provider_type AS ENUM (
  'openai',
  'claude',
  'gemini',
  'lovable',
  'custom'
);

-- Create enum for API key status
CREATE TYPE api_key_status AS ENUM (
  'active',
  'inactive',
  'revoked',
  'expired'
);

-- Main API keys management table (super_admin only)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider api_provider_type NOT NULL,
  key_name TEXT NOT NULL CHECK (length(key_name) > 0 AND length(key_name) <= 100),
  encrypted_key TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  status api_key_status DEFAULT 'active' NOT NULL,

  -- Usage limits and monitoring
  monthly_limit_usd NUMERIC(10,2) DEFAULT 100.00,
  current_month_cost NUMERIC(10,2) DEFAULT 0.00,
  total_lifetime_cost NUMERIC(10,2) DEFAULT 0.00,

  -- Request limits
  daily_request_limit INTEGER DEFAULT 1000,
  current_day_requests INTEGER DEFAULT 0,

  -- Token limits
  monthly_token_limit INTEGER DEFAULT 1000000,
  current_month_tokens INTEGER DEFAULT 0,

  -- Provider-specific configuration
  model_name TEXT,
  api_version TEXT,
  base_url TEXT,
  additional_headers JSONB DEFAULT '{}'::jsonb,
  provider_config JSONB DEFAULT '{}'::jsonb,

  -- Security and auditing
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_rotated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT positive_limits CHECK (
    monthly_limit_usd >= 0 AND
    daily_request_limit >= 0 AND
    monthly_token_limit >= 0
  ),
  CONSTRAINT positive_usage CHECK (
    current_month_cost >= 0 AND
    total_lifetime_cost >= 0 AND
    current_day_requests >= 0 AND
    current_month_tokens >= 0
  )
);

-- System-wide API usage limits and quotas
CREATE TABLE public.api_system_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider api_provider_type NOT NULL UNIQUE,

  -- Global limits
  global_monthly_limit_usd NUMERIC(10,2) DEFAULT 1000.00,
  global_daily_request_limit INTEGER DEFAULT 100000,
  global_monthly_token_limit BIGINT DEFAULT 100000000,

  -- Per-user default limits
  default_user_monthly_limit_usd NUMERIC(10,2) DEFAULT 10.00,
  default_user_daily_request_limit INTEGER DEFAULT 100,
  default_user_monthly_token_limit INTEGER DEFAULT 50000,

  -- Rate limiting
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 3600,

  -- Provider status
  is_enabled BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,

  -- Cost management
  cost_per_1k_tokens NUMERIC(8,5) DEFAULT 0.002,
  cost_multiplier NUMERIC(4,2) DEFAULT 1.0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT positive_system_limits CHECK (
    global_monthly_limit_usd >= 0 AND
    global_daily_request_limit >= 0 AND
    global_monthly_token_limit >= 0 AND
    default_user_monthly_limit_usd >= 0 AND
    default_user_daily_request_limit >= 0 AND
    default_user_monthly_token_limit >= 0 AND
    requests_per_minute > 0 AND
    requests_per_hour > 0 AND
    cost_per_1k_tokens >= 0 AND
    cost_multiplier > 0
  )
);

-- API usage analytics and monitoring
CREATE TABLE public.api_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider api_provider_type NOT NULL,

  -- Request details
  endpoint TEXT,
  method TEXT DEFAULT 'POST',
  model_name TEXT,

  -- Usage metrics
  tokens_prompt INTEGER DEFAULT 0,
  tokens_completion INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,6) DEFAULT 0,

  -- Performance metrics
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,

  -- Success/failure tracking
  success BOOLEAN DEFAULT true,
  error_code TEXT,
  error_message TEXT,

  -- Request metadata
  user_agent TEXT,
  ip_address INET,
  request_metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- API key rotation and security audit log
CREATE TABLE public.api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'activated', 'deactivated',
    'rotated', 'revoked', 'expired', 'limit_exceeded'
  )),

  -- Audit details
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,

  -- Context
  reason TEXT,
  user_agent TEXT,
  ip_address INET,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- System-wide API configuration and settings
CREATE TABLE public.api_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,

  -- Access control
  access_level TEXT DEFAULT 'super_admin' CHECK (access_level IN ('super_admin', 'admin')),

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_system_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_system_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - SUPER_ADMIN ONLY ACCESS
CREATE POLICY "Super admin only access to api_keys" ON public.api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin only access to system_limits" ON public.api_system_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin only access to usage_analytics" ON public.api_usage_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin only access to audit_log" ON public.api_key_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin only access to system_config" ON public.api_system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);
CREATE INDEX idx_api_keys_created_by ON public.api_keys(created_by);
CREATE INDEX idx_api_keys_last_used ON public.api_keys(last_used_at DESC);

CREATE INDEX idx_api_usage_analytics_api_key_time ON public.api_usage_analytics(api_key_id, requested_at DESC);
CREATE INDEX idx_api_usage_analytics_user_time ON public.api_usage_analytics(user_id, requested_at DESC);
CREATE INDEX idx_api_usage_analytics_provider_time ON public.api_usage_analytics(provider, requested_at DESC);
CREATE INDEX idx_api_usage_analytics_cost ON public.api_usage_analytics(estimated_cost DESC);

CREATE INDEX idx_api_audit_log_key_time ON public.api_key_audit_log(api_key_id, created_at DESC);
CREATE INDEX idx_api_audit_log_action ON public.api_key_audit_log(action);

-- Create triggers for updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_api_system_limits_updated_at
  BEFORE UPDATE ON public.api_system_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_api_system_config_updated_at
  BEFORE UPDATE ON public.api_system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Utility functions for API management
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_api_key_monthly_usage(key_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: super admin role required';
  END IF;

  SELECT jsonb_build_object(
    'total_cost', COALESCE(SUM(estimated_cost), 0),
    'total_tokens', COALESCE(SUM(tokens_total), 0),
    'total_requests', COUNT(*),
    'success_rate', ROUND(
      (COUNT(*) FILTER (WHERE success = true)::decimal / NULLIF(COUNT(*), 0)) * 100, 2
    ),
    'avg_response_time', ROUND(AVG(response_time_ms), 2)
  )
  INTO result
  FROM public.api_usage_analytics
  WHERE api_key_id = key_id
    AND requested_at >= date_trunc('month', CURRENT_DATE);

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION get_system_api_usage_stats(days_back INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: super admin role required';
  END IF;

  SELECT jsonb_build_object(
    'total_cost', COALESCE(SUM(estimated_cost), 0),
    'total_tokens', COALESCE(SUM(tokens_total), 0),
    'total_requests', COUNT(*),
    'unique_users', COUNT(DISTINCT user_id),
    'by_provider', jsonb_object_agg(
      provider,
      jsonb_build_object(
        'cost', COALESCE(SUM(estimated_cost), 0),
        'tokens', COALESCE(SUM(tokens_total), 0),
        'requests', COUNT(*),
        'users', COUNT(DISTINCT user_id)
      )
    ),
    'success_rate', ROUND(
      (COUNT(*) FILTER (WHERE success = true)::decimal / NULLIF(COUNT(*), 0)) * 100, 2
    )
  )
  INTO result
  FROM public.api_usage_analytics
  WHERE requested_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  GROUP BY ()
  HAVING COUNT(*) > 0;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Insert default system limits for all providers
INSERT INTO public.api_system_limits (provider, global_monthly_limit_usd, global_daily_request_limit, global_monthly_token_limit) VALUES
('openai', 1000.00, 100000, 100000000),
('claude', 1000.00, 100000, 100000000),
('gemini', 1000.00, 100000, 100000000),
('lovable', 1000.00, 100000, 100000000),
('custom', 500.00, 50000, 50000000)
ON CONFLICT (provider) DO NOTHING;

-- Insert default system configuration
INSERT INTO public.api_system_config (config_key, config_value, description) VALUES
('encryption_key_rotation_days', '90', 'Number of days before API key rotation reminder'),
('max_api_keys_per_provider', '5', 'Maximum number of API keys allowed per provider'),
('audit_log_retention_days', '365', 'Number of days to retain audit logs'),
('usage_analytics_retention_days', '90', 'Number of days to retain detailed usage analytics'),
('cost_alert_threshold_percentage', '80', 'Percentage of monthly limit that triggers cost alerts'),
('rate_limit_window_minutes', '1', 'Time window for rate limiting in minutes')
ON CONFLICT (config_key) DO NOTHING;