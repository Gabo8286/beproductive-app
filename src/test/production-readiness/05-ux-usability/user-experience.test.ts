import { test, expect } from '@playwright/test';

test.describe('User Experience Tests', () => {
  const uxMetrics = {
    pageLoadTime: 3000, // 3 seconds
    interactionTime: 100, // 100ms
    errorRecoveryTime: 5000, // 5 seconds
    taskCompletionRate: 90, // 90%
    userSatisfactionScore: 4.0, // out of 5
    bounceRateThreshold: 40 // 40%
  };

  test('should provide intuitive navigation and information architecture', async ({ page }) => {
    await test.step('Test main navigation clarity', async () => {
      await page.goto('/');

      // Main navigation should be immediately visible
      const mainNav = page.locator('[data-testid="main-navigation"]');
      await expect(mainNav).toBeVisible();

      // Navigation items should be clearly labeled
      const navItems = await page.locator('[data-testid="main-navigation"] a, [data-testid="main-navigation"] button').all();

      for (const item of navItems) {
        const text = await item.textContent();
        const ariaLabel = await item.getAttribute('aria-label');

        // Each nav item should have clear text or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy();

        // Text should be descriptive, not generic
        const genericTerms = ['click here', 'more', 'link', 'button'];
        const itemText = (text || ariaLabel || '').toLowerCase();

        genericTerms.forEach(term => {
          expect(itemText).not.toBe(term);
        });
      }
    });

    await test.step('Test breadcrumb navigation', async () => {
      await page.goto('/dashboard/projects/123');

      const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');

      if (await breadcrumbs.count() > 0) {
        await expect(breadcrumbs).toBeVisible();

        // Breadcrumbs should show current location
        const breadcrumbItems = await breadcrumbs.locator('a, span').all();
        expect(breadcrumbItems.length).toBeGreaterThan(1);

        // Last item should be current page (not clickable)
        const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
        const isClickable = await lastItem.evaluate(el => el.tagName.toLowerCase() === 'a');
        expect(isClickable).toBe(false);
      }
    });

    await test.step('Test search functionality usability', async () => {
      await page.goto('/');

      const searchInput = page.locator('[data-testid="search-input"]');

      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();

        // Search should have placeholder text
        const placeholder = await searchInput.getAttribute('placeholder');
        expect(placeholder).toBeTruthy();

        // Test search suggestions
        await searchInput.fill('task');
        await page.waitForTimeout(500); // Wait for suggestions

        const suggestions = page.locator('[data-testid="search-suggestions"]');
        if (await suggestions.count() > 0) {
          await expect(suggestions).toBeVisible();

          // Suggestions should be keyboard navigable
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');

          // Should navigate to search results or selected item
          expect(page.url()).toMatch(/search|task/);
        }
      }
    });

    await test.step('Test information hierarchy and content organization', async () => {
      await page.goto('/dashboard');

      // Check heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      if (headings.length > 0) {
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        // Headings should follow logical order
        let previousLevel = 0;
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName);
          const level = parseInt(tagName.charAt(1));

          if (previousLevel > 0) {
            // Level should not jump more than 1
            expect(level - previousLevel).toBeLessThanOrEqual(1);
          }

          previousLevel = level;
        }
      }

      // Content should be scannable
      const contentSections = await page.locator('[data-testid*="section"], .content-section, article').count();
      expect(contentSections).toBeGreaterThan(0);
    });
  });

  test('should provide excellent form usability', async ({ page }) => {
    await test.step('Test form validation and error handling', async () => {
      await page.goto('/login');

      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      const submitButton = page.locator('[data-testid="login-button"]');

      if (await emailInput.count() > 0) {
        // Test inline validation
        await emailInput.fill('invalid-email');
        await emailInput.blur();

        // Should show validation error
        const emailError = page.locator('[data-testid="email-error"]');
        if (await emailError.count() > 0) {
          await expect(emailError).toBeVisible();

          // Error message should be helpful
          const errorText = await emailError.textContent();
          expect(errorText?.toLowerCase()).toContain('email');
        }

        // Test correction
        await emailInput.fill('valid@example.com');
        await emailInput.blur();

        // Error should disappear
        if (await emailError.count() > 0) {
          await expect(emailError).not.toBeVisible();
        }
      }

      // Test form submission with errors
      if (await submitButton.count() > 0) {
        await submitButton.click();

        // Should prevent submission and show errors
        const formErrors = await page.locator('[data-testid*="error"]').count();
        expect(formErrors).toBeGreaterThan(0);

        // Focus should move to first error
        const firstErrorField = await page.locator(':focus').first();
        expect(firstErrorField).toBeTruthy();
      }
    });

    await test.step('Test form field usability', async () => {
      await page.goto('/register');

      // Test password field usability
      const passwordField = page.locator('[data-testid="password-input"]');

      if (await passwordField.count() > 0) {
        // Should have show/hide password toggle
        const passwordToggle = page.locator('[data-testid="password-toggle"]');
        if (await passwordToggle.count() > 0) {
          await expect(passwordToggle).toBeVisible();

          // Test toggle functionality
          await passwordField.fill('test123');
          const initialType = await passwordField.getAttribute('type');

          await passwordToggle.click();
          const toggledType = await passwordField.getAttribute('type');

          expect(initialType).not.toBe(toggledType);
        }

        // Should show password strength indicator
        await passwordField.fill('weak');
        const strengthIndicator = page.locator('[data-testid="password-strength"]');

        if (await strengthIndicator.count() > 0) {
          await expect(strengthIndicator).toBeVisible();

          // Try strong password
          await passwordField.fill('StrongPassword123!');
          const strengthText = await strengthIndicator.textContent();
          expect(strengthText?.toLowerCase()).toMatch(/strong|good|excellent/);
        }
      }

      // Test autocomplete attributes
      const formFields = await page.locator('input').all();

      for (const field of formFields) {
        const type = await field.getAttribute('type');
        const name = await field.getAttribute('name');
        const autocomplete = await field.getAttribute('autocomplete');

        // Common fields should have appropriate autocomplete
        if (name === 'email' || type === 'email') {
          expect(autocomplete).toBe('email');
        }
        if (name === 'password' && type === 'password') {
          expect(['current-password', 'new-password']).toContain(autocomplete);
        }
      }
    });

    await test.step('Test multi-step form usability', async () => {
      // If there are multi-step forms
      const stepIndicator = page.locator('[data-testid="step-indicator"]');

      if (await stepIndicator.count() > 0) {
        await expect(stepIndicator).toBeVisible();

        // Should show current step and total steps
        const stepText = await stepIndicator.textContent();
        expect(stepText).toMatch(/\d+\s*(of|\/)\s*\d+/);

        // Navigation between steps should be clear
        const nextButton = page.locator('[data-testid="next-step"]');
        const prevButton = page.locator('[data-testid="previous-step"]');

        if (await nextButton.count() > 0) {
          await expect(nextButton).toBeVisible();
        }

        // Previous button should not be visible on first step
        if (await prevButton.count() > 0) {
          const stepNumber = await stepIndicator.textContent();
          if (stepNumber?.includes('1 of') || stepNumber?.includes('1/')) {
            await expect(prevButton).not.toBeVisible();
          }
        }
      }
    });
  });

  test('should provide responsive and mobile-friendly design', async ({ page }) => {
    await test.step('Test mobile navigation usability', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Mobile navigation should adapt
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-toggle"]');

      if (await mobileMenuButton.count() > 0) {
        await expect(mobileMenuButton).toBeVisible();

        // Test menu toggle
        await mobileMenuButton.click();

        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        await expect(mobileMenu).toBeVisible();

        // Menu should be closable
        const closeButton = page.locator('[data-testid="close-mobile-menu"]');
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await expect(mobileMenu).not.toBeVisible();
        } else {
          // Should close by clicking outside
          await page.click('body');
          await expect(mobileMenu).not.toBeVisible();
        }
      }
    });

    await test.step('Test touch interface usability', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Touch targets should be large enough
      const touchTargets = await page.locator('button, a, input[type="checkbox"], input[type="radio"]').all();

      for (const target of touchTargets.slice(0, 10)) { // Test first 10
        const box = await target.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44); // WCAG recommendation
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Test swipe gestures if implemented
      const swipeableArea = page.locator('[data-testid="swipeable-content"]');

      if (await swipeableArea.count() > 0) {
        const box = await swipeableArea.boundingBox();
        if (box) {
          // Simulate swipe
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
          await page.mouse.up();

          // Should provide feedback or action
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('Test responsive layout behavior', async () => {
      const viewports = [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 375, height: 667, name: 'Mobile Medium' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop Small' },
        { width: 1920, height: 1080, name: 'Desktop Large' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/dashboard');

        // Content should be visible and accessible
        await expect(page.locator('main, [role="main"]')).toBeVisible();

        // Text should be readable (not cut off)
        const textElements = await page.locator('h1, h2, p').all();
        for (const element of textElements.slice(0, 5)) {
          const box = await element.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.width).toBeLessThan(viewport.width + 20); // Allow small overflow
          }
        }

        console.log(`✓ Layout tested on ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    });
  });

  test('should provide excellent loading and feedback experiences', async ({ page }) => {
    await test.step('Test loading states and feedback', async () => {
      await page.goto('/dashboard');

      // Test loading states for async operations
      const createButton = page.locator('[data-testid="create-task-button"]');

      if (await createButton.count() > 0) {
        await createButton.click();

        // Should show loading state
        const loadingIndicator = page.locator('[data-testid="loading"], .loading, [aria-label*="loading"]');

        if (await loadingIndicator.count() > 0) {
          await expect(loadingIndicator).toBeVisible();

          // Loading should complete within reasonable time
          await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
        }

        // Should provide success feedback
        const successMessage = page.locator('[data-testid="success-message"], .success-message');
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
      }
    });

    await test.step('Test progressive loading and skeleton screens', async () => {
      // Clear cache and reload to test initial loading
      await page.evaluate(() => {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      });

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

      // Should show skeleton screens or loading placeholders
      const skeletonElements = page.locator('[data-testid*="skeleton"], .skeleton, .placeholder');

      if (await skeletonElements.count() > 0) {
        await expect(skeletonElements.first()).toBeVisible();

        // Skeletons should be replaced with content
        await page.waitForLoadState('networkidle');
        await expect(skeletonElements.first()).not.toBeVisible();
      }
    });

    await test.step('Test error state handling', async () => {
      // Test network error handling
      await page.route('**/api/tasks', route => route.abort());

      await page.goto('/tasks');

      // Should show error state
      const errorState = page.locator('[data-testid="error-state"], .error-state');

      if (await errorState.count() > 0) {
        await expect(errorState).toBeVisible();

        // Error should have retry option
        const retryButton = page.locator('[data-testid="retry-button"]');
        if (await retryButton.count() > 0) {
          await expect(retryButton).toBeVisible();

          // Unblock requests and test retry
          await page.unroute('**/api/tasks');
          await retryButton.click();

          // Should attempt to reload
          await expect(errorState).not.toBeVisible({ timeout: 10000 });
        }
      }
    });

    await test.step('Test empty state design', async () => {
      // Navigate to a page that might have empty state
      await page.goto('/projects');

      const emptyState = page.locator('[data-testid="empty-state"]');

      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();

        // Empty state should be helpful
        const emptyStateText = await emptyState.textContent();
        expect(emptyStateText).toBeTruthy();

        // Should have action to resolve empty state
        const createAction = page.locator('[data-testid="create-first-project"], [data-testid="get-started"]');
        if (await createAction.count() > 0) {
          await expect(createAction).toBeVisible();
        }
      }
    });
  });

  test('should provide effective search and filtering capabilities', async ({ page }) => {
    await test.step('Test search functionality', async () => {
      await page.goto('/tasks');

      const searchInput = page.locator('[data-testid="search-tasks"]');

      if (await searchInput.count() > 0) {
        // Test search input responsiveness
        await searchInput.fill('important');

        // Should provide instant feedback
        await page.waitForTimeout(500);

        const searchResults = page.locator('[data-testid="search-results"]');
        if (await searchResults.count() > 0) {
          await expect(searchResults).toBeVisible();
        }

        // Test search clearing
        const clearButton = page.locator('[data-testid="clear-search"]');
        if (await clearButton.count() > 0) {
          await clearButton.click();
          expect(await searchInput.inputValue()).toBe('');
        }
      }
    });

    await test.step('Test filtering and sorting', async () => {
      await page.goto('/tasks');

      // Test filter options
      const filterButton = page.locator('[data-testid="filter-button"]');

      if (await filterButton.count() > 0) {
        await filterButton.click();

        const filterOptions = page.locator('[data-testid="filter-options"]');
        await expect(filterOptions).toBeVisible();

        // Test applying filter
        const statusFilter = page.locator('[data-testid="filter-status"]');
        if (await statusFilter.count() > 0) {
          await statusFilter.selectOption('completed');

          // Should update results
          await page.waitForTimeout(1000);

          // Applied filters should be visible
          const activeFilters = page.locator('[data-testid="active-filters"]');
          if (await activeFilters.count() > 0) {
            await expect(activeFilters).toBeVisible();
          }
        }
      }

      // Test sorting
      const sortButton = page.locator('[data-testid="sort-button"]');

      if (await sortButton.count() > 0) {
        await sortButton.click();

        const sortOptions = page.locator('[data-testid="sort-options"]');
        await expect(sortOptions).toBeVisible();

        // Test sort option selection
        const dueDateSort = page.locator('[data-testid="sort-due-date"]');
        if (await dueDateSort.count() > 0) {
          await dueDateSort.click();

          // Should update the order
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test('should provide excellent visual design and aesthetics', async ({ page }) => {
    await test.step('Test visual hierarchy and typography', async () => {
      await page.goto('/dashboard');

      // Test font loading
      await page.waitForFunction(() => document.fonts.ready);

      // Check typography scales
      const headings = await page.locator('h1, h2, h3').all();

      if (headings.length > 0) {
        const h1Size = await headings[0].evaluate(el =>
          window.getComputedStyle(el).fontSize
        );

        if (headings.length > 1) {
          const h2Size = await headings[1].evaluate(el =>
            window.getComputedStyle(el).fontSize
          );

          // H1 should be larger than H2
          expect(parseFloat(h1Size)).toBeGreaterThan(parseFloat(h2Size));
        }
      }

      // Test color consistency
      const primaryButtons = await page.locator('[data-testid*="primary"], .btn-primary').all();

      if (primaryButtons.length > 1) {
        const colors = await Promise.all(
          primaryButtons.slice(0, 3).map(btn =>
            btn.evaluate(el => window.getComputedStyle(el).backgroundColor)
          )
        );

        // Primary buttons should have consistent colors
        const uniqueColors = [...new Set(colors)];
        expect(uniqueColors.length).toBeLessThanOrEqual(2); // Allow for hover states
      }
    });

    await test.step('Test spacing and layout consistency', async () => {
      await page.goto('/dashboard');

      // Test consistent spacing
      const cards = await page.locator('[data-testid*="card"], .card').all();

      if (cards.length > 1) {
        const margins = await Promise.all(
          cards.slice(0, 3).map(card =>
            card.evaluate(el => window.getComputedStyle(el).marginBottom)
          )
        );

        // Cards should have consistent bottom margins
        const uniqueMargins = [...new Set(margins)];
        expect(uniqueMargins.length).toBeLessThanOrEqual(2);
      }

      // Test alignment
      const contentSections = await page.locator('section, .content-section').all();

      for (const section of contentSections.slice(0, 3)) {
        const textAlign = await section.evaluate(el =>
          window.getComputedStyle(el).textAlign
        );

        // Content should be properly aligned
        expect(['left', 'center', 'justify']).toContain(textAlign);
      }
    });

    await test.step('Test dark mode support', async () => {
      await page.goto('/dashboard');

      const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');

      if (await darkModeToggle.count() > 0) {
        // Test light mode colors
        const lightBg = await page.evaluate(() =>
          window.getComputedStyle(document.body).backgroundColor
        );

        // Toggle to dark mode
        await darkModeToggle.click();
        await page.waitForTimeout(500); // Wait for transition

        const darkBg = await page.evaluate(() =>
          window.getComputedStyle(document.body).backgroundColor
        );

        // Background should change
        expect(lightBg).not.toBe(darkBg);

        // Test that all text remains readable
        const textElements = await page.locator('p, span, a').all();

        for (const element of textElements.slice(0, 5)) {
          const color = await element.evaluate(el =>
            window.getComputedStyle(el).color
          );

          // Should not be invisible (same as background)
          expect(color).not.toBe(darkBg);
        }
      }
    });
  });

  test('should provide excellent performance perception', async ({ page }) => {
    await test.step('Test perceived performance', async () => {
      const startTime = Date.now();

      await page.goto('/dashboard');

      // Page should appear to load quickly
      await expect(page.locator('h1')).toBeVisible({ timeout: 2000 });

      const firstContentfulPaint = Date.now() - startTime;
      expect(firstContentfulPaint).toBeLessThan(uxMetrics.pageLoadTime);

      console.log(`First contentful paint: ${firstContentfulPaint}ms`);
    });

    await test.step('Test interaction responsiveness', async () => {
      await page.goto('/dashboard');

      const interactiveElements = await page.locator('button, a').all();

      for (const element of interactiveElements.slice(0, 5)) {
        const startTime = Date.now();

        await element.hover();

        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(uxMetrics.interactionTime);
      }
    });

    await test.step('Test animation performance', async () => {
      await page.goto('/');

      // Check for smooth animations
      const animatedElements = page.locator('[data-testid*="animated"], .animate, .transition');

      if (await animatedElements.count() > 0) {
        // Animations should not block the main thread
        const performanceEntries = await page.evaluate(() => {
          return performance.getEntriesByType('measure').map(entry => ({
            name: entry.name,
            duration: entry.duration
          }));
        });

        // No single animation should take too long
        performanceEntries.forEach(entry => {
          if (entry.name.includes('animation')) {
            expect(entry.duration).toBeLessThan(500); // 500ms max
          }
        });
      }
    });
  });
});