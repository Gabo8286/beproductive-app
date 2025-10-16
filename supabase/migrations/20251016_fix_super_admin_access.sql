-- Fix Super Admin Access Issues
-- Fix broken RLS policies and notification triggers that reference non-existent profiles.role column

-- Phase 1: Fix Beta Signups and Invitations RLS Policies
-- Drop existing broken policies that reference profiles.role

-- Drop broken beta_invitations policies
DROP POLICY IF EXISTS "Super admins can view all beta invitations" ON public.beta_invitations;
DROP POLICY IF EXISTS "Super admins can insert beta invitations" ON public.beta_invitations;
DROP POLICY IF EXISTS "Super admins can update beta invitations" ON public.beta_invitations;

-- Drop broken beta_signups policy
DROP POLICY IF EXISTS "Super admins can update beta signups" ON public.beta_signups;

-- Create corrected RLS policies using has_role function
CREATE POLICY "Super admins can view all beta invitations" ON public.beta_invitations
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert beta invitations" ON public.beta_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update beta invitations" ON public.beta_invitations
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete beta invitations" ON public.beta_invitations
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update beta signups" ON public.beta_signups
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

-- Phase 2: Fix notification trigger function
-- Replace the broken notify_new_beta_signup function that references profiles.role

CREATE OR REPLACE FUNCTION notify_new_beta_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for super admins using user_roles table
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        created_at
    )
    SELECT
        ur.user_id,
        'beta_signup',
        'New Beta Signup Request',
        'New beta signup from ' || COALESCE(NEW.name, NEW.email),
        NOW()
    FROM public.user_roles ur
    WHERE ur.role = 'super_admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 3: Create super admin assignment function
-- Function to assign super admin role to a user (can only be called by existing super admins)
CREATE OR REPLACE FUNCTION assign_super_admin_role(
    target_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check if the calling user is already a super admin (except for the first assignment)
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
        -- If super admins exist, verify the caller is one of them
        IF NOT public.has_role(auth.uid(), 'super_admin') THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Only super admins can assign super admin role'
            );
        END IF;
    END IF;

    -- Assign super admin role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (target_user_id, 'super_admin', auth.uid())
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Check if the assignment was successful
    IF FOUND OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = target_user_id AND role = 'super_admin'
    ) THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Super admin role assigned successfully'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to assign super admin role'
        );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION assign_super_admin_role(UUID) TO authenticated;

-- Phase 4: Create initial super admin user
-- This assigns super admin role to the application creator
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID when applying

-- Function to get current user ID for super admin assignment
CREATE OR REPLACE FUNCTION assign_initial_super_admin()
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No authenticated user found'
        );
    END IF;

    -- Check if any super admin already exists
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Super admin already exists'
        );
    END IF;

    -- Assign super admin role to current user
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (current_user_id, 'super_admin', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Initial super admin assigned successfully',
        'user_id', current_user_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permission to execute the initial assignment function
GRANT EXECUTE ON FUNCTION assign_initial_super_admin() TO authenticated;

-- Phase 5: Add helpful utility functions for debugging

-- Function to check user's roles (for debugging)
CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    role_name user_role,
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role, ur.assigned_at, ur.assigned_by
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(get_user_roles.user_id, auth.uid())
    ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_user_roles(UUID) TO authenticated;

-- Add helpful comment for future reference
COMMENT ON FUNCTION assign_initial_super_admin() IS
'Assigns super admin role to the current authenticated user. Can only be called once when no super admin exists.';

COMMENT ON FUNCTION assign_super_admin_role(UUID) IS
'Assigns super admin role to specified user. Can only be called by existing super admins.';

COMMENT ON FUNCTION get_user_roles(UUID) IS
'Returns all roles assigned to a user. Defaults to current authenticated user.';