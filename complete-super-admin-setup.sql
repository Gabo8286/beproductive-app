-- Complete Super Admin Setup for Spark Bloom Flow
-- Apply this in Supabase SQL Editor to enable super admin functionality
-- Run in order: 1) Beta Signups, 2) Beta Invitations, 3) Super Admin Functions

-- =====================================================
-- PART 1: Create beta_signups table
-- =====================================================

-- Create beta_signups table
CREATE TABLE IF NOT EXISTS public.beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone
CREATE POLICY "Anyone can create beta signups" ON public.beta_signups
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to view beta signups (for admin)
CREATE POLICY "Authenticated users can view beta signups" ON public.beta_signups
    FOR SELECT
    TO authenticated
    USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beta_signups_updated_at
    BEFORE UPDATE ON public.beta_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 2: Extend beta_signups and create beta_invitations
-- =====================================================

-- Create enum for beta signup status
DO $$ BEGIN
    CREATE TYPE public.beta_signup_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to beta_signups table
ALTER TABLE public.beta_signups
  ADD COLUMN IF NOT EXISTS status public.beta_signup_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX IF NOT EXISTS idx_beta_signups_invitation_token ON public.beta_signups(invitation_token);

-- Create beta_invitations table for tracking invitation emails
CREATE TABLE IF NOT EXISTS public.beta_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beta_signup_id UUID NOT NULL REFERENCES public.beta_signups(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL DEFAULT 'invitation', -- invitation, reminder, welcome
    language_code TEXT NOT NULL DEFAULT 'en', -- en, es
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    email_data JSONB, -- Store email content and metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on beta_invitations
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes for beta_invitations
CREATE INDEX IF NOT EXISTS idx_beta_invitations_beta_signup_id ON public.beta_invitations(beta_signup_id);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_email_type ON public.beta_invitations(email_type);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_sent_at ON public.beta_invitations(sent_at);

-- =====================================================
-- PART 3: Super Admin Functions and Policies
-- =====================================================

-- Drop any existing broken policies first
DROP POLICY IF EXISTS "Super admins can view all beta invitations" ON public.beta_invitations;
DROP POLICY IF EXISTS "Super admins can insert beta invitations" ON public.beta_invitations;
DROP POLICY IF EXISTS "Super admins can update beta invitations" ON public.beta_invitations;
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

-- Fix notification trigger function
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

-- Add helpful comments for future reference
COMMENT ON FUNCTION assign_initial_super_admin() IS
'Assigns super admin role to the current authenticated user. Can only be called once when no super admin exists.';

COMMENT ON FUNCTION assign_super_admin_role(UUID) IS
'Assigns super admin role to specified user. Can only be called by existing super admins.';

COMMENT ON FUNCTION get_user_roles(UUID) IS
'Returns all roles assigned to a user. Defaults to current authenticated user.';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This will show a success message if everything runs correctly
SELECT 'Super Admin setup completed successfully! You can now:
1. Run: SELECT * FROM assign_initial_super_admin();
2. Use your Super Admin Dashboard
3. Test with: npm run db:setup' as setup_status;