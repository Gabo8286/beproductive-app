-- TASK-031: Add recurring task functionality

-- Add recurrence fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_template_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instance_date DATE;

-- Create indexes for recurring task queries
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_template_id ON tasks(recurring_template_id) WHERE recurring_template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_instance_date ON tasks(instance_date) WHERE instance_date IS NOT NULL;

-- Function to calculate next occurrence date from a given date
CREATE OR REPLACE FUNCTION calculate_next_occurrence_from_date(
  from_date DATE,
  pattern JSONB
)
RETURNS DATE AS $$
DECLARE
  frequency TEXT;
  interval_val INTEGER;
  next_date DATE;
  days_of_week INTEGER[];
  target_day INTEGER;
BEGIN
  frequency := pattern->>'frequency';
  interval_val := COALESCE((pattern->>'interval')::INTEGER, 1);
  
  CASE frequency
    WHEN 'daily' THEN
      next_date := from_date + (interval_val || ' days')::INTERVAL;
      
    WHEN 'weekly' THEN
      -- Handle days of week for weekly recurrence
      days_of_week := ARRAY(SELECT jsonb_array_elements_text(pattern->'days_of_week')::INTEGER);
      
      IF days_of_week IS NOT NULL AND array_length(days_of_week, 1) > 0 THEN
        -- Find next matching day of week
        next_date := from_date + 1;
        WHILE NOT (EXTRACT(DOW FROM next_date)::INTEGER = ANY(days_of_week)) LOOP
          next_date := next_date + 1;
          -- If we've gone more than 7 days, add the interval weeks
          IF next_date > from_date + 7 THEN
            next_date := from_date + (interval_val * 7 || ' days')::INTERVAL;
            EXIT;
          END IF;
        END LOOP;
      ELSE
        next_date := from_date + (interval_val * 7 || ' days')::INTERVAL;
      END IF;
      
    WHEN 'monthly' THEN
      target_day := (pattern->>'day_of_month')::INTEGER;
      IF target_day IS NOT NULL THEN
        next_date := (from_date + (interval_val || ' months')::INTERVAL)::DATE;
        -- Set to specific day of month
        next_date := DATE_TRUNC('month', next_date) + (target_day - 1 || ' days')::INTERVAL;
      ELSE
        next_date := from_date + (interval_val || ' months')::INTERVAL;
      END IF;
      
    WHEN 'yearly' THEN
      next_date := from_date + (interval_val || ' years')::INTERVAL;
      
    ELSE
      next_date := NULL;
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate next occurrence for a template
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  template_id UUID,
  pattern JSONB
)
RETURNS DATE AS $$
DECLARE
  last_instance_date DATE;
  template_created_date DATE;
BEGIN
  -- Get the last generated instance date
  SELECT MAX(instance_date) INTO last_instance_date
  FROM tasks
  WHERE recurring_template_id = template_id;
  
  -- If no instances exist, start from template creation date
  IF last_instance_date IS NULL THEN
    SELECT created_at::DATE INTO template_created_date
    FROM tasks WHERE id = template_id;
    RETURN calculate_next_occurrence_from_date(template_created_date, pattern);
  END IF;
  
  RETURN calculate_next_occurrence_from_date(last_instance_date, pattern);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate recurring task instances (called by cron or manually)
CREATE OR REPLACE FUNCTION generate_recurring_instances()
RETURNS TABLE(
  template_id UUID,
  instances_created INTEGER
) AS $$
DECLARE
  recurring_task RECORD;
  pattern JSONB;
  next_date DATE;
  end_date DATE;
  max_occurrences INTEGER;
  current_count INTEGER;
  instances_generated INTEGER;
  new_instance_id UUID;
BEGIN
  -- Get all recurring templates that need instance generation
  FOR recurring_task IN
    SELECT * FROM tasks
    WHERE is_recurring = TRUE
    AND recurring_template_id IS NULL
    AND deleted_at IS NULL
  LOOP
    instances_generated := 0;
    pattern := recurring_task.recurrence_pattern;
    
    -- Skip if no pattern defined
    IF pattern IS NULL THEN
      CONTINUE;
    END IF;
    
    end_date := (pattern->>'end_date')::DATE;
    max_occurrences := (pattern->>'max_occurrences')::INTEGER;
    
    -- Count existing instances
    SELECT COUNT(*) INTO current_count
    FROM tasks
    WHERE recurring_template_id = recurring_task.id
    AND deleted_at IS NULL;
    
    -- Check if we should continue generating
    IF (max_occurrences IS NOT NULL AND current_count >= max_occurrences) OR
       (end_date IS NOT NULL AND CURRENT_DATE > end_date) THEN
      CONTINUE;
    END IF;
    
    -- Calculate next occurrence date
    next_date := calculate_next_occurrence(recurring_task.id, pattern);
    
    -- Generate instances up to 30 days ahead
    WHILE next_date IS NOT NULL AND
          next_date <= CURRENT_DATE + INTERVAL '30 days' AND
          (end_date IS NULL OR next_date <= end_date) AND
          (max_occurrences IS NULL OR current_count < max_occurrences) LOOP
      
      -- Check if instance already exists for this date
      IF NOT EXISTS (
        SELECT 1 FROM tasks
        WHERE recurring_template_id = recurring_task.id
        AND instance_date = next_date
        AND deleted_at IS NULL
      ) THEN
        -- Create new instance
        INSERT INTO tasks (
          workspace_id,
          title,
          description,
          status,
          priority,
          tags,
          created_by,
          recurring_template_id,
          instance_date,
          due_date,
          estimated_duration,
          metadata
        ) VALUES (
          recurring_task.workspace_id,
          recurring_task.title,
          recurring_task.description,
          'todo',
          recurring_task.priority,
          recurring_task.tags,
          recurring_task.created_by,
          recurring_task.id,
          next_date,
          next_date,
          recurring_task.estimated_duration,
          jsonb_build_object('generated_at', NOW(), 'is_instance', true)
        )
        RETURNING id INTO new_instance_id;
        
        current_count := current_count + 1;
        instances_generated := instances_generated + 1;
      END IF;
      
      -- Calculate next occurrence
      next_date := calculate_next_occurrence_from_date(next_date, pattern);
    END LOOP;
    
    -- Return results for this template
    template_id := recurring_task.id;
    instances_created := instances_generated;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;