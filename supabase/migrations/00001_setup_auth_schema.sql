-- Setup basic auth schema for local development
-- This mimics Supabase's auth schema without GoTrue dependency

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create basic users table (simplified version of auth.users)
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    encrypted_password text,
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token text,
    confirmation_sent_at timestamptz,
    recovery_token text,
    recovery_sent_at timestamptz,
    email_change_token_new text,
    email_change text,
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    phone text,
    phone_confirmed_at timestamptz,
    phone_change text,
    phone_change_token text,
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz GENERATED ALWAYS AS (COALESCE(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current text DEFAULT '',
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamptz,
    reauthentication_token text,
    reauthentication_sent_at timestamptz,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON auth.users (phone);
CREATE INDEX IF NOT EXISTS users_confirmation_token_idx ON auth.users (confirmation_token);

-- Create public schema tables needed for profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- Enable RLS on public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user ID (simplified)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
        SELECT current_setting('request.jwt.claim.sub', true)::uuid;
    $$;

-- Create a function to simulate auth.role()
CREATE OR REPLACE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
        SELECT current_setting('request.jwt.claim.role', true)::text;
    $$;

-- Basic RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Basic RLS policies for workspaces
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = id AND user_id = auth.uid()
        )
    );

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, service_role;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- Select permissions for anon and authenticated roles
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;