import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should meet Core Web Vitals thresholds", async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
        };

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.LCP = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.FID = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ["first-input"] });

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.CLS = entries.reduce((sum, entry) => sum + entry.value, 0);
        }).observe({ entryTypes: ["layout-shift"] });

        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.FCP = entries[0].startTime;
        }).observe({ entryTypes: ["paint"] });

        // Resolve after a delay to collect metrics
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    // Assert Core Web Vitals thresholds
    expect(vitals.LCP).toBeLessThan(4000); // Less than 4 seconds
    expect(vitals.FID).toBeLessThan(100); // Less than 100ms
    expect(vitals.CLS).toBeLessThan(0.1); // Less than 0.1
    expect(vitals.FCP).toBeLessThan(2000); // Less than 2 seconds
  });

  test("should load dashboard quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
  });

  test("should handle large datasets efficiently", async ({ page }) => {
    // Create large dataset
    await page.goto("/");

    await page.evaluate(() => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i + 1}`,
        completed: Math.random() > 0.5,
        createdAt: new Date(),
        priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      }));

      localStorage.setItem("large-dataset", JSON.stringify(largeTasks));
    });

    await page.reload();

    // Measure rendering performance
    const renderTime = await page.evaluate(() => {
      const start = performance.now();

      // Trigger re-render with large dataset
      const event = new CustomEvent("load-large-dataset");
      window.dispatchEvent(event);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          const end = performance.now();
          resolve(end - start);
        });
      });
    });

    expect(renderTime).toBeLessThan(100); // Less than 100ms render time
  });

  test("should maintain 60fps during animations", async ({ page }) => {
    await page.goto("/");

    // Start FPS monitoring
    const fps = await page.evaluate(() => {
      let frames = 0;
      const lastTime = performance.now();

      function countFrames() {
        frames++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          return frames;
        }

        requestAnimationFrame(countFrames);
        return null;
      }

      return new Promise((resolve) => {
        // Trigger animations
        const widgets = document.querySelectorAll('[data-testid*="widget"]');
        widgets.forEach((widget) => {
          widget.style.transform = "translateX(100px)";
          widget.style.transition = "transform 1s ease";
        });

        setTimeout(() => {
          requestAnimationFrame(() => {
            const fps = countFrames();
            resolve(fps);
          });
        }, 1000);
      });
    });

    expect(fps).toBeGreaterThan(50); // Maintain at least 50fps
  });

  test("should optimize bundle size", async ({ page }) => {
    const response = await page.goto("/");
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      return resources
        .filter(
          (resource) =>
            resource.name.includes(".js") || resource.name.includes(".css"),
        )
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    });

    // Assert total resource size is under 500KB
    expect(resourceSizes).toBeLessThan(500 * 1024);
  });

  test("should handle concurrent users simulation", async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 10 }, () => browser.newContext()),
    );

    const pages = await Promise.all(
      contexts.map((context) => context.newPage()),
    );

    // Simulate 10 concurrent users
    const loadPromises = pages.map(async (page, index) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      return Date.now() - startTime;
    });

    const loadTimes = await Promise.all(loadPromises);
    const averageLoadTime =
      loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;

    expect(averageLoadTime).toBeLessThan(5000); // Average load time under 5 seconds

    // Cleanup
    await Promise.all(contexts.map((context) => context.close()));
  });
});
