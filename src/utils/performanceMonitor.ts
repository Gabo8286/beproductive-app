// Performance monitoring utility for Dashboard testing
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata
    });
    console.log(`🔬 Performance: Started measuring "${name}" at ${startTime.toFixed(2)}ms`);
  }

  endMeasure(name: string): PerformanceMetric | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance: No measurement found for "${name}"`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    };

    this.metrics.set(name, completedMetric);

    const durationFormatted = duration.toFixed(2);
    const emoji = duration < 100 ? '✅' : duration < 500 ? '⚠️' : '❌';

    console.log(`${emoji} Performance: "${name}" completed in ${durationFormatted}ms`);

    return completedMetric;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getCompletedMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  clear(): void {
    this.metrics.clear();
    console.log('🔬 Performance: Cleared all metrics');
  }

  // Log performance summary
  logSummary(): void {
    const completed = this.getCompletedMetrics();
    if (completed.length === 0) {
      console.log('🔬 Performance Summary: No completed measurements');
      return;
    }

    console.group('📊 Performance Summary');
    completed.forEach(metric => {
      const emoji = metric.duration! < 100 ? '✅' : metric.duration! < 500 ? '⚠️' : '❌';
      console.log(`${emoji} ${metric.name}: ${metric.duration!.toFixed(2)}ms`);
      if (metric.metadata) {
        console.log(`   Metadata:`, metric.metadata);
      }
    });

    const totalDuration = completed.reduce((sum, m) => sum + (m.duration || 0), 0);
    console.log(`📈 Total measured time: ${totalDuration.toFixed(2)}ms`);
    console.groupEnd();
  }

  // Track component render times
  trackComponentRender(componentName: string) {
    return {
      onStart: () => this.startMeasure(`component-render-${componentName}`),
      onEnd: () => this.endMeasure(`component-render-${componentName}`)
    };
  }

  // Track API call times
  trackApiCall(apiName: string, url?: string) {
    return {
      onStart: () => this.startMeasure(`api-call-${apiName}`, { url }),
      onEnd: () => this.endMeasure(`api-call-${apiName}`)
    };
  }

  // Track context loading times
  trackContextLoad(contextName: string) {
    return {
      onStart: () => this.startMeasure(`context-load-${contextName}`),
      onEnd: () => this.endMeasure(`context-load-${contextName}`)
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for easy component tracking
export function usePerformanceTracking(componentName: string) {
  const tracker = performanceMonitor.trackComponentRender(componentName);

  React.useEffect(() => {
    tracker.onStart();
    return () => {
      tracker.onEnd();
    };
  }, []);

  return performanceMonitor;
}

// Higher-order component for performance tracking
export function withPerformanceTracking<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithPerformanceTracking: React.FC<T> = (props: T) => {
    const tracker = performanceMonitor.trackComponentRender(displayName);

    React.useEffect(() => {
      tracker.onStart();
      return () => {
        tracker.onEnd();
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };

  WithPerformanceTracking.displayName = `withPerformanceTracking(${displayName})`;
  return WithPerformanceTracking;
}

// Utility to track page load performance
export function trackPageLoad(pageName: string) {
  performanceMonitor.startMeasure(`page-load-${pageName}`, {
    url: window.location.href,
    timestamp: Date.now()
  });

  // Auto-complete on window load
  window.addEventListener('load', () => {
    performanceMonitor.endMeasure(`page-load-${pageName}`);
  }, { once: true });
}

import React from 'react';