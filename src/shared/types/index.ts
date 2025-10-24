/**
 * Shared Types Module Index
 * Central export point for all cross-platform shared types
 * Provides consistent type definitions across React TypeScript and Swift implementations
 */

// Core foundational types
export * from './core';

// AI and Luna Framework types
export * from './ai';

// Re-export commonly used types with aliases for convenience
export type {
  UUID,
  Timestamp,
  UserId,
  UserRole,
  TaskStatus,
  TaskPriority,
  ConnectionStatus,
  ThemeMode,
  PerformanceGrade,
  Score,
  ConfidenceLevel,
  BaseEntity,
  BaseProfile,
  BaseTask,
  ApiResponse,
  PaginatedResponse,
  AppError
} from './core';

export type {
  AIProvider,
  AIModelType,
  LunaAgentType,
  InsightType,
  SuggestionType,
  AIInsight,
  AISuggestion,
  PresentationInsight,
  PresentationSuggestion,
  PresentationPerformanceAnalysis,
  AIUsageMetrics,
  LunaConfig
} from './ai';

// Type guards for runtime type checking
export const isValidUserRole = (role: string): role is UserRole => {
  return ['guest', 'user', 'premium', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(role);
};

export const isValidTaskStatus = (status: string): status is TaskStatus => {
  return ['todo', 'in_progress', 'blocked', 'done', 'cancelled'].includes(status);
};

export const isValidTaskPriority = (priority: string): priority is TaskPriority => {
  return ['low', 'medium', 'high', 'urgent', 'critical'].includes(priority);
};

export const isValidAIProvider = (provider: string): provider is AIProvider => {
  return ['openai', 'anthropic', 'google', 'local', 'custom'].includes(provider);
};

// Utility functions for type conversion
export const scoreToPercentage = (score: Score): number => Math.round(score * 100);
export const percentageToScore = (percentage: number): Score => Math.max(0, Math.min(1, percentage / 100));

export const confidenceToGrade = (confidence: ConfidenceLevel): PerformanceGrade => {
  if (confidence >= 0.9) return 'excellent';
  if (confidence >= 0.8) return 'good';
  if (confidence >= 0.7) return 'fair';
  if (confidence >= 0.6) return 'poor';
  return 'needs_improvement';
};

// Common validation patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

// Type-safe constants
export const USER_ROLES: UserRole[] = ['guest', 'user', 'premium', 'team_lead', 'admin', 'super_admin', 'enterprise'];
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent', 'critical'];
export const AI_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google', 'local', 'custom'];
export const INSIGHT_TYPES: InsightType[] = ['productivity', 'engagement', 'technical', 'timing', 'content', 'security', 'performance', 'collaboration'];

// Version information for cross-platform compatibility
export const SHARED_TYPES_VERSION = '1.0.0';
export const COMPATIBILITY_VERSION = {
  react: '>=18.0.0',
  typescript: '>=5.0.0',
  swift: '>=5.7.0',
  ios: '>=15.0'
};