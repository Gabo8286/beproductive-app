-- Habits-Gamification Integration Migration
-- This migration integrates the existing habits module with the gamification system
-- to award XP points and unlock achievements when users complete habits.

-- Function to award points for habit completions
CREATE OR REPLACE FUNCTION award_habit_points(
  target_user_id uuid,
  habit_id_param uuid,
  entry_id_param uuid,
  current_streak integer DEFAULT 0
)
RETURNS boolean AS $$
DECLARE
  base_points integer := 5; -- 5 XP per habit completion
  streak_bonus integer := 0;
  total_points integer;
  habit_record RECORD;
  multiplier_value decimal := 1.0;
BEGIN
  -- Get habit details for context
  SELECT title, category INTO habit_record
  FROM habits
  WHERE id = habit_id_param;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Calculate streak bonuses and multipliers
  IF current_streak >= 100 THEN
    streak_bonus := 20; -- 100+ day streak bonus
    multiplier_value := 3.0;
  ELSIF current_streak >= 30 THEN
    streak_bonus := 10; -- 30+ day streak bonus
    multiplier_value := 2.0;
  ELSIF current_streak >= 7 THEN
    streak_bonus := 5;  -- 7+ day streak bonus
    multiplier_value := 1.5;
  END IF;

  total_points := base_points + streak_bonus;

  -- Award points using existing gamification function
  PERFORM award_points(
    target_user_id,
    base_points,
    'HABIT_CHECKED',
    'habits',
    entry_id_param,
    CASE
      WHEN streak_bonus > 0 THEN
        format('Completed habit "%s" (%s day streak bonus!)', habit_record.title, current_streak)
      ELSE
        format('Completed habit "%s"', habit_record.title)
    END,
    multiplier_value
  );

  -- Update habit-specific gamification stats
  INSERT INTO user_gamification_profiles (user_id, longest_streak_any_habit, metadata)
  VALUES (
    target_user_id,
    current_streak,
    jsonb_build_object('total_habits_completed', 1)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    longest_streak_any_habit = GREATEST(user_gamification_profiles.longest_streak_any_habit, current_streak),
    metadata = jsonb_set(
      COALESCE(user_gamification_profiles.metadata, '{}'),
      '{total_habits_completed}',
      to_jsonb(COALESCE((user_gamification_profiles.metadata->>'total_habits_completed')::integer, 0) + 1)
    );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and unlock habit-related achievements
CREATE OR REPLACE FUNCTION check_habit_achievements(
  target_user_id uuid,
  current_streak integer,
  total_habits_completed integer
)
RETURNS void AS $$
DECLARE
  achievement_id text;
BEGIN
  -- Check for first habit achievement
  IF total_habits_completed = 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress, unlocked_at)
    VALUES (target_user_id, 'first_habit', 1, now())
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- Check for 30-day streak achievement
  IF current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress, unlocked_at)
    VALUES (target_user_id, 'habit_streak_30', current_streak, now())
    ON CONFLICT (user_id, achievement_id) DO UPDATE SET
      current_progress = EXCLUDED.current_progress,
      unlocked_at = COALESCE(user_achievements.unlocked_at, EXCLUDED.unlocked_at);
  END IF;

  -- Check for 100-day streak achievement
  IF current_streak >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress, unlocked_at)
    VALUES (target_user_id, 'habit_streak_100', current_streak, now())
    ON CONFLICT (user_id, achievement_id) DO UPDATE SET
      current_progress = EXCLUDED.current_progress,
      unlocked_at = COALESCE(user_achievements.unlocked_at, EXCLUDED.unlocked_at);
  END IF;

  -- Update progress for achievements not yet unlocked
  INSERT INTO user_achievements (user_id, achievement_id, current_progress)
  VALUES
    (target_user_id, 'habit_streak_30', current_streak),
    (target_user_id, 'habit_streak_100', current_streak)
  ON CONFLICT (user_id, achievement_id) DO UPDATE SET
    current_progress = GREATEST(user_achievements.current_progress, EXCLUDED.current_progress)
  WHERE user_achievements.unlocked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to automatically award points when habits are completed
CREATE OR REPLACE FUNCTION trigger_habit_gamification()
RETURNS trigger AS $$
DECLARE
  streak_record RECORD;
  total_completed integer;
BEGIN
  -- Only process completed entries
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN

    -- Get current streak for this habit
    SELECT current_streak INTO streak_record
    FROM habit_streaks
    WHERE habit_id = NEW.habit_id;

    -- Get total habits completed (before increment)
    SELECT COALESCE((metadata->>'total_habits_completed')::integer, 0) INTO total_completed
    FROM user_gamification_profiles
    WHERE user_id = NEW.user_id;

    -- Award points
    PERFORM award_habit_points(
      NEW.user_id,
      NEW.habit_id,
      NEW.id,
      COALESCE(streak_record.current_streak, 1)
    );

    -- Check achievements (after increment)
    PERFORM check_habit_achievements(
      NEW.user_id,
      COALESCE(streak_record.current_streak, 1),
      total_completed + 1
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS habit_gamification_trigger ON habit_entries;
CREATE TRIGGER habit_gamification_trigger
  AFTER INSERT OR UPDATE ON habit_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_habit_gamification();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_status ON habit_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_status ON habit_entries(habit_id, status);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_habit_id ON habit_streaks(habit_id);

-- Update achievement progress for existing users (optional data migration)
-- This will populate progress for users who already have habits but no gamification data
DO $$
DECLARE
  user_record RECORD;
  max_streak integer;
  total_completed integer;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM habits WHERE is_active = true LOOP
    -- Get max streak for this user
    SELECT COALESCE(MAX(current_streak), 0) INTO max_streak
    FROM habit_streaks
    WHERE user_id = user_record.user_id;

    -- Get total completed entries
    SELECT COUNT(*) INTO total_completed
    FROM habit_entries
    WHERE user_id = user_record.user_id AND status = 'completed';

    -- Initialize or update gamification profile
    INSERT INTO user_gamification_profiles (user_id, longest_streak_any_habit, metadata)
    VALUES (
      user_record.user_id,
      max_streak,
      jsonb_build_object('total_habits_completed', total_completed)
    )
    ON CONFLICT (user_id) DO UPDATE SET
      longest_streak_any_habit = GREATEST(user_gamification_profiles.longest_streak_any_habit, max_streak),
      metadata = jsonb_set(
        COALESCE(user_gamification_profiles.metadata, '{}'),
        '{total_habits_completed}',
        to_jsonb(GREATEST(
          COALESCE((user_gamification_profiles.metadata->>'total_habits_completed')::integer, 0),
          total_completed
        ))
      );

    -- Check achievements for existing data
    IF total_completed > 0 THEN
      PERFORM check_habit_achievements(user_record.user_id, max_streak, total_completed);
    END IF;
  END LOOP;
END $$;