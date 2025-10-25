// =====================================================
// REFLECTIONS SYSTEM TYPES
// Matches database schema from Sprint 6
// =====================================================

import type { Database } from "@/integrations/supabase/types";

import type { Goal } from "./goals";
import type { Habit } from "./habits";

// Enums matching database types
export type ReflectionType =
  | "daily"
  | "weekly"
  | "monthly"
  | "project"
  | "goal"
  | "habit"
  | "custom";
export type MoodLevel =
  | "amazing"
  | "great"
  | "good"
  | "neutral"
  | "bad"
  | "terrible";
export type TemplateCategory =
  | "daily"
  | "weekly"
  | "monthly"
  | "project"
  | "goal_review"
  | "habit_review"
  | "personal"
  | "professional"
  | "custom";
export type PromptCategory =
  | "gratitude"
  | "challenges"
  | "wins"
  | "learning"
  | "planning"
  | "mood"
  | "goals"
  | "habits"
  | "relationships"
  | "growth";
export type PromptFrequency = "daily" | "weekly" | "monthly" | "occasional";
export type GoalReflectionType =
  | "progress_review"
  | "milestone_achieved"
  | "challenge_faced"
  | "strategy_adjustment"
  | "completion_celebration";
export type HabitReflectionType =
  | "streak_milestone"
  | "consistency_review"
  | "difficulty_adjustment"
  | "motivation_analysis"
  | "pattern_recognition";
export type AnalyticsPeriod = "week" | "month" | "quarter" | "year";
export type ShareType = "read_only" | "comment_enabled" | "collaborative";

// Database types
type DbReflection = Database["public"]["Tables"]["reflections"]["Row"];
type DbReflectionTemplate =
  Database["public"]["Tables"]["reflection_templates"]["Row"];
type DbReflectionPrompt =
  Database["public"]["Tables"]["reflection_prompts"]["Row"];

// Core Reflection interface
export interface Reflection {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  reflection_type: ReflectionType;
  mood?: MoodLevel;
  energy_level?: number;
  stress_level?: number;
  satisfaction_level?: number;
  gratitude_items: string[];
  challenges: string[];
  wins: string[];
  learnings: string[];
  tomorrow_focus: string[];
  reflection_date: string;
  created_by: string;
  is_private: boolean;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Reflection with computed fields
export interface ReflectionWithRelations extends Reflection {
  streak_count?: number;
  linked_goals?: Goal[];
  linked_habits?: Habit[];
  goal_links?: ReflectionGoalLink[];
  habit_links?: ReflectionHabitLink[];
}

// Reflection Template
export interface ReflectionTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  prompts: TemplatePrompt[];
  structure: TemplateStructure;
  is_system: boolean;
  created_by?: string;
  usage_count: number;
  rating?: number;
  is_public: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

// Reflection Prompt
export interface ReflectionPrompt {
  id: string;
  prompt_text: string;
  category: PromptCategory;
  difficulty_level: number;
  frequency: PromptFrequency;
  is_system: boolean;
  created_by?: string;
  usage_count: number;
  effectiveness_score?: number;
  metadata: Record<string, any>;
  created_at: string;
}

// Reflection Goal Link
export interface ReflectionGoalLink {
  id: string;
  reflection_id: string;
  goal_id: string;
  reflection_type: GoalReflectionType;
  insights?: string;
  action_items: string[];
  created_at: string;
  goal?: Goal;
}

// Reflection Habit Link
export interface ReflectionHabitLink {
  id: string;
  reflection_id: string;
  habit_id: string;
  reflection_type: HabitReflectionType;
  observations?: string;
  adjustments: string[];
  created_at: string;
  habit?: Habit;
}

// Reflection Analytics
export interface ReflectionAnalytics {
  id: string;
  user_id: string;
  period_type: AnalyticsPeriod;
  period_start: string;
  period_end: string;
  total_reflections: number;
  average_mood: number;
  average_energy: number;
  average_stress: number;
  average_satisfaction: number;
  top_themes: string[];
  growth_indicators: Record<string, any>;
  pattern_insights: Record<string, any>;
  calculated_at: string;
}

// Reflection Share
export interface ReflectionShare {
  id: string;
  reflection_id: string;
  shared_with_user_id?: string;
  shared_with_workspace: boolean;
  share_type: ShareType;
  shared_by: string;
  expires_at?: string;
  created_at: string;
}

// Input types for mutations
export interface CreateReflectionInput {
  workspace_id: string;
  title: string;
  content: string;
  reflection_type: ReflectionType;
  mood?: MoodLevel;
  energy_level?: number;
  stress_level?: number;
  satisfaction_level?: number;
  gratitude_items?: string[];
  challenges?: string[];
  wins?: string[];
  learnings?: string[];
  tomorrow_focus?: string[];
  reflection_date: string;
  is_private?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateReflectionInput
  extends Partial<Omit<CreateReflectionInput, "workspace_id">> {}

export interface CreateReflectionTemplateInput {
  name: string;
  description?: string;
  category: TemplateCategory;
  prompts: TemplatePrompt[];
  structure: TemplateStructure;
  is_public?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateReflectionTemplateInput
  extends Partial<CreateReflectionTemplateInput> {}

export interface CreateReflectionGoalLinkInput {
  reflection_id: string;
  goal_id: string;
  reflection_type: GoalReflectionType;
  insights?: string;
  action_items?: string[];
}

export interface CreateReflectionHabitLinkInput {
  reflection_id: string;
  habit_id: string;
  reflection_type: HabitReflectionType;
  observations?: string;
  adjustments?: string[];
}

// Helper types
export interface TemplatePrompt {
  id: string;
  text: string;
  category: PromptCategory;
  required: boolean;
  order: number;
}

export interface TemplateStructure {
  sections: TemplateSection[];
  default_values: Record<string, any>;
}

export interface TemplateSection {
  id: string;
  title: string;
  prompts: string[];
  order: number;
}

// Filter and sort options
export interface ReflectionFilters {
  reflection_type?: ReflectionType;
  mood?: MoodLevel;
  date_from?: string;
  date_to?: string;
  tags?: string[];
  search?: string;
  linked_goals?: string[];
  linked_habits?: string[];
  is_private?: boolean;
}

export type ReflectionSortBy =
  | "reflection_date"
  | "created_at"
  | "title"
  | "mood";
export type SortOrder = "asc" | "desc";

// Analytics types
export interface ReflectionInsight {
  type:
    | "mood_trend"
    | "energy_pattern"
    | "stress_alert"
    | "growth_opportunity"
    | "consistency_achievement";
  title: string;
  description: string;
  action?: string;
  priority: "low" | "medium" | "high";
  metadata?: Record<string, any>;
}

export interface ReflectionTrend {
  date: string;
  mood?: number;
  energy?: number;
  stress?: number;
  satisfaction?: number;
  reflection_count: number;
}

export interface ReflectionStreakData {
  current_streak: number;
  longest_streak: number;
  last_reflection_date?: string;
  next_milestone: number;
}
