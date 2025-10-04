import { monitoring } from './monitoring';

/**
 * Advanced Production Performance Monitoring
 * Extends the base monitoring system with enterprise-grade features
 * including real-time alerts, performance budgets, and predictive analytics
 */

export interface PerformanceBudget {
  name: string;
  thresholds: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint (ms)
    ttfb: number; // Time to First Byte (ms)
  };
  alerts: {
    enabled: boolean;
    email?: string;
    webhook?: string;
  };
}

export interface PerformanceAlert {
  id: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  userAgent: string;
  userId?: string;
}

export interface TrendData {
  metric: string;
  values: Array<{ timestamp: number; value: number }>;
  trend: 'improving' | 'degrading' | 'stable';
  prediction: {
    nextValue: number;
    confidence: number;
  };
}

class AdvancedPerformanceMonitoring {
  private performanceBudgets: Map<string, PerformanceBudget> = new Map();
  private alerts: PerformanceAlert[] = [];
  private trendData: Map<string, TrendData> = new Map();
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  constructor() {
    this.initializeDefaultBudgets();
    this.setupAdvancedObservers();
  }

  private initializeDefaultBudgets() {
    const defaultBudget: PerformanceBudget = {
      name: 'production-default',
      thresholds: {
        lcp: 2500,  // 2.5s
        fid: 100,   // 100ms
        cls: 0.1,   // 0.1
        fcp: 1800,  // 1.8s
        ttfb: 600   // 600ms
      },
      alerts: {
        enabled: true
      }
    };

    this.performanceBudgets.set('default', defaultBudget);
  }

  private setupAdvancedObservers() {
    // Enhanced Web Vitals monitoring with budget checking
    if ('PerformanceObserver' in window) {
      // Long Task monitoring for main thread blocking
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Long task threshold
            this.reportLongTask({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
              timestamp: Date.now(),
              url: window.location.href
            });
          }
        });
      }).observe({ entryTypes: ['longtask'] });

      // Layout Shift monitoring with detailed attribution
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.hadRecentInput) return; // Ignore user-initiated shifts

          this.checkPerformanceBudget('cls', entry.value);
          this.updateTrendData('cls', entry.value);

          if (entry.sources && entry.sources.length > 0) {
            this.reportLayoutShift({
              value: entry.value,
              sources: entry.sources.map((source: any) => ({
                element: source.node?.tagName || 'unknown',
                previousRect: source.previousRect,
                currentRect: source.currentRect
              })),
              timestamp: Date.now(),
              url: window.location.href
            });
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // Resource timing for third-party monitoring
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Monitor slow resources
          if (resourceEntry.duration > 1000) { // 1s threshold
            this.reportSlowResource({
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              type: this.getResourceType(resourceEntry.name),
              timestamp: Date.now()
            });
          }

          // Track third-party requests
          if (this.isThirdPartyResource(resourceEntry.name)) {
            this.reportThirdPartyRequest({
              domain: new URL(resourceEntry.name).hostname,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              timestamp: Date.now()
            });
          }
        });
      }).observe({ entryTypes: ['resource'] });
    }
  }

  public setPerformanceBudget(name: string, budget: PerformanceBudget) {
    this.performanceBudgets.set(name, budget);
  }

  public checkPerformanceBudget(metric: string, value: number, budgetName = 'default') {
    const budget = this.performanceBudgets.get(budgetName);
    if (!budget || !budget.alerts.enabled) return;

    const threshold = budget.thresholds[metric as keyof typeof budget.thresholds];
    if (threshold && value > threshold) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        metric,
        value,
        threshold,
        severity: this.calculateSeverity(value, threshold),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      this.triggerAlert(alert);
    }
  }

  private calculateSeverity(value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private triggerAlert(alert: PerformanceAlert) {
    this.alerts.push(alert);

    // Limit alert history
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });

    // Send to monitoring service
    monitoring.trackError(new Error(`Performance Budget Violation: ${alert.metric}`), {
      alert,
      performanceAlert: true
    });

    console.warn('⚠️ Performance Budget Violation:', alert);
  }

  public onAlert(callback: (alert: PerformanceAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  public updateTrendData(metric: string, value: number) {
    const existing = this.trendData.get(metric) || {
      metric,
      values: [],
      trend: 'stable' as const,
      prediction: { nextValue: value, confidence: 0.5 }
    };

    existing.values.push({ timestamp: Date.now(), value });

    // Keep last 50 data points
    if (existing.values.length > 50) {
      existing.values = existing.values.slice(-50);
    }

    // Calculate trend
    if (existing.values.length >= 5) {
      existing.trend = this.calculateTrend(existing.values);
      existing.prediction = this.predictNextValue(existing.values);
    }

    this.trendData.set(metric, existing);
  }

  private calculateTrend(values: Array<{ timestamp: number; value: number }>): TrendData['trend'] {
    if (values.length < 5) return 'stable';

    const recent = values.slice(-5);
    const older = values.slice(-10, -5);

    const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v.value, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'degrading';
    if (change < -0.1) return 'improving';
    return 'stable';
  }

  private predictNextValue(values: Array<{ timestamp: number; value: number }>): { nextValue: number; confidence: number } {
    if (values.length < 3) {
      return {
        nextValue: values[values.length - 1]?.value || 0,
        confidence: 0.3
      };
    }

    // Simple linear regression for prediction
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v.value, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextValue = slope * n + intercept;
    const confidence = Math.max(0.1, Math.min(0.9, 1 - Math.abs(slope) / 100));

    return { nextValue: Math.max(0, nextValue), confidence };
  }

  private reportLongTask(task: any) {
    monitoring.trackUserAction({
      action: 'long_task_detected',
      category: 'performance',
      label: task.name,
      value: task.duration,
      sessionId: '',
      timestamp: task.timestamp,
      properties: {
        duration: task.duration,
        startTime: task.startTime,
        url: task.url
      }
    });
  }

  private reportLayoutShift(shift: any) {
    monitoring.trackUserAction({
      action: 'layout_shift',
      category: 'performance',
      value: shift.value,
      sessionId: '',
      timestamp: shift.timestamp,
      properties: {
        value: shift.value,
        sources: shift.sources,
        url: shift.url
      }
    });
  }

  private reportSlowResource(resource: any) {
    monitoring.trackUserAction({
      action: 'slow_resource',
      category: 'performance',
      label: resource.type,
      value: resource.duration,
      sessionId: '',
      timestamp: resource.timestamp,
      properties: {
        name: resource.name,
        duration: resource.duration,
        size: resource.size,
        type: resource.type
      }
    });
  }

  private reportThirdPartyRequest(request: any) {
    monitoring.trackUserAction({
      action: 'third_party_request',
      category: 'performance',
      label: request.domain,
      value: request.duration,
      sessionId: '',
      timestamp: request.timestamp,
      properties: {
        domain: request.domain,
        duration: request.duration,
        size: request.size
      }
    });
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['js', 'mjs'].includes(extension)) return 'script';
    if (['css'].includes(extension)) return 'stylesheet';
    if (['woff', 'woff2', 'ttf', 'eot'].includes(extension)) return 'font';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';

    return 'other';
  }

  private isThirdPartyResource(url: string): boolean {
    try {
      const resourceDomain = new URL(url).hostname;
      const currentDomain = window.location.hostname;
      return resourceDomain !== currentDomain;
    } catch {
      return false;
    }
  }

  public getPerformanceInsights() {
    return {
      budgets: Array.from(this.performanceBudgets.entries()),
      alerts: this.alerts.slice(-20), // Last 20 alerts
      trends: Array.from(this.trendData.values()),
      summary: {
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
        activeBudgets: this.performanceBudgets.size,
        trackedMetrics: this.trendData.size
      }
    };
  }

  public generatePerformanceReport() {
    const insights = this.getPerformanceInsights();

    return {
      timestamp: new Date().toISOString(),
      summary: insights.summary,
      budgetCompliance: this.calculateBudgetCompliance(),
      trendAnalysis: this.analyzeTrends(),
      recommendations: this.generateRecommendations(),
      alerts: insights.alerts
    };
  }

  private calculateBudgetCompliance() {
    const compliance: Record<string, number> = {};

    this.performanceBudgets.forEach((budget, name) => {
      const relevantAlerts = this.alerts.filter(alert =>
        Object.keys(budget.thresholds).includes(alert.metric)
      );

      const violations = relevantAlerts.length;
      const totalChecks = Math.max(1, violations + 100); // Assume some successful checks

      compliance[name] = Math.max(0, ((totalChecks - violations) / totalChecks) * 100);
    });

    return compliance;
  }

  private analyzeTrends() {
    const analysis: Record<string, any> = {};

    this.trendData.forEach((trend, metric) => {
      analysis[metric] = {
        current: trend.values[trend.values.length - 1]?.value || 0,
        trend: trend.trend,
        prediction: trend.prediction,
        volatility: this.calculateVolatility(trend.values),
        recommendation: this.getTrendRecommendation(trend)
      };
    });

    return analysis;
  }

  private calculateVolatility(values: Array<{ value: number }>): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, v) => sum + v.value, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v.value - mean, 2), 0) / values.length;

    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private getTrendRecommendation(trend: TrendData): string {
    switch (trend.trend) {
      case 'degrading':
        return `${trend.metric} is degrading. Investigate recent changes and optimize performance.`;
      case 'improving':
        return `${trend.metric} is improving. Continue current optimization efforts.`;
      default:
        return `${trend.metric} is stable. Monitor for changes and maintain current performance.`;
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for frequent alerts
    const recentAlerts = this.alerts.filter(alert =>
      Date.now() - alert.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentAlerts.length > 10) {
      recommendations.push('High alert frequency detected. Review performance optimization strategy.');
    }

    // Check for critical alerts
    const criticalAlerts = recentAlerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Critical performance issues detected. Immediate attention required.');
    }

    // Check trends
    this.trendData.forEach((trend) => {
      if (trend.trend === 'degrading') {
        recommendations.push(`${trend.metric} performance is degrading. Consider optimization.`);
      }
    });

    return recommendations;
  }
}

// Export singleton instance
export const advancedMonitoring = new AdvancedPerformanceMonitoring();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  return {
    setPerformanceBudget: advancedMonitoring.setPerformanceBudget.bind(advancedMonitoring),
    onAlert: advancedMonitoring.onAlert.bind(advancedMonitoring),
    getInsights: advancedMonitoring.getPerformanceInsights.bind(advancedMonitoring),
    generateReport: advancedMonitoring.generatePerformanceReport.bind(advancedMonitoring)
  };
};

export default advancedMonitoring;