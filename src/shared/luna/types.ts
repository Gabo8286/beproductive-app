/**
 * Luna AI Framework - Core Types
 * Shared type definitions for Luna AI functionality across platforms
 * Designed for compatibility between TypeScript and Swift
 */

import { UUID, Timestamp, Score, ConfidenceLevel } from '@/shared/types/core';

// MARK: - Luna Core Types

export type LunaSize = 'tiny' | 'small' | 'medium' | 'large' | 'hero';

export type LunaExpression =
  | 'default'
  | 'happy'
  | 'thinking'
  | 'confused'
  | 'excited'
  | 'success'
  | 'error'
  | 'focused'
  | 'curious'
  | 'sleeping'
  | 'busy';

export type LunaAgentType =
  | 'productivity_monitor'
  | 'security_agent'
  | 'backup_coordinator'
  | 'insight_analyzer'
  | 'presentation_assistant'
  | 'workflow_optimizer'
  | 'collaboration_facilitator'
  | 'learning_companion'
  | 'accessibility_helper';

export type LunaActionType =
  | 'insights'
  | 'optimize'
  | 'backup'
  | 'security_scan'
  | 'performance_analysis'
  | 'suggestion'
  | 'automation'
  | 'presentation_mode'
  | 'navigation_assist'
  | 'task_creation'
  | 'learning_assist';

export type LunaTaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type LunaCapability =
  | 'local_processing'
  | 'ai_integration'
  | 'visual_assets'
  | 'navigation'
  | 'productivity_insights'
  | 'task_management'
  | 'performance_monitoring'
  | 'security_scanning'
  | 'backup_management'
  | 'presentation_assistance'
  | 'workflow_optimization'
  | 'accessibility_support';

// MARK: - Luna Intelligence Types

export interface LunaTask {
  id: UUID;
  type: LunaActionType;
  status: LunaTaskStatus;
  title: string;
  description: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  confidence: ConfidenceLevel;
  executionTime?: number; // milliseconds
  handledLocally: boolean;
  suggestedActions?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  completed_at?: Timestamp;
}

export interface LunaContext {
  userInput: string;
  currentPage?: string;
  userPreferences?: Record<string, any>;
  recentTasks?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  workflowState?: 'planning' | 'executing' | 'reviewing' | 'collaborating' | 'learning' | 'idle';
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    capabilities: string[];
  };
}

export interface LunaResult {
  type: 'success' | 'fallback' | 'error';
  content: string;
  executionTime: number;
  handledLocally: boolean;
  confidence: ConfidenceLevel;
  suggestedActions?: string[];
  metadata?: Record<string, any>;
}

export interface LunaAlgorithm {
  id: UUID;
  name: string;
  description: string;
  canHandle: (context: LunaContext) => boolean;
  execute: (context: LunaContext) => Promise<LunaResult>;
  priority: number; // Higher = more priority
  capabilities: LunaCapability[];
  enabled: boolean;
  metrics: {
    success_rate: Score;
    average_confidence: ConfidenceLevel;
    total_executions: number;
    average_execution_time: number;
  };
}

// MARK: - Luna Agent Types

export interface LunaAgent {
  id: UUID;
  type: LunaAgentType;
  name: string;
  description: string;
  capabilities: LunaCapability[];
  is_active: boolean;
  configuration: Record<string, any>;
  last_action?: Timestamp;
  performance_score: Score;
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface LunaAction {
  id: UUID;
  agent_id: UUID;
  type: LunaActionType;
  status: LunaTaskStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration?: number; // milliseconds
  confidence: ConfidenceLevel;
  timestamp: Timestamp;
  user_id?: UUID;
  context?: LunaContext;
}

// MARK: - Luna Asset Types

export interface LunaAssetConfig {
  size: LunaSize;
  expression: LunaExpression;
  filename: string;
  fallback?: string;
  description?: string;
}

export interface LunaVisualState {
  size: LunaSize;
  expression: LunaExpression;
  isAnimating: boolean;
  animationType?: 'idle' | 'thinking' | 'speaking' | 'celebrating' | 'sleeping';
  customProps?: Record<string, any>;
}

// MARK: - Luna Navigation Types

export interface LunaNavigationSuggestion {
  id: UUID;
  type: 'hub' | 'sub-navigation' | 'quick-action' | 'custom';
  title: string;
  description: string;
  path?: string;
  action?: string; // Serializable action identifier
  confidence: ConfidenceLevel;
  reasoning: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'workflow' | 'temporal' | 'behavioral' | 'contextual' | 'predictive';
  timestamp: Timestamp;
  expires_at?: Timestamp;
}

export interface LunaUserBehaviorPattern {
  pattern_id: UUID;
  user_id: UUID;
  context_type: string;
  time_of_day: number; // Hour 0-23
  day_of_week: number; // 0-6
  workflow_state: string;
  frequency: number;
  last_accessed: Timestamp;
  average_duration: number; // milliseconds
  success_rate: Score;
}

// MARK: - Luna Performance Types

export interface LunaPerformanceMetrics {
  agent_type: LunaAgentType;
  success_rate: Score;
  average_confidence: ConfidenceLevel;
  response_time: number; // milliseconds
  accuracy_score: Score;
  user_satisfaction: Score;
  insights_generated: number;
  suggestions_applied: number;
  errors_count: number;
  cache_hit_rate: Score;
  local_processing_rate: Score;
  timestamp: Timestamp;
}

export interface LunaSystemHealth {
  overall_status: 'healthy' | 'degraded' | 'critical' | 'offline';
  active_agents: number;
  total_agents: number;
  processing_queue_size: number;
  cache_size: number;
  memory_usage: number; // MB
  uptime: number; // milliseconds
  last_health_check: Timestamp;
  issues: string[];
  recommendations: string[];
}

// MARK: - Luna Configuration Types

export interface LunaAgentConfig {
  type: LunaAgentType;
  enabled: boolean;
  priority: number;
  max_concurrent_tasks: number;
  timeout: number; // milliseconds
  retry_attempts: number;
  cache_enabled: boolean;
  configuration: Record<string, any>;
}

export interface LunaFrameworkConfig {
  agents: LunaAgentConfig[];
  global_settings: {
    max_cache_size: number;
    cache_ttl: number; // milliseconds
    local_processing_enabled: boolean;
    ai_fallback_enabled: boolean;
    performance_monitoring: boolean;
    debug_mode: boolean;
  };
  ui_settings: {
    default_size: LunaSize;
    default_expression: LunaExpression;
    animation_enabled: boolean;
    haptic_feedback: boolean;
    voice_feedback: boolean;
  };
  security_settings: {
    data_encryption: boolean;
    secure_storage: boolean;
    audit_logging: boolean;
    privacy_mode: boolean;
  };
}

// MARK: - Luna Event Types

export interface LunaEvent {
  id: UUID;
  type: 'task_started' | 'task_completed' | 'task_failed' | 'agent_activated' | 'insight_generated' | 'suggestion_applied' | 'user_interaction';
  source: 'agent' | 'user' | 'system';
  agent_id?: UUID;
  task_id?: UUID;
  user_id?: UUID;
  data: Record<string, any>;
  timestamp: Timestamp;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface LunaEventListener {
  id: UUID;
  event_types: string[];
  callback: (event: LunaEvent) => void;
  enabled: boolean;
  created_at: Timestamp;
}

// MARK: - Luna Analytics Types

export interface LunaUsageAnalytics {
  user_id: UUID;
  date: string; // YYYY-MM-DD
  interactions_count: number;
  local_tasks_count: number;
  ai_tasks_count: number;
  successful_tasks: number;
  failed_tasks: number;
  average_response_time: number;
  user_satisfaction_score: Score;
  features_used: string[];
  time_saved_minutes: number;
}

export interface LunaInsightAnalytics {
  insight_type: string;
  generated_count: number;
  applied_count: number;
  success_rate: Score;
  user_rating: Score;
  confidence_score: ConfidenceLevel;
  time_to_apply: number; // milliseconds
  category: string;
  date: string; // YYYY-MM-DD
}

// MARK: - Luna Learning Types

export interface LunaLearningData {
  id: UUID;
  user_id: UUID;
  category: string;
  input: Record<string, any>;
  expected_output: Record<string, any>;
  actual_output?: Record<string, any>;
  feedback_score?: Score;
  feedback_comment?: string;
  context: LunaContext;
  timestamp: Timestamp;
  model_version?: string;
}

export interface LunaPersonalization {
  user_id: UUID;
  preferences: {
    preferred_agents: LunaAgentType[];
    communication_style: 'formal' | 'casual' | 'friendly' | 'concise';
    notification_frequency: 'high' | 'medium' | 'low' | 'off';
    automation_level: 'minimal' | 'moderate' | 'aggressive';
    privacy_level: 'open' | 'moderate' | 'strict';
  };
  behavioral_patterns: LunaUserBehaviorPattern[];
  custom_algorithms: string[];
  blacklisted_features: string[];
  learning_enabled: boolean;
  updated_at: Timestamp;
}

// MARK: - Cross-Platform Compatibility Types

export interface LunaPlatformCapabilities {
  platform: 'web' | 'ios' | 'android' | 'desktop';
  supports_local_ai: boolean;
  supports_voice: boolean;
  supports_haptics: boolean;
  supports_camera: boolean;
  supports_biometrics: boolean;
  supports_background_tasks: boolean;
  max_cache_size: number;
  battery_optimization: boolean;
}

export interface LunaSyncState {
  last_sync: Timestamp;
  pending_tasks: number;
  sync_errors: string[];
  offline_capabilities: LunaCapability[];
  sync_priority: 'high' | 'medium' | 'low';
  auto_sync_enabled: boolean;
}

// MARK: - Utility Types

export type LunaCallback<T = any> = (result: T) => void;
export type LunaAsyncCallback<T = any> = (result: T) => Promise<void>;
export type LunaErrorCallback = (error: Error) => void;

export interface LunaPromise<T = any> {
  success: LunaCallback<T>;
  error: LunaErrorCallback;
  finally?: () => void;
}

// Type guards for runtime type checking
export const isLunaTask = (obj: any): obj is LunaTask => {
  return obj && typeof obj === 'object' && 'id' in obj && 'type' in obj && 'status' in obj;
};

export const isLunaAgent = (obj: any): obj is LunaAgent => {
  return obj && typeof obj === 'object' && 'id' in obj && 'type' in obj && 'capabilities' in obj;
};

export const isLunaResult = (obj: any): obj is LunaResult => {
  return obj && typeof obj === 'object' && 'type' in obj && 'content' in obj && 'confidence' in obj;
};