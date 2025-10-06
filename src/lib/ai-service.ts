// AI service stub - temporarily disabled

export interface AIConfig {
  provider: 'anthropic' | 'openai';
  apiKey?: string;
  model?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TaskExtractionResult {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  confidence: number;
}

export interface ProductivityInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  confidence?: number;
  suggestedActions?: string[];
  data?: any;
}

export const generateInsight = async (prompt: string) => {
  return { title: 'Sample Insight', content: 'AI service temporarily disabled' };
};

export const analyzeText = async (text: string) => {
  return { sentiment: 'neutral', keywords: [] };
};

export default { generateInsight, analyzeText };
