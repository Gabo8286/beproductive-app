import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface HabitContext {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  is_active: boolean;
  created_at: string;
  streak_count: number;
  total_completions: number;
  reminder_time?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  metadata?: any;
}

export interface HabitPerformance {
  habitId: string;
  completionRate: number; // Percentage of target completions
  streakData: {
    currentStreak: number;
    longestStreak: number;
    averageStreak: number;
  };
  consistency: number; // 0-1 score for consistency
  momentum: 'building' | 'stable' | 'declining';
  patterns: {
    bestDays: string[];
    bestTimes: string[];
    successFactors: string[];
    strugglingAreas: string[];
  };
  difficulty: 'too_easy' | 'optimal' | 'too_hard';
  recommendation: 'maintain' | 'increase' | 'decrease' | 'redesign';
}

export interface HabitOptimization {
  habitId: string;
  type: 'frequency' | 'timing' | 'difficulty' | 'strategy' | 'environment' | 'reward';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: string;
  implementationSteps: string[];
  confidence: number;
  estimatedTimeToSeeResults: string; // e.g., "2-3 weeks"
  metrics: string[]; // What to track to measure success
}

export interface HabitInsight {
  type: 'pattern' | 'correlation' | 'bottleneck' | 'opportunity' | 'warning';
  title: string;
  description: string;
  affectedHabits: string[];
  actionable: boolean;
  suggestions: string[];
  confidence: number;
}

export interface HabitAnalysisRequest {
  userId: string;
  habits: HabitContext[];
  lookbackDays?: number;
  preferredProvider?: AIProvider;
  includeGoalAlignment?: boolean;
  includeLifestyleFactors?: boolean;
}

export class HabitOptimizer {
  private static instance: HabitOptimizer;

  public static getInstance(): HabitOptimizer {
    if (!HabitOptimizer.instance) {
      HabitOptimizer.instance = new HabitOptimizer();
    }
    return HabitOptimizer.instance;
  }

  public async analyzeHabits(request: HabitAnalysisRequest): Promise<{
    performance: HabitPerformance[];
    optimizations: HabitOptimization[];
    insights: HabitInsight[];
  }> {
    const { habits, userId, preferredProvider = 'lovable', lookbackDays = 30 } = request;

    // Analyze performance for each habit
    const performanceAnalyses = await Promise.all(
      habits.map(habit => this.analyzeHabitPerformance(habit, userId, lookbackDays))
    );

    // Generate AI-powered optimizations
    const optimizations: HabitOptimization[] = [];
    for (const habit of habits) {
      try {
        const performance = performanceAnalyses.find(p => p.habitId === habit.id)!;
        const habitOptimizations = await this.generateHabitOptimizations(
          habit,
          performance,
          preferredProvider,
          userId
        );
        optimizations.push(...habitOptimizations);
      } catch (error) {
        console.error(`Failed to generate optimizations for habit ${habit.id}:`, error);
      }
    }

    // Generate cross-habit insights
    const insights = await this.generateHabitInsights(
      habits,
      performanceAnalyses,
      preferredProvider,
      userId
    );

    return {
      performance: performanceAnalyses,
      optimizations,
      insights
    };
  }

  private async analyzeHabitPerformance(
    habit: HabitContext,
    userId: string,
    lookbackDays: number
  ): Promise<HabitPerformance> {
    // Get habit completion data
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habit.id)
      .gte('completed_at', new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false });

    const totalCompletions = completions?.length || 0;
    const targetCompletions = this.calculateTargetCompletions(habit, lookbackDays);
    const completionRate = targetCompletions > 0 ? (totalCompletions / targetCompletions) * 100 : 0;

    // Calculate streak data
    const streakData = this.calculateStreakData(completions || [], habit);

    // Calculate consistency score
    const consistency = this.calculateConsistency(completions || [], habit, lookbackDays);

    // Determine momentum
    const momentum = this.determineMomentum(completions || [], lookbackDays);

    // Analyze patterns
    const patterns = this.analyzePatterns(completions || [], habit);

    // Assess difficulty
    const difficulty = this.assessDifficulty(completionRate, consistency, streakData);

    // Generate recommendation
    const recommendation = this.generateRecommendation(completionRate, consistency, difficulty);

    return {
      habitId: habit.id,
      completionRate,
      streakData,
      consistency,
      momentum,
      patterns,
      difficulty,
      recommendation
    };
  }

  private async generateHabitOptimizations(
    habit: HabitContext,
    performance: HabitPerformance,
    provider: AIProvider,
    userId: string
  ): Promise<HabitOptimization[]> {
    const prompt = this.buildHabitOptimizationPrompt(habit, performance);

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: 'habit_optimization',
      maxTokens: 700,
      temperature: 0.7,
      metadata: { habitId: habit.id }
    };

    const response = await aiServiceManager.makeRequest(request);

    if (response.success) {
      return this.parseHabitOptimizations(response.content, habit.id);
    }

    // Fallback optimizations
    return this.generateFallbackOptimizations(habit, performance);
  }

  private buildHabitOptimizationPrompt(habit: HabitContext, performance: HabitPerformance): string {
    return `You are an expert habit formation coach analyzing a user's habit performance and providing optimization recommendations.

HABIT DETAILS:
- Title: "${habit.title}"
- Description: "${habit.description || 'No description'}"
- Category: ${habit.category}
- Frequency: ${habit.frequency}
- Target: ${habit.target_count} times per ${habit.frequency}
- Difficulty Level: ${habit.difficulty_level}
- Current Streak: ${habit.streak_count}
- Total Completions: ${habit.total_completions}
- Reminder Time: ${habit.reminder_time || 'Not set'}

PERFORMANCE ANALYSIS:
- Completion Rate: ${performance.completionRate.toFixed(1)}%
- Current Streak: ${performance.streakData.currentStreak} days
- Longest Streak: ${performance.streakData.longestStreak} days
- Consistency Score: ${(performance.consistency * 100).toFixed(1)}%
- Momentum: ${performance.momentum}
- Difficulty Assessment: ${performance.difficulty}
- Best Days: ${performance.patterns.bestDays.join(', ') || 'None identified'}
- Best Times: ${performance.patterns.bestTimes.join(', ') || 'None identified'}
- Success Factors: ${performance.patterns.successFactors.join(', ') || 'None identified'}
- Struggling Areas: ${performance.patterns.strugglingAreas.join(', ') || 'None identified'}

OPTIMIZATION REQUEST:
Based on this habit's performance data, provide 2-4 specific optimization recommendations. Consider:

1. FREQUENCY adjustments - Modify how often the habit should be performed
2. TIMING optimizations - Better times or scheduling for the habit
3. DIFFICULTY modifications - Making the habit easier or more challenging
4. STRATEGY improvements - Different approaches or techniques
5. ENVIRONMENT changes - Environmental modifications to support the habit
6. REWARD system - Motivation and reward mechanisms

For each optimization, provide:
- Type (frequency/timing/difficulty/strategy/environment/reward)
- Title (brief, actionable)
- Description (2-3 sentences explaining the change)
- Reasoning (why this optimization will help)
- Priority (low/medium/high/urgent)
- Effort (low/medium/high)
- Expected Impact (what outcome this should produce)
- Implementation Steps (3-5 specific actions)
- Time to See Results (e.g., "1-2 weeks")
- Metrics to Track (how to measure success)

Format as JSON array:
[
  {
    "type": "optimization_type",
    "title": "Brief title",
    "description": "Detailed description",
    "reasoning": "Why this helps",
    "priority": "priority_level",
    "effort": "effort_level",
    "expectedImpact": "What this achieves",
    "implementationSteps": ["step1", "step2", "step3"],
    "estimatedTimeToSeeResults": "time_estimate",
    "metrics": ["metric1", "metric2"],
    "confidence": 0.8
  }
]`;
  }

  private parseHabitOptimizations(content: string, habitId: string): HabitOptimization[] {
    try {
      const optimizations = JSON.parse(content);
      return optimizations.map((opt: any) => ({
        habitId,
        type: opt.type || 'strategy',
        title: opt.title,
        description: opt.description,
        reasoning: opt.reasoning,
        priority: opt.priority || 'medium',
        effort: opt.effort || 'medium',
        expectedImpact: opt.expectedImpact,
        implementationSteps: opt.implementationSteps || [],
        confidence: opt.confidence || 0.7,
        estimatedTimeToSeeResults: opt.estimatedTimeToSeeResults || 'Unknown',
        metrics: opt.metrics || []
      }));
    } catch (error) {
      console.error('Failed to parse habit optimizations:', error);
      return [];
    }
  }

  private generateFallbackOptimizations(habit: HabitContext, performance: HabitPerformance): HabitOptimization[] {
    const optimizations: HabitOptimization[] = [];

    // Low completion rate optimizations
    if (performance.completionRate < 50) {
      optimizations.push({
        habitId: habit.id,
        type: 'difficulty',
        title: 'Reduce habit difficulty',
        description: 'Lower the barrier to entry by making the habit easier to complete.',
        reasoning: 'Low completion rate suggests the habit may be too challenging',
        priority: 'high',
        effort: 'low',
        expectedImpact: 'Improved consistency and momentum building',
        implementationSteps: [
          'Reduce target count by 50%',
          'Simplify the habit steps',
          'Remove unnecessary requirements'
        ],
        confidence: 0.8,
        estimatedTimeToSeeResults: '1-2 weeks',
        metrics: ['completion_rate', 'streak_length']
      });
    }

    // Inconsistency optimizations
    if (performance.consistency < 0.6) {
      optimizations.push({
        habitId: habit.id,
        type: 'timing',
        title: 'Optimize habit timing',
        description: 'Find a better time slot that aligns with your natural energy and schedule.',
        reasoning: 'Inconsistent performance often indicates poor timing',
        priority: 'medium',
        effort: 'medium',
        expectedImpact: 'More consistent daily completion',
        implementationSteps: [
          'Track energy levels throughout the day',
          'Identify optimal time windows',
          'Update reminder settings',
          'Test new timing for one week'
        ],
        confidence: 0.7,
        estimatedTimeToSeeResults: '2-3 weeks',
        metrics: ['consistency_score', 'completion_rate']
      });
    }

    // Declining momentum optimizations
    if (performance.momentum === 'declining') {
      optimizations.push({
        habitId: habit.id,
        type: 'reward',
        title: 'Add motivation system',
        description: 'Implement a reward system to rebuild momentum and motivation.',
        reasoning: 'Declining momentum indicates need for renewed motivation',
        priority: 'high',
        effort: 'medium',
        expectedImpact: 'Restored motivation and momentum',
        implementationSteps: [
          'Define milestone rewards',
          'Set up daily completion celebrations',
          'Create accountability measures',
          'Track progress visually'
        ],
        confidence: 0.6,
        estimatedTimeToSeeResults: '1-2 weeks',
        metrics: ['completion_rate', 'streak_length', 'motivation_score']
      });
    }

    return optimizations;
  }

  private async generateHabitInsights(
    habits: HabitContext[],
    performanceData: HabitPerformance[],
    provider: AIProvider,
    userId: string
  ): Promise<HabitInsight[]> {
    const overallStats = this.calculateHabitStats(habits, performanceData);

    const prompt = `Analyze this user's habit portfolio and identify key insights and patterns.

HABIT PORTFOLIO SUMMARY:
- Total Active Habits: ${habits.filter(h => h.is_active).length}
- Average Completion Rate: ${overallStats.averageCompletionRate.toFixed(1)}%
- Habits Building Momentum: ${overallStats.buildingCount}
- Habits Declining: ${overallStats.decliningCount}
- High Consistency Habits: ${overallStats.highConsistencyCount}
- Daily Habits: ${habits.filter(h => h.frequency === 'daily').length}
- Weekly Habits: ${habits.filter(h => h.frequency === 'weekly').length}

CATEGORY DISTRIBUTION:
${overallStats.categoryDistribution}

Generate 2-4 strategic insights about this user's habit patterns, focusing on:
1. Cross-habit patterns and correlations
2. Potential bottlenecks or interference between habits
3. Opportunities for habit stacking or synergies
4. Warning signs or areas needing attention

Format as JSON array with type, title, description, affected habits, actionable status, suggestions, and confidence.`;

    const request: AIServiceRequest = {
      provider,
      prompt,
      userId,
      requestType: 'habit_insights',
      maxTokens: 500,
      temperature: 0.6
    };

    try {
      const response = await aiServiceManager.makeRequest(request);
      if (response.success) {
        return JSON.parse(response.content);
      }
    } catch (error) {
      console.error('Failed to generate habit insights:', error);
    }

    // Fallback insights
    return this.generateFallbackInsights(habits, performanceData);
  }

  private generateFallbackInsights(habits: HabitContext[], performanceData: HabitPerformance[]): HabitInsight[] {
    const insights: HabitInsight[] = [];

    // Too many habits insight
    if (habits.length > 5) {
      insights.push({
        type: 'warning',
        title: 'Habit Overload',
        description: 'You may be trying to build too many habits at once, which can lead to decision fatigue.',
        affectedHabits: habits.map(h => h.id),
        actionable: true,
        suggestions: ['Focus on 2-3 core habits', 'Pause less critical habits', 'Build one habit at a time'],
        confidence: 0.8
      });
    }

    // Consistency pattern
    const highConsistencyHabits = performanceData.filter(p => p.consistency > 0.8);
    if (highConsistencyHabits.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Consistency Leaders',
        description: 'Some habits show excellent consistency - these patterns can be applied to other habits.',
        affectedHabits: highConsistencyHabits.map(h => h.habitId),
        actionable: true,
        suggestions: ['Analyze successful habit factors', 'Apply same timing/approach to other habits'],
        confidence: 0.7
      });
    }

    return insights;
  }

  // Helper methods for calculations

  private calculateTargetCompletions(habit: HabitContext, lookbackDays: number): number {
    switch (habit.frequency) {
      case 'daily':
        return lookbackDays * habit.target_count;
      case 'weekly':
        return Math.floor(lookbackDays / 7) * habit.target_count;
      case 'monthly':
        return Math.floor(lookbackDays / 30) * habit.target_count;
      default:
        return 0;
    }
  }

  private calculateStreakData(completions: any[], habit: HabitContext) {
    // This is a simplified calculation - would need more sophisticated logic for different frequencies
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalStreaks = 0;
    let streakCount = 0;

    // Sort completions by date
    const sortedCompletions = completions.sort((a, b) =>
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    // Calculate current streak (simplified)
    currentStreak = habit.streak_count || 0;

    // Calculate longest streak (placeholder logic)
    longestStreak = Math.max(currentStreak, habit.streak_count || 0);

    const averageStreak = streakCount > 0 ? totalStreaks / streakCount : 0;

    return {
      currentStreak,
      longestStreak,
      averageStreak
    };
  }

  private calculateConsistency(completions: any[], habit: HabitContext, lookbackDays: number): number {
    if (completions.length === 0) return 0;

    const expectedCompletions = this.calculateTargetCompletions(habit, lookbackDays);
    const actualCompletions = completions.length;

    // Basic consistency calculation
    return Math.min(1, actualCompletions / expectedCompletions);
  }

  private determineMomentum(completions: any[], lookbackDays: number): 'building' | 'stable' | 'declining' {
    if (completions.length < 7) return 'building'; // Not enough data

    const halfwayPoint = lookbackDays / 2;
    const recentCompletions = completions.filter(c => {
      const daysAgo = (new Date().getTime() - new Date(c.completed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= halfwayPoint;
    }).length;

    const olderCompletions = completions.filter(c => {
      const daysAgo = (new Date().getTime() - new Date(c.completed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > halfwayPoint;
    }).length;

    if (recentCompletions > olderCompletions * 1.2) return 'building';
    if (recentCompletions < olderCompletions * 0.8) return 'declining';
    return 'stable';
  }

  private analyzePatterns(completions: any[], habit: HabitContext) {
    const dayOfWeekCounts: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};

    completions.forEach(completion => {
      const date = new Date(completion.completed_at);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
      hourCounts[hour.toString()] = (hourCounts[hour.toString()] || 0) + 1;
    });

    const bestDays = Object.entries(dayOfWeekCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([day]) => day);

    const bestTimes = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([hour]) => `${hour}:00`);

    return {
      bestDays,
      bestTimes,
      successFactors: [], // Would need more data to determine
      strugglingAreas: [] // Would need more data to determine
    };
  }

  private assessDifficulty(completionRate: number, consistency: number, streakData: any): 'too_easy' | 'optimal' | 'too_hard' {
    if (completionRate > 90 && consistency > 0.9 && streakData.currentStreak > 14) {
      return 'too_easy';
    }
    if (completionRate < 30 || consistency < 0.3) {
      return 'too_hard';
    }
    return 'optimal';
  }

  private generateRecommendation(completionRate: number, consistency: number, difficulty: string): 'maintain' | 'increase' | 'decrease' | 'redesign' {
    if (difficulty === 'too_easy') return 'increase';
    if (difficulty === 'too_hard') return 'decrease';
    if (completionRate < 50 && consistency < 0.5) return 'redesign';
    if (completionRate > 70 && consistency > 0.7) return 'maintain';
    return 'maintain';
  }

  private calculateHabitStats(habits: HabitContext[], performanceData: HabitPerformance[]) {
    const averageCompletionRate = performanceData.reduce((sum, p) => sum + p.completionRate, 0) / performanceData.length || 0;
    const buildingCount = performanceData.filter(p => p.momentum === 'building').length;
    const decliningCount = performanceData.filter(p => p.momentum === 'declining').length;
    const highConsistencyCount = performanceData.filter(p => p.consistency > 0.8).length;

    const categoryCount: Record<string, number> = {};
    habits.forEach(h => {
      categoryCount[h.category] = (categoryCount[h.category] || 0) + 1;
    });

    return {
      averageCompletionRate,
      buildingCount,
      decliningCount,
      highConsistencyCount,
      categoryDistribution: Object.entries(categoryCount).map(([cat, count]) => `${cat}: ${count}`).join(', ')
    };
  }

  public async saveHabitOptimizations(
    optimizations: HabitOptimization[],
    userId: string
  ): Promise<void> {
    for (const optimization of optimizations) {
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          title: optimization.title,
          description: optimization.description,
          implementation_steps: optimization.implementationSteps,
          expected_impact: optimization.expectedImpact,
          effort_level: optimization.effort,
          priority: this.mapPriorityToNumber(optimization.priority),
          metadata: {
            type: 'habit_optimization',
            habitId: optimization.habitId,
            optimizationType: optimization.type,
            reasoning: optimization.reasoning,
            confidence: optimization.confidence,
            estimatedTimeToSeeResults: optimization.estimatedTimeToSeeResults,
            metrics: optimization.metrics
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
}

export const habitOptimizer = HabitOptimizer.getInstance();