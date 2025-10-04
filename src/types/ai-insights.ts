import { Database } from "@/integrations/supabase/types";

export type AIProvider = Database["public"]["Enums"]["ai_provider"];
export type AIInsightType = Database["public"]["Enums"]["ai_insight_type"];
export type AIRecommendationStatus =
  Database["public"]["Enums"]["ai_recommendation_status"];

export interface AIInsight {
  id: string;
  user_id: string;
  type: AIInsightType;
  title: string;
  content: string;
  summary?: string;
  provider: AIProvider;
  confidence_score?: number;
  metadata: Record<string, any>;
  data_sources: string[];
  is_read: boolean;
  is_archived: boolean;
  generated_at: string;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  insight_id?: string;
  user_id: string;
  title: string;
  description: string;
  implementation_steps: string[];
  expected_impact?: string;
  effort_level?: "low" | "medium" | "high";
  status: AIRecommendationStatus;
  priority: number;
  metadata: Record<string, any>;
  completed_at?: string;
  dismissed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIServiceUsage {
  id: string;
  user_id: string;
  provider: AIProvider;
  model_name?: string;
  tokens_used: number;
  estimated_cost: number;
  request_type?: string;
  success: boolean;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AIUserPreferences {
  id: string;
  user_id: string;
  preferred_provider: AIProvider;
  auto_generate_insights: boolean;
  insight_frequency: "daily" | "weekly" | "monthly" | "manual";
  enabled_insight_types: AIInsightType[];
  notification_preferences: Record<string, any>;
  privacy_settings: {
    share_anonymous_data: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AIUsageStats {
  total_cost: number;
  total_tokens: number;
  request_count: number;
  by_provider: Record<
    AIProvider,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
}

export interface GenerateInsightsRequest {
  insightTypes?: AIInsightType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface InsightFilter {
  types?: AIInsightType[];
  isRead?: boolean;
  isArchived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export const INSIGHT_TYPE_LABELS: Record<AIInsightType, string> = {
  productivity_pattern: "Productivity Pattern",
  goal_progress: "Goal Progress",
  habit_analysis: "Habit Analysis",
  time_optimization: "Time Optimization",
  task_prioritization: "Task Prioritization",
  reflection_sentiment: "Reflection Sentiment",
  project_health: "Project Health",
  burnout_risk: "Burnout Risk",
  achievement_opportunity: "Achievement Opportunity",
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini",
  lovable: "Lovable AI",
};
