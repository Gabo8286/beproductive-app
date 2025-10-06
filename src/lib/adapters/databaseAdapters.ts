/**
 * Database Adapters
 * Converts between database schema (snake_case) and application types (camelCase)
 */

import type { Database } from "@/integrations/supabase/types";

type DbPrediction = Database["public"]["Tables"]["ai_predictive_insights"]["Row"];

export interface PredictionResult {
  id: string;
  user_id: string;
  model_type: string;
  prediction_value: any;
  confidence_score: number;
  contributing_factors: Record<string, any>;
  recommended_actions: Array<{ action: string; priority: string }>;
  metadata: Record<string, any>;
  created_at: string;
  expires_at: string | null;
}

/**
 * Converts database prediction to application format
 */
export function adaptPredictionFromDb(dbPrediction: DbPrediction): PredictionResult {
  return {
    id: dbPrediction.id,
    user_id: dbPrediction.user_id,
    model_type: dbPrediction.model_type,
    prediction_value: dbPrediction.prediction_value,
    confidence_score: dbPrediction.confidence_score,
    contributing_factors: (dbPrediction.contributing_factors || {}) as Record<string, any>,
    recommended_actions: (dbPrediction.recommended_actions || []) as Array<{ action: string; priority: string }>,
    metadata: (dbPrediction.metadata || {}) as Record<string, any>,
    created_at: dbPrediction.created_at,
    expires_at: dbPrediction.expires_at,
  };
}

/**
 * Type guard for checking if a value is a valid prediction result
 */
export function isPredictionResult(value: any): value is PredictionResult {
  return (
    value &&
    typeof value === "object" &&
    "id" in value &&
    "user_id" in value &&
    "model_type" in value &&
    "prediction_value" in value &&
    "confidence_score" in value
  );
}

/**
 * Safe accessor for pattern properties that might not exist
 */
export function getPatternProperty<T = any>(
  pattern: any,
  property: string,
  defaultValue: T
): T {
  if (!pattern || typeof pattern !== "object") {
    return defaultValue;
  }
  return (pattern[property] ?? defaultValue) as T;
}
