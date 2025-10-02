-- TASK-034: Task Automation & Notifications

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification preferences
  due_date_reminder_hours INTEGER[] DEFAULT '{24, 1}', -- Hours before due date
  overdue_escalation_hours INTEGER[] DEFAULT '{1, 24, 72}', -- Hours after due date
  weekly_summary_day INTEGER DEFAULT 1, -- 1=Monday, 0=Sunday
  weekly_summary_time TIME DEFAULT '09:00:00',

  -- Channel preferences
  in_app_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,

  -- Feature toggles
  due_date_reminders BOOLEAN DEFAULT TRUE,
  overdue_alerts BOOLEAN DEFAULT TRUE,
  completion_celebrations BOOLEAN DEFAULT TRUE,
  time_tracking_reminders BOOLEAN DEFAULT TRUE,
  weekly_summaries BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Rule definition
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  rule_type TEXT NOT NULL, -- 'auto_assign', 'auto_tag', 'auto_status', 'auto_archive', 'dependency'

  -- Trigger conditions (JSONB)
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- Actions to perform (JSONB)
  actions JSONB NOT NULL DEFAULT '{}',

  -- Rule metadata
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Notification details
  type TEXT NOT NULL, -- 'due_reminder', 'overdue_alert', 'completion', 'time_reminder', 'weekly_summary'
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Delivery tracking
  channels TEXT[] DEFAULT '{}', -- ['in_app', 'push', 'email']
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- Notification data (JSONB)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_logs table for tracking rule executions
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Execution details
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- What was changed
  changes_made JSONB DEFAULT '{}',
  
  execution_time_ms INTEGER
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_delivered_at ON notifications(delivered_at);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed_at ON automation_logs(executed_at);

-- RLS Policies
CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own automation rules"
  ON automation_rules FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view logs for their rules"
  ON automation_logs FOR SELECT
  USING (rule_id IN (SELECT id FROM automation_rules WHERE user_id = auth.uid()));

-- Function to execute automation actions
CREATE OR REPLACE FUNCTION execute_automation_actions(
  p_rule_id UUID,
  p_task_id UUID,
  p_actions JSONB
)
RETURNS VOID AS $$
DECLARE
  changes_made JSONB := '{}';
  error_msg TEXT;
BEGIN
  BEGIN
    -- Add tags
    IF p_actions ? 'add_tags' THEN
      UPDATE tasks
      SET tags = COALESCE(tags, '{}') || ARRAY(SELECT jsonb_array_elements_text(p_actions->'add_tags'))
      WHERE id = p_task_id;
      changes_made := changes_made || jsonb_build_object('tags_added', p_actions->'add_tags');
    END IF;

    -- Set status
    IF p_actions ? 'set_status' THEN
      UPDATE tasks
      SET status = (p_actions->>'set_status')::task_status
      WHERE id = p_task_id;
      changes_made := changes_made || jsonb_build_object('status_changed', p_actions->>'set_status');
    END IF;

    -- Set priority
    IF p_actions ? 'set_priority' THEN
      UPDATE tasks
      SET priority = (p_actions->>'set_priority')::task_priority
      WHERE id = p_task_id;
      changes_made := changes_made || jsonb_build_object('priority_changed', p_actions->>'set_priority');
    END IF;

    -- Assign to user
    IF p_actions ? 'assign_to' THEN
      UPDATE tasks
      SET assigned_to = (p_actions->>'assign_to')::UUID
      WHERE id = p_task_id;
      changes_made := changes_made || jsonb_build_object('assigned_to', p_actions->>'assign_to');
    END IF;

    -- Log successful execution
    INSERT INTO automation_logs (rule_id, task_id, success, changes_made)
    VALUES (p_rule_id, p_task_id, TRUE, changes_made);

  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;

    -- Log failed execution
    INSERT INTO automation_logs (rule_id, task_id, success, error_message)
    VALUES (p_rule_id, p_task_id, FALSE, error_msg);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to process automation rules
CREATE OR REPLACE FUNCTION process_automation_rules()
RETURNS INTEGER AS $$
DECLARE
  rule_record RECORD;
  task_record RECORD;
  conditions JSONB;
  actions JSONB;
  matches_conditions BOOLEAN;
  rules_executed INTEGER := 0;
BEGIN
  -- Process all enabled rules
  FOR rule_record IN
    SELECT * FROM automation_rules
    WHERE is_enabled = TRUE
  LOOP
    conditions := rule_record.trigger_conditions;
    actions := rule_record.actions;

    -- Find tasks that match conditions
    FOR task_record IN
      SELECT * FROM tasks
      WHERE workspace_id = rule_record.workspace_id
    LOOP
      matches_conditions := TRUE;

      -- Check title contains conditions
      IF conditions ? 'task_title_contains' THEN
        IF NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(conditions->'task_title_contains') AS keyword
          WHERE task_record.title ILIKE '%' || keyword || '%'
        ) THEN
          matches_conditions := FALSE;
        END IF;
      END IF;

      -- Check priority conditions
      IF conditions ? 'task_priority' AND matches_conditions THEN
        IF NOT (task_record.priority::TEXT = ANY(ARRAY(SELECT jsonb_array_elements_text(conditions->'task_priority')))) THEN
          matches_conditions := FALSE;
        END IF;
      END IF;

      -- Check due date conditions
      IF conditions ? 'due_date_within_hours' AND matches_conditions THEN
        IF task_record.due_date IS NULL OR
           task_record.due_date > NOW() + ((conditions->>'due_date_within_hours')::INTEGER || ' hours')::INTERVAL THEN
          matches_conditions := FALSE;
        END IF;
      END IF;

      -- If conditions match, execute actions
      IF matches_conditions THEN
        PERFORM execute_automation_actions(rule_record.id, task_record.id, actions);
        rules_executed := rules_executed + 1;

        -- Update rule execution count
        UPDATE automation_rules
        SET execution_count = execution_count + 1,
            last_executed_at = NOW()
        WHERE id = rule_record.id;
      END IF;
    END LOOP;
  END LOOP;

  RETURN rules_executed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to send due date notifications
CREATE OR REPLACE FUNCTION send_due_date_notifications()
RETURNS INTEGER AS $$
DECLARE
  user_settings RECORD;
  task_record RECORD;
  reminder_hour INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  -- Process notifications for each user
  FOR user_settings IN
    SELECT * FROM notification_settings
    WHERE due_date_reminders = TRUE
  LOOP
    -- Check each reminder hour setting
    FOREACH reminder_hour IN ARRAY user_settings.due_date_reminder_hours
    LOOP
      -- Find tasks due in the specified hours
      FOR task_record IN
        SELECT t.* FROM tasks t
        WHERE t.due_date IS NOT NULL
        AND t.due_date BETWEEN NOW() + (reminder_hour - 1 || ' hours')::INTERVAL
                           AND NOW() + (reminder_hour || ' hours')::INTERVAL
        AND t.status != 'done'
        AND EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = t.workspace_id
          AND wm.user_id = user_settings.user_id
        )
        -- Don't send duplicate notifications
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = user_settings.user_id
          AND n.task_id = t.id
          AND n.type = 'due_reminder'
          AND n.created_at > NOW() - '1 hour'::INTERVAL
        )
      LOOP
        -- Create notification
        INSERT INTO notifications (user_id, task_id, type, title, message, channels)
        VALUES (
          user_settings.user_id,
          task_record.id,
          'due_reminder',
          'Task Due Soon',
          'Task "' || task_record.title || '" is due in ' || reminder_hour || ' hour(s)',
          CASE
            WHEN user_settings.in_app_notifications THEN ARRAY['in_app']
            ELSE ARRAY[]::TEXT[]
          END ||
          CASE
            WHEN user_settings.push_notifications THEN ARRAY['push']
            ELSE ARRAY[]::TEXT[]
          END
        );

        notifications_sent := notifications_sent + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN notifications_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();