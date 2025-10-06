/**
 * Prediction and AI Insights Types
 */

export type ModelType =
  | "productivity_forecasting"
  | "burnout_detection"
  | "goal_achievement_prediction"
  | "habit_formation_likelihood"
  | "optimal_work_schedule";

export interface PredictionContext {
  user_id: string;
  timeframe: string;
  data_sources: string[];
  preferences?: Record<string, any>;
}

export interface ContributingFactor {
  factor: string;
  impact: number;
  explanation: string;
}

export interface RecommendedAction {
  action: string;
  priority: "low" | "medium" | "high";
  description: string;
}
