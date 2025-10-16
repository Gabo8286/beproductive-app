-- Extend beta_signups table for approval workflow
-- Add approval status and invitation management fields

-- Create enum for beta signup status
CREATE TYPE public.beta_signup_status AS ENUM ('pending', 'approved', 'rejected');

-- Add new columns to beta_signups table
ALTER TABLE public.beta_signups
  ADD COLUMN status public.beta_signup_status DEFAULT 'pending',
  ADD COLUMN invitation_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN rejection_reason TEXT;

-- Create index for faster lookups
CREATE INDEX idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX idx_beta_signups_invitation_token ON public.beta_signups(invitation_token);

-- Create beta_invitations table for tracking invitation emails
CREATE TABLE public.beta_invitations (
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
CREATE INDEX idx_beta_invitations_beta_signup_id ON public.beta_invitations(beta_signup_id);
CREATE INDEX idx_beta_invitations_email_type ON public.beta_invitations(email_type);
CREATE INDEX idx_beta_invitations_sent_at ON public.beta_invitations(sent_at);

-- RLS Policies for beta_invitations (super admin access only)
CREATE POLICY "Super admins can view all beta invitations" ON public.beta_invitations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can insert beta invitations" ON public.beta_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update beta invitations" ON public.beta_invitations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Update RLS policy for beta_signups to include super admin updates
CREATE POLICY "Super admins can update beta signups" ON public.beta_signups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Function to approve beta signup and generate invitation
CREATE OR REPLACE FUNCTION approve_beta_signup(
    signup_id UUID,
    admin_id UUID
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
    new_token UUID;
BEGIN
    -- Generate new invitation token
    new_token := gen_random_uuid();

    -- Update the beta signup
    UPDATE public.beta_signups
    SET
        status = 'approved',
        approved_by = admin_id,
        approved_at = NOW(),
        invitation_token = new_token,
        token_expires_at = NOW() + INTERVAL '7 days'
    WHERE id = signup_id;

    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Beta signup not found');
    END IF;

    -- Return success with token
    RETURN jsonb_build_object(
        'success', true,
        'invitation_token', new_token,
        'expires_at', (NOW() + INTERVAL '7 days')
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject beta signup
CREATE OR REPLACE FUNCTION reject_beta_signup(
    signup_id UUID,
    admin_id UUID,
    reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
BEGIN
    -- Update the beta signup
    UPDATE public.beta_signups
    SET
        status = 'rejected',
        approved_by = admin_id,
        approved_at = NOW(),
        rejection_reason = reason
    WHERE id = signup_id;

    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Beta signup not found');
    END IF;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate invitation token
CREATE OR REPLACE FUNCTION validate_invitation_token(token UUID)
RETURNS JSONB AS $$
DECLARE
    signup_record RECORD;
BEGIN
    -- Get signup record with token validation
    SELECT id, email, name, status, token_expires_at
    INTO signup_record
    FROM public.beta_signups
    WHERE invitation_token = token
    AND status = 'approved'
    AND token_expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired invitation token');
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'signup_id', signup_record.id,
        'email', signup_record.email,
        'name', signup_record.name,
        'expires_at', signup_record.token_expires_at
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('valid', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get beta signup statistics for super admin dashboard
CREATE OR REPLACE FUNCTION get_beta_signup_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_signups', COUNT(*),
        'pending_signups', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved_signups', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected_signups', COUNT(*) FILTER (WHERE status = 'rejected'),
        'recent_signups_24h', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours'),
        'recent_signups_7d', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
        'invitations_sent', (
            SELECT COUNT(*) FROM public.beta_invitations
            WHERE email_type = 'invitation'
        ),
        'last_updated', NOW()
    )
    INTO stats
    FROM public.beta_signups;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION approve_beta_signup(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_beta_signup(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_invitation_token(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_beta_signup_stats() TO authenticated;

-- Create notification trigger for new beta signups
CREATE OR REPLACE FUNCTION notify_new_beta_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for super admins
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        created_at
    )
    SELECT
        profiles.id,
        'beta_signup',
        'New Beta Signup Request',
        'New beta signup from ' || COALESCE(NEW.name, NEW.email),
        NOW()
    FROM public.profiles
    WHERE profiles.role = 'super_admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new beta signups
CREATE TRIGGER trigger_notify_new_beta_signup
    AFTER INSERT ON public.beta_signups
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_beta_signup();