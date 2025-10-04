-- Enhanced Team Collaboration System
-- Builds upon existing workspace/member/task structure with additional features

-- Create additional enums for team features
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE team_activity_type AS ENUM (
  'task_created', 'task_updated', 'task_completed', 'task_assigned',
  'goal_created', 'goal_updated', 'goal_completed',
  'member_joined', 'member_left', 'member_role_changed',
  'workspace_updated', 'comment_added', 'file_uploaded'
);
CREATE TYPE notification_type AS ENUM (
  'task_assigned', 'task_due', 'goal_deadline', 'mention',
  'team_invitation', 'role_changed', 'workspace_update'
);

-- Team invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member' NOT NULL,
  status invitation_status DEFAULT 'pending' NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(workspace_id, email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Team activity feed
CREATE TABLE public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type team_activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Team notifications
CREATE TABLE public.team_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Task comments for team collaboration
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Task watchers for notifications
CREATE TABLE public.task_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(task_id, user_id)
);

-- Goal collaborators for shared goals
CREATE TABLE public.goal_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator', 'viewer')),
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(goal_id, user_id)
);

-- Team templates for reusable workflows
CREATE TABLE public.team_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('task', 'goal', 'workflow')),
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workspace integrations for external tools
CREATE TABLE public.workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(workspace_id, integration_type)
);

-- Enable Row Level Security
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Team Invitations: Workspace admins and invitees can access
CREATE POLICY "Workspace admins can manage invitations" ON public.team_invitations
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Invitees can view their invitations" ON public.team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Team Activities: Workspace members can view
CREATE POLICY "Workspace members can view activities" ON public.team_activities
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create activities" ON public.team_activities
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Team Notifications: Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON public.team_notifications
  FOR ALL USING (user_id = auth.uid());

-- Task Comments: Workspace members can access
CREATE POLICY "Workspace members can view task comments" ON public.task_comments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN workspaces w ON t.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT t.id FROM tasks t
      JOIN workspace_members wm ON t.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create task comments" ON public.task_comments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN workspaces w ON t.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT t.id FROM tasks t
      JOIN workspace_members wm ON t.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own comments" ON public.task_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Task Watchers: Users can manage their own watchers
CREATE POLICY "Users can manage task watchers" ON public.task_watchers
  FOR ALL USING (user_id = auth.uid());

-- Goal Collaborators: Goal owners and collaborators can access
CREATE POLICY "Goal collaborators can be managed" ON public.goal_collaborators
  FOR ALL USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
      UNION
      SELECT goal_id FROM goal_collaborators WHERE user_id = auth.uid()
    )
  );

-- Team Templates: Workspace members can access
CREATE POLICY "Workspace members can view templates" ON public.team_templates
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    OR is_public = TRUE
  );

CREATE POLICY "Workspace members can create templates" ON public.team_templates
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Template creators can update" ON public.team_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Workspace Integrations: Workspace admins only
CREATE POLICY "Workspace admins can manage integrations" ON public.workspace_integrations
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_team_invitations_workspace_id ON public.team_invitations(workspace_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);
CREATE INDEX idx_team_invitations_expires_at ON public.team_invitations(expires_at);

CREATE INDEX idx_team_activities_workspace_id ON public.team_activities(workspace_id);
CREATE INDEX idx_team_activities_user_id ON public.team_activities(user_id);
CREATE INDEX idx_team_activities_type ON public.team_activities(activity_type);
CREATE INDEX idx_team_activities_created_at ON public.team_activities(created_at DESC);
CREATE INDEX idx_team_activities_task_id ON public.team_activities(related_task_id);
CREATE INDEX idx_team_activities_goal_id ON public.team_activities(related_goal_id);

CREATE INDEX idx_team_notifications_user_id ON public.team_notifications(user_id);
CREATE INDEX idx_team_notifications_workspace_id ON public.team_notifications(workspace_id);
CREATE INDEX idx_team_notifications_is_read ON public.team_notifications(is_read);
CREATE INDEX idx_team_notifications_created_at ON public.team_notifications(created_at DESC);

CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX idx_task_comments_created_at ON public.task_comments(created_at DESC);

CREATE INDEX idx_task_watchers_task_id ON public.task_watchers(task_id);
CREATE INDEX idx_task_watchers_user_id ON public.task_watchers(user_id);

CREATE INDEX idx_goal_collaborators_goal_id ON public.goal_collaborators(goal_id);
CREATE INDEX idx_goal_collaborators_user_id ON public.goal_collaborators(user_id);

CREATE INDEX idx_team_templates_workspace_id ON public.team_templates(workspace_id);
CREATE INDEX idx_team_templates_type ON public.team_templates(template_type);
CREATE INDEX idx_team_templates_public ON public.team_templates(is_public);
CREATE INDEX idx_team_templates_created_by ON public.team_templates(created_by);

CREATE INDEX idx_workspace_integrations_workspace_id ON public.workspace_integrations(workspace_id);
CREATE INDEX idx_workspace_integrations_type ON public.workspace_integrations(integration_type);
CREATE INDEX idx_workspace_integrations_active ON public.workspace_integrations(is_active);

-- Add triggers for updated_at
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_team_templates_updated_at
  BEFORE UPDATE ON public.team_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workspace_integrations_updated_at
  BEFORE UPDATE ON public.workspace_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enhanced team collaboration functions

-- Function to invite team member
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_workspace_id UUID,
  p_email TEXT,
  p_role member_role DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_id UUID;
  workspace_exists BOOLEAN;
  user_has_permission BOOLEAN;
BEGIN
  -- Check if workspace exists and user has permission
  SELECT EXISTS (
    SELECT 1 FROM workspaces w
    LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE w.id = p_workspace_id
    AND (w.owner_id = auth.uid() OR (wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')))
  ) INTO user_has_permission;

  IF NOT user_has_permission THEN
    RAISE EXCEPTION 'Permission denied: You must be a workspace owner or admin to invite members';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN profiles p ON wm.user_id = p.id
    WHERE wm.workspace_id = p_workspace_id AND p.email = p_email
  ) THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
  END IF;

  -- Check if there's already a pending invitation
  IF EXISTS (
    SELECT 1 FROM team_invitations
    WHERE workspace_id = p_workspace_id
    AND email = p_email
    AND status = 'pending'
    AND expires_at > NOW()
  ) THEN
    RAISE EXCEPTION 'Pending invitation already exists for this email';
  END IF;

  -- Create invitation
  INSERT INTO team_invitations (workspace_id, email, invited_by, role)
  VALUES (p_workspace_id, p_email, auth.uid(), p_role)
  RETURNING id INTO invitation_id;

  -- Log activity
  INSERT INTO team_activities (workspace_id, user_id, activity_type, title, metadata)
  VALUES (
    p_workspace_id,
    auth.uid(),
    'member_joined',
    'Team member invited',
    jsonb_build_object('email', p_email, 'role', p_role)
  );

  RETURN invitation_id;
END;
$$;

-- Function to accept team invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM profiles WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Get invitation
  SELECT * INTO invitation_record
  FROM team_invitations
  WHERE token = p_token
  AND email = user_email
  AND status = 'pending'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  -- Add user to workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (invitation_record.workspace_id, auth.uid(), invitation_record.role);

  -- Update invitation status
  UPDATE team_invitations
  SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
  WHERE id = invitation_record.id;

  -- Log activity
  INSERT INTO team_activities (workspace_id, user_id, activity_type, title, metadata)
  VALUES (
    invitation_record.workspace_id,
    auth.uid(),
    'member_joined',
    'Team member joined',
    jsonb_build_object('role', invitation_record.role)
  );

  -- Create welcome notification
  INSERT INTO team_notifications (user_id, workspace_id, notification_type, title, message)
  VALUES (
    auth.uid(),
    invitation_record.workspace_id,
    'workspace_update',
    'Welcome to the team!',
    'You have successfully joined the workspace.'
  );
END;
$$;

-- Function to assign task
CREATE OR REPLACE FUNCTION public.assign_task(
  p_task_id UUID,
  p_assignee_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_record RECORD;
  workspace_has_member BOOLEAN;
BEGIN
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = p_task_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  -- Check if assignee is a workspace member
  SELECT EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = task_record.workspace_id
    AND wm.user_id = p_assignee_id
    UNION
    SELECT 1 FROM workspaces w
    WHERE w.id = task_record.workspace_id
    AND w.owner_id = p_assignee_id
  ) INTO workspace_has_member;

  IF NOT workspace_has_member THEN
    RAISE EXCEPTION 'Cannot assign task to user who is not a workspace member';
  END IF;

  -- Update task
  UPDATE tasks
  SET assigned_to = p_assignee_id, updated_at = NOW()
  WHERE id = p_task_id;

  -- Log activity
  INSERT INTO team_activities (workspace_id, user_id, activity_type, title, related_task_id, metadata)
  VALUES (
    task_record.workspace_id,
    auth.uid(),
    'task_assigned',
    'Task assigned',
    p_task_id,
    jsonb_build_object('assignee_id', p_assignee_id, 'task_title', task_record.title)
  );

  -- Create notification for assignee
  IF p_assignee_id != auth.uid() THEN
    INSERT INTO team_notifications (user_id, workspace_id, notification_type, title, message, related_task_id)
    VALUES (
      p_assignee_id,
      task_record.workspace_id,
      'task_assigned',
      'Task assigned to you',
      'You have been assigned the task: ' || task_record.title,
      p_task_id
    );
  END IF;

  -- Add assignee as watcher
  INSERT INTO task_watchers (task_id, user_id)
  VALUES (p_task_id, p_assignee_id)
  ON CONFLICT (task_id, user_id) DO NOTHING;
END;
$$;

-- Function to add task comment
CREATE OR REPLACE FUNCTION public.add_task_comment(
  p_task_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_id UUID;
  task_record RECORD;
  watcher_record RECORD;
BEGIN
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = p_task_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  -- Add comment
  INSERT INTO task_comments (task_id, user_id, content)
  VALUES (p_task_id, auth.uid(), p_content)
  RETURNING id INTO comment_id;

  -- Log activity
  INSERT INTO team_activities (workspace_id, user_id, activity_type, title, related_task_id, metadata)
  VALUES (
    task_record.workspace_id,
    auth.uid(),
    'comment_added',
    'Comment added to task',
    p_task_id,
    jsonb_build_object('task_title', task_record.title)
  );

  -- Notify watchers
  FOR watcher_record IN
    SELECT DISTINCT user_id FROM task_watchers
    WHERE task_id = p_task_id AND user_id != auth.uid()
  LOOP
    INSERT INTO team_notifications (user_id, workspace_id, notification_type, title, message, related_task_id)
    VALUES (
      watcher_record.user_id,
      task_record.workspace_id,
      'mention',
      'New comment on task',
      'A comment was added to task: ' || task_record.title,
      p_task_id
    );
  END LOOP;

  RETURN comment_id;
END;
$$;

-- Function to get team analytics
CREATE OR REPLACE FUNCTION public.get_team_analytics(
  p_workspace_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  start_date := NOW() - (p_days || ' days')::INTERVAL;

  -- Check permission
  IF NOT EXISTS (
    SELECT 1 FROM workspaces w
    LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE w.id = p_workspace_id
    AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  WITH task_stats AS (
    SELECT
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') as overdue_tasks,
      ROUND(AVG(actual_duration)) as avg_completion_time
    FROM tasks
    WHERE workspace_id = p_workspace_id
    AND created_at >= start_date
  ),
  member_stats AS (
    SELECT COUNT(*) as member_count
    FROM workspace_members
    WHERE workspace_id = p_workspace_id
  ),
  activity_stats AS (
    SELECT
      COUNT(*) as total_activities,
      COUNT(DISTINCT user_id) as active_members
    FROM team_activities
    WHERE workspace_id = p_workspace_id
    AND created_at >= start_date
  )
  SELECT jsonb_build_object(
    'task_stats', row_to_json(task_stats.*),
    'member_stats', row_to_json(member_stats.*),
    'activity_stats', row_to_json(activity_stats.*),
    'period_days', p_days
  ) INTO result
  FROM task_stats, member_stats, activity_stats;

  RETURN result;
END;
$$;

-- Function to clean up expired invitations (to be run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE team_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RETURN expired_count;
END;
$$;