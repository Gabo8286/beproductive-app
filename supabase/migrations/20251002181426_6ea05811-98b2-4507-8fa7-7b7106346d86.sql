-- Projects Module Database Schema (CORRECTED)
-- Fixed issues: owner_id instead of user_id, correct function name, profiles foreign keys

-- Create project status enum
CREATE TYPE project_status AS ENUM (
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
);

-- Create project priority enum
CREATE TYPE project_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create project visibility enum
CREATE TYPE project_visibility AS ENUM (
  'private',
  'workspace',
  'public'
);

-- Main projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  description text,
  status project_status DEFAULT 'planning' NOT NULL,
  priority project_priority DEFAULT 'medium' NOT NULL,
  visibility project_visibility DEFAULT 'workspace' NOT NULL,

  -- Ownership and assignment
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  project_manager uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Dates and timeline
  start_date date,
  target_date date,
  completed_at timestamptz,

  -- Organization
  tags text[] DEFAULT '{}',
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'folder',

  -- Progress tracking
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Budget and resources
  estimated_hours integer CHECK (estimated_hours >= 0),
  actual_hours integer DEFAULT 0 CHECK (actual_hours >= 0),
  budget_amount decimal(10,2) CHECK (budget_amount >= 0),

  -- Organization and sorting
  position integer DEFAULT 0,
  is_template boolean DEFAULT false,
  template_id uuid REFERENCES projects(id) ON DELETE SET NULL,

  -- Additional data
  metadata jsonb DEFAULT '{}',

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_dates CHECK (start_date IS NULL OR target_date IS NULL OR start_date <= target_date),
  CONSTRAINT template_self_reference CHECK (template_id != id)
);

-- Project members/collaborators table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'manager', 'member', 'viewer')),
  permissions jsonb DEFAULT '{"can_edit": false, "can_delete": false, "can_manage_members": false}',
  joined_at timestamptz DEFAULT now() NOT NULL,
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  UNIQUE(project_id, user_id)
);

-- Project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  description text,
  due_date date,
  completed_at timestamptz,
  position integer DEFAULT 0,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Project templates table
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  description text,
  category text DEFAULT 'general',
  template_data jsonb NOT NULL DEFAULT '{}',
  default_milestones jsonb DEFAULT '[]',
  default_tasks jsonb DEFAULT '[]',
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add project_id to existing tables
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (FIXED: owner_id instead of user_id)
CREATE POLICY "Users can view projects in their workspace" ON projects
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid() OR id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create projects in their workspace" ON projects
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid() OR id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'member')
      )
    )
  );

CREATE POLICY "Project members can update projects" ON projects
  FOR UPDATE USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Project owners can delete projects" ON projects
  FOR DELETE USING (
    created_by = auth.uid() OR
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for project_members (FIXED: owner_id)
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE workspace_id IN (
        SELECT id FROM workspaces
        WHERE owner_id = auth.uid() OR id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project managers can manage members" ON project_members
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- RLS Policies for project_milestones (FIXED: owner_id)
CREATE POLICY "Users can view project milestones" ON project_milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE workspace_id IN (
        SELECT id FROM workspaces
        WHERE owner_id = auth.uid() OR id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project members can manage milestones" ON project_milestones
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'member')
    )
  );

-- RLS Policies for project_templates
CREATE POLICY "Users can view public templates" ON project_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates" ON project_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON project_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" ON project_templates
  FOR DELETE USING (created_by = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, target_date);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(due_date);

CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_public ON project_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goals_project_id ON goals(project_id) WHERE project_id IS NOT NULL;

-- Create triggers (FIXED: correct function name)
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON project_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(project_id_param uuid)
RETURNS integer AS $$
DECLARE
  total_tasks integer := 0;
  completed_tasks integer := 0;
  progress_percent integer := 0;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'done')
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE project_id = project_id_param;

  IF total_tasks > 0 THEN
    progress_percent := ROUND((completed_tasks::decimal / total_tasks::decimal) * 100);
  END IF;

  UPDATE projects
  SET
    progress_percentage = progress_percent,
    updated_at = now()
  WHERE id = project_id_param;

  RETURN progress_percent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update progress
CREATE OR REPLACE FUNCTION update_project_progress_on_task_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.project_id IS NOT NULL THEN
      PERFORM calculate_project_progress(NEW.project_id);
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.project_id IS NOT NULL AND OLD.project_id != NEW.project_id THEN
      PERFORM calculate_project_progress(OLD.project_id);
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.project_id IS NOT NULL THEN
      PERFORM calculate_project_progress(OLD.project_id);
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update project progress
CREATE TRIGGER project_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_on_task_change();

-- Insert default templates
INSERT INTO project_templates (title, description, category, template_data, default_milestones, is_public) VALUES
('Basic Project', 'Simple project template for general use', 'general',
 '{"estimated_hours": 40, "default_priority": "medium"}',
 '[{"title": "Project Planning", "position": 1}, {"title": "Execution Phase", "position": 2}, {"title": "Review & Completion", "position": 3}]',
 true),

('Software Development', 'Template for software development projects', 'development',
 '{"estimated_hours": 160, "default_priority": "high"}',
 '[{"title": "Requirements Analysis", "position": 1}, {"title": "Design & Architecture", "position": 2}, {"title": "Development", "position": 3}, {"title": "Testing", "position": 4}, {"title": "Deployment", "position": 5}]',
 true),

('Marketing Campaign', 'Template for marketing and promotional campaigns', 'marketing',
 '{"estimated_hours": 80, "default_priority": "medium"}',
 '[{"title": "Campaign Strategy", "position": 1}, {"title": "Content Creation", "position": 2}, {"title": "Launch Preparation", "position": 3}, {"title": "Campaign Execution", "position": 4}, {"title": "Analysis & Reporting", "position": 5}]',
 true),

('Research Project', 'Template for research and analysis projects', 'research',
 '{"estimated_hours": 120, "default_priority": "medium"}',
 '[{"title": "Literature Review", "position": 1}, {"title": "Data Collection", "position": 2}, {"title": "Analysis", "position": 3}, {"title": "Report Writing", "position": 4}]',
 true)

ON CONFLICT DO NOTHING;