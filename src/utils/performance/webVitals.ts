import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  LCP: number | null;
  CLS: number | null;
  FCP: number | null;
  TTFB: number | null;
  INP: number | null;
}

export const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // 2.5 seconds
  CLS: 0.1,   // 0.1 score
  FCP: 1800,  // 1.8 seconds
  TTFB: 600,  // 600ms
  INP: 200,   // 200ms
  TTI: 3800,  // 3.8 seconds
} as const;

export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

export interface PerformanceEvent {
  metric: string;
  value: number;
  rating: PerformanceRating;
  delta: number;
  id: string;
  navigationType: string;
  metadata?: Record<string, any>;
}

/**
 * Get performance rating based on metric value and threshold
 */
export const getPerformanceRating = (
  value: number,
  goodThreshold: number,
  poorThreshold?: number
): PerformanceRating => {
  const poor = poorThreshold || goodThreshold * 2;
  
  if (value <= goodThreshold) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Send performance metric to analytics
 */
const sendToAnalytics = (metric: Metric) => {
  const event: PerformanceEvent = {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating as PerformanceRating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    metadata: {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
  };

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
    });
  }

  // Store in localStorage for dashboard
  const metricsKey = 'performance_metrics';
  try {
    const stored = localStorage.getItem(metricsKey);
    const metrics = stored ? JSON.parse(stored) : {};
    metrics[metric.name] = {
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
    };
    localStorage.setItem(metricsKey, JSON.stringify(metrics));
  } catch (error) {
    console.error('Failed to store performance metrics:', error);
  }

  // Send to backend analytics endpoint in production
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error('Failed to send performance metrics:', error);
    });
  }
};

/**
 * Initialize Core Web Vitals tracking
 */
export const initWebVitals = () => {
  try {
    // Cumulative Layout Shift
    onCLS(sendToAnalytics);

    // First Contentful Paint
    onFCP(sendToAnalytics);

    // Largest Contentful Paint
    onLCP(sendToAnalytics);

    // Time to First Byte
    onTTFB(sendToAnalytics);

    // Interaction to Next Paint (replaces FID)
    onINP(sendToAnalytics);

    console.log('[Performance] Web Vitals tracking initialized');
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
};

/**
 * Get stored performance metrics
 */
export const getStoredMetrics = (): PerformanceMetrics => {
  try {
    const stored = localStorage.getItem('performance_metrics');
    if (!stored) {
      return {
        LCP: null,
        CLS: null,
        FCP: null,
        TTFB: null,
        INP: null,
      };
    }

    const metrics = JSON.parse(stored);
    return {
      LCP: metrics.LCP?.value || null,
      CLS: metrics.CLS?.value || null,
      FCP: metrics.FCP?.value || null,
      TTFB: metrics.TTFB?.value || null,
      INP: metrics.INP?.value || null,
    };
  } catch (error) {
    console.error('Failed to retrieve stored metrics:', error);
    return {
      LCP: null,
      CLS: null,
      FCP: null,
      TTFB: null,
      INP: null,
    };
  }
};

/**
 * Clear stored performance metrics
 */
export const clearStoredMetrics = () => {
  try {
    localStorage.removeItem('performance_metrics');
  } catch (error) {
    console.error('Failed to clear stored metrics:', error);
  }
};

/**
 * Get performance score (0-100)
 */
export const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  let score = 0;
  let count = 0;

  if (metrics.LCP !== null) {
    score += metrics.LCP <= PERFORMANCE_BUDGETS.LCP ? 100 : 
             metrics.LCP <= PERFORMANCE_BUDGETS.LCP * 2 ? 50 : 0;
    count++;
  }

  if (metrics.INP !== null) {
    score += metrics.INP <= PERFORMANCE_BUDGETS.INP ? 100 : 
             metrics.INP <= PERFORMANCE_BUDGETS.INP * 2 ? 50 : 0;
    count++;
  }

  if (metrics.CLS !== null) {
    score += metrics.CLS <= PERFORMANCE_BUDGETS.CLS ? 100 : 
             metrics.CLS <= PERFORMANCE_BUDGETS.CLS * 2.5 ? 50 : 0;
    count++;
  }

  if (metrics.FCP !== null) {
    score += metrics.FCP <= PERFORMANCE_BUDGETS.FCP ? 100 : 
             metrics.FCP <= PERFORMANCE_BUDGETS.FCP * 2 ? 50 : 0;
    count++;
  }

  return count > 0 ? Math.round(score / count) : 0;
};
