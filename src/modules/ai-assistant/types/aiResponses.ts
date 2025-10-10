// AI Response Types
export interface AIResponse {
  id: string;
  content: string;
  type: 'text' | 'action' | 'clarification' | 'suggestion' | 'error';
  confidence: number;
  timestamp: Date;
  processingTime: number;
  metadata?: {
    intentRecognized?: string;
    actionsExecuted?: string[];
    suggestedFollowUps?: string[];
    errors?: string[];
  };
}

export interface ActionResponse extends AIResponse {
  type: 'action';
  actions: ExecutedAction[];
  results: ActionResult[];
}

export interface ExecutedAction {
  id: string;
  type: string;
  module: string;
  parameters: Record<string, any>;
  executedAt: Date;
  success: boolean;
  result?: any;
  error?: string;
}

export interface ActionResult {
  actionId: string;
  success: boolean;
  data?: any;
  error?: string;
  affectedEntities?: {
    type: string;
    id: string;
    changes: Record<string, any>;
  }[];
}

export interface ClarificationResponse extends AIResponse {
  type: 'clarification';
  questions: ClarificationQuestion[];
  context: Record<string, any>;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'date' | 'number' | 'boolean';
  options?: string[];
  required: boolean;
  defaultValue?: any;
}

export interface SuggestionResponse extends AIResponse {
  type: 'suggestion';
  suggestions: ResponseSuggestion[];
  category: 'productivity' | 'automation' | 'workflow' | 'optimization';
}

export interface ResponseSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'automation' | 'workflow' | 'setting';
  confidence: number;
  estimatedBenefit: string;
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    requiredModules: string[];
  };
  preview?: {
    beforeState: string;
    afterState: string;
  };
}

export interface ErrorResponse extends AIResponse {
  type: 'error';
  errorCode: string;
  errorMessage: string;
  possibleCauses: string[];
  suggestedSolutions: string[];
  retryable: boolean;
}