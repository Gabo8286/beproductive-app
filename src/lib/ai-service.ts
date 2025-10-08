// AI service - powered by AIServiceManager
import { aiServiceManager, AIServiceRequest, AIServiceResponse } from "@/services/ai/aiServiceManager";
import { APIProviderType } from "@/types/api-management";

export interface AIConfig {
  provider: APIProviderType;
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

export interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: {
    pattern: string;
    description: string;
  };
  duration_minutes?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime';
  category: string;
  confidence: number;
  reasoning: string;
}

export const generateInsight = async (
  prompt: string,
  provider: APIProviderType = 'openai',
  userId: string
): Promise<ProductivityInsight> => {
  try {
    const request: AIServiceRequest = {
      provider,
      prompt: `Generate a productivity insight based on this data: ${prompt}.
               Respond with a JSON object containing: type, title, description, impact, actionable (boolean), confidence (0-1), and suggestedActions (array).`,
      userId,
      requestType: 'productivity_insight',
      maxTokens: 500,
      temperature: 0.7
    };

    const response = await aiServiceManager.makeRequest(request);

    if (!response.success) {
      throw new Error(response.error || 'AI service request failed');
    }

    try {
      const parsed = JSON.parse(response.content);
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: parsed.type || 'general',
        title: parsed.title || 'AI Generated Insight',
        description: parsed.description || response.content,
        impact: parsed.impact || 'medium',
        actionable: parsed.actionable || true,
        confidence: parsed.confidence || 0.5,
        suggestedActions: parsed.suggestedActions || []
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'general',
        title: 'AI Generated Insight',
        description: response.content,
        impact: 'medium',
        actionable: true,
        confidence: 0.5,
        suggestedActions: []
      };
    }
  } catch (error) {
    console.error('Error generating insight:', error);
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'error',
      title: 'Unable to Generate Insight',
      description: 'The AI service is currently unavailable. Please try again later.',
      impact: 'low',
      actionable: false,
      confidence: 0
    };
  }
};

export const analyzeText = async (
  text: string,
  provider: APIProviderType = 'openai',
  userId: string
): Promise<{ sentiment: string; keywords: string[] }> => {
  try {
    const request: AIServiceRequest = {
      provider,
      prompt: `Analyze the sentiment and extract keywords from this text: "${text}".
               Respond with JSON: {"sentiment": "positive|negative|neutral", "keywords": ["word1", "word2", ...]}`,
      userId,
      requestType: 'text_analysis',
      maxTokens: 200,
      temperature: 0.3
    };

    const response = await aiServiceManager.makeRequest(request);

    if (!response.success) {
      throw new Error(response.error || 'AI service request failed');
    }

    try {
      const parsed = JSON.parse(response.content);
      return {
        sentiment: parsed.sentiment || 'neutral',
        keywords: parsed.keywords || []
      };
    } catch (parseError) {
      return { sentiment: 'neutral', keywords: [] };
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    return { sentiment: 'neutral', keywords: [] };
  }
};

export const generateHabitSuggestions = async (
  goalTitle: string,
  goalDescription: string,
  provider: APIProviderType = 'openai',
  userId: string
): Promise<HabitSuggestion[]> => {
  try {
    const request: AIServiceRequest = {
      provider,
      prompt: `Based on this goal: "${goalTitle}" - "${goalDescription}", suggest 3-5 specific, actionable habits that would help achieve this goal.

For each habit, provide:
- title: Clear, specific habit name
- description: Brief explanation of what to do
- frequency: daily, weekly, monthly, or custom
- customFrequency: If custom, provide pattern and description
- duration_minutes: Estimated time needed (optional)
- difficulty: easy, medium, hard, or extreme
- time_of_day: morning, afternoon, evening, or anytime
- category: health, productivity, learning, mindfulness, social, financial, creative, or other
- confidence: 0-1 score for how effective this habit would be
- reasoning: Brief explanation of why this habit helps achieve the goal

Respond with a JSON array of habit objects following this structure exactly.`,
      userId,
      requestType: 'habit_suggestions',
      maxTokens: 1500,
      temperature: 0.7
    };

    const response = await aiServiceManager.makeRequest(request);

    if (!response.success) {
      throw new Error(response.error || 'AI service request failed');
    }

    try {
      const parsed = JSON.parse(response.content);

      if (Array.isArray(parsed)) {
        return parsed.map((habit, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: habit.title || `Habit ${index + 1}`,
          description: habit.description || '',
          frequency: habit.frequency || 'daily',
          customFrequency: habit.customFrequency,
          duration_minutes: habit.duration_minutes,
          difficulty: habit.difficulty || 'medium',
          time_of_day: habit.time_of_day || 'anytime',
          category: habit.category || 'other',
          confidence: habit.confidence || 0.7,
          reasoning: habit.reasoning || ''
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse habit suggestions:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating habit suggestions:', error);
    return [];
  }
};

export default {
  generateInsight,
  analyzeText,
  generateHabitSuggestions
};
