import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Performance Regression Testing
 *
 * Compares current performance metrics against baseline measurements to detect:
 * - Performance regressions
 * - Memory leaks
 * - Resource loading degradation
 * - User interaction response time changes
 * - Bundle size increases
 */

interface PerformanceBaseline {
  timestamp: string;
  version: string;
  metrics: {
    loadTime: number;
    fcp: number;
    lcp: number;
    cls: number;
    memoryUsage: number;
    bundleRequests: number;
    interactionTime: number;
    renderTime: number;
  };
}

const BASELINE_FILE = join(process.cwd(), 'tests/performance/baseline.json');
const PERFORMANCE_THRESHOLD = 0.2; // 20% degradation threshold

test.describe('Performance Regression Testing', () => {
  let currentMetrics: PerformanceBaseline['metrics'];

  test.beforeAll(async () => {
    // Initialize metrics object
    currentMetrics = {
      loadTime: 0,
      fcp: 0,
      lcp: 0,
      cls: 0,
      memoryUsage: 0,
      bundleRequests: 0,
      interactionTime: 0,
      renderTime: 0
    };
  });

  test('should collect baseline performance metrics', async ({ page }) => {
    // Collect comprehensive performance metrics
    const startTime = performance.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = performance.now() - startTime;

    // Collect Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise<{ fcp: number; lcp: number; cls: number }>((resolve) => {
        let fcp = 0;
        let lcp = 0;
        let cls = 0;

        // Get FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) fcp = fcpEntry.startTime;

        // Get LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            lcp = entries[entries.length - 1].startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Get CLS
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve({ fcp, lcp, cls }), 1000);
      });
    });

    // Collect memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Count resource requests
    const resourceCount = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    // Test interaction response time
    const interactionStart = performance.now();
    await page.click('body');
    const interactionTime = performance.now() - interactionStart;

    // Test render performance
    const renderTest = await page.evaluate(() => {
      const startTime = performance.now();

      // Create and render test elements
      const container = document.createElement('div');
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.textContent = `Test element ${i}`;
        element.style.cssText = 'padding: 4px; border: 1px solid #ccc; margin: 2px;';
        container.appendChild(element);
      }

      document.body.appendChild(container);
      const renderTime = performance.now() - startTime;

      // Clean up
      document.body.removeChild(container);

      return renderTime;
    });

    // Update current metrics
    currentMetrics = {
      loadTime,
      fcp: webVitals.fcp,
      lcp: webVitals.lcp,
      cls: webVitals.cls,
      memoryUsage,
      bundleRequests: resourceCount,
      interactionTime,
      renderTime: renderTest
    };

    console.log('Current Performance Metrics:', currentMetrics);
  });

  test('should compare against baseline and detect regressions', async ({ page }) => {
    // Load existing baseline or create new one
    let baseline: PerformanceBaseline | null = null;

    if (existsSync(BASELINE_FILE)) {
      try {
        const baselineData = readFileSync(BASELINE_FILE, 'utf-8');
        baseline = JSON.parse(baselineData);
        console.log('Loaded baseline from:', baseline?.timestamp);
      } catch (error) {
        console.log('Could not load baseline file, creating new baseline');
      }
    }

    if (!baseline) {
      // Create new baseline
      baseline = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        metrics: { ...currentMetrics }
      };

      writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
      console.log('Created new performance baseline');

      // Skip comparison for first run
      return;
    }

    // Compare current metrics against baseline
    const regressions: string[] = [];
    const improvements: string[] = [];

    Object.entries(currentMetrics).forEach(([metric, currentValue]) => {
      const baselineValue = baseline!.metrics[metric as keyof typeof baseline.metrics];
      const change = (currentValue - baselineValue) / baselineValue;
      const changePercent = (change * 100).toFixed(1);

      console.log(`${metric}: ${currentValue.toFixed(2)} vs baseline ${baselineValue.toFixed(2)} (${changePercent}%)`);

      if (change > PERFORMANCE_THRESHOLD) {
        regressions.push(`${metric}: ${changePercent}% slower (${currentValue.toFixed(2)} vs ${baselineValue.toFixed(2)})`);
      } else if (change < -0.1) { // 10% improvement threshold
        improvements.push(`${metric}: ${Math.abs(parseFloat(changePercent))}% faster`);
      }
    });

    // Report results
    if (improvements.length > 0) {
      console.log('Performance Improvements:');
      improvements.forEach(improvement => console.log(`  ✅ ${improvement}`));
    }

    if (regressions.length > 0) {
      console.log('Performance Regressions:');
      regressions.forEach(regression => console.log(`  ❌ ${regression}`));

      // Fail test if significant regressions detected
      expect(regressions).toHaveLength(0);
    } else {
      console.log('✅ No significant performance regressions detected');
    }

    // Update baseline if performance improved
    if (improvements.length > 0 && regressions.length === 0) {
      const newBaseline: PerformanceBaseline = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        metrics: { ...currentMetrics }
      };

      writeFileSync(BASELINE_FILE, JSON.stringify(newBaseline, null, 2));
      console.log('📈 Updated baseline with improved performance metrics');
    }
  });

  test('should detect memory leaks over multiple page loads', async ({ page }) => {
    const memoryMeasurements: number[] = [];

    // Measure memory across multiple page loads
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Interact with the page
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      await page.waitForTimeout(500);

      const memory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      memoryMeasurements.push(memory);
      console.log(`Load ${i + 1} memory usage: ${(memory / 1024 / 1024).toFixed(2)}MB`);
    }

    // Analyze memory trend
    const firstMeasurement = memoryMeasurements[0];
    const lastMeasurement = memoryMeasurements[memoryMeasurements.length - 1];
    const memoryIncrease = lastMeasurement - firstMeasurement;
    const increasePercent = (memoryIncrease / firstMeasurement) * 100;

    console.log(`Memory analysis:
      - Initial: ${(firstMeasurement / 1024 / 1024).toFixed(2)}MB
      - Final: ${(lastMeasurement / 1024 / 1024).toFixed(2)}MB
      - Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);

    // Memory should not increase significantly across page loads
    expect(increasePercent).toBeLessThan(30); // Allow 30% variance
    expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // 20MB absolute limit
  });

  test('should monitor bundle size changes', async ({ page }) => {
    const resourceMetrics: Array<{ url: string; size: number; type: string }> = [];

    page.on('response', async (response) => {
      try {
        const url = response.url();
        const size = parseInt(response.headers()['content-length'] || '0');
        const type = response.headers()['content-type'] || 'unknown';

        if (url.includes('.js') || url.includes('.css')) {
          resourceMetrics.push({ url, size, type });
        }
      } catch (error) {
        // Ignore errors in response handling
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalBundleSize = resourceMetrics.reduce((total, resource) => total + resource.size, 0);
    const jsSize = resourceMetrics
      .filter(r => r.url.includes('.js'))
      .reduce((total, resource) => total + resource.size, 0);
    const cssSize = resourceMetrics
      .filter(r => r.url.includes('.css'))
      .reduce((total, resource) => total + resource.size, 0);

    console.log(`Bundle size analysis:
      - Total bundle size: ${(totalBundleSize / 1024).toFixed(2)}KB
      - JavaScript size: ${(jsSize / 1024).toFixed(2)}KB
      - CSS size: ${(cssSize / 1024).toFixed(2)}KB
      - Resource count: ${resourceMetrics.length}`);

    // Bundle size should be reasonable
    expect(totalBundleSize).toBeLessThan(5 * 1024 * 1024); // 5MB total
    expect(jsSize).toBeLessThan(3 * 1024 * 1024); // 3MB JS
    expect(cssSize).toBeLessThan(500 * 1024); // 500KB CSS

    // Store bundle metrics for comparison
    const bundleBaseline = {
      timestamp: new Date().toISOString(),
      totalSize: totalBundleSize,
      jsSize,
      cssSize,
      resourceCount: resourceMetrics.length
    };

    const bundleFile = join(process.cwd(), 'tests/performance/bundle-baseline.json');

    if (existsSync(bundleFile)) {
      try {
        const previousBundle = JSON.parse(readFileSync(bundleFile, 'utf-8'));
        const sizeIncrease = ((totalBundleSize - previousBundle.totalSize) / previousBundle.totalSize) * 100;

        console.log(`Bundle size change: ${sizeIncrease.toFixed(1)}% from previous measurement`);

        if (sizeIncrease > 10) {
          console.warn(`⚠️  Bundle size increased by ${sizeIncrease.toFixed(1)}%`);
        }
      } catch (error) {
        console.log('Could not compare with previous bundle size');
      }
    }

    writeFileSync(bundleFile, JSON.stringify(bundleBaseline, null, 2));
  });

  test('should track Core Web Vitals trends', async ({ page }) => {
    const vitalsResults: Array<{ fcp: number; lcp: number; cls: number; timestamp: string }> = [];

    // Collect multiple measurements
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const vitals = await page.evaluate(() => {
        return new Promise<{ fcp: number; lcp: number; cls: number }>((resolve) => {
          let fcp = 0;
          let lcp = 0;
          let cls = 0;

          // Get FCP
          const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
          if (fcpEntry) fcp = fcpEntry.startTime;

          // Get LCP
          let lcpObserver: PerformanceObserver | null = null;
          lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              lcp = entries[entries.length - 1].startTime;
            }
            lcpObserver?.disconnect();
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // Get CLS
          let clsObserver: PerformanceObserver | null = null;
          clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          setTimeout(() => {
            clsObserver?.disconnect();
            resolve({ fcp, lcp, cls });
          }, 2000);
        });
      });

      vitalsResults.push({
        ...vitals,
        timestamp: new Date().toISOString()
      });

      if (i < 2) {
        await page.waitForTimeout(1000);
      }
    }

    // Analyze Web Vitals consistency
    const avgFCP = vitalsResults.reduce((sum, v) => sum + v.fcp, 0) / vitalsResults.length;
    const avgLCP = vitalsResults.reduce((sum, v) => sum + v.lcp, 0) / vitalsResults.length;
    const avgCLS = vitalsResults.reduce((sum, v) => sum + v.cls, 0) / vitalsResults.length;

    const fcpVariance = Math.max(...vitalsResults.map(v => v.fcp)) - Math.min(...vitalsResults.map(v => v.fcp));
    const lcpVariance = Math.max(...vitalsResults.map(v => v.lcp)) - Math.min(...vitalsResults.map(v => v.lcp));

    console.log(`Web Vitals trend analysis:
      - Average FCP: ${avgFCP.toFixed(2)}ms (variance: ${fcpVariance.toFixed(2)}ms)
      - Average LCP: ${avgLCP.toFixed(2)}ms (variance: ${lcpVariance.toFixed(2)}ms)
      - Average CLS: ${avgCLS.toFixed(4)}`);

    // Vitals should be consistent
    expect(avgFCP).toBeLessThan(1800); // Good FCP
    expect(avgLCP).toBeLessThan(2500); // Good LCP
    expect(avgCLS).toBeLessThan(0.1);  // Good CLS

    // Variance should be low (consistent performance)
    expect(fcpVariance).toBeLessThan(500); // FCP variance under 500ms
    expect(lcpVariance).toBeLessThan(1000); // LCP variance under 1s

    // Store trends for historical analysis
    const trendsFile = join(process.cwd(), 'tests/performance/vitals-trends.json');
    let trends: any[] = [];

    if (existsSync(trendsFile)) {
      try {
        trends = JSON.parse(readFileSync(trendsFile, 'utf-8'));
      } catch (error) {
        console.log('Creating new trends file');
      }
    }

    trends.push({
      timestamp: new Date().toISOString(),
      avgFCP,
      avgLCP,
      avgCLS,
      variance: { fcp: fcpVariance, lcp: lcpVariance }
    });

    // Keep only last 30 measurements
    if (trends.length > 30) {
      trends = trends.slice(-30);
    }

    writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
  });
});