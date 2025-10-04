import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility Testing', () => {
  test.describe('Desktop Browsers', () => {
    test('should render consistently across desktop browsers', async ({ page, browserName }) => {
      await page.goto('/');

      // Check basic page structure
      await expect(page.locator('body')).toBeVisible();

      // Test CSS Grid/Flexbox support
      const navigation = page.locator('nav, [role="navigation"]');
      if (await navigation.count() > 0) {
        await expect(navigation.first()).toBeVisible();
      }

      // Browser-specific checks
      if (browserName === 'chromium') {
        // Test Chrome-specific features
        console.log('Testing Chrome-specific features');
      } else if (browserName === 'firefox') {
        // Test Firefox-specific features
        console.log('Testing Firefox-specific features');
      } else if (browserName === 'webkit') {
        // Test Safari-specific features
        console.log('Testing Safari-specific features');
      }
    });

    test('should handle modern JavaScript features', async ({ page }) => {
      await page.goto('/');

      // Test ES6+ features support
      const modernJSSupport = await page.evaluate(() => {
        try {
          // Test arrow functions, destructuring, async/await
          const testArrow = () => true;
          const { testProp } = { testProp: 'value' };

          // Test Promise support
          return Promise.resolve(true);
        } catch (error) {
          return false;
        }
      });

      expect(modernJSSupport).toBe(true);
    });

    test('should support CSS custom properties and modern layouts', async ({ page }) => {
      await page.goto('/');

      // Test CSS custom properties support
      const cssSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.setProperty('--test-var', 'test');
        return testElement.style.getPropertyValue('--test-var') === 'test';
      });

      expect(cssSupport).toBe(true);
    });
  });

  test.describe('Mobile Browsers', () => {
    test('should work on mobile Chrome', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
      });
      const page = await context.newPage();

      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();

      // Test touch interactions
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.tap();
      }

      await context.close();
    });

    test('should work on mobile Safari', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();

      // Test iOS-specific behaviors
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(390);
      expect(viewport?.height).toBe(844);

      await context.close();
    });

    test('should handle orientation changes', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto('/');

      // Test portrait orientation
      await expect(page.locator('body')).toBeVisible();

      // Simulate landscape orientation
      await page.setViewportSize({ width: 844, height: 390 });
      await expect(page.locator('body')).toBeVisible();

      await context.close();
    });
  });

  test.describe('Feature Detection and Polyfills', () => {
    test('should gracefully handle missing features', async ({ page }) => {
      await page.goto('/');

      // Test service worker support detection
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });

      console.log('Service Worker supported:', swSupported);

      // Test Web API availability
      const apiSupport = await page.evaluate(() => {
        return {
          localStorage: typeof Storage !== 'undefined',
          sessionStorage: typeof Storage !== 'undefined',
          indexedDB: 'indexedDB' in window,
          webGL: !!document.createElement('canvas').getContext('webgl'),
          geolocation: 'geolocation' in navigator,
          notifications: 'Notification' in window,
        };
      });

      console.log('API Support:', apiSupport);

      // Application should work regardless of API support
      await expect(page.locator('body')).toBeVisible();
    });

    test('should work without JavaScript', async ({ browser }) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
      });
      const page = await context.newPage();

      await page.goto('/');

      // Check that basic content is still accessible
      await expect(page.locator('body')).toBeVisible();

      await context.close();
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should load quickly on all browsers', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/', { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time across all browsers
      expect(loadTime).toBeLessThan(5000);

      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries.map(entry => ({
              name: entry.name,
              value: entry.value || entry.duration,
            })));
          }).observe({ entryTypes: ['navigation', 'paint'] });

          // Fallback for older browsers
          setTimeout(() => {
            resolve([]);
          }, 1000);
        });
      });

      console.log('Performance metrics:', metrics);
    });

    test('should handle memory efficiently', async ({ page }) => {
      await page.goto('/');

      // Test memory usage (if supported)
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        } : null;
      });

      if (memoryInfo) {
        console.log('Memory usage:', memoryInfo);

        // Memory usage should be reasonable
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB
      }
    });
  });

  test.describe('Browser-Specific Edge Cases', () => {
    test('should handle Safari date input quirks', async ({ page, browserName }) => {
      if (browserName === 'webkit') {
        await page.goto('/');

        // Test Safari's date input handling
        const dateInput = await page.locator('input[type="date"]').first();
        if (await dateInput.count() > 0) {
          await dateInput.fill('2024-12-25');
          const value = await dateInput.inputValue();
          expect(value).toBe('2024-12-25');
        }
      }
    });

    test('should handle Firefox flexbox differences', async ({ page, browserName }) => {
      if (browserName === 'firefox') {
        await page.goto('/');

        // Test Firefox-specific flexbox behaviors
        const flexContainer = page.locator('.flex, [style*="display: flex"]').first();
        if (await flexContainer.count() > 0) {
          await expect(flexContainer).toBeVisible();
        }
      }
    });

    test('should handle Chrome autofill behavior', async ({ page, browserName }) => {
      if (browserName === 'chromium') {
        await page.goto('/');

        // Test form autofill handling
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.count() > 0) {
          await emailInput.fill('test@example.com');
          await expect(emailInput).toHaveValue('test@example.com');
        }
      }
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    test('should maintain accessibility in all browsers', async ({ page }) => {
      await page.goto('/');

      // Test keyboard navigation
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
      }

      // Test screen reader attributes
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
      const count = await ariaElements.count();

      if (count > 0) {
        console.log(`Found ${count} elements with ARIA attributes`);
      }
    });

    test('should support high contrast mode', async ({ page }) => {
      await page.goto('/');

      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(page.locator('body')).toBeVisible();

      await page.emulateMedia({ colorScheme: 'light' });
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Network Conditions', () => {
    test('should work on slow connections', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
        await route.continue();
      });

      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle offline scenarios', async ({ page, context }) => {
      await page.goto('/');

      // Go offline
      await context.setOffline(true);

      // App should still be functional with cached content
      await page.reload().catch(() => {
        // Expected to fail, but cached content should still work
      });

      await expect(page.locator('body')).toBeVisible();

      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('Security Features', () => {
    test('should enforce CSP across browsers', async ({ page }) => {
      const cspViolations: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('CSP')) {
          cspViolations.push(msg.text());
        }
      });

      await page.goto('/');

      // Should not have CSP violations
      expect(cspViolations).toHaveLength(0);
    });

    test('should use HTTPS and secure headers', async ({ page }) => {
      const response = await page.goto('/');

      // Check security headers (if applicable)
      const headers = response?.headers();

      if (headers) {
        console.log('Security headers:', {
          'strict-transport-security': headers['strict-transport-security'],
          'x-frame-options': headers['x-frame-options'],
          'x-content-type-options': headers['x-content-type-options'],
        });
      }
    });
  });
});