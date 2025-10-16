-- FULL ROLES SETUP MIGRATION (idempotent)
-- 1) Ensure user_role enum exists with required values
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user','team_lead','admin','super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure enum values exist (safe if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname='user_role' AND e.enumlabel='user'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'user';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname='user_role' AND e.enumlabel='team_lead'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'team_lead';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname='user_role' AND e.enumlabel='admin'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'admin';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname='user_role' AND e.enumlabel='super_admin'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- 2) Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Ensure user_roles table exists and has correct FK to profiles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL,
  role public.user_role NOT NULL,
  assigned_by UUID NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Drop and recreate FK to profiles(id)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_roles_user_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
  END IF;
  ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: users can view their own roles only
DO $$ BEGIN
  CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) has_role function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.user_role) TO authenticated;

-- 5) New user handler + trigger (ensures profile + default 'user' role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 6) Super admin RPCs (security definer)
CREATE OR REPLACE FUNCTION public.assign_super_admin_role(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target user profile not found');
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    IF NOT public.has_role(auth.uid(), 'super_admin') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Only super admins can assign super admin role');
    END IF;
  END IF;

  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, 'super_admin', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  IF public.has_role(target_user_id, 'super_admin') THEN
    RETURN jsonb_build_object('success', true, 'message', 'Super admin role assigned successfully');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Failed to assign super admin role');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_initial_super_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No authenticated user');
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Super admin already exists');
  END IF;

  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', ''), 'free'
  FROM auth.users u
  WHERE u.id = current_user_id
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'message', 'Initial super admin assigned', 'user_id', current_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  role_name TEXT,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role::text, ur.assigned_at, ur.assigned_by
  FROM public.user_roles ur
  WHERE ur.user_id = COALESCE(check_user_id, auth.uid())
  ORDER BY ur.assigned_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_super_admin_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_initial_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;

-- 7) Backfill missing profiles and default 'user' roles
INSERT INTO public.profiles (id, email, full_name, subscription_tier)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name',''), 'free'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'user'::public.user_role
FROM public.profiles p
LEFT JOIN public.user_roles ur
  ON ur.user_id = p.id AND ur.role = 'user'
WHERE ur.user_id IS NULL;

-- 8) Fix admin checks to use has_role (example: check_api_key_limits)
CREATE OR REPLACE FUNCTION public.check_api_key_limits(key_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSONB;
  key_record RECORD;
  cost_percentage NUMERIC;
  request_percentage NUMERIC;
  token_percentage NUMERIC;
  is_approaching_limit BOOLEAN;
  is_over_limit BOOLEAN;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: super admin role required';
  END IF;

  SELECT * INTO key_record FROM api_keys WHERE id = key_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'API key not found'; END IF;

  IF key_record.monthly_limit_usd > 0 THEN
    cost_percentage := (key_record.current_month_cost / key_record.monthly_limit_usd) * 100;
  ELSE cost_percentage := 0; END IF;

  IF key_record.daily_request_limit > 0 THEN
    request_percentage := (key_record.current_day_requests::NUMERIC / key_record.daily_request_limit) * 100;
  ELSE request_percentage := 0; END IF;

  IF key_record.monthly_token_limit > 0 THEN
    token_percentage := (key_record.current_month_tokens::NUMERIC / key_record.monthly_token_limit) * 100;
  ELSE token_percentage := 0; END IF;

  is_approaching_limit := (cost_percentage >= 80 OR request_percentage >= 80 OR token_percentage >= 80);
  is_over_limit := (cost_percentage >= 100 OR request_percentage >= 100 OR token_percentage >= 100);

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
$function$;

-- 9) Completion note
SELECT 'Roles migration complete. Sign in and use the in-app Debug → Super Admin Setup to run Assign Initial Super Admin.' AS info;