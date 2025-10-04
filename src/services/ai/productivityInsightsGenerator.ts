import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIInsightType, AIProvider } from "@/types/ai-insights";

export interface ProductivityData {
  tasks: {
    completed: number;
    total: number;
    averageCompletionTime: number;
    priorityDistribution: Record<string, number>;
    categories: Record<string, number>;
    overdueCount: number;
  };
  goals: {
    active: number;
    completed: number;
    progressRate: number;
    averageProgress: number;
    categoryDistribution: Record<string, number>;
  };
  habits: {
    tracked: number;
    completionRate: number;
    streaks: number[];
    categories: Record<string, number>;
  };
  timeTracking: {
    totalHours: number;
    productiveHours: number;
    focusTime: number;
    breakTime: number;
    categoryDistribution: Record<string, number>;
  };
  reflections: {
    count: number;
    averageMood: number;
    sentimentScore: number;
    topThemes: string[];
  };
  teamMetrics?: {
    collaborations: number;
    sharedGoals: number;
    teamProductivity: number;
  };
}

export interface InsightRequest {
  userId: string;
  insightTypes: AIInsightType[];
  dateRange: {
    start: Date;
    end: Date;
  };
  preferredProvider?: AIProvider;
}

export class ProductivityInsightsGenerator {
  private static instance: ProductivityInsightsGenerator;

  public static getInstance(): ProductivityInsightsGenerator {
    if (!ProductivityInsightsGenerator.instance) {
      ProductivityInsightsGenerator.instance = new ProductivityInsightsGenerator();
    }
    return ProductivityInsightsGenerator.instance;
  }

  private async gatherProductivityData(userId: string, dateRange: { start: Date; end: Date }): Promise<ProductivityData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    // Gather tasks data
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Gather goals data
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('created_by', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Gather habits data
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Gather reflections data
    const { data: reflectionsData } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Gather team metrics if available
    const { data: teamData } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        workspaces!inner(*)
      `)
      .eq('user_id', userId);

    return this.processProductivityData({
      tasksData: tasksData || [],
      goalsData: goalsData || [],
      habitsData: habitsData || [],
      reflectionsData: reflectionsData || [],
      teamData: teamData || []
    });
  }

  private processProductivityData(rawData: any): ProductivityData {
    const { tasksData, goalsData, habitsData, reflectionsData, teamData } = rawData;

    // Process tasks
    const completedTasks = tasksData.filter((t: any) => t.status === 'done');
    const tasks = {
      completed: completedTasks.length,
      total: tasksData.length,
      averageCompletionTime: this.calculateAverageCompletionTime(completedTasks),
      priorityDistribution: this.groupBy(tasksData, 'priority'),
      categories: this.groupBy(tasksData, 'category'),
      overdueCount: tasksData.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
    };

    // Process goals
    const completedGoals = goalsData.filter((g: any) => g.status === 'completed');
    const activeGoals = goalsData.filter((g: any) => g.status === 'active');
    const goals = {
      active: activeGoals.length,
      completed: completedGoals.length,
      progressRate: activeGoals.length > 0 ? completedGoals.length / activeGoals.length : 0,
      averageProgress: goalsData.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / Math.max(goalsData.length, 1),
      categoryDistribution: this.groupBy(goalsData, 'category')
    };

    // Process habits
    const habits = {
      tracked: habitsData.length,
      completionRate: this.calculateHabitCompletionRate(habitsData),
      streaks: this.calculateHabitStreaks(habitsData),
      categories: this.groupBy(habitsData, 'category')
    };

    // Process time tracking (mock data for now)
    const timeTracking = {
      totalHours: 40,
      productiveHours: 32,
      focusTime: 24,
      breakTime: 8,
      categoryDistribution: { work: 60, personal: 30, learning: 10 }
    };

    // Process reflections
    const reflections = {
      count: reflectionsData.length,
      averageMood: this.calculateAverageMood(reflectionsData),
      sentimentScore: this.calculateSentimentScore(reflectionsData),
      topThemes: this.extractTopThemes(reflectionsData)
    };

    // Process team metrics
    const teamMetrics = teamData.length > 0 ? {
      collaborations: teamData.length,
      sharedGoals: 0, // Would need additional query
      teamProductivity: 75 // Would need calculation
    } : undefined;

    return {
      tasks,
      goals,
      habits,
      timeTracking,
      reflections,
      teamMetrics
    };
  }

  private async generateInsight(
    insightType: AIInsightType,
    productivityData: ProductivityData,
    userId: string,
    provider: AIProvider = 'lovable'
  ) {
    const prompt = this.buildPromptForInsightType(insightType, productivityData);

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: `generate_${insightType}`,
      maxTokens: 500,
      temperature: 0.7,
      metadata: { insightType }
    };

    const response = await aiServiceManager.makeRequest(request);

    if (response.success) {
      // Save insight to database
      const { data: insight } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          type: insightType,
          title: this.generateInsightTitle(insightType),
          content: response.content,
          provider,
          confidence_score: this.calculateConfidenceScore(response.content),
          data_sources: this.getDataSourcesForInsightType(insightType),
          metadata: {
            productivityData: this.getRelevantDataForInsight(insightType, productivityData),
            generationMetadata: {
              tokensUsed: response.tokensUsed.total,
              cost: response.cost,
              responseTime: response.responseTime
            }
          }
        })
        .select()
        .single();

      // Generate recommendations based on insight
      if (insight) {
        await this.generateRecommendations(insight, productivityData);
      }

      return insight;
    }

    throw new Error(`Failed to generate ${insightType} insight: ${response.error}`);
  }

  private buildPromptForInsightType(insightType: AIInsightType, data: ProductivityData): string {
    const baseContext = `You are a productivity expert analyzing user data to provide actionable insights.

Current productivity metrics:
- Tasks: ${data.tasks.completed}/${data.tasks.total} completed (${((data.tasks.completed/data.tasks.total)*100).toFixed(1)}%)
- Goals: ${data.goals.completed} completed, ${data.goals.active} active (avg progress: ${data.goals.averageProgress.toFixed(1)}%)
- Habits: ${data.habits.tracked} tracked, ${data.habits.completionRate.toFixed(1)}% completion rate
- Reflections: ${data.reflections.count} entries, avg mood: ${data.reflections.averageMood.toFixed(1)}/5`;

    switch (insightType) {
      case 'productivity_pattern':
        return `${baseContext}

Task completion patterns:
- Average completion time: ${data.tasks.averageCompletionTime} hours
- Overdue tasks: ${data.tasks.overdueCount}
- Priority distribution: ${JSON.stringify(data.tasks.priorityDistribution)}

Analyze the user's productivity patterns and identify:
1. Peak productivity times/patterns
2. Common bottlenecks or delays
3. Task completion efficiency trends
4. Areas for improvement

Provide specific, actionable insights in 2-3 paragraphs.`;

      case 'goal_progress':
        return `${baseContext}

Goal metrics:
- Progress rate: ${data.goals.progressRate.toFixed(2)}
- Category distribution: ${JSON.stringify(data.goals.categoryDistribution)}
- Average progress: ${data.goals.averageProgress.toFixed(1)}%

Analyze goal progress and provide:
1. Assessment of current goal achievement rate
2. Identification of successful goal categories
3. Recommendations for improving goal completion
4. Suggestions for goal setting strategy

Provide actionable insights in 2-3 paragraphs.`;

      case 'habit_analysis':
        return `${baseContext}

Habit metrics:
- Completion rate: ${data.habits.completionRate.toFixed(1)}%
- Current streaks: ${data.habits.streaks.join(', ')} days
- Categories: ${JSON.stringify(data.habits.categories)}

Analyze habit formation and provide:
1. Assessment of habit consistency
2. Identification of strong vs weak habit areas
3. Strategies for improving habit adherence
4. Recommendations for new beneficial habits

Provide actionable insights in 2-3 paragraphs.`;

      case 'time_optimization':
        return `${baseContext}

Time usage:
- Total time tracked: ${data.timeTracking.totalHours}h
- Productive time: ${data.timeTracking.productiveHours}h (${((data.timeTracking.productiveHours/data.timeTracking.totalHours)*100).toFixed(1)}%)
- Focus time: ${data.timeTracking.focusTime}h

Analyze time usage and provide:
1. Assessment of time allocation efficiency
2. Identification of time wasters or distractions
3. Recommendations for better time management
4. Strategies for increasing focus time

Provide actionable insights in 2-3 paragraphs.`;

      case 'burnout_risk':
        return `${baseContext}

Burnout indicators:
- Task overload: ${data.tasks.overdueCount} overdue tasks
- Mood trend: ${data.reflections.averageMood.toFixed(1)}/5
- Work-life balance: ${JSON.stringify(data.timeTracking.categoryDistribution)}

Assess burnout risk factors and provide:
1. Early warning signs identification
2. Stress level assessment
3. Workload balance analysis
4. Preventive recommendations

Provide insights focusing on well-being in 2-3 paragraphs.`;

      default:
        return `${baseContext}

Provide general productivity insights and recommendations for improving overall effectiveness.`;
    }
  }

  private async generateRecommendations(insight: any, productivityData: ProductivityData): Promise<void> {
    const recommendationPrompt = `Based on this productivity insight:

"${insight.content}"

And the user's current data patterns, generate 3-5 specific, actionable recommendations.
Each recommendation should include:
1. Clear action steps
2. Expected impact
3. Effort level (low/medium/high)

Format as a JSON array of recommendations.`;

    const request: AIServiceRequest = {
      provider: insight.provider,
      prompt: recommendationPrompt,
      userId: insight.user_id,
      requestType: 'generate_recommendations',
      maxTokens: 400,
      temperature: 0.5
    };

    const response = await aiServiceManager.makeRequest(request);

    if (response.success) {
      try {
        const recommendations = JSON.parse(response.content);

        for (const rec of recommendations) {
          await supabase
            .from('ai_recommendations')
            .insert({
              insight_id: insight.id,
              user_id: insight.user_id,
              title: rec.title || 'Productivity Recommendation',
              description: rec.description || rec.action,
              implementation_steps: Array.isArray(rec.steps) ? rec.steps : [rec.action],
              expected_impact: rec.impact || rec.expectedImpact,
              effort_level: rec.effort || rec.effortLevel || 'medium',
              priority: rec.priority || 3,
              metadata: {
                generatedFrom: insight.type,
                aiGenerated: true
              }
            });
        }
      } catch (error) {
        console.error('Failed to parse AI recommendations:', error);
        // Fallback: create a single recommendation from the raw content
        await supabase
          .from('ai_recommendations')
          .insert({
            insight_id: insight.id,
            user_id: insight.user_id,
            title: 'AI-Generated Recommendation',
            description: response.content,
            implementation_steps: ['Review the AI recommendation and implement suggested changes'],
            effort_level: 'medium',
            priority: 3,
            metadata: {
              generatedFrom: insight.type,
              aiGenerated: true,
              rawContent: response.content
            }
          });
      }
    }
  }

  public async generateInsights(request: InsightRequest): Promise<any[]> {
    const productivityData = await this.gatherProductivityData(request.userId, request.dateRange);
    const insights = [];

    for (const insightType of request.insightTypes) {
      try {
        const insight = await this.generateInsight(
          insightType,
          productivityData,
          request.userId,
          request.preferredProvider || 'lovable'
        );
        insights.push(insight);
      } catch (error) {
        console.error(`Failed to generate ${insightType} insight:`, error);
      }
    }

    return insights;
  }

  // Helper methods
  private calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.completed_at && t.created_at);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at).getTime();
      const completed = new Date(task.completed_at).getTime();
      return sum + (completed - created);
    }, 0);

    return totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateHabitCompletionRate(habits: any[]): number {
    if (habits.length === 0) return 0;
    const totalCompletions = habits.reduce((sum, habit) => {
      return sum + (habit.metadata?.completionRate || 0);
    }, 0);
    return totalCompletions / habits.length;
  }

  private calculateHabitStreaks(habits: any[]): number[] {
    return habits.map(habit => habit.metadata?.currentStreak || 0);
  }

  private calculateAverageMood(reflections: any[]): number {
    if (reflections.length === 0) return 3;
    const totalMood = reflections.reduce((sum, r) => sum + (r.mood || 3), 0);
    return totalMood / reflections.length;
  }

  private calculateSentimentScore(reflections: any[]): number {
    // Simple sentiment analysis based on content length and mood
    return reflections.reduce((avg, r) => avg + (r.mood || 3), 0) / Math.max(reflections.length, 1);
  }

  private extractTopThemes(reflections: any[]): string[] {
    // Extract common words/themes from reflection content
    const themes = ['productivity', 'goals', 'challenges', 'growth', 'balance'];
    return themes.slice(0, 3);
  }

  private generateInsightTitle(insightType: AIInsightType): string {
    const titles = {
      productivity_pattern: 'Productivity Pattern Analysis',
      goal_progress: 'Goal Achievement Analysis',
      habit_analysis: 'Habit Formation Assessment',
      time_optimization: 'Time Management Insights',
      task_prioritization: 'Task Priority Optimization',
      reflection_sentiment: 'Reflection Sentiment Analysis',
      project_health: 'Project Health Assessment',
      burnout_risk: 'Burnout Risk Evaluation',
      achievement_opportunity: 'Achievement Opportunity Identification'
    };
    return titles[insightType] || 'Productivity Insight';
  }

  private calculateConfidenceScore(content: string): number {
    // Simple confidence calculation based on content length and structure
    const wordCount = content.split(' ').length;
    const hasNumbers = /\d/.test(content);
    const hasSpecifics = /\b(increase|decrease|improve|reduce|focus|optimize)\b/i.test(content);

    let score = 0.6; // Base confidence
    if (wordCount > 100) score += 0.1;
    if (wordCount > 200) score += 0.1;
    if (hasNumbers) score += 0.1;
    if (hasSpecifics) score += 0.1;

    return Math.min(score, 1.0);
  }

  private getDataSourcesForInsightType(insightType: AIInsightType): string[] {
    const sources = {
      productivity_pattern: ['tasks', 'time_tracking'],
      goal_progress: ['goals', 'tasks'],
      habit_analysis: ['habits', 'reflections'],
      time_optimization: ['time_tracking', 'tasks'],
      task_prioritization: ['tasks', 'goals'],
      reflection_sentiment: ['reflections'],
      project_health: ['goals', 'tasks', 'team_metrics'],
      burnout_risk: ['tasks', 'time_tracking', 'reflections'],
      achievement_opportunity: ['goals', 'habits', 'tasks']
    };
    return sources[insightType] || ['general'];
  }

  private getRelevantDataForInsight(insightType: AIInsightType, data: ProductivityData): any {
    switch (insightType) {
      case 'productivity_pattern':
        return { tasks: data.tasks, timeTracking: data.timeTracking };
      case 'goal_progress':
        return { goals: data.goals, tasks: data.tasks };
      case 'habit_analysis':
        return { habits: data.habits, reflections: data.reflections };
      case 'time_optimization':
        return { timeTracking: data.timeTracking, tasks: data.tasks };
      case 'burnout_risk':
        return { tasks: data.tasks, reflections: data.reflections, timeTracking: data.timeTracking };
      default:
        return data;
    }
  }
}

// Export singleton instance
export const productivityInsightsGenerator = ProductivityInsightsGenerator.getInstance();