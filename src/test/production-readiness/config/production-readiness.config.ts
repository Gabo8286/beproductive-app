import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../',
  outputDir: '../../../test-results/production-readiness-output',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60000, // 1 minute per test
  globalTimeout: 3600000, // 1 hour for full suite

  reporter: [
    ['html', { outputFolder: '../../../test-results/production-readiness/html-report' }],
    ['json', { outputFile: '../../../test-results/production-readiness/results.json' }],
    ['junit', { outputFile: '../../../test-results/production-readiness/results.xml' }],
    ['list']
  ],

  use: {
    baseURL: process.env.STAGING_URL || 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100,
    },
  },

  projects: [
    {
      name: 'security-tests',
      testDir: '../01-security',
      use: {
        storageState: 'src/test/fixtures/auth/admin-state.json',
      },
    },
    {
      name: 'performance-tests',
      testDir: '../02-scalability-performance',
      use: {
        storageState: 'src/test/fixtures/auth/user-state.json',
      },
    },
    {
      name: 'reliability-tests',
      testDir: '../03-reliability-availability',
      dependencies: ['security-tests'],
    },
    {
      name: 'compliance-tests',
      testDir: '../04-compliance-legal',
      use: {
        storageState: 'src/test/fixtures/auth/admin-state.json',
      },
    },
    {
      name: 'ux-tests',
      testDir: '../05-ux-usability',
      use: {
        // Desktop Chrome configuration
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    },
    {
      name: 'devops-tests',
      testDir: '../06-devops-maintainability',
    },
    {
      name: 'data-tests',
      testDir: '../07-data-management',
      use: {
        storageState: 'src/test/fixtures/auth/admin-state.json',
      },
    },
    {
      name: 'integration-tests',
      testDir: '../08-integration-extensibility',
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup for production readiness tests
  // globalSetup: require.resolve('../orchestrator/global-setup.ts'),
  // globalTeardown: require.resolve('../orchestrator/global-teardown.ts'),
});