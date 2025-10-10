// Conversation Types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    processingTime?: number;
    suggestedActions?: any[];
    attachments?: any[];
  };
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  startedAt: Date;
  lastActivity: Date;
  messageCount: number;
  currentTopic?: string;
  activeModules: string[];
  userPreferences: Record<string, any>;
}

export interface ConversationState {
  messages: ConversationMessage[];
  context: ConversationContext;
  isProcessing: boolean;
  waitingForClarification: boolean;
  pendingActions: PendingAction[];
}

export interface PendingAction {
  id: string;
  type: string;
  module: string;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ConversationSuggestion {
  id: string;
  text: string;
  type: 'quick-action' | 'follow-up' | 'clarification';
  priority: number;
  module?: string;
  action?: string;
}

export interface ConversationHistory {
  sessionId: string;
  messages: ConversationMessage[];
  summary: string;
  keyTopics: string[];
  actionsTaken: number;
  startTime: Date;
  endTime?: Date;
  satisfaction?: number;
}