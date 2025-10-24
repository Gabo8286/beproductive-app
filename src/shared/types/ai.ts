/**
 * AI & Luna Framework Shared Types
 * Cross-platform types for AI functionality, insights, and Luna system
 * Designed to work consistently across React TypeScript and Swift
 */

import { UUID, Timestamp, UserId, Score, ConfidenceLevel, PerformanceGrade } from './core';

// MARK: - AI Provider Types
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'local'
  | 'custom';

export type AIModelType =
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'claude-3-sonnet'
  | 'claude-3-opus'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'local-llm';

export type AICapability =
  | 'text_generation'
  | 'code_generation'
  | 'analysis'
  | 'summarization'
  | 'translation'
  | 'vision'
  | 'audio'
  | 'embeddings';

// MARK: - Luna AI Types
export type LunaAgentType =
  | 'productivity_monitor'
  | 'security_agent'
  | 'backup_coordinator'
  | 'insight_analyzer'
  | 'presentation_assistant'
  | 'workflow_optimizer'
  | 'collaboration_facilitator';

export type LunaActionType =
  | 'insights'
  | 'optimize'
  | 'backup'
  | 'security_scan'
  | 'performance_analysis'
  | 'suggestion'
  | 'automation'
  | 'presentation_mode';

export type InsightType =
  | 'productivity'
  | 'engagement'
  | 'technical'
  | 'timing'
  | 'content'
  | 'security'
  | 'performance'
  | 'collaboration';

export type SuggestionType =
  | 'layout'
  | 'content'
  | 'timing'
  | 'interaction'
  | 'technical'
  | 'workflow'
  | 'automation';

export type SuggestionPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'urgent';

// MARK: - AI Insight Interfaces
export interface AIInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  actionable: boolean;
  category: string;
  timestamp: Timestamp;
  user_id: UserId;
  data?: Record<string, any>;
  applied?: boolean;
  applied_at?: Timestamp;
}

export interface AISuggestion {
  id: UUID;
  type: SuggestionType;
  priority: SuggestionPriority;
  suggestion: string;
  implementation: string;
  confidence: ConfidenceLevel;
  estimated_impact: Score;
  category: string;
  timestamp: Timestamp;
  user_id: UserId;
  context?: Record<string, any>;
  applied?: boolean;
}

// MARK: - Luna Agent Interfaces
export interface LunaAgent {
  id: UUID;
  type: LunaAgentType;
  name: string;
  description: string;
  capabilities: AICapability[];
  is_active: boolean;
  configuration: Record<string, any>;
  last_action: Timestamp | null;
  performance_score: Score;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface LunaAction {
  id: UUID;
  agent_id: UUID;
  type: LunaActionType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration?: number; // in milliseconds
  confidence: ConfidenceLevel;
  timestamp: Timestamp;
  user_id: UserId;
}

// MARK: - Presentation AI Types
export interface PresentationInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  actionable: boolean;
  timestamp: Timestamp;
  presentation_session_id?: UUID;
  context?: PresentationContext;
  metrics?: Record<string, number>;
}

export interface PresentationSuggestion {
  id: UUID;
  type: SuggestionType;
  priority: SuggestionPriority;
  suggestion: string;
  implementation: string;
  confidence: ConfidenceLevel;
  timestamp: Timestamp;
  presentation_session_id?: UUID;
  context?: PresentationContext;
}

export interface PresentationContext {
  audience_size: number;
  presentation_type: 'team_update' | 'executive_review' | 'client_presentation' | 'personal_review';
  duration: number; // in minutes
  environment: 'conference' | 'office' | 'remote' | 'hybrid';
  device_type: string;
  display_resolution: string;
  time_of_day: string;
}

// MARK: - Performance Analysis Types
export interface PresentationPerformanceAnalysis {
  id: UUID;
  engagement_score: Score;
  clarity_score: Score;
  pacing: PacingAssessment;
  overall_score: Score;
  grade: PerformanceGrade;
  recommendations: string[];
  metrics: Record<string, number>;
  timestamp: Timestamp;
  session_id: UUID;
}

export interface PacingAssessment {
  type: 'too_fast' | 'optimal' | 'too_slow';
  description: string;
  score: Score;
  recommendations?: string[];
}

// MARK: - AI Configuration Types
export interface AIProviderConfig {
  provider: AIProvider;
  model: AIModelType;
  api_key?: string;
  endpoint?: string;
  max_tokens?: number;
  temperature?: number;
  timeout?: number; // in milliseconds
  rate_limit?: number; // requests per minute
  is_active: boolean;
  capabilities: AICapability[];
}

export interface LunaConfig {
  agents: LunaAgentType[];
  auto_insights: boolean;
  auto_suggestions: boolean;
  auto_optimization: boolean;
  presentation_mode: boolean;
  security_monitoring: boolean;
  backup_automation: boolean;
  performance_tracking: boolean;
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  insights: boolean;
  suggestions: boolean;
  security_alerts: boolean;
  performance_alerts: boolean;
  backup_status: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

// MARK: - AI Analytics Types
export interface AIUsageMetrics {
  user_id: UserId;
  provider: AIProvider;
  model: AIModelType;
  tokens_used: number;
  requests_count: number;
  cost_usd: number;
  duration: number; // in milliseconds
  success_rate: Score;
  error_count: number;
  date: string; // YYYY-MM-DD
  category: string;
}

export interface AIPerformanceMetrics {
  agent_type: LunaAgentType;
  success_rate: Score;
  average_confidence: ConfidenceLevel;
  response_time: number; // in milliseconds
  accuracy_score: Score;
  user_satisfaction: Score;
  insights_generated: number;
  suggestions_applied: number;
  errors_count: number;
  timestamp: Timestamp;
}

// MARK: - AI Conversation Types
export interface AIMessage {
  id: UUID;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  model?: AIModelType;
  tokens?: number;
  cost?: number;
  context?: Record<string, any>;
}

export interface AIConversation {
  id: UUID;
  user_id: UserId;
  title: string;
  messages: AIMessage[];
  model: AIModelType;
  provider: AIProvider;
  total_tokens: number;
  total_cost: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  tags?: string[];
  archived?: boolean;
}

// MARK: - AI Task Types
export interface AITask {
  id: UUID;
  type: 'analysis' | 'generation' | 'optimization' | 'automation';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: SuggestionPriority;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  progress: number; // 0-100
  estimated_duration?: number; // in seconds
  actual_duration?: number; // in seconds
  created_at: Timestamp;
  started_at?: Timestamp;
  completed_at?: Timestamp;
  user_id: UserId;
  agent_id?: UUID;
}

// MARK: - AI Learning Types
export interface AILearningData {
  id: UUID;
  user_id: UserId;
  category: string;
  input: Record<string, any>;
  expected_output: Record<string, any>;
  actual_output?: Record<string, any>;
  feedback_score?: Score;
  timestamp: Timestamp;
  model: AIModelType;
  context?: Record<string, any>;
}

export interface AIModelPerformance {
  model: AIModelType;
  provider: AIProvider;
  accuracy: Score;
  response_time: number;
  cost_efficiency: Score;
  user_satisfaction: Score;
  error_rate: Score;
  last_updated: Timestamp;
  sample_size: number;
}

// MARK: - Utility Types for AI
export type AIPromptTemplate = {
  id: UUID;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  use_count: number;
  rating: Score;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type AIWorkflow = {
  id: UUID;
  name: string;
  description: string;
  steps: AIWorkflowStep[];
  triggers: string[];
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type AIWorkflowStep = {
  id: UUID;
  order: number;
  type: 'prompt' | 'analysis' | 'action' | 'condition';
  configuration: Record<string, any>;
  depends_on?: UUID[];
};

// MARK: - AI Security Types
export interface AISecurityScan {
  id: UUID;
  scan_type: 'vulnerability' | 'compliance' | 'data_privacy' | 'model_safety';
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: AISecurityFinding[];
  risk_score: Score;
  recommendations: string[];
  timestamp: Timestamp;
  duration?: number;
}

export interface AISecurityFinding {
  id: UUID;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affected_component: string;
  remediation: string;
  confidence: ConfidenceLevel;
}