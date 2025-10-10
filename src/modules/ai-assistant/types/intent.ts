// Intent Recognition Types
export type IntentType =
  | 'create-task'
  | 'create-goal'
  | 'create-habit'
  | 'create-note'
  | 'update-task'
  | 'update-goal'
  | 'complete-task'
  | 'prioritize-tasks'
  | 'schedule-task'
  | 'get-summary'
  | 'get-insights'
  | 'navigate-to'
  | 'voice-command'
  | 'automation-request'
  | 'general-question';

export type IntentConfidence = 'low' | 'medium' | 'high' | 'very-high';

export interface Intent {
  type: IntentType;
  confidence: number;
  confidenceLevel: IntentConfidence;
  entities: Record<string, any>;
  rawText: string;
  processedAt: Date;
  context?: {
    currentPhase?: string;
    activeModule?: string;
    recentActions?: string[];
    userPreferences?: Record<string, any>;
  };
}

export interface EntityExtraction {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
  estimatedTime?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  targetModule?: string;
  actionType?: string;
  parameters?: Record<string, any>;
}

export interface IntentProcessingResult {
  intent: Intent;
  suggestedActions: SuggestedAction[];
  needsClarification: boolean;
  clarificationQuestions: string[];
  confidence: number;
  processingTime: number;
}

export interface SuggestedAction {
  id: string;
  type: 'create' | 'update' | 'navigate' | 'execute';
  module: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  description: string;
  previewText?: string;
}

export interface IntentContext {
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: Intent;
  }>;
  currentWorkspace: {
    activeModule?: string;
    currentPhase?: string;
    recentTasks?: any[];
    recentGoals?: any[];
  };
  userProfile: {
    preferences: Record<string, any>;
    patterns: Record<string, any>;
    timezone: string;
    workingHours?: {
      start: string;
      end: string;
    };
  };
}