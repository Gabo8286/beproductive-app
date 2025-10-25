import type { AutomationRule } from "@/hooks/useAutomation";

// Enhanced AI Automation Types
export type AIAutomationType =
  | "smart_prioritization"
  | "pattern_recognition"
  | "workflow_optimization"
  | "predictive_scheduling"
  | "intelligent_tagging"
  | "cross_module_chain"
  | "natural_language_rule"
  | "adaptive_workflow"
  | "sentiment_analysis"
  | "time_optimization";

export type TriggerType =
  | "time_based"
  | "event_based"
  | "pattern_based"
  | "ai_predicted"
  | "user_behavior"
  | "performance_metric"
  | "cross_module"
  | "natural_language";

export type ActionType =
  | "modify_task"
  | "create_goal"
  | "update_habit"
  | "send_notification"
  | "execute_process"
  | "ai_suggestion"
  | "workflow_redirect"
  | "insight_generation"
  | "optimization_trigger";

export interface AIContext {
  user_patterns: Record<string, any>;
  performance_metrics: Record<string, number>;
  usage_history: Record<string, any>;
  preferences: Record<string, any>;
  environment_factors: Record<string, any>;
}

export interface SmartTriggerCondition {
  type: TriggerType;
  conditions: Record<string, any>;
  confidence_threshold?: number;
  learning_enabled?: boolean;
  context_requirements?: string[];
  ml_model_version?: string;
}

export interface SmartAction {
  type: ActionType;
  parameters: Record<string, any>;
  fallback_action?: SmartAction;
  success_criteria?: Record<string, any>;
  learning_feedback?: boolean;
}

export interface AIAutomationRule
  extends Omit<AutomationRule, "trigger_conditions" | "actions"> {
  ai_type: AIAutomationType;
  smart_triggers: SmartTriggerCondition[];
  smart_actions: SmartAction[];
  ai_context: AIContext;
  learning_enabled: boolean;
  confidence_score: number;
  optimization_target?: string;
  feedback_loops: string[];
  cross_module_dependencies: string[];
  natural_language_description?: string;
  performance_metrics: {
    accuracy: number;
    efficiency_gain: number;
    user_satisfaction: number;
    false_positive_rate: number;
    execution_time_ms: number;
  };
}

export interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  ai_type: AIAutomationType;
  confidence: number;
  potential_impact: "low" | "medium" | "high" | "critical";
  implementation_complexity: "simple" | "moderate" | "complex";
  estimated_time_saved_minutes: number;
  suggested_rule: Partial<AIAutomationRule>;
  reasoning: string;
  evidence: string[];
  user_patterns_used: string[];
  created_at: string;
  status: "pending" | "accepted" | "rejected" | "implemented";
}

export interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  modules: string[];
  steps: WorkflowStep[];
  triggers: SmartTriggerCondition[];
  success_criteria: Record<string, any>;
  performance_metrics: {
    completion_rate: number;
    average_execution_time: number;
    user_satisfaction: number;
    error_rate: number;
  };
  ai_optimizations: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  module: string;
  action: SmartAction;
  conditions: Record<string, any>;
  timeout_seconds?: number;
  retry_policy?: {
    max_attempts: number;
    backoff_strategy: "linear" | "exponential";
  };
  ai_enhancements: {
    dynamic_parameters: boolean;
    outcome_prediction: boolean;
    adaptive_timing: boolean;
  };
}

export interface NaturalLanguageRule {
  id: string;
  user_input: string;
  parsed_intent: {
    action: string;
    conditions: Record<string, any>;
    parameters: Record<string, any>;
    confidence: number;
  };
  generated_rule: Partial<AIAutomationRule>;
  status: "parsing" | "confirmed" | "active" | "failed";
  clarifications_needed: string[];
  examples: string[];
  created_at: string;
}

export interface AIInsight {
  id: string;
  type: "pattern" | "optimization" | "prediction" | "anomaly";
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  actionable: boolean;
  suggested_actions: AutomationSuggestion[];
  related_modules: string[];
  created_at: string;
  expires_at?: string;
}

export interface OptimizationResult {
  id: string;
  optimization_type: string;
  before_metrics: Record<string, number>;
  after_metrics: Record<string, number>;
  improvement_percentage: number;
  actions_taken: string[];
  time_period: {
    start: string;
    end: string;
  };
  affected_workflows: string[];
  user_feedback?: {
    rating: number;
    comments: string;
  };
}

export interface LearningData {
  user_id: string;
  patterns: {
    work_hours: number[];
    productive_times: string[];
    task_preferences: Record<string, any>;
    completion_patterns: Record<string, any>;
    interruption_patterns: Record<string, any>;
  };
  performance_trends: {
    productivity_score: number[];
    completion_rates: number[];
    time_estimates_accuracy: number[];
    goal_achievement_rate: number[];
  };
  context_awareness: {
    calendar_integration: Record<string, any>;
    location_patterns: Record<string, any>;
    device_usage: Record<string, any>;
    app_switching_patterns: Record<string, any>;
  };
  feedback_history: {
    automation_ratings: number[];
    suggestion_acceptance_rate: number;
    manual_overrides: number;
    feature_usage: Record<string, number>;
  };
  updated_at: string;
}

export interface CrossModuleConnection {
  source_module: string;
  target_module: string;
  connection_type: "trigger" | "data_flow" | "dependency" | "optimization";
  mapping: Record<string, string>;
  conditions: Record<string, any>;
  ai_enhanced: boolean;
  performance_impact: number;
}
