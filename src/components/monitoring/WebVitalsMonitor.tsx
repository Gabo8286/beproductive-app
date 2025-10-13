import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

interface WebVitalsMonitorProps {
  /**
   * Callback to report metrics (e.g., to analytics service)
   * @param metric - The Web Vitals metric
   */
  onMetric?: (metric: Metric) => void;

  /**
   * Enable console logging for development
   * @default false in production, true in development
   */
  debug?: boolean;
}

/**
 * WebVitalsMonitor - Measures and reports Core Web Vitals
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Loading performance - should be < 2.5s
 * - INP (Interaction to Next Paint): Interactivity - should be < 200ms
 * - CLS (Cumulative Layout Shift): Visual stability - should be < 0.1
 *
 * Additional metrics:
 * - FCP (First Contentful Paint): First paint - should be < 1.8s
 * - TTFB (Time to First Byte): Server response - should be < 600ms
 */
export function WebVitalsMonitor({ onMetric, debug }: WebVitalsMonitorProps) {
  const isDevelopment = import.meta.env.MODE === 'development';
  const shouldLog = debug ?? isDevelopment;

  useEffect(() => {
    const reportMetric = (metric: Metric) => {
      // Log to console in debug mode
      if (shouldLog) {
        const rating = metric.rating || 'unknown';
        const color = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(
          `${color} [Web Vitals] ${metric.name}:`,
          Math.round(metric.value),
          metric.rating,
          metric
        );
      }

      // Send to analytics if callback provided
      if (onMetric) {
        onMetric(metric);
      }

      // In production, you might want to send to an analytics service
      // Example: sendToAnalytics(metric);
    };

    // Measure Core Web Vitals
    onCLS(reportMetric);  // Cumulative Layout Shift
    onINP(reportMetric);  // Interaction to Next Paint (replaces FID)
    onFCP(reportMetric);  // First Contentful Paint
    onLCP(reportMetric);  // Largest Contentful Paint
    onTTFB(reportMetric); // Time to First Byte
  }, [onMetric, shouldLog]);

  // This component doesn't render anything
  return null;
}

/**
 * Helper function to send metrics to an analytics service
 * Implement this based on your analytics provider (Google Analytics, Mixpanel, etc.)
 */
export function sendWebVitalsToAnalytics(metric: Metric) {
  // Example for Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // You can also log to your own backend
  // fetch('/api/web-vitals', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   headers: { 'Content-Type': 'application/json' }
  // });
}

/**
 * Check if Web Vitals metrics are within acceptable thresholds
 */
export function getWebVitalsThresholds() {
  return {
    // Core Web Vitals thresholds (Google's recommended values)
    LCP: { good: 2500, needsImprovement: 4000 },      // Largest Contentful Paint (ms)
    INP: { good: 200, needsImprovement: 500 },        // Interaction to Next Paint (ms)
    CLS: { good: 0.1, needsImprovement: 0.25 },       // Cumulative Layout Shift (score)

    // Additional performance metrics
    FCP: { good: 1800, needsImprovement: 3000 },      // First Contentful Paint (ms)
    TTFB: { good: 800, needsImprovement: 1800 },      // Time to First Byte (ms)
  };
}
