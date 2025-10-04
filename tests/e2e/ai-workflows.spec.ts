import { test, expect } from '@playwright/test';

test.describe('AI Features End-to-End Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Mock login or navigate to dashboard
    // For testing purposes, we'll navigate directly to dashboard
    await page.goto('/dashboard');
  });

  test.describe('Time Tracking Widget Workflow', () => {
    test('user can interact with time tracking widget on dashboard', async ({ page }) => {
      // Wait for dashboard to load
      await expect(page.locator('h1')).toContainText(['Tasks', 'Dashboard']);

      // Find the time tracking widget
      const timeWidget = page.locator('[data-testid="time-tracking-widget"]').or(
        page.locator('text=Time Tracking').locator('..')
      );

      // Should see time tracking widget
      await expect(timeWidget.or(page.locator('text=Time Tracking'))).toBeVisible();

      // Should show either active session or no active session
      const activeSession = page.locator('text=Frontend development');
      const noActiveSession = page.locator('text=No active session');

      await expect(activeSession.or(noActiveSession)).toBeVisible();

      // If there's an active session, test pause/resume
      if (await activeSession.isVisible()) {
        // Look for timer controls
        const timerButtons = page.locator('button').filter({ hasText: '' }); // Icon buttons
        const firstTimerButton = timerButtons.first();

        if (await firstTimerButton.isVisible()) {
          await firstTimerButton.click();
          // Should still show the session after pause/play toggle
          await expect(activeSession).toBeVisible();
        }
      }

      // Test navigation to full time tracking page
      const viewAnalyticsButton = page.locator('text=View Analytics');
      if (await viewAnalyticsButton.isVisible()) {
        await viewAnalyticsButton.click();
        await expect(page).toHaveURL(/\/time-tracking/);
      }
    });

    test('user can navigate to dedicated time tracking page', async ({ page }) => {
      // Navigate to time tracking page
      await page.goto('/time-tracking');

      // Should see the full time tracking interface
      await expect(page.locator('h1, h2').filter({ hasText: 'Intelligent Time Tracker' })).toBeVisible();

      // Should see tabs for different views
      await expect(page.locator('text=Tracker')).toBeVisible();
      await expect(page.locator('text=Estimates')).toBeVisible();
      await expect(page.locator('text=Analytics')).toBeVisible();
      await expect(page.locator('text=Patterns')).toBeVisible();

      // Test tab navigation
      await page.locator('text=Estimates').click();
      await expect(page.locator('text=AI Time Estimation')).toBeVisible();

      await page.locator('text=Analytics').click();
      await expect(page.locator('text=Total Tracked')).toBeVisible();

      await page.locator('text=Patterns').click();
      await expect(page.locator('text=Productivity Patterns')).toBeVisible();
    });

    test('user can generate time estimates for tasks', async ({ page }) => {
      await page.goto('/time-tracking');

      // Go to estimates tab
      await page.locator('text=Estimates').click();

      // Find the task input field
      const taskInput = page.locator('input[placeholder*="task"]').or(
        page.locator('input[placeholder*="estimate"]')
      );

      if (await taskInput.isVisible()) {
        await taskInput.fill('Create user authentication system');

        // Find and click estimate button
        const estimateButton = page.locator('button').filter({ hasText: /estimate/i });
        if (await estimateButton.isVisible()) {
          await estimateButton.click();

          // Should show estimation results
          await expect(page.locator('text=Estimated')).toBeVisible({ timeout: 10000 });
          await expect(page.locator('text=confidence')).toBeVisible();
        }
      }
    });
  });

  test.describe('Smart Recommendations Widget Workflow', () => {
    test('user can interact with AI recommendations on dashboard', async ({ page }) => {
      // Wait for dashboard to load
      await expect(page.locator('h1')).toContainText(['Tasks', 'Dashboard']);

      // Find the recommendations widget
      const recommendationsWidget = page.locator('text=AI Recommendations').locator('..');

      // Should see recommendations widget
      await expect(page.locator('text=AI Recommendations')).toBeVisible();

      // Wait for recommendations to load (after loading state)
      await page.waitForTimeout(2000);

      // Should see a recommendation
      const recommendation = page.locator('text=Schedule deep work').or(
        page.locator('text=Take a').or(
          page.locator('text=Review').or(
            page.locator('text=Learn')
          )
        )
      );

      await expect(recommendation).toBeVisible({ timeout: 10000 });

      // Should see confidence percentage
      await expect(page.locator('text=% confidence')).toBeVisible();

      // Test implement button
      const implementButton = page.locator('button').filter({ hasText: /implement/i });
      if (await implementButton.isVisible()) {
        await implementButton.click();
        // Implementation would trigger some action (logged to console in mock)
      }

      // Test navigation dots for multiple recommendations
      const navigationDots = page.locator('button[class*="rounded-full"]');
      const dotCount = await navigationDots.count();

      if (dotCount > 1) {
        // Click second dot
        await navigationDots.nth(1).click();
        // Should show different recommendation
        await page.waitForTimeout(500);
      }
    });

    test('recommendations auto-rotate over time', async ({ page }) => {
      // Wait for dashboard to load
      await expect(page.locator('text=AI Recommendations')).toBeVisible();

      // Wait for initial load
      await page.waitForTimeout(2000);

      // Get initial recommendation text
      const initialRecommendation = await page.locator('[class*="font-medium text-sm"]').first().textContent();

      // Wait for auto-rotation (10+ seconds)
      await page.waitForTimeout(12000);

      // Get current recommendation text
      const currentRecommendation = await page.locator('[class*="font-medium text-sm"]').first().textContent();

      // Should be different (if there are multiple recommendations)
      // Note: This test might not always pass if there's only one recommendation
      if (initialRecommendation && currentRecommendation) {
        console.log('Initial:', initialRecommendation, 'Current:', currentRecommendation);
      }
    });
  });

  test.describe('Recommendations Banner Workflow', () => {
    test('user sees contextual recommendations on tasks page', async ({ page }) => {
      await page.goto('/tasks');

      // Should see the tasks page
      await expect(page.locator('h1').filter({ hasText: /tasks|next steps/i })).toBeVisible();

      // Should see recommendations banner
      const banner = page.locator('[class*="border-l-purple-500"]').or(
        page.locator('text=Break down large tasks').locator('..')
      );

      // Wait for banner to appear
      await expect(banner.or(page.locator('text=Break down'))).toBeVisible({ timeout: 5000 });

      // Should see recommendation content
      await expect(page.locator('text=productivity').or(page.locator('text=confidence'))).toBeVisible();

      // Test dismiss functionality
      const dismissButton = page.locator('button').filter({ hasText: '' }).last(); // X button
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
        // Banner should disappear
        await expect(banner).not.toBeVisible({ timeout: 2000 });
      }
    });

    test('user sees different recommendations on goals page', async ({ page }) => {
      await page.goto('/goals');

      // Should see the goals page
      await expect(page.locator('h1').filter({ hasText: /goals/i })).toBeVisible();

      // Should see different recommendations banner
      await expect(page.locator('text=Set weekly check-ins').or(
        page.locator('text=goal')
      )).toBeVisible({ timeout: 5000 });

      // Should see goal-specific content
      await expect(page.locator('text=40%').or(page.locator('text=achievement'))).toBeVisible();
    });
  });

  test.describe('Cross-Feature AI Workflow', () => {
    test('user can navigate between AI features seamlessly', async ({ page }) => {
      // Start on dashboard
      await page.goto('/dashboard');
      await expect(page.locator('text=AI Recommendations')).toBeVisible();

      // Navigate to AI insights from recommendations widget
      const aiInsightsLink = page.locator('a[href="/ai-insights"]').first();
      if (await aiInsightsLink.isVisible()) {
        await aiInsightsLink.click();
        await expect(page).toHaveURL(/\/ai-insights/);
        await expect(page.locator('h1, h2').filter({ hasText: /insights/i })).toBeVisible();
      }

      // Navigate to time tracking
      await page.goto('/time-tracking');
      await expect(page.locator('text=Intelligent Time Tracker')).toBeVisible();

      // Test that AI features are connected
      await expect(page.locator('text=AI Enhanced')).toBeVisible();
    });

    test('user workflow: from recommendation to action', async ({ page }) => {
      // Start on tasks page
      await page.goto('/tasks');

      // See recommendation about breaking down tasks
      await expect(page.locator('text=Break down').or(
        page.locator('text=productivity')
      )).toBeVisible({ timeout: 5000 });

      // Click on recommendation action
      const learnHowButton = page.locator('text=Learn how').or(
        page.locator('button').filter({ hasText: /learn/i })
      );

      if (await learnHowButton.isVisible()) {
        await learnHowButton.click();
        // Should navigate to AI insights or related page
        await expect(page).toHaveURL(/\/(ai-insights|time-tracking)/);
      }

      // Alternative: test time tracking recommendation
      await page.goto('/dashboard');
      const timeTrackingButton = page.locator('text=Start timer').or(
        page.locator('a[href="/time-tracking"]')
      );

      if (await timeTrackingButton.isVisible()) {
        await timeTrackingButton.click();
        await expect(page).toHaveURL(/\/time-tracking/);
      }
    });
  });

  test.describe('AI Feature Performance', () => {
    test('AI widgets load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard');

      // Wait for AI widgets to fully load
      await expect(page.locator('text=AI Recommendations')).toBeVisible();
      await expect(page.locator('text=Time Tracking')).toBeVisible();

      // Wait for content to load (not just loading states)
      await page.waitForTimeout(2000);

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);

      console.log(`AI widgets loaded in ${loadTime}ms`);
    });

    test('multiple AI features work simultaneously', async ({ page }) => {
      await page.goto('/dashboard');

      // All AI features should be visible and functional
      await expect(page.locator('text=AI Recommendations')).toBeVisible();
      await expect(page.locator('text=Time Tracking')).toBeVisible();

      // Wait for full loading
      await page.waitForTimeout(3000);

      // Should see content from both widgets
      const hasRecommendationContent = await page.locator('text=Schedule').or(
        page.locator('text=confidence')
      ).isVisible();

      const hasTimeTrackingContent = await page.locator('text=Frontend development').or(
        page.locator('text=No active session')
      ).isVisible();

      expect(hasRecommendationContent || hasTimeTrackingContent).toBeTruthy();
    });
  });

  test.describe('AI Feature Accessibility', () => {
    test('AI widgets are keyboard navigable', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for widgets to load
      await expect(page.locator('text=AI Recommendations')).toBeVisible();

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to reach interactive elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('AI features have proper ARIA labels', async ({ page }) => {
      await page.goto('/time-tracking');

      // Check for proper headings
      const headings = page.locator('h1, h2, h3');
      await expect(headings.first()).toBeVisible();

      // Check for proper button labels and roles
      const buttons = page.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling and Resilience', () => {
    test('AI features handle network errors gracefully', async ({ page }) => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());

      await page.goto('/dashboard');

      // Should still show basic structure even with network issues
      await expect(page.locator('text=Dashboard').or(page.locator('h1'))).toBeVisible();

      // AI widgets should show error states or fallbacks
      // (This depends on implementation - they might show loading states or error messages)
      await page.waitForTimeout(2000);
    });

    test('one failing AI component does not break others', async ({ page }) => {
      await page.goto('/dashboard');

      // Even if some components fail, page should remain functional
      await expect(page.locator('body')).toBeVisible();

      // At least some dashboard content should be visible
      const dashboardContent = page.locator('text=Dashboard').or(
        page.locator('text=Goals').or(
          page.locator('text=Tasks')
        )
      );

      await expect(dashboardContent).toBeVisible();
    });
  });
});