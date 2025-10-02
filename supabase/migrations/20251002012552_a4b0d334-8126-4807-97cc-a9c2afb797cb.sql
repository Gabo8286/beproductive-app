-- TASK-030: Add subtask hierarchy and progress tracking

-- Add hierarchy level tracking column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 0;

-- Function to calculate task hierarchy level (depth in tree)
CREATE OR REPLACE FUNCTION calculate_hierarchy_level(task_id UUID)
RETURNS INTEGER AS $$
DECLARE
  level_count INTEGER := 0;
  current_parent UUID;
BEGIN
  SELECT parent_task_id INTO current_parent FROM tasks WHERE id = task_id;
  
  WHILE current_parent IS NOT NULL LOOP
    level_count := level_count + 1;
    SELECT parent_task_id INTO current_parent FROM tasks WHERE id = current_parent;
    
    -- Prevent infinite loops (max 10 levels)
    IF level_count > 10 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN level_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update parent task progress based on subtasks
CREATE OR REPLACE FUNCTION update_parent_progress()
RETURNS TRIGGER AS $$
DECLARE
  parent_id UUID;
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
  completion_percentage DECIMAL;
BEGIN
  -- Get parent task ID from NEW or OLD record
  parent_id := COALESCE(NEW.parent_task_id, OLD.parent_task_id);
  
  IF parent_id IS NOT NULL THEN
    -- Count total and completed subtasks
    SELECT COUNT(*) INTO total_subtasks
    FROM tasks WHERE parent_task_id = parent_id AND deleted_at IS NULL;
    
    SELECT COUNT(*) INTO completed_subtasks
    FROM tasks WHERE parent_task_id = parent_id AND status = 'done' AND deleted_at IS NULL;
    
    -- Calculate completion percentage
    IF total_subtasks > 0 THEN
      completion_percentage := ROUND((completed_subtasks::DECIMAL / total_subtasks::DECIMAL) * 100, 2);
      
      -- Update parent task metadata with subtask progress
      UPDATE tasks
      SET 
        metadata = COALESCE(metadata, '{}') || jsonb_build_object(
          'subtask_progress', jsonb_build_object(
            'total', total_subtasks,
            'completed', completed_subtasks,
            'percentage', completion_percentage
          )
        ),
        updated_at = NOW()
      WHERE id = parent_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic parent progress updates
DROP TRIGGER IF EXISTS update_parent_progress_trigger ON tasks;
CREATE TRIGGER update_parent_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_parent_progress();

-- Trigger to automatically update hierarchy_level when parent changes
CREATE OR REPLACE FUNCTION update_hierarchy_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hierarchy_level := calculate_hierarchy_level(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_hierarchy_level_trigger ON tasks;
CREATE TRIGGER update_hierarchy_level_trigger
  BEFORE INSERT OR UPDATE OF parent_task_id ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_hierarchy_level();

-- Update hierarchy levels for existing tasks
UPDATE tasks SET hierarchy_level = calculate_hierarchy_level(id) WHERE parent_task_id IS NOT NULL;

-- Add index for better hierarchy query performance
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;