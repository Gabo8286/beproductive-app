# Performance Profiler Agent ⚡

## Purpose
Monitor and analyze application performance in real-time, identify bottlenecks, and provide actionable optimization recommendations. This agent tracks Core Web Vitals, database performance, memory usage, and provides detailed performance insights.

## Capabilities
- Real-time performance metrics monitoring
- Core Web Vitals tracking (LCP, FID, CLS)
- Memory leak detection and analysis
- Database query performance profiling
- Bundle size analysis and optimization
- API response time monitoring
- Resource loading optimization
- Performance regression detection
- Automated performance testing
- Custom performance metrics collection

## Tech Stack & Tools
- **Performance Monitoring**: Lighthouse, Web Vitals
- **Profiling**: Chrome DevTools, React DevTools Profiler
- **Metrics Collection**: Performance Observer API, Navigation Timing API
- **Analytics**: Google Analytics 4, Custom metrics
- **Bundle Analysis**: webpack-bundle-analyzer, Vite Bundle Visualizer
- **Database Profiling**: Supabase Performance Insights
- **Monitoring**: Grafana, DataDog, New Relic
- **Testing**: Lighthouse CI, SpeedCurve

## Performance Testing Templates

### 1. Core Web Vitals Monitoring
```typescript
import { describe, it, expect } from 'vitest';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

describe('Core Web Vitals Performance', () => {
  interface VitalMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  }

  const vitalThresholds = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 },   // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }  // Time to First Byte
  };

  function getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  it('should meet LCP (Largest Contentful Paint) threshold', (done) => {
    getLCP((metric) => {
      const rating = getRating(metric.value, vitalThresholds.LCP);
      expect(rating).toBe('good');
      expect(metric.value).toBeLessThan(vitalThresholds.LCP.good);
      done();
    });
  });

  it('should meet FID (First Input Delay) threshold', (done) => {
    getFID((metric) => {
      const rating = getRating(metric.value, vitalThresholds.FID);
      expect(rating).toBe('good');
      expect(metric.value).toBeLessThan(vitalThresholds.FID.good);
      done();
    });
  });

  it('should meet CLS (Cumulative Layout Shift) threshold', (done) => {
    getCLS((metric) => {
      const rating = getRating(metric.value, vitalThresholds.CLS);
      expect(rating).toBe('good');
      expect(metric.value).toBeLessThan(vitalThresholds.CLS.good);
      done();
    });
  });

  it('should track performance metrics over time', async () => {
    const metrics = await collectPerformanceMetrics();

    expect(metrics.loadTime).toBeLessThan(3000);
    expect(metrics.timeToInteractive).toBeLessThan(5000);
    expect(metrics.firstContentfulPaint).toBeLessThan(1800);
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });
});

async function collectPerformanceMetrics() {
  return new Promise<PerformanceMetrics>((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const navigationEntry = entries.find(entry => entry.entryType === 'navigation') as PerformanceNavigationTiming;

      if (navigationEntry) {
        resolve({
          loadTime: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
          timeToInteractive: navigationEntry.domInteractive - navigationEntry.navigationStart,
          firstContentfulPaint: entries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart
        });
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });
  });
}
```

### 2. Memory Usage Monitoring
```typescript
import { describe, it, expect } from 'vitest';

describe('Memory Performance', () => {
  interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }

  it('should not have memory leaks in component lifecycle', async () => {
    const initialMemory = getMemoryUsage();

    // Simulate component mounting and unmounting
    for (let i = 0; i < 100; i++) {
      const component = render(<TestComponent />);
      component.unmount();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  it('should maintain healthy memory usage patterns', () => {
    const memoryInfo = getMemoryUsage();

    // Used memory should not exceed 80% of available heap
    const usagePercentage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
    expect(usagePercentage).toBeLessThan(0.8);

    // Total heap should not be close to the limit
    const heapUtilization = memoryInfo.totalJSHeapSize / memoryInfo.jsHeapSizeLimit;
    expect(heapUtilization).toBeLessThan(0.9);
  });

  function getMemoryUsage(): MemoryInfo {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }
});
```

### 3. Database Performance Testing
```typescript
import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Database Performance', () => {
  it('should execute queries within acceptable time limits', async () => {
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(100);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(500); // Query should complete in < 500ms
  });

  it('should handle large dataset queries efficiently', async () => {
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .range(0, 1000);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(1000); // Large query should complete in < 1s
  });

  it('should optimize complex joins and aggregations', async () => {
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects(id, name),
        task_assignments(
          users(id, name)
        )
      `)
      .limit(50);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(800); // Complex join should complete in < 800ms
  });

  it('should maintain connection pool efficiency', async () => {
    const queries = [];

    // Execute 20 concurrent queries
    for (let i = 0; i < 20; i++) {
      queries.push(
        supabase.from('tasks').select('id').limit(1)
      );
    }

    const startTime = performance.now();
    const results = await Promise.all(queries);
    const endTime = performance.now();

    const totalTime = endTime - startTime;

    // All queries should complete successfully
    results.forEach(result => {
      expect(result.error).toBeNull();
    });

    // Concurrent queries should not take much longer than a single query
    expect(totalTime).toBeLessThan(2000);
  });
});
```

### 4. Bundle Size Analysis
```typescript
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

describe('Bundle Performance', () => {
  it('should maintain acceptable bundle sizes', async () => {
    // Build the project
    await execAsync('npm run build');

    // Analyze bundle sizes
    const bundleStats = await analyzeBundleSize('./dist');

    expect(bundleStats.mainBundle).toBeLessThan(500 * 1024); // < 500KB
    expect(bundleStats.vendorBundle).toBeLessThan(1024 * 1024); // < 1MB
    expect(bundleStats.totalSize).toBeLessThan(2 * 1024 * 1024); // < 2MB
  });

  it('should implement code splitting effectively', async () => {
    const bundleStats = await analyzeBundleSize('./dist');

    // Should have multiple chunks for code splitting
    expect(bundleStats.chunkCount).toBeGreaterThan(3);

    // No single chunk should be too large
    bundleStats.chunks.forEach(chunk => {
      expect(chunk.size).toBeLessThan(300 * 1024); // < 300KB per chunk
    });
  });

  it('should optimize asset compression', async () => {
    const assetStats = await analyzeAssetCompression('./dist');

    // Assets should be properly compressed
    assetStats.compressibleAssets.forEach(asset => {
      expect(asset.compressionRatio).toBeGreaterThan(0.7); // > 70% compression
    });
  });

  async function analyzeBundleSize(distPath: string) {
    const files = await fs.readdir(distPath, { recursive: true });
    const jsFiles = files.filter(f => f.endsWith('.js'));

    let totalSize = 0;
    let mainBundle = 0;
    let vendorBundle = 0;
    const chunks = [];

    for (const file of jsFiles) {
      const stats = await fs.stat(`${distPath}/${file}`);
      const size = stats.size;
      totalSize += size;

      if (file.includes('main')) {
        mainBundle = size;
      } else if (file.includes('vendor')) {
        vendorBundle = size;
      } else {
        chunks.push({ name: file, size });
      }
    }

    return {
      totalSize,
      mainBundle,
      vendorBundle,
      chunkCount: jsFiles.length,
      chunks
    };
  }
});
```

### 5. API Performance Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('API Performance', () => {
  const API_BASE_URL = process.env.VITE_API_URL;

  it('should respond to API calls within acceptable time', async () => {
    const endpoints = [
      '/api/auth/user',
      '/api/tasks',
      '/api/projects',
      '/api/dashboard/metrics'
    ];

    for (const endpoint of endpoints) {
      const startTime = performance.now();

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: 'Bearer test-token' }
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(300); // < 300ms response time
    }
  });

  it('should handle concurrent API requests efficiently', async () => {
    const requests = [];

    // Generate 50 concurrent requests
    for (let i = 0; i < 50; i++) {
      requests.push(
        axios.get(`${API_BASE_URL}/api/tasks`)
      );
    }

    const startTime = performance.now();
    const responses = await Promise.all(requests);
    const endTime = performance.now();

    const totalTime = endTime - startTime;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Concurrent requests should not cause significant delays
    expect(totalTime).toBeLessThan(5000); // < 5 seconds for 50 requests
  });

  it('should implement efficient data pagination', async () => {
    const pageSize = 20;
    const pages = [];

    // Load multiple pages
    for (let page = 1; page <= 5; page++) {
      const startTime = performance.now();

      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        params: { page, limit: pageSize }
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      pages.push({ page, responseTime, itemCount: response.data.length });

      expect(responseTime).toBeLessThan(400); // Each page < 400ms
    }

    // Response times should be consistent across pages
    const avgResponseTime = pages.reduce((sum, p) => sum + p.responseTime, 0) / pages.length;
    pages.forEach(page => {
      expect(page.responseTime).toBeLessThan(avgResponseTime * 1.5);
    });
  });
});
```

## Real-time Performance Monitoring

### Performance Metrics Collection
```typescript
class PerformanceCollector {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  startMonitoring(): void {
    // Monitor navigation timing
    this.observeNavigationTiming();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor long tasks
    this.observeLongTasks();

    // Monitor layout shifts
    this.observeLayoutShifts();

    // Monitor user interactions
    this.observeUserTiming();
  }

  private observeNavigationTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.recordMetric({
            type: 'navigation',
            name: 'page_load',
            value: entry.loadEventEnd - entry.loadEventStart,
            timestamp: Date.now()
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric({
          type: 'resource',
          name: entry.name,
          value: entry.responseEnd - entry.responseStart,
          size: (entry as PerformanceResourceTiming).transferSize,
          timestamp: Date.now()
        });
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observeLongTasks(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric({
          type: 'long_task',
          name: 'blocking_task',
          value: entry.duration,
          timestamp: Date.now()
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  generateReport(): PerformanceReport {
    return {
      summary: this.calculateSummary(),
      coreWebVitals: this.getCoreWebVitals(),
      resourceBreakdown: this.getResourceBreakdown(),
      longTasks: this.getLongTasks(),
      recommendations: this.generateRecommendations()
    };
  }
}
```

### Performance Dashboard
```typescript
interface PerformanceDashboard {
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  };
  resources: {
    totalSize: number;
    totalRequests: number;
    cachedRequests: number;
    slowestResource: string;
  };
  errors: {
    jsErrors: number;
    networkErrors: number;
    performanceIssues: number;
  };
  trends: {
    performanceScore: number;
    improvement: number;
    regression: string[];
  };
}

class PerformanceMonitor {
  private dashboard: PerformanceDashboard;

  async updateDashboard(): Promise<void> {
    const [metrics, resources, errors] = await Promise.all([
      this.collectCoreMetrics(),
      this.analyzeResources(),
      this.collectErrors()
    ]);

    this.dashboard = {
      metrics,
      resources,
      errors,
      trends: await this.analyzeTrends()
    };

    await this.checkThresholds();
    await this.sendAlerts();
  }

  private async checkThresholds(): Promise<void> {
    const thresholds = {
      loadTime: 3000,
      firstContentfulPaint: 1800,
      largestContentfulPaint: 2500,
      firstInputDelay: 100,
      cumulativeLayoutShift: 0.1
    };

    const violations = [];

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      if (this.dashboard.metrics[metric] > threshold) {
        violations.push({
          metric,
          actual: this.dashboard.metrics[metric],
          threshold,
          severity: this.calculateSeverity(metric, this.dashboard.metrics[metric], threshold)
        });
      }
    });

    if (violations.length > 0) {
      await this.alertPerformanceTeam(violations);
    }
  }
}
```

## Automated Performance Testing

### Lighthouse CI Integration
```typescript
class LighthousePerformanceTester {
  async runPerformanceAudit(url: string): Promise<LighthouseResult> {
    const lighthouse = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    return this.processLighthouseResults(runnerResult);
  }

  private processLighthouseResults(result: any): LighthouseResult {
    const performance = result.categories.performance;
    const audits = result.audits;

    return {
      score: performance.score * 100,
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        firstInputDelay: audits['max-potential-fid'].numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
        timeToInteractive: audits['interactive'].numericValue
      },
      opportunities: this.extractOptimizationOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits)
    };
  }
}
```

### Performance Regression Detection
```typescript
class PerformanceRegressionDetector {
  private historicalData: PerformanceBaseline[] = [];

  async detectRegressions(currentMetrics: PerformanceMetrics): Promise<RegressionReport> {
    const baseline = await this.getBaseline();
    const regressions = [];

    const criticalMetrics = [
      'firstContentfulPaint',
      'largestContentfulPaint',
      'firstInputDelay',
      'cumulativeLayoutShift'
    ];

    criticalMetrics.forEach(metric => {
      const current = currentMetrics[metric];
      const baselineValue = baseline[metric];
      const threshold = this.getRegressionThreshold(metric);

      const regression = ((current - baselineValue) / baselineValue) * 100;

      if (regression > threshold) {
        regressions.push({
          metric,
          baseline: baselineValue,
          current,
          regression: regression,
          severity: this.calculateRegressionSeverity(regression)
        });
      }
    });

    return {
      hasRegressions: regressions.length > 0,
      regressions,
      overallScore: this.calculateOverallScore(currentMetrics),
      recommendations: this.generateRegressionRecommendations(regressions)
    };
  }

  private getRegressionThreshold(metric: string): number {
    const thresholds = {
      firstContentfulPaint: 10, // 10% regression threshold
      largestContentfulPaint: 15,
      firstInputDelay: 20,
      cumulativeLayoutShift: 25
    };

    return thresholds[metric] || 15;
  }
}
```

## Success Criteria

### Performance Metrics Targets
- **Page Load Time**: < 3 seconds on 3G
- **First Contentful Paint**: < 1.8 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 5 seconds

### Key Performance Indicators
1. **Lighthouse Performance Score**: > 90
2. **Core Web Vitals Pass Rate**: > 95%
3. **Bundle Size Growth**: < 5% per month
4. **API Response Time**: < 300ms (P95)
5. **Memory Usage**: < 100MB peak usage

## Usage Examples

### Run Performance Tests
```bash
# Run all performance tests
npm run performance:test

# Generate Lighthouse audit
npm run performance:lighthouse

# Analyze bundle size
npm run performance:bundle-analysis

# Monitor Core Web Vitals
npm run performance:vitals
```

### Continuous Performance Monitoring
```typescript
// Monitor performance continuously
const monitor = new PerformanceMonitor();
monitor.startContinuousMonitoring({
  interval: 60000, // 1 minute
  metrics: ['vitals', 'memory', 'network'],
  alertThresholds: {
    lcp: 2500,
    fid: 100,
    cls: 0.1
  }
});
```

## Best Practices

1. **Real User Monitoring**: Collect performance data from actual users
2. **Performance Budgets**: Set and enforce performance limits
3. **Continuous Monitoring**: Track performance trends over time
4. **A/B Testing**: Measure performance impact of changes
5. **Optimization Prioritization**: Focus on metrics that impact user experience
6. **Regular Audits**: Schedule automated performance assessments

## Related Agents
- **Load Tester Agent**: For stress testing performance
- **Code Quality Guardian Agent**: For performance code reviews
- **UX Evaluator Agent**: For user experience metrics
- **Reliability Monitor Agent**: For performance stability