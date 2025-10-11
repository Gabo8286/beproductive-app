import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for tracking component render performance and API calls
 * Logs data to the performance_metrics table for analytics
 * 
 * Usage:
 * const { trackRender, trackApiCall } = usePerformanceTracking('Dashboard');
 * 
 * Performance: Enables real-time performance monitoring
 * Impact: Provides data for 95% performance improvement goal
 */
export function usePerformanceTracking(componentName: string) {
  const { user } = useAuth();
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  // Track component mount and render time
  useEffect(() => {
    mountTime.current = performance.now();
    renderStartTime.current = performance.now();

    return () => {
      const renderDuration = performance.now() - renderStartTime.current;
      
      // Log render performance if it took more than 16ms (60fps threshold)
      if (renderDuration > 16 && user) {
        logPerformanceMetric({
          metric_type: 'render',
          component_name: componentName,
          duration_ms: renderDuration,
          metadata: {
            mountTime: mountTime.current,
            exceeded_60fps: renderDuration > 16,
          },
        }).catch(console.error);
      }
    };
  }, [componentName, user]);

  const trackRender = useCallback((customMetadata?: Record<string, any>) => {
    const duration = performance.now() - renderStartTime.current;
    
    if (user) {
      logPerformanceMetric({
        metric_type: 'render',
        component_name: componentName,
        duration_ms: duration,
        metadata: customMetadata,
      }).catch(console.error);
    }
  }, [componentName, user]);

  const trackApiCall = useCallback(
    (apiName: string, startTime: number, success: boolean, metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      
      if (user) {
        logPerformanceMetric({
          metric_type: 'api',
          component_name: componentName,
          duration_ms: duration,
          metadata: {
            apiName,
            success,
            ...metadata,
          },
        }).catch(console.error);
      }
    },
    [componentName, user]
  );

  const trackInteraction = useCallback(
    (interactionName: string, metadata?: Record<string, any>) => {
      if (user) {
        logPerformanceMetric({
          metric_type: 'interaction',
          component_name: componentName,
          duration_ms: performance.now() - mountTime.current,
          metadata: {
            interactionName,
            ...metadata,
          },
        }).catch(console.error);
      }
    },
    [componentName, user]
  );

  return {
    trackRender,
    trackApiCall,
    trackInteraction,
  };
}

// Helper function to log performance metrics to the database
async function logPerformanceMetric(metric: {
  metric_type: string;
  component_name: string;
  duration_ms: number;
  metadata?: Record<string, any>;
}) {
  try {
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metric_type: metric.metric_type,
        component_name: metric.component_name,
        duration_ms: metric.duration_ms,
        metadata: metric.metadata || {},
      });

    if (error) {
      console.error('Error logging performance metric:', error);
    }
  } catch (err) {
    console.error('Failed to log performance metric:', err);
  }
}
