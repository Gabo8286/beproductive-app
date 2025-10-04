import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { aiServiceManager, AIServiceRequest } from '@/services/ai/aiServiceManager';
import { productivityInsightsGenerator } from '@/services/ai/productivityInsightsGenerator';
import { AIProvider } from '@/types/ai-insights';

export interface CoachMessage {
  message: string;
  userId: string;
  sessionContext: {
    sessionId: string;
    messageHistory: any[];
    userFocus: string;
  };
}

export interface CoachResponse {
  content: string;
  type: 'suggestion' | 'insight' | 'question' | 'encouragement';
  confidence: number;
  relatedData?: any;
  suggestedActions?: string[];
}

export interface QuickActionResponse {
  content: string;
  confidence: number;
  actions?: string[];
}

export const useProductivityCoach = (provider: AIProvider = 'lovable') => {
  const [isGenerating, setIsGenerating] = useState(false);

  const sendMessage = async (request: CoachMessage): Promise<CoachResponse> => {
    setIsGenerating(true);

    try {
      // Get user's recent productivity data for context
      const productivityContext = await getProductivityContext(request.userId);

      // Build coaching prompt with context
      const prompt = await buildCoachingPrompt(request, productivityContext);

      const aiRequest: AIServiceRequest = {
        provider,
        prompt,
        userId: request.userId,
        requestType: 'productivity_coaching',
        maxTokens: 500,
        temperature: 0.7,
        metadata: {
          sessionId: request.sessionContext.sessionId,
          userFocus: request.sessionContext.userFocus
        }
      };

      const response = await aiServiceManager.makeRequest(aiRequest);

      if (response.success) {
        // Parse the response and determine type
        const coachResponse = parseCoachResponse(response.content);

        // Log the coaching interaction
        await logCoachingSession(request, coachResponse);

        return coachResponse;
      }

      throw new Error(response.error || 'Failed to get coaching response');
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuickActions = async (userId: string, actionType: string): Promise<QuickActionResponse> => {
    setIsGenerating(true);

    try {
      const productivityContext = await getProductivityContext(userId);
      const prompt = buildQuickActionPrompt(actionType, productivityContext);

      const aiRequest: AIServiceRequest = {
        provider,
        prompt,
        userId,
        requestType: `quick_action_${actionType}`,
        maxTokens: 300,
        temperature: 0.6
      };

      const response = await aiServiceManager.makeRequest(aiRequest);

      if (response.success) {
        return {
          content: response.content,
          confidence: 0.8,
          actions: extractActionItems(response.content)
        };
      }

      throw new Error(response.error || 'Failed to get quick action response');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSuggestions = async (userId: string, category: string): Promise<string[]> => {
    const productivityContext = await getProductivityContext(userId);

    const prompt = `Based on the user's productivity data, suggest 3-5 specific actions for ${category}:

Current context:
- Active tasks: ${productivityContext.activeTasks}
- Completed this week: ${productivityContext.completedThisWeek}
- Current goals: ${productivityContext.activeGoals}
- Recent mood: ${productivityContext.recentMood}/5

Provide actionable suggestions as a JSON array of strings.`;

    const aiRequest: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: 'get_suggestions',
      maxTokens: 200,
      temperature: 0.7
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      try {
        return JSON.parse(response.content);
      } catch {
        return [response.content];
      }
    }

    return [];
  };

  const getProductivityInsights = async (userId: string): Promise<any> => {
    const dateRange = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date()
    };

    return await productivityInsightsGenerator.generateInsights({
      userId,
      insightTypes: ['productivity_pattern', 'task_prioritization'],
      dateRange,
      preferredProvider: provider
    });
  };

  return {
    sendMessage,
    getQuickActions,
    getSuggestions,
    getProductivityInsights,
    isGenerating
  };
};

// Helper functions

async function getProductivityContext(userId: string) {
  // Get recent tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  // Get active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('created_by', userId)
    .eq('status', 'active')
    .limit(10);

  // Get recent reflections
  const { data: reflections } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  const activeTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const completedThisWeek = tasks?.filter(t => t.status === 'done').length || 0;
  const activeGoals = goals?.length || 0;
  const recentMood = reflections?.length > 0 ?
    reflections.reduce((sum, r) => sum + (r.mood || 3), 0) / reflections.length : 3;

  return {
    activeTasks,
    completedThisWeek,
    activeGoals,
    recentMood,
    totalTasks: tasks?.length || 0,
    tasksByPriority: groupBy(tasks || [], 'priority'),
    goalsByCategory: groupBy(goals || [], 'category'),
    recentReflectionThemes: extractThemes(reflections || [])
  };
}

async function buildCoachingPrompt(request: CoachMessage, context: any): Promise<string> {
  const conversationHistory = request.sessionContext.messageHistory
    .slice(-3) // Last 3 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return `You are an expert productivity coach having a conversation with a user. Be helpful, encouraging, and provide specific, actionable advice.

CONVERSATION HISTORY:
${conversationHistory}

USER'S CURRENT PRODUCTIVITY CONTEXT:
- Active tasks: ${context.activeTasks}
- Completed this week: ${context.completedThisWeek}
- Active goals: ${context.activeGoals}
- Recent mood: ${context.recentMood.toFixed(1)}/5
- Task priority distribution: ${JSON.stringify(context.tasksByPriority)}

USER'S MESSAGE: "${request.message}"

Respond as a knowledgeable productivity coach. Be conversational, supportive, and provide specific actionable advice. If the user asks about their progress, reference their actual data. Keep responses under 200 words and maintain an encouraging tone.

Consider the user's current state and provide relevant suggestions. If they seem overwhelmed (many active tasks, low mood), focus on stress management. If they're doing well, help them optimize further.`;
}

function buildQuickActionPrompt(actionType: string, context: any): string {
  const prompts = {
    priorities: `Based on this user's productivity data, what should they prioritize today?

Current situation:
- Active tasks: ${context.activeTasks}
- Completed this week: ${context.completedThisWeek}
- Task priorities: ${JSON.stringify(context.tasksByPriority)}

Provide 3-4 specific priority recommendations with brief explanations.`,

    'time-management': `This user wants to improve their time management. Based on their data:

- Active tasks: ${context.activeTasks}
- Recent completion rate: ${context.completedThisWeek} tasks this week
- Current mood: ${context.recentMood.toFixed(1)}/5

Suggest 3-4 specific time management strategies tailored to their situation.`,

    'goal-progress': `Review this user's goal progress and provide insights:

- Active goals: ${context.activeGoals}
- Goals by category: ${JSON.stringify(context.goalsByCategory)}
- Recent task completion: ${context.completedThisWeek} tasks

Provide an assessment and 2-3 recommendations for better goal achievement.`,

    'productivity-tips': `Give this user personalized productivity tips based on their data:

- Current workload: ${context.activeTasks} active tasks
- Recent performance: ${context.completedThisWeek} completed this week
- Mood level: ${context.recentMood.toFixed(1)}/5

Provide 3-4 specific, actionable productivity tips relevant to their situation.`
  };

  return prompts[actionType as keyof typeof prompts] || 'Provide general productivity advice.';
}

function parseCoachResponse(content: string): CoachResponse {
  // Determine response type based on content
  let type: CoachResponse['type'] = 'suggestion';

  if (content.includes('?') && content.split('?').length > 2) {
    type = 'question';
  } else if (content.includes('great') || content.includes('excellent') || content.includes('well done')) {
    type = 'encouragement';
  } else if (content.includes('analysis') || content.includes('data shows') || content.includes('based on')) {
    type = 'insight';
  }

  // Calculate confidence based on content quality
  const confidence = calculateResponseConfidence(content);

  // Extract suggested actions
  const suggestedActions = extractActionItems(content);

  return {
    content,
    type,
    confidence,
    suggestedActions
  };
}

function calculateResponseConfidence(content: string): number {
  let confidence = 0.7; // Base confidence

  // Increase confidence for structured responses
  if (content.includes('1.') || content.includes('•') || content.includes('-')) {
    confidence += 0.1;
  }

  // Increase confidence for specific advice
  if (content.includes('suggest') || content.includes('recommend') || content.includes('try')) {
    confidence += 0.1;
  }

  // Increase confidence for longer, detailed responses
  if (content.length > 150) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

function extractActionItems(content: string): string[] {
  const actionPatterns = [
    /(?:try|start|begin|focus on|consider|implement)\s+([^.!?]+)/gi,
    /(?:\d+\.)\s*([^.!?]+)/g,
    /(?:•|-)\s*([^.!?]+)/g
  ];

  const actions: string[] = [];

  actionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/^\d+\.\s*|^•\s*|^-\s*/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 100) {
          actions.push(cleaned);
        }
      });
    }
  });

  return actions.slice(0, 5); // Max 5 actions
}

async function logCoachingSession(request: CoachMessage, response: CoachResponse): Promise<void> {
  try {
    await supabase
      .from('ai_service_usage')
      .insert({
        user_id: request.userId,
        provider: 'lovable', // This would be dynamic
        request_type: 'productivity_coaching',
        success: true,
        metadata: {
          sessionId: request.sessionContext.sessionId,
          userMessage: request.message,
          responseType: response.type,
          confidence: response.confidence,
          messageLength: response.content.length
        }
      });
  } catch (error) {
    console.error('Failed to log coaching session:', error);
  }
}

function groupBy(items: any[], key: string): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function extractThemes(reflections: any[]): string[] {
  // Simple theme extraction from reflection content
  const commonWords = ['work', 'stress', 'progress', 'challenges', 'goals', 'team', 'productivity'];
  const themes: Record<string, number> = {};

  reflections.forEach(reflection => {
    if (reflection.content) {
      const words = reflection.content.toLowerCase().split(/\s+/);
      commonWords.forEach(word => {
        if (words.some(w => w.includes(word))) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(themes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme);
}