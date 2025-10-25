/**
 * Analytics System Index
 * Public API and React hooks for the modular analytics system
 */

import { useState, useEffect, useCallback } from 'react';
import type { ProductivityInsight } from '@/types/ai';
import type {
  AnalyticsData,
  DailyProductivityStats,
  BehaviorPattern,
  PersonalRecommendation,
  Achievement,
  AnalyticsStats
} from './types';

import { AnalyticsEngine } from '@/shared/analytics/core';

// Export types for external use
export type {
  AnalyticsData,
  DailyProductivityStats,
  BehaviorPattern,
  PersonalRecommendation,
  Achievement,
  AnalyticsStats,
  WeeklyTrend,
  ProductivityState,
  AnalyticsEngineOptions
} from './types';

// Export services for advanced use cases
export { AnalyticsEngine } from './core';
export { DataCollectionService } from './data-collection';
export { PatternRecognitionService } from './pattern-recognition';
export { InsightGenerationService } from './insight-generation';
export { RecommendationEngineService } from './recommendation-engine';
export { AchievementSystemService } from './achievement-system';
export { AnalyticsStorageService } from './storage';

// Singleton analytics engine instance
export const analyticsEngine = AnalyticsEngine.getInstance();

/**
 * Main analytics hook providing comprehensive analytics functionality
 */
export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = analyticsEngine.getAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        console.error('Analytics hook error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh data periodically
    const interval = setInterval(loadData, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Track task completion
  const trackTaskCompletion = useCallback(() => {
    try {
      analyticsEngine.trackTaskCompletion();
      // Refresh data after tracking
      const data = analyticsEngine.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track task completion');
    }
  }, []);

  // Track break taken
  const trackBreakTaken = useCallback(() => {
    try {
      analyticsEngine.trackBreakTaken();
      // Refresh data after tracking
      const data = analyticsEngine.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track break');
    }
  }, []);

  // Force analysis
  const forceAnalysis = useCallback(() => {
    try {
      analyticsEngine.forceAnalysis();
      // Refresh data after analysis
      setTimeout(() => {
        const data = analyticsEngine.getAnalyticsData();
        setAnalyticsData(data);
      }, 1000); // Give analysis time to complete
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    }
  }, []);

  // Get stats
  const getStats = useCallback((): AnalyticsStats => {
    return analyticsEngine.getStats();
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    try {
      analyticsEngine.clearData();
      setAnalyticsData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    }
  }, []);

  return {
    // Data
    analyticsData,
    isLoading,
    error,

    // Actions
    trackTaskCompletion,
    trackBreakTaken,
    forceAnalysis,
    getStats,
    clearData,

    // Direct access to data components
    dailyStats: analyticsData?.dailyStats || null,
    weeklyTrends: analyticsData?.weeklyTrends || [],
    behaviorPatterns: analyticsData?.behaviorPatterns || [],
    insights: analyticsData?.insights || [],
    recommendations: analyticsData?.recommendations || [],
    achievements: analyticsData?.achievements || []
  };
};

/**
 * Hook for accessing recent insights
 */
export const useInsights = (limit: number = 5) => {
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setIsLoading(true);
        const data = analyticsEngine.getAnalyticsData();
        const recentInsights = data.insights.slice(-limit).reverse();
        setInsights(recentInsights);
      } catch (error) {
        console.warn('Failed to get recent insights:', error);
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();

    // Refresh insights periodically
    const interval = setInterval(loadInsights, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(interval);
  }, [limit]);

  const generateInsight = useCallback(async (type: string, context?: any): Promise<ProductivityInsight | null> => {
    try {
      // Mock insight generation - in real app this would use AI
      const insights = {
        focus: {
          id: Date.now().toString(),
          title: 'Focus Pattern Detected',
          description: 'You tend to be most focused in the morning hours',
          type: 'focus' as const,
          importance: 'medium' as const,
          actionable: true,
          dataSource: 'client-analytics',
          generatedAt: new Date(),
          confidence: 0.8,
          impact: 'Improved focus during peak hours',
          category: 'focus',
          relevantTimeframe: 'week'
        }
      };
      return insights[type as keyof typeof insights] || null;
    } catch (error) {
      console.warn('Failed to generate insight:', error);
      return null;
    }
  }, []);

  return {
    insights,
    isLoading,
    generateInsight
  };
};

/**
 * Hook for accessing today's statistics
 */
export const useTodayStats = () => {
  const [todayStats, setTodayStats] = useState<DailyProductivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        setIsLoading(true);
        const data = analyticsEngine.getAnalyticsData();
        setTodayStats(data.dailyStats);
      } catch (error) {
        console.warn('Failed to get today stats:', error);
        setTodayStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayStats();

    // Refresh stats every minute
    const interval = setInterval(loadTodayStats, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    todayStats,
    isLoading
  };
};

/**
 * Hook for accessing behavioral patterns
 */
export const usePatterns = () => {
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatterns = () => {
      try {
        setIsLoading(true);
        const data = analyticsEngine.getAnalyticsData();
        setPatterns(data.behaviorPatterns);
      } catch (error) {
        console.warn('Failed to get patterns:', error);
        setPatterns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatterns();

    // Refresh patterns every 30 minutes
    const interval = setInterval(loadPatterns, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    patterns,
    isLoading,
    energyPatterns: patterns.filter(p => p.name.toLowerCase().includes('energy')),
    focusPatterns: patterns.filter(p => p.name.toLowerCase().includes('focus')),
    timingPatterns: patterns.filter(p => p.name.toLowerCase().includes('timing') || p.name.toLowerCase().includes('productivity hours')),
    positivePatterns: patterns.filter(p => p.impact === 'positive'),
    improvementPatterns: patterns.filter(p => p.impact === 'negative')
  };
};

/**
 * Hook for accessing recommendations
 */
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PersonalRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = () => {
      try {
        setIsLoading(true);
        const data = analyticsEngine.getAnalyticsData();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.warn('Failed to get recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();

    // Refresh recommendations every 2 hours
    const interval = setInterval(loadRecommendations, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    recommendations,
    isLoading,
    highPriorityRecommendations: recommendations.filter(r => r.priority >= 7).sort((a, b) => b.priority - a.priority),
    scheduleRecommendations: recommendations.filter(r => r.category === 'schedule'),
    habitRecommendations: recommendations.filter(r => r.category === 'habits'),
    toolRecommendations: recommendations.filter(r => r.category === 'tools'),
    healthRecommendations: recommendations.filter(r => r.category === 'health'),
    environmentRecommendations: recommendations.filter(r => r.category === 'environment')
  };
};

/**
 * Hook for accessing achievements
 */
export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = () => {
      try {
        setIsLoading(true);
        const data = analyticsEngine.getAnalyticsData();
        setAchievements(data.achievements);
      } catch (error) {
        console.warn('Failed to get achievements:', error);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();

    // Refresh achievements every 5 minutes
    const interval = setInterval(loadAchievements, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    achievements,
    isLoading,
    recentAchievements: achievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 5),
    milestoneAchievements: achievements.filter(a => a.category === 'milestone'),
    consistencyAchievements: achievements.filter(a => a.category === 'consistency'),
    improvementAchievements: achievements.filter(a => a.category === 'improvement'),
    discoveryAchievements: achievements.filter(a => a.category === 'discovery'),
    rareAchievements: achievements.filter(a => a.rarity === 'rare' || a.rarity === 'legendary'),
    totalAchievements: achievements.length
  };
};

/**
 * Legacy compatibility hook - maintains API from original clientAnalytics
 */
export const useClientAnalytics = () => {
  const analytics = useAnalytics();
  const insights = useInsights();
  const todayStats = useTodayStats();

  return {
    getAnalyticsData: () => analytics.analyticsData,
    trackTaskCompletion: analytics.trackTaskCompletion,
    trackBreakTaken: analytics.trackBreakTaken,
    forceAnalysis: analytics.forceAnalysis,
    getStats: analytics.getStats,
    getRecentInsights: async (limit: number = 5) => {
      return insights.insights.slice(0, limit);
    },
    getTodayStats: async () => {
      return todayStats.todayStats;
    },
    generateInsight: insights.generateInsight
  };
};

// MARK: - Analytics System Information

/**
 * Analytics system metadata
 */
export const ANALYTICS_VERSION = '2.0.0';
export const MODULARIZATION_DATE = '2024-10-24';
export const MODULES_COUNT = 9;
export const ORIGINAL_FILE_SIZE = 966; // lines
export const ESTIMATED_BUNDLE_REDUCTION = '40-50%';

/**
 * Get analytics system information
 */
export function getAnalyticsSystemInfo() {
  return {
    version: ANALYTICS_VERSION,
    modularizationDate: MODULARIZATION_DATE,
    modulesCount: MODULES_COUNT,
    originalFileSize: `${ORIGINAL_FILE_SIZE} lines`,
    bundleReduction: ESTIMATED_BUNDLE_REDUCTION,
    modules: [
      'types - Type definitions and interfaces',
      'data-collection - Productivity data collection service',
      'pattern-recognition - Behavioral pattern analysis',
      'insight-generation - AI-powered insight creation',
      'recommendation-engine - Personalized recommendations',
      'achievement-system - Gamification and milestones',
      'storage - Data persistence and recovery',
      'core - Main analytics engine orchestrator',
      'index - Public API and React hooks'
    ]
  };
}

/**
 * Validate analytics system health
 */
export function validateAnalyticsSystem(): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test engine initialization
    const engine = AnalyticsEngine.getInstance();
    const stats = engine.getStats();

    // Check data availability
    if (stats.daysTracked === 0) {
      issues.push('No analytics data available');
      recommendations.push('Start using the app to collect productivity data');
    }

    // Check for recent patterns
    if (stats.patternsDiscovered < 3 && stats.daysTracked > 7) {
      issues.push('Insufficient pattern discovery');
      recommendations.push('Use the app more consistently to discover behavioral patterns');
    }

    // Check for insights
    if (stats.insightsGenerated < 2 && stats.daysTracked > 3) {
      issues.push('Limited insights generation');
      recommendations.push('Allow more time for data collection to generate meaningful insights');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };

  } catch (error) {
    return {
      isHealthy: false,
      issues: ['Analytics system initialization failed'],
      recommendations: ['Check console for detailed error information']
    };
  }
}