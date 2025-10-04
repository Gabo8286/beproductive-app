import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {
  test("should match dashboard screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hide dynamic content for consistent screenshots
    await page.addStyleTag({
      content: `
        [data-dynamic="true"],
        .timestamp,
        .live-data {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot("dashboard.png");
  });

  test("should match task list in different states", async ({ page }) => {
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Empty state
    await page.evaluate(() => {
      localStorage.setItem("tasks", JSON.stringify([]));
    });
    await page.reload();
    await expect(page.locator('[data-testid="task-list"]')).toHaveScreenshot(
      "task-list-empty.png",
    );

    // With tasks
    await page.evaluate(() => {
      const tasks = [
        {
          id: "1",
          title: "Complete project proposal",
          completed: false,
          priority: "high",
        },
        {
          id: "2",
          title: "Review team feedback",
          completed: true,
          priority: "medium",
        },
        {
          id: "3",
          title: "Schedule client meeting",
          completed: false,
          priority: "low",
        },
      ];
      localStorage.setItem("tasks", JSON.stringify(tasks));
    });
    await page.reload();
    await expect(page.locator('[data-testid="task-list"]')).toHaveScreenshot(
      "task-list-with-tasks.png",
    );
  });

  test("should match widget layouts", async ({ page }) => {
    await page.goto("/");

    // Test individual widgets
    const widgets = [
      "tasks-widget",
      "goals-widget",
      "habits-widget",
      "analytics-widget",
    ];

    for (const widget of widgets) {
      const widgetElement = page.locator(`[data-testid="${widget}"]`);
      if ((await widgetElement.count()) > 0) {
        await expect(widgetElement).toHaveScreenshot(`${widget}.png`);
      }
    }
  });

  test("should match theme variations", async ({ page }) => {
    await page.goto("/");

    // Light theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500); // Wait for theme transition
    await expect(page).toHaveScreenshot("dashboard-light.png");

    // Dark theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("dashboard-dark.png");
  });

  test("should match mobile responsive layouts", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`);
    }
  });

  test("should match form states", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator('[data-testid="task-form"]');

    // Empty form
    await expect(form).toHaveScreenshot("task-form-empty.png");

    // Filled form
    await page.fill('[data-testid="task-title"]', "New important task");
    await page.selectOption('[data-testid="priority-select"]', "high");
    await expect(form).toHaveScreenshot("task-form-filled.png");

    // Form with validation errors
    await page.fill('[data-testid="task-title"]', "");
    await page.click('[data-testid="save-task"]');
    await expect(form).toHaveScreenshot("task-form-errors.png");
  });

  test("should match modal and overlay states", async ({ page }) => {
    await page.goto("/");

    // Settings modal
    await page.locator('[data-testid="settings-button"]').click();
    const modal = page.locator('[data-testid="settings-modal"]');
    await expect(modal).toHaveScreenshot("settings-modal.png");

    // Close modal
    await page.keyboard.press("Escape");

    // Command palette
    await page.keyboard.press("Meta+k");
    const commandPalette = page.locator('[data-testid="command-palette"]');
    await expect(commandPalette).toHaveScreenshot("command-palette.png");
  });

  test("should match loading states", async ({ page }) => {
    await page.goto("/");

    // Simulate loading state
    await page.evaluate(() => {
      // Show loading spinners
      document.querySelectorAll('[data-testid*="widget"]').forEach((widget) => {
        widget.innerHTML = '<div class="animate-spin">Loading...</div>';
      });
    });

    await expect(page).toHaveScreenshot("dashboard-loading.png");
  });

  test("should match error states", async ({ page }) => {
    await page.goto("/");

    // Simulate error state
    await page.evaluate(() => {
      // Show error messages
      document.querySelectorAll('[data-testid*="widget"]').forEach((widget) => {
        widget.innerHTML = '<div class="text-red-500">Error loading data</div>';
      });
    });

    await expect(page).toHaveScreenshot("dashboard-error.png");
  });

  test("should match internationalization layouts", async ({ page }) => {
    const languages = ["en", "es", "fr", "ar"]; // Including RTL language

    for (const lang of languages) {
      await page.goto(`/?lang=${lang}`);
      await page.waitForLoadState("networkidle");

      // Set document direction for RTL languages
      if (lang === "ar") {
        await page.evaluate(() => {
          document.documentElement.setAttribute("dir", "rtl");
        });
      }

      await expect(page).toHaveScreenshot(`dashboard-${lang}.png`);
    }
  });
});
