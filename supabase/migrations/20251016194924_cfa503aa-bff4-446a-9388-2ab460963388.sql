-- Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'super_admin', 'admin', 'moderator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add 'super_admin' to enum if it doesn't exist
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS assign_super_admin_role(uuid);
DROP FUNCTION IF EXISTS assign_initial_super_admin();
DROP FUNCTION IF EXISTS get_user_roles(uuid);

-- Create function to assign super admin role to a specific user
CREATE FUNCTION assign_super_admin_role(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check if the calling user is already a super admin (except for the first assignment)
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
        -- If super admins exist, verify the caller is one of them
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Only super admins can assign super admin role'
            );
        END IF;
    END IF;

    -- Assign super admin role
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (target_user_id, 'super_admin', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Check if the assignment was successful
    IF EXISTS (
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

-- Create function to assign initial super admin (first super admin in the system)
CREATE FUNCTION assign_initial_super_admin()
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
            'error', 'No authenticated user found - please log in first'
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

-- Create function to get all roles for a user
CREATE FUNCTION get_user_roles(check_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    role_name TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ur.role::TEXT,
        ur.assigned_at,
        ur.assigned_by
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(check_user_id, auth.uid())
    ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION assign_super_admin_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_initial_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles(UUID) TO authenticated;