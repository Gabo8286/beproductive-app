#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * Configures error tracking, performance monitoring, and alerting systems
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class MonitoringSetup {
  constructor() {
    this.config = {
      sentry: {},
      webVitals: {},
      uptime: {},
      logs: {},
      alerts: {}
    };
  }

  generateSentryConfig() {
    console.log('\n🐛 Setting up Sentry Error Tracking...');

    const sentryConfig = {
      // Sentry configuration for React app
      react: {
        dsn: '${VITE_SENTRY_DSN}',
        environment: '${VITE_APP_ENVIRONMENT}',
        release: '${VITE_APP_VERSION}',
        debug: false,
        integrations: [
          'browserTracingIntegration',
          'replayIntegration'
        ],
        tracesSampleRate: '${VITE_APP_ENVIRONMENT === "production" ? 0.1 : 1.0}',
        profilesSampleRate: '${VITE_APP_ENVIRONMENT === "production" ? 0.1 : 1.0}',
        replaysSessionSampleRate: '${VITE_APP_ENVIRONMENT === "production" ? 0.1 : 1.0}',
        replaysOnErrorSampleRate: 1.0,
        beforeSend: 'function(event, hint) { /* Custom filtering logic */ return event; }',
        ignoreErrors: [
          'Non-Error promise rejection captured',
          'ResizeObserver loop limit exceeded',
          'ChunkLoadError',
          'Loading chunk'
        ],
        allowUrls: [
          '${VITE_APP_URL}',
          '${VITE_CDN_URL || VITE_APP_URL}'
        ]
      },

      // Performance monitoring thresholds
      performance: {
        webVitals: {
          lcp: { good: 2500, poor: 4000 },
          fid: { good: 100, poor: 300 },
          cls: { good: 0.1, poor: 0.25 },
          fcp: { good: 1800, poor: 3000 },
          ttfb: { good: 600, poor: 1500 }
        },
        customMetrics: [
          'task_creation_time',
          'goal_completion_rate',
          'habit_tracking_latency',
          'search_response_time'
        ]
      },

      // Alert rules
      alerts: {
        errorRate: {
          threshold: 0.05, // 5%
          window: '5m',
          severity: 'high'
        },
        performanceRegression: {
          threshold: 0.2, // 20% degradation
          window: '15m',
          severity: 'medium'
        },
        uptimeAlert: {
          threshold: 0.99, // 99% uptime
          window: '1h',
          severity: 'critical'
        }
      }
    };

    this.config.sentry = sentryConfig;

    // Generate Sentry initialization code
    const sentryInit = `
// sentry.config.ts
import * as Sentry from '@sentry/react';
import { browserTracingIntegration, replayIntegration } from '@sentry/react';

const environment = import.meta.env.VITE_APP_ENVIRONMENT;
const isProduction = environment === 'production';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment,
    release: import.meta.env.VITE_APP_VERSION,
    debug: !isProduction,

    integrations: [
      browserTracingIntegration({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      replayIntegration({
        maskAllText: isProduction,
        blockAllMedia: isProduction,
      }),
    ],

    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('Non-Error promise rejection')) {
          return null;
        }
      }
      return event;
    },

    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'ChunkLoadError',
      'Loading chunk',
      'Script error.',
      'Network request failed'
    ],

    allowUrls: [
      import.meta.env.VITE_APP_URL,
      import.meta.env.VITE_CDN_URL || import.meta.env.VITE_APP_URL
    ]
  });

  // Set user context
  Sentry.setContext('app', {
    version: import.meta.env.VITE_APP_VERSION,
    environment,
    buildTime: import.meta.env.VITE_BUILD_TIME
  });
}

// Custom error boundary
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring helpers
export function captureWebVital(name: string, value: number, rating: string) {
  Sentry.addBreadcrumb({
    category: 'web-vital',
    message: \`\${name}: \${value}ms (\${rating})\`,
    level: rating === 'poor' ? 'warning' : 'info',
    data: { name, value, rating }
  });

  if (rating === 'poor') {
    Sentry.captureMessage(\`Poor \${name}: \${value}ms\`, 'warning');
  }
}

export function captureCustomMetric(name: string, value: number, tags?: Record<string, string>) {
  Sentry.metrics.increment(name, 1, {
    tags: {
      environment,
      ...tags
    }
  });

  Sentry.metrics.gauge(name, value, {
    tags: {
      environment,
      ...tags
    }
  });
}
`;

    const sentryConfigPath = join(rootDir, 'src', 'config');
    if (!existsSync(sentryConfigPath)) {
      mkdirSync(sentryConfigPath, { recursive: true });
    }

    writeFileSync(join(sentryConfigPath, 'sentry.ts'), sentryInit);
    console.log('✓ Sentry configuration generated');
  }

  generateWebVitalsConfig() {
    console.log('\n⚡ Setting up Web Vitals Monitoring...');

    const webVitalsCode = `
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
    return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
        'Authorization': \`Bearer \${this.apiKey}\`
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
      name: \`custom-\${name}\`,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
      delta: 0,
      id: \`custom-\${name}-\${this.sessionId}\`,
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
`;

    const configPath = join(rootDir, 'src', 'config');
    writeFileSync(join(configPath, 'webVitals.ts'), webVitalsCode);
    console.log('✓ Web Vitals monitoring configured');
  }

  generateHealthCheckEndpoint() {
    console.log('\n🏥 Setting up Health Check Endpoint...');

    const healthCheckCode = `
// healthCheck.ts
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  environment: string;
  checks: {
    database: HealthStatus;
    api: HealthStatus;
    cache: HealthStatus;
    auth: HealthStatus;
  };
  performance: {
    responseTime: number;
    memoryUsage?: number;
  };
}

interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  responseTime?: number;
  lastChecked: number;
}

class HealthChecker {
  private cache: Map<string, HealthStatus> = new Map();
  private readonly cacheTimeout = 30000; // 30 seconds

  async checkDatabase(): Promise<HealthStatus> {
    const cached = this.getCached('database');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      // Simple database connectivity check
      const response = await fetch('/api/health/db', {
        method: 'GET',
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'error',
        message: response.ok ? 'Database connected' : 'Database connection failed',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('database', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: \`Database check failed: \${error.message}\`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('database', status);
      return status;
    }
  }

  async checkAPI(): Promise<HealthStatus> {
    const cached = this.getCached('api');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      const response = await fetch('/api/health/api', {
        method: 'GET',
        timeout: 3000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'warning',
        message: response.ok ? 'API responding' : 'API slow response',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('api', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: \`API check failed: \${error.message}\`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('api', status);
      return status;
    }
  }

  async checkAuth(): Promise<HealthStatus> {
    const cached = this.getCached('auth');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      // Check if auth service is responsive
      const response = await fetch('/api/health/auth', {
        method: 'GET',
        timeout: 3000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'warning',
        message: response.ok ? 'Auth service available' : 'Auth service issues',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('auth', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: \`Auth check failed: \${error.message}\`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('auth', status);
      return status;
    }
  }

  checkCache(): HealthStatus {
    try {
      localStorage.setItem('health-check-test', 'test');
      localStorage.removeItem('health-check-test');

      return {
        status: 'ok',
        message: 'Local storage available',
        lastChecked: Date.now()
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Local storage issues',
        lastChecked: Date.now()
      };
    }
  }

  private getCached(key: string): HealthStatus | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.lastChecked < this.cacheTimeout) {
      return cached;
    }
    return null;
  }

  async getHealthStatus(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const [database, api, auth] = await Promise.all([
      this.checkDatabase(),
      this.checkAPI(),
      this.checkAuth()
    ]);

    const cache = this.checkCache();

    const checks = { database, api, cache, auth };

    // Determine overall status
    const hasError = Object.values(checks).some(check => check.status === 'error');
    const hasWarning = Object.values(checks).some(check => check.status === 'warning');

    const overallStatus = hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      timestamp: Date.now(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
      checks,
      performance: {
        responseTime: Date.now() - startTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  }
}

export const healthChecker = new HealthChecker();

// React hook for health monitoring
export function useHealthCheck(intervalMs: number = 60000) {
  const [health, setHealth] = React.useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkHealth() {
      try {
        const result = await healthChecker.getHealthStatus();
        setHealth(result);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    interval = setInterval(checkHealth, intervalMs);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [intervalMs]);

  return { health, loading };
}
`;

    const configPath = join(rootDir, 'src', 'config');
    writeFileSync(join(configPath, 'healthCheck.ts'), healthCheckCode);
    console.log('✓ Health check system configured');
  }

  generateAlertingConfig() {
    console.log('\n🚨 Setting up Alerting Configuration...');

    const alertConfig = {
      // Slack webhook configuration
      slack: {
        webhookUrl: '${SLACK_WEBHOOK_URL}',
        channels: {
          critical: '#alerts-critical',
          high: '#alerts-high',
          medium: '#alerts-medium',
          info: '#alerts-info'
        },
        templates: {
          error: {
            title: '🔴 Critical Error Alert',
            color: 'danger',
            fields: [
              { title: 'Environment', value: '${environment}', short: true },
              { title: 'Error Rate', value: '${errorRate}%', short: true },
              { title: 'Affected Users', value: '${affectedUsers}', short: true },
              { title: 'Time Window', value: '${timeWindow}', short: true }
            ]
          },
          performance: {
            title: '⚡ Performance Alert',
            color: 'warning',
            fields: [
              { title: 'Metric', value: '${metric}', short: true },
              { title: 'Current Value', value: '${currentValue}', short: true },
              { title: 'Threshold', value: '${threshold}', short: true },
              { title: 'Duration', value: '${duration}', short: true }
            ]
          },
          recovery: {
            title: '✅ Service Recovered',
            color: 'good',
            fields: [
              { title: 'Service', value: '${service}', short: true },
              { title: 'Downtime', value: '${downtime}', short: true }
            ]
          }
        }
      },

      // Email alerting configuration
      email: {
        smtp: {
          host: '${EMAIL_SMTP_HOST}',
          port: 587,
          secure: false,
          auth: {
            user: '${EMAIL_SMTP_USER}',
            pass: '${EMAIL_SMTP_PASS}'
          }
        },
        templates: {
          critical: {
            subject: '[CRITICAL] ${appName} - ${alertType}',
            template: 'critical-alert.html'
          },
          warning: {
            subject: '[WARNING] ${appName} - ${alertType}',
            template: 'warning-alert.html'
          }
        }
      },

      // PagerDuty integration
      pagerduty: {
        apiKey: '${PAGERDUTY_API_KEY}',
        serviceKey: '${PAGERDUTY_SERVICE_KEY}',
        escalationPolicy: '${PAGERDUTY_ESCALATION_POLICY}',
        severity: {
          critical: 'critical',
          high: 'error',
          medium: 'warning',
          low: 'info'
        }
      },

      // Alert rules and thresholds
      rules: {
        errorRate: {
          threshold: 5.0, // 5%
          window: '5m',
          severity: 'critical',
          enabled: true
        },
        responseTime: {
          threshold: 2000, // 2 seconds
          window: '5m',
          severity: 'high',
          enabled: true
        },
        availability: {
          threshold: 99.0, // 99%
          window: '15m',
          severity: 'critical',
          enabled: true
        },
        webVitals: {
          lcp: { threshold: 4000, severity: 'medium' },
          fid: { threshold: 300, severity: 'medium' },
          cls: { threshold: 0.25, severity: 'low' }
        },
        customMetrics: {
          taskCreationFailure: {
            threshold: 10.0, // 10%
            window: '10m',
            severity: 'high'
          },
          habitTrackingLatency: {
            threshold: 1000, // 1 second
            window: '5m',
            severity: 'medium'
          }
        }
      }
    };

    writeFileSync(
      join(rootDir, 'monitoring-alerts.json'),
      JSON.stringify(alertConfig, null, 2)
    );

    console.log('✓ Alerting configuration generated');
  }

  generateMonitoringDashboard() {
    console.log('\n📊 Setting up Monitoring Dashboard...');

    const dashboardConfig = {
      grafana: {
        panels: [
          {
            title: 'Error Rate',
            type: 'stat',
            targets: ['error_rate_5m'],
            thresholds: [
              { color: 'green', value: 0 },
              { color: 'yellow', value: 1 },
              { color: 'red', value: 5 }
            ]
          },
          {
            title: 'Response Time',
            type: 'graph',
            targets: ['response_time_p95', 'response_time_p99'],
            yAxis: { unit: 'ms' }
          },
          {
            title: 'Web Vitals',
            type: 'heatmap',
            targets: ['web_vitals_lcp', 'web_vitals_fid', 'web_vitals_cls']
          },
          {
            title: 'User Activity',
            type: 'graph',
            targets: ['active_users', 'new_registrations', 'task_creations']
          },
          {
            title: 'System Health',
            type: 'table',
            targets: ['health_checks']
          }
        ],
        variables: [
          { name: 'environment', type: 'custom', options: ['production', 'staging', 'development'] },
          { name: 'timeRange', type: 'interval', default: '1h' }
        ]
      },

      datadog: {
        widgets: [
          {
            definition: {
              type: 'timeseries',
              title: 'Application Performance',
              requests: [
                { q: 'avg:webapp.response_time{environment:$environment}' },
                { q: 'avg:webapp.error_rate{environment:$environment}' }
              ]
            }
          },
          {
            definition: {
              type: 'query_value',
              title: 'Uptime',
              requests: [{ q: 'avg:webapp.uptime{environment:$environment}' }],
              autoscale: true,
              precision: 2
            }
          }
        ],
        template_variables: [
          { name: 'environment', default: 'production', prefix: 'environment' }
        ]
      }
    };

    writeFileSync(
      join(rootDir, 'monitoring-dashboard.json'),
      JSON.stringify(dashboardConfig, null, 2)
    );

    console.log('✓ Monitoring dashboard configuration generated');
  }

  generateReport() {
    console.log('\n📊 Monitoring Setup Report');
    console.log('==========================');

    console.log('✅ Monitoring Components Configured:');
    console.log('  • Sentry error tracking and performance monitoring');
    console.log('  • Web Vitals collection and reporting');
    console.log('  • Health check endpoints');
    console.log('  • Alerting rules and notification channels');
    console.log('  • Dashboard configurations');

    console.log('\n📋 Generated Files:');
    console.log('  • src/config/sentry.ts');
    console.log('  • src/config/webVitals.ts');
    console.log('  • src/config/healthCheck.ts');
    console.log('  • monitoring-alerts.json');
    console.log('  • monitoring-dashboard.json');

    console.log('\n🔧 Next Steps:');
    console.log('  1. Configure environment variables for Sentry, performance monitoring');
    console.log('  2. Set up alerting channels (Slack, email, PagerDuty)');
    console.log('  3. Import dashboard configurations to your monitoring platform');
    console.log('  4. Test alerting rules with synthetic errors');
    console.log('  5. Set up log aggregation and analysis');

    console.log('\n⚠️  Production Checklist:');
    console.log('  • VITE_SENTRY_DSN configured');
    console.log('  • VITE_WEB_VITALS_ENDPOINT configured');
    console.log('  • SLACK_WEBHOOK_URL configured for alerts');
    console.log('  • Error tracking tested and working');
    console.log('  • Performance monitoring active');
    console.log('  • Health checks accessible');
  }

  async run() {
    console.log('📊 Production Monitoring Setup');
    console.log('==============================');

    this.generateSentryConfig();
    this.generateWebVitalsConfig();
    this.generateHealthCheckEndpoint();
    this.generateAlertingConfig();
    this.generateMonitoringDashboard();
    this.generateReport();
  }
}

// Main execution
async function main() {
  const setup = new MonitoringSetup();
  await setup.run();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Production Monitoring Setup Script

Usage:
  node scripts/setup-monitoring.js

This script configures:
  - Sentry error tracking and performance monitoring
  - Web Vitals collection and reporting
  - Health check endpoints
  - Alerting rules and notification channels
  - Dashboard configurations for Grafana/Datadog

Prerequisites:
  - Sentry account and DSN
  - Performance monitoring endpoint
  - Notification channels (Slack, email, etc.)
`);
  process.exit(0);
}

main().catch(console.error);