import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright configuration for faster E2E testing during development
 * Focuses on Chrome only and essential test scenarios
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false, // Run tests sequentially for debugging
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1, // Single worker for consistency
  reporter: 'html',
  timeout: 60000, // Increase timeout for authentication flows

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-auth-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Ignore HTTPS errors in test environment
        ignoreHTTPSErrors: true,
        // Increase viewport for better visibility
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});