
// webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

class WebVitalsReporter {
  private endpoint: string;
  private apiKey: string;
  private sessionId: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT;
    this.apiKey = import.meta.env.VITE_PERFORMANCE_API_KEY;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToAnalytics(metric: WebVitalMetric) {
    if (!this.endpoint) {
      console.log('Web Vitals:', metric);
      return;
    }

    const payload = {
      ...metric,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
      environment: import.meta.env.VITE_APP_ENVIRONMENT
    };

    // Send to analytics endpoint
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(error => {
      console.warn('Failed to send Web Vitals:', error);
    });

    // Also send to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureWebVital?.(metric.name, metric.value, metric.rating);
    }
  }

  public init() {
    // Core Web Vitals
    getCLS(this.sendToAnalytics.bind(this));
    getFID(this.sendToAnalytics.bind(this));
    getFCP(this.sendToAnalytics.bind(this));
    getLCP(this.sendToAnalytics.bind(this));
    getTTFB(this.sendToAnalytics.bind(this));

    // Experimental metrics
    try {
      getINP(this.sendToAnalytics.bind(this));
    } catch (error) {
      console.warn('INP metric not available:', error);
    }

    // Custom application metrics
    this.trackCustomMetrics();
  }

  private trackCustomMetrics() {
    // Track React hydration time
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const navigationEntries = window.performance.getEntriesByType('navigation');

      if (paintEntries.length > 0 && navigationEntries.length > 0) {
        const hydrationTime = Date.now() - (navigationEntries[0] as PerformanceNavigationTiming).domContentLoadedEventEnd;

        this.sendToAnalytics({
          name: 'hydration-time',
          value: hydrationTime,
          rating: hydrationTime < 100 ? 'good' : hydrationTime < 300 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'hydration-' + this.sessionId,
          navigationType: 'reload'
        });
      }
    }

    // Track bundle load performance
    window.addEventListener('load', () => {
      const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsEntries = resourceEntries.filter(entry => entry.name.includes('.js'));
      const cssEntries = resourceEntries.filter(entry => entry.name.includes('.css'));

      if (jsEntries.length > 0) {
        const totalJsSize = jsEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
        const avgJsLoadTime = jsEntries.reduce((sum, entry) => sum + entry.duration, 0) / jsEntries.length;

        this.sendToAnalytics({
          name: 'js-bundle-performance',
          value: avgJsLoadTime,
          rating: avgJsLoadTime < 200 ? 'good' : avgJsLoadTime < 500 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'js-bundle-' + this.sessionId,
          navigationType: 'bundle-load'
        });
      }
    });
  }

  // Method to track custom application events
  public trackCustomEvent(name: string, duration: number, metadata?: Record<string, any>) {
    this.sendToAnalytics({
      name: `custom-${name}`,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
      delta: 0,
      id: `custom-${name}-${this.sessionId}`,
      navigationType: 'custom',
      ...metadata
    });
  }
}

export const webVitalsReporter = new WebVitalsReporter();

// Export for use in components
export function trackTaskCreation(duration: number) {
  webVitalsReporter.trackCustomEvent('task-creation', duration);
}

export function trackGoalCompletion(duration: number) {
  webVitalsReporter.trackCustomEvent('goal-completion', duration);
}

export function trackHabitTracking(duration: number) {
  webVitalsReporter.trackCustomEvent('habit-tracking', duration);
}

export function trackSearchPerformance(duration: number, resultCount: number) {
  webVitalsReporter.trackCustomEvent('search', duration, { resultCount });
}
