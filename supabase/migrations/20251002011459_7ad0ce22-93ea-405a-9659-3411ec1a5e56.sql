-- Fix RLS infinite recursion between workspaces and workspace_members
-- Drop existing recursive policies that cause infinite recursion
DROP POLICY IF EXISTS "Workspace members can view" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can view membership" ON workspace_members;

-- Create security definer function to check workspace ownership
-- This function bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND owner_id = _user_id
  )
$$;

-- Create security definer function to check workspace membership
-- This function bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
  )
$$;

-- Create new non-recursive RLS policies for workspaces
CREATE POLICY "Users can view owned workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view member workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), id));

-- Workspace owners can manage their workspaces
DROP POLICY IF EXISTS "Workspace owners can manage" ON workspaces;
CREATE POLICY "Workspace owners can manage"
ON public.workspaces
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Create new non-recursive RLS policies for workspace_members
CREATE POLICY "Users can view own membership"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Workspace owners can view memberships"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "Workspace owners can manage memberships"
ON public.workspace_members
FOR ALL
TO authenticated
USING (public.is_workspace_owner(auth.uid(), workspace_id))
WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));

-- Fix the create_default_workspace function to add owner as member
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid;
BEGIN
  -- Create the workspace
  INSERT INTO workspaces (name, owner_id, type)
  VALUES ('Personal', NEW.id, 'personal')
  RETURNING id INTO new_workspace_id;
  
  -- Add the owner as a workspace member with owner role
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Migrate existing workspaces: add owners as members if they're not already
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT w.id, w.owner_id, 'owner'::member_role
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1
  FROM workspace_members wm
  WHERE wm.workspace_id = w.id
    AND wm.user_id = w.owner_id
)
ON CONFLICT DO NOTHING;