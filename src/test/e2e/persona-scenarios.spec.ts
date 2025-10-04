import { test, expect } from "@playwright/test";
import { allPersonaData } from "../data/persona-test-data";

// Sarah Chen - Executive persona tests
test.describe("Sarah Chen (Executive) - Mobile-First Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Mock user login as Sarah
    await page.evaluate((userData) => {
      localStorage.setItem("user-data", JSON.stringify(userData.sarah.user));
      localStorage.setItem(
        "activity-data",
        JSON.stringify(userData.sarah.activityData),
      );
    }, allPersonaData);
  });

  test("should navigate efficiently on mobile dashboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Test widget-based navigation
    await expect(
      page.locator('[data-testid="dashboard-widgets"]'),
    ).toBeVisible();

    // Quick task creation
    await page.locator('[data-testid="quick-add-task"]').click();
    await page.fill(
      '[data-testid="task-input"]',
      "Call investor about Series B",
    );
    await page.selectOption('[data-testid="priority-select"]', "high");
    await page.click('[data-testid="save-task"]');

    await expect(
      page.locator("text=Call investor about Series B"),
    ).toBeVisible();
  });

  test("should support voice note creation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Test voice input button
    await page.locator('[data-testid="voice-input"]').click();
    await expect(page.locator('[data-testid="voice-recording"]')).toBeVisible();

    // Simulate voice input completion
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("voice-input", {
          detail: {
            transcript: "Schedule board meeting for next Friday at 10 AM",
          },
        }),
      );
    });

    await expect(page.locator("text=Schedule board meeting")).toBeVisible();
  });

  test("should show executive dashboard widgets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check for executive-specific widgets
    await expect(page.locator('[data-testid="meetings-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-widget"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="team-performance-widget"]'),
    ).toBeVisible();
  });
});

// Marcus Rodriguez - Developer persona tests
test.describe("Marcus Rodriguez (Developer) - Keyboard-First Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate((userData) => {
      localStorage.setItem("user-data", JSON.stringify(userData.marcus.user));
      localStorage.setItem(
        "activity-data",
        JSON.stringify(userData.marcus.activityData),
      );
    }, allPersonaData);
  });

  test("should support full keyboard navigation", async ({ page }) => {
    // Test command palette
    await page.keyboard.press("Meta+k"); // Cmd+K
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();

    await page.keyboard.type("create task");
    await page.keyboard.press("Enter");

    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();

    // Navigate with keyboard
    await page.keyboard.type("Fix authentication bug");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown"); // Select high priority
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Save task

    await expect(page.locator("text=Fix authentication bug")).toBeVisible();
  });

  test("should maintain dark mode consistency", async ({ page }) => {
    // Check dark mode is applied
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Test all major components in dark mode
    const components = [
      '[data-testid="dashboard"]',
      '[data-testid="task-list"]',
      '[data-testid="navigation"]',
      '[data-testid="settings"]',
    ];

    for (const component of components) {
      await page.locator(component).click();
      await expect(page.locator("html")).toHaveClass(/dark/);
    }
  });

  test("should support technical task management", async ({ page }) => {
    // Test code-related task categories
    await page.locator('[data-testid="add-task"]').click();
    await page.selectOption('[data-testid="category-select"]', "development");

    await expect(page.locator('option[value="bug"]')).toBeVisible();
    await expect(page.locator('option[value="feature"]')).toBeVisible();
    await expect(page.locator('option[value="refactor"]')).toBeVisible();
  });
});

// Elena Petrov - Project Manager persona tests
test.describe("Elena Petrov (Project Manager) - Collaboration Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate((userData) => {
      localStorage.setItem("user-data", JSON.stringify(userData.elena.user));
      localStorage.setItem(
        "activity-data",
        JSON.stringify(userData.elena.activityData),
      );
    }, allPersonaData);
  });

  test("should provide project overview dashboard", async ({ page }) => {
    await expect(
      page.locator('[data-testid="project-overview"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="team-progress"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="milestone-tracker"]'),
    ).toBeVisible();
  });

  test("should support goal tracking and reporting", async ({ page }) => {
    await page.locator('[data-testid="goals-section"]').click();

    // Check goal progress visualization
    await expect(
      page.locator('[data-testid="goal-progress-chart"]'),
    ).toBeVisible();

    // Test goal update
    await page.locator('[data-testid="update-goal"]').first().click();
    await page.fill('[data-testid="progress-input"]', "75");
    await page.click('[data-testid="save-progress"]');

    await expect(page.locator("text=75%")).toBeVisible();
  });

  test("should generate reports and analytics", async ({ page }) => {
    await page.locator('[data-testid="reports-tab"]').click();

    await expect(
      page.locator('[data-testid="productivity-report"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="team-performance-chart"]'),
    ).toBeVisible();

    // Test report export
    await page.locator('[data-testid="export-report"]').click();
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible();
  });
});

// James Thompson - Freelancer persona tests
test.describe("James Thompson (Freelancer) - Time Tracking & Billing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate((userData) => {
      localStorage.setItem("user-data", JSON.stringify(userData.james.user));
      localStorage.setItem(
        "activity-data",
        JSON.stringify(userData.james.activityData),
      );
    }, allPersonaData);
  });

  test("should support accurate time tracking", async ({ page }) => {
    // Start time tracking
    await page.locator('[data-testid="start-timer"]').click();
    await expect(page.locator('[data-testid="active-timer"]')).toBeVisible();

    // Switch between projects
    await page.locator('[data-testid="project-switcher"]').click();
    await page.locator('[data-testid="project-client-a"]').click();

    await expect(page.locator('[data-testid="current-project"]')).toContainText(
      "Client A",
    );

    // Stop timer
    await page.locator('[data-testid="stop-timer"]').click();
    await expect(page.locator('[data-testid="time-entry-form"]')).toBeVisible();
  });

  test("should manage client projects efficiently", async ({ page }) => {
    await page.locator('[data-testid="projects-tab"]').click();

    // Create new project
    await page.locator('[data-testid="new-project"]').click();
    await page.fill('[data-testid="project-name"]', "Client B Website");
    await page.fill('[data-testid="client-name"]', "Client B");
    await page.fill('[data-testid="hourly-rate"]', "75");
    await page.click('[data-testid="save-project"]');

    await expect(page.locator("text=Client B Website")).toBeVisible();
  });

  test("should generate invoices and billing reports", async ({ page }) => {
    await page.locator('[data-testid="billing-tab"]').click();

    // Create invoice
    await page.locator('[data-testid="create-invoice"]').click();
    await page.selectOption('[data-testid="client-select"]', "client-a");
    await page.click('[data-testid="generate-invoice"]');

    await expect(page.locator('[data-testid="invoice-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });
});

// Aisha Williams - Student persona tests
test.describe("Aisha Williams (Student) - Mobile Study Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.evaluate((userData) => {
      localStorage.setItem("user-data", JSON.stringify(userData.aisha.user));
      localStorage.setItem(
        "activity-data",
        JSON.stringify(userData.aisha.activityData),
      );
    }, allPersonaData);
  });

  test("should provide mobile-optimized study interface", async ({ page }) => {
    // Check mobile-specific layout
    await expect(
      page.locator('[data-testid="mobile-navigation"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="study-dashboard"]')).toBeVisible();

    // Test swipe navigation
    await page.locator('[data-testid="study-dashboard"]').swipe("left");
    await expect(page.locator('[data-testid="habits-view"]')).toBeVisible();
  });

  test("should track study habits effectively", async ({ page }) => {
    await page.locator('[data-testid="habits-tab"]').click();

    // Mark habit as complete
    await page.locator('[data-testid="habit-study-daily"]').click();
    await expect(page.locator('[data-testid="habit-check"]')).toBeVisible();

    // Check streak counter
    await expect(page.locator('[data-testid="study-streak"]')).toContainText(
      "3 days",
    );
  });

  test("should support study session management", async ({ page }) => {
    // Start study session
    await page.locator('[data-testid="start-study-session"]').click();
    await page.selectOption('[data-testid="subject-select"]', "calculus");
    await page.selectOption('[data-testid="session-duration"]', "25"); // Pomodoro
    await page.click('[data-testid="start-session"]');

    await expect(page.locator('[data-testid="study-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-subject"]')).toContainText(
      "Calculus",
    );
  });

  test("should show academic progress tracking", async ({ page }) => {
    await page.locator('[data-testid="progress-tab"]').click();

    await expect(page.locator('[data-testid="gpa-tracker"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-progress"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="assignment-deadlines"]'),
    ).toBeVisible();
  });
});
