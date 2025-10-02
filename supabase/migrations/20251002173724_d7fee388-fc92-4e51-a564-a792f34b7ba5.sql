-- Add longest_streak_any_habit column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_gamification_profiles' 
    AND column_name = 'longest_streak_any_habit'
  ) THEN
    ALTER TABLE public.user_gamification_profiles 
    ADD COLUMN longest_streak_any_habit INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Function to award points for habit completion
CREATE OR REPLACE FUNCTION public.award_habit_points(
  habit_id_param UUID,
  entry_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  current_streak INTEGER;
  base_points INTEGER := 5;
  streak_bonus INTEGER := 0;
  multiplier NUMERIC := 1.0;
  final_points INTEGER;
  user_longest_streak INTEGER;
BEGIN
  -- Get user_id and current_streak from habits table
  SELECT h.created_by, h.current_streak
  INTO target_user_id, current_streak
  FROM habits h
  WHERE h.id = habit_id_param;

  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Calculate streak bonus
  IF current_streak >= 100 THEN
    streak_bonus := 20;
    multiplier := 3.0;
  ELSIF current_streak >= 30 THEN
    streak_bonus := 10;
    multiplier := 2.0;
  ELSIF current_streak >= 7 THEN
    streak_bonus := 5;
    multiplier := 1.5;
  END IF;

  final_points := base_points + streak_bonus;

  -- Award the points using existing function
  PERFORM award_points(
    target_user_id,
    final_points,
    'habit_checked',
    'habits',
    habit_id_param::TEXT,
    'Completed habit with ' || current_streak || ' day streak',
    multiplier
  );

  -- Update longest_streak_any_habit if current streak is higher
  SELECT COALESCE(longest_streak_any_habit, 0) INTO user_longest_streak
  FROM user_gamification_profiles
  WHERE user_id = target_user_id;

  IF current_streak > user_longest_streak THEN
    UPDATE user_gamification_profiles
    SET longest_streak_any_habit = current_streak
    WHERE user_id = target_user_id;
  END IF;

  -- Update total habits completed in metadata
  UPDATE user_gamification_profiles
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{total_habits_completed}',
    (COALESCE((metadata->>'total_habits_completed')::INTEGER, 0) + 1)::TEXT::jsonb
  )
  WHERE user_id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Function to check and unlock habit achievements
CREATE OR REPLACE FUNCTION public.check_habit_achievements(
  target_user_id UUID,
  current_streak INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_habits_completed INTEGER;
  achievement_record RECORD;
BEGIN
  -- Calculate total habits completed for this user
  SELECT COUNT(*)
  INTO total_habits_completed
  FROM habit_entries he
  INNER JOIN habits h ON h.id = he.habit_id
  WHERE h.created_by = target_user_id
    AND he.status = 'completed';

  -- Check "first_habit" achievement (1 habit completed)
  IF total_habits_completed >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress)
    VALUES (target_user_id, 'first_habit', 1)
    ON CONFLICT (user_id, achievement_id) DO UPDATE
    SET current_progress = 1,
        unlocked_at = CASE 
          WHEN user_achievements.unlocked_at IS NULL THEN NOW() 
          ELSE user_achievements.unlocked_at 
        END;
  END IF;

  -- Check "habit_streak_30" achievement (30 day streak)
  IF current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress)
    VALUES (target_user_id, 'habit_streak_30', current_streak)
    ON CONFLICT (user_id, achievement_id) DO UPDATE
    SET current_progress = GREATEST(user_achievements.current_progress, EXCLUDED.current_progress),
        unlocked_at = CASE 
          WHEN user_achievements.unlocked_at IS NULL THEN NOW() 
          ELSE user_achievements.unlocked_at 
        END;
  END IF;

  -- Check "habit_streak_100" achievement (100 day streak)
  IF current_streak >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress)
    VALUES (target_user_id, 'habit_streak_100', current_streak)
    ON CONFLICT (user_id, achievement_id) DO UPDATE
    SET current_progress = GREATEST(user_achievements.current_progress, EXCLUDED.current_progress),
        unlocked_at = CASE 
          WHEN user_achievements.unlocked_at IS NULL THEN NOW() 
          ELSE user_achievements.unlocked_at 
        END;
  END IF;
END;
$$;

-- Trigger function for habit gamification
CREATE OR REPLACE FUNCTION public.trigger_habit_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  habit_user_id UUID;
  habit_current_streak INTEGER;
BEGIN
  -- Only process completed status
  IF NEW.status = 'completed' THEN
    -- Get user_id and current_streak from habits table
    SELECT h.created_by, h.current_streak
    INTO habit_user_id, habit_current_streak
    FROM habits h
    WHERE h.id = NEW.habit_id;

    IF habit_user_id IS NOT NULL THEN
      -- Award points for the habit completion
      PERFORM award_habit_points(NEW.habit_id, NEW.id);
      
      -- Check for achievement unlocks
      PERFORM check_habit_achievements(habit_user_id, habit_current_streak);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS habit_gamification_trigger ON habit_entries;

CREATE TRIGGER habit_gamification_trigger
  AFTER INSERT OR UPDATE OF status ON habit_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_habit_gamification();

-- Backfill existing user data
DO $$
DECLARE
  user_record RECORD;
  max_streak INTEGER;
  total_completed INTEGER;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT wm.user_id
    FROM workspace_members wm
  LOOP
    -- Get max streak for this user
    SELECT COALESCE(MAX(h.current_streak), 0)
    INTO max_streak
    FROM habits h
    WHERE h.created_by = user_record.user_id;

    -- Count total completed habits
    SELECT COUNT(*)
    INTO total_completed
    FROM habit_entries he
    INNER JOIN habits h ON h.id = he.habit_id
    WHERE h.created_by = user_record.user_id
      AND he.status = 'completed';

    -- Update or insert gamification profile
    INSERT INTO user_gamification_profiles (user_id, longest_streak_any_habit, metadata)
    VALUES (
      user_record.user_id, 
      max_streak,
      jsonb_build_object('total_habits_completed', total_completed)
    )
    ON CONFLICT (user_id) DO UPDATE
    SET longest_streak_any_habit = GREATEST(
          user_gamification_profiles.longest_streak_any_habit, 
          EXCLUDED.longest_streak_any_habit
        ),
        metadata = jsonb_set(
          COALESCE(user_gamification_profiles.metadata, '{}'::jsonb),
          '{total_habits_completed}',
          total_completed::TEXT::jsonb
        );
  END LOOP;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.award_habit_points(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_habit_achievements(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_habit_gamification() TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id_date ON habit_entries(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_status ON habit_entries(status);
CREATE INDEX IF NOT EXISTS idx_user_gamification_profiles_user_id ON user_gamification_profiles(user_id);