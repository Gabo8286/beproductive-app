export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'tasks' | 'goals' | 'habits' | 'notes' | 'reflections' | 'levels' | 'streaks' | 'social';
export type RequirementType = 'count' | 'streak' | 'total' | 'specific';
export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'skipped';

export interface UserGamificationProfile {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  weekly_xp: number;
  monthly_xp: number;
  achievement_count: number;
  longest_streak_any_habit: number;
  productivity_profile_type?: string;
  assessment_completed_at?: string;
  last_level_up_at: string;
  weekly_reset_at: string;
  monthly_reset_at: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PointsLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  points: number;
  source_module: string;
  source_id?: string;
  multiplier: number;
  description?: string;
  metadata: Record<string, any>;
  earned_at: string;
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  requirement_type: RequirementType;
  requirement_value: number;
  requirement_target?: string;
  points_reward: number;
  rarity: AchievementRarity;
  is_hidden: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  unlocked_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  achievement?: Achievement; // Populated via join
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_type: ChallengeType;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  points_reward: number;
  status: ChallengeStatus;
  expires_at?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LevelInfo {
  level: number;
  current_xp: number;
  xp_required: number;
  xp_to_next_level: number;
  progress_percentage: number;
}

export interface PointsAction {
  action_type: string;
  base_points: number;
  source_module: string;
  description: string;
  max_daily?: number;
  multiplier_conditions?: PointsMultiplierCondition[];
}

export interface PointsMultiplierCondition {
  condition_type: 'streak' | 'time_of_day' | 'consecutive' | 'difficulty';
  condition_value: any;
  multiplier: number;
  description: string;
}

export interface GamificationStats {
  total_points_earned: number;
  points_this_week: number;
  points_this_month: number;
  achievements_unlocked: number;
  current_level: number;
  xp_to_next_level: number;
  longest_streak: number;
  active_challenges: number;
  completed_challenges: number;
}

export interface CreatePointsLogData {
  action_type: string;
  points: number;
  source_module: string;
  source_id?: string;
  description?: string;
  multiplier?: number;
}

export interface AchievementProgress {
  achievement: Achievement;
  current_progress: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress_percentage: number;
}

// Predefined points actions
export const POINTS_ACTIONS: Record<string, PointsAction> = {
  TASK_COMPLETED: {
    action_type: 'task_completed',
    base_points: 10,
    source_module: 'tasks',
    description: 'Completed a task',
    max_daily: 20,
    multiplier_conditions: [
      {
        condition_type: 'difficulty',
        condition_value: 'high',
        multiplier: 2.0,
        description: 'High priority task'
      },
      {
        condition_type: 'streak',
        condition_value: 7,
        multiplier: 1.5,
        description: '7+ day completion streak'
      }
    ]
  },
  GOAL_COMPLETED: {
    action_type: 'goal_completed',
    base_points: 200,
    source_module: 'goals',
    description: 'Completed a goal',
    multiplier_conditions: [
      {
        condition_type: 'difficulty',
        condition_value: 'high',
        multiplier: 1.5,
        description: 'High impact goal'
      }
    ]
  },
  HABIT_CHECKED: {
    action_type: 'habit_checked',
    base_points: 5,
    source_module: 'habits',
    description: 'Checked off a habit',
    max_daily: 50,
    multiplier_conditions: [
      {
        condition_type: 'streak',
        condition_value: 7,
        multiplier: 1.2,
        description: '7+ day habit streak'
      },
      {
        condition_type: 'streak',
        condition_value: 30,
        multiplier: 1.5,
        description: '30+ day habit streak'
      }
    ]
  },
  NOTE_CREATED: {
    action_type: 'note_created',
    base_points: 25,
    source_module: 'notes',
    description: 'Created a note',
    max_daily: 10
  },
  NOTE_LINKED: {
    action_type: 'note_linked',
    base_points: 15,
    source_module: 'notes',
    description: 'Linked notes together'
  },
  REFLECTION_CREATED: {
    action_type: 'reflection_created',
    base_points: 50,
    source_module: 'reflections',
    description: 'Wrote a reflection',
    max_daily: 2
  },
  PROFILE_ASSESSMENT_COMPLETED: {
    action_type: 'profile_assessment_completed',
    base_points: 500,
    source_module: 'productivity-profile',
    description: 'Completed productivity profile assessment'
  },
  CHALLENGE_COMPLETED: {
    action_type: 'challenge_completed',
    base_points: 100,
    source_module: 'gamification',
    description: 'Completed a challenge'
  }
};

// Level progression formula
export const calculateXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level - 1, 1.5) * 10);
};

export const calculateLevelFromXp = (totalXp: number): number => {
  let level = 1;
  while (calculateXpForLevel(level + 1) <= totalXp && level < 50) {
    level++;
  }
  return level;
};

export const getLevelInfo = (totalXp: number): LevelInfo => {
  const level = calculateLevelFromXp(totalXp);
  const currentLevelXp = level > 1 ? calculateXpForLevel(level) : 0;
  const nextLevelXp = level < 50 ? calculateXpForLevel(level + 1) : calculateXpForLevel(50);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
  const xpToNextLevel = nextLevelXp - totalXp;
  const progressPercentage = level >= 50 ? 100 : (xpInCurrentLevel / xpRequiredForNextLevel) * 100;

  return {
    level,
    current_xp: totalXp,
    xp_required: xpRequiredForNextLevel,
    xp_to_next_level: Math.max(0, xpToNextLevel),
    progress_percentage: Math.min(100, Math.max(0, progressPercentage))
  };
};