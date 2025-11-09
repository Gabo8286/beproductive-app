-- =============================================
-- BeProductive Enhanced Authentication Schema
-- =============================================
--
-- This schema enhances the existing auth system with:
-- - Security audit trail
-- - Device trust management
-- - Rate limiting
-- - Enhanced user profiles
-- - Session management
--
-- Compatible with existing Supabase auth.users table
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- Enhanced Profiles Table
-- =============================================

-- Drop existing profiles table if it exists (for clean migration)
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enhanced profiles with additional security and UX fields
CREATE TABLE IF NOT EXISTS public.enhanced_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Information
    email text NOT NULL,
    full_name text,
    avatar_url text,

    -- Account Status
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    account_locked boolean DEFAULT false,
    account_locked_until timestamptz,

    -- Role and Permissions
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'team_lead', 'admin', 'super_admin')),
    subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team', 'enterprise')),

    -- Activity Tracking
    last_sign_in_at timestamptz,
    last_active_at timestamptz DEFAULT now(),
    sign_in_count integer DEFAULT 0,

    -- User Preferences (JSONB for flexibility)
    preferences jsonb DEFAULT '{}',

    -- Onboarding and UX
    onboarding_completed boolean DEFAULT false,
    onboarding_step text,
    feature_flags jsonb DEFAULT '{}',

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_full_name CHECK (length(trim(full_name)) >= 2)
);

-- =============================================
-- Security Audit Trail
-- =============================================

CREATE TABLE IF NOT EXISTS public.auth_security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Information
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email text, -- Store email for deleted users

    -- Event Details
    event_type text NOT NULL CHECK (event_type IN (
        'SIGN_IN_SUCCESS',
        'SIGN_IN_FAILURE',
        'SIGN_UP_SUCCESS',
        'SIGN_UP_FAILURE',
        'PASSWORD_RESET_REQUEST',
        'PASSWORD_RESET_SUCCESS',
        'PASSWORD_CHANGE',
        'EMAIL_VERIFICATION',
        'TWO_FACTOR_ENABLED',
        'TWO_FACTOR_DISABLED',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        'SOCIAL_AUTH_SUCCESS',
        'SOCIAL_AUTH_FAILURE',
        'MAGIC_LINK_SENT',
        'MAGIC_LINK_USED',
        'SUSPICIOUS_ACTIVITY'
    )),

    -- Request Context
    ip_address inet,
    user_agent text,
    request_id text,

    -- Security Details
    success boolean NOT NULL,
    failure_reason text,
    risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),

    -- Additional Metadata
    metadata jsonb DEFAULT '{}',

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,

    -- Indexes for performance
    INDEX (user_id, created_at DESC),
    INDEX (event_type, created_at DESC),
    INDEX (ip_address, created_at DESC),
    INDEX (success, created_at DESC)
);

-- =============================================
-- Device Trust Management
-- =============================================

CREATE TABLE IF NOT EXISTS public.trusted_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User and Device
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint text NOT NULL,
    device_name text,

    -- Trust Status
    trusted_at timestamptz DEFAULT now() NOT NULL,
    last_used_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz,
    revoked_at timestamptz,

    -- Device Information
    device_type text, -- 'desktop', 'mobile', 'tablet'
    browser text,
    operating_system text,

    -- Security
    trust_level integer DEFAULT 1 CHECK (trust_level >= 1 AND trust_level <= 5),

    -- Metadata
    metadata jsonb DEFAULT '{}',

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    UNIQUE (user_id, device_fingerprint),
    CHECK (expires_at IS NULL OR expires_at > trusted_at)
);

-- =============================================
-- Rate Limiting
-- =============================================

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Rate Limit Key (could be IP, user_id, or combination)
    limit_key text NOT NULL,
    limit_type text NOT NULL CHECK (limit_type IN (
        'SIGN_IN_ATTEMPTS',
        'SIGN_UP_ATTEMPTS',
        'PASSWORD_RESET_ATTEMPTS',
        'MAGIC_LINK_REQUESTS',
        'EMAIL_VERIFICATION_REQUESTS'
    )),

    -- Attempt Tracking
    attempt_count integer DEFAULT 0,
    last_attempt_at timestamptz DEFAULT now(),

    -- Rate Limit Configuration
    max_attempts integer NOT NULL,
    window_duration_minutes integer NOT NULL,

    -- Blocking
    blocked_until timestamptz,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints and Indexes
    UNIQUE (limit_key, limit_type),
    INDEX (limit_key, limit_type, last_attempt_at),
    INDEX (blocked_until) WHERE blocked_until IS NOT NULL
);

-- =============================================
-- Session Management (Enhanced)
-- =============================================

CREATE TABLE IF NOT EXISTS public.auth_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User and Session
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token text NOT NULL UNIQUE,

    -- Session Details
    expires_at timestamptz NOT NULL,
    last_activity_at timestamptz DEFAULT now(),

    -- Device and Context
    device_fingerprint text,
    ip_address inet,
    user_agent text,

    -- Session Type
    session_type text DEFAULT 'web' CHECK (session_type IN ('web', 'mobile', 'api', 'magic_link')),

    -- Security
    is_trusted_device boolean DEFAULT false,
    requires_two_factor boolean DEFAULT false,

    -- Metadata
    metadata jsonb DEFAULT '{}',

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    CHECK (expires_at > created_at),

    -- Indexes
    INDEX (user_id, last_activity_at DESC),
    INDEX (session_token),
    INDEX (expires_at),
    INDEX (device_fingerprint) WHERE device_fingerprint IS NOT NULL
);

-- =============================================
-- Magic Link Tokens
-- =============================================

CREATE TABLE IF NOT EXISTS public.magic_link_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Token Details
    token text NOT NULL UNIQUE,
    email text NOT NULL,

    -- User (may not exist yet for signups)
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Token Configuration
    token_type text NOT NULL CHECK (token_type IN ('SIGN_IN', 'SIGN_UP', 'PASSWORD_RESET')),
    expires_at timestamptz NOT NULL,

    -- Usage Tracking
    used_at timestamptz,
    used_by_ip inet,
    max_uses integer DEFAULT 1,
    use_count integer DEFAULT 0,

    -- Security
    revoked_at timestamptz,
    revoke_reason text,

    -- Metadata
    metadata jsonb DEFAULT '{}',

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    CHECK (expires_at > created_at),
    CHECK (use_count <= max_uses),
    CHECK (used_at IS NULL OR use_count > 0),

    -- Indexes
    INDEX (token),
    INDEX (email, created_at DESC),
    INDEX (expires_at),
    INDEX (user_id) WHERE user_id IS NOT NULL
);

-- =============================================
-- User Preferences and Settings
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Preference Categories
    category text NOT NULL CHECK (category IN (
        'THEME',
        'NOTIFICATIONS',
        'PRIVACY',
        'SECURITY',
        'ACCESSIBILITY',
        'LANGUAGE',
        'TIMEZONE'
    )),

    -- Preference Data
    preference_key text NOT NULL,
    preference_value jsonb NOT NULL,

    -- Metadata
    is_default boolean DEFAULT false,
    description text,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    UNIQUE (user_id, category, preference_key),

    -- Indexes
    INDEX (user_id, category),
    INDEX (preference_key)
);

-- =============================================
-- RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.enhanced_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Enhanced Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.enhanced_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.enhanced_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.enhanced_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Security Events Policies (Read-only for users, full access for admins)
CREATE POLICY "Users can view their own security events"
ON public.auth_security_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events"
ON public.auth_security_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.enhanced_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Trusted Devices Policies
CREATE POLICY "Users can manage their own trusted devices"
ON public.trusted_devices FOR ALL
USING (auth.uid() = user_id);

-- Session Policies
CREATE POLICY "Users can view their own sessions"
ON public.auth_sessions FOR SELECT
USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences FOR ALL
USING (auth.uid() = user_id);

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_enhanced_profiles_updated_at
    BEFORE UPDATE ON public.enhanced_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trusted_devices_updated_at
    BEFORE UPDATE ON public.trusted_devices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auth_rate_limits_updated_at
    BEFORE UPDATE ON public.auth_rate_limits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auth_sessions_updated_at
    BEFORE UPDATE ON public.auth_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id uuid,
    p_event_type text,
    p_success boolean,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
    event_id uuid;
BEGIN
    INSERT INTO public.auth_security_events (
        user_id, event_type, success, ip_address, user_agent, metadata
    ) VALUES (
        p_user_id, p_event_type, p_success, p_ip_address, p_user_agent, p_metadata
    ) RETURNING id INTO event_id;

    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_limit_key text,
    p_limit_type text,
    p_max_attempts integer DEFAULT 5,
    p_window_minutes integer DEFAULT 15
)
RETURNS jsonb AS $$
DECLARE
    current_attempts integer := 0;
    is_blocked boolean := false;
    reset_time timestamptz;
    rate_limit_record record;
BEGIN
    -- Get or create rate limit record
    SELECT * INTO rate_limit_record
    FROM public.auth_rate_limits
    WHERE limit_key = p_limit_key AND limit_type = p_limit_type;

    IF NOT FOUND THEN
        -- Create new rate limit record
        INSERT INTO public.auth_rate_limits (
            limit_key, limit_type, max_attempts, window_duration_minutes
        ) VALUES (
            p_limit_key, p_limit_type, p_max_attempts, p_window_minutes
        );
        current_attempts := 0;
    ELSE
        -- Check if we're in a new time window
        IF rate_limit_record.last_attempt_at < (now() - interval '1 minute' * p_window_minutes) THEN
            -- Reset attempts for new window
            UPDATE public.auth_rate_limits
            SET attempt_count = 0, blocked_until = NULL
            WHERE limit_key = p_limit_key AND limit_type = p_limit_type;
            current_attempts := 0;
        ELSE
            current_attempts := rate_limit_record.attempt_count;

            -- Check if currently blocked
            IF rate_limit_record.blocked_until IS NOT NULL AND rate_limit_record.blocked_until > now() THEN
                is_blocked := true;
            END IF;
        END IF;
    END IF;

    -- Calculate reset time
    reset_time := now() + interval '1 minute' * p_window_minutes;

    RETURN jsonb_build_object(
        'allowed', NOT is_blocked AND current_attempts < p_max_attempts,
        'attempts_remaining', GREATEST(0, p_max_attempts - current_attempts),
        'reset_time', reset_time,
        'blocked', is_blocked
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record rate limit attempt
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(
    p_limit_key text,
    p_limit_type text,
    p_max_attempts integer DEFAULT 5
)
RETURNS boolean AS $$
DECLARE
    new_count integer;
BEGIN
    -- Increment attempt count
    UPDATE public.auth_rate_limits
    SET
        attempt_count = attempt_count + 1,
        last_attempt_at = now(),
        blocked_until = CASE
            WHEN attempt_count + 1 >= p_max_attempts
            THEN now() + interval '1 hour'
            ELSE blocked_until
        END
    WHERE limit_key = p_limit_key AND limit_type = p_limit_type
    RETURNING attempt_count INTO new_count;

    RETURN new_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Views for Common Queries
-- =============================================

-- View for user profile with role information
CREATE OR REPLACE VIEW public.user_profiles_with_role AS
SELECT
    ep.*,
    CASE
        WHEN ep.role = 'super_admin' THEN 'super_admin'
        WHEN ep.role = 'admin' THEN 'admin'
        WHEN ep.role = 'team_lead' THEN 'team_lead'
        ELSE 'user'
    END as effective_role,
    CASE
        WHEN ep.account_locked THEN false
        WHEN ep.email_verified = false THEN false
        ELSE true
    END as can_sign_in
FROM public.enhanced_profiles ep;

-- View for recent security events
CREATE OR REPLACE VIEW public.recent_security_events AS
SELECT
    ase.*,
    ep.full_name,
    ep.role
FROM public.auth_security_events ase
LEFT JOIN public.enhanced_profiles ep ON ep.id = ase.user_id
WHERE ase.created_at > now() - interval '30 days'
ORDER BY ase.created_at DESC;

-- =============================================
-- Initial Data and Migration Support
-- =============================================

-- Function to migrate existing profiles
CREATE OR REPLACE FUNCTION public.migrate_existing_profiles()
RETURNS integer AS $$
DECLARE
    migrated_count integer := 0;
BEGIN
    -- Insert existing profiles into enhanced_profiles if they don't exist
    INSERT INTO public.enhanced_profiles (
        id, email, full_name, avatar_url, role, subscription_tier,
        onboarding_completed, created_at, updated_at
    )
    SELECT
        p.id,
        p.email,
        p.full_name,
        COALESCE(p.avatar_url, au.raw_user_meta_data->>'avatar_url'),
        COALESCE(p.role, 'user'),
        'free', -- Default subscription tier
        COALESCE(p.onboarding_completed, false),
        p.created_at,
        p.updated_at
    FROM public.profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.enhanced_profiles ep WHERE ep.id = p.id
    );

    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Grants and Permissions
-- =============================================

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE public.enhanced_profiles IS 'Enhanced user profiles with security and UX features';
COMMENT ON TABLE public.auth_security_events IS 'Audit trail for all authentication-related security events';
COMMENT ON TABLE public.trusted_devices IS 'Device trust management for enhanced security';
COMMENT ON TABLE public.auth_rate_limits IS 'Rate limiting to prevent abuse and attacks';
COMMENT ON TABLE public.auth_sessions IS 'Enhanced session management with security features';
COMMENT ON TABLE public.magic_link_tokens IS 'Magic link tokens for passwordless authentication';
COMMENT ON TABLE public.user_preferences IS 'User preferences and settings storage';

-- =============================================
-- Migration Complete
-- =============================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'BeProductive Enhanced Authentication Schema installed successfully';
    RAISE NOTICE 'Run SELECT public.migrate_existing_profiles(); to migrate existing data';
    RAISE NOTICE 'Schema version: 2.0.0';
END $$;