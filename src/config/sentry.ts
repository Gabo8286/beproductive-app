
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
    message: `${name}: ${value}ms (${rating})`,
    level: rating === 'poor' ? 'warning' : 'info',
    data: { name, value, rating }
  });

  if (rating === 'poor') {
    Sentry.captureMessage(`Poor ${name}: ${value}ms`, 'warning');
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
