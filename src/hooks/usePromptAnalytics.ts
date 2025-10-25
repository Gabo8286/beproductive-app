import { useState, useEffect, useCallback } from 'react';
import {
  promptAnalytics,
  PromptUsageEvent,
  PromptPerformanceMetrics,
  IntentAccuracyMetrics,
  AnalyticsDashboardData
} from '@/services/promptAnalytics';
import { UserIntent } from '@/types/promptLibrary';

export const usePromptAnalytics = () => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackPromptUsage = useCallback((event: Omit<PromptUsageEvent, 'id' | 'timestamp'>) => {
    return promptAnalytics.trackPromptUsage(event);
  }, []);

  const updateEventOutcome = useCallback((eventId: string, outcome: PromptUsageEvent['outcome'], responseTime?: number) => {
    promptAnalytics.updateEventOutcome(eventId, outcome, responseTime);
  }, []);

  const trackUserFeedback = useCallback((eventId: string, feedback: PromptUsageEvent['userFeedback']) => {
    promptAnalytics.trackUserFeedback(eventId, feedback);
  }, []);

  const trackIntentCorrection = useCallback((originalInput: string, predictedIntent: UserIntent, actualIntent: UserIntent) => {
    promptAnalytics.trackIntentCorrection(originalInput, predictedIntent, actualIntent);
  }, []);

  const refreshDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate async operation for consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      const data = promptAnalytics.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPromptMetrics = useCallback((promptId: string) => {
    return promptAnalytics.getPromptMetrics(promptId);
  }, []);

  const getIntentAccuracy = useCallback((category?: string) => {
    return promptAnalytics.getIntentAccuracy(category);
  }, []);

  const getUsageAnalytics = useCallback((timeframe: 'day' | 'week' | 'month' = 'week') => {
    return promptAnalytics.getUsageAnalytics(timeframe);
  }, []);

  const exportAnalytics = useCallback(() => {
    return promptAnalytics.exportAnalytics();
  }, []);

  const importAnalytics = useCallback((data: string) => {
    promptAnalytics.importAnalytics(data);
    refreshDashboardData();
  }, [refreshDashboardData]);

  return {
    // Data
    dashboardData,
    isLoading,

    // Actions
    trackPromptUsage,
    updateEventOutcome,
    trackUserFeedback,
    trackIntentCorrection,
    refreshDashboardData,

    // Queries
    getPromptMetrics,
    getIntentAccuracy,
    getUsageAnalytics,

    // Export/Import
    exportAnalytics,
    importAnalytics
  };
};

export const usePromptPerformance = (promptId: string) => {
  const [metrics, setMetrics] = useState<PromptPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMetrics = useCallback(() => {
    setIsLoading(true);
    const promptMetrics = promptAnalytics.getPromptMetrics(promptId);
    setMetrics(promptMetrics);
    setIsLoading(false);
  }, [promptId]);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  return {
    metrics,
    isLoading,
    refreshMetrics
  };
};

export const useIntentAccuracy = (category?: string) => {
  const [accuracy, setAccuracy] = useState<IntentAccuracyMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccuracy = useCallback(() => {
    setIsLoading(true);
    const accuracyData = promptAnalytics.getIntentAccuracy(category);
    setAccuracy(accuracyData);
    setIsLoading(false);
  }, [category]);

  useEffect(() => {
    refreshAccuracy();
  }, [refreshAccuracy]);

  return {
    accuracy,
    isLoading,
    refreshAccuracy
  };
};

export const useUsageTrends = (timeframe: 'day' | 'week' | 'month' = 'week') => {
  const [trends, setTrends] = useState<Array<{
    date: string;
    usage: number;
    success: number;
    avgConfidence: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTrends = useCallback(() => {
    setIsLoading(true);
    const trendData = promptAnalytics.getUsageAnalytics(timeframe);
    setTrends(trendData);
    setIsLoading(false);
  }, [timeframe]);

  useEffect(() => {
    refreshTrends();
  }, [refreshTrends]);

  return {
    trends,
    isLoading,
    refreshTrends
  };
};