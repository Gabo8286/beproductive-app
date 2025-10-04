import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("should have no accessibility violations on dashboard", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation
    await page.keyboard.press("Tab");
    let focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Navigate through all focusable elements
    const focusableElements = await page
      .locator('button, input, [tabindex]:not([tabindex="-1"])')
      .count();

    for (let i = 0; i < Math.min(focusableElements, 10); i++) {
      await page.keyboard.press("Tab");
      focusedElement = await page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });

  test("should have proper ARIA labels and roles", async ({ page }) => {
    await page.goto("/");

    // Check for required ARIA attributes
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute("aria-label");
      const hasAriaDescribedBy = await button.getAttribute("aria-describedby");
      const hasTextContent = await button.textContent();

      // Button should have accessible name
      expect(hasAriaLabel || hasTextContent).toBeTruthy();
    }

    // Check for proper heading hierarchy
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    let lastLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const level = parseInt(tagName.charAt(1));

      if (lastLevel > 0) {
        expect(level).toBeLessThanOrEqual(lastLevel + 1);
      }
      lastLevel = level;
    }
  });

  test("should support screen reader navigation", async ({ page }) => {
    await page.goto("/");

    // Check for landmarks
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for skip links
    await page.keyboard.press("Tab");
    const skipLink = page.locator(
      'a[href="#main-content"], a:has-text("Skip to")',
    );
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeFocused();
    }

    // Test live regions
    const liveRegions = page.locator("[aria-live]");
    const liveRegionCount = await liveRegions.count();

    for (let i = 0; i < liveRegionCount; i++) {
      const liveRegion = liveRegions.nth(i);
      const ariaLive = await liveRegion.getAttribute("aria-live");
      expect(["polite", "assertive", "off"]).toContain(ariaLive);
    }
  });

  test("should meet color contrast requirements", async ({ page }) => {
    await page.goto("/");

    const contrastResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include('[data-testid="main-content"]')
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      (violation) => violation.id === "color-contrast",
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test("should support high contrast mode", async ({ page }) => {
    await page.goto("/");

    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `,
    });

    await page.emulateMedia({ "prefers-contrast": "high" });

    // Verify high contrast elements are visible
    const textElements = page.locator("p, span, button, input, label");
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      await expect(textElements.nth(i)).toBeVisible();
    }
  });

  test("should support reduced motion preferences", async ({ page }) => {
    await page.goto("/");

    // Set prefers-reduced-motion
    await page.emulateMedia({ "prefers-reduced-motion": "reduce" });

    // Trigger an animation
    await page.locator('[data-testid="add-widget"]').click();

    // Check that animations are reduced/disabled
    const animatedElements = page.locator(
      '[class*="animate"], [style*="transition"]',
    );
    const elementCount = await animatedElements.count();

    for (let i = 0; i < elementCount; i++) {
      const element = animatedElements.nth(i);
      const computedStyle = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration,
        };
      });

      // Animations should be disabled or very short
      expect(
        computedStyle.animationDuration === "0s" ||
          computedStyle.transitionDuration === "0s" ||
          computedStyle.animationDuration === "none",
      ).toBeTruthy();
    }
  });

  test("should have accessible form validation", async ({ page }) => {
    await page.goto("/");

    // Find and test a form
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // Submit empty form to trigger validation
    await page.locator('button[type="submit"]').click();

    // Check for error messages with proper ARIA attributes
    const errorMessages = page.locator(
      '[role="alert"], [aria-invalid="true"] + *, .error-message',
    );
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorElement = errorMessages.nth(i);
        await expect(errorElement).toBeVisible();

        // Error should be announced to screen readers
        const hasRole = await errorElement.getAttribute("role");
        const hasAriaLive = await errorElement.getAttribute("aria-live");
        expect(hasRole === "alert" || hasAriaLive).toBeTruthy();
      }
    }
  });

  test("should support dark mode accessibility", async ({ page }) => {
    await page.goto("/");

    // Switch to dark mode
    await page.locator('[data-testid="theme-toggle"]').click();

    // Verify dark mode is applied
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Run accessibility scan in dark mode
    const darkModeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(darkModeResults.violations).toEqual([]);
  });

  test("should support mobile accessibility", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Test touch targets are large enough (minimum 44x44px)
    const buttons = page.locator(
      'button, a, input[type="button"], input[type="submit"]',
    );
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();

      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Test mobile-specific accessibility
    const mobileResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(mobileResults.violations).toEqual([]);
  });
});
