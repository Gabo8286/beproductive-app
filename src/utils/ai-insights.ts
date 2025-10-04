import { addDays, subDays, startOfDay, endOfDay, differenceInHours, format } from 'date-fns';

// Core data types for AI analysis
export interface UserActivity {
  id: string;
  userId: string;
  type: 'task_created' | 'task_completed' | 'habit_completed' | 'login' | 'session_start' | 'session_end';
  timestamp: Date;
  metadata: {
    taskId?: string;
    habitId?: string;
    duration?: number;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek?: number;
  };
}

export interface ProductivityPattern {
  id: string;
  userId: string;
  patternType: 'peak_hours' | 'completion_rate' | 'habit_consistency' | 'task_difficulty' | 'procrastination';
  confidence: number; // 0-1
  insights: {
    description: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
  };
  data: Record<string, any>;
  discoveredAt: Date;
  validUntil: Date;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'productivity_tip' | 'optimization_suggestion' | 'time_management' | 'habit_recommendation' | 'goal_adjustment';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  basedOn: string[]; // What data this insight is based on
  suggestedActions: {
    title: string;
    description: string;
    type: 'schedule_change' | 'habit_addition' | 'task_restructure' | 'goal_adjustment';
    effort: 'low' | 'medium' | 'high';
  }[];
  createdAt: Date;
  dismissedAt?: Date;
  implementedAt?: Date;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'completion_prediction' | 'peak_performance' | 'habit_success' | 'burnout_risk' | 'goal_achievement';
  accuracy: number;
  lastTrained: Date;
  parameters: Record<string, any>;
}

// AI Insights Engine Class
export class AIInsightsEngine {
  private activities: UserActivity[] = [];
  private patterns: Map<string, ProductivityPattern[]> = new Map();
  private models: Map<string, PredictiveModel> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize predictive models with default parameters
    this.models.set('completion_prediction', {
      id: 'completion_prediction',
      name: 'Task Completion Predictor',
      type: 'completion_prediction',
      accuracy: 0.78,
      lastTrained: new Date(),
      parameters: {
        weights: {
          timeOfDay: 0.25,
          priority: 0.20,
          category: 0.15,
          historicalCompletion: 0.40
        },
        thresholds: {
          highConfidence: 0.8,
          mediumConfidence: 0.6
        }
      }
    });

    this.models.set('peak_performance', {
      id: 'peak_performance',
      name: 'Peak Performance Predictor',
      type: 'peak_performance',
      accuracy: 0.82,
      lastTrained: new Date(),
      parameters: {
        timeWindows: ['morning', 'afternoon', 'evening'],
        performanceMetrics: ['completion_rate', 'focus_duration', 'task_difficulty']
      }
    });

    this.models.set('burnout_risk', {
      id: 'burnout_risk',
      name: 'Burnout Risk Assessment',
      type: 'burnout_risk',
      accuracy: 0.75,
      lastTrained: new Date(),
      parameters: {
        indicators: ['overwork_hours', 'completion_pressure', 'habit_consistency_drop'],
        riskThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8
        }
      }
    });
  }

  // Analyze user activities and generate insights
  async analyzeUserBehavior(userId: string, activities: UserActivity[]): Promise<AIInsight[]> {
    this.activities = activities.filter(a => a.userId === userId);

    const insights: AIInsight[] = [];

    // Generate different types of insights
    insights.push(...await this.analyzePeakHours(userId));
    insights.push(...await this.analyzeCompletionPatterns(userId));
    insights.push(...await this.analyzeHabitConsistency(userId));
    insights.push(...await this.analyzeProcrastinationPatterns(userId));
    insights.push(...await this.analyzeWorkloadBalance(userId));
    insights.push(...await this.analyzeGoalAlignment(userId));

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private async analyzePeakHours(userId: string): Promise<AIInsight[]> {
    const completionsByHour = this.getCompletionsByTimeOfDay();
    const peakHours = this.identifyPeakPerformanceHours(completionsByHour);

    if (peakHours.length === 0) return [];

    const peakHoursList = peakHours.map(h => h.hour).join(', ');
    const avgEfficiency = peakHours.reduce((sum, h) => sum + h.efficiency, 0) / peakHours.length;

    return [{
      id: `peak_hours_${userId}_${Date.now()}`,
      userId,
      type: 'time_management',
      title: 'Optimize Your Peak Performance Hours',
      description: `You're most productive during ${peakHoursList} with ${(avgEfficiency * 100).toFixed(0)}% higher completion rates.`,
      actionable: true,
      priority: 'high',
      confidence: 0.85,
      basedOn: ['task_completion_times', 'productivity_patterns'],
      suggestedActions: [
        {
          title: 'Schedule Important Tasks',
          description: `Block ${peakHoursList} for your most challenging or important tasks`,
          type: 'schedule_change',
          effort: 'low'
        },
        {
          title: 'Minimize Meetings',
          description: 'Avoid scheduling meetings during your peak hours when possible',
          type: 'schedule_change',
          effort: 'medium'
        }
      ],
      createdAt: new Date()
    }];
  }

  private async analyzeCompletionPatterns(userId: string): Promise<AIInsight[]> {
    const completionRate = this.calculateOverallCompletionRate();
    const trends = this.analyzeCompletionTrends();

    const insights: AIInsight[] = [];

    if (completionRate < 0.7) {
      insights.push({
        id: `completion_rate_${userId}_${Date.now()}`,
        userId,
        type: 'productivity_tip',
        title: 'Improve Task Completion Rate',
        description: `Your current completion rate is ${(completionRate * 100).toFixed(0)}%. Let's optimize your task management.`,
        actionable: true,
        priority: 'medium',
        confidence: 0.75,
        basedOn: ['task_completion_data'],
        suggestedActions: [
          {
            title: 'Break Down Large Tasks',
            description: 'Split complex tasks into smaller, manageable subtasks',
            type: 'task_restructure',
            effort: 'low'
          },
          {
            title: 'Review Task Priorities',
            description: 'Focus on high-priority tasks and consider deferring low-priority ones',
            type: 'task_restructure',
            effort: 'medium'
          }
        ],
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async analyzeHabitConsistency(userId: string): Promise<AIInsight[]> {
    const habitData = this.getHabitCompletionData();
    const consistencyScore = this.calculateHabitConsistency(habitData);

    if (consistencyScore < 0.6) {
      return [{
        id: `habit_consistency_${userId}_${Date.now()}`,
        userId,
        type: 'habit_recommendation',
        title: 'Strengthen Habit Formation',
        description: `Your habit consistency is at ${(consistencyScore * 100).toFixed(0)}%. Small adjustments can make a big difference.`,
        actionable: true,
        priority: 'medium',
        confidence: 0.72,
        basedOn: ['habit_completion_patterns'],
        suggestedActions: [
          {
            title: 'Start with One Habit',
            description: 'Focus on building one strong habit before adding others',
            type: 'habit_addition',
            effort: 'low'
          },
          {
            title: 'Set Habit Reminders',
            description: 'Add contextual reminders for your most important habits',
            type: 'schedule_change',
            effort: 'low'
          }
        ],
        createdAt: new Date()
      }];
    }

    return [];
  }

  private async analyzeProcrastinationPatterns(userId: string): Promise<AIInsight[]> {
    const procrastinationIndicators = this.identifyProcrastinationPatterns();

    if (procrastinationIndicators.length > 0) {
      return [{
        id: `procrastination_${userId}_${Date.now()}`,
        userId,
        type: 'productivity_tip',
        title: 'Combat Procrastination Patterns',
        description: 'Detected patterns that suggest procrastination on certain types of tasks.',
        actionable: true,
        priority: 'medium',
        confidence: 0.68,
        basedOn: ['task_delay_patterns', 'completion_timings'],
        suggestedActions: [
          {
            title: 'Use the 2-Minute Rule',
            description: 'If a task takes less than 2 minutes, do it immediately',
            type: 'task_restructure',
            effort: 'low'
          },
          {
            title: 'Time-box Difficult Tasks',
            description: 'Set a timer for 25 minutes and work on challenging tasks without distractions',
            type: 'schedule_change',
            effort: 'medium'
          }
        ],
        createdAt: new Date()
      }];
    }

    return [];
  }

  private async analyzeWorkloadBalance(userId: string): Promise<AIInsight[]> {
    const workload = this.calculateWorkloadMetrics();
    const insights: AIInsight[] = [];

    if (workload.overloadRisk > 0.7) {
      insights.push({
        id: `workload_balance_${userId}_${Date.now()}`,
        userId,
        type: 'optimization_suggestion',
        title: 'Workload Optimization Needed',
        description: 'Your current workload may be unsustainable. Consider adjusting your commitments.',
        actionable: true,
        priority: 'high',
        confidence: 0.80,
        basedOn: ['task_volume', 'completion_pressure', 'time_allocation'],
        suggestedActions: [
          {
            title: 'Delegate or Defer Tasks',
            description: 'Review your task list and identify items that can be delegated or postponed',
            type: 'task_restructure',
            effort: 'medium'
          },
          {
            title: 'Implement Buffer Time',
            description: 'Add 15-20% buffer time between tasks to reduce pressure',
            type: 'schedule_change',
            effort: 'low'
          }
        ],
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async analyzeGoalAlignment(userId: string): Promise<AIInsight[]> {
    const alignment = this.assessGoalAlignment();

    if (alignment.score < 0.6) {
      return [{
        id: `goal_alignment_${userId}_${Date.now()}`,
        userId,
        type: 'goal_adjustment',
        title: 'Realign Tasks with Goals',
        description: 'Many of your tasks don\'t seem connected to your main goals. Let\'s improve focus.',
        actionable: true,
        priority: 'medium',
        confidence: 0.70,
        basedOn: ['goal_progress', 'task_categorization'],
        suggestedActions: [
          {
            title: 'Review Goal Relevance',
            description: 'Audit your tasks and eliminate those not contributing to your goals',
            type: 'goal_adjustment',
            effort: 'medium'
          },
          {
            title: 'Create Goal-Linked Tasks',
            description: 'For each goal, create specific tasks that directly contribute to its achievement',
            type: 'task_restructure',
            effort: 'medium'
          }
        ],
        createdAt: new Date()
      }];
    }

    return [];
  }

  // Predictive methods
  async predictTaskCompletion(taskId: string, metadata: UserActivity['metadata']): Promise<{
    probability: number;
    confidence: number;
    recommendedTime: Date;
    reasoning: string[];
  }> {
    const model = this.models.get('completion_prediction');
    if (!model) throw new Error('Completion prediction model not found');

    const historicalData = this.getHistoricalCompletionData(metadata);
    const timeFactors = this.analyzeTimeFactors(metadata.timeOfDay);
    const priorityFactors = this.analyzePriorityFactors(metadata.priority);

    const probability = this.calculateCompletionProbability(historicalData, timeFactors, priorityFactors);
    const confidence = Math.min(model.accuracy, 0.95);

    return {
      probability,
      confidence,
      recommendedTime: this.getOptimalCompletionTime(metadata),
      reasoning: [
        `Based on your ${(historicalData.completionRate * 100).toFixed(0)}% completion rate for similar tasks`,
        `Considering your ${timeFactors.efficiency * 100}% efficiency during ${metadata.timeOfDay}`,
        `Factoring in ${metadata.priority} priority task patterns`
      ]
    };
  }

  async predictBurnoutRisk(userId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    probability: number;
    indicators: string[];
    preventiveActions: string[];
  }> {
    const workloadMetrics = this.calculateWorkloadMetrics();
    const stressIndicators = this.identifyStressPatterns();
    const habitConsistency = this.calculateHabitConsistency(this.getHabitCompletionData());

    const riskScore = this.calculateBurnoutRisk(workloadMetrics, stressIndicators, habitConsistency);

    return {
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      probability: riskScore,
      indicators: this.getBurnoutIndicators(workloadMetrics, stressIndicators),
      preventiveActions: this.getBurnoutPreventionActions(riskScore)
    };
  }

  // Helper methods for data analysis
  private getCompletionsByTimeOfDay(): Record<string, { completed: number; total: number }> {
    const hourlyData: Record<number, { completed: number; total: number }> = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { completed: 0, total: 0 };
    }

    this.activities.forEach(activity => {
      const hour = activity.timestamp.getHours();
      if (activity.type === 'task_completed') {
        hourlyData[hour].completed++;
        hourlyData[hour].total++;
      } else if (activity.type === 'task_created') {
        hourlyData[hour].total++;
      }
    });

    return Object.fromEntries(
      Object.entries(hourlyData).map(([hour, data]) => [
        hour,
        { completed: data.completed, total: Math.max(data.total, 1) }
      ])
    );
  }

  private identifyPeakPerformanceHours(completionsByHour: Record<string, { completed: number; total: number }>): Array<{ hour: string; efficiency: number }> {
    const efficiencyByHour = Object.entries(completionsByHour).map(([hour, data]) => ({
      hour,
      efficiency: data.completed / data.total
    }));

    const averageEfficiency = efficiencyByHour.reduce((sum, h) => sum + h.efficiency, 0) / efficiencyByHour.length;

    return efficiencyByHour
      .filter(h => h.efficiency > averageEfficiency * 1.2)
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);
  }

  private calculateOverallCompletionRate(): number {
    const completedTasks = this.activities.filter(a => a.type === 'task_completed').length;
    const createdTasks = this.activities.filter(a => a.type === 'task_created').length;

    return createdTasks > 0 ? completedTasks / createdTasks : 0;
  }

  private analyzeCompletionTrends(): { trend: 'improving' | 'declining' | 'stable'; rate: number } {
    // Simplified trend analysis - in real implementation would use more sophisticated time series analysis
    const recentActivities = this.activities.filter(a =>
      a.timestamp >= subDays(new Date(), 7)
    );

    const olderActivities = this.activities.filter(a =>
      a.timestamp >= subDays(new Date(), 14) && a.timestamp < subDays(new Date(), 7)
    );

    const recentRate = this.calculateCompletionRateForActivities(recentActivities);
    const olderRate = this.calculateCompletionRateForActivities(olderActivities);

    const change = recentRate - olderRate;

    return {
      trend: change > 0.05 ? 'improving' : change < -0.05 ? 'declining' : 'stable',
      rate: change
    };
  }

  private calculateCompletionRateForActivities(activities: UserActivity[]): number {
    const completed = activities.filter(a => a.type === 'task_completed').length;
    const created = activities.filter(a => a.type === 'task_created').length;
    return created > 0 ? completed / created : 0;
  }

  private getHabitCompletionData(): Array<{ date: Date; completed: boolean; habitId: string }> {
    return this.activities
      .filter(a => a.type === 'habit_completed')
      .map(a => ({
        date: a.timestamp,
        completed: true,
        habitId: a.metadata.habitId || ''
      }));
  }

  private calculateHabitConsistency(habitData: Array<{ date: Date; completed: boolean; habitId: string }>): number {
    if (habitData.length === 0) return 0;

    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    const completionDays = new Set(
      habitData.map(h => format(h.date, 'yyyy-MM-dd'))
    );

    const consistentDays = last30Days.filter(day =>
      completionDays.has(format(day, 'yyyy-MM-dd'))
    ).length;

    return consistentDays / 30;
  }

  private identifyProcrastinationPatterns(): string[] {
    // Analyze patterns that suggest procrastination
    const indicators: string[] = [];

    const taskCreatedToCompleted = this.activities
      .filter(a => a.type === 'task_completed')
      .map(completion => {
        const creation = this.activities.find(create =>
          create.type === 'task_created' &&
          create.metadata.taskId === completion.metadata.taskId
        );
        return creation ? differenceInHours(completion.timestamp, creation.timestamp) : 0;
      })
      .filter(hours => hours > 0);

    const averageDelayHours = taskCreatedToCompleted.reduce((sum, h) => sum + h, 0) / taskCreatedToCompleted.length;

    if (averageDelayHours > 48) {
      indicators.push('tasks_delayed_significantly');
    }

    // Check for tasks created but never completed
    const incompleteTasks = this.activities
      .filter(a => a.type === 'task_created')
      .filter(created => !this.activities.some(completed =>
        completed.type === 'task_completed' &&
        completed.metadata.taskId === created.metadata.taskId
      ));

    if (incompleteTasks.length > taskCreatedToCompleted.length * 0.3) {
      indicators.push('high_incompletion_rate');
    }

    return indicators;
  }

  private calculateWorkloadMetrics(): {
    overloadRisk: number;
    taskVelocity: number;
    pressureIndex: number;
  } {
    const recentTasks = this.activities.filter(a =>
      a.timestamp >= subDays(new Date(), 7) &&
      (a.type === 'task_created' || a.type === 'task_completed')
    );

    const tasksPerDay = recentTasks.length / 7;
    const completionRate = this.calculateCompletionRateForActivities(recentTasks);

    return {
      overloadRisk: Math.min(tasksPerDay / 10, 1), // Normalize based on assumed max of 10 tasks/day
      taskVelocity: completionRate,
      pressureIndex: (tasksPerDay * (1 - completionRate))
    };
  }

  private assessGoalAlignment(): { score: number; misalignedCategories: string[] } {
    // Simplified goal alignment analysis
    const taskCategories = this.activities
      .filter(a => a.type === 'task_created' && a.metadata.category)
      .map(a => a.metadata.category!);

    const categoryDistribution = taskCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Simplified scoring - in real implementation would compare against user's stated goals
    const focusScore = Math.max(...Object.values(categoryDistribution)) / taskCategories.length;

    return {
      score: focusScore,
      misalignedCategories: Object.keys(categoryDistribution).filter(cat =>
        categoryDistribution[cat] < taskCategories.length * 0.1
      )
    };
  }

  private getHistoricalCompletionData(metadata: UserActivity['metadata']): {
    completionRate: number;
    averageTimeToComplete: number;
  } {
    const similarTasks = this.activities.filter(a =>
      a.type === 'task_completed' &&
      a.metadata.category === metadata.category &&
      a.metadata.priority === metadata.priority
    );

    return {
      completionRate: similarTasks.length > 0 ? 0.8 : 0.5, // Default values
      averageTimeToComplete: 2 // hours
    };
  }

  private analyzeTimeFactors(timeOfDay?: string): { efficiency: number } {
    if (!timeOfDay) return { efficiency: 0.5 };

    const timeEfficiency = {
      morning: 0.85,
      afternoon: 0.75,
      evening: 0.65,
      night: 0.45
    };

    return { efficiency: timeEfficiency[timeOfDay as keyof typeof timeEfficiency] || 0.5 };
  }

  private analyzePriorityFactors(priority?: string): { urgencyMultiplier: number } {
    const priorityMultipliers = {
      high: 1.2,
      medium: 1.0,
      low: 0.8
    };

    return { urgencyMultiplier: priorityMultipliers[priority as keyof typeof priorityMultipliers] || 1.0 };
  }

  private calculateCompletionProbability(
    historical: { completionRate: number; averageTimeToComplete: number },
    timeFactors: { efficiency: number },
    priorityFactors: { urgencyMultiplier: number }
  ): number {
    return Math.min(
      historical.completionRate * timeFactors.efficiency * priorityFactors.urgencyMultiplier,
      0.95
    );
  }

  private getOptimalCompletionTime(metadata: UserActivity['metadata']): Date {
    // Simple heuristic - recommend next peak performance time
    const now = new Date();
    const morningStart = new Date(now);
    morningStart.setHours(9, 0, 0, 0);

    if (now < morningStart) {
      return morningStart;
    } else {
      const nextMorning = addDays(morningStart, 1);
      return nextMorning;
    }
  }

  private identifyStressPatterns(): string[] {
    const indicators: string[] = [];

    // Look for rapid task creation without completion
    const recentCreations = this.activities
      .filter(a => a.type === 'task_created' && a.timestamp >= subDays(new Date(), 3))
      .length;

    const recentCompletions = this.activities
      .filter(a => a.type === 'task_completed' && a.timestamp >= subDays(new Date(), 3))
      .length;

    if (recentCreations > recentCompletions * 2) {
      indicators.push('task_accumulation');
    }

    return indicators;
  }

  private calculateBurnoutRisk(
    workload: { overloadRisk: number; taskVelocity: number; pressureIndex: number },
    stressIndicators: string[],
    habitConsistency: number
  ): number {
    const workloadWeight = 0.4;
    const stressWeight = 0.3;
    const habitWeight = 0.3;

    const workloadScore = (workload.overloadRisk + workload.pressureIndex) / 2;
    const stressScore = stressIndicators.length / 5; // Normalize assuming max 5 indicators
    const habitScore = 1 - habitConsistency; // Inverted because low consistency indicates risk

    return Math.min(
      workloadScore * workloadWeight + stressScore * stressWeight + habitScore * habitWeight,
      1
    );
  }

  private getBurnoutIndicators(
    workload: { overloadRisk: number; taskVelocity: number; pressureIndex: number },
    stressIndicators: string[]
  ): string[] {
    const indicators: string[] = [];

    if (workload.overloadRisk > 0.7) {
      indicators.push('High task volume detected');
    }

    if (workload.taskVelocity < 0.6) {
      indicators.push('Declining completion rates');
    }

    if (stressIndicators.includes('task_accumulation')) {
      indicators.push('Tasks accumulating faster than completion');
    }

    return indicators;
  }

  private getBurnoutPreventionActions(riskScore: number): string[] {
    const actions: string[] = [];

    if (riskScore > 0.7) {
      actions.push('Take immediate break - consider a day off');
      actions.push('Delegate or postpone non-essential tasks');
      actions.push('Reduce daily task commitments by 30%');
    } else if (riskScore > 0.4) {
      actions.push('Schedule regular breaks between tasks');
      actions.push('Review and prioritize your task list');
      actions.push('Establish better work-life boundaries');
    } else {
      actions.push('Maintain current pace');
      actions.push('Continue monitoring stress levels');
    }

    return actions;
  }

  // Public API methods for getting insights
  async generateWeeklyInsights(userId: string): Promise<AIInsight[]> {
    const weeklyActivities = this.activities.filter(a =>
      a.userId === userId && a.timestamp >= subDays(new Date(), 7)
    );

    return this.analyzeUserBehavior(userId, weeklyActivities);
  }

  async getPersonalizedRecommendations(userId: string, context?: {
    currentTime?: Date;
    upcomingTasks?: Array<{ id: string; priority: string; category: string }>;
    recentActivity?: UserActivity[];
  }): Promise<AIInsight[]> {
    // Use context to provide more targeted recommendations
    const insights = await this.analyzeUserBehavior(userId, context?.recentActivity || this.activities);

    // Filter and rank based on current context
    return insights
      .filter(insight => insight.actionable)
      .sort((a, b) => {
        // Prioritize based on confidence and priority
        const aScore = a.confidence * (a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1);
        const bScore = b.confidence * (b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1);
        return bScore - aScore;
      })
      .slice(0, 5); // Return top 5 recommendations
  }
}