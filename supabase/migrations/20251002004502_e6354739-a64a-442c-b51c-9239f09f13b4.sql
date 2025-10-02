-- Enhanced batch position update function
CREATE OR REPLACE FUNCTION public.update_task_positions(task_updates JSONB[])
RETURNS VOID AS $$
DECLARE
  task_update JSONB;
BEGIN
  FOREACH task_update IN ARRAY task_updates
  LOOP
    UPDATE tasks
    SET
      position = (task_update->>'position')::INTEGER,
      status = COALESCE((task_update->>'status')::task_status, status),
      updated_at = NOW()
    WHERE id = (task_update->>'id')::UUID
    AND (
      created_by = auth.uid() OR
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to reorder tasks within same status
CREATE OR REPLACE FUNCTION public.reorder_tasks_in_status(
  workspace_id_param UUID,
  status_param task_status,
  task_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
  task_id UUID;
  position_counter INTEGER := 0;
BEGIN
  FOREACH task_id IN ARRAY task_ids
  LOOP
    UPDATE tasks
    SET
      position = position_counter,
      updated_at = NOW()
    WHERE id = task_id
      AND workspace_id = workspace_id_param
      AND status = status_param
      AND (
        created_by = auth.uid() OR
        workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
      );

    position_counter := position_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to move task to different status with position
CREATE OR REPLACE FUNCTION public.move_task_to_status(
  task_id_param UUID,
  new_status task_status,
  new_position INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET
    status = new_status,
    position = new_position,
    updated_at = NOW(),
    completed_at = CASE 
      WHEN new_status = 'done' THEN NOW()
      ELSE NULL
    END
  WHERE id = task_id_param
    AND (
      created_by = auth.uid() OR
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;