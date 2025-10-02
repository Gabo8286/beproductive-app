-- Create quick_todos table for Travel Notes
CREATE TABLE IF NOT EXISTS quick_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quick_todos ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_todos_workspace_id ON quick_todos(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quick_todos_created_by ON quick_todos(created_by);
CREATE INDEX IF NOT EXISTS idx_quick_todos_completed_at ON quick_todos(completed_at);
CREATE INDEX IF NOT EXISTS idx_quick_todos_position ON quick_todos(position);

-- RLS Policies

-- Users can view quick_todos in their workspaces
CREATE POLICY "Users can view workspace quick_todos"
  ON quick_todos FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create quick_todos in their workspaces
CREATE POLICY "Users can create quick_todos in their workspaces"
  ON quick_todos FOR INSERT
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

-- Users can update quick_todos in their workspaces
CREATE POLICY "Users can update quick_todos in their workspaces"
  ON quick_todos FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own quick_todos
CREATE POLICY "Users can delete their own quick_todos"
  ON quick_todos FOR DELETE
  USING (created_by = auth.uid());

-- Utility Functions

-- Function to toggle quick todo completion
CREATE OR REPLACE FUNCTION toggle_quick_todo_completion(quick_todo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE quick_todos
  SET completed_at = CASE
    WHEN completed_at IS NULL THEN NOW()
    ELSE NULL
  END,
  updated_at = NOW()
  WHERE id = quick_todo_id;
END;
$$;

-- Function to update quick todo position
CREATE OR REPLACE FUNCTION update_quick_todo_position(
  quick_todo_id UUID,
  new_position INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE quick_todos
  SET position = new_position,
      updated_at = NOW()
  WHERE id = quick_todo_id;
END;
$$;

-- Function to clear completed quick todos
CREATE OR REPLACE FUNCTION clear_completed_quick_todos(workspace_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM quick_todos
  WHERE workspace_id = workspace_uuid
    AND completed_at IS NOT NULL
    AND created_by = auth.uid();
END;
$$;

-- Add trigger for quick_todos updated_at
CREATE TRIGGER update_quick_todos_updated_at
  BEFORE UPDATE ON quick_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();