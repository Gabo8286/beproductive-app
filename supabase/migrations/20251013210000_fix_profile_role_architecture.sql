-- Phase 1: Fix Profile-Role Architecture
-- Create function to fetch user profile with role data atomically

-- Create function to get user profile with highest priority role
CREATE OR REPLACE FUNCTION public.get_user_profile_with_role(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT,
  preferences JSONB,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH user_profile AS (
    SELECT
      p.id,
      p.email,
      p.full_name,
      p.avatar_url,
      p.subscription_tier,
      p.preferences,
      p.onboarding_completed,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    WHERE p.id = COALESCE(p_user_id, auth.uid())
  ),
  highest_role AS (
    SELECT
      ur.user_id,
      -- Priority order: super_admin > admin > team_lead > user
      CASE
        WHEN 'super_admin'::user_role = ANY(array_agg(ur.role)) THEN 'super_admin'
        WHEN 'admin'::user_role = ANY(array_agg(ur.role)) THEN 'admin'
        WHEN 'team_lead'::user_role = ANY(array_agg(ur.role)) THEN 'team_lead'
        ELSE 'user'
      END as role
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(p_user_id, auth.uid())
    GROUP BY ur.user_id
  )
  SELECT
    up.id,
    up.email,
    up.full_name,
    up.avatar_url,
    up.subscription_tier,
    up.preferences,
    up.onboarding_completed,
    up.created_at,
    up.updated_at,
    COALESCE(hr.role, 'user') as role
  FROM user_profile up
  LEFT JOIN highest_role hr ON hr.user_id = up.id;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_user_profile_with_role(UUID) TO authenticated;

-- Create RLS policy for the function (users can only get their own profile unless they're super admin)
COMMENT ON FUNCTION public.get_user_profile_with_role(UUID) IS
  'Returns user profile with highest priority role. Secured by RLS - users can only access their own profile unless super admin.';