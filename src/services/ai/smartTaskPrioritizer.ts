import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface TaskContext {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  tags: string[];
  status: string;
  created_at: string;
  goalId?: string;
  dependencies?: string[];
  metadata?: any;
}

export interface UserContext {
  userId: string;
  currentWorkload: number; // 0-100 scale
  availableTime: number; // hours per day
  skillset: string[];
  preferences: {
    workingHours: { start: string; end: string };
    preferredTaskTypes: string[];
    energyLevels: { morning: number; afternoon: number; evening: number };
  };
  currentGoals: {
    id: string;
    title: string;
    priority: number;
    deadline?: string;
  }[];
  recentProductivity: {
    completionRate: number;
    averageTaskTime: number;
    focusScore: number;
  };
}

export interface PriorityRecommendation {
  taskId: string;
  currentPriority: string;
  recommendedPriority: string;
  confidence: number;
  reasoning: string;
  urgencyScore: number;
  importanceScore: number;
  effortScore: number;
  contextualFactors: string[];
  suggestedTimeSlot?: {
    date: string;
    startTime: string;
    duration: number;
  };
}

export interface SmartPrioritizationRequest {
  userId: string;
  tasks: TaskContext[];
  userContext: UserContext;
  preferredProvider?: AIProvider;
  considerDeadlines?: boolean;
  considerGoalAlignment?: boolean;
  considerEnergyLevels?: boolean;
}

export class SmartTaskPrioritizer {
  private static instance: SmartTaskPrioritizer;

  public static getInstance(): SmartTaskPrioritizer {
    if (!SmartTaskPrioritizer.instance) {
      SmartTaskPrioritizer.instance = new SmartTaskPrioritizer();
    }
    return SmartTaskPrioritizer.instance;
  }

  public async analyzeTasks(request: SmartPrioritizationRequest): Promise<PriorityRecommendation[]> {
    const { tasks, userContext, preferredProvider = 'lovable' } = request;

    // Analyze each task individually
    const recommendations: PriorityRecommendation[] = [];

    for (const task of tasks) {
      try {
        const recommendation = await this.analyzeTask(task, userContext, preferredProvider);
        recommendations.push(recommendation);
      } catch (error) {
        console.error(`Failed to analyze task ${task.id}:`, error);
        // Provide fallback recommendation
        recommendations.push(this.createFallbackRecommendation(task));
      }
    }

    // Apply contextual adjustments based on overall workload
    return this.applyContextualAdjustments(recommendations, userContext);
  }

  private async analyzeTask(
    task: TaskContext,
    userContext: UserContext,
    provider: AIProvider
  ): Promise<PriorityRecommendation> {
    const prompt = this.buildTaskAnalysisPrompt(task, userContext);

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId: userContext.userId,
      requestType: 'task_prioritization',
      maxTokens: 400,
      temperature: 0.3, // Lower temperature for more consistent prioritization
      metadata: { taskId: task.id }
    };

    const response = await aiServiceManager.makeRequest(request);

    if (response.success) {
      return this.parseTaskAnalysisResponse(response.content, task);
    }

    throw new Error(`AI analysis failed: ${response.error}`);
  }

  private buildTaskAnalysisPrompt(task: TaskContext, userContext: UserContext): string {
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    return `You are an expert productivity consultant analyzing a task for optimal prioritization.

TASK DETAILS:
- Title: "${task.title}"
- Description: "${task.description || 'No description'}"
- Category: ${task.category || 'General'}
- Current Priority: ${task.priority}
- Due Date: ${task.due_date ? `${daysUntilDue} days from now` : 'No deadline'}
- Estimated Duration: ${task.estimated_duration || 'Unknown'} hours
- Tags: ${task.tags.join(', ') || 'None'}
- Status: ${task.status}

USER CONTEXT:
- Current Workload: ${userContext.currentWorkload}% capacity
- Available Time: ${userContext.availableTime} hours/day
- Completion Rate: ${userContext.recentProductivity.completionRate}%
- Focus Score: ${userContext.recentProductivity.focusScore}/10

ACTIVE GOALS:
${userContext.currentGoals.map(g => `- ${g.title} (Priority: ${g.priority})`).join('\n')}

ANALYSIS REQUIRED:
Analyze this task and provide:

1. URGENCY SCORE (1-10): Based on deadlines and time sensitivity
2. IMPORTANCE SCORE (1-10): Based on goal alignment and impact
3. EFFORT SCORE (1-10): Based on complexity and required resources
4. RECOMMENDED PRIORITY: low/medium/high/urgent
5. REASONING: 2-3 sentences explaining the recommendation
6. CONTEXTUAL FACTORS: List 2-4 key factors influencing this decision

Format your response as JSON:
{
  "urgencyScore": number,
  "importanceScore": number,
  "effortScore": number,
  "recommendedPriority": "low|medium|high|urgent",
  "reasoning": "string",
  "contextualFactors": ["factor1", "factor2", "factor3"],
  "confidence": number (0-1)
}`;
  }

  private parseTaskAnalysisResponse(content: string, task: TaskContext): PriorityRecommendation {
    try {
      const analysis = JSON.parse(content);

      return {
        taskId: task.id,
        currentPriority: task.priority,
        recommendedPriority: analysis.recommendedPriority,
        confidence: analysis.confidence || 0.7,
        reasoning: analysis.reasoning,
        urgencyScore: analysis.urgencyScore,
        importanceScore: analysis.importanceScore,
        effortScore: analysis.effortScore,
        contextualFactors: analysis.contextualFactors || [],
        suggestedTimeSlot: this.suggestOptimalTimeSlot(task, analysis)
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.createFallbackRecommendation(task);
    }
  }

  private createFallbackRecommendation(task: TaskContext): PriorityRecommendation {
    // Simple rule-based fallback
    let urgencyScore = 5;
    let importanceScore = 5;
    let effortScore = 5;

    // Adjust based on due date
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) urgencyScore = 9;
      else if (daysUntilDue <= 3) urgencyScore = 7;
      else if (daysUntilDue <= 7) urgencyScore = 6;
    }

    // Adjust based on current priority
    switch (task.priority) {
      case 'urgent': importanceScore = 9; break;
      case 'high': importanceScore = 7; break;
      case 'medium': importanceScore = 5; break;
      case 'low': importanceScore = 3; break;
    }

    // Adjust based on estimated duration
    if (task.estimated_duration) {
      if (task.estimated_duration > 8) effortScore = 9;
      else if (task.estimated_duration > 4) effortScore = 7;
      else if (task.estimated_duration > 2) effortScore = 5;
      else effortScore = 3;
    }

    const priorityScore = (urgencyScore + importanceScore) / 2;
    let recommendedPriority = 'medium';
    if (priorityScore >= 8) recommendedPriority = 'urgent';
    else if (priorityScore >= 6) recommendedPriority = 'high';
    else if (priorityScore >= 4) recommendedPriority = 'medium';
    else recommendedPriority = 'low';

    return {
      taskId: task.id,
      currentPriority: task.priority,
      recommendedPriority: recommendedPriority as any,
      confidence: 0.5,
      reasoning: 'Automatic prioritization based on due date and current priority level.',
      urgencyScore,
      importanceScore,
      effortScore,
      contextualFactors: ['due_date', 'current_priority', 'estimated_duration']
    };
  }

  private suggestOptimalTimeSlot(task: TaskContext, analysis: any): any {
    // Simple time slot suggestion based on task characteristics
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // High urgency/importance tasks go in the morning
    if (analysis.urgencyScore >= 7 || analysis.importanceScore >= 7) {
      return {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        duration: Math.min(task.estimated_duration || 2, 4)
      };
    }

    // Medium priority tasks in the afternoon
    if (analysis.importanceScore >= 5) {
      return {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        duration: task.estimated_duration || 2
      };
    }

    // Low priority tasks can be scheduled flexibly
    return {
      date: tomorrow.toISOString().split('T')[0],
      startTime: '16:00',
      duration: task.estimated_duration || 1
    };
  }

  private applyContextualAdjustments(
    recommendations: PriorityRecommendation[],
    userContext: UserContext
  ): PriorityRecommendation[] {
    // Adjust recommendations based on overall context
    const highPriorityCount = recommendations.filter(r => r.recommendedPriority === 'high' || r.recommendedPriority === 'urgent').length;
    const totalTasks = recommendations.length;

    // If user has too many high-priority tasks, distribute some to medium
    if (highPriorityCount > totalTasks * 0.3 && userContext.currentWorkload > 70) {
      const sortedByConfidence = recommendations
        .filter(r => r.recommendedPriority === 'high')
        .sort((a, b) => a.confidence - b.confidence);

      // Downgrade the least confident high-priority recommendations
      const toDowngrade = Math.ceil(sortedByConfidence.length * 0.3);
      for (let i = 0; i < toDowngrade; i++) {
        sortedByConfidence[i].recommendedPriority = 'medium';
        sortedByConfidence[i].reasoning += ' (Adjusted due to high workload)';
      }
    }

    return recommendations;
  }

  public async updateTaskPriorities(
    recommendations: PriorityRecommendation[],
    userId: string,
    autoApply: boolean = false
  ): Promise<void> {
    for (const rec of recommendations) {
      if (autoApply && rec.confidence > 0.8) {
        // Auto-apply high-confidence recommendations
        await supabase
          .from('tasks')
          .update({
            priority: rec.recommendedPriority,
            metadata: {
              ai_prioritization: {
                previousPriority: rec.currentPriority,
                aiRecommendation: rec.recommendedPriority,
                confidence: rec.confidence,
                reasoning: rec.reasoning,
                appliedAt: new Date().toISOString()
              }
            }
          })
          .eq('id', rec.taskId)
          .eq('user_id', userId);
      }

      // Always log the recommendation for user review
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          title: `Priority Adjustment for Task`,
          description: `Recommended changing priority from ${rec.currentPriority} to ${rec.recommendedPriority}`,
          implementation_steps: [
            `Change task priority to ${rec.recommendedPriority}`,
            `Review reasoning: ${rec.reasoning}`
          ],
          expected_impact: 'Improved task prioritization and productivity',
          effort_level: 'low',
          priority: rec.recommendedPriority === 'urgent' ? 5 : 3,
          metadata: {
            type: 'task_prioritization',
            taskId: rec.taskId,
            recommendation: rec,
            autoApplied: autoApply && rec.confidence > 0.8
          }
        });
    }
  }

  public async getUserContext(userId: string): Promise<UserContext> {
    // Gather user context data from multiple sources
    const [tasksData, goalsData, userPreferences] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      supabase
        .from('goals')
        .select('*')
        .eq('created_by', userId)
        .eq('status', 'active'),

      supabase
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);

    const tasks = tasksData.data || [];
    const goals = goalsData.data || [];
    const preferences = userPreferences.data;

    // Calculate current workload
    const activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'archived');
    const currentWorkload = Math.min((activeTasks.length / 20) * 100, 100); // Assume max 20 active tasks = 100% workload

    // Calculate productivity metrics
    const completedTasks = tasks.filter(t => t.status === 'done');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    return {
      userId,
      currentWorkload,
      availableTime: 8, // Default 8 hours, could be configurable
      skillset: [], // Could be extracted from task categories/tags
      preferences: {
        workingHours: { start: '09:00', end: '17:00' },
        preferredTaskTypes: [],
        energyLevels: { morning: 8, afternoon: 6, evening: 4 }
      },
      currentGoals: goals.map(g => ({
        id: g.id,
        title: g.title,
        priority: g.priority || 3,
        deadline: g.target_date
      })),
      recentProductivity: {
        completionRate,
        averageTaskTime: 2, // Hours, could be calculated from actual data
        focusScore: 7 // 1-10 scale, could be derived from time tracking
      }
    };
  }
}

// Export singleton instance
export const smartTaskPrioritizer = SmartTaskPrioritizer.getInstance();