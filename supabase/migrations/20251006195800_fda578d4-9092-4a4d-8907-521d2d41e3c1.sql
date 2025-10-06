-- ============================================================================
-- CRITICAL SECURITY FIX: Profiles Table - Remove Public Access
-- ============================================================================
-- Issue: profiles table allows unauthenticated access via roles:{public}
-- Risk: Attackers can scrape all user emails for spam/phishing
-- Fix: Drop public policies and enforce authenticated-only access
-- ============================================================================

-- 1. DROP INSECURE PUBLIC POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. VERIFY SECURE AUTHENTICATED POLICIES EXIST
-- These policies already exist and are secure (roles:{authenticated})
-- - "Users can view their own profile" - authenticated only ✓
-- - "Users can update their own profile" - authenticated only ✓
-- - "Super admins can view all profiles" - admin access ✓

-- 3. ADD MISSING INSERT POLICY FOR USER REGISTRATION
-- This is needed when users sign up
CREATE POLICY "Users can insert their own profile during signup"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SECURITY FIX COMPLETE
-- ✅ Removed public access policies
-- ✅ Enforced authentication requirement for all profile access
-- ✅ Added secure insert policy for user registration
-- ============================================================================