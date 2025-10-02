// =====================================================
// HABITS SYSTEM TYPES
// Matches database schema from Sprint 5
// =====================================================

// Enums matching database types
export type HabitCategory = 'health' | 'productivity' | 'learning' | 'mindfulness' | 'social' | 'financial' | 'creative' | 'other';
export type HabitType = 'build' | 'break' | 'maintain';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type EntryStatus = 'completed' | 'skipped' | 'missed' | 'partial';
export type MoodLevel = 'amazing' | 'good' | 'neutral' | 'bad' | 'terrible';
export type ReminderType = 'time_based' | 'location_based' | 'trigger_based';
export type PeriodType = 'day' | 'week' | 'month' | 'year' | 'all_time';

// Custom frequency configuration
export interface CustomFrequency {
  type: 'times_per_period' | 'specific_days' | 'interval';
  times?: number; // How many times per period
  period?: 'week' | 'month'; // What period
  days?: number[]; // 0-6 for specific days of week
  interval?: number; // Every N days
}

// Location for location-based reminders
export interface Location {
  latitude: number;
  longitude: number;
  radius?: number; // meters
  name?: string;
}

// Main Habit interface
export interface Habit {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  type: HabitType;
  frequency: HabitFrequency;
  custom_frequency?: CustomFrequency;
  target_streak?: number;
  current_streak: number;
  longest_streak: number;
  difficulty: HabitDifficulty;
  time_of_day?: HabitTime;
  duration_minutes?: number;
  reminder_time?: string;
  reminder_enabled: boolean;
  start_date: string;
  end_date?: string;
  is_public: boolean;
  tags: string[];
  color?: string;
  icon?: string;
  created_by: string;
  archived_at?: string;
  metadata: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
}

// Habit with computed fields
export interface HabitWithStats extends Habit {
  completion_rate?: number;
  last_completed?: string;
  next_due?: string;
  is_due_today?: boolean;
  today_entry?: HabitEntry;
}

// Habit Entry
export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  status: EntryStatus;
  value?: number;
  notes?: string;
  duration_minutes?: number;
  mood?: MoodLevel;
  energy_level?: number;
  difficulty_felt?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  habit?: Habit;
}

// Habit Streak
export interface HabitStreak {
  id: string;
  habit_id: string;
  start_date: string;
  end_date?: string;
  length: number;
  broken_at?: string;
  reason?: string;
  created_at: string;
}

// Habit Template
export interface HabitTemplate {
  id: string;
  category: HabitCategory;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  duration_minutes?: number;
  difficulty: HabitDifficulty;
  time_of_day?: HabitTime;
  icon?: string;
  color?: string;
  is_system: boolean;
  created_by?: string;
  usage_count: number;
  rating?: number;
  metadata: Record<string, any>;
  created_at: string;
}

// Habit Reminder
export interface HabitReminder {
  id: string;
  habit_id: string;
  reminder_type: ReminderType;
  time?: string;
  days_of_week?: number[];
  location?: Location;
  trigger_habit_id?: string;
  message?: string;
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
}

// Habit Analytics
export interface HabitAnalytics {
  id: string;
  habit_id: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  completion_rate: number;
  total_completions: number;
  total_misses: number;
  total_skips: number;
  average_mood?: number;
  average_energy?: number;
  average_difficulty?: number;
  calculated_at: string;
}

// Habit-Goal Link
export interface HabitGoalLink {
  id: string;
  habit_id: string;
  goal_id: string;
  contribution_weight: number;
  created_at: string;
}

// Input types for mutations
export interface CreateHabitInput {
  workspace_id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  type: HabitType;
  frequency: HabitFrequency;
  custom_frequency?: CustomFrequency;
  target_streak?: number;
  difficulty: HabitDifficulty;
  time_of_day?: HabitTime;
  duration_minutes?: number;
  reminder_time?: string;
  reminder_enabled?: boolean;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  archived_at?: string | null;
  position?: number;
}

export interface CreateHabitEntryInput {
  habit_id: string;
  date: string;
  status: EntryStatus;
  value?: number;
  notes?: string;
  duration_minutes?: number;
  mood?: MoodLevel;
  energy_level?: number;
  difficulty_felt?: number;
}

export interface UpdateHabitEntryInput extends Partial<Omit<CreateHabitEntryInput, 'habit_id' | 'date'>> {}

export interface CreateHabitReminderInput {
  habit_id: string;
  reminder_type: ReminderType;
  time?: string;
  days_of_week?: number[];
  location?: Location;
  trigger_habit_id?: string;
  message?: string;
  is_active?: boolean;
}

export interface UpdateHabitReminderInput extends Partial<Omit<CreateHabitReminderInput, 'habit_id'>> {}

// Filter and sort options
export interface HabitFilters {
  category?: HabitCategory;
  type?: HabitType;
  frequency?: HabitFrequency;
  difficulty?: HabitDifficulty;
  time_of_day?: HabitTime;
  archived?: boolean;
  search?: string;
  tags?: string[];
}

export type HabitSortBy = 'position' | 'streak' | 'completion_rate' | 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc';

// Analytics and insights
export interface HabitTrend {
  date: string;
  completions: number;
  completion_rate: number;
  streak: number;
  mood?: number;
  energy?: number;
}

export interface HabitHeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub-style intensity
}

export interface HabitInsight {
  type: 'streak_milestone' | 'consistency_drop' | 'best_time' | 'correlation' | 'suggestion';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  habit_id?: string;
  metadata?: Record<string, any>;
}

// Streak leaderboard
export interface StreakLeaderboardEntry {
  habit: Habit;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  rank: number;
}

// Calendar data for month view
export interface HabitCalendarData {
  date: string;
  entry?: HabitEntry;
  is_due: boolean;
  is_today: boolean;
  is_future: boolean;
}
