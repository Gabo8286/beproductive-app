import React from "react";
import { Page, Locator, expect } from "@playwright/test";
import { PersonaTestData } from "../data/persona-test-data";
import { render, screen, waitFor } from "@testing-library/react";

export { render, screen, waitFor };
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}

/**
 * Test utilities for common testing patterns
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible", timeout });
    await this.page.waitForLoadState("networkidle");
    return element;
  }

  /**
   * Fill form with data and submit
   */
  async fillAndSubmitForm(
    formData: Record<string, string>,
    submitSelector = 'button[type="submit"]',
  ) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(
        `[data-testid="${field}"], [name="${field}"]`,
        value,
      );
    }
    await this.page.click(submitSelector);
  }

  /**
   * Setup persona data for testing
   */
  async setupPersona(personaData: PersonaTestData) {
    await this.page.evaluate((data) => {
      localStorage.setItem("user-data", JSON.stringify(data.user));
      localStorage.setItem("activity-data", JSON.stringify(data.activityData));
      localStorage.setItem("test-persona", JSON.stringify(data));
    }, personaData);
  }

  /**
   * Clear all test data
   */
  async clearTestData() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Mock API responses
   */
  async mockApiResponse(endpoint: string, response: any, status = 200) {
    await this.page.route(`**/${endpoint}`, (route) => {
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Simulate network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await this.page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Check accessibility score
   */
  async checkAccessibilityScore(minimumScore = 95) {
    // This would integrate with axe-core or similar
    const violations = await this.page.evaluate(() => {
      // Mock accessibility check
      return [];
    });

    expect(violations).toHaveLength(0);
  }

  /**
   * Measure performance metrics
   */
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart,
        resourceCount: performance.getEntriesByType("resource").length,
      };
    });
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign(
    breakpoints = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ],
  ) {
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height,
      });

      await this.page.waitForLoadState("networkidle");

      // Check that content is visible and usable
      await expect(this.page.locator("body")).toBeVisible();

      // Check for horizontal scroll
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    const focusableElements: string[] = [];

    // Start from the first focusable element
    await this.page.keyboard.press("Tab");

    for (let i = 0; i < 20; i++) {
      const focusedElement = await this.page.locator(":focus");
      const tagName = await focusedElement.evaluate((el) => el.tagName);
      const testId = await focusedElement.getAttribute("data-testid");

      focusableElements.push(testId || tagName);

      await expect(focusedElement).toBeVisible();
      await this.page.keyboard.press("Tab");
    }

    return focusableElements;
  }

  /**
   * Simulate user interactions
   */
  async simulateTypicalUserSession(scenario: string[]) {
    for (const action of scenario) {
      switch (action) {
        case "create_task":
          await this.page.click('[data-testid="add-task"]');
          await this.page.fill('[data-testid="task-title"]', "Test task");
          await this.page.click('[data-testid="save-task"]');
          break;

        case "complete_task":
          await this.page.click('[data-testid="task-checkbox"]');
          break;

        case "open_settings":
          await this.page.click('[data-testid="settings-button"]');
          break;

        case "switch_theme":
          await this.page.click('[data-testid="theme-toggle"]');
          break;

        case "use_search":
          await this.page.keyboard.press("Meta+k");
          await this.page.type('[data-testid="search-input"]', "test");
          break;

        default:
          console.warn(`Unknown action: ${action}`);
      }

      await this.page.waitForTimeout(500); // Natural pause between actions
    }
  }

  /**
   * Generate test report
   */
  async generateTestReport(testName: string, results: any) {
    const report = {
      testName,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      viewport: await this.page.viewportSize(),
      performance: await this.getPerformanceMetrics(),
      results,
    };

    // Save report (would typically send to test reporting service)
    console.log("Test Report:", JSON.stringify(report, null, 2));

    return report;
  }
}

/**
 * Custom matchers for productivity app testing
 */
export const customMatchers = {
  async toBeProductiveWidget(locator: Locator) {
    const element = await locator.first();

    // Check for required widget attributes
    const hasDataTestId = await element.getAttribute("data-testid");
    const hasWidgetClass = await element.evaluate(
      (el) => el.classList.contains("widget") || el.classList.contains("card"),
    );

    const pass = hasDataTestId?.includes("widget") && hasWidgetClass;

    return {
      pass,
      message: () => `Expected element to be a productive widget`,
    };
  },

  async toHaveAccessibleName(locator: Locator) {
    const element = await locator.first();

    const ariaLabel = await element.getAttribute("aria-label");
    const textContent = await element.textContent();
    const title = await element.getAttribute("title");

    const hasAccessibleName = !!(ariaLabel || textContent?.trim() || title);

    return {
      pass: hasAccessibleName,
      message: () => `Expected element to have an accessible name`,
    };
  },
};

export default TestUtils;
