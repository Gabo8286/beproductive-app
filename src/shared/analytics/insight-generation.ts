/**
 * Analytics Insight Generation Module
 * Generates actionable productivity insights from behavioral data
 */

import type {
  DailyProductivityStats,
  BehaviorPattern,
  InsightGenerationContext
} from './types';
import type { ProductivityInsight } from '@/types/ai';

export class InsightGenerationService {
  private insights: ProductivityInsight[] = [];

  /**
   * Generate comprehensive insights from analytics data
   */
  generateInsights(context: InsightGenerationContext): ProductivityInsight[] {
    const { recentData, patterns } = context;
    const newInsights: ProductivityInsight[] = [];

    // Energy insights
    const energyInsight = this.generateEnergyInsight(recentData);
    if (energyInsight) newInsights.push(energyInsight);

    // Focus insights
    const focusInsight = this.generateFocusInsight(recentData);
    if (focusInsight) newInsights.push(focusInsight);

    // Trend insights
    const trendInsight = this.generateTrendInsight(recentData);
    if (trendInsight) newInsights.push(trendInsight);

    // Pattern-based insights
    const patternInsights = this.generatePatternInsights(patterns);
    newInsights.push(...patternInsights);

    // Performance insights
    const performanceInsights = this.generatePerformanceInsights(recentData);
    newInsights.push(...performanceInsights);

    // Update insights (keep recent ones)
    this.insights = [
      ...newInsights,
      ...this.insights.filter(i =>
        Date.now() - i.generatedAt.getTime() < 7 * 24 * 60 * 60 * 1000 // Keep for 7 days
      )
    ].slice(0, 15);

    console.log('💡 Insight Generation: Generated', newInsights.length, 'new insights');

    return newInsights;
  }

  /**
   * Generate energy-related insights
   */
  private generateEnergyInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const allEnergyData = data.flatMap(d => d.energyLevels);
    const averageEnergy = allEnergyData.reduce((sum, e) => sum + e.energy, 0) / allEnergyData.length;

    let impact = '';
    let importance: ProductivityInsight['importance'] = 'medium';

    if (averageEnergy > 75) {
      impact = 'Your high energy levels suggest you could take on more challenging projects';
      importance = 'high';
    } else if (averageEnergy < 40) {
      impact = 'Low energy levels may be affecting your productivity. Consider rest and wellness strategies';
      importance = 'high';
    } else {
      impact = 'Your energy levels are stable. Focus on optimizing energy management techniques';
    }

    return {
      id: `energy-insight-${Date.now()}`,
      title: 'Energy Level Analysis',
      description: `Your average energy level this week is ${averageEnergy.toFixed(1)}/100`,
      type: 'energy',
      importance,
      actionable: true,
      dataSource: `${data.length} days of energy tracking`,
      generatedAt: new Date(),
      confidence: 0.8,
      impact
    };
  }

  /**
   * Generate focus-related insights
   */
  private generateFocusInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const totalFocus = data.reduce((sum, d) => sum + d.focusTime, 0);
    const totalActive = data.reduce((sum, d) => sum + d.totalActiveTime, 0);
    const focusRatio = totalActive > 0 ? totalFocus / totalActive : 0;

    const averageDaily = totalFocus / data.length;

    return {
      id: `focus-insight-${Date.now()}`,
      title: 'Focus Time Analysis',
      description: `You maintain focus for ${(focusRatio * 100).toFixed(1)}% of your active time (${averageDaily.toFixed(0)} min/day)`,
      type: 'focus',
      importance: focusRatio < 0.3 ? 'high' : focusRatio > 0.6 ? 'medium' : 'medium',
      actionable: true,
      dataSource: `${data.length} days of focus tracking`,
      generatedAt: new Date(),
      confidence: 0.85,
      impact: focusRatio < 0.3 ?
        'Improving focus could significantly boost your productivity' :
        'Your focus levels are good. Consider techniques to extend focus sessions'
    };
  }

  /**
   * Generate trend-based insights
   */
  private generateTrendInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 5) return null;

    const scores = data.map(d => d.productivityScore);
    const trend = this.calculateTrend(scores);
    const change = Math.abs(trend) * scores.length;

    if (Math.abs(change) < 5) return null; // No significant trend

    const direction = trend > 0 ? 'improving' : 'declining';
    const strength = Math.abs(change) > 15 ? 'significantly' : 'gradually';

    return {
      id: `trend-insight-${Date.now()}`,
      title: `Productivity Trend: ${direction}`,
      description: `Your productivity has been ${strength} ${direction} by ${change.toFixed(1)} points`,
      type: 'performance',
      importance: Math.abs(change) > 15 ? 'high' : 'medium',
      actionable: true,
      dataSource: `${data.length} days trend analysis`,
      generatedAt: new Date(),
      confidence: 0.7,
      impact: direction === 'improving' ?
        'Keep up the positive momentum with your current strategies' :
        'Consider identifying what might be affecting your productivity recently'
    };
  }

  /**
   * Generate insights based on discovered patterns
   */
  private generatePatternInsights(patterns: BehaviorPattern[]): ProductivityInsight[] {
    return patterns.slice(0, 3).map(pattern => ({
      id: `pattern-insight-${pattern.id}`,
      title: `Pattern Discovery: ${pattern.name}`,
      description: pattern.description,
      type: 'habits' as const,
      importance: pattern.impact === 'positive' ? 'medium' : 'high',
      actionable: true,
      dataSource: 'Behavioral pattern analysis',
      generatedAt: new Date(),
      confidence: pattern.confidence,
      impact: pattern.suggestions[0] || 'Consider how this pattern affects your productivity'
    }));
  }

  /**
   * Generate performance-specific insights
   */
  private generatePerformanceInsights(data: DailyProductivityStats[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];

    // Task completion insight
    const taskInsight = this.generateTaskCompletionInsight(data);
    if (taskInsight) insights.push(taskInsight);

    // Break frequency insight
    const breakInsight = this.generateBreakInsight(data);
    if (breakInsight) insights.push(breakInsight);

    // Distraction insight
    const distractionInsight = this.generateDistractionInsight(data);
    if (distractionInsight) insights.push(distractionInsight);

    return insights;
  }

  /**
   * Generate task completion insights
   */
  private generateTaskCompletionInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const averageTasks = data.reduce((sum, d) => sum + d.tasksCompleted, 0) / data.length;
    const taskTrend = this.calculateTrend(data.map(d => d.tasksCompleted));

    if (averageTasks < 1) {
      return {
        id: `task-insight-${Date.now()}`,
        title: 'Task Completion Rate',
        description: `You're completing ${averageTasks.toFixed(1)} tasks per day on average`,
        type: 'performance',
        importance: 'high',
        actionable: true,
        dataSource: `${data.length} days of task tracking`,
        generatedAt: new Date(),
        confidence: 0.8,
        impact: 'Setting clear daily goals could help improve task completion rates'
      };
    }

    return null;
  }

  /**
   * Generate break frequency insights
   */
  private generateBreakInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const averageBreaks = data.reduce((sum, d) => sum + d.breaksTaken, 0) / data.length;
    const averageFocus = data.reduce((sum, d) => sum + d.focusTime, 0) / data.length;

    if (averageBreaks < 2 && averageFocus > 120) {
      return {
        id: `break-insight-${Date.now()}`,
        title: 'Break Frequency Analysis',
        description: `You take ${averageBreaks.toFixed(1)} breaks per day while focusing for ${averageFocus.toFixed(0)} minutes`,
        type: 'performance',
        importance: 'medium',
        actionable: true,
        dataSource: `${data.length} days of break tracking`,
        generatedAt: new Date(),
        confidence: 0.7,
        impact: 'Regular breaks could help maintain focus and prevent burnout'
      };
    }

    return null;
  }

  /**
   * Generate distraction insights
   */
  private generateDistractionInsight(data: DailyProductivityStats[]): ProductivityInsight | null {
    if (data.length < 3) return null;

    const averageDistractions = data.reduce((sum, d) => sum + d.distractionEvents, 0) / data.length;

    if (averageDistractions > 5) {
      return {
        id: `distraction-insight-${Date.now()}`,
        title: 'Distraction Pattern Analysis',
        description: `You experience ${averageDistractions.toFixed(1)} distraction events per day on average`,
        type: 'focus',
        importance: 'high',
        actionable: true,
        dataSource: `${data.length} days of distraction tracking`,
        generatedAt: new Date(),
        confidence: 0.8,
        impact: 'Identifying and minimizing distraction sources could significantly improve focus'
      };
    }

    return null;
  }

  /**
   * Calculate linear trend from values
   */
  private calculateTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = values.reduce((sum, _, index) => sum + (index * index), 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Get all generated insights
   */
  getInsights(): ProductivityInsight[] {
    return [...this.insights];
  }

  /**
   * Get recent insights
   */
  getRecentInsights(limit: number = 5): ProductivityInsight[] {
    return this.insights.slice(-limit).reverse();
  }

  /**
   * Set insights (for loading from storage)
   */
  setInsights(insights: ProductivityInsight[]): void {
    this.insights = insights;
  }

  /**
   * Clear all insights
   */
  clearInsights(): void {
    this.insights = [];
  }

  /**
   * Get insight statistics
   */
  getInsightStats() {
    const typeCounts = this.insights.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const importanceCounts = this.insights.reduce((acc, i) => {
      acc[i.importance] = (acc[i.importance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInsights: this.insights.length,
      typeDistribution: typeCounts,
      importanceDistribution: importanceCounts,
      averageConfidence: this.insights.reduce((sum, i) => sum + i.confidence, 0) / this.insights.length,
      actionableCount: this.insights.filter(i => i.actionable).length
    };
  }
}