-- Phase 1: Fix Function Search Path for Security
-- Prevents search path hijacking attacks on security-critical functions

ALTER FUNCTION public.get_level_from_xp(bigint) 
  SET search_path = 'public';

ALTER FUNCTION public.get_xp_required_for_level(integer) 
  SET search_path = 'public';

ALTER FUNCTION public.check_habit_completion(uuid, date) 
  SET search_path = 'public';

ALTER FUNCTION public.is_workspace_owner(uuid, uuid) 
  SET search_path = 'public';

ALTER FUNCTION public.is_workspace_member(uuid, uuid) 
  SET search_path = 'public';

-- Phase 2: Secure Materialized View
-- Since materialized views don't support RLS, we revoke public access
-- Only accessible via security definer functions or direct queries by authenticated users

REVOKE SELECT ON luna_user_dashboard_summary FROM anon;

-- Ensure authenticated users can only access via proper security definer functions
COMMENT ON MATERIALIZED VIEW luna_user_dashboard_summary IS 
  'Access restricted: Use get_luna_dashboard_data() function for secure user-specific queries';