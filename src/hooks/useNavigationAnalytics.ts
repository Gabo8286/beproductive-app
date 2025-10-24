/**
 * Navigation Analytics Hook
 * React hook for comprehensive Luna navigation analytics and performance monitoring
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  navigationAnalyticsService,
  NavigationEvent,
  NavigationMetrics,
  AnalyticsConfig
} from '@/services/NavigationAnalyticsService';
import { NavigationHubId, UserRole } from '@/types/navigation';

interface AnalyticsState {
  metrics: NavigationMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface AnalyticsActions {
  trackHubClick: (hubId: NavigationHubId, context?: string) => void;
  trackQuickAction: (hubId: NavigationHubId, actionId: string, duration?: number) => void;
  trackGesture: (hubId: NavigationHubId, gestureType: string, success?: boolean) => void;
  trackKeyboardShortcut: (hubId: NavigationHubId, shortcut: string, responseTime?: number) => void;
  trackPerformance: (hubId: NavigationHubId, metrics: { loadTime?: number; renderTime?: number; interactionTime?: number; memoryUsage?: number }) => void;
  refreshMetrics: () => Promise<void>;
  exportAnalytics: () => string;
  configureAnalytics: (config: Partial<AnalyticsConfig>) => void;
  clearAnalytics: () => void;
  getHeatmapData: (hubId: NavigationHubId) => Array<{ x: number; y: number; intensity: number }>;
}

export function useNavigationAnalytics(): AnalyticsState & AnalyticsActions {
  const { user } = useAuth();

  const [state, setState] = useState<AnalyticsState>({
    metrics: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Get user role and device info
  const userRole: UserRole = useMemo(() => {
    if (!user) return 'user';
    const role = user.user_metadata?.role || user.app_metadata?.role;
    return ['user', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(role) ? role : 'user';
  }, [user]);

  const deviceType = useMemo(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const browserInfo = useMemo(() => {
    if (typeof navigator === 'undefined') return 'unknown';
    return `${navigator.userAgent.split(' ')[0]} ${navigator.appVersion}`;
  }, []);

  // Create base event properties
  const createBaseEvent = useCallback((hubId: NavigationHubId, eventType: NavigationEvent['eventType']) => ({
    userId: user?.id || 'anonymous',
    userRole,
    hubId,
    eventType,
    deviceType: deviceType as 'mobile' | 'tablet' | 'desktop',
    browserInfo,
  }), [user?.id, userRole, deviceType, browserInfo]);

  // Load initial metrics
  useEffect(() => {
    const loadMetrics = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const metrics = navigationAnalyticsService.getMetrics();
        setState(prev => ({
          ...prev,
          metrics,
          isLoading: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load metrics',
          isLoading: false,
        }));
      }
    };

    loadMetrics();
  }, []);

  // Track hub click
  const trackHubClick = useCallback((hubId: NavigationHubId, context?: string) => {
    const event = {
      ...createBaseEvent(hubId, 'hub_click'),
      fromContext: context,
    };

    navigationAnalyticsService.trackEvent(event);
  }, [createBaseEvent]);

  // Track quick action
  const trackQuickAction = useCallback((hubId: NavigationHubId, actionId: string, duration?: number) => {
    const event = {
      ...createBaseEvent(hubId, 'quick_action'),
      actionId,
      duration,
    };

    navigationAnalyticsService.trackEvent(event);
  }, [createBaseEvent]);

  // Track gesture
  const trackGesture = useCallback((hubId: NavigationHubId, gestureType: string, success: boolean = true) => {
    const event = {
      ...createBaseEvent(hubId, 'gesture'),
      gestureType,
      duration: success ? undefined : 0, // Failed gestures have 0 duration
    };

    navigationAnalyticsService.trackEvent(event);
  }, [createBaseEvent]);

  // Track keyboard shortcut
  const trackKeyboardShortcut = useCallback((hubId: NavigationHubId, shortcut: string, responseTime?: number) => {
    const event = {
      ...createBaseEvent(hubId, 'keyboard'),
      keyboardShortcut: shortcut,
      duration: responseTime,
    };

    navigationAnalyticsService.trackEvent(event);
  }, [createBaseEvent]);

  // Track performance metrics
  const trackPerformance = useCallback((
    hubId: NavigationHubId,
    metrics: { loadTime?: number; renderTime?: number; interactionTime?: number; memoryUsage?: number }
  ) => {
    const event = {
      ...createBaseEvent(hubId, 'hub_click'), // Performance is tracked with hub interactions
      performanceMetrics: metrics,
    };

    navigationAnalyticsService.trackEvent(event);
  }, [createBaseEvent]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const metrics = navigationAnalyticsService.getMetrics();
      setState(prev => ({
        ...prev,
        metrics,
        isLoading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh metrics',
        isLoading: false,
      }));
    }
  }, []);

  // Export analytics
  const exportAnalytics = useCallback(() => {
    return navigationAnalyticsService.exportAnalytics();
  }, []);

  // Configure analytics
  const configureAnalytics = useCallback((config: Partial<AnalyticsConfig>) => {
    navigationAnalyticsService.configureAnalytics(config);
  }, []);

  // Clear analytics
  const clearAnalytics = useCallback(() => {
    navigationAnalyticsService.clearAnalytics();
    setState({
      metrics: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  // Get heatmap data
  const getHeatmapData = useCallback((hubId: NavigationHubId) => {
    return navigationAnalyticsService.getHeatmapData(hubId);
  }, []);

  // Auto-refresh metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isLoading) {
        refreshMetrics();
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [state.isLoading, refreshMetrics]);

  return {
    // State
    metrics: state.metrics,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    trackHubClick,
    trackQuickAction,
    trackGesture,
    trackKeyboardShortcut,
    trackPerformance,
    refreshMetrics,
    exportAnalytics,
    configureAnalytics,
    clearAnalytics,
    getHeatmapData,
  };
}

/**
 * Hook for real-time analytics tracking
 */
export function useRealTimeAnalytics() {
  const { trackHubClick, trackQuickAction, trackGesture, trackKeyboardShortcut, trackPerformance } = useNavigationAnalytics();

  // Auto-track performance for current page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

        trackPerformance('capture', { // Default to capture hub
          loadTime,
          renderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        });
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [trackPerformance]);

  // Auto-track memory usage
  useEffect(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const trackMemoryUsage = () => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
        // High memory usage alert
        trackPerformance('capture', {
          memoryUsage: memory.usedJSHeapSize,
        });
      }
    };

    const interval = setInterval(trackMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [trackPerformance]);

  return {
    trackHubClick,
    trackQuickAction,
    trackGesture,
    trackKeyboardShortcut,
    trackPerformance,
  };
}

/**
 * Hook for analytics dashboard data
 */
export function useAnalyticsDashboard() {
  const { metrics, isLoading, error, refreshMetrics, getHeatmapData } = useNavigationAnalytics();

  // Processed dashboard data
  const dashboardData = useMemo(() => {
    if (!metrics) return null;

    return {
      overview: {
        totalHubClicks: Object.values(metrics.hubUsage).reduce((sum, hub) => sum + hub.totalClicks, 0),
        totalQuickActions: Object.values(metrics.quickActionUsage).reduce((sum, action) => sum + action.totalUses, 0),
        averageSessionDuration: metrics.userBehavior.averageSessionDuration,
        activeUsers: Object.values(metrics.hubUsage).reduce((sum, hub) => sum + hub.uniqueUsers, 0),
      },
      performance: {
        averageLoadTime: metrics.performance.averageLoadTime,
        averageRenderTime: metrics.performance.averageRenderTime,
        memoryUsage: metrics.performance.memoryUsage.average,
        errorRate: metrics.performance.errorRate,
      },
      topHubs: Object.entries(metrics.hubUsage)
        .sort(([,a], [,b]) => b.totalClicks - a.totalClicks)
        .slice(0, 5)
        .map(([hubId, data]) => ({ hubId, ...data })),
      topActions: Object.entries(metrics.quickActionUsage)
        .sort(([,a], [,b]) => b.totalUses - a.totalUses)
        .slice(0, 5)
        .map(([actionId, data]) => ({ actionId, ...data })),
      usagePatterns: metrics.userBehavior.mostCommonPaths.slice(0, 5),
      roleDistribution: Object.entries(metrics.roleBasedMetrics).map(([role, data]) => ({
        role,
        ...data,
      })),
    };
  }, [metrics]);

  // Charts data
  const chartsData = useMemo(() => {
    if (!metrics) return null;

    return {
      hubUsageChart: Object.entries(metrics.hubUsage).map(([hubId, data]) => ({
        name: hubId,
        value: data.totalClicks,
        uniqueUsers: data.uniqueUsers,
      })),
      performanceChart: [
        { name: 'Load Time', value: metrics.performance.averageLoadTime },
        { name: 'Render Time', value: metrics.performance.averageRenderTime },
        { name: 'Interaction Time', value: metrics.performance.averageInteractionTime },
      ],
      usageTimeChart: metrics.userBehavior.peakUsageHours.map(hour => ({
        hour,
        usage: Math.random() * 100, // Placeholder - would need actual hourly data
      })),
    };
  }, [metrics]);

  return {
    dashboardData,
    chartsData,
    metrics,
    isLoading,
    error,
    refreshMetrics,
    getHeatmapData,
  };
}