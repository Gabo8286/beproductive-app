/**
 * Predictive Navigation Hook
 * React hook for integrating predictive navigation and preloading capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnhancedNavigationContext } from './useEnhancedNavigationContext';
import {
  predictiveNavigationService,
  PreloadTask,
  PredictionMetrics
} from '@/services/PredictiveNavigationService';

interface PredictiveNavigationState {
  isGeneratingPredictions: boolean;
  queueStatus: {
    pending: number;
    loading: number;
    completed: number;
    failed: number;
  };
  metrics: PredictionMetrics;
  lastPredictionTime: Date | null;
}

interface PredictiveNavigationActions {
  generatePredictions: () => void;
  clearCache: () => void;
  cancelPreloads: () => void;
  isPreloaded: (path: string) => boolean;
  getCachedResource: (path: string) => any;
  getMetrics: () => PredictionMetrics;
}

export function usePredictiveNavigation(): PredictiveNavigationState & PredictiveNavigationActions {
  const { context } = useEnhancedNavigationContext();
  const location = useLocation();

  // State
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    loading: 0,
    completed: 0,
    failed: 0
  });
  const [metrics, setMetrics] = useState<PredictionMetrics>(predictiveNavigationService.getMetrics());
  const [lastPredictionTime, setLastPredictionTime] = useState<Date | null>(null);

  // Generate predictions based on current context
  const generatePredictions = useCallback(async () => {
    if (isGeneratingPredictions) return;

    setIsGeneratingPredictions(true);
    try {
      // Generate predictions using the service
      predictiveNavigationService.generatePredictions(context);
      setLastPredictionTime(new Date());

      // Update queue status
      setQueueStatus(predictiveNavigationService.getQueueStatus());
    } catch (error) {
      console.error('Failed to generate predictions:', error);
    } finally {
      setIsGeneratingPredictions(false);
    }
  }, [context, isGeneratingPredictions]);

  // Auto-generate predictions when context changes significantly
  useEffect(() => {
    const shouldGeneratePredictions =
      !lastPredictionTime ||
      (new Date().getTime() - lastPredictionTime.getTime()) > 60000; // 1 minute

    if (shouldGeneratePredictions && context) {
      // Debounce prediction generation
      const timeoutId = setTimeout(() => {
        generatePredictions();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [context.workflowState, context.currentHub, generatePredictions, lastPredictionTime]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(predictiveNavigationService.getMetrics());
      setQueueStatus(predictiveNavigationService.getQueueStatus());
    };

    // Update immediately
    updateMetrics();

    // Set up periodic updates
    const intervalId = setInterval(updateMetrics, 5000); // Every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Generate predictions when location changes
  useEffect(() => {
    // Small delay to let the context update
    const timeoutId = setTimeout(() => {
      generatePredictions();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, generatePredictions]);

  // Actions
  const clearCache = useCallback(() => {
    predictiveNavigationService.clearCache();
    setMetrics(predictiveNavigationService.getMetrics());
  }, []);

  const cancelPreloads = useCallback(() => {
    predictiveNavigationService.cancelAllPreloads();
    setQueueStatus(predictiveNavigationService.getQueueStatus());
  }, []);

  const isPreloaded = useCallback((path: string): boolean => {
    return predictiveNavigationService.isPreloaded(path);
  }, []);

  const getCachedResource = useCallback((path: string): any => {
    return predictiveNavigationService.getCachedResource(path);
  }, []);

  const getMetrics = useCallback((): PredictionMetrics => {
    return predictiveNavigationService.getMetrics();
  }, []);

  return {
    // State
    isGeneratingPredictions,
    queueStatus,
    metrics,
    lastPredictionTime,

    // Actions
    generatePredictions,
    clearCache,
    cancelPreloads,
    isPreloaded,
    getCachedResource,
    getMetrics,
  };
}

/**
 * Hook for performance monitoring of predictive navigation
 */
export function usePredictiveNavigationMonitor() {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averagePreloadTime: 0,
    cacheHitRate: 0,
    accuracyRate: 0,
    bandwidthSaved: 0,
  });

  useEffect(() => {
    const updatePerformanceMetrics = () => {
      const metrics = predictiveNavigationService.getMetrics();
      setPerformanceMetrics({
        averagePreloadTime: metrics.averagePreloadTime,
        cacheHitRate: metrics.cacheHitRate,
        accuracyRate: metrics.accuracy,
        bandwidthSaved: metrics.bandwidthSaved,
      });
    };

    // Update immediately
    updatePerformanceMetrics();

    // Set up periodic updates
    const intervalId = setInterval(updatePerformanceMetrics, 10000); // Every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return performanceMetrics;
}

/**
 * Hook for debugging predictive navigation
 */
export function usePredictiveNavigationDebug() {
  const [debugInfo, setDebugInfo] = useState({
    queueLength: 0,
    activePreloads: 0,
    cacheSize: 0,
    failureRate: 0,
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const queueStatus = predictiveNavigationService.getQueueStatus();
      const metrics = predictiveNavigationService.getMetrics();

      setDebugInfo({
        queueLength: queueStatus.pending + queueStatus.loading,
        activePreloads: queueStatus.loading,
        cacheSize: Object.keys(predictiveNavigationService.getMetrics()).length,
        failureRate: metrics.totalPredictions > 0
          ? (metrics.totalPredictions - metrics.successfulPredictions) / metrics.totalPredictions
          : 0,
      });
    };

    updateDebugInfo();

    const intervalId = setInterval(updateDebugInfo, 2000); // Every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  const clearCache = useCallback(() => {
    predictiveNavigationService.clearCache();
  }, []);

  const cancelAllPreloads = useCallback(() => {
    predictiveNavigationService.cancelAllPreloads();
  }, []);

  return {
    debugInfo,
    clearCache,
    cancelAllPreloads,
  };
}