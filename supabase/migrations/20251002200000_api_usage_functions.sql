-- Functions to support AI service integration with API management

-- Function to increment API key usage counters
CREATE OR REPLACE FUNCTION increment_api_key_usage(
  key_id UUID,
  cost_increment NUMERIC DEFAULT 0,
  token_increment INTEGER DEFAULT 0,
  request_increment INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Update the API key usage counters
  UPDATE public.api_keys
  SET
    current_month_cost = current_month_cost + cost_increment,
    total_lifetime_cost = total_lifetime_cost + cost_increment,
    current_day_requests = current_day_requests + request_increment,
    current_month_tokens = current_month_tokens + token_increment,
    updated_at = now()
  WHERE id = key_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'API key not found: %', key_id;
  END IF;
END;
$$;

-- Function to reset daily counters (to be called daily via cron)
CREATE OR REPLACE FUNCTION reset_daily_api_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys
  SET current_day_requests = 0
  WHERE current_day_requests > 0;

  -- Log the reset
  INSERT INTO public.api_key_audit_log (
    action,
    reason,
    new_values
  ) VALUES (
    'system_reset',
    'Daily usage counters reset',
    jsonb_build_object('reset_time', now(), 'type', 'daily_requests')
  );
END;
$$;

-- Function to reset monthly counters (to be called monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_api_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys
  SET
    current_month_cost = 0,
    current_month_tokens = 0
  WHERE current_month_cost > 0 OR current_month_tokens > 0;

  -- Log the reset
  INSERT INTO public.api_key_audit_log (
    action,
    reason,
    new_values
  ) VALUES (
    'system_reset',
    'Monthly usage counters reset',
    jsonb_build_object('reset_time', now(), 'type', 'monthly_usage')
  );
END;
$$;

-- Function to get aggregated usage stats for a user
CREATE OR REPLACE FUNCTION get_user_ai_usage_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is requesting their own data or is super admin
  IF p_user_id != auth.uid() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: can only view own usage data';
  END IF;

  SELECT jsonb_build_object(
    'total_cost', COALESCE(SUM(estimated_cost), 0),
    'total_tokens', COALESCE(SUM(tokens_total), 0),
    'total_requests', COUNT(*),
    'success_rate', ROUND(
      (COUNT(*) FILTER (WHERE success = true)::decimal / NULLIF(COUNT(*), 0)) * 100, 2
    ),
    'avg_response_time', ROUND(AVG(response_time_ms), 2),
    'by_provider', jsonb_object_agg(
      provider,
      jsonb_build_object(
        'cost', COALESCE(SUM(estimated_cost), 0),
        'tokens', COALESCE(SUM(tokens_total), 0),
        'requests', COUNT(*),
        'avg_response_time', ROUND(AVG(response_time_ms), 2)
      )
    ),
    'daily_breakdown', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_trunc('day', requested_at),
          'cost', SUM(estimated_cost),
          'tokens', SUM(tokens_total),
          'requests', COUNT(*)
        )
      )
      FROM public.api_usage_analytics
      WHERE user_id = p_user_id
        AND requested_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
      GROUP BY date_trunc('day', requested_at)
      ORDER BY date_trunc('day', requested_at)
    )
  )
  INTO result
  FROM public.api_usage_analytics
  WHERE user_id = p_user_id
    AND requested_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  GROUP BY ()
  HAVING COUNT(*) > 0;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function to check if API key limits are being approached
CREATE OR REPLACE FUNCTION check_api_key_limits(key_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_record RECORD;
  result JSONB;
  warnings TEXT[] := '{}';
BEGIN
  -- Get API key details
  SELECT * INTO key_record
  FROM public.api_keys
  WHERE id = key_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'API key not found: %', key_id;
  END IF;

  -- Check cost limits
  IF key_record.current_month_cost >= key_record.monthly_limit_usd * 0.9 THEN
    warnings := array_append(warnings, 'Monthly cost limit almost reached');
  END IF;

  -- Check request limits
  IF key_record.current_day_requests >= key_record.daily_request_limit * 0.9 THEN
    warnings := array_append(warnings, 'Daily request limit almost reached');
  END IF;

  -- Check token limits
  IF key_record.current_month_tokens >= key_record.monthly_token_limit * 0.9 THEN
    warnings := array_append(warnings, 'Monthly token limit almost reached');
  END IF;

  result := jsonb_build_object(
    'api_key_id', key_id,
    'cost_usage_percent', ROUND((key_record.current_month_cost / NULLIF(key_record.monthly_limit_usd, 0)) * 100, 2),
    'request_usage_percent', ROUND((key_record.current_day_requests::decimal / NULLIF(key_record.daily_request_limit, 0)) * 100, 2),
    'token_usage_percent', ROUND((key_record.current_month_tokens::decimal / NULLIF(key_record.monthly_token_limit, 0)) * 100, 2),
    'warnings', warnings,
    'limits_exceeded', (
      key_record.current_month_cost >= key_record.monthly_limit_usd OR
      key_record.current_day_requests >= key_record.daily_request_limit OR
      key_record.current_month_tokens >= key_record.monthly_token_limit
    )
  );

  RETURN result;
END;
$$;

-- Function to get cost projections based on current usage
CREATE OR REPLACE FUNCTION get_cost_projections(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result JSONB;
  daily_avg NUMERIC;
  days_in_month INTEGER;
  days_remaining INTEGER;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());

  -- Check permissions
  IF target_user_id != auth.uid() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: can only view own projections';
  END IF;

  -- Calculate days in current month and remaining
  days_in_month := EXTRACT(DAY FROM (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'));
  days_remaining := days_in_month - EXTRACT(DAY FROM CURRENT_DATE);

  -- Calculate daily average cost for current month
  SELECT COALESCE(AVG(daily_cost), 0) INTO daily_avg
  FROM (
    SELECT date_trunc('day', requested_at) as day, SUM(estimated_cost) as daily_cost
    FROM public.api_usage_analytics
    WHERE user_id = target_user_id
      AND requested_at >= date_trunc('month', CURRENT_DATE)
    GROUP BY date_trunc('day', requested_at)
  ) daily_costs;

  result := jsonb_build_object(
    'user_id', target_user_id,
    'current_month_cost', (
      SELECT COALESCE(SUM(estimated_cost), 0)
      FROM public.api_usage_analytics
      WHERE user_id = target_user_id
        AND requested_at >= date_trunc('month', CURRENT_DATE)
    ),
    'daily_average', daily_avg,
    'projected_month_end', daily_avg * days_in_month,
    'projected_additional_cost', daily_avg * days_remaining,
    'days_remaining', days_remaining,
    'calculation_date', CURRENT_DATE
  );

  RETURN result;
END;
$$;