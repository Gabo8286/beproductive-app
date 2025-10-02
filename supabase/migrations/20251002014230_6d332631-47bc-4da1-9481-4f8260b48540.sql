-- TASK-032: Add task templates functionality

-- Create task_templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Template configuration (stores task structure and defaults)
  template_config JSONB NOT NULL DEFAULT '{}',
  
  -- Variable definitions for template customization
  variables JSONB DEFAULT '[]',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_templates
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_templates_workspace ON task_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_templates_created_by ON task_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_task_templates_public ON task_templates(is_public) WHERE is_public = TRUE;

-- RLS Policies for task_templates
CREATE POLICY "Users can view workspace templates"
  ON task_templates FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    OR is_public = TRUE
  );

CREATE POLICY "Users can create templates in their workspaces"
  ON task_templates FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own templates"
  ON task_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON task_templates FOR DELETE
  USING (created_by = auth.uid());

-- Function to replace template variables in text
CREATE OR REPLACE FUNCTION replace_template_variables(
  text_with_variables TEXT,
  variable_values JSONB
)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  var_key TEXT;
  var_value TEXT;
BEGIN
  IF text_with_variables IS NULL THEN
    RETURN NULL;
  END IF;
  
  result := text_with_variables;
  
  -- Replace each variable {{key}} with its value
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(variable_values)
  LOOP
    result := replace(result, '{{' || var_key || '}}', var_value);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create task from template
CREATE OR REPLACE FUNCTION create_task_from_template(
  template_id UUID,
  variable_values JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  config JSONB;
  new_task_id UUID;
  subtask_config JSONB;
  processed_title TEXT;
  processed_description TEXT;
  due_date_val TIMESTAMP WITH TIME ZONE;
  processed_tags TEXT[];
  tag_item TEXT;
BEGIN
  -- Get template
  SELECT * INTO template_record FROM task_templates WHERE id = template_id;
  IF template_record IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  config := template_record.template_config;
  
  -- Process variables in title and description
  processed_title := replace_template_variables(config->>'title', variable_values);
  processed_description := replace_template_variables(config->>'description', variable_values);
  
  -- Process tags (replace variables in each tag)
  IF config->'tags' IS NOT NULL THEN
    processed_tags := ARRAY(
      SELECT replace_template_variables(tag_item, variable_values)
      FROM jsonb_array_elements_text(config->'tags') AS tag_item
    );
  END IF;
  
  -- Calculate due date if offset is specified
  IF config->>'due_date_offset' IS NOT NULL THEN
    due_date_val := CURRENT_DATE + (config->>'due_date_offset')::INTEGER;
    
    -- Add time component if specified
    IF config->>'due_time' IS NOT NULL THEN
      due_date_val := due_date_val + (config->>'due_time')::TIME;
    END IF;
  END IF;
  
  -- Create main task
  INSERT INTO tasks (
    workspace_id,
    title,
    description,
    priority,
    tags,
    estimated_duration,
    due_date,
    created_by,
    status
  ) VALUES (
    template_record.workspace_id,
    processed_title,
    processed_description,
    COALESCE((config->>'priority')::task_priority, 'medium'),
    COALESCE(processed_tags, ARRAY[]::TEXT[]),
    (config->>'estimated_duration')::INTEGER,
    due_date_val,
    auth.uid(),
    'todo'
  ) RETURNING id INTO new_task_id;
  
  -- Create subtasks if defined
  IF config->'subtasks' IS NOT NULL THEN
    FOR subtask_config IN SELECT * FROM jsonb_array_elements(config->'subtasks')
    LOOP
      INSERT INTO tasks (
        workspace_id,
        title,
        description,
        priority,
        parent_task_id,
        created_by,
        status
      ) VALUES (
        template_record.workspace_id,
        replace_template_variables(subtask_config->>'title', variable_values),
        replace_template_variables(COALESCE(subtask_config->>'description', ''), variable_values),
        COALESCE((subtask_config->>'priority')::task_priority, 'medium'),
        new_task_id,
        auth.uid(),
        'todo'
      );
    END LOOP;
  END IF;
  
  -- Update usage count
  UPDATE task_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
  
  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();