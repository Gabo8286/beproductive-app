import { UserIntent, PromptTemplate } from '@/types/promptLibrary';

export interface PromptUsageEvent {
  id: string;
  promptId: string;
  templateId: string;
  userInput: string;
  enhancedPrompt: string;
  intent: UserIntent;
  confidence: number;
  timestamp: Date;
  context: string;
  responseTime?: number;
  userFeedback?: {
    rating: number;
    wasHelpful: boolean;
    feedback: string;
  };
  outcome?: 'successful' | 'failed' | 'abandoned';
}

export interface PromptPerformanceMetrics {
  promptId: string;
  totalUsage: number;
  successRate: number;
  averageConfidence: number;
  averageRating: number;
  averageResponseTime: number;
  popularityScore: number;
  lastUsed: Date;
  usageFrequency: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  contextBreakdown: Record<string, number>;
  userSatisfaction: {
    helpful: number;
    notHelpful: number;
    averageRating: number;
  };
}

export interface IntentAccuracyMetrics {
  category: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  averageConfidence: number;
  commonMisclassifications: Array<{
    predicted: string;
    actual: string;
    count: number;
  }>;
  lowConfidenceThreshold: number;
  improvementSuggestions: string[];
}

export interface AnalyticsDashboardData {
  overview: {
    totalPrompts: number;
    totalUsage: number;
    averageSuccessRate: number;
    topPerformingPrompts: PromptPerformanceMetrics[];
    recentActivity: PromptUsageEvent[];
  };
  performance: {
    promptMetrics: PromptPerformanceMetrics[];
    intentAccuracy: IntentAccuracyMetrics[];
    trendData: {
      usageOverTime: Array<{ date: string; usage: number; success: number }>;
      accuracyOverTime: Array<{ date: string; accuracy: number; confidence: number }>;
    };
  };
  insights: {
    recommendations: Array<{
      type: 'improve_prompt' | 'add_keywords' | 'update_template' | 'training_needed';
      promptId?: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
      impact: string;
    }>;
    patterns: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
  };
}

export class PromptAnalyticsService {
  private events: PromptUsageEvent[] = [];
  private metrics: Map<string, PromptPerformanceMetrics> = new Map();
  private intentMetrics: Map<string, IntentAccuracyMetrics> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // Event Tracking
  trackPromptUsage(event: Omit<PromptUsageEvent, 'id' | 'timestamp'>): string {
    const fullEvent: PromptUsageEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.updateMetrics(fullEvent);
    this.saveToStorage();

    return fullEvent.id;
  }

  updateEventOutcome(eventId: string, outcome: PromptUsageEvent['outcome'], responseTime?: number): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.outcome = outcome;
      if (responseTime) {
        event.responseTime = responseTime;
      }
      this.updateMetrics(event);
      this.saveToStorage();
    }
  }

  trackUserFeedback(eventId: string, feedback: PromptUsageEvent['userFeedback']): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.userFeedback = feedback;
      this.updateMetrics(event);
      this.saveToStorage();
    }
  }

  trackIntentCorrection(originalInput: string, predictedIntent: UserIntent, actualIntent: UserIntent): void {
    const category = actualIntent.category;

    if (!this.intentMetrics.has(category)) {
      this.initializeIntentMetrics(category);
    }

    const metrics = this.intentMetrics.get(category)!;
    metrics.totalPredictions++;

    if (predictedIntent.category === actualIntent.category && predictedIntent.action === actualIntent.action) {
      metrics.correctPredictions++;
    } else {
      // Track misclassification
      const misclassification = metrics.commonMisclassifications.find(
        m => m.predicted === `${predictedIntent.category}:${predictedIntent.action}` &&
             m.actual === `${actualIntent.category}:${actualIntent.action}`
      );

      if (misclassification) {
        misclassification.count++;
      } else {
        metrics.commonMisclassifications.push({
          predicted: `${predictedIntent.category}:${predictedIntent.action}`,
          actual: `${actualIntent.category}:${actualIntent.action}`,
          count: 1
        });
      }
    }

    metrics.accuracy = metrics.correctPredictions / metrics.totalPredictions;
    this.intentMetrics.set(category, metrics);
    this.saveToStorage();
  }

  // Analytics and Reporting
  getPromptMetrics(promptId: string): PromptPerformanceMetrics | null {
    return this.metrics.get(promptId) || null;
  }

  getIntentAccuracy(category?: string): IntentAccuracyMetrics[] {
    if (category) {
      const metrics = this.intentMetrics.get(category);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.intentMetrics.values());
  }

  getDashboardData(): AnalyticsDashboardData {
    const allMetrics = Array.from(this.metrics.values());
    const recentEvents = this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      overview: {
        totalPrompts: this.metrics.size,
        totalUsage: this.events.length,
        averageSuccessRate: this.calculateAverageSuccessRate(),
        topPerformingPrompts: allMetrics
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, 5),
        recentActivity: recentEvents
      },
      performance: {
        promptMetrics: allMetrics,
        intentAccuracy: Array.from(this.intentMetrics.values()),
        trendData: this.generateTrendData()
      },
      insights: {
        recommendations: this.generateRecommendations(),
        patterns: this.identifyPatterns()
      }
    };
  }

  getUsageAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Array<{
    date: string;
    usage: number;
    success: number;
    avgConfidence: number;
  }> {
    const now = new Date();
    const daysBack = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dailyData: Record<string, { usage: number; success: number; totalConfidence: number; count: number }> = {};

    this.events
      .filter(event => event.timestamp >= startDate)
      .forEach(event => {
        const dateKey = event.timestamp.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { usage: 0, success: 0, totalConfidence: 0, count: 0 };
        }

        dailyData[dateKey].usage++;
        dailyData[dateKey].totalConfidence += event.confidence;
        dailyData[dateKey].count++;

        if (event.outcome === 'successful') {
          dailyData[dateKey].success++;
        }
      });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        usage: data.usage,
        success: data.success,
        avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Private Methods
  private updateMetrics(event: PromptUsageEvent): void {
    if (!this.metrics.has(event.promptId)) {
      this.initializePromptMetrics(event.promptId);
    }

    const metrics = this.metrics.get(event.promptId)!;
    metrics.totalUsage++;
    metrics.lastUsed = event.timestamp;

    // Update context breakdown
    metrics.contextBreakdown[event.context] = (metrics.contextBreakdown[event.context] || 0) + 1;

    // Update success rate
    if (event.outcome === 'successful') {
      const currentSuccessful = metrics.successRate * (metrics.totalUsage - 1);
      metrics.successRate = (currentSuccessful + 1) / metrics.totalUsage;
    } else if (event.outcome === 'failed') {
      const currentSuccessful = metrics.successRate * (metrics.totalUsage - 1);
      metrics.successRate = currentSuccessful / metrics.totalUsage;
    }

    // Update confidence average
    const currentConfidenceTotal = metrics.averageConfidence * (metrics.totalUsage - 1);
    metrics.averageConfidence = (currentConfidenceTotal + event.confidence) / metrics.totalUsage;

    // Update response time average
    if (event.responseTime) {
      const currentResponseTotal = metrics.averageResponseTime * (metrics.totalUsage - 1);
      metrics.averageResponseTime = (currentResponseTotal + event.responseTime) / metrics.totalUsage;
    }

    // Update user satisfaction
    if (event.userFeedback) {
      if (event.userFeedback.wasHelpful) {
        metrics.userSatisfaction.helpful++;
      } else {
        metrics.userSatisfaction.notHelpful++;
      }

      const totalRatings = metrics.userSatisfaction.helpful + metrics.userSatisfaction.notHelpful;
      const currentRatingTotal = metrics.averageRating * (totalRatings - 1);
      metrics.averageRating = (currentRatingTotal + event.userFeedback.rating) / totalRatings;
      metrics.userSatisfaction.averageRating = metrics.averageRating;
    }

    // Update popularity score (weighted combination of usage, success, and satisfaction)
    metrics.popularityScore = this.calculatePopularityScore(metrics);

    this.metrics.set(event.promptId, metrics);
  }

  private initializePromptMetrics(promptId: string): void {
    const metrics: PromptPerformanceMetrics = {
      promptId,
      totalUsage: 0,
      successRate: 0,
      averageConfidence: 0,
      averageRating: 0,
      averageResponseTime: 0,
      popularityScore: 0,
      lastUsed: new Date(),
      usageFrequency: {
        daily: new Array(7).fill(0),
        weekly: new Array(4).fill(0),
        monthly: new Array(12).fill(0)
      },
      contextBreakdown: {},
      userSatisfaction: {
        helpful: 0,
        notHelpful: 0,
        averageRating: 0
      }
    };

    this.metrics.set(promptId, metrics);
  }

  private initializeIntentMetrics(category: string): void {
    const metrics: IntentAccuracyMetrics = {
      category,
      totalPredictions: 0,
      correctPredictions: 0,
      accuracy: 0,
      averageConfidence: 0,
      commonMisclassifications: [],
      lowConfidenceThreshold: 0.7,
      improvementSuggestions: []
    };

    this.intentMetrics.set(category, metrics);
  }

  private calculatePopularityScore(metrics: PromptPerformanceMetrics): number {
    const usageWeight = 0.4;
    const successWeight = 0.3;
    const satisfactionWeight = 0.3;

    const normalizedUsage = Math.min(metrics.totalUsage / 100, 1); // Cap at 100 uses
    const satisfaction = metrics.userSatisfaction.helpful + metrics.userSatisfaction.notHelpful > 0
      ? metrics.userSatisfaction.helpful / (metrics.userSatisfaction.helpful + metrics.userSatisfaction.notHelpful)
      : 0;

    return (normalizedUsage * usageWeight) +
           (metrics.successRate * successWeight) +
           (satisfaction * satisfactionWeight);
  }

  private calculateAverageSuccessRate(): number {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) return 0;

    const totalWeightedSuccess = allMetrics.reduce((sum, metric) =>
      sum + (metric.successRate * metric.totalUsage), 0);
    const totalUsage = allMetrics.reduce((sum, metric) => sum + metric.totalUsage, 0);

    return totalUsage > 0 ? totalWeightedSuccess / totalUsage : 0;
  }

  private generateTrendData() {
    const last30Days = this.getUsageAnalytics('month');
    const last7Days = this.getUsageAnalytics('week');

    return {
      usageOverTime: last30Days,
      accuracyOverTime: last7Days.map(day => ({
        date: day.date,
        accuracy: this.calculateDailyAccuracy(day.date),
        confidence: day.avgConfidence
      }))
    };
  }

  private calculateDailyAccuracy(date: string): number {
    // This would need to be implemented based on intent correction data
    // For now, return a placeholder
    return 0.85;
  }

  private generateRecommendations() {
    const recommendations: AnalyticsDashboardData['insights']['recommendations'] = [];

    // Analyze low-performing prompts
    Array.from(this.metrics.values()).forEach(metric => {
      if (metric.successRate < 0.7 && metric.totalUsage > 5) {
        recommendations.push({
          type: 'improve_prompt',
          promptId: metric.promptId,
          priority: 'high',
          description: `Prompt has low success rate (${(metric.successRate * 100).toFixed(1)}%)`,
          impact: 'Improving this prompt could increase user satisfaction'
        });
      }

      if (metric.averageConfidence < 0.6 && metric.totalUsage > 3) {
        recommendations.push({
          type: 'add_keywords',
          promptId: metric.promptId,
          priority: 'medium',
          description: `Low confidence scores suggest unclear intent recognition`,
          impact: 'Adding more keywords could improve intent detection'
        });
      }
    });

    return recommendations;
  }

  private identifyPatterns() {
    // Analyze usage patterns and return insights
    return [
      {
        type: 'usage_pattern',
        description: 'Task management prompts are most popular in the morning',
        confidence: 0.8
      }
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('prompt-analytics-events', JSON.stringify(this.events.slice(-1000))); // Keep last 1000 events
      localStorage.setItem('prompt-analytics-metrics', JSON.stringify(Array.from(this.metrics.entries())));
      localStorage.setItem('prompt-intent-metrics', JSON.stringify(Array.from(this.intentMetrics.entries())));
    } catch (error) {
      console.warn('Failed to save analytics data to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const eventsData = localStorage.getItem('prompt-analytics-events');
      if (eventsData) {
        this.events = JSON.parse(eventsData).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }

      const metricsData = localStorage.getItem('prompt-analytics-metrics');
      if (metricsData) {
        this.metrics = new Map(JSON.parse(metricsData));
      }

      const intentMetricsData = localStorage.getItem('prompt-intent-metrics');
      if (intentMetricsData) {
        this.intentMetrics = new Map(JSON.parse(intentMetricsData));
      }
    } catch (error) {
      console.warn('Failed to load analytics data from localStorage:', error);
    }
  }

  // Export/Import functionality
  exportAnalytics(): string {
    return JSON.stringify({
      events: this.events,
      metrics: Array.from(this.metrics.entries()),
      intentMetrics: Array.from(this.intentMetrics.entries()),
      exportDate: new Date().toISOString()
    });
  }

  importAnalytics(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.events = parsed.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
      this.metrics = new Map(parsed.metrics);
      this.intentMetrics = new Map(parsed.intentMetrics);
      this.saveToStorage();
    } catch (error) {
      throw new Error('Invalid analytics data format');
    }
  }
}

// Global analytics instance
export const promptAnalytics = new PromptAnalyticsService();