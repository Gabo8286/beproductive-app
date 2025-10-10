-- Create Luna Productivity Profiles Table
CREATE TABLE luna_productivity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Framework stage tracking
  current_stage TEXT NOT NULL DEFAULT 'foundation' CHECK (current_stage IN ('foundation', 'optimization', 'mastery', 'sustainability')),
  week_in_stage INTEGER NOT NULL DEFAULT 1,
  completed_principles TEXT[] DEFAULT '{}',
  
  -- Well-being and health scores
  well_being_score INTEGER DEFAULT 7 CHECK (well_being_score BETWEEN 1 AND 10),
  system_health_score INTEGER DEFAULT 5 CHECK (system_health_score BETWEEN 1 AND 10),
  
  -- Energy patterns (JSONB for flexibility)
  energy_pattern JSONB DEFAULT '[]',
  
  -- User preferences
  preferences JSONB DEFAULT '{}',
  
  -- Recovery state
  is_in_recovery_mode BOOLEAN DEFAULT FALSE,
  current_recovery_level INTEGER,
  recovery_started_at TIMESTAMPTZ,
  
  -- Proactive guidance settings
  is_proactive_mode_enabled BOOLEAN DEFAULT TRUE,
  last_proactive_check TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, workspace_id)
);

ALTER TABLE luna_productivity_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Luna profiles"
  ON luna_productivity_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own Luna profiles"
  ON luna_productivity_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Luna profiles"
  ON luna_productivity_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX idx_luna_profiles_user ON luna_productivity_profiles(user_id);
CREATE INDEX idx_luna_profiles_stage ON luna_productivity_profiles(current_stage);

CREATE TRIGGER update_luna_profiles_updated_at
  BEFORE UPDATE ON luna_productivity_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create Framework Assessments Table
CREATE TABLE luna_framework_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES luna_productivity_profiles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  completion_percentage INTEGER NOT NULL CHECK (completion_percentage BETWEEN 0 AND 100),
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  next_steps TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE luna_framework_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
  ON luna_framework_assessments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessments"
  ON luna_framework_assessments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_assessments_profile ON luna_framework_assessments(profile_id);
CREATE INDEX idx_assessments_date ON luna_framework_assessments(created_at);

-- Create Proactive Insights Table
CREATE TABLE luna_proactive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES luna_productivity_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'warning', 'celebration', 'guidance')),
  principle TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  acted_upon BOOLEAN DEFAULT FALSE,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

ALTER TABLE luna_proactive_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own insights"
  ON luna_proactive_insights FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_insights_profile ON luna_proactive_insights(profile_id);
CREATE INDEX idx_insights_active ON luna_proactive_insights(user_id, dismissed) WHERE dismissed = FALSE;
CREATE INDEX idx_insights_expires ON luna_proactive_insights(expires_at);

-- Create Productivity Metrics History Table
CREATE TABLE luna_productivity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES luna_productivity_profiles(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  target TEXT,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  source TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE luna_productivity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
  ON luna_productivity_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own metrics"
  ON luna_productivity_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_metrics_profile ON luna_productivity_metrics(profile_id);
CREATE INDEX idx_metrics_category ON luna_productivity_metrics(user_id, category);
CREATE INDEX idx_metrics_time ON luna_productivity_metrics(recorded_at DESC);

-- Create Recovery Sessions Table
CREATE TABLE luna_recovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES luna_productivity_profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 7),
  level_name TEXT NOT NULL,
  trigger_reason TEXT,
  completed_steps TEXT[] DEFAULT '{}',
  remaining_steps TEXT[] DEFAULT '{}',
  current_step TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_duration_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  was_completed BOOLEAN DEFAULT FALSE,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  notes TEXT
);

ALTER TABLE luna_recovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recovery sessions"
  ON luna_recovery_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_recovery_profile ON luna_recovery_sessions(profile_id);
CREATE INDEX idx_recovery_active ON luna_recovery_sessions(user_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_recovery_history ON luna_recovery_sessions(user_id, started_at DESC);

-- Create Framework Reminders Table
CREATE TABLE luna_framework_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES luna_productivity_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('review', 'break', 'reflection', 'goal-check', 'well-being')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE luna_framework_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
  ON luna_framework_reminders FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_reminders_profile ON luna_framework_reminders(profile_id);
CREATE INDEX idx_reminders_pending ON luna_framework_reminders(user_id, scheduled_for) WHERE completed = FALSE;