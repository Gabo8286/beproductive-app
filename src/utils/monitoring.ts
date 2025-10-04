// Production monitoring utilities
export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface UserActionEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties?: Record<string, any>;
}

class ProductionMonitoring {
  private isEnabled: boolean = false;
  private errorQueue: ErrorReport[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private userActionQueue: UserActionEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private maxQueueSize: number = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  public initialize(config: { enabled: boolean; apiEndpoint?: string; apiKey?: string }): void {
    this.isEnabled = config.enabled;

    if (this.isEnabled) {
      console.log('Production monitoring initialized');
    }
  }

  private setupErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        context: {
          type: 'unhandled_promise_rejection',
          reason: event.reason,
        },
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint (FCP)
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportPerformance({
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            url: window.location.href,
          });
        });
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportPerformance({
            name: 'largest-contentful-paint',
            value: entry.startTime,
            timestamp: Date.now(),
            url: window.location.href,
          });
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportPerformance({
            name: 'first-input-delay',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            url: window.location.href,
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Navigation timing
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          this.reportPerformance({
            name: 'page-load-time',
            value: navEntry.loadEventEnd - navEntry.navigationStart,
            timestamp: Date.now(),
            url: window.location.href,
            context: {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
              domInteractive: navEntry.domInteractive - navEntry.navigationStart,
              firstByte: navEntry.responseStart - navEntry.navigationStart,
            },
          });
        });
      }).observe({ entryTypes: ['navigation'] });
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.reportPerformance({
          name: 'memory-usage',
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          url: window.location.href,
          context: {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          },
        });
      }, 60000); // Every minute
    }
  }

  public reportError(error: ErrorReport): void {
    if (!this.isEnabled) return;

    this.errorQueue.push(error);

    // Flush immediately for critical errors
    if (error.severity === 'critical') {
      this.flushErrors();
    }

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  public reportPerformance(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.performanceQueue.push(metric);

    // Maintain queue size
    if (this.performanceQueue.length > this.maxQueueSize) {
      this.performanceQueue = this.performanceQueue.slice(-this.maxQueueSize);
    }
  }

  public trackUserAction(action: UserActionEvent): void {
    if (!this.isEnabled) return;

    this.userActionQueue.push({
      ...action,
      sessionId: this.sessionId,
      timestamp: action.timestamp || Date.now(),
    });

    // Maintain queue size
    if (this.userActionQueue.length > this.maxQueueSize) {
      this.userActionQueue = this.userActionQueue.slice(-this.maxQueueSize);
    }
  }

  private startFlushTimer(): void {
    setInterval(() => {
      this.flushAll();
    }, this.flushInterval);
  }

  private flushErrors(): void {
    if (this.errorQueue.length === 0) return;

    // In a real implementation, send to monitoring service
    console.group('Error Reports');
    this.errorQueue.forEach(error => {
      console.error('Reported Error:', error);
    });
    console.groupEnd();

    this.errorQueue = [];
  }

  private flushPerformance(): void {
    if (this.performanceQueue.length === 0) return;

    // In a real implementation, send to monitoring service
    console.group('Performance Metrics');
    this.performanceQueue.forEach(metric => {
      console.log('Performance Metric:', metric);
    });
    console.groupEnd();

    this.performanceQueue = [];
  }

  private flushUserActions(): void {
    if (this.userActionQueue.length === 0) return;

    // In a real implementation, send to analytics service
    console.group('User Actions');
    this.userActionQueue.forEach(action => {
      console.log('User Action:', action);
    });
    console.groupEnd();

    this.userActionQueue = [];
  }

  private flushAll(): void {
    this.flushErrors();
    this.flushPerformance();
    this.flushUserActions();
  }

  // Health check utilities
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: Record<string, number>;
  } {
    const checks = {
      errorRate: this.getErrorRate() < 0.05, // Less than 5% error rate
      performanceGood: this.getAverageLoadTime() < 3000, // Less than 3 seconds
      memoryUsage: this.getMemoryUsage() < 0.8, // Less than 80% memory usage
    };

    const allHealthy = Object.values(checks).every(check => check);
    const someHealthy = Object.values(checks).some(check => check);

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      checks,
      metrics: {
        errorRate: this.getErrorRate(),
        averageLoadTime: this.getAverageLoadTime(),
        memoryUsage: this.getMemoryUsage(),
      },
    };
  }

  private getErrorRate(): number {
    // Mock implementation
    return 0.02; // 2% error rate
  }

  private getAverageLoadTime(): number {
    // Mock implementation
    const loadTimes = this.performanceQueue
      .filter(metric => metric.name === 'page-load-time')
      .map(metric => metric.value);

    if (loadTimes.length === 0) return 0;

    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  // Feature flag integration
  public reportFeatureUsage(feature: string, enabled: boolean, userId?: string): void {
    this.trackUserAction({
      action: 'feature_used',
      category: 'feature_flags',
      label: feature,
      value: enabled ? 1 : 0,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        feature,
        enabled,
      },
    });
  }

  // A/B test integration
  public reportABTestView(testName: string, variant: string, userId?: string): void {
    this.trackUserAction({
      action: 'ab_test_view',
      category: 'experiments',
      label: testName,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        testName,
        variant,
      },
    });
  }

  // Business metrics
  public reportBusinessMetric(metric: string, value: number, userId?: string): void {
    this.trackUserAction({
      action: 'business_metric',
      category: 'business',
      label: metric,
      value,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    });
  }

  // Utility methods for testing
  public getQueueSizes(): { errors: number; performance: number; userActions: number } {
    return {
      errors: this.errorQueue.length,
      performance: this.performanceQueue.length,
      userActions: this.userActionQueue.length,
    };
  }

  public clearQueues(): void {
    this.errorQueue = [];
    this.performanceQueue = [];
    this.userActionQueue = [];
  }
}

// Real User Monitoring (RUM) utilities
export class RealUserMonitoring {
  private static instance: RealUserMonitoring;
  private monitoring: ProductionMonitoring;
  private startTime: number;

  private constructor() {
    this.monitoring = new ProductionMonitoring();
    this.startTime = Date.now();
  }

  public static getInstance(): RealUserMonitoring {
    if (!RealUserMonitoring.instance) {
      RealUserMonitoring.instance = new RealUserMonitoring();
    }
    return RealUserMonitoring.instance;
  }

  public initialize(config: { enabled: boolean; userId?: string }): void {
    this.monitoring.initialize({ enabled: config.enabled });

    if (config.userId) {
      this.setUserId(config.userId);
    }
  }

  public setUserId(userId: string): void {
    this.monitoring.trackUserAction({
      action: 'user_identified',
      category: 'user',
      userId,
      sessionId: '',
      timestamp: Date.now(),
    });
  }

  public trackPageView(page: string, title?: string): void {
    this.monitoring.trackUserAction({
      action: 'page_view',
      category: 'navigation',
      label: page,
      sessionId: '',
      timestamp: Date.now(),
      properties: {
        page,
        title: title || document.title,
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  }

  public trackGoalCreated(goalId: string, category: string, userId?: string): void {
    this.monitoring.reportBusinessMetric('goal_created', 1, userId);
    this.monitoring.trackUserAction({
      action: 'goal_created',
      category: 'goals',
      label: category,
      userId,
      sessionId: '',
      timestamp: Date.now(),
      properties: {
        goalId,
        category,
      },
    });
  }

  public trackGoalCompleted(goalId: string, timeToComplete: number, userId?: string): void {
    this.monitoring.reportBusinessMetric('goal_completed', 1, userId);
    this.monitoring.reportPerformance({
      name: 'goal_completion_time',
      value: timeToComplete,
      timestamp: Date.now(),
      url: window.location.href,
      userId,
      context: {
        goalId,
      },
    });
  }

  public trackError(error: Error, context?: Record<string, any>, userId?: string): void {
    this.monitoring.reportError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId,
      timestamp: Date.now(),
      severity: 'medium',
      context,
    });
  }

  public getSessionDuration(): number {
    return Date.now() - this.startTime;
  }

  public getHealthStatus() {
    return this.monitoring.getHealthStatus();
  }
}

// Export singleton instance
export const monitoring = RealUserMonitoring.getInstance();

// Utility functions for React components
export const useMonitoring = () => {
  return {
    trackPageView: monitoring.trackPageView.bind(monitoring),
    trackGoalCreated: monitoring.trackGoalCreated.bind(monitoring),
    trackGoalCompleted: monitoring.trackGoalCompleted.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    getHealthStatus: monitoring.getHealthStatus.bind(monitoring),
  };
};

// Error boundary helper
export const withMonitoring = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return class WithMonitoring extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      monitoring.trackError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('div', null, 'Something went wrong.');
      }

      return React.createElement(Component, this.props);
    }
  };
};

export default monitoring;