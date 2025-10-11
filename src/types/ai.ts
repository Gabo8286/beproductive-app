// AI Service Types
export interface AIConfig {
  provider: "anthropic" | "openai";
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TaskExtractionResult {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  category?: string;
  assignee?: string;
  confidence: number;
}

export interface ProductivityInsight {
  id: string;
  title: string;
  description: string;
  type: 'energy' | 'focus' | 'timing' | 'habits' | 'performance';
  importance: 'low' | 'medium' | 'high';
  actionable: boolean;
  dataSource: string;
  generatedAt: Date;
  confidence: number;
  impact: string;
  category?: string;
  data?: Record<string, any>;
  suggestedActions?: string[];
  relevantTimeframe?: string;
}

// NLP Types
export interface TextAnalysis {
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
  keywords: string[];
  entities: {
    dates: Date[];
    times: string[];
    people: string[];
    locations: string[];
  };
  intent: {
    action: string;
    confidence: number;
  };
}

export interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  category?: string;
  confidence: number;
}

// User Activity Data Types
export interface UserActivityData {
  tasks: TaskData[];
  goals: GoalData[];
  habits: HabitData[];
  timeEntries: TimeEntryData[];
}

export interface TaskData {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority: "low" | "medium" | "high";
  category?: string;
  estimatedTime?: number;
  actualTime?: number;
}

export interface GoalData {
  id: string;
  title: string;
  progress: number;
  deadline?: Date;
  category: string;
}

export interface HabitData {
  id: string;
  title: string;
  completions: Date[];
  target: number;
}

export interface TimeEntryData {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  category: string;
}

// AI Component Props
export interface ConversationalInterfaceProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  onTaskCreated?: (task: TaskExtractionResult) => void;
  onInsightGenerated?: (insight: ProductivityInsight) => void;
}

export interface AIChatWidgetProps {
  className?: string;
  defaultExpanded?: boolean;
  onTaskCreated?: (task: TaskExtractionResult) => void;
  onInsightGenerated?: (insight: ProductivityInsight) => void;
}

export interface AIQuickActionsProps {
  onActionTaken?: (action: string, result: any) => void;
}

export interface AIInsightDisplayProps {
  insights: ProductivityInsight[];
  className?: string;
}

// AI Context Types
export interface AIContextType {
  service: any | null; // AIService temporarily disabled
  messages: AIMessage[];
  isLoading: boolean;
  isConfigured: boolean;
  config: AIConfig | null;
  configure: (config: AIConfig) => void;
  sendMessage: (message: string) => Promise<string>;
  extractTask: (text: string) => Promise<TaskExtractionResult>;
  generateInsights: () => Promise<ProductivityInsight[]>;
  suggestNextAction: () => Promise<string>;
  clearConversation: () => void;
  error: string | null;
}

export interface AIProviderProps {
  children: React.ReactNode;
  userData?: UserActivityData;
}

// Voice Recognition Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// AI Analytics Types
export interface ProductivityMetrics {
  completionRate: number;
  averageTaskDuration: number;
  peakProductivityHours: number[];
  goalProgressRate: number;
  habitConsistency: number;
  workloadBalance: number;
}

export interface AIRecommendation {
  id: string;
  type: "schedule" | "prioritization" | "workflow" | "wellness";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  confidence: number;
  implementationSteps: string[];
}

// Error Types
export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Feature Flag Types
export interface AIFeatureFlags {
  conversationalInterface: boolean;
  voiceInput: boolean;
  predictiveInsights: boolean;
  smartSuggestions: boolean;
  contextAwareness: boolean;
  multiLanguageSupport: boolean;
}

export default {};
