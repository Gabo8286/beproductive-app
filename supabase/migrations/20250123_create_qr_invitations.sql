-- Create QR invitations table for super admin QR code invitation system
-- This enables super admins to generate QR codes that automatically approve users

-- Create QR invitations table
CREATE TABLE public.qr_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT 'QR Code Invitation',
    max_uses INTEGER NOT NULL DEFAULT 10,
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_approve BOOLEAN NOT NULL DEFAULT true,
    invitation_source TEXT NOT NULL DEFAULT 'qr_code',
    qr_code_data_url TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES public.profiles(id),
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on qr_invitations
ALTER TABLE public.qr_invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_qr_invitations_token ON public.qr_invitations(token);
CREATE INDEX idx_qr_invitations_created_by ON public.qr_invitations(created_by);
CREATE INDEX idx_qr_invitations_expires_at ON public.qr_invitations(expires_at);
CREATE INDEX idx_qr_invitations_active ON public.qr_invitations(revoked, expires_at) WHERE revoked = false;

-- RLS Policies for qr_invitations (super admin access only)
CREATE POLICY "Super admins can view all QR invitations" ON public.qr_invitations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can create QR invitations" ON public.qr_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Super admins can update QR invitations" ON public.qr_invitations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Allow anonymous users to read QR invitations for validation (limited fields)
CREATE POLICY "Anonymous users can validate QR tokens" ON public.qr_invitations
    FOR SELECT
    TO anon
    USING (
        revoked = false
        AND expires_at > NOW()
        AND current_uses < max_uses
    );

-- Add QR invitation fields to beta_signups table
ALTER TABLE public.beta_signups
    ADD COLUMN qr_invitation_id UUID REFERENCES public.qr_invitations(id),
    ADD COLUMN auto_approved BOOLEAN DEFAULT false,
    ADD COLUMN invitation_source TEXT DEFAULT 'manual';

-- Create index for QR invitation relationship
CREATE INDEX idx_beta_signups_qr_invitation_id ON public.beta_signups(qr_invitation_id);

-- Function to validate QR invitation token
CREATE OR REPLACE FUNCTION validate_qr_invitation_token(token UUID)
RETURNS JSONB AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Get QR invitation record with validation
    SELECT
        id,
        description,
        max_uses,
        current_uses,
        expires_at,
        auto_approve,
        revoked
    INTO invitation_record
    FROM public.qr_invitations
    WHERE qr_invitations.token = validate_qr_invitation_token.token
    AND revoked = false
    AND expires_at > NOW()
    AND current_uses < max_uses;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Invalid, expired, or exhausted QR invitation token'
        );
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'invitation_id', invitation_record.id,
        'description', invitation_record.description,
        'auto_approve', invitation_record.auto_approve,
        'expires_at', invitation_record.expires_at,
        'uses_remaining', invitation_record.max_uses - invitation_record.current_uses
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('valid', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume QR invitation (increment usage)
CREATE OR REPLACE FUNCTION consume_qr_invitation(
    token UUID,
    signup_email TEXT,
    signup_name TEXT
) RETURNS JSONB AS $$
DECLARE
    invitation_record RECORD;
    new_signup_id UUID;
BEGIN
    -- Validate and get invitation
    SELECT id, description, max_uses, current_uses, auto_approve
    INTO invitation_record
    FROM public.qr_invitations
    WHERE qr_invitations.token = consume_qr_invitation.token
    AND revoked = false
    AND expires_at > NOW()
    AND current_uses < max_uses;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or exhausted QR invitation'
        );
    END IF;

    -- Create beta signup with auto-approval
    INSERT INTO public.beta_signups (
        email,
        name,
        status,
        qr_invitation_id,
        auto_approved,
        invitation_source,
        approved_at,
        invitation_token,
        token_expires_at
    )
    VALUES (
        signup_email,
        signup_name,
        CASE WHEN invitation_record.auto_approve THEN 'approved'::beta_signup_status ELSE 'pending'::beta_signup_status END,
        invitation_record.id,
        invitation_record.auto_approve,
        'qr_code',
        CASE WHEN invitation_record.auto_approve THEN NOW() ELSE NULL END,
        CASE WHEN invitation_record.auto_approve THEN gen_random_uuid() ELSE NULL END,
        CASE WHEN invitation_record.auto_approve THEN NOW() + INTERVAL '7 days' ELSE NULL END
    )
    RETURNING id INTO new_signup_id;

    -- Increment usage count and update last used
    UPDATE public.qr_invitations
    SET
        current_uses = current_uses + 1,
        last_used_at = NOW()
    WHERE id = invitation_record.id;

    RETURN jsonb_build_object(
        'success', true,
        'signup_id', new_signup_id,
        'auto_approved', invitation_record.auto_approve,
        'description', invitation_record.description
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get QR invitation usage statistics
CREATE OR REPLACE FUNCTION get_qr_invitation_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_qr_invitations', COUNT(*),
        'active_qr_invitations', COUNT(*) FILTER (WHERE revoked = false AND expires_at > NOW()),
        'expired_qr_invitations', COUNT(*) FILTER (WHERE expires_at <= NOW()),
        'revoked_qr_invitations', COUNT(*) FILTER (WHERE revoked = true),
        'total_qr_signups', (
            SELECT COUNT(*) FROM public.beta_signups
            WHERE invitation_source = 'qr_code'
        ),
        'auto_approved_qr_signups', (
            SELECT COUNT(*) FROM public.beta_signups
            WHERE invitation_source = 'qr_code' AND auto_approved = true
        ),
        'total_qr_uses', COALESCE(SUM(current_uses), 0),
        'last_updated', NOW()
    )
    INTO stats
    FROM public.qr_invitations;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_qr_invitation_token(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION consume_qr_invitation(UUID, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_qr_invitation_stats() TO authenticated;

-- Create notification trigger for QR invitation usage
CREATE OR REPLACE FUNCTION notify_qr_invitation_used()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify when QR invitation is used
    IF NEW.qr_invitation_id IS NOT NULL AND OLD.qr_invitation_id IS NULL THEN
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
            'qr_invitation_used',
            'QR Invitation Used',
            'QR invitation used by ' || COALESCE(NEW.name, NEW.email),
            NOW()
        FROM public.profiles
        WHERE profiles.role = 'super_admin';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for QR invitation usage
CREATE TRIGGER trigger_notify_qr_invitation_used
    AFTER UPDATE ON public.beta_signups
    FOR EACH ROW
    EXECUTE FUNCTION notify_qr_invitation_used();

-- Add indexes for better performance
CREATE INDEX idx_beta_signups_invitation_source ON public.beta_signups(invitation_source);
CREATE INDEX idx_beta_signups_auto_approved ON public.beta_signups(auto_approved);

-- Update existing beta_signups to have default invitation_source
UPDATE public.beta_signups
SET invitation_source = 'manual'
WHERE invitation_source IS NULL;