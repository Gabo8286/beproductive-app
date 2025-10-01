-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'team_lead', 'admin', 'super_admin');
CREATE TYPE workspace_type AS ENUM ('personal', 'team', 'organization');
CREATE TYPE member_role AS ENUM ('member', 'admin', 'owner');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Add role column as enum (keep old text role for now)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_enum user_role DEFAULT 'user';

-- Convert existing role values to enum
UPDATE profiles SET role_enum = 
  CASE 
    WHEN role = 'individual' THEN 'user'::user_role
    WHEN role = 'team_lead' THEN 'team_lead'::user_role
    WHEN role = 'admin' THEN 'admin'::user_role
    WHEN role = 'enterprise' THEN 'super_admin'::user_role
    ELSE 'user'::user_role
  END;

-- Drop old role column and rename new one
ALTER TABLE profiles DROP COLUMN role;
ALTER TABLE profiles RENAME COLUMN role_enum TO role;

-- Update workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS type workspace_type DEFAULT 'personal';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Update workspace_members table
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS role_enum member_role DEFAULT 'member';

-- Convert existing role values
UPDATE workspace_members SET role_enum = role::member_role;

-- Drop old role and rename
ALTER TABLE workspace_members DROP COLUMN role;
ALTER TABLE workspace_members RENAME COLUMN role_enum TO role;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  position INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view workspace tasks"
  ON tasks FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their workspaces"
  ON tasks FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update tasks in their workspaces"
  ON tasks FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (created_by = auth.uid());

-- Function to create default workspace for new users
CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspaces (name, owner_id, type)
  VALUES ('Personal', NEW.id, 'personal');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create default workspace
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE PROCEDURE create_default_workspace();

-- Function to update task position
CREATE OR REPLACE FUNCTION update_task_position(
  task_id UUID,
  new_position INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET position = new_position,
      updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark task as completed
CREATE OR REPLACE FUNCTION complete_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET status = 'done',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for tasks updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update handle_new_user to use new subscription_tier field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  );
  RETURN NEW;
END;
$$;