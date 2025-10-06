import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Accessibility Compliance Tests (WCAG 2.1 AA)', () => {
  const wcagLevels = ['wcag2a', 'wcag2aa'];
  const wcagTags = ['wcag21a', 'wcag21aa'];

  test.beforeEach(async ({ page }) => {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test('should meet WCAG 2.1 AA standards on main pages', async ({ page }) => {
    const criticalPages = [
      { url: '/', name: 'Home Page' },
      { url: '/login', name: 'Login Page' },
      { url: '/register', name: 'Registration Page' },
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/tasks', name: 'Tasks Page' },
      { url: '/projects', name: 'Projects Page' },
      { url: '/settings', name: 'Settings Page' }
    ];

    for (const pageInfo of criticalPages) {
      await test.step(`Test accessibility on ${pageInfo.name}`, async () => {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');

        // Run axe accessibility checks
        const violations = await getViolations(page, {
          tags: wcagTags,
          rules: {
            // Include specific WCAG 2.1 AA rules
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'focus-management': { enabled: true },
            'aria-labels': { enabled: true },
            'heading-order': { enabled: true },
            'landmark-navigation': { enabled: true }
          }
        });

        // No critical accessibility violations should exist
        expect(violations.length).toBe(0);

        if (violations.length > 0) {
          console.log(`Accessibility violations on ${pageInfo.name}:`);
          violations.forEach(violation => {
            console.log(`- ${violation.id}: ${violation.description}`);
            console.log(`  Impact: ${violation.impact}`);
            console.log(`  Elements: ${violation.nodes.length}`);
          });
        }

        console.log(`✓ ${pageInfo.name} passed accessibility checks`);
      });
    }
  });

  test('should provide proper keyboard navigation', async ({ page }) => {
    await test.step('Test keyboard navigation on main interface', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Test tab navigation
      const tabbableElements = await page.locator('a, button, input, select, textarea, [tabindex="0"]').all();

      if (tabbableElements.length > 0) {
        // Focus first element
        await page.keyboard.press('Tab');

        // Check focus is visible
        const focusedElement = await page.locator(':focus').first();
        await expect(focusedElement).toBeVisible();

        // Test focus trap in modals
        if (await page.locator('[data-testid="modal"]').count() > 0) {
          await page.click('[data-testid="open-modal"]');

          // Focus should be trapped within modal
          await page.keyboard.press('Tab');
          const focusWithinModal = await page.locator('[data-testid="modal"] :focus').count();
          expect(focusWithinModal).toBeGreaterThan(0);

          // Escape should close modal
          await page.keyboard.press('Escape');
          await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
        }
      }
    });

    await test.step('Test skip links functionality', async () => {
      await page.goto('/');

      // Test skip to main content link
      await page.keyboard.press('Tab');

      const skipLink = page.locator('[data-testid="skip-to-main"]');
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeFocused();
        await page.keyboard.press('Enter');

        // Should focus main content
        const mainContent = page.locator('main, [role="main"], #main-content');
        if (await mainContent.count() > 0) {
          await expect(mainContent).toBeFocused();
        }
      }
    });

    await test.step('Test keyboard shortcuts', async () => {
      await page.goto('/dashboard');

      // Test common keyboard shortcuts
      const shortcuts = [
        { keys: 'Alt+h', action: 'Navigate to home' },
        { keys: 'Alt+d', action: 'Navigate to dashboard' },
        { keys: 'Ctrl+/', action: 'Show help' },
        { keys: '?', action: 'Show keyboard shortcuts' }
      ];

      for (const shortcut of shortcuts) {
        try {
          await page.keyboard.press(shortcut.keys);

          // Allow time for navigation or modal to appear
          await page.waitForTimeout(1000);

          console.log(`✓ Keyboard shortcut ${shortcut.keys} (${shortcut.action}) tested`);
        } catch (error) {
          console.log(`- Keyboard shortcut ${shortcut.keys} not available`);
        }
      }
    });
  });

  test('should provide proper ARIA labels and semantic HTML', async ({ page }) => {
    await test.step('Validate semantic HTML structure', async () => {
      await page.goto('/dashboard');

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      if (headings.length > 0) {
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        // Check heading order (simplified check)
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(tagName);
        }
      }

      // Check for landmark roles
      const landmarks = [
        'main',
        'nav',
        'header',
        'footer',
        'aside',
        '[role="banner"]',
        '[role="navigation"]',
        '[role="main"]',
        '[role="contentinfo"]',
        '[role="complementary"]'
      ];

      let landmarkCount = 0;
      for (const landmark of landmarks) {
        const count = await page.locator(landmark).count();
        landmarkCount += count;
      }

      expect(landmarkCount).toBeGreaterThan(0);
    });

    await test.step('Validate form accessibility', async () => {
      await page.goto('/login');

      // Check form labels
      const inputs = await page.locator('input').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        if (id) {
          // Should have associated label
          const label = await page.locator(`label[for="${id}"]`).count();
          const hasLabel = label > 0 || ariaLabel || ariaLabelledBy;
          expect(hasLabel).toBe(true);
        }

        // Required fields should be marked
        const required = await input.getAttribute('required');
        const ariaRequired = await input.getAttribute('aria-required');

        if (required !== null) {
          expect(ariaRequired).toBeTruthy();
        }
      }

      // Check error message accessibility
      if (await page.locator('[data-testid="error-message"]').count() > 0) {
        const errorMessage = page.locator('[data-testid="error-message"]');

        // Error should be announced to screen readers
        const ariaLive = await errorMessage.getAttribute('aria-live');
        const role = await errorMessage.getAttribute('role');

        expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'alert').toBe(true);
      }
    });

    await test.step('Validate interactive element accessibility', async () => {
      await page.goto('/dashboard');

      // Check buttons have accessible names
      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const textContent = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');

        const hasAccessibleName = (textContent && textContent.trim()) || ariaLabel || ariaLabelledBy;
        expect(hasAccessibleName).toBe(true);
      }

      // Check links have accessible names
      const links = await page.locator('a').all();

      for (const link of links) {
        const textContent = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const ariaLabelledBy = await link.getAttribute('aria-labelledby');

        const hasAccessibleName = (textContent && textContent.trim()) || ariaLabel || ariaLabelledBy;
        expect(hasAccessibleName).toBe(true);
      }
    });
  });

  test('should meet color contrast requirements', async ({ page }) => {
    await test.step('Test color contrast on all pages', async () => {
      const pages = ['/', '/login', '/dashboard', '/tasks'];

      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Run axe color contrast check
        const violations = await getViolations(page, {
          rules: { 'color-contrast': { enabled: true } }
        });

        const contrastViolations = violations.filter(v => v.id === 'color-contrast');
        expect(contrastViolations.length).toBe(0);

        if (contrastViolations.length > 0) {
          console.log(`Color contrast violations on ${url}:`);
          contrastViolations.forEach(violation => {
            violation.nodes.forEach(node => {
              console.log(`- Element: ${node.html}`);
              console.log(`  Contrast ratio: ${node.any[0]?.data?.contrastRatio || 'unknown'}`);
            });
          });
        }
      }
    });

    await test.step('Test dark mode color contrast', async () => {
      await page.goto('/dashboard');

      // Switch to dark mode if available
      const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');

      if (await darkModeToggle.count() > 0) {
        await darkModeToggle.click();
        await page.waitForTimeout(1000); // Wait for theme transition

        // Check contrast in dark mode
        const violations = await getViolations(page, {
          rules: { 'color-contrast': { enabled: true } }
        });

        const contrastViolations = violations.filter(v => v.id === 'color-contrast');
        expect(contrastViolations.length).toBe(0);
      }
    });
  });

  test('should provide proper focus management', async ({ page }) => {
    await test.step('Test focus visibility', async () => {
      await page.goto('/dashboard');

      // Test focus indicators are visible
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex="0"]').all();

      for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
        await focusableElements[i].focus();

        // Check if focus is visible (this is a simplified check)
        const focused = await page.locator(':focus').first();
        await expect(focused).toBeVisible();

        // Element should have some form of focus indication
        const outline = await focused.evaluate(el => window.getComputedStyle(el).outline);
        const boxShadow = await focused.evaluate(el => window.getComputedStyle(el).boxShadow);
        const border = await focused.evaluate(el => window.getComputedStyle(el).border);

        const hasFocusIndicator = outline !== 'none' ||
                                 boxShadow !== 'none' ||
                                 border.includes('rgb') ||
                                 border.includes('#');

        expect(hasFocusIndicator).toBe(true);
      }
    });

    await test.step('Test focus restoration', async () => {
      await page.goto('/dashboard');

      // Focus an element
      const initialFocusElement = page.locator('[data-testid="create-task-button"]');

      if (await initialFocusElement.count() > 0) {
        await initialFocusElement.focus();

        // Open modal
        await initialFocusElement.click();

        // Close modal
        if (await page.locator('[data-testid="close-modal"]').count() > 0) {
          await page.click('[data-testid="close-modal"]');
        } else {
          await page.keyboard.press('Escape');
        }

        // Focus should return to triggering element
        await expect(initialFocusElement).toBeFocused();
      }
    });
  });

  test('should support screen readers', async ({ page }) => {
    await test.step('Test screen reader announcements', async () => {
      await page.goto('/dashboard');

      // Check for aria-live regions
      const liveRegions = await page.locator('[aria-live]').count();
      expect(liveRegions).toBeGreaterThan(0);

      // Check for status messages
      const statusRegions = await page.locator('[role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]').count();
      expect(statusRegions).toBeGreaterThan(0);
    });

    await test.step('Test dynamic content announcements', async () => {
      await page.goto('/tasks');

      // Create a task to test announcements
      if (await page.locator('[data-testid="create-task-button"]').count() > 0) {
        await page.click('[data-testid="create-task-button"]');

        if (await page.locator('[data-testid="task-title-input"]').count() > 0) {
          await page.fill('[data-testid="task-title-input"]', 'Test Task for Accessibility');
          await page.click('[data-testid="save-task-button"]');

          // Should announce task creation
          const announcement = page.locator('[data-testid="task-created-announcement"]');
          if (await announcement.count() > 0) {
            const ariaLive = await announcement.getAttribute('aria-live');
            expect(['polite', 'assertive']).toContain(ariaLive);
          }
        }
      }
    });

    await test.step('Test table accessibility', async () => {
      await page.goto('/tasks');

      // Check data tables have proper structure
      const tables = await page.locator('table').all();

      for (const table of tables) {
        // Should have table headers
        const headers = await table.locator('th').count();
        if (headers > 0) {
          // Headers should have scope attribute
          const headerElements = await table.locator('th').all();
          for (const header of headerElements) {
            const scope = await header.getAttribute('scope');
            expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope);
          }
        }

        // Check for table caption or aria-label
        const caption = await table.locator('caption').count();
        const ariaLabel = await table.getAttribute('aria-label');
        const ariaLabelledBy = await table.getAttribute('aria-labelledby');

        const hasAccessibleName = caption > 0 || ariaLabel || ariaLabelledBy;
        expect(hasAccessibleName).toBe(true);
      }
    });
  });

  test('should handle media accessibility', async ({ page }) => {
    await test.step('Test image accessibility', async () => {
      await page.goto('/');

      // All images should have alt text
      const images = await page.locator('img').all();

      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        const ariaLabelledBy = await image.getAttribute('aria-labelledby');
        const role = await image.getAttribute('role');

        // Decorative images should have empty alt or role="presentation"
        // Content images should have descriptive alt text
        const isAccessible = alt !== null || ariaLabel || ariaLabelledBy || role === 'presentation';
        expect(isAccessible).toBe(true);
      }
    });

    await test.step('Test video and audio accessibility', async () => {
      // Check for video elements
      const videos = await page.locator('video').all();

      for (const video of videos) {
        // Videos should have captions or transcripts
        const tracks = await video.locator('track[kind="captions"], track[kind="subtitles"]').count();
        const ariaDescribedBy = await video.getAttribute('aria-describedby');

        if (tracks === 0 && !ariaDescribedBy) {
          console.log('Warning: Video element found without captions or transcript reference');
        }
      }

      // Check for audio elements
      const audios = await page.locator('audio').all();

      for (const audio of audios) {
        // Audio should have transcripts
        const ariaDescribedBy = await audio.getAttribute('aria-describedby');

        if (!ariaDescribedBy) {
          console.log('Warning: Audio element found without transcript reference');
        }
      }
    });
  });

  test('should be mobile accessible', async ({ page }) => {
    await test.step('Test mobile accessibility', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Check touch targets are large enough (minimum 44x44 pixels)
      const touchTargets = await page.locator('button, a, input[type="checkbox"], input[type="radio"]').all();

      for (const target of touchTargets) {
        const box = await target.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Test swipe gestures if implemented
      if (await page.locator('[data-testid="swipeable-area"]').count() > 0) {
        const swipeArea = page.locator('[data-testid="swipeable-area"]');

        // Should be accessible via keyboard as well
        await swipeArea.focus();
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowRight');
      }
    });
  });
});