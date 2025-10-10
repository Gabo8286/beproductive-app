-- Create Super Admin User for gabotico82@gmail.com
-- This script should be run in the Supabase SQL Editor or via psql

-- First, ensure the user exists in auth.users
-- Note: The user needs to sign up first through the app or Supabase Auth
-- This script assumes the user has already signed up

-- Get the user ID for gabotico82@gmail.com
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'gabotico82@gmail.com'
    LIMIT 1;

    IF user_id IS NULL THEN
        RAISE NOTICE 'User gabotico82@gmail.com not found in auth.users. Please sign up first.';
    ELSE
        -- Update or insert the profile with super admin privileges
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            onboarding_completed,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            'gabotico82@gmail.com',
            'Gabriel Soto', -- You can change this to your full name
            'admin', -- Set as admin (highest role available in the schema)
            true,
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE
        SET
            role = 'admin',
            onboarding_completed = true,
            updated_at = now();

        -- Create a personal workspace for the admin
        INSERT INTO public.workspaces (
            name,
            description,
            owner_id,
            created_at,
            updated_at
        ) VALUES (
            'Admin Workspace',
            'Super Admin workspace for Gabriel Soto',
            user_id,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;

        -- Add the user as owner to their workspace
        INSERT INTO public.workspace_members (
            workspace_id,
            user_id,
            role,
            joined_at
        )
        SELECT
            w.id,
            user_id,
            'owner',
            now()
        FROM public.workspaces w
        WHERE w.owner_id = user_id
        ON CONFLICT (workspace_id, user_id) DO NOTHING;

        RAISE NOTICE 'Successfully set up super admin privileges for gabotico82@gmail.com';
        RAISE NOTICE 'User ID: %', user_id;
    END IF;
END $$;

-- Grant additional permissions if needed
-- Create a super_admins table to track super admin users
CREATE TABLE IF NOT EXISTS public.super_admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email text NOT NULL,
    granted_at timestamptz DEFAULT now() NOT NULL,
    granted_by uuid REFERENCES auth.users(id),
    notes text
);

-- Insert super admin record
INSERT INTO public.super_admins (user_id, email, notes)
SELECT
    id,
    'gabotico82@gmail.com',
    'Initial super admin user'
FROM auth.users
WHERE email = 'gabotico82@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.super_admins
        WHERE super_admins.user_id = is_super_admin.user_id
    );
END;
$$;

-- Create RLS policies for super admins to have full access
-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM public.super_admins)
    );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM public.super_admins)
    );

-- Super admins can view all workspaces
CREATE POLICY "Super admins can view all workspaces" ON public.workspaces
    FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM public.super_admins)
    );

-- Super admins can manage all workspaces
CREATE POLICY "Super admins can manage all workspaces" ON public.workspaces
    FOR ALL
    USING (
        auth.uid() IN (SELECT user_id FROM public.super_admins)
    );

-- Grant super admin access to all major tables
DO $$
DECLARE
    table_name text;
BEGIN
    -- List of tables to grant super admin access
    FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'goals', 'habits', 'tasks', 'notes', 'projects',
            'reflections', 'habit_entries', 'quick_todos',
            'tags', 'templates', 'api_providers', 'api_keys'
        )
    LOOP
        -- Create policy for super admin full access
        EXECUTE format(
            'CREATE POLICY "Super admins have full access to %I" ON public.%I
            FOR ALL
            USING (auth.uid() IN (SELECT user_id FROM public.super_admins))',
            table_name, table_name
        );
    END LOOP;
END $$;

-- Display the result
SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.onboarding_completed,
    CASE
        WHEN sa.user_id IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as is_super_admin
FROM public.profiles p
LEFT JOIN public.super_admins sa ON p.id = sa.user_id
WHERE p.email = 'gabotico82@gmail.com';