-- Fix security warnings for AI Insights functions

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS get_user_ai_usage_stats(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_user_ai_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
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