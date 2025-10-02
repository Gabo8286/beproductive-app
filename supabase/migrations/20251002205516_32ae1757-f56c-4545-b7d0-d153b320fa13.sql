-- Enable pgcrypto extension for encryption/decryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function: Get user AI usage statistics
CREATE OR REPLACE FUNCTION public.get_user_ai_usage_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMP;
BEGIN
  start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  WITH stats AS (
    SELECT
      COALESCE(SUM(estimated_cost), 0) as total_cost,
      COALESCE(SUM(tokens_total), 0) as total_tokens,
      COUNT(*) as total_requests,
      ROUND(
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
      ) as success_rate,
      ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM api_usage_analytics
    WHERE user_id = p_user_id
      AND requested_at >= start_date
  ),
  by_provider AS (
    SELECT
      provider,
      COALESCE(SUM(estimated_cost), 0) as cost,
      COALESCE(SUM(tokens_total), 0) as tokens,
      COUNT(*) as requests,
      ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM api_usage_analytics
    WHERE user_id = p_user_id
      AND requested_at >= start_date
    GROUP BY provider
  ),
  daily AS (
    SELECT
      DATE(requested_at) as date,
      COALESCE(SUM(estimated_cost), 0) as cost,
      COALESCE(SUM(tokens_total), 0) as tokens,
      COUNT(*) as requests
    FROM api_usage_analytics
    WHERE user_id = p_user_id
      AND requested_at >= start_date
    GROUP BY DATE(requested_at)
    ORDER BY DATE(requested_at)
  )
  SELECT jsonb_build_object(
    'total_cost', (SELECT total_cost FROM stats),
    'total_tokens', (SELECT total_tokens FROM stats),
    'total_requests', (SELECT total_requests FROM stats),
    'success_rate', (SELECT success_rate FROM stats),
    'avg_response_time', (SELECT avg_response_time FROM stats),
    'by_provider', (
      SELECT jsonb_object_agg(
        provider,
        jsonb_build_object(
          'cost', cost,
          'tokens', tokens,
          'requests', requests,
          'avg_response_time', avg_response_time
        )
      )
      FROM by_provider
    ),
    'daily_breakdown', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', date,
          'cost', cost,
          'tokens', tokens,
          'requests', requests
        )
      ), '[]'::jsonb)
      FROM daily
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function: Get system-wide API usage statistics
CREATE OR REPLACE FUNCTION public.get_system_api_usage_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMP;
BEGIN
  -- Only allow super admins to call this
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: super admin role required';
  END IF;
  
  start_date := NOW() - (days_back || ' days')::INTERVAL;
  
  WITH stats AS (
    SELECT
      COALESCE(SUM(estimated_cost), 0) as total_cost,
      COALESCE(SUM(tokens_total), 0) as total_tokens,
      COUNT(*) as total_requests,
      COUNT(DISTINCT user_id) as unique_users,
      ROUND(
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
      ) as success_rate,
      ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM api_usage_analytics
    WHERE requested_at >= start_date
  ),
  by_provider AS (
    SELECT
      provider,
      COALESCE(SUM(estimated_cost), 0) as cost,
      COALESCE(SUM(tokens_total), 0) as tokens,
      COUNT(*) as requests,
      COUNT(DISTINCT user_id) as users,
      ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM api_usage_analytics
    WHERE requested_at >= start_date
    GROUP BY provider
  )
  SELECT jsonb_build_object(
    'total_cost', (SELECT total_cost FROM stats),
    'total_tokens', (SELECT total_tokens FROM stats),
    'total_requests', (SELECT total_requests FROM stats),
    'unique_users', (SELECT unique_users FROM stats),
    'success_rate', (SELECT success_rate FROM stats),
    'avg_response_time', (SELECT avg_response_time FROM stats),
    'by_provider', (
      SELECT jsonb_object_agg(
        provider,
        jsonb_build_object(
          'cost', cost,
          'tokens', tokens,
          'requests', requests,
          'users', users,
          'avg_response_time', avg_response_time
        )
      )
      FROM by_provider
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function: Get cost projections for a user
CREATE OR REPLACE FUNCTION public.get_cost_projections(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  current_month_start DATE;
  current_month_end DATE;
  days_in_month INTEGER;
  days_elapsed INTEGER;
  days_remaining INTEGER;
  current_cost NUMERIC;
  daily_avg NUMERIC;
  projected_cost NUMERIC;
BEGIN
  current_month_start := DATE_TRUNC('month', CURRENT_DATE);
  current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  days_in_month := EXTRACT(DAY FROM current_month_end);
  days_elapsed := EXTRACT(DAY FROM CURRENT_DATE);
  days_remaining := days_in_month - days_elapsed;
  
  -- Get current month cost
  SELECT COALESCE(SUM(estimated_cost), 0)
  INTO current_cost
  FROM api_usage_analytics
  WHERE user_id = p_user_id
    AND requested_at >= current_month_start
    AND requested_at < (current_month_end + INTERVAL '1 day');
  
  -- Calculate daily average
  IF days_elapsed > 0 THEN
    daily_avg := current_cost / days_elapsed;
  ELSE
    daily_avg := 0;
  END IF;
  
  -- Project month-end cost
  projected_cost := current_cost + (daily_avg * days_remaining);
  
  result := jsonb_build_object(
    'current_month_cost', current_cost,
    'daily_average', ROUND(daily_avg, 4),
    'projected_month_end_cost', ROUND(projected_cost, 2),
    'days_elapsed', days_elapsed,
    'days_remaining', days_remaining,
    'month_start', current_month_start,
    'month_end', current_month_end
  );
  
  RETURN result;
END;
$$;

-- Function: Check API key limits
CREATE OR REPLACE FUNCTION public.check_api_key_limits(
  key_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  key_record RECORD;
  cost_percentage NUMERIC;
  request_percentage NUMERIC;
  token_percentage NUMERIC;
  is_approaching_limit BOOLEAN;
  is_over_limit BOOLEAN;
BEGIN
  -- Only allow super admins to call this
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: super admin role required';
  END IF;
  
  -- Get API key details
  SELECT * INTO key_record
  FROM api_keys
  WHERE id = key_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'API key not found';
  END IF;
  
  -- Calculate percentages
  IF key_record.monthly_limit_usd > 0 THEN
    cost_percentage := (key_record.current_month_cost / key_record.monthly_limit_usd) * 100;
  ELSE
    cost_percentage := 0;
  END IF;
  
  IF key_record.daily_request_limit > 0 THEN
    request_percentage := (key_record.current_day_requests::NUMERIC / key_record.daily_request_limit) * 100;
  ELSE
    request_percentage := 0;
  END IF;
  
  IF key_record.monthly_token_limit > 0 THEN
    token_percentage := (key_record.current_month_tokens::NUMERIC / key_record.monthly_token_limit) * 100;
  ELSE
    token_percentage := 0;
  END IF;
  
  -- Determine warning flags
  is_approaching_limit := (
    cost_percentage >= 80 OR
    request_percentage >= 80 OR
    token_percentage >= 80
  );
  
  is_over_limit := (
    cost_percentage >= 100 OR
    request_percentage >= 100 OR
    token_percentage >= 100
  );
  
  result := jsonb_build_object(
    'key_id', key_id,
    'key_name', key_record.key_name,
    'provider', key_record.provider,
    'status', key_record.status,
    'cost_usage_percent', ROUND(cost_percentage, 2),
    'request_usage_percent', ROUND(request_percentage, 2),
    'token_usage_percent', ROUND(token_percentage, 2),
    'current_month_cost', key_record.current_month_cost,
    'monthly_limit_usd', key_record.monthly_limit_usd,
    'current_day_requests', key_record.current_day_requests,
    'daily_request_limit', key_record.daily_request_limit,
    'current_month_tokens', key_record.current_month_tokens,
    'monthly_token_limit', key_record.monthly_token_limit,
    'is_approaching_limit', is_approaching_limit,
    'is_over_limit', is_over_limit
  );
  
  RETURN result;
END;
$$;

-- Function: Increment API key usage (atomic update)
CREATE OR REPLACE FUNCTION public.increment_api_key_usage(
  key_id UUID,
  cost_amount NUMERIC,
  token_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE api_keys
  SET
    current_month_cost = current_month_cost + cost_amount,
    current_month_tokens = current_month_tokens + token_amount,
    current_day_requests = current_day_requests + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = key_id;
END;
$$;