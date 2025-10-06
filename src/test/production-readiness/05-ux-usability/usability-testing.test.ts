import { test, expect } from '@playwright/test';

test.describe('Usability Testing', () => {
  const usabilityMetrics = {
    taskCompletionRate: 90, // 90%
    taskCompletionTime: 30000, // 30 seconds for simple tasks
    errorRate: 5, // 5% error rate
    satisfactionScore: 4.0, // out of 5
    learnabilityTime: 60000, // 1 minute to learn basic tasks
    memoryRetention: 80 // 80% task retention after 1 week
  };

  test('should enable efficient task completion flows', async ({ page }) => {
    await test.step('Test primary user journey - Task Creation', async () => {
      const startTime = Date.now();

      await page.goto('/dashboard');

      // Primary task: Create a new task
      const createTaskButton = page.locator('[data-testid="create-task-button"]');
      await expect(createTaskButton).toBeVisible();

      await createTaskButton.click();

      // Task creation form should be intuitive
      const taskForm = page.locator('[data-testid="task-form"]');
      await expect(taskForm).toBeVisible();

      // Essential fields should be prominently displayed
      const titleInput = page.locator('[data-testid="task-title-input"]');
      await expect(titleInput).toBeVisible();
      await expect(titleInput).toBeFocused(); // Should auto-focus

      // Fill in task details
      await titleInput.fill('Complete project presentation');

      const descriptionInput = page.locator('[data-testid="task-description-input"]');
      if (await descriptionInput.count() > 0) {
        await descriptionInput.fill('Prepare slides and practice presentation for client meeting');
      }

      // Priority should be easy to set
      const prioritySelect = page.locator('[data-testid="task-priority-select"]');
      if (await prioritySelect.count() > 0) {
        await prioritySelect.selectOption('high');
      }

      // Due date should be user-friendly
      const dueDateInput = page.locator('[data-testid="task-due-date-input"]');
      if (await dueDateInput.count() > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dueDateInput.fill(tomorrow.toISOString().split('T')[0]);
      }

      // Save task
      const saveButton = page.locator('[data-testid="save-task-button"]');
      await saveButton.click();

      // Should provide confirmation
      const successMessage = page.locator('[data-testid="task-created-message"]');
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      }

      // Should return to task list with new task visible
      const newTask = page.locator('[data-testid="task-item"]').filter({ hasText: 'Complete project presentation' });
      await expect(newTask).toBeVisible();

      const completionTime = Date.now() - startTime;
      expect(completionTime).toBeLessThan(usabilityMetrics.taskCompletionTime);

      console.log(`Task creation completed in: ${completionTime}ms`);
    });

    await test.step('Test secondary user journey - Task Management', async () => {
      await page.goto('/tasks');

      // Find and edit a task
      const firstTask = page.locator('[data-testid="task-item"]').first();
      await expect(firstTask).toBeVisible();

      // Tasks should show key information at a glance
      const taskTitle = firstTask.locator('[data-testid="task-title"]');
      const taskDueDate = firstTask.locator('[data-testid="task-due-date"]');
      const taskPriority = firstTask.locator('[data-testid="task-priority"]');

      await expect(taskTitle).toBeVisible();

      // Action buttons should be easily accessible
      const editButton = firstTask.locator('[data-testid="edit-task-button"]');
      const completeButton = firstTask.locator('[data-testid="complete-task-button"]');
      const deleteButton = firstTask.locator('[data-testid="delete-task-button"]');

      if (await editButton.count() > 0) {
        await editButton.click();

        // Edit form should pre-populate fields
        const editTitleInput = page.locator('[data-testid="task-title-input"]');
        const currentTitle = await editTitleInput.inputValue();
        expect(currentTitle).toBeTruthy();

        // Make a quick edit
        await editTitleInput.fill(currentTitle + ' (Updated)');
        await page.click('[data-testid="save-task-button"]');

        // Should update immediately
        await expect(page.locator(`text=${currentTitle} (Updated)`)).toBeVisible();
      }

      // Test task completion
      if (await completeButton.count() > 0) {
        await completeButton.click();

        // Should provide immediate visual feedback
        const completedTask = firstTask.locator('[data-testid="task-completed-indicator"]');
        if (await completedTask.count() > 0) {
          await expect(completedTask).toBeVisible();
        }

        // Task should move to completed section or change appearance
        const taskStatus = await firstTask.getAttribute('data-status');
        expect(taskStatus).toBe('completed');
      }
    });

    await test.step('Test search and filter efficiency', async () => {
      await page.goto('/tasks');

      const startTime = Date.now();

      // Search should be prominently available
      const searchInput = page.locator('[data-testid="search-tasks"]');
      await expect(searchInput).toBeVisible();

      // Test search functionality
      await searchInput.fill('presentation');

      // Should provide instant results
      await page.waitForTimeout(500);

      const searchResults = page.locator('[data-testid="task-item"]');
      const resultCount = await searchResults.count();

      if (resultCount > 0) {
        // Results should be relevant
        const firstResult = searchResults.first();
        const resultText = await firstResult.textContent();
        expect(resultText?.toLowerCase()).toContain('presentation');
      }

      // Clear search
      await searchInput.clear();

      // Test filtering
      const filterButton = page.locator('[data-testid="filter-button"]');
      if (await filterButton.count() > 0) {
        await filterButton.click();

        const highPriorityFilter = page.locator('[data-testid="filter-high-priority"]');
        if (await highPriorityFilter.count() > 0) {
          await highPriorityFilter.click();

          // Should filter results immediately
          await page.waitForTimeout(500);

          const filteredTasks = await page.locator('[data-testid="task-item"]').all();
          for (const task of filteredTasks.slice(0, 3)) {
            const priority = await task.getAttribute('data-priority');
            expect(priority).toBe('high');
          }
        }
      }

      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(5000); // Should be fast

      console.log(`Search and filter completed in: ${searchTime}ms`);
    });
  });

  test('should provide excellent onboarding experience', async ({ page }) => {
    await test.step('Test first-time user onboarding', async () => {
      // Simulate first-time user
      await page.goto('/', { waitUntil: 'networkidle' });

      // Check for onboarding elements
      const welcomeMessage = page.locator('[data-testid="welcome-message"]');
      const onboardingTour = page.locator('[data-testid="onboarding-tour"]');
      const quickStartGuide = page.locator('[data-testid="quick-start-guide"]');

      if (await welcomeMessage.count() > 0) {
        await expect(welcomeMessage).toBeVisible();

        // Welcome message should be friendly and informative
        const welcomeText = await welcomeMessage.textContent();
        expect(welcomeText).toBeTruthy();
        expect(welcomeText?.length).toBeGreaterThan(20);
      }

      if (await onboardingTour.count() > 0) {
        await expect(onboardingTour).toBeVisible();

        // Tour should be skippable
        const skipButton = page.locator('[data-testid="skip-tour"]');
        if (await skipButton.count() > 0) {
          await expect(skipButton).toBeVisible();
        }

        // Tour should have clear navigation
        const nextButton = page.locator('[data-testid="tour-next"]');
        if (await nextButton.count() > 0) {
          await nextButton.click();

          // Should advance to next step
          const stepIndicator = page.locator('[data-testid="tour-step-indicator"]');
          if (await stepIndicator.count() > 0) {
            const stepText = await stepIndicator.textContent();
            expect(stepText).toMatch(/2|next|step/i);
          }
        }
      }
    });

    await test.step('Test progressive disclosure of features', async () => {
      await page.goto('/dashboard');

      // Advanced features should be discoverable but not overwhelming
      const advancedFeatures = page.locator('[data-testid*="advanced"], [data-testid*="pro"]');

      if (await advancedFeatures.count() > 0) {
        // Should be clearly marked as advanced
        const firstAdvanced = advancedFeatures.first();
        const tooltip = await firstAdvanced.getAttribute('title') || await firstAdvanced.getAttribute('aria-label');
        expect(tooltip).toBeTruthy();
      }

      // Help should be contextually available
      const helpButton = page.locator('[data-testid="help-button"], [data-testid="support-button"]');
      if (await helpButton.count() > 0) {
        await expect(helpButton).toBeVisible();

        await helpButton.click();

        const helpContent = page.locator('[data-testid="help-content"]');
        if (await helpContent.count() > 0) {
          await expect(helpContent).toBeVisible();
        }
      }
    });

    await test.step('Test empty state guidance', async () => {
      // Navigate to a potentially empty section
      await page.goto('/projects');

      const emptyState = page.locator('[data-testid="empty-state"]');

      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();

        // Empty state should provide clear guidance
        const emptyStateMessage = await emptyState.textContent();
        expect(emptyStateMessage).toBeTruthy();

        // Should have clear call-to-action
        const createButton = page.locator('[data-testid="create-first-project"]');
        if (await createButton.count() > 0) {
          await expect(createButton).toBeVisible();

          // Button text should be encouraging
          const buttonText = await createButton.textContent();
          expect(buttonText?.toLowerCase()).toMatch(/create|start|begin|get started/);
        }
      }
    });
  });

  test('should handle errors gracefully and provide clear recovery paths', async ({ page }) => {
    await test.step('Test form validation error handling', async () => {
      await page.goto('/login');

      const submitButton = page.locator('[data-testid="login-button"]');
      await submitButton.click();

      // Should show clear validation errors
      const errorMessages = page.locator('[data-testid*="error"]');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);

      // Errors should be specific and actionable
      const firstError = errorMessages.first();
      const errorText = await firstError.textContent();
      expect(errorText).toBeTruthy();
      expect(errorText?.toLowerCase()).toMatch(/required|invalid|enter|provide/);

      // Focus should move to first error field
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Fixing the error should clear the message
      const emailInput = page.locator('[data-testid="email-input"]');
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
        await emailInput.blur();

        // Email error should disappear
        const emailError = page.locator('[data-testid="email-error"]');
        if (await emailError.count() > 0) {
          await expect(emailError).not.toBeVisible();
        }
      }
    });

    await test.step('Test network error recovery', async () => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());

      await page.goto('/tasks');

      // Should show appropriate error state
      const errorState = page.locator('[data-testid="error-state"]');
      if (await errorState.count() > 0) {
        await expect(errorState).toBeVisible();

        // Error message should be user-friendly
        const errorMessage = await errorState.textContent();
        expect(errorMessage?.toLowerCase()).not.toContain('500');
        expect(errorMessage?.toLowerCase()).not.toContain('undefined');
        expect(errorMessage?.toLowerCase()).toMatch(/connection|network|try again|problem/);

        // Should provide retry option
        const retryButton = page.locator('[data-testid="retry-button"]');
        if (await retryButton.count() > 0) {
          await expect(retryButton).toBeVisible();

          // Restore network and test retry
          await page.unroute('**/api/**');
          await retryButton.click();

          // Should attempt to recover
          await expect(errorState).not.toBeVisible({ timeout: 10000 });
        }
      }
    });

    await test.step('Test graceful degradation', async () => {
      // Test with JavaScript disabled features
      await page.addInitScript(() => {
        // Simulate feature not available
        delete (window as any).WebSocket;
      });

      await page.goto('/dashboard');

      // Core functionality should still work
      await expect(page.locator('main')).toBeVisible();

      // Should show fallback for missing features
      const fallbackMessage = page.locator('[data-testid="feature-unavailable"]');
      if (await fallbackMessage.count() > 0) {
        const fallbackText = await fallbackMessage.textContent();
        expect(fallbackText).toMatch(/refresh|update|feature|available/i);
      }
    });
  });

  test('should provide excellent accessibility usability', async ({ page }) => {
    await test.step('Test keyboard-only navigation efficiency', async () => {
      await page.goto('/dashboard');

      // Test tab order makes sense
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex="0"]').all();

      if (focusableElements.length > 0) {
        // First tab should go to skip link or main navigation
        await page.keyboard.press('Tab');
        const firstFocus = await page.locator(':focus').textContent();
        expect(firstFocus?.toLowerCase()).toMatch(/skip|menu|navigation|main/);

        // Should be able to reach all major functions with keyboard
        let tabCount = 0;
        const maxTabs = 20;

        while (tabCount < maxTabs) {
          await page.keyboard.press('Tab');
          tabCount++;

          const focusedElement = page.locator(':focus');
          const text = await focusedElement.textContent();

          if (text?.toLowerCase().includes('create') && text?.toLowerCase().includes('task')) {
            // Found main action with keyboard
            await page.keyboard.press('Enter');

            // Should open task creation
            await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
            break;
          }
        }

        expect(tabCount).toBeLessThan(maxTabs);
      }
    });

    await test.step('Test screen reader usability patterns', async () => {
      await page.goto('/tasks');

      // Check for proper heading structure for screen readers
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      if (headings.length > 0) {
        // Page should have clear heading hierarchy
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        // Headings should be descriptive
        for (const heading of headings.slice(0, 3)) {
          const text = await heading.textContent();
          expect(text?.trim().length).toBeGreaterThan(2);
        }
      }

      // Check for live regions for dynamic content
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
      expect(liveRegions).toBeGreaterThan(0);

      // Check for descriptive labels
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 5)) {
        const label = await button.textContent() ||
                     await button.getAttribute('aria-label') ||
                     await button.getAttribute('title');
        expect(label?.trim()).toBeTruthy();
      }
    });

    await test.step('Test high contrast mode compatibility', async () => {
      // Test with high contrast simulation
      await page.addStyleTag({
        content: `
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
          a { color: yellow !important; }
        `
      });

      await page.goto('/dashboard');

      // Content should still be visible and usable
      await expect(page.locator('h1')).toBeVisible();

      // Interactive elements should be distinguishable
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) {
        const box = await button.boundingBox();
        expect(box).toBeTruthy();
      }
    });
  });

  test('should provide mobile usability excellence', async ({ page }) => {
    await test.step('Test mobile task completion efficiency', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      const startTime = Date.now();

      // Mobile navigation should be accessible
      const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
      if (await mobileMenu.count() > 0) {
        await mobileMenu.click();

        const menuItems = page.locator('[data-testid="mobile-menu"] a');
        await expect(menuItems.first()).toBeVisible();

        // Navigate to tasks
        const tasksLink = page.locator('[data-testid="mobile-menu"] a').filter({ hasText: 'Tasks' });
        if (await tasksLink.count() > 0) {
          await tasksLink.click();
        }
      } else {
        await page.goto('/tasks');
      }

      // Create task on mobile should be efficient
      const mobileCreateButton = page.locator('[data-testid="mobile-create-task"], [data-testid="create-task-button"]');
      if (await mobileCreateButton.count() > 0) {
        await mobileCreateButton.click();

        // Form should be mobile-optimized
        const titleInput = page.locator('[data-testid="task-title-input"]');
        await expect(titleInput).toBeVisible();

        // Input should be large enough for mobile
        const inputBox = await titleInput.boundingBox();
        expect(inputBox?.height).toBeGreaterThanOrEqual(44);

        await titleInput.fill('Mobile task');
        await page.click('[data-testid="save-task-button"]');

        // Should complete efficiently on mobile
        const completionTime = Date.now() - startTime;
        expect(completionTime).toBeLessThan(usabilityMetrics.taskCompletionTime * 1.5); // Allow 50% more time on mobile
      }
    });

    await test.step('Test mobile touch interface usability', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tasks');

      // Touch targets should be appropriately sized
      const touchTargets = await page.locator('button, a').all();

      for (const target of touchTargets.slice(0, 5)) {
        const box = await target.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Test swipe gestures if implemented
      const taskItems = await page.locator('[data-testid="task-item"]').all();

      if (taskItems.length > 0) {
        const firstTask = taskItems[0];
        const box = await firstTask.boundingBox();

        if (box) {
          // Test swipe action
          await page.mouse.move(box.x + 50, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
          await page.mouse.up();

          // Should reveal actions or provide feedback
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('Test mobile form usability', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/register');

      // Form should be mobile-optimized
      const formInputs = await page.locator('input').all();

      for (const input of formInputs) {
        const inputType = await input.getAttribute('type');
        const inputMode = await input.getAttribute('inputmode');

        // Should use appropriate input types
        if (inputType === 'email') {
          expect(['email', null]).toContain(inputMode);
        }
        if (inputType === 'tel') {
          expect(['tel', null]).toContain(inputMode);
        }

        // Should have appropriate autocomplete
        const autocomplete = await input.getAttribute('autocomplete');
        if (inputType === 'email') {
          expect(autocomplete).toBe('email');
        }
      }

      // Mobile keyboard should not obscure form
      const emailInput = page.locator('[data-testid="email-input"]');
      if (await emailInput.count() > 0) {
        await emailInput.focus();

        // Input should remain visible when keyboard appears
        const inputBox = await emailInput.boundingBox();
        expect(inputBox?.y).toBeGreaterThan(0);
        expect(inputBox?.y).toBeLessThan(400); // Should be in upper half
      }
    });
  });

  test('should provide data-driven usability insights', async ({ page }) => {
    await test.step('Test user interaction tracking', async () => {
      await page.goto('/dashboard');

      // Should track meaningful user interactions
      const interactiveElements = await page.locator('button, a').all();

      for (const element of interactiveElements.slice(0, 3)) {
        await element.click();

        // Check if interaction is tracked
        const analytics = await page.evaluate(() => {
          return (window as any).analytics || (window as any).gtag || (window as any).dataLayer;
        });

        if (analytics) {
          console.log('Analytics tracking detected');
        }
      }
    });

    await test.step('Test A/B testing framework readiness', async () => {
      await page.goto('/');

      // Check for A/B testing framework
      const abTestFramework = await page.evaluate(() => {
        return (window as any).optimizely ||
               (window as any).experiment ||
               (window as any).abTest ||
               document.querySelector('[data-experiment]');
      });

      if (abTestFramework) {
        console.log('A/B testing framework detected');

        // Should be able to identify test variants
        const experimentElements = await page.locator('[data-experiment], [data-variant]').count();
        if (experimentElements > 0) {
          console.log(`Found ${experimentElements} experiment elements`);
        }
      }
    });

    await test.step('Test performance impact on usability', async () => {
      await page.goto('/dashboard');

      // Measure interaction delay
      const button = page.locator('[data-testid="create-task-button"]');

      if (await button.count() > 0) {
        const startTime = performance.now();
        await button.click();
        const clickDelay = performance.now() - startTime;

        expect(clickDelay).toBeLessThan(100); // Should respond quickly

        // Measure time to meaningful interaction
        const form = page.locator('[data-testid="task-form"]');
        await expect(form).toBeVisible();

        const totalTime = performance.now() - startTime;
        expect(totalTime).toBeLessThan(500); // Should be responsive

        console.log(`Interaction responsiveness: ${totalTime.toFixed(2)}ms`);
      }
    });
  });
});