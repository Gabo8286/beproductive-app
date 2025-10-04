import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface GoalContext {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date?: string;
  priority: number;
  progress: number;
  created_at: string;
  updated_at: string;
  milestones: any[];
  tasks: any[];
  metadata?: any;
}

export interface GoalProgress {
  goalId: string;
  currentProgress: number;
  targetProgress: number;
  progressVelocity: number; // Progress per day
  timeRemaining: number; // Days until deadline
  completionProbability: number; // 0-1 probability of on-time completion
  blockers: string[];
  accelerators: string[];
}

export interface GoalSuggestion {
  goalId: string;
  type: 'milestone' | 'task' | 'deadline' | 'priority' | 'resource' | 'strategy';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: string;
  implementationSteps: string[];
  confidence: number;
  metadata?: any;
}

export interface GoalAnalysisRequest {
  userId: string;
  goals: GoalContext[];
  lookbackDays?: number;
  preferredProvider?: AIProvider;
  includeTaskAnalysis?: boolean;
  includeMilestoneAnalysis?: boolean;
}

export class SmartGoalTracker {
  private static instance: SmartGoalTracker;

  public static getInstance(): SmartGoalTracker {
    if (!SmartGoalTracker.instance) {
      SmartGoalTracker.instance = new SmartGoalTracker();
    }
    return SmartGoalTracker.instance;
  }

  public async analyzeGoals(request: GoalAnalysisRequest): Promise<{
    progress: GoalProgress[];
    suggestions: GoalSuggestion[];
    insights: any[];
  }> {
    const { goals, userId, preferredProvider = 'lovable' } = request;

    // Analyze progress for each goal
    const progressAnalyses = await Promise.all(
      goals.map(goal => this.analyzeGoalProgress(goal, userId))
    );

    // Generate AI-powered suggestions
    const suggestions: GoalSuggestion[] = [];
    for (const goal of goals) {
      try {
        const goalSuggestions = await this.generateGoalSuggestions(
          goal,
          progressAnalyses.find(p => p.goalId === goal.id)!,
          preferredProvider,
          userId
        );
        suggestions.push(...goalSuggestions);
      } catch (error) {
        console.error(`Failed to generate suggestions for goal ${goal.id}:`, error);
      }
    }

    // Generate overall insights
    const insights = await this.generateGoalInsights(goals, progressAnalyses, preferredProvider, userId);

    return {
      progress: progressAnalyses,
      suggestions,
      insights
    };
  }

  private async analyzeGoalProgress(goal: GoalContext, userId: string): Promise<GoalProgress> {
    // Get related tasks and their completion data
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goal.id)
      .order('created_at', { ascending: false });

    // Calculate progress metrics
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const currentProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : goal.progress || 0;

    // Calculate velocity (progress per day)
    const goalAgeInDays = Math.max(1, Math.ceil((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    const progressVelocity = currentProgress / goalAgeInDays;

    // Time remaining until deadline
    const timeRemaining = goal.target_date ?
      Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
      Infinity;

    // Completion probability based on current velocity
    let completionProbability = 0.5;
    if (timeRemaining !== Infinity && progressVelocity > 0) {
      const projectedProgress = currentProgress + (progressVelocity * timeRemaining);
      completionProbability = Math.min(1, projectedProgress / 100);
    }

    // Identify blockers and accelerators
    const blockers = await this.identifyBlockers(goal, tasks || []);
    const accelerators = await this.identifyAccelerators(goal, tasks || []);

    return {
      goalId: goal.id,
      currentProgress,
      targetProgress: 100,
      progressVelocity,
      timeRemaining,
      completionProbability,
      blockers,
      accelerators
    };
  }

  private async generateGoalSuggestions(
    goal: GoalContext,
    progress: GoalProgress,
    provider: AIProvider,
    userId: string
  ): Promise<GoalSuggestion[]> {
    const prompt = this.buildGoalSuggestionPrompt(goal, progress);

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: 'goal_suggestions',
      maxTokens: 600,
      temperature: 0.7,
      metadata: { goalId: goal.id }
    };

    const response = await aiServiceManager.makeRequest(request);

    if (response.success) {
      return this.parseGoalSuggestions(response.content, goal.id);
    }

    // Fallback suggestions
    return this.generateFallbackSuggestions(goal, progress);
  }

  private buildGoalSuggestionPrompt(goal: GoalContext, progress: GoalProgress): string {
    return `You are an expert goal achievement coach analyzing a user's goal progress and providing strategic recommendations.

GOAL DETAILS:
- Title: "${goal.title}"
- Description: "${goal.description || 'No description'}"
- Category: ${goal.category}
- Priority: ${goal.priority}/5
- Status: ${goal.status}
- Target Date: ${goal.target_date || 'No deadline'}

PROGRESS ANALYSIS:
- Current Progress: ${progress.currentProgress.toFixed(1)}%
- Progress Velocity: ${progress.progressVelocity.toFixed(2)}% per day
- Time Remaining: ${progress.timeRemaining === Infinity ? 'No deadline' : `${progress.timeRemaining} days`}
- Completion Probability: ${(progress.completionProbability * 100).toFixed(1)}%
- Identified Blockers: ${progress.blockers.join(', ') || 'None identified'}
- Accelerators: ${progress.accelerators.join(', ') || 'None identified'}

ANALYSIS REQUEST:
Based on this goal's current state, provide 3-5 strategic suggestions to improve progress and likelihood of achievement. Consider:

1. MILESTONE suggestions - Breaking down the goal into smaller, manageable milestones
2. TASK suggestions - Specific actions that would drive progress
3. DEADLINE suggestions - Adjusting timeline for better achievability
4. PRIORITY suggestions - Adjusting goal priority based on progress
5. RESOURCE suggestions - Additional resources, tools, or support needed
6. STRATEGY suggestions - Different approaches or methodologies

For each suggestion, provide:
- Type (milestone/task/deadline/priority/resource/strategy)
- Title (brief, actionable)
- Description (2-3 sentences)
- Priority (low/medium/high/urgent)
- Effort (low/medium/high)
- Expected Impact (what outcome this should produce)
- Implementation Steps (2-4 specific actions)

Format as JSON array:
[
  {
    "type": "suggestion_type",
    "title": "Brief title",
    "description": "Detailed description",
    "reasoning": "Why this suggestion helps",
    "priority": "priority_level",
    "effort": "effort_level",
    "expectedImpact": "What this achieves",
    "implementationSteps": ["step1", "step2", "step3"],
    "confidence": 0.8
  }
]`;
  }

  private parseGoalSuggestions(content: string, goalId: string): GoalSuggestion[] {
    try {
      const suggestions = JSON.parse(content);
      return suggestions.map((s: any) => ({
        goalId,
        type: s.type || 'strategy',
        title: s.title,
        description: s.description,
        reasoning: s.reasoning,
        priority: s.priority || 'medium',
        effort: s.effort || 'medium',
        expectedImpact: s.expectedImpact,
        implementationSteps: s.implementationSteps || [],
        confidence: s.confidence || 0.7
      }));
    } catch (error) {
      console.error('Failed to parse goal suggestions:', error);
      return [];
    }
  }

  private generateFallbackSuggestions(goal: GoalContext, progress: GoalProgress): GoalSuggestion[] {
    const suggestions: GoalSuggestion[] = [];

    // Progress-based suggestions
    if (progress.currentProgress < 25) {
      suggestions.push({
        goalId: goal.id,
        type: 'milestone',
        title: 'Create initial milestones',
        description: 'Break down this goal into 3-4 smaller, achievable milestones to build momentum.',
        reasoning: 'Low progress indicates need for clearer intermediate targets',
        priority: 'high',
        effort: 'low',
        expectedImpact: 'Improved clarity and motivation through achievable targets',
        implementationSteps: ['List 3-4 major phases', 'Set milestone deadlines', 'Track milestone progress'],
        confidence: 0.8
      });
    }

    // Velocity-based suggestions
    if (progress.progressVelocity < 1 && progress.timeRemaining < 30) {
      suggestions.push({
        goalId: goal.id,
        type: 'strategy',
        title: 'Increase daily focus time',
        description: 'Dedicate specific time blocks daily to this goal to improve progress velocity.',
        reasoning: 'Current velocity is too slow to meet deadline',
        priority: 'urgent',
        effort: 'medium',
        expectedImpact: 'Accelerated progress through dedicated focus',
        implementationSteps: ['Block 1-2 hours daily', 'Eliminate distractions', 'Track daily progress'],
        confidence: 0.7
      });
    }

    // Completion probability suggestions
    if (progress.completionProbability < 0.5) {
      suggestions.push({
        goalId: goal.id,
        type: 'deadline',
        title: 'Adjust timeline or scope',
        description: 'Consider extending the deadline or reducing scope to ensure achievable success.',
        reasoning: 'Current trajectory shows low probability of on-time completion',
        priority: 'high',
        effort: 'low',
        expectedImpact: 'Realistic timeline leading to successful completion',
        implementationSteps: ['Review original scope', 'Identify core requirements', 'Set new realistic deadline'],
        confidence: 0.6
      });
    }

    return suggestions;
  }

  private async generateGoalInsights(
    goals: GoalContext[],
    progressData: GoalProgress[],
    provider: AIProvider,
    userId: string
  ): Promise<any[]> {
    const overallStats = this.calculateOverallStats(goals, progressData);

    const prompt = `Analyze this user's overall goal achievement patterns and provide strategic insights.

GOAL PORTFOLIO SUMMARY:
- Total Active Goals: ${goals.filter(g => g.status === 'active').length}
- Average Progress: ${overallStats.averageProgress.toFixed(1)}%
- Goals On Track: ${overallStats.onTrackCount}/${goals.length}
- High Priority Goals: ${goals.filter(g => g.priority >= 4).length}
- Goals with Deadlines: ${goals.filter(g => g.target_date).length}

PERFORMANCE METRICS:
- Average Velocity: ${overallStats.averageVelocity.toFixed(2)}% per day
- Completion Risk: ${overallStats.riskCount} goals at risk
- Category Distribution: ${overallStats.categoryDistribution}

Generate 2-3 high-level insights about this user's goal achievement patterns, focusing on:
1. Overall progress patterns and trends
2. Potential systemic issues or strengths
3. Strategic recommendations for goal portfolio management

Format as JSON array with title, description, type, and recommendations.`;

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: 'goal_insights',
      maxTokens: 400,
      temperature: 0.6
    };

    try {
      const response = await aiServiceManager.makeRequest(request);
      if (response.success) {
        return JSON.parse(response.content);
      }
    } catch (error) {
      console.error('Failed to generate goal insights:', error);
    }

    // Fallback insights
    return [{
      title: 'Goal Portfolio Analysis',
      description: `You have ${goals.length} active goals with an average progress of ${overallStats.averageProgress.toFixed(1)}%.`,
      type: 'portfolio_overview',
      recommendations: ['Review goal priorities', 'Consider reducing active goals', 'Focus on high-impact goals']
    }];
  }

  private calculateOverallStats(goals: GoalContext[], progressData: GoalProgress[]) {
    const averageProgress = progressData.reduce((sum, p) => sum + p.currentProgress, 0) / progressData.length || 0;
    const averageVelocity = progressData.reduce((sum, p) => sum + p.progressVelocity, 0) / progressData.length || 0;
    const onTrackCount = progressData.filter(p => p.completionProbability > 0.7).length;
    const riskCount = progressData.filter(p => p.completionProbability < 0.3).length;

    const categoryCount: Record<string, number> = {};
    goals.forEach(g => {
      categoryCount[g.category] = (categoryCount[g.category] || 0) + 1;
    });

    return {
      averageProgress,
      averageVelocity,
      onTrackCount,
      riskCount,
      categoryDistribution: Object.entries(categoryCount).map(([cat, count]) => `${cat}: ${count}`).join(', ')
    };
  }

  private async identifyBlockers(goal: GoalContext, tasks: any[]): Promise<string[]> {
    const blockers: string[] = [];

    // Analyze overdue tasks
    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
    );
    if (overdueTasks.length > 0) {
      blockers.push(`${overdueTasks.length} overdue tasks`);
    }

    // Check for stuck tasks (not updated in a while)
    const stuckTasks = tasks.filter(t => {
      const daysSinceUpdate = (new Date().getTime() - new Date(t.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7 && t.status !== 'done';
    });
    if (stuckTasks.length > 0) {
      blockers.push(`${stuckTasks.length} tasks with no recent progress`);
    }

    // Check for high-effort tasks
    const highEffortTasks = tasks.filter(t =>
      t.estimated_duration && t.estimated_duration > 8 && t.status !== 'done'
    );
    if (highEffortTasks.length > 0) {
      blockers.push('Large tasks may need breaking down');
    }

    return blockers;
  }

  private async identifyAccelerators(goal: GoalContext, tasks: any[]): Promise<string[]> {
    const accelerators: string[] = [];

    // Recent completed tasks indicate momentum
    const recentCompletions = tasks.filter(t => {
      const daysSinceCompletion = (new Date().getTime() - new Date(t.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCompletion < 7 && t.status === 'done';
    });
    if (recentCompletions.length >= 3) {
      accelerators.push('Strong recent momentum');
    }

    // Quick wins available
    const quickWins = tasks.filter(t =>
      t.estimated_duration && t.estimated_duration <= 2 && t.status !== 'done'
    );
    if (quickWins.length > 0) {
      accelerators.push(`${quickWins.length} quick wins available`);
    }

    // High priority alignment
    if (goal.priority >= 4) {
      accelerators.push('High priority focus');
    }

    return accelerators;
  }

  public async saveGoalRecommendations(
    suggestions: GoalSuggestion[],
    userId: string
  ): Promise<void> {
    for (const suggestion of suggestions) {
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          title: suggestion.title,
          description: suggestion.description,
          implementation_steps: suggestion.implementationSteps,
          expected_impact: suggestion.expectedImpact,
          effort_level: suggestion.effort,
          priority: this.mapPriorityToNumber(suggestion.priority),
          metadata: {
            type: 'goal_suggestion',
            goalId: suggestion.goalId,
            suggestionType: suggestion.type,
            reasoning: suggestion.reasoning,
            confidence: suggestion.confidence
          }
        });
    }
  }

  private mapPriorityToNumber(priority: string): number {
    switch (priority) {
      case 'urgent': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 3;
    }
  }

  public async scheduleAutomaticTracking(userId: string): Promise<void> {
    // This would typically integrate with a job scheduler
    // For now, we'll create a tracking record
    await supabase
      .from('ai_service_usage')
      .insert({
        user_id: userId,
        provider: 'lovable',
        request_type: 'goal_tracking_scheduled',
        success: true,
        metadata: {
          scheduled_at: new Date().toISOString(),
          tracking_frequency: 'daily'
        }
      });
  }
}

export const smartGoalTracker = SmartGoalTracker.getInstance();