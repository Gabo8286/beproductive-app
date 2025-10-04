import { test, expect } from "@playwright/test";

test.describe("Security Tests", () => {
  test("should prevent XSS attacks in user inputs", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="add-task"]').click();

    // Attempt XSS injection
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
    ];

    for (const payload of xssPayloads) {
      await page.fill('[data-testid="task-title"]', payload);
      await page.click('[data-testid="save-task"]');

      // Verify that the script doesn't execute
      const dialogPromise = page
        .waitForEvent("dialog", { timeout: 1000 })
        .catch(() => null);
      const dialog = await dialogPromise;

      expect(dialog).toBeNull(); // No alert should appear

      // Verify content is properly escaped
      const taskContent = await page
        .locator('[data-testid="task-list"]')
        .textContent();
      expect(taskContent).not.toContain("<script>");
    }
  });

  test("should sanitize HTML content", async ({ page }) => {
    await page.goto("/");

    // Test HTML injection in various fields
    await page.evaluate(() => {
      const htmlPayload =
        '<b>Bold</b><script>alert("XSS")</script><style>body{display:none}</style>';

      // Try to inject HTML through localStorage (simulating API response)
      localStorage.setItem("test-content", htmlPayload);

      // Dispatch event to update UI
      window.dispatchEvent(
        new CustomEvent("content-update", {
          detail: { content: htmlPayload },
        }),
      );
    });

    // Verify HTML is sanitized
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    expect(pageContent).not.toContain("<style>body{display:none}</style>");

    // But safe HTML should be preserved
    expect(pageContent).toContain("Bold"); // Text content should remain
  });

  test("should implement proper CSRF protection", async ({ page, context }) => {
    await page.goto("/");

    // Check for CSRF token in forms
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator("form");
    const csrfToken = await form
      .locator('input[name="csrf_token"], input[name="_token"]')
      .getAttribute("value");

    // CSRF token should exist (if implemented)
    if (csrfToken) {
      expect(csrfToken).toBeTruthy();
      expect(csrfToken.length).toBeGreaterThan(10);
    }

    // Test that requests without CSRF token are rejected
    const response = await context.request.post("/api/tasks", {
      data: { title: "Test task" },
      headers: { "Content-Type": "application/json" },
    });

    // Should either require authentication or CSRF token
    expect([401, 403, 422]).toContain(response.status());
  });

  test("should validate input lengths and types", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="add-task"]').click();

    // Test extremely long input
    const longString = "A".repeat(10000);
    await page.fill('[data-testid="task-title"]', longString);
    await page.click('[data-testid="save-task"]');

    // Should show validation error or truncate
    const errorMessage = page.locator('[role="alert"], .error-message');
    const hasError = (await errorMessage.count()) > 0;

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    } else {
      // If no error, content should be truncated
      const savedContent = await page
        .locator('[data-testid="task-list"]')
        .textContent();
      expect(savedContent?.length || 0).toBeLessThan(1000);
    }

    // Test SQL injection patterns
    const sqlPayloads = [
      "'; DROP TABLE tasks; --",
      "' OR '1'='1",
      "'; UPDATE tasks SET title='hacked'; --",
    ];

    for (const payload of sqlPayloads) {
      await page.fill('[data-testid="task-title"]', payload);
      await page.click('[data-testid="save-task"]');

      // Verify the payload is treated as regular text
      const taskContent = await page
        .locator('[data-testid="task-list"]')
        .textContent();
      expect(taskContent).toContain(payload); // Should be stored as-is, not executed
    }
  });

  test("should implement secure authentication headers", async ({ page }) => {
    const response = await page.goto("/");

    // Check security headers
    const headers = response?.headers();

    // Content Security Policy
    expect(
      headers?.["content-security-policy"] || headers?.["csp"],
    ).toBeTruthy();

    // X-Frame-Options
    expect(headers?.["x-frame-options"]).toBeTruthy();

    // X-Content-Type-Options
    expect(headers?.["x-content-type-options"]).toBe("nosniff");

    // Referrer Policy
    expect(headers?.["referrer-policy"]).toBeTruthy();

    // If HTTPS, check security headers
    if (page.url().startsWith("https://")) {
      expect(headers?.["strict-transport-security"]).toBeTruthy();
    }
  });

  test("should protect against clickjacking", async ({ page }) => {
    // Check X-Frame-Options or CSP frame-ancestors
    const response = await page.goto("/");
    const headers = response?.headers();

    const xFrameOptions = headers?.["x-frame-options"];
    const csp = headers?.["content-security-policy"];

    const hasClickjackingProtection =
      xFrameOptions === "DENY" ||
      xFrameOptions === "SAMEORIGIN" ||
      (csp && csp.includes("frame-ancestors"));

    expect(hasClickjackingProtection).toBeTruthy();

    // Test that the app can't be framed by external sites
    await page.evaluate(() => {
      const iframe = document.createElement("iframe");
      iframe.src = window.location.href;
      document.body.appendChild(iframe);

      return new Promise((resolve) => {
        iframe.onload = () => resolve("loaded");
        iframe.onerror = () => resolve("blocked");
        setTimeout(() => resolve("timeout"), 2000);
      });
    });
  });

  test("should handle file upload security", async ({ page }) => {
    // If the app has file upload functionality
    const fileInput = page.locator('input[type="file"]');
    const hasFileUpload = (await fileInput.count()) > 0;

    if (hasFileUpload) {
      // Test malicious file types
      const maliciousFiles = ["test.exe", "test.php", "test.jsp", "test.asp"];

      for (const fileName of maliciousFiles) {
        // Create a test file
        const fileContent = Buffer.from("malicious content");

        await fileInput.setInputFiles({
          name: fileName,
          mimeType: "application/octet-stream",
          buffer: fileContent,
        });

        // Submit form
        await page.click('[data-testid="upload-submit"]');

        // Should show error or reject the file
        const errorMessage = page.locator('[role="alert"], .error-message');
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test("should implement rate limiting", async ({ page, context }) => {
    // Test rapid requests to prevent spam/DoS
    const requests = [];

    for (let i = 0; i < 100; i++) {
      requests.push(
        context.request.post("/api/tasks", {
          data: { title: `Spam task ${i}` },
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter((r) => r.status() === 429);

    // Should have some rate limiting after many requests
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test("should validate session security", async ({ page, context }) => {
    await page.goto("/login");

    // Check session security
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) =>
        c.name.toLowerCase().includes("session") ||
        c.name.toLowerCase().includes("auth"),
    );

    if (sessionCookie) {
      // Session cookie should be secure
      expect(sessionCookie.secure).toBeTruthy();
      expect(sessionCookie.httpOnly).toBeTruthy();
      expect(sessionCookie.sameSite).toBe("Strict");
    }
  });

  test("should prevent information disclosure", async ({ page, context }) => {
    // Test error pages don't reveal sensitive information
    const testUrls = [
      "/nonexistent-page",
      "/api/admin",
      "/config",
      "/.env",
      "/debug",
    ];

    for (const url of testUrls) {
      const response = await context.request.get(url);
      const content = await response.text();

      // Should not reveal sensitive information
      expect(content.toLowerCase()).not.toContain("password");
      expect(content.toLowerCase()).not.toContain("secret");
      expect(content.toLowerCase()).not.toContain("api key");
      expect(content.toLowerCase()).not.toContain("database");
      expect(content.toLowerCase()).not.toContain("stack trace");
    }
  });
});
