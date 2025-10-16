-- Step-by-Step Super Admin Setup
-- Run each section separately in order

-- =====================================================
-- STEP 1: Create Basic Tables First (Run this first)
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

-- Create basic policies for beta_signups
DROP POLICY IF EXISTS "Anyone can create beta signups" ON public.beta_signups;
DROP POLICY IF EXISTS "Authenticated users can view beta signups" ON public.beta_signups;

CREATE POLICY "Anyone can create beta signups" ON public.beta_signups
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view beta signups" ON public.beta_signups
    FOR SELECT
    TO authenticated
    USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);

-- Create enum for status
DO $$ BEGIN
    CREATE TYPE public.beta_signup_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to beta_signups
ALTER TABLE public.beta_signups
  ADD COLUMN IF NOT EXISTS status public.beta_signup_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create beta_invitations table
CREATE TABLE IF NOT EXISTS public.beta_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beta_signup_id UUID NOT NULL REFERENCES public.beta_signups(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL DEFAULT 'invitation',
    language_code TEXT NOT NULL DEFAULT 'en',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    email_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on beta_invitations
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;

-- Create basic policy for beta_invitations (we'll update this later)
CREATE POLICY "Authenticated users can manage invitations" ON public.beta_invitations
    FOR ALL
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX IF NOT EXISTS idx_beta_signups_invitation_token ON public.beta_signups(invitation_token);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_beta_signup_id ON public.beta_invitations(beta_signup_id);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_email_type ON public.beta_invitations(email_type);

SELECT 'Step 1 Complete: Tables created successfully!' as result;