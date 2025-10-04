/**
 * Error Tracking and Logging System
 * Production-ready error handling with Sentry integration
 */

import React from 'react';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  buildVersion?: string;
  feature?: string;
  [key: string]: any;
}

export interface ErrorEvent {
  error: Error;
  level: 'error' | 'warning' | 'info' | 'debug';
  context: ErrorContext;
  fingerprint?: string[];
  tags?: Record<string, string>;
}

export interface PerformanceIssue {
  type: 'long_task' | 'large_bundle' | 'slow_api' | 'memory_leak';
  duration: number;
  threshold: number;
  context: ErrorContext;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;
  private sessionId = this.generateSessionId();
  private errorQueue: ErrorEvent[] = [];
  private performanceQueue: PerformanceIssue[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry in production
      if (import.meta.env.VITE_APP_ENVIRONMENT === 'production' && import.meta.env.VITE_SENTRY_DSN) {
        await this.initSentry();
      }

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      // Set up React error boundary integration
      this.setupReactErrorHandling();

      this.isInitialized = true;
      console.log('Error tracking initialized');

    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  private async initSentry() {
    try {
      const { init, captureException, setUser, setTag, addBreadcrumb } = await import('@sentry/react');

      init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.VITE_APP_ENVIRONMENT,
        release: import.meta.env.VITE_APP_VERSION,
        tracesSampleRate: import.meta.env.VITE_APP_ENVIRONMENT === 'production' ? 0.1 : 1.0,
        beforeSend: (event, hint) => {
          // Filter out known noise
          if (this.shouldIgnoreError(hint.originalException)) {
            return null;
          }

          // Add custom context
          event.extra = {
            ...event.extra,
            sessionId: this.sessionId,
            buildTime: import.meta.env.VITE_BUILD_TIME,
            commitHash: import.meta.env.VITE_COMMIT_HASH
          };

          return event;
        },
        integrations: [
          // Add React Router integration if available
        ]
      });

      // Set default tags
      setTag('sessionId', this.sessionId);
      setTag('buildVersion', import.meta.env.VITE_APP_VERSION);

      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        level: 'error',
        context: {
          type: 'unhandled_promise_rejection',
          route: window.location.pathname,
          sessionId: this.sessionId
        }
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        level: 'error',
        context: {
          type: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          route: window.location.pathname,
          sessionId: this.sessionId
        }
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        this.captureError(new Error(`Resource failed to load: ${target.tagName}`), {
          level: 'warning',
          context: {
            type: 'resource_error',
            element: target.tagName,
            src: (target as any).src || (target as any).href,
            route: window.location.pathname,
            sessionId: this.sessionId
          }
        });
      }
    }, true);
  }

  private setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.capturePerformanceIssue({
                type: 'long_task',
                duration: entry.duration,
                threshold: 50,
                context: {
                  route: window.location.pathname,
                  sessionId: this.sessionId
                }
              });
            }
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported');
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (usedPercent > 90) {
          this.capturePerformanceIssue({
            type: 'memory_leak',
            duration: usedPercent,
            threshold: 90,
            context: {
              memoryUsed: memory.usedJSHeapSize,
              memoryLimit: memory.jsHeapSizeLimit,
              route: window.location.pathname,
              sessionId: this.sessionId
            }
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private setupReactErrorHandling() {
    // This would be integrated with React Error Boundaries
    (window as any).__errorTracker = this;
  }

  captureError(error: Error, options: Partial<ErrorEvent> = {}) {
    const errorEvent: ErrorEvent = {
      error,
      level: options.level || 'error',
      context: {
        ...this.getDefaultContext(),
        ...options.context
      },
      fingerprint: options.fingerprint,
      tags: options.tags
    };

    // Add to queue for batching
    this.errorQueue.push(errorEvent);

    // Send to external services
    this.sendToSentry(errorEvent);
    this.sendToCustomEndpoint(errorEvent);

    // Log locally
    this.logError(errorEvent);

    // Process queue if it gets large
    if (this.errorQueue.length > 10) {
      this.flushErrorQueue();
    }
  }

  capturePerformanceIssue(issue: PerformanceIssue) {
    this.performanceQueue.push(issue);

    // Log performance issues
    console.warn(`Performance issue detected: ${issue.type}`, {
      duration: issue.duration,
      threshold: issue.threshold,
      context: issue.context
    });

    // Send to monitoring
    this.sendPerformanceData(issue);

    if (this.performanceQueue.length > 5) {
      this.flushPerformanceQueue();
    }
  }

  private async sendToSentry(errorEvent: ErrorEvent) {
    try {
      if (import.meta.env.VITE_SENTRY_DSN) {
        const { captureException, setContext } = await import('@sentry/react');

        setContext('errorContext', errorEvent.context);
        captureException(errorEvent.error, {
          level: errorEvent.level,
          tags: errorEvent.tags,
          fingerprint: errorEvent.fingerprint
        });
      }
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }

  private async sendToCustomEndpoint(errorEvent: ErrorEvent) {
    try {
      const endpoint = import.meta.env.VITE_ERROR_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: errorEvent.error.message,
          stack: errorEvent.error.stack,
          level: errorEvent.level,
          context: errorEvent.context,
          tags: errorEvent.tags,
          timestamp: new Date().toISOString()
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('Failed to send error to custom endpoint:', error);
    }
  }

  private async sendPerformanceData(issue: PerformanceIssue) {
    try {
      const endpoint = import.meta.env.VITE_PERFORMANCE_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: issue.type,
          duration: issue.duration,
          threshold: issue.threshold,
          context: issue.context,
          timestamp: new Date().toISOString()
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  private logError(errorEvent: ErrorEvent) {
    const logLevel = import.meta.env.VITE_LOG_LEVEL || 'error';
    const enableLogs = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';

    if (!enableLogs && import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
      return;
    }

    const logMethod = console[errorEvent.level] || console.error;
    logMethod('Error captured:', {
      message: errorEvent.error.message,
      stack: errorEvent.error.stack,
      context: errorEvent.context,
      timestamp: new Date().toISOString()
    });
  }

  private getDefaultContext(): ErrorContext {
    return {
      sessionId: this.sessionId,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      buildVersion: import.meta.env.VITE_APP_VERSION
    };
  }

  private shouldIgnoreError(error: any): boolean {
    if (!error) return true;

    const ignoredMessages = [
      'Script error',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Failed to fetch'
    ];

    const message = error.message || error.toString();
    return ignoredMessages.some(ignored => message.includes(ignored));
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      import('@sentry/react').then(({ setUser }) => {
        setUser(user);
      });
    }
  }

  addBreadcrumb(message: string, category: string, data?: any) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      import('@sentry/react').then(({ addBreadcrumb }) => {
        addBreadcrumb({
          message,
          category,
          data,
          timestamp: Date.now() / 1000
        });
      });
    }
  }

  flushErrorQueue() {
    console.log(`Flushing ${this.errorQueue.length} errors`);
    this.errorQueue = [];
  }

  flushPerformanceQueue() {
    console.log(`Flushing ${this.performanceQueue.length} performance issues`);
    this.performanceQueue = [];
  }

  getMetrics() {
    return {
      errorsQueued: this.errorQueue.length,
      performanceIssuesQueued: this.performanceQueue.length,
      sessionId: this.sessionId,
      isInitialized: this.isInitialized
    };
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// React Error Boundary integration
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, {
      level: 'error',
      context: {
        component: 'ErrorBoundary',
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We've been notified of this error and are working to fix it.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// React hooks for error tracking
export const useErrorTracking = () => {
  const captureError = React.useCallback((error: Error, context?: ErrorContext) => {
    errorTracker.captureError(error, { context });
  }, []);

  const addBreadcrumb = React.useCallback((message: string, category: string, data?: any) => {
    errorTracker.addBreadcrumb(message, category, data);
  }, []);

  return {
    captureError,
    addBreadcrumb,
    metrics: errorTracker.getMetrics()
  };
};

// Initialize error tracking
if (typeof window !== 'undefined') {
  errorTracker.init();
}

export default errorTracker;