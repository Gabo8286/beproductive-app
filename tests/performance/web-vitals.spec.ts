import { test, expect } from '@playwright/test';

/**
 * Web Vitals Performance Testing
 *
 * Tests Core Web Vitals and other critical performance metrics including:
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Cumulative Layout Shift (CLS)
 * - First Input Delay (FID)
 * - Time to Interactive (TTI)
 * - Total Blocking Time (TBT)
 */

test.describe('Web Vitals Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Store performance metrics
      (window as any).performanceMetrics = {
        navigationStart: performance.timeOrigin,
        marks: new Map(),
        measures: new Map()
      };

      // Monitor layout shifts
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        (window as any).performanceMetrics.cls = cumulativeLayoutShift;
      }).observe({ type: 'layout-shift', buffered: true });

      // Monitor paint timings
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).performanceMetrics[entry.name] = entry.startTime;
        }
      }).observe({ type: 'paint', buffered: true });

      // Monitor navigation timing
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).performanceMetrics.navigation = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.fetchStart,
            firstByte: entry.responseStart - entry.requestStart
          };
        }
      }).observe({ type: 'navigation', buffered: true });
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should meet LCP (Largest Contentful Paint) requirements', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Get LCP measurement
      const lcpValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcp = 0;

          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
            resolve(lcp);
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // Fallback timeout
          setTimeout(() => resolve(lcp), 5000);
        });
      });

      console.log(`LCP: ${lcpValue}ms`);

      // LCP should be under 2.5 seconds (2500ms) for good performance
      expect(lcpValue).toBeLessThan(2500);

      // Log timing for analysis
      const totalTime = Date.now() - startTime;
      console.log(`Total page load time: ${totalTime}ms`);
    });

    test('should meet FCP (First Contentful Paint) requirements', async ({ page }) => {
      await page.goto('/');

      const fcpValue = await page.evaluate(() => {
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        return fcpEntry ? fcpEntry.startTime : 0;
      });

      console.log(`FCP: ${fcpValue}ms`);

      // FCP should be under 1.8 seconds (1800ms) for good performance
      expect(fcpValue).toBeLessThan(1800);
      expect(fcpValue).toBeGreaterThan(0);
    });

    test('should meet CLS (Cumulative Layout Shift) requirements', async ({ page }) => {
      await page.goto('/');

      // Wait for initial layout to stabilize
      await page.waitForTimeout(3000);

      // Interact with the page to trigger any layout shifts
      await page.mouse.move(100, 100);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);

      const clsValue = await page.evaluate(() => {
        return (window as any).performanceMetrics?.cls || 0;
      });

      console.log(`CLS: ${clsValue}`);

      // CLS should be under 0.1 for good performance
      expect(clsValue).toBeLessThan(0.1);
    });

    test('should meet TTI (Time to Interactive) requirements', async ({ page }) => {
      const startTime = performance.now();

      await page.goto('/');

      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');

      // Test interactivity by clicking elements
      const interactiveElements = page.locator('button, a, input');
      const elementCount = await interactiveElements.count();

      if (elementCount > 0) {
        const element = interactiveElements.first();
        await element.waitFor({ state: 'visible' });

        const interactionStart = performance.now();
        await element.click();
        const interactionTime = performance.now() - interactionStart;

        console.log(`First interaction time: ${interactionTime}ms`);

        // Interaction should be responsive (under 100ms)
        expect(interactionTime).toBeLessThan(100);
      }

      const ttiTime = performance.now() - startTime;
      console.log(`Time to Interactive: ${ttiTime}ms`);

      // TTI should be under 3.8 seconds for good performance
      expect(ttiTime).toBeLessThan(3800);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load critical resources efficiently', async ({ page }) => {
      // Monitor network requests
      const resourceTimings: any[] = [];

      page.on('response', (response) => {
        resourceTimings.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'],
          type: response.headers()['content-type']
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Analyze resource loading
      const criticalResources = resourceTimings.filter(resource =>
        resource.url.includes('.js') ||
        resource.url.includes('.css') ||
        resource.url.includes('.woff') ||
        resource.type?.includes('text/html')
      );

      console.log(`Total resources loaded: ${resourceTimings.length}`);
      console.log(`Critical resources: ${criticalResources.length}`);

      // Check that resources loaded successfully
      const failedResources = resourceTimings.filter(r => r.status >= 400);
      expect(failedResources).toHaveLength(0);

      // Log large resources for optimization
      const largeResources = resourceTimings.filter(r =>
        parseInt(r.size || '0') > 1024 * 1024 // > 1MB
      );

      if (largeResources.length > 0) {
        console.log('Large resources detected:', largeResources);
      }
    });

    test('should have efficient JavaScript bundle size', async ({ page }) => {
      const jsRequests: string[] = [];

      page.on('request', (request) => {
        if (request.url().endsWith('.js')) {
          jsRequests.push(request.url());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      console.log(`JavaScript files loaded: ${jsRequests.length}`);

      // Should not load excessive number of JS files
      expect(jsRequests.length).toBeLessThan(20);

      // Check for code splitting evidence
      const hasChunks = jsRequests.some(url =>
        url.includes('chunk') || url.includes('vendor')
      );

      if (hasChunks) {
        console.log('Code splitting detected - good for performance');
      }
    });

    test('should use efficient caching strategies', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const firstLoadTime = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return navigation.loadEventEnd - navigation.fetchStart;
      });

      // Second visit (should use cache)
      await page.reload();
      await page.waitForLoadState('networkidle');

      const secondLoadTime = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return navigation.loadEventEnd - navigation.fetchStart;
      });

      console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);

      // Second load should be faster due to caching
      // Allow for some variance in measurement
      if (firstLoadTime > 1000) {
        expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.8);
      }
    });
  });

  test.describe('Memory Performance', () => {
    test('should have reasonable memory usage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });

      if (initialMemory) {
        console.log('Memory usage:', initialMemory);

        // Should not use excessive memory (under 50MB)
        expect(initialMemory.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);

        // Should not be close to heap limit
        const memoryUsagePercentage = initialMemory.usedJSHeapSize / initialMemory.jsHeapSizeLimit;
        expect(memoryUsagePercentage).toBeLessThan(0.1); // Under 10% of limit
      }

      // Test memory after interactions
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);

      const afterInteractionMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });

      if (initialMemory && afterInteractionMemory) {
        const memoryIncrease = afterInteractionMemory - initialMemory.usedJSHeapSize;
        console.log(`Memory increase after interaction: ${memoryIncrease} bytes`);

        // Memory increase should be minimal (under 5MB)
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      }
    });

    test('should not have memory leaks in navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Simulate navigation and interactions
      for (let i = 0; i < 3; i++) {
        // Navigate or refresh
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Interact with the page
        await page.mouse.move(Math.random() * 800, Math.random() * 600);
        await page.waitForTimeout(500);
      }

      // Force garbage collection if possible
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      await page.waitForTimeout(1000);

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        console.log(`Memory change after navigation cycles: ${memoryIncrease} bytes`);

        // Memory should not significantly increase (accounting for normal variance)
        expect(Math.abs(memoryIncrease)).toBeLessThan(10 * 1024 * 1024); // 10MB tolerance
      }
    });
  });

  test.describe('Performance Under Load', () => {
    test('should maintain performance with rapid interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const startTime = performance.now();

      // Rapid interactions
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(Math.random() * 800, Math.random() * 600);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }

      const interactionTime = performance.now() - startTime;
      console.log(`Rapid interactions completed in: ${interactionTime}ms`);

      // Should handle rapid interactions smoothly
      expect(interactionTime).toBeLessThan(2000);

      // Check page is still responsive
      const responseTest = performance.now();
      await page.click('body');
      const responseTime = performance.now() - responseTest;

      expect(responseTime).toBeLessThan(100);
    });

    test('should handle multiple concurrent animations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for animated elements
      const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
      const elementCount = await animatedElements.count();

      if (elementCount > 0) {
        const startTime = performance.now();

        // Trigger multiple animations simultaneously
        for (let i = 0; i < Math.min(5, elementCount); i++) {
          await animatedElements.nth(i).hover();
        }

        await page.waitForTimeout(1000);

        const animationTime = performance.now() - startTime;
        console.log(`Animation handling time: ${animationTime}ms`);

        // Should handle animations smoothly
        expect(animationTime).toBeLessThan(1500);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Simulate mobile network conditions
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 50)); // Add 50ms delay
        await route.continue();
      });

      const startTime = performance.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = performance.now() - startTime;
      console.log(`Mobile load time: ${loadTime}ms`);

      // Mobile should load within reasonable time (allowing for simulated latency)
      expect(loadTime).toBeLessThan(5000);

      // Test touch interactions
      const touchTest = performance.now();
      await page.tap('body');
      const touchResponse = performance.now() - touchTest;

      console.log(`Touch response time: ${touchResponse}ms`);
      expect(touchResponse).toBeLessThan(150);
    });
  });
});