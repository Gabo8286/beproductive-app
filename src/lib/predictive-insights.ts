import { ProductivityInsight } from "@/lib/ai-service";

export interface UserActivityData {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
    priority: "low" | "medium" | "high";
    category?: string;
    estimatedTime?: number;
    actualTime?: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    deadline?: Date;
    category: string;
  }>;
  habits: Array<{
    id: string;
    title: string;
    completions: Date[];
    target: number;
  }>;
  timeEntries: Array<{
    id: string;
    taskId?: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    category: string;
  }>;
}

export class ProductivityAnalyzer {
  /**
   * Generate comprehensive productivity insights
   */
  static generateInsights(data: UserActivityData): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];

    // Peak productivity hours analysis
    insights.push(...this.analyzePeakHours(data));

    // Task completion patterns
    insights.push(...this.analyzeTaskPatterns(data));

    // Goal progress analysis
    insights.push(...this.analyzeGoalProgress(data));

    // Workload capacity warnings
    insights.push(...this.analyzeWorkloadCapacity(data));

    // Habit effectiveness
    insights.push(...this.analyzeHabitEffectiveness(data));

    // Time estimation accuracy
    insights.push(...this.analyzeTimeEstimation(data));

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze peak productivity hours
   */
  private static analyzePeakHours(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const hourlyProductivity = new Map<
      number,
      { completed: number; total: number }
    >();

    // Initialize hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyProductivity.set(hour, { completed: 0, total: 0 });
    }

    // Analyze task completions by hour
    data.tasks.forEach((task) => {
      if (task.completedAt) {
        const hour = task.completedAt.getHours();
        const current = hourlyProductivity.get(hour)!;
        current.completed++;
        current.total++;
        hourlyProductivity.set(hour, current);
      }
    });

    // Find peak hours
    const productivityRates = Array.from(hourlyProductivity.entries())
      .map(([hour, stats]) => ({
        hour,
        rate: stats.total > 0 ? stats.completed / stats.total : 0,
        count: stats.total,
      }))
      .filter((item) => item.count >= 3) // Need minimum data
      .sort((a, b) => b.rate - a.rate);

    if (productivityRates.length === 0) {
      return [];
    }

    const peakHour = productivityRates[0];
    const timeRange = this.getTimeRangeString(peakHour.hour);

    return [
      {
        type: "pattern",
        title: `Peak Productivity: ${timeRange}`,
        description: `You're ${Math.round(peakHour.rate * 100)}% more productive during ${timeRange}. Consider scheduling important tasks during this time.`,
        data: { peakHour: peakHour.hour, productivity: peakHour.rate },
        confidence: Math.min(0.9, peakHour.count / 10),
        actionable: true,
        suggestedActions: [
          `Block ${timeRange} for your most important tasks`,
          "Avoid meetings during your peak productivity hours",
          "Use this time for deep work and complex projects",
        ],
      },
    ];
  }

  /**
   * Analyze task completion patterns
   */
  private static analyzeTaskPatterns(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTasks = data.tasks.filter((task) => task.createdAt >= lastWeek);
    const completedTasks = recentTasks.filter((task) => task.completed);
    const completionRate =
      recentTasks.length > 0 ? completedTasks.length / recentTasks.length : 0;

    // Completion rate insight
    if (recentTasks.length >= 5) {
      if (completionRate >= 0.8) {
        insights.push({
          type: "achievement",
          title: "Excellent Task Completion",
          description: `You've completed ${Math.round(completionRate * 100)}% of your tasks this week. Keep up the great work!`,
          data: { completionRate, tasksCompleted: completedTasks.length },
          confidence: 0.9,
          actionable: false,
        });
      } else if (completionRate < 0.5) {
        insights.push({
          type: "warning",
          title: "Low Task Completion Rate",
          description: `Your task completion rate is ${Math.round(completionRate * 100)}%. Consider breaking down large tasks or reducing your workload.`,
          data: { completionRate, tasksCompleted: completedTasks.length },
          confidence: 0.8,
          actionable: true,
          suggestedActions: [
            "Break large tasks into smaller, manageable pieces",
            "Set more realistic deadlines",
            "Focus on 3-5 priority tasks per day",
          ],
        });
      }
    }

    // Priority distribution analysis
    const priorityCounts = {
      high: recentTasks.filter((t) => t.priority === "high").length,
      medium: recentTasks.filter((t) => t.priority === "medium").length,
      low: recentTasks.filter((t) => t.priority === "low").length,
    };

    const totalPriority =
      priorityCounts.high + priorityCounts.medium + priorityCounts.low;
    if (totalPriority > 0) {
      const highPriorityPercentage = priorityCounts.high / totalPriority;

      if (highPriorityPercentage > 0.6) {
        insights.push({
          type: "warning",
          title: "Too Many High Priority Tasks",
          description: `${Math.round(highPriorityPercentage * 100)}% of your tasks are high priority. This can lead to burnout and decision fatigue.`,
          data: priorityCounts,
          confidence: 0.7,
          actionable: true,
          suggestedActions: [
            "Review and reprioritize your tasks",
            "Delegate or defer some high priority items",
            "Use the Eisenhower Matrix for better prioritization",
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Analyze goal progress
   */
  private static analyzeGoalProgress(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = new Date();

    data.goals.forEach((goal) => {
      if (goal.deadline) {
        const timeRemaining = goal.deadline.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

        if (daysRemaining > 0 && daysRemaining <= 30) {
          const progressNeeded = 100 - goal.progress;
          const dailyProgressNeeded = progressNeeded / daysRemaining;

          if (dailyProgressNeeded > 10) {
            insights.push({
              type: "warning",
              title: `Goal "${goal.title}" at Risk`,
              description: `You need ${dailyProgressNeeded.toFixed(1)}% daily progress to meet your deadline in ${daysRemaining} days.`,
              data: { goalId: goal.id, dailyProgressNeeded, daysRemaining },
              confidence: 0.8,
              actionable: true,
              suggestedActions: [
                "Dedicate more time to this goal",
                "Break the goal into smaller milestones",
                "Consider extending the deadline if possible",
              ],
            });
          } else if (goal.progress >= 80) {
            insights.push({
              type: "achievement",
              title: `Goal "${goal.title}" Almost Complete!`,
              description: `You're ${goal.progress}% complete with ${daysRemaining} days remaining. You're on track to succeed!`,
              data: { goalId: goal.id, progress: goal.progress },
              confidence: 0.9,
              actionable: false,
            });
          }
        }
      }
    });

    return insights;
  }

  /**
   * Analyze workload capacity
   */
  private static analyzeWorkloadCapacity(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate today's planned work
    const todaysTasks = data.tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= today && !task.completed;
    });

    const estimatedWorkload = todaysTasks.reduce((total, task) => {
      return total + (task.estimatedTime || 30); // Default 30 minutes
    }, 0);

    const hoursOfWork = estimatedWorkload / 60;

    if (hoursOfWork > 8) {
      insights.push({
        type: "warning",
        title: "Overloaded Schedule",
        description: `You have ${hoursOfWork.toFixed(1)} hours of estimated work today. Consider rescheduling some tasks.`,
        data: { estimatedHours: hoursOfWork, taskCount: todaysTasks.length },
        confidence: 0.8,
        actionable: true,
        suggestedActions: [
          "Move non-urgent tasks to tomorrow",
          "Delegate tasks if possible",
          "Focus on your top 3 priorities only",
        ],
      });
    }

    return insights;
  }

  /**
   * Analyze habit effectiveness
   */
  private static analyzeHabitEffectiveness(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    data.habits.forEach((habit) => {
      const recentCompletions = habit.completions.filter(
        (date) => date >= lastMonth,
      );
      const completionRate = recentCompletions.length / 30; // Daily rate
      const targetRate = habit.target / 7; // Convert weekly target to daily

      if (completionRate >= targetRate * 0.8) {
        insights.push({
          type: "achievement",
          title: `Habit "${habit.title}" Going Strong`,
          description: `You're maintaining a ${Math.round(completionRate * 100)}% completion rate on this habit.`,
          data: { habitId: habit.id, completionRate },
          confidence: 0.8,
          actionable: false,
        });
      } else if (completionRate < targetRate * 0.5) {
        insights.push({
          type: "recommendation",
          title: `Improve "${habit.title}" Consistency`,
          description: `Your completion rate is ${Math.round(completionRate * 100)}%. Consider adjusting your approach.`,
          data: { habitId: habit.id, completionRate },
          confidence: 0.7,
          actionable: true,
          suggestedActions: [
            "Reduce the habit frequency to build consistency",
            "Add a trigger or reminder to your routine",
            "Pair this habit with an existing routine",
          ],
        });
      }
    });

    return insights;
  }

  /**
   * Analyze time estimation accuracy
   */
  private static analyzeTimeEstimation(
    data: UserActivityData,
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];

    const tasksWithTime = data.tasks.filter(
      (task) => task.estimatedTime && task.actualTime && task.completed,
    );

    if (tasksWithTime.length >= 5) {
      const estimationErrors = tasksWithTime.map((task) => {
        const error =
          (task.actualTime! - task.estimatedTime!) / task.estimatedTime!;
        return { error, task };
      });

      const avgError =
        estimationErrors.reduce((sum, item) => sum + item.error, 0) /
        estimationErrors.length;

      if (Math.abs(avgError) > 0.3) {
        const direction = avgError > 0 ? "underestimate" : "overestimate";
        const percentage = Math.round(Math.abs(avgError) * 100);

        insights.push({
          type: "pattern",
          title: `Time Estimation Bias Detected`,
          description: `You typically ${direction} task duration by ${percentage}%. Adjust your estimates accordingly.`,
          data: { avgError, direction, percentage },
          confidence: 0.7,
          actionable: true,
          suggestedActions: [
            `${direction === "underestimate" ? "Add" : "Reduce"} 20-30% buffer time to estimates`,
            "Track time more closely for better estimation",
            "Review past similar tasks before estimating",
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Get human-readable time range string
   */
  private static getTimeRangeString(hour: number): string {
    const start = hour;
    const end = (hour + 1) % 24;

    const formatHour = (h: number) => {
      if (h === 0) return "12 AM";
      if (h < 12) return `${h} AM`;
      if (h === 12) return "12 PM";
      return `${h - 12} PM`;
    };

    return `${formatHour(start)} - ${formatHour(end)}`;
  }
}

export default ProductivityAnalyzer;
