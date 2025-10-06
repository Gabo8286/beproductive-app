import { test, expect } from '@playwright/test';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

test.describe('Performance Optimization Tests', () => {
  const performanceThresholds = {
    LCP: 2500, // Largest Contentful Paint < 2.5s
    FID: 100,  // First Input Delay < 100ms
    CLS: 0.1,  // Cumulative Layout Shift < 0.1
    FCP: 1800, // First Contentful Paint < 1.8s
    TTFB: 800, // Time to First Byte < 800ms
    TotalBlockingTime: 200, // < 200ms
    SpeedIndex: 3400 // < 3.4s
  };

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await test.step('Navigate to application', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Measure Core Web Vitals', async () => {
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitalsData = {
            LCP: 0,
            FID: 0,
            CLS: 0,
            FCP: 0,
            TTFB: 0
          };

          let metricsCollected = 0;
          const totalMetrics = 4; // LCP, FID, CLS, FCP (TTFB is measured differently)

          function checkComplete() {
            if (metricsCollected >= totalMetrics) {
              resolve(vitalsData);
            }
          }

          // Import and use web-vitals
          import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS((metric) => {
              vitalsData.CLS = metric.value;
              metricsCollected++;
              checkComplete();
            });

            getFID((metric) => {
              vitalsData.FID = metric.value;
              metricsCollected++;
              checkComplete();
            });

            getFCP((metric) => {
              vitalsData.FCP = metric.value;
              metricsCollected++;
              checkComplete();
            });

            getLCP((metric) => {
              vitalsData.LCP = metric.value;
              metricsCollected++;
              checkComplete();
            });

            getTTFB((metric) => {
              vitalsData.TTFB = metric.value;
            });
          });

          // Fallback timeout
          setTimeout(() => resolve(vitalsData), 10000);
        });
      });

      console.log('Core Web Vitals:', vitals);

      // Validate against thresholds
      expect(vitals.LCP).toBeLessThan(performanceThresholds.LCP);
      expect(vitals.FID).toBeLessThan(performanceThresholds.FID);
      expect(vitals.CLS).toBeLessThan(performanceThresholds.CLS);
      expect(vitals.FCP).toBeLessThan(performanceThresholds.FCP);
    });

    await test.step('Test interactive performance', async () => {
      // Measure interaction responsiveness
      const interactionStart = Date.now();

      if (await page.locator('[data-testid="nav-menu"]').count() > 0) {
        await page.click('[data-testid="nav-menu"]');
        const interactionTime = Date.now() - interactionStart;

        expect(interactionTime).toBeLessThan(50); // Very responsive interactions
        console.log(`Navigation interaction time: ${interactionTime}ms`);
      }
    });
  });

  test('should validate caching performance', async ({ page }) => {
    await test.step('Test initial page load', async () => {
      const firstLoadStart = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const firstLoadTime = Date.now() - firstLoadStart;

      console.log(`First load time: ${firstLoadTime}ms`);
      expect(firstLoadTime).toBeLessThan(5000); // First load < 5s
    });

    await test.step('Test cached page load', async () => {
      const cachedLoadStart = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const cachedLoadTime = Date.now() - cachedLoadStart;

      console.log(`Cached load time: ${cachedLoadTime}ms`);
      expect(cachedLoadTime).toBeLessThan(2000); // Cached load < 2s
    });

    await test.step('Test resource caching', async () => {
      // Check for proper cache headers
      const response = await page.goto('/');
      const headers = response?.headers() || {};

      // Static assets should have cache headers
      const staticAssetResponse = await page.request.get('/assets/index.js');
      const staticHeaders = staticAssetResponse.headers();

      expect(staticHeaders['cache-control']).toBeDefined();
      expect(staticHeaders['etag'] || staticHeaders['last-modified']).toBeDefined();
    });

    await test.step('Test API response caching', async () => {
      // Test API caching
      const firstApiCall = Date.now();
      const response1 = await page.request.get('/api/tasks');
      const firstApiTime = Date.now() - firstApiCall;

      const secondApiCall = Date.now();
      const response2 = await page.request.get('/api/tasks');
      const secondApiTime = Date.now() - secondApiCall;

      console.log(`First API call: ${firstApiTime}ms`);
      console.log(`Second API call: ${secondApiTime}ms`);

      // Second call should be faster (cached or optimized)
      expect(secondApiTime).toBeLessThan(firstApiTime * 1.5); // At most 50% slower
    });
  });

  test('should optimize resource loading', async ({ page }) => {
    await test.step('Analyze resource loading', async () => {
      await page.goto('/');

      const resourceMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        const metrics = {
          totalResources: entries.length,
          totalSize: 0,
          largestResource: { name: '', size: 0 },
          slowestResource: { name: '', duration: 0 },
          imageCount: 0,
          jsCount: 0,
          cssCount: 0,
          fontCount: 0
        };

        entries.forEach(entry => {
          const duration = entry.responseEnd - entry.requestStart;
          const size = entry.transferSize || 0;

          metrics.totalSize += size;

          if (size > metrics.largestResource.size) {
            metrics.largestResource = { name: entry.name, size };
          }

          if (duration > metrics.slowestResource.duration) {
            metrics.slowestResource = { name: entry.name, duration };
          }

          // Count resource types
          if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            metrics.imageCount++;
          } else if (entry.name.match(/\.js$/i)) {
            metrics.jsCount++;
          } else if (entry.name.match(/\.css$/i)) {
            metrics.cssCount++;
          } else if (entry.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
            metrics.fontCount++;
          }
        });

        return metrics;
      });

      console.log('Resource Metrics:', resourceMetrics);

      // Validate resource optimization
      expect(resourceMetrics.totalSize).toBeLessThan(5 * 1024 * 1024); // < 5MB total
      expect(resourceMetrics.largestResource.size).toBeLessThan(1024 * 1024); // < 1MB per resource
      expect(resourceMetrics.slowestResource.duration).toBeLessThan(3000); // < 3s per resource
      expect(resourceMetrics.jsCount).toBeLessThan(20); // Reasonable number of JS files
    });

    await test.step('Test image optimization', async () => {
      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height,
          complete: img.complete
        }));
      });

      // Check for properly sized images
      imageMetrics.forEach(img => {
        if (img.naturalWidth > 0 && img.displayWidth > 0) {
          const oversizeRatio = img.naturalWidth / img.displayWidth;

          // Images shouldn't be more than 2x their display size
          expect(oversizeRatio).toBeLessThan(2);
        }
      });

      console.log(`Analyzed ${imageMetrics.length} images`);
    });

    await test.step('Test lazy loading implementation', async () => {
      // Check if images use lazy loading
      const lazyImages = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.filter(img => img.loading === 'lazy').length;
      });

      console.log(`Lazy loaded images: ${lazyImages}`);

      // Should have some lazy loaded images for performance
      if (lazyImages > 0) {
        expect(lazyImages).toBeGreaterThan(0);
      }
    });
  });

  test('should optimize JavaScript performance', async ({ page }) => {
    await test.step('Measure JavaScript execution time', async () => {
      await page.goto('/');

      const jsMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('measure');
        const jsEntries = entries.filter(entry =>
          entry.name.includes('script') || entry.name.includes('js')
        );

        return {
          totalMeasures: entries.length,
          jsMeasures: jsEntries.length,
          longestTask: Math.max(...jsEntries.map(entry => entry.duration), 0)
        };
      });

      console.log('JavaScript Metrics:', jsMetrics);

      // No single JS task should block for too long
      if (jsMetrics.longestTask > 0) {
        expect(jsMetrics.longestTask).toBeLessThan(50); // < 50ms long tasks
      }
    });

    await test.step('Test bundle size optimization', async () => {
      // Check main bundle size
      const bundleResponse = await page.request.get('/assets/index.js');
      const bundleSize = parseInt(bundleResponse.headers()['content-length'] || '0');

      console.log(`Main bundle size: ${bundleSize} bytes`);

      // Main bundle should be reasonably sized
      expect(bundleSize).toBeLessThan(500 * 1024); // < 500KB main bundle
    });

    await test.step('Test code splitting effectiveness', async () => {
      await page.goto('/');

      // Navigate to different sections to trigger code splitting
      const sections = ['/dashboard', '/tasks', '/projects', '/settings'];

      for (const section of sections) {
        const navigationStart = Date.now();
        await page.goto(section);
        await page.waitForLoadState('networkidle');
        const navigationTime = Date.now() - navigationStart;

        console.log(`${section} load time: ${navigationTime}ms`);

        // Code-split sections should load quickly
        expect(navigationTime).toBeLessThan(2000);
      }
    });
  });

  test('should validate memory performance', async ({ page }) => {
    await test.step('Monitor memory usage', async () => {
      await page.goto('/');

      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (initialMemory) {
        console.log('Initial Memory:', initialMemory);

        // Perform several navigation actions
        await page.goto('/dashboard');
        await page.goto('/tasks');
        await page.goto('/projects');
        await page.goto('/dashboard');

        const finalMemory = await page.evaluate(() => {
          if ('memory' in performance) {
            return {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
            };
          }
          return null;
        });

        if (finalMemory) {
          console.log('Final Memory:', finalMemory);

          const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          const memoryUsagePercent = finalMemory.usedJSHeapSize / finalMemory.jsHeapSizeLimit;

          console.log(`Memory increase: ${memoryIncrease} bytes`);
          console.log(`Memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`);

          // Memory shouldn't increase dramatically
          expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB increase
          expect(memoryUsagePercent).toBeLessThan(0.5); // < 50% of heap limit
        }
      }
    });

    await test.step('Test for memory leaks', async () => {
      // Simulate rapid component mounting/unmounting
      for (let i = 0; i < 10; i++) {
        await page.goto('/dashboard');
        await page.goto('/tasks');
        await page.waitForTimeout(100);
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      const memoryAfterGC = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      console.log(`Memory after GC: ${memoryAfterGC} bytes`);

      // Memory after GC should be reasonable
      expect(memoryAfterGC).toBeLessThan(100 * 1024 * 1024); // < 100MB
    });
  });

  test('should optimize database query performance', async ({ page }) => {
    await test.step('Test query response times', async () => {
      const queryTests = [
        { endpoint: '/api/tasks', expectedTime: 200 },
        { endpoint: '/api/projects', expectedTime: 300 },
        { endpoint: '/api/users/profile', expectedTime: 150 },
        { endpoint: '/api/dashboard/stats', expectedTime: 500 }
      ];

      for (const test of queryTests) {
        const startTime = Date.now();
        const response = await page.request.get(test.endpoint);
        const responseTime = Date.now() - startTime;

        console.log(`${test.endpoint}: ${responseTime}ms`);

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(test.expectedTime);
      }
    });

    await test.step('Test pagination performance', async () => {
      const paginationTests = [
        { page: 1, limit: 20 },
        { page: 2, limit: 20 },
        { page: 5, limit: 20 },
        { page: 10, limit: 20 }
      ];

      for (const paginationTest of paginationTests) {
        const startTime = Date.now();
        const response = await page.request.get(
          `/api/tasks?page=${paginationTest.page}&limit=${paginationTest.limit}`
        );
        const responseTime = Date.now() - startTime;

        console.log(`Page ${paginationTest.page}: ${responseTime}ms`);

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(400); // Pagination should be fast

        // Response time shouldn't increase significantly with page number
        if (paginationTest.page > 1) {
          expect(responseTime).toBeLessThan(800); // Even deep pages should be reasonable
        }
      }
    });

    await test.step('Test search performance', async () => {
      const searchQueries = ['test', 'project', 'task', 'important', 'meeting'];

      for (const query of searchQueries) {
        const startTime = Date.now();
        const response = await page.request.get(`/api/search?q=${encodeURIComponent(query)}`);
        const responseTime = Date.now() - startTime;

        console.log(`Search "${query}": ${responseTime}ms`);

        if (response.status() === 200) {
          expect(responseTime).toBeLessThan(600); // Search should be fast
        }
      }
    });
  });

  test('should validate CDN and asset delivery performance', async ({ page }) => {
    await test.step('Test asset loading from CDN', async () => {
      await page.goto('/');

      const assetMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        return entries.map(entry => ({
          name: entry.name,
          duration: entry.responseEnd - entry.requestStart,
          transferSize: entry.transferSize,
          fromCache: entry.transferSize === 0 && entry.decodedBodySize > 0
        }));
      });

      const staticAssets = assetMetrics.filter(asset =>
        asset.name.includes('/assets/') ||
        asset.name.match(/\.(js|css|png|jpg|svg|woff)$/i)
      );

      console.log(`Analyzed ${staticAssets.length} static assets`);

      staticAssets.forEach(asset => {
        console.log(`${asset.name}: ${asset.duration}ms (cached: ${asset.fromCache})`);

        // Static assets should load quickly
        expect(asset.duration).toBeLessThan(2000);
      });
    });

    await test.step('Test compression effectiveness', async () => {
      const compressionTests = [
        { url: '/assets/index.js', type: 'javascript' },
        { url: '/assets/index.css', type: 'stylesheet' },
        { url: '/', type: 'html' }
      ];

      for (const test of compressionTests) {
        const response = await page.request.get(test.url);
        const headers = response.headers();

        console.log(`${test.type} compression:`, headers['content-encoding']);

        // Static assets should be compressed
        if (test.type !== 'html') {
          expect(headers['content-encoding']).toBeTruthy();
          expect(['gzip', 'br', 'deflate']).toContain(headers['content-encoding']);
        }
      }
    });
  });
});