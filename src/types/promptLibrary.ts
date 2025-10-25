// Core types for Luna's Prompt Library and Intent Recognition System

export type PromptCategory =
  | 'tasks'
  | 'goals'
  | 'habits'
  | 'projects'
  | 'analytics'
  | 'planning'
  | 'reflection'
  | 'navigation'
  | 'settings'
  | 'general';

export type PromptAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'analyze'
  | 'plan'
  | 'review'
  | 'optimize'
  | 'navigate'
  | 'configure'
  | 'explain';

export type ResponseType =
  | 'structured'
  | 'conversational'
  | 'action'
  | 'navigation'
  | 'confirmation';

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'certain';

// User intent extracted from natural language input
export interface UserIntent {
  id: string;
  category: PromptCategory;
  action: PromptAction;
  entities: Record<string, any>;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  promptId: string;
  requiresConfirmation: boolean;
  rawInput: string;
  timestamp: Date;
  context?: AppContext;
}

// Application context for intent processing
export interface AppContext {
  currentRoute: string;
  currentModule: string;
  userState: {
    tasks: any[];
    goals: any[];
    habits: any[];
    projects: any[];
    recentActivity: any[];
  };
  timeContext: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    currentDate: Date;
  };
  userPreferences: {
    language: string;
    timezone: string;
    workingHours: { start: string; end: string };
    communicationStyle: 'brief' | 'detailed' | 'conversational';
  };
  sessionContext: {
    recentIntents: UserIntent[];
    conversationHistory: any[];
    currentFocus?: string;
  };
}

// Keyword mapping for different languages and contexts
export interface KeywordMapping {
  primary: string[];
  synonyms: string[];
  multilingual: {
    en: string[];
    es: string[];
    fr: string[];
    de: string[];
  };
  contextVariations: string[];
  informalVersions: string[];
  technicalTerms: string[];
}

// JSON schema for structured responses
export interface JsonSchema {
  type: string;
  properties: Record<string, any>;
  required: string[];
  additionalProperties?: boolean;
}

// Core prompt template structure
export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  name: string;
  description: string;
  version: string;
  keywords: KeywordMapping;

  // Prompt engineering
  systemPrompt: string;
  userPromptTemplate: string;
  contextInstructions: string[];
  constraints: string[];

  // Response configuration
  expectedResponse: ResponseType;
  outputFormat?: JsonSchema;
  maxTokens?: number;
  temperature?: number;

  // Examples and training data
  examples: PromptExample[];
  variations: string[];

  // Metadata
  author: string;
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isPublic: boolean;

  // Performance tracking
  usage: PromptUsageStats;
  performance: PromptPerformance;

  created: Date;
  updated: Date;
}

// Example training data for prompts
export interface PromptExample {
  userInput: string;
  expectedIntent: Partial<UserIntent>;
  expectedOutput: any;
  context?: Partial<AppContext>;
  notes?: string;
}

// Prompt usage statistics
export interface PromptUsageStats {
  totalUses: number;
  uniqueUsers: number;
  averageResponseTime: number;
  lastUsed: Date;
  popularVariations: string[];
  commonFollowUps: string[];
}

// Prompt performance metrics
export interface PromptPerformance {
  successRate: number;
  userSatisfactionScore: number;
  accuracyRate: number;
  completionRate: number;
  errorRate: number;
  feedback: PromptFeedback[];
}

// User feedback on prompt effectiveness
export interface PromptFeedback {
  id: string;
  userId: string;
  promptId: string;
  rating: number; // 1-5
  feedback: string;
  wasHelpful: boolean;
  suggestedImprovements?: string;
  timestamp: Date;
}

// Custom user-created prompts
export interface CustomPrompt extends Omit<PromptTemplate, 'id' | 'author' | 'usage' | 'performance'> {
  userId: string;
  isShared: boolean;
  parentPromptId?: string; // If derived from existing prompt
  customizations: {
    modifiedFields: string[];
    originalValues: Record<string, any>;
  };
}

// Prompt chain for complex workflows
export interface PromptChain {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  steps: PromptChainStep[];
  conditions: ChainCondition[];
  fallbacks: string[];
  estimatedTime: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PromptChainStep {
  id: string;
  promptId: string;
  order: number;
  name: string;
  description: string;
  isOptional: boolean;
  conditions?: string[];
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

export interface ChainCondition {
  type: 'user_response' | 'data_availability' | 'context_check' | 'validation';
  condition: string;
  trueAction: 'continue' | 'skip' | 'branch' | 'terminate';
  falseAction: 'retry' | 'fallback' | 'ask_user' | 'terminate';
  parameters?: Record<string, any>;
}

// Intent recognition configuration
export interface IntentRecognitionConfig {
  confidenceThreshold: number;
  enableLearning: boolean;
  fallbackToGeneral: boolean;
  multiIntentHandling: 'select_best' | 'ask_user' | 'handle_all';
  contextWeight: number;
  keywordWeight: number;
  semanticWeight: number;
}

// Search and filtering options
export interface PromptSearchOptions {
  query?: string;
  category?: PromptCategory;
  tags?: string[];
  difficulty?: string;
  author?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'recent';
  limit?: number;
  offset?: number;
}

// Library statistics and analytics
export interface PromptLibraryStats {
  totalPrompts: number;
  categoryCounts: Record<PromptCategory, number>;
  averageRating: number;
  mostPopularPrompts: string[];
  recentlyAdded: string[];
  topPerformers: string[];
  userEngagement: {
    activeUsers: number;
    averageSessionLength: number;
    promptsPerSession: number;
  };
}

// Event types for prompt library analytics
export type PromptLibraryEvent =
  | 'prompt_used'
  | 'intent_recognized'
  | 'intent_failed'
  | 'prompt_created'
  | 'prompt_modified'
  | 'feedback_submitted'
  | 'chain_started'
  | 'chain_completed'
  | 'chain_abandoned';

export interface PromptLibraryEventData {
  eventType: PromptLibraryEvent;
  userId: string;
  promptId?: string;
  chainId?: string;
  intentId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// API response types
export interface PromptLibraryResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    hasMore?: boolean;
  };
}

export type GetPromptsResponse = PromptLibraryResponse<PromptTemplate[]>;
export type GetPromptResponse = PromptLibraryResponse<PromptTemplate>;
export type RecognizeIntentResponse = PromptLibraryResponse<UserIntent>;
export type SearchPromptsResponse = PromptLibraryResponse<PromptTemplate[]>;
export type LibraryStatsResponse = PromptLibraryResponse<PromptLibraryStats>;