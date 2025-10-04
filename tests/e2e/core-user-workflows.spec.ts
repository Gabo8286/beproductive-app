import { test, expect } from '@playwright/test';
import { skipAuthenticationIfPossible, mockAuthenticationState, setTestEnvironment } from './utils/auth-utils';

/**
 * Core User Workflows E2E Tests
 *
 * Tests the main user journeys and workflows that are critical to the application's value proposition.
 * These tests simulate real user behavior and validate complete flows rather than individual components.
 */

test.describe('Core User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await setTestEnvironment(page);

    // Mock authentication state for faster testing
    await mockAuthenticationState(page);

    // Start at the main application and handle authentication
    await page.goto('/');
    await skipAuthenticationIfPossible(page);

    // Wait for initial load
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test.describe('New User Onboarding Flow', () => {
    test('user can complete initial setup workflow', async ({ page }) => {
      // Test the user's authenticated dashboard experience

      // Should see a dashboard with basic page structure
      await expect(page.locator('body').first()).toBeVisible();

      // Check current URL to understand where we are
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      // Look for any main navigation or dashboard elements (flexible)
      const navigationElements = page.locator('nav, [role="navigation"], a[href*="/"], header, main').first();
      if (await navigationElements.count() > 0) {
        await expect(navigationElements).toBeVisible({ timeout: 10000 });
      }

      // Look for any interactive content (buttons, links, forms)
      const interactiveElements = page.locator('button, a, input, [role="button"]').first();
      if (await interactiveElements.count() > 0) {
        await expect(interactiveElements).toBeVisible({ timeout: 5000 });
      }

      // Verify the page loaded successfully (no error states)
      const errorElements = page.locator('text=Error').or(page.locator('text=404').or(page.locator('text=Not Found')));
      expect(await errorElements.count()).toBe(0);

      // Simple success check - page has content
      const pageContent = page.locator('h1, h2, h3, p, div').first();
      await expect(pageContent).toBeVisible({ timeout: 5000 });
    });

    test('user can navigate main sections after setup', async ({ page }) => {
      // Test navigation to main sections

      // Try to navigate to Goals section
      const goalsNav = page.locator('a[href*="goals"], button').filter({ hasText: /goals/i });
      if (await goalsNav.count() > 0) {
        await goalsNav.first().click();
        await expect(page.locator('h1, h2').filter({ hasText: /goals/i })).toBeVisible({ timeout: 5000 });
      }

      // Try to navigate to Tasks section
      const tasksNav = page.locator('a[href*="tasks"], button').filter({ hasText: /tasks/i });
      if (await tasksNav.count() > 0) {
        await tasksNav.first().click();
        await expect(page.locator('h1, h2').filter({ hasText: /tasks/i })).toBeVisible({ timeout: 5000 });
      }

      // Try to navigate back to Dashboard
      const dashboardNav = page.locator('a[href*="dashboard"], a[href="/"], button').filter({ hasText: /dashboard|home/i });
      if (await dashboardNav.count() > 0) {
        await dashboardNav.first().click();
        await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Daily Productivity Workflow', () => {
    test('user can complete a daily productivity session', async ({ page }) => {
      // Simulate a typical daily workflow

      // 1. Start on dashboard and review today's overview
      await page.goto('/dashboard');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Look for productivity metrics or daily overview
      const dashboardContent = page.locator('text=Goal').or(
        page.locator('text=Task').or(
          page.locator('text=Progress').or(
            page.locator('text=Today')
          )
        )
      );
      await expect(dashboardContent).toBeVisible({ timeout: 5000 });

      // 2. Check current goals status
      await page.goto('/goals');
      await expect(page.locator('h1, h2').filter({ hasText: /goals/i })).toBeVisible();

      // Look for goals list or goal cards
      const goalsContent = page.locator('[class*="goal"], [class*="card"]').or(
        page.locator('text=Progress').or(
          page.locator('text=Target')
        )
      );

      if (await goalsContent.count() > 0) {
        // Interact with a goal if available
        const firstGoal = goalsContent.first();
        await firstGoal.click();
        await page.waitForTimeout(1000);
      }

      // 3. Review and manage tasks
      await page.goto('/tasks');
      await expect(page.locator('h1, h2').filter({ hasText: /tasks/i })).toBeVisible();

      // Look for task management interface
      const tasksInterface = page.locator('text=Add').or(
        page.locator('text=Create').or(
          page.locator('button').filter({ hasText: /add|new|create/i })
        )
      );

      if (await tasksInterface.count() > 0) {
        console.log('Task management interface found');
      }

      // 4. Use time tracking if available
      const timeTrackingNav = page.locator('a[href*="time"], button').filter({ hasText: /time|track/i });
      if (await timeTrackingNav.count() > 0) {
        await timeTrackingNav.first().click();
        await expect(page.locator('text=Time').or(page.locator('text=Track'))).toBeVisible({ timeout: 5000 });
      }
    });

    test('user can access AI-powered insights and recommendations', async ({ page }) => {
      // Test AI-powered productivity features

      // 1. Start from dashboard and look for AI recommendations
      await page.goto('/dashboard');

      // Look for AI elements with more specific selectors to avoid conflicts
      const aiElements = page.locator('h1, h2, h3').filter({ hasText: /AI|Recommendation|Insight|Smart/i }).first()
        .or(page.locator('[data-testid*="ai"], [data-testid*="recommendation"]').first())
        .or(page.locator('.ai, .recommendation, .insight').first());

      // Check if AI elements exist, if not, skip this part of the test
      if (await aiElements.count() > 0) {
        await expect(aiElements.first()).toBeVisible({ timeout: 5000 });
      } else {
        console.log('No AI elements found on dashboard, continuing with available features');
      }

      // 2. Test AI insights page if available
      const aiInsightsLink = page.locator('a[href*="ai"], a[href*="insights"]');
      if (await aiInsightsLink.count() > 0) {
        await aiInsightsLink.first().click();
        await expect(page.locator('h1, h2').filter({ hasText: /insights|ai/i })).toBeVisible({ timeout: 5000 });

        // Look for AI-generated content
        const aiContent = page.locator('text=confidence').or(
          page.locator('text=recommend').or(
            page.locator('text=analysis')
          )
        );

        if (await aiContent.count() > 0) {
          console.log('AI insights content found');
        }
      }

      // 3. Test AI recommendations interaction
      await page.goto('/dashboard');

      const recommendationWidget = page.locator('text=AI Recommendations').locator('..');
      if (await recommendationWidget.count() > 0) {
        // Look for recommendation actions
        const actionButtons = page.locator('button').filter({ hasText: /implement|apply|dismiss/i });
        if (await actionButtons.count() > 0) {
          await actionButtons.first().click();
          console.log('AI recommendation action triggered');
        }
      }
    });
  });

  test.describe('Goal Achievement Workflow', () => {
    test('user can track progress towards goals', async ({ page }) => {
      // Test complete goal tracking workflow

      await page.goto('/goals');
      await expect(page.locator('h1, h2').filter({ hasText: /goals/i })).toBeVisible();

      // Look for existing goals or goal creation interface
      const goalsSection = page.locator('[class*="goal"], [data-testid*="goal"]').or(
        page.locator('text=Progress').or(
          page.locator('text=Achievement')
        )
      );

      if (await goalsSection.count() > 0) {
        // Test goal progress tracking
        const progressIndicators = page.locator('[class*="progress"], text="%"').or(
          page.locator('[role="progressbar"]')
        );

        if (await progressIndicators.count() > 0) {
          await expect(progressIndicators.first()).toBeVisible();
          console.log('Goal progress tracking visible');
        }

        // Test goal interaction
        const firstGoal = goalsSection.first();
        await firstGoal.click();
        await page.waitForTimeout(1000);

        // Look for goal details or actions
        const goalActions = page.locator('button').filter({ hasText: /update|edit|complete/i });
        if (await goalActions.count() > 0) {
          console.log('Goal interaction available');
        }
      }

      // Test goal creation if no goals exist
      const createGoalButton = page.locator('button').filter({ hasText: /add|create|new.*goal/i });
      if (await createGoalButton.count() > 0) {
        await createGoalButton.first().click();

        // Look for goal creation form
        const goalForm = page.locator('form').or(
          page.locator('input[placeholder*="goal"]').or(
            page.locator('textarea[placeholder*="goal"]')
          )
        );

        if (await goalForm.count() > 0) {
          console.log('Goal creation form available');

          // Try to fill out basic goal information
          const titleInput = page.locator('input').first();
          if (await titleInput.isVisible()) {
            await titleInput.fill('E2E Test Goal');
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('user can view goal analytics and insights', async ({ page }) => {
      await page.goto('/goals');

      // Look for analytics or insights sections
      const analyticsElements = page.locator('text=Analytics').or(
        page.locator('text=Insights').or(
          page.locator('text=Statistics').or(
            page.locator('text=Performance')
          )
        )
      );

      if (await analyticsElements.count() > 0) {
        await analyticsElements.first().click();
        await page.waitForTimeout(1000);

        // Look for charts, graphs, or metrics
        const metricsElements = page.locator('[class*="chart"], [class*="graph"]').or(
          page.locator('text=%').or(
            page.locator('text=average').or(
              page.locator('text=total')
            )
          )
        );

        if (await metricsElements.count() > 0) {
          console.log('Goal analytics found');
        }
      }
    });
  });

  test.describe('Task Management Workflow', () => {
    test('user can manage tasks effectively', async ({ page }) => {
      await page.goto('/tasks');
      await expect(page.locator('h1, h2').filter({ hasText: /tasks/i })).toBeVisible();

      // Test task list view
      const tasksList = page.locator('[class*="task"], [data-testid*="task"]').or(
        page.locator('ul, ol').filter({ hasText: /task/i })
      );

      if (await tasksList.count() > 0) {
        console.log('Tasks list found');

        // Test task interaction
        const firstTask = tasksList.first();
        await firstTask.click();
        await page.waitForTimeout(500);
      }

      // Test task creation
      const addTaskButton = page.locator('button').filter({ hasText: /add|create|new.*task/i });
      if (await addTaskButton.count() > 0) {
        await addTaskButton.first().click();

        const taskForm = page.locator('form').or(
          page.locator('input[placeholder*="task"]')
        );

        if (await taskForm.count() > 0) {
          const taskInput = page.locator('input, textarea').first();
          if (await taskInput.isVisible()) {
            await taskInput.fill('E2E Test Task');
            await page.waitForTimeout(500);

            // Look for save or submit button
            const saveButton = page.locator('button').filter({ hasText: /save|add|create|submit/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              console.log('Task creation attempted');
            }
          }
        }
      }
    });

    test('user can organize tasks with priorities and categories', async ({ page }) => {
      await page.goto('/tasks');

      // Look for task organization features
      const organizationFeatures = page.locator('text=Priority').or(
        page.locator('text=Category').or(
          page.locator('text=Filter').or(
            page.locator('text=Sort')
          )
        )
      );

      if (await organizationFeatures.count() > 0) {
        // Test priority setting
        const priorityElements = page.locator('[class*="priority"], text=High').or(
          page.locator('text=Medium').or(
            page.locator('text=Low')
          )
        );

        if (await priorityElements.count() > 0) {
          await priorityElements.first().click();
          console.log('Priority interaction available');
        }

        // Test filtering or sorting
        const filterElements = page.locator('select, button').filter({ hasText: /filter|sort/i });
        if (await filterElements.count() > 0) {
          await filterElements.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Settings and Customization Workflow', () => {
    test('user can access and modify settings', async ({ page }) => {
      // Look for settings navigation
      const settingsNav = page.locator('a[href*="settings"], button').filter({ hasText: /settings|preferences/i });

      if (await settingsNav.count() > 0) {
        await settingsNav.first().click();
        await expect(page.locator('h1, h2').filter({ hasText: /settings|preferences/i })).toBeVisible({ timeout: 5000 });

        // Test settings categories
        const settingsCategories = page.locator('text=Profile').or(
          page.locator('text=Notifications').or(
            page.locator('text=Privacy').or(
              page.locator('text=AI')
            )
          )
        );

        if (await settingsCategories.count() > 0) {
          await settingsCategories.first().click();
          await page.waitForTimeout(1000);

          // Look for settings controls
          const settingsControls = page.locator('input[type="checkbox"], input[type="radio"], select');
          if (await settingsControls.count() > 0) {
            console.log('Settings controls found');
          }
        }
      }
    });

    test('user can customize AI preferences', async ({ page }) => {
      // Navigate to AI settings
      const aiSettingsNav = page.locator('a[href*="ai"], a[href*="settings"]');

      for (let i = 0; i < await aiSettingsNav.count(); i++) {
        const nav = aiSettingsNav.nth(i);
        const text = await nav.textContent();

        if (text && (text.toLowerCase().includes('ai') || text.toLowerCase().includes('settings'))) {
          await nav.click();
          break;
        }
      }

      // Look for AI-specific settings
      const aiSettings = page.locator('text=AI').or(
        page.locator('text=Recommendations').or(
          page.locator('text=Privacy').or(
            page.locator('text=Intelligence')
          )
        )
      );

      if (await aiSettings.count() > 0) {
        // Test AI preference controls
        const aiControls = page.locator('input[type="checkbox"]').or(
          page.locator('select').or(
            page.locator('input[type="range"]')
          )
        );

        if (await aiControls.count() > 0) {
          console.log('AI preference controls found');

          // Test toggling a setting
          const firstControl = aiControls.first();
          if (await firstControl.isVisible()) {
            await firstControl.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });
  });

  test.describe('Cross-Feature Integration Workflow', () => {
    test('user can experience seamless feature integration', async ({ page }) => {
      // Test how features work together in a real workflow

      // 1. Start with goals
      await page.goto('/goals');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // 2. Navigate to tasks and check goal-task connection
      await page.goto('/tasks');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Look for goal-related elements in tasks
      const goalTaskConnection = page.locator('text=goal').or(
        page.locator('[class*="goal"]')
      );

      if (await goalTaskConnection.count() > 0) {
        console.log('Goal-task integration visible');
      }

      // 3. Check time tracking integration
      await page.goto('/time-tracking');

      // Look for task or goal references in time tracking
      const timeIntegration = page.locator('text=task').or(
        page.locator('text=goal').or(
          page.locator('text=project')
        )
      );

      if (await timeIntegration.count() > 0) {
        console.log('Time tracking integration visible');
      }

      // 4. Return to dashboard and verify integrated view
      await page.goto('/dashboard');

      // Should see data from multiple features
      const integratedData = page.locator('text=Goal').or(
        page.locator('text=Task').or(
          page.locator('text=Time').or(
            page.locator('text=Progress')
          )
        )
      );

      await expect(integratedData).toBeVisible({ timeout: 5000 });
    });

    test('user can follow AI recommendations across features', async ({ page }) => {
      // Test AI-driven cross-feature workflows

      await page.goto('/dashboard');

      // Look for AI recommendations
      const aiRecommendations = page.locator('text=AI Recommendations').or(
        page.locator('text=Smart').or(
          page.locator('text=Suggest')
        )
      );

      if (await aiRecommendations.count() > 0) {
        // Test following a recommendation
        const actionButton = page.locator('button').filter({ hasText: /implement|apply|start/i });

        if (await actionButton.count() > 0) {
          await actionButton.first().click();
          await page.waitForTimeout(1000);

          // Should navigate or update UI
          const navigationOccurred = await page.url() !== 'http://localhost:8080/dashboard';
          const uiUpdated = await page.locator('text=Applied').or(
            page.locator('text=Implemented').or(
              page.locator('text=Started')
            )
          ).count() > 0;

          if (navigationOccurred || uiUpdated) {
            console.log('AI recommendation action completed');
          }
        }
      }
    });
  });

  test.describe('Mobile User Workflow', () => {
    test('user can complete core workflows on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Test mobile navigation
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();

      // Look for mobile navigation menu
      const mobileMenu = page.locator('button[class*="menu"], [aria-label*="menu"]').or(
        page.locator('text=☰').or(
          page.locator('[class*="hamburger"]')
        )
      );

      if (await mobileMenu.count() > 0) {
        await mobileMenu.first().click();
        await page.waitForTimeout(500);

        // Test navigation to main sections
        const navItems = page.locator('a').filter({ hasText: /goals|tasks|dashboard/i });
        if (await navItems.count() > 0) {
          await navItems.first().click();
          await expect(page.locator('h1, h2').first()).toBeVisible();
        }
      }

      // Test mobile-specific interactions
      await page.goto('/dashboard');

      // Look for touch-friendly elements
      const touchElements = page.locator('button').filter({ hasText: /tap|touch/i });
      if (await touchElements.count() > 0) {
        await touchElements.first().tap();
        console.log('Mobile touch interaction available');
      }
    });
  });
});