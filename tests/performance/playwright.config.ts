import { defineConfig, devices } from '@playwright/test';

/**
 * Performance Testing Configuration
 *
 * Specialized Playwright configuration for performance testing with:
 * - Optimized settings for performance measurements
 * - Extended timeouts for load testing
 * - Performance-focused reporting
 * - Browser configuration for accurate metrics
 */

export default defineConfig({
  testDir: '.',

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for performance consistency

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Single worker for performance testing to avoid resource contention */
  workers: 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/performance-report' }],
    ['json', { outputFile: 'test-results/performance-results.json' }],
    ['line']
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Extended timeout for performance tests */
    actionTimeout: 30000,
    navigationTimeout: 60000,

    /* Disable animations for consistent measurements */
    // Note: Some tests specifically test animation performance
  },

  /* Configure projects for major browsers with performance-optimized settings */
  projects: [
    {
      name: 'performance-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable performance monitoring features
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-gpu-benchmarking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-features=TranslateUI',
            '--disable-web-security',
            '--no-sandbox'
          ]
        }
      },
    },

    {
      name: 'performance-firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'dom.enable_performance_observer': true,
            'dom.enable_performance': true
          }
        }
      },
    },

    {
      name: 'performance-mobile',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-background-timer-throttling'
          ]
        }
      },
    },
  ],

  /* Global timeout for entire test suite */
  globalTimeout: 30 * 60 * 1000, // 30 minutes

  /* Timeout for each test */
  timeout: 5 * 60 * 1000, // 5 minutes per test

  /* Expect timeout */
  expect: {
    timeout: 10000
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});