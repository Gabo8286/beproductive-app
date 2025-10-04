/**
 * Performance monitoring utilities for production applications
 */

// Core Web Vitals metrics
export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance observer for real user monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observer: PerformanceObserver | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Initialize Core Web Vitals monitoring
    this.initWebVitals();

    // Monitor long tasks
    this.initLongTaskObserver();

    // Monitor resource loading
    this.initResourceObserver();

    // Monitor user interactions
    this.initUserTimingObserver();
  }

  private initWebVitals() {
    // Use web-vitals library if available, fallback to basic monitoring
    if ('web-vitals' in window) {
      this.loadWebVitalsLibrary();
    } else {
      this.fallbackVitalsMonitoring();
    }
  }

  private async loadWebVitalsLibrary() {
    try {
      const { getCLS, getFCP, getFID, getLCP, getTTFB } = await import('web-vitals');

      getCLS(this.sendToAnalytics);
      getFCP(this.sendToAnalytics);
      getFID(this.sendToAnalytics);
      getLCP(this.sendToAnalytics);
      getTTFB(this.sendToAnalytics);
    } catch (error) {
      console.warn('Failed to load web-vitals library:', error);
      this.fallbackVitalsMonitoring();
    }
  }

  private fallbackVitalsMonitoring() {
    // Basic performance monitoring without web-vitals library
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.recordMetric(`paint_${entry.name}`, entry.startTime);
          } else if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
            this.recordMetric('load_complete', navEntry.loadEventEnd - navEntry.navigationStart);
          }
        });
      });

      observer.observe({ entryTypes: ['paint', 'navigation'] });
    }
  }

  private initLongTaskObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long_task', entry.duration);
            console.warn(`Long task detected: ${entry.duration}ms`);
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private initResourceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          const resourceType = this.getResourceType(resourceEntry.name);

          this.recordMetric(`resource_${resourceType}_duration`, resourceEntry.duration);

          // Monitor large resources
          if (resourceEntry.transferSize > 100000) { // 100KB
            console.warn(`Large resource loaded: ${resourceEntry.name} (${resourceEntry.transferSize} bytes)`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private initUserTimingObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(`user_timing_${entry.name}`, entry.duration || entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['measure', 'mark'] });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private sendToAnalytics = (metric: WebVitalsMetric) => {
    // Record the metric
    this.recordMetric(metric.name, metric.value);

    // Send to analytics (implement your analytics service)
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricToService(metric);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta
      });
    }
  };

  private sendMetricToService(metric: WebVitalsMetric) {
    // Implement your analytics service integration here
    // Example: Google Analytics, DataDog, New Relic, etc.

    // Basic fetch to analytics endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(metric));
    } else {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(() => {
        // Silently fail for analytics
      });
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Mark user interactions for performance measurement
  markInteraction(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`interaction_${name}_start`);
    }
  }

  measureInteraction(name: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(
          `interaction_${name}`,
          `interaction_${name}_start`
        );
      } catch (error) {
        console.warn(`Failed to measure interaction ${name}:`, error);
      }
    }
  }

  // Bundle size monitoring
  estimateBundleSize() {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Report performance summary
  getPerformanceSummary() {
    const summary = {
      metrics: this.getAllMetrics(),
      memory: this.getMemoryUsage(),
      connection: this.estimateBundleSize(),
      timestamp: Date.now()
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(summary.metrics);
    }

    return summary;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hooks for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    markInteraction: performanceMonitor.markInteraction.bind(performanceMonitor),
    measureInteraction: performanceMonitor.measureInteraction.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetric: performanceMonitor.getMetric.bind(performanceMonitor),
    getPerformanceSummary: performanceMonitor.getPerformanceSummary.bind(performanceMonitor)
  };
};

// Component timing utilities
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    React.useEffect(() => {
      performanceMonitor.markInteraction(`${componentName}_mount`);

      return () => {
        performanceMonitor.measureInteraction(`${componentName}_mount`);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  });
};

// Bundle chunk loading monitoring
export const monitorChunkLoading = () => {
  if (typeof window !== 'undefined') {
    // Monitor dynamic imports
    const originalImport = window.__import || window.import;
    if (originalImport) {
      (window as any).__import = async (...args: any[]) => {
        const start = performance.now();
        try {
          const result = await originalImport.apply(window, args);
          const duration = performance.now() - start;
          performanceMonitor.recordMetric('dynamic_import_duration', duration);
          return result;
        } catch (error) {
          performanceMonitor.recordMetric('dynamic_import_error', 1);
          throw error;
        }
      };
    }
  }
};

// Initialize monitoring when module loads
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.init();
  monitorChunkLoading();
}