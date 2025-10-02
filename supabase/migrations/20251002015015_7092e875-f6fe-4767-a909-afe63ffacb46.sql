-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Time tracking
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds, calculated or manual
  is_manual BOOLEAN DEFAULT FALSE,

  -- Entry details
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  billable BOOLEAN DEFAULT FALSE,
  hourly_rate DECIMAL(10,2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_timers table for session management
CREATE TABLE IF NOT EXISTS active_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  paused_duration INTEGER DEFAULT 0, -- accumulated pause time in seconds
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id) -- Only one active timer per user
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_active_timers_user_id ON active_timers(user_id);

-- RLS Policies for time_entries
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
  ON time_entries FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for active_timers
CREATE POLICY "Users can manage their own active timers"
  ON active_timers FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to start timer
CREATE OR REPLACE FUNCTION start_timer(p_task_id UUID)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_time_entry_id UUID;
  v_timer_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Stop any existing active timer
  PERFORM stop_active_timer(v_user_id);

  -- Create new time entry
  INSERT INTO time_entries (task_id, user_id, start_time)
  VALUES (p_task_id, v_user_id, NOW())
  RETURNING id INTO v_time_entry_id;

  -- Create active timer
  INSERT INTO active_timers (user_id, task_id, time_entry_id, started_at)
  VALUES (v_user_id, p_task_id, v_time_entry_id, NOW())
  RETURNING id INTO v_timer_id;

  RETURN v_timer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to stop active timer
CREATE OR REPLACE FUNCTION stop_active_timer(p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_timer RECORD;
  v_total_duration INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Get active timer
  SELECT * INTO v_timer FROM active_timers WHERE user_id = v_user_id;

  IF v_timer.id IS NOT NULL THEN
    -- Calculate total duration
    v_total_duration := EXTRACT(EPOCH FROM (NOW() - v_timer.started_at))::INTEGER - v_timer.paused_duration;

    -- Update time entry with end time and duration
    UPDATE time_entries
    SET end_time = NOW(),
        duration = v_total_duration,
        updated_at = NOW()
    WHERE id = v_timer.time_entry_id;

    -- Remove active timer
    DELETE FROM active_timers WHERE id = v_timer.id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to pause/resume timer
CREATE OR REPLACE FUNCTION toggle_timer_pause()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_timer RECORD;
  v_pause_duration INTEGER;
BEGIN
  v_user_id := auth.uid();

  SELECT * INTO v_timer FROM active_timers WHERE user_id = v_user_id;

  IF v_timer.id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_timer.is_paused THEN
    -- Resume: add pause time to total paused duration
    v_pause_duration := v_timer.paused_duration + EXTRACT(EPOCH FROM (NOW() - v_timer.paused_at))::INTEGER;

    UPDATE active_timers
    SET is_paused = FALSE,
        paused_at = NULL,
        paused_duration = v_pause_duration
    WHERE id = v_timer.id;

    RETURN FALSE; -- Now unpaused
  ELSE
    -- Pause: record pause start time
    UPDATE active_timers
    SET is_paused = TRUE,
        paused_at = NOW()
    WHERE id = v_timer.id;

    RETURN TRUE; -- Now paused
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at trigger to time_entries
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();