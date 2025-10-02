-- Create user gamification profiles table
CREATE TABLE IF NOT EXISTS user_gamification_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level integer DEFAULT 1 CHECK (level >= 1 AND level <= 50),
  total_xp bigint DEFAULT 0 CHECK (total_xp >= 0),
  weekly_xp bigint DEFAULT 0 CHECK (weekly_xp >= 0),
  monthly_xp bigint DEFAULT 0 CHECK (monthly_xp >= 0),
  achievement_count integer DEFAULT 0 CHECK (achievement_count >= 0),
  longest_streak_any_habit integer DEFAULT 0 CHECK (longest_streak_any_habit >= 0),
  productivity_profile_type text,
  assessment_completed_at timestamptz,
  last_level_up_at timestamptz DEFAULT now(),
  weekly_reset_at timestamptz DEFAULT date_trunc('week', now()),
  monthly_reset_at timestamptz DEFAULT date_trunc('month', now()),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create points tracking table
CREATE TABLE IF NOT EXISTS user_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  points integer NOT NULL,
  source_module text NOT NULL,
  source_id text,
  multiplier decimal(3,2) DEFAULT 1.0,
  description text,
  metadata jsonb DEFAULT '{}',
  earned_at timestamptz DEFAULT now() NOT NULL
);

-- Create achievements definitions table (seeded data)
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL, -- 'count', 'streak', 'total', 'specific'
  requirement_value integer NOT NULL,
  requirement_target text, -- specific target for 'specific' type
  points_reward integer DEFAULT 0,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_hidden boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user achievements progress table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  current_progress integer DEFAULT 0,
  unlocked_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create productivity assessments table
CREATE TABLE IF NOT EXISTS productivity_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_responses jsonb NOT NULL,
  profile_scores jsonb NOT NULL,
  dominant_profile text NOT NULL,
  secondary_profile text,
  recommended_strategies jsonb DEFAULT '[]',
  strengths jsonb DEFAULT '[]',
  growth_areas jsonb DEFAULT '[]',
  completed_at timestamptz DEFAULT now() NOT NULL
);

-- Create user challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  title text NOT NULL,
  description text NOT NULL,
  target_value integer NOT NULL,
  current_progress integer DEFAULT 0,
  points_reward integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'skipped')),
  expires_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_gamification_profiles
CREATE POLICY "Users can view their own gamification profile" ON user_gamification_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification profile" ON user_gamification_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification profile" ON user_gamification_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_points_log
CREATE POLICY "Users can view their own points log" ON user_points_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert points for users" ON user_points_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for productivity_assessments
CREATE POLICY "Users can view their own assessments" ON productivity_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON productivity_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_challenges
CREATE POLICY "Users can view their own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" ON user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert challenges for users" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_profiles_user_id ON user_gamification_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_log_user_id_earned_at ON user_points_log(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_log_source ON user_points_log(source_module, source_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at) WHERE unlocked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id_status ON user_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_productivity_assessments_user_id ON productivity_assessments(user_id, completed_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_gamification_profiles_updated_at BEFORE UPDATE ON user_gamification_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate required XP for level
CREATE OR REPLACE FUNCTION get_xp_required_for_level(target_level integer)
RETURNS bigint AS $$
BEGIN
  -- Exponential XP curve: Level n requires 100 * (n-1)^1.5 * 10 total XP
  RETURN FLOOR(100 * POWER(target_level - 1, 1.5) * 10);
END;
$$ LANGUAGE plpgsql;

-- Function to get level from total XP
CREATE OR REPLACE FUNCTION get_level_from_xp(total_xp bigint)
RETURNS integer AS $$
DECLARE
  level integer := 1;
BEGIN
  WHILE get_xp_required_for_level(level + 1) <= total_xp AND level < 50 LOOP
    level := level + 1;
  END LOOP;
  RETURN level;
END;
$$ LANGUAGE plpgsql;

-- Function to award points and update profile
CREATE OR REPLACE FUNCTION award_points(
  target_user_id uuid,
  point_amount integer,
  action_type_param text,
  source_module_param text,
  source_id_param text DEFAULT NULL,
  description_param text DEFAULT NULL,
  multiplier_param decimal DEFAULT 1.0
)
RETURNS boolean AS $$
DECLARE
  final_points integer;
  old_level integer;
  new_level integer;
  profile_record RECORD;
BEGIN
  final_points := FLOOR(point_amount * multiplier_param);

  -- Insert points log entry
  INSERT INTO user_points_log (
    user_id, action_type, points, source_module, source_id, description, multiplier
  ) VALUES (
    target_user_id, action_type_param, final_points, source_module_param,
    source_id_param, description_param, multiplier_param
  );

  -- Get or create user gamification profile
  INSERT INTO user_gamification_profiles (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current profile
  SELECT level, total_xp INTO old_level, profile_record.total_xp
  FROM user_gamification_profiles
  WHERE user_id = target_user_id;

  -- Update profile with new points
  UPDATE user_gamification_profiles
  SET
    total_xp = total_xp + final_points,
    weekly_xp = weekly_xp + final_points,
    monthly_xp = monthly_xp + final_points
  WHERE user_id = target_user_id;

  -- Calculate new level
  new_level := get_level_from_xp(profile_record.total_xp + final_points);

  -- Update level if changed
  IF new_level > old_level THEN
    UPDATE user_gamification_profiles
    SET
      level = new_level,
      last_level_up_at = now()
    WHERE user_id = target_user_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset weekly/monthly XP
CREATE OR REPLACE FUNCTION reset_periodic_xp()
RETURNS void AS $$
BEGIN
  -- Reset weekly XP for users where a week has passed
  UPDATE user_gamification_profiles
  SET
    weekly_xp = 0,
    weekly_reset_at = date_trunc('week', now())
  WHERE weekly_reset_at < date_trunc('week', now());

  -- Reset monthly XP for users where a month has passed
  UPDATE user_gamification_profiles
  SET
    monthly_xp = 0,
    monthly_reset_at = date_trunc('month', now())
  WHERE monthly_reset_at < date_trunc('month', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default achievements
INSERT INTO achievements (id, category, title, description, icon, requirement_type, requirement_value, points_reward, rarity, sort_order) VALUES
-- Task Management Achievements
('first_task', 'tasks', 'First Step', 'Complete your first task', 'CheckSquare', 'count', 1, 50, 'common', 1),
('task_streak_7', 'tasks', 'Week Warrior', 'Complete tasks for 7 days in a row', 'Calendar', 'streak', 7, 200, 'common', 2),
('task_master_100', 'tasks', 'Task Master', 'Complete 100 tasks', 'Trophy', 'count', 100, 500, 'rare', 3),
('speed_demon', 'tasks', 'Speed Demon', 'Complete 10 tasks in one day', 'Zap', 'count', 10, 300, 'rare', 4),

-- Goal Setting Achievements
('first_goal', 'goals', 'Visionary', 'Set your first goal', 'Target', 'count', 1, 50, 'common', 10),
('goal_achiever', 'goals', 'Goal Achiever', 'Complete your first goal', 'Award', 'count', 1, 200, 'common', 11),
('goal_master', 'goals', 'Goal Master', 'Complete 10 goals', 'Crown', 'count', 10, 1000, 'epic', 12),

-- Habit Building Achievements
('first_habit', 'habits', 'Habit Starter', 'Create your first habit', 'Repeat', 'count', 1, 50, 'common', 20),
('habit_streak_30', 'habits', 'Habit Former', 'Maintain a 30-day habit streak', 'Flame', 'streak', 30, 500, 'rare', 21),
('habit_streak_100', 'habits', 'Unstoppable', 'Maintain a 100-day habit streak', 'Star', 'streak', 100, 2000, 'legendary', 22),

-- Knowledge & Notes Achievements
('first_note', 'notes', 'Knowledge Seeker', 'Create your first note', 'BookOpen', 'count', 1, 25, 'common', 30),
('note_linker', 'notes', 'Connection Master', 'Create 10 linked notes', 'Link', 'count', 10, 300, 'rare', 31),
('knowledge_vault', 'notes', 'Knowledge Vault', 'Create 100 notes', 'Library', 'count', 100, 750, 'epic', 32),

-- Reflection Achievements
('first_reflection', 'reflections', 'Self Aware', 'Write your first reflection', 'Mirror', 'count', 1, 50, 'common', 40),
('reflection_streak', 'reflections', 'Deep Thinker', 'Reflect for 7 days straight', 'Brain', 'streak', 7, 400, 'rare', 41),

-- Level-based Achievements
('level_5', 'levels', 'Rising Star', 'Reach level 5', 'Star', 'specific', 5, 250, 'common', 50),
('level_10', 'levels', 'Experienced', 'Reach level 10', 'Award', 'specific', 10, 500, 'rare', 51),
('level_25', 'levels', 'Expert', 'Reach level 25', 'Trophy', 'specific', 25, 1500, 'epic', 52),
('level_50', 'levels', 'Master', 'Reach the maximum level', 'Crown', 'specific', 50, 5000, 'legendary', 53)

ON CONFLICT (id) DO NOTHING;