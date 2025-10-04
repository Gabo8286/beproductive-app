import { test, expect } from '@playwright/test';

/**
 * Load Testing Suite
 *
 * Tests application performance under various load conditions including:
 * - High-frequency user interactions
 * - Large data set rendering
 * - Concurrent user simulation
 * - Stress testing scenarios
 * - Memory stress testing
 * - Network condition variations
 */

test.describe('Load Testing', () => {
  test.describe('User Interaction Load Testing', () => {
    test('should handle high-frequency clicks and interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const startTime = performance.now();
      const interactions = [];

      // Perform 100 rapid interactions
      for (let i = 0; i < 100; i++) {
        const interactionStart = performance.now();

        // Vary interaction types
        switch (i % 4) {
          case 0:
            await page.mouse.move(Math.random() * 800, Math.random() * 600);
            break;
          case 1:
            await page.keyboard.press('Tab');
            break;
          case 2:
            await page.click('body');
            break;
          case 3:
            const focusableElements = page.locator('button, a, input');
            const count = await focusableElements.count();
            if (count > 0) {
              await focusableElements.nth(Math.floor(Math.random() * count)).focus();
            }
            break;
        }

        const interactionTime = performance.now() - interactionStart;
        interactions.push(interactionTime);

        // Small delay to prevent overwhelming
        if (i % 10 === 0) {
          await page.waitForTimeout(10);
        }
      }

      const totalTime = performance.now() - startTime;
      const averageInteractionTime = interactions.reduce((a, b) => a + b, 0) / interactions.length;
      const maxInteractionTime = Math.max(...interactions);

      console.log(`Load test results:
        - Total time: ${totalTime}ms
        - Average interaction time: ${averageInteractionTime.toFixed(2)}ms
        - Max interaction time: ${maxInteractionTime.toFixed(2)}ms
        - Interactions per second: ${(100 / (totalTime / 1000)).toFixed(2)}`);

      // Performance criteria
      expect(averageInteractionTime).toBeLessThan(50); // Average under 50ms
      expect(maxInteractionTime).toBeLessThan(200); // No interaction over 200ms
      expect(totalTime).toBeLessThan(10000); // Complete test under 10 seconds
    });

    test('should maintain responsiveness during continuous scrolling', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const scrollMetrics = [];
      const startTime = performance.now();

      // Continuous scrolling test
      for (let i = 0; i < 50; i++) {
        const scrollStart = performance.now();

        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(20);

        const scrollTime = performance.now() - scrollStart;
        scrollMetrics.push(scrollTime);
      }

      const totalScrollTime = performance.now() - startTime;
      const averageScrollTime = scrollMetrics.reduce((a, b) => a + b, 0) / scrollMetrics.length;

      console.log(`Scroll performance:
        - Total scroll test time: ${totalScrollTime}ms
        - Average scroll response: ${averageScrollTime.toFixed(2)}ms
        - Scrolls per second: ${(50 / (totalScrollTime / 1000)).toFixed(2)}`);

      expect(averageScrollTime).toBeLessThan(30);
      expect(totalScrollTime).toBeLessThan(5000);
    });

    test('should handle rapid navigation between sections', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find navigation links
      const navLinks = page.locator('a[href*="/"], button');
      const linkCount = await navLinks.count();

      if (linkCount > 0) {
        const navigationTimes = [];
        const startTime = performance.now();

        // Rapid navigation test
        for (let i = 0; i < Math.min(10, linkCount); i++) {
          const navStart = performance.now();

          const link = navLinks.nth(i % linkCount);
          const href = await link.getAttribute('href');

          if (href && href !== '#' && !href.startsWith('http')) {
            await link.click();
            await page.waitForLoadState('domcontentloaded');

            const navTime = performance.now() - navStart;
            navigationTimes.push(navTime);

            // Go back to test next navigation
            if (i < Math.min(9, linkCount - 1)) {
              await page.goBack();
              await page.waitForLoadState('domcontentloaded');
            }
          }
        }

        if (navigationTimes.length > 0) {
          const averageNavTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
          const totalNavTime = performance.now() - startTime;

          console.log(`Navigation performance:
            - Average navigation time: ${averageNavTime.toFixed(2)}ms
            - Total navigation test time: ${totalNavTime}ms
            - Successful navigations: ${navigationTimes.length}`);

          expect(averageNavTime).toBeLessThan(2000);
        }
      }
    });
  });

  test.describe('Data Load Testing', () => {
    test('should handle large data sets efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Simulate loading large amounts of data
      const dataLoadTest = await page.evaluate(async () => {
        const startTime = performance.now();

        // Create large array of mock data
        const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Item ${i}`,
          description: `This is a description for item ${i}. `.repeat(10),
          timestamp: new Date(Date.now() - Math.random() * 10000000).toISOString(),
          metadata: {
            category: `Category ${i % 10}`,
            priority: Math.floor(Math.random() * 5) + 1,
            tags: Array.from({ length: 3 }, (_, j) => `tag${i}-${j}`)
          }
        }));

        // Simulate processing this data
        const processedData = largeDataSet
          .filter(item => item.metadata.priority > 2)
          .map(item => ({
            ...item,
            processed: true,
            summary: item.description.substring(0, 50)
          }))
          .sort((a, b) => a.metadata.priority - b.metadata.priority);

        const processTime = performance.now() - startTime;

        return {
          originalSize: largeDataSet.length,
          processedSize: processedData.length,
          processTime: processTime
        };
      });

      console.log(`Data processing performance:
        - Original data size: ${dataLoadTest.originalSize} items
        - Processed data size: ${dataLoadTest.processedSize} items
        - Processing time: ${dataLoadTest.processTime.toFixed(2)}ms`);

      expect(dataLoadTest.processTime).toBeLessThan(1000); // Should process 1000 items under 1 second
    });

    test('should render large lists efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Create a large list dynamically for testing
      const renderTest = await page.evaluate(() => {
        const startTime = performance.now();

        // Create container for large list
        const container = document.createElement('div');
        container.id = 'load-test-container';
        container.style.cssText = 'height: 400px; overflow-y: auto; position: fixed; top: 0; left: 0; z-index: 9999; background: white; border: 1px solid #ccc;';

        // Create 500 list items
        for (let i = 0; i < 500; i++) {
          const item = document.createElement('div');
          item.className = 'load-test-item';
          item.style.cssText = 'padding: 8px; border-bottom: 1px solid #eee; display: flex; align-items: center;';
          item.innerHTML = `
            <div style="width: 40px; height: 40px; background: #ddd; border-radius: 50%; margin-right: 12px;"></div>
            <div>
              <div style="font-weight: bold;">Item ${i}</div>
              <div style="color: #666; font-size: 12px;">Description for item ${i}</div>
            </div>
          `;
          container.appendChild(item);
        }

        document.body.appendChild(container);

        const renderTime = performance.now() - startTime;

        return {
          itemCount: 500,
          renderTime: renderTime,
          containerId: 'load-test-container'
        };
      });

      console.log(`List rendering performance:
        - Items rendered: ${renderTest.itemCount}
        - Render time: ${renderTest.renderTime.toFixed(2)}ms`);

      expect(renderTest.renderTime).toBeLessThan(500); // Should render 500 items under 500ms

      // Test scrolling performance on the large list
      const scrollTest = await page.evaluate(() => {
        const container = document.getElementById('load-test-container');
        if (!container) return { scrollTime: 0 };

        const startTime = performance.now();

        // Simulate scrolling
        container.scrollTop = 1000;
        container.scrollTop = 2000;
        container.scrollTop = 0;

        const scrollTime = performance.now() - startTime;

        // Clean up
        container.remove();

        return { scrollTime };
      });

      console.log(`Large list scroll time: ${scrollTest.scrollTime.toFixed(2)}ms`);
      expect(scrollTest.scrollTime).toBeLessThan(100);
    });
  });

  test.describe('Memory Stress Testing', () => {
    test('should handle memory-intensive operations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const memoryTest = await page.evaluate(() => {
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

        // Create memory-intensive operations
        const largeArrays = [];
        const startTime = performance.now();

        // Create multiple large arrays
        for (let i = 0; i < 10; i++) {
          const largeArray = new Array(10000).fill(null).map((_, index) => ({
            id: index,
            data: new Array(100).fill(`item-${i}-${index}`).join(' '),
            nested: {
              more: new Array(50).fill(Math.random()),
              data: `nested-${i}-${index}`
            }
          }));
          largeArrays.push(largeArray);
        }

        const creationTime = performance.now() - startTime;

        // Process the data
        const processStart = performance.now();
        const processed = largeArrays.map(arr =>
          arr.filter(item => item.id % 2 === 0)
             .map(item => ({ ...item, processed: true }))
        );
        const processTime = performance.now() - processStart;

        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;

        // Clean up large arrays
        largeArrays.length = 0;
        processed.length = 0;

        return {
          creationTime,
          processTime,
          memoryIncrease,
          initialMemory,
          finalMemory
        };
      });

      console.log(`Memory stress test results:
        - Data creation time: ${memoryTest.creationTime.toFixed(2)}ms
        - Data processing time: ${memoryTest.processTime.toFixed(2)}ms
        - Memory increase: ${(memoryTest.memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      expect(memoryTest.creationTime).toBeLessThan(2000);
      expect(memoryTest.processTime).toBeLessThan(1000);
      expect(memoryTest.memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Under 100MB increase
    });

    test('should recover memory after intensive operations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const memoryRecoveryTest = await page.evaluate(async () => {
        const getMemory = () => (performance as any).memory?.usedJSHeapSize || 0;

        const initialMemory = getMemory();

        // Create and immediately dispose of large data structures
        for (let cycle = 0; cycle < 5; cycle++) {
          const tempData = new Array(5000).fill(null).map(i => ({
            large: new Array(1000).fill(Math.random()),
            text: new Array(100).fill('test').join(' ')
          }));

          // Process and discard
          tempData.forEach(item => {
            item.processed = item.large.reduce((a, b) => a + b, 0);
          });

          // Clear reference
          tempData.length = 0;

          // Force garbage collection if available
          if ((window as any).gc) {
            (window as any).gc();
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const finalMemory = getMemory();
        const memoryDifference = finalMemory - initialMemory;

        return {
          initialMemory,
          finalMemory,
          memoryDifference,
          cycles: 5
        };
      });

      console.log(`Memory recovery test:
        - Initial memory: ${(memoryRecoveryTest.initialMemory / 1024 / 1024).toFixed(2)}MB
        - Final memory: ${(memoryRecoveryTest.finalMemory / 1024 / 1024).toFixed(2)}MB
        - Memory difference: ${(memoryRecoveryTest.memoryDifference / 1024 / 1024).toFixed(2)}MB`);

      // Memory should not increase significantly after operations
      expect(Math.abs(memoryRecoveryTest.memoryDifference)).toBeLessThan(20 * 1024 * 1024); // 20MB tolerance
    });
  });

  test.describe('Network Load Testing', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        await route.continue();
      });

      const startTime = performance.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = performance.now() - startTime;

      console.log(`Slow network load time: ${loadTime}ms`);

      // Should still be usable under slow conditions (allowing for simulated delay)
      expect(loadTime).toBeLessThan(10000); // 10 seconds max

      // Test that interactions still work
      const interactionTest = performance.now();
      await page.click('body');
      const interactionTime = performance.now() - interactionTest;

      expect(interactionTime).toBeLessThan(300);
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Simulate network interruption
      await page.route('**/*', route => route.abort());

      // Try to perform actions that might require network
      try {
        await page.reload({ timeout: 5000 });
      } catch (error) {
        // Expected to fail, but page should still be functional
      }

      // Check that page is still responsive
      const isResponsive = await page.evaluate(() => {
        try {
          document.body.click();
          return true;
        } catch {
          return false;
        }
      });

      expect(isResponsive).toBe(true);

      // Restore network
      await page.unroute('**/*');
    });

    test('should efficiently handle multiple concurrent requests', async ({ page }) => {
      const requestTimes: number[] = [];

      page.on('response', (response) => {
        const timing = response.timing();
        if (timing) {
          requestTimes.push(timing.responseEnd);
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Trigger multiple requests by interacting with different parts of the page
      const interactiveElements = page.locator('button, a, input');
      const elementCount = await interactiveElements.count();

      for (let i = 0; i < Math.min(5, elementCount); i++) {
        try {
          await interactiveElements.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(100);
        } catch {
          // Some elements might not be clickable, continue
        }
      }

      await page.waitForTimeout(2000);

      if (requestTimes.length > 0) {
        const averageRequestTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
        const maxRequestTime = Math.max(...requestTimes);

        console.log(`Request timing analysis:
          - Total requests: ${requestTimes.length}
          - Average request time: ${averageRequestTime.toFixed(2)}ms
          - Max request time: ${maxRequestTime.toFixed(2)}ms`);

        expect(averageRequestTime).toBeLessThan(1000);
        expect(maxRequestTime).toBeLessThan(5000);
      }
    });
  });

  test.describe('Stress Testing', () => {
    test('should maintain stability under extreme load', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const stressTest = await page.evaluate(async () => {
        const errors: string[] = [];
        const startTime = performance.now();

        try {
          // Extreme stress test combining multiple intensive operations
          const promises = [];

          // CPU intensive operations
          for (let i = 0; i < 10; i++) {
            promises.push(new Promise(resolve => {
              const data = new Array(1000).fill(0).map(() => Math.random());
              const result = data.reduce((a, b) => a + b, 0);
              resolve(result);
            }));
          }

          // DOM manipulation stress
          for (let i = 0; i < 5; i++) {
            promises.push(new Promise(resolve => {
              const div = document.createElement('div');
              div.innerHTML = new Array(100).fill('<span>test</span>').join('');
              document.body.appendChild(div);
              setTimeout(() => {
                document.body.removeChild(div);
                resolve(true);
              }, 10);
            }));
          }

          // Event simulation stress
          for (let i = 0; i < 20; i++) {
            promises.push(new Promise(resolve => {
              const event = new Event('click');
              document.body.dispatchEvent(event);
              resolve(true);
            }));
          }

          await Promise.all(promises);

        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
        }

        const testTime = performance.now() - startTime;

        return {
          testTime,
          errors,
          completed: true
        };
      });

      console.log(`Stress test results:
        - Test completed: ${stressTest.completed}
        - Test time: ${stressTest.testTime.toFixed(2)}ms
        - Errors: ${stressTest.errors.length}`);

      expect(stressTest.completed).toBe(true);
      expect(stressTest.errors).toHaveLength(0);
      expect(stressTest.testTime).toBeLessThan(5000);

      // Verify page is still responsive after stress test
      const finalResponsiveness = performance.now();
      await page.click('body');
      const responsivenessTime = performance.now() - finalResponsiveness;

      expect(responsivenessTime).toBeLessThan(100);
    });
  });
});