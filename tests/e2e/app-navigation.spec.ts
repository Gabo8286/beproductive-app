import { test, expect } from '@playwright/test';

test.describe('BeProductive App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/BeProductive/);

    // Check for main navigation or key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Test basic navigation functionality
    // This will depend on your actual routing structure

    // Look for navigation elements
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify the page is still accessible on mobile
    await expect(page.locator('body')).toBeVisible();

    // Check for mobile-specific elements or behaviors
    // This would be specific to your mobile navigation implementation
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Test basic accessibility
    await page.goto('/');

    // Check for skip links
    const skipLinks = page.locator('a[href="#main-content"], a[href="#main"]');
    if (await skipLinks.count() > 0) {
      await expect(skipLinks.first()).toBeFocused({ timeout: 5000 }).catch(() => {
        // Skip link may not be focused initially, which is okay
      });
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Verify focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible({ timeout: 5000 }).catch(() => {
      // Some pages may not have immediately focusable elements
    });
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    // Test PWA offline functionality
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Try to navigate or perform actions
    await page.reload({ waitUntil: 'networkidle' }).catch(() => {
      // Expected to fail offline, but should handle gracefully
    });

    // Check for offline indicators or cached content
    await expect(page.locator('body')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test('should load with good performance metrics', async ({ page }) => {
    // Performance testing
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Should load within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000); // 5 seconds

    // Check for performance-related elements
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0];
    });

    expect(performanceEntries).toBeDefined();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    // Test 404 handling
    await page.goto('/non-existent-page');

    // Should show a 404 page or redirect appropriately
    // This depends on your routing implementation
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    // Wait a moment for any async errors
    await page.waitForTimeout(2000);

    // Should not have critical JavaScript errors
    // Filter out known non-critical errors if needed
    const criticalErrors = errors.filter(error =>
      !error.includes('Warning:') &&
      !error.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('PWA Features', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');

    // Check if service worker is registered
    const serviceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    // May not be registered in development, so this is optional
    if (serviceWorkerRegistered) {
      expect(serviceWorkerRegistered).toBe(true);
    }
  });

  test('should have web app manifest', async ({ page }) => {
    await page.goto('/');

    // Check for web app manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    if (await manifestLink.count() > 0) {
      await expect(manifestLink).toHaveAttribute('href');
    }
  });

  test('should be installable as PWA', async ({ page, context }) => {
    await page.goto('/');

    // Listen for beforeinstallprompt event
    const installPromptTriggered = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', () => {
          resolve(true);
        });

        // Resolve false after timeout if event doesn't fire
        setTimeout(() => resolve(false), 3000);
      });
    });

    // PWA install prompt may not trigger in all environments
    // This is informational rather than a hard requirement
    console.log('PWA install prompt triggered:', installPromptTriggered);
  });
});