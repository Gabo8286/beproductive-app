-- ============================================================================
-- CRITICAL SECURITY FIXES - BeProductive v2
-- ============================================================================

-- Fix 1: CREATE SECURITY DEFINER FUNCTION TO PREVENT RLS RECURSION
-- This prevents infinite recursion in project_members RLS policies
CREATE OR REPLACE FUNCTION public.is_project_manager(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = _project_id
      AND user_id = _user_id
      AND role IN ('owner', 'manager')
  )
$$;

-- Fix 2: UPDATE ACHIEVEMENTS TABLE RLS - REMOVE PUBLIC ACCESS
-- Prevents attackers from reverse-engineering gamification system
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;

CREATE POLICY "Authenticated users can view achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- Fix 3: UPDATE PROJECT_TEMPLATES TABLE RLS - RESTRICT PUBLIC ACCESS
-- Protects proprietary templates from being stolen
DROP POLICY IF EXISTS "Anyone can view public templates" ON public.project_templates;

CREATE POLICY "Users can view accessible templates"
ON public.project_templates
FOR SELECT
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
);

-- Fix 4: FIX FUNCTION SEARCH PATHS FOR SECURITY
-- Prevents search_path manipulation attacks
ALTER FUNCTION public.calculate_next_occurrence SET search_path TO 'public';
ALTER FUNCTION public.calculate_next_occurrence_from_date SET search_path TO 'public';

-- Fix 5: UPDATE PROJECT_MEMBERS RLS POLICIES TO USE SECURITY DEFINER
-- Replaces recursive policies with safe security definer function
DROP POLICY IF EXISTS "Project managers can manage members" ON public.project_members;

CREATE POLICY "Project managers can manage members"
ON public.project_members
FOR ALL
TO authenticated
USING (public.is_project_manager(auth.uid(), project_id))
WITH CHECK (public.is_project_manager(auth.uid(), project_id));

-- ============================================================================
-- SECURITY FIXES COMPLETE
-- ✅ Fixed: Infinite recursion in project_members
-- ✅ Fixed: Public access to achievements table
-- ✅ Fixed: Public access to project_templates
-- ✅ Fixed: Function search_path vulnerabilities
-- ============================================================================