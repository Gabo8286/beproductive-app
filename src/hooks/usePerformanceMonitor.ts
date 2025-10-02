import { useEffect, useRef, useCallback } from 'react';

interface PerformanceEntry {
  name: string;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface UsePerformanceMonitorReturn {
  measureComponentRender: (componentName: string) => () => void;
  trackInteraction: (interactionName: string, metadata?: any) => void;
  trackAPICall: (apiName: string, duration: number, success: boolean) => void;
  getPerformanceEntries: () => PerformanceEntry[];
}

/**
 * Hook for monitoring runtime performance
 */
export const usePerformanceMonitor = (): UsePerformanceMonitorReturn => {
  const entriesRef = useRef<PerformanceEntry[]>([]);

  /**
   * Measure component render time
   */
  const measureComponentRender = useCallback((componentName: string) => {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    try {
      performance.mark(startMark);

      return () => {
        try {
          performance.mark(endMark);
          performance.measure(measureName, startMark, endMark);

          const measure = performance.getEntriesByName(measureName)[0];
          if (measure) {
            const entry: PerformanceEntry = {
              name: componentName,
              timestamp: Date.now(),
              duration: measure.duration,
              metadata: { type: 'component-render' },
            };

            entriesRef.current.push(entry);

            // Log slow renders in development
            if (process.env.NODE_ENV === 'development' && measure.duration > 16) {
              console.warn(`[Performance] Slow render detected: ${componentName} took ${measure.duration.toFixed(2)}ms`);
            }

            // Clear marks and measures to prevent memory leaks
            performance.clearMarks(startMark);
            performance.clearMarks(endMark);
            performance.clearMeasures(measureName);
          }
        } catch (error) {
          console.error('Failed to measure component render:', error);
        }
      };
    } catch (error) {
      console.error('Failed to start component render measurement:', error);
      return () => {};
    }
  }, []);

  /**
   * Track user interaction timing
   */
  const trackInteraction = useCallback((interactionName: string, metadata?: any) => {
    const entry: PerformanceEntry = {
      name: interactionName,
      timestamp: Date.now(),
      duration: performance.now(),
      metadata: { type: 'interaction', ...metadata },
    };

    entriesRef.current.push(entry);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'interaction', {
        event_category: 'Performance',
        event_label: interactionName,
        value: Math.round(entry.duration),
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Interaction tracked: ${interactionName}`, entry);
    }
  }, []);

  /**
   * Track API call performance
   */
  const trackAPICall = useCallback((apiName: string, duration: number, success: boolean) => {
    const entry: PerformanceEntry = {
      name: apiName,
      timestamp: Date.now(),
      duration,
      metadata: {
        type: 'api-call',
        success,
      },
    };

    entriesRef.current.push(entry);

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`[Performance] Slow API call: ${apiName} took ${duration.toFixed(2)}ms`);
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_performance', {
        event_category: 'API',
        event_label: apiName,
        value: Math.round(duration),
        success,
      });
    }
  }, []);

  /**
   * Get all collected performance entries
   */
  const getPerformanceEntries = useCallback(() => {
    return [...entriesRef.current];
  }, []);

  // Clean up old entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      entriesRef.current = entriesRef.current.filter(
        (entry) => entry.timestamp > fiveMinutesAgo
      );
    }, 60000); // Clean up every minute

    return () => clearInterval(interval);
  }, []);

  return {
    measureComponentRender,
    trackInteraction,
    trackAPICall,
    getPerformanceEntries,
  };
};

/**
 * Hook for monitoring component mount/unmount performance
 */
export const useComponentPerformance = (componentName: string) => {
  const { measureComponentRender } = usePerformanceMonitor();

  useEffect(() => {
    const stopMeasure = measureComponentRender(componentName);
    return stopMeasure;
  }, [componentName, measureComponentRender]);
};

/**
 * Track long tasks (tasks that block the main thread for >50ms)
 */
export const useTrackLongTasks = () => {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });

            // Send to analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'long_task', {
                event_category: 'Performance',
                value: Math.round(entry.duration),
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });

      return () => observer.disconnect();
    } catch (error) {
      console.error('Failed to observe long tasks:', error);
    }
  }, []);
};
