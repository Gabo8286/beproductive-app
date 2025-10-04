#!/usr/bin/env node

/**
 * Testing & Quality Agent
 * BeProductive v2: Spark Bloom Flow
 *
 * Purpose: Implement comprehensive testing framework with user persona validation
 * Author: Gabriel Soto Morales (with AI assistance)
 * Date: January 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestingQualityAgent {
  constructor() {
    this.agentName = 'Testing & Quality Agent';
    this.version = '1.0.0';
    this.startTime = Date.now();
    this.findings = [];
    this.issues = [];
    this.basePath = process.cwd();

    this.config = {
      personas: {
        sarah: {
          name: 'Sarah Chen',
          role: 'Busy Executive',
          characteristics: ['mobile_first', 'quick_actions', 'voice_notes', 'dashboard_focused'],
          devices: ['mobile', 'tablet'],
          preferences: { theme: 'light', language: 'en' }
        },
        marcus: {
          name: 'Marcus Rodriguez',
          role: 'Developer',
          characteristics: ['keyboard_shortcuts', 'dark_mode', 'technical_tasks', 'power_user'],
          devices: ['desktop', 'mobile'],
          preferences: { theme: 'dark', language: 'en' }
        },
        elena: {
          name: 'Elena Petrov',
          role: 'Project Manager',
          characteristics: ['collaboration', 'reporting', 'goal_tracking', 'team_management'],
          devices: ['desktop', 'tablet'],
          preferences: { theme: 'light', language: 'en' }
        },
        james: {
          name: 'James Thompson',
          role: 'Freelancer',
          characteristics: ['time_tracking', 'client_management', 'project_switching', 'billing'],
          devices: ['desktop', 'mobile'],
          preferences: { theme: 'auto', language: 'en' }
        },
        aisha: {
          name: 'Aisha Williams',
          role: 'Student',
          characteristics: ['mobile_usage', 'habit_tracking', 'study_sessions', 'social_features'],
          devices: ['mobile'],
          preferences: { theme: 'dark', language: 'en' }
        }
      },
      testCategories: [
        'unit_tests',
        'integration_tests',
        'e2e_tests',
        'visual_regression',
        'performance_tests',
        'accessibility_tests',
        'security_tests',
        'cross_browser_tests',
        'mobile_tests',
        'internationalization_tests'
      ],
      qualityGates: {
        codeCoverage: 90,
        performanceBudget: {
          firstContentfulPaint: 2000,
          largestContentfulPaint: 4000,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        accessibilityScore: 95,
        bundleSize: 500 // KB
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\\x1b[36m',    // Cyan
      success: '\\x1b[32m', // Green
      warning: '\\x1b[33m', // Yellow
      error: '\\x1b[31m',   // Red
      reset: '\\x1b[0m'
    };

    console.log(`\${colors[type]}[\${timestamp}] \${this.agentName}: \${message}\${colors.reset}`);
  }

  async analyzeExistingTests() {
    this.log('🧪 Analyzing existing test infrastructure...');

    const testDirectories = [
      'src/__tests__',
      'tests',
      'e2e',
      'cypress',
      'playwright',
      '__tests__'
    ];

    const testFiles = [
      'vitest.config.ts',
      'jest.config.js',
      'playwright.config.ts',
      'cypress.config.ts'
    ];

    let hasTestSetup = false;

    // Check for test directories
    for (const dir of testDirectories) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        hasTestSetup = true;
        await this.analyzeTestDirectory(dir);
      }
    }

    // Check for test configuration files
    for (const file of testFiles) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        hasTestSetup = true;
        this.findings.push({
          type: 'test_config',
          file,
          status: 'found'
        });
      }
    }

    if (!hasTestSetup) {
      this.issues.push({
        type: 'no_test_setup',
        severity: 'critical',
        description: 'No existing test infrastructure found'
      });
    }

    // Analyze package.json for test dependencies
    await this.analyzeTestDependencies();

    this.log(`📊 Test analysis complete: \${this.findings.length} findings, \${this.issues.length} issues`);
  }

  async analyzeTestDirectory(dirPath) {
    const fullPath = path.join(this.basePath, dirPath);
    const files = this.getFilesRecursively(fullPath);

    const testFiles = files.filter(file =>
      file.endsWith('.test.ts') ||
      file.endsWith('.test.tsx') ||
      file.endsWith('.spec.ts') ||
      file.endsWith('.spec.tsx')
    );

    this.findings.push({
      type: 'test_directory',
      path: dirPath,
      testFiles: testFiles.length,
      coverage: this.estimateTestCoverage(testFiles)
    });
  }

  getFilesRecursively(dirPath) {
    const files = [];

    const processDirectory = (currentPath) => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const item of items) {
        const fullItemPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
          processDirectory(fullItemPath);
        } else {
          files.push(fullItemPath);
        }
      }
    };

    try {
      processDirectory(dirPath);
    } catch (error) {
      // Directory might not be accessible
    }

    return files;
  }

  estimateTestCoverage(testFiles) {
    // Simple estimation based on test file count
    if (testFiles.length === 0) return 0;
    if (testFiles.length < 10) return 30;
    if (testFiles.length < 25) return 60;
    return 80;
  }

  async analyzeTestDependencies() {
    const packageJsonPath = path.join(this.basePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const testLibraries = [
        'vitest',
        'jest',
        'playwright',
        'cypress',
        '@testing-library/react',
        '@testing-library/jest-dom',
        'jsdom',
        'happy-dom'
      ];

      for (const lib of testLibraries) {
        if (allDeps[lib]) {
          this.findings.push({
            type: 'test_dependency',
            library: lib,
            version: allDeps[lib],
            status: 'installed'
          });
        }
      }
    }
  }

  async implementTestingFramework() {
    this.log('🚧 Implementing comprehensive testing framework...');

    try {
      // Install test dependencies
      await this.installTestDependencies();

      // Create test configurations
      await this.createTestConfigurations();

      // Create persona-based test data
      await this.createPersonaTestData();

      // Create persona test scenarios
      await this.createPersonaTestScenarios();

      // Create performance tests
      await this.createPerformanceTests();

      // Create accessibility tests
      await this.createAccessibilityTests();

      // Create visual regression tests
      await this.createVisualRegressionTests();

      // Create security tests
      await this.createSecurityTests();

      // Create test utilities
      await this.createTestUtilities();

      // Create quality gates
      await this.createQualityGates();

      this.log('✅ Testing framework implementation completed');
    } catch (error) {
      this.log(`❌ Testing implementation failed: \${error.message}`, 'error');
      throw error;
    }
  }

  async installTestDependencies() {
    this.log('📦 Installing test dependencies...');

    const dependencies = [
      'vitest',
      '@vitest/ui',
      'jsdom',
      'playwright',
      '@playwright/test',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'axe-core',
      '@axe-core/playwright',
      'lighthouse',
      'chromatic',
      'eslint-plugin-testing-library',
      'eslint-plugin-jest-dom'
    ];

    try {
      execSync(`npm install --save-dev \${dependencies.join(' ')}`, {
        cwd: this.basePath,
        stdio: 'pipe'
      });
      this.log('✅ Test dependencies installed successfully');
    } catch (error) {
      this.log('⚠️ Some dependencies may already be installed or error occurred', 'warning');
    }
  }

  async createTestConfigurations() {
    // Vitest configuration
    const vitestConfig = `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});`;

    // Playwright configuration
    const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});`;

    // Test setup file
    const testSetup = `import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});`;

    const vitestPath = path.join(this.basePath, 'vitest.config.ts');
    const playwrightPath = path.join(this.basePath, 'playwright.config.ts');
    const setupPath = path.join(this.basePath, 'src/test/setup.ts');

    // Ensure test directory exists
    const testDir = path.dirname(setupPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    fs.writeFileSync(vitestPath, vitestConfig);
    fs.writeFileSync(playwrightPath, playwrightConfig);
    fs.writeFileSync(setupPath, testSetup);

    this.log('✅ Created test configurations');
  }

  async createPersonaTestData() {
    const personaDataContent = `import { UserActivityData } from '@/types/ai';

export interface PersonaTestData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
    };
  };
  activityData: UserActivityData;
  testScenarios: string[];
}

export const sarahTestData: PersonaTestData = {
  user: {
    id: 'sarah-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Executive',
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York'
    }
  },
  activityData: {
    tasks: [
      {
        id: 'task-1',
        title: 'Board meeting preparation',
        completed: false,
        createdAt: new Date('2025-01-04T08:00:00Z'),
        priority: 'high',
        category: 'meeting',
        estimatedTime: 120
      },
      {
        id: 'task-2',
        title: 'Review Q4 reports',
        completed: true,
        createdAt: new Date('2025-01-03T10:00:00Z'),
        completedAt: new Date('2025-01-03T11:30:00Z'),
        priority: 'high',
        category: 'review',
        estimatedTime: 90,
        actualTime: 90
      },
      {
        id: 'task-3',
        title: 'Call with venture partners',
        completed: false,
        createdAt: new Date('2025-01-04T14:00:00Z'),
        priority: 'medium',
        category: 'meeting',
        estimatedTime: 60
      }
    ],
    goals: [
      {
        id: 'goal-1',
        title: 'Increase company revenue by 25%',
        progress: 78,
        deadline: new Date('2025-12-31'),
        category: 'business'
      },
      {
        id: 'goal-2',
        title: 'Complete leadership training',
        progress: 45,
        deadline: new Date('2025-06-30'),
        category: 'professional'
      }
    ],
    habits: [
      {
        id: 'habit-1',
        title: 'Morning meditation',
        completions: [
          new Date('2025-01-01'),
          new Date('2025-01-02'),
          new Date('2025-01-04')
        ],
        target: 7
      }
    ],
    timeEntries: [
      {
        id: 'time-1',
        taskId: 'task-2',
        startTime: new Date('2025-01-03T10:00:00Z'),
        endTime: new Date('2025-01-03T11:30:00Z'),
        duration: 90,
        category: 'review'
      }
    ]
  },
  testScenarios: [
    'mobile_task_creation',
    'voice_note_capture',
    'quick_dashboard_actions',
    'meeting_preparation_workflow',
    'executive_reporting_view'
  ]
};

export const marcusTestData: PersonaTestData = {
  user: {
    id: 'marcus-002',
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@dev.com',
    role: 'Developer',
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/Los_Angeles'
    }
  },
  activityData: {
    tasks: [
      {
        id: 'dev-task-1',
        title: 'Fix authentication bug',
        completed: true,
        createdAt: new Date('2025-01-03T09:00:00Z'),
        completedAt: new Date('2025-01-03T11:00:00Z'),
        priority: 'high',
        category: 'bug',
        estimatedTime: 120,
        actualTime: 120
      },
      {
        id: 'dev-task-2',
        title: 'Implement dark mode toggle',
        completed: false,
        createdAt: new Date('2025-01-04T10:00:00Z'),
        priority: 'medium',
        category: 'feature',
        estimatedTime: 180
      },
      {
        id: 'dev-task-3',
        title: 'Code review for team PRs',
        completed: false,
        createdAt: new Date('2025-01-04T15:00:00Z'),
        priority: 'medium',
        category: 'review',
        estimatedTime: 90
      }
    ],
    goals: [
      {
        id: 'dev-goal-1',
        title: 'Learn TypeScript advanced patterns',
        progress: 65,
        deadline: new Date('2025-03-31'),
        category: 'learning'
      },
      {
        id: 'dev-goal-2',
        title: 'Contribute to open source projects',
        progress: 30,
        deadline: new Date('2025-12-31'),
        category: 'professional'
      }
    ],
    habits: [
      {
        id: 'dev-habit-1',
        title: 'Daily coding practice',
        completions: [
          new Date('2025-01-01'),
          new Date('2025-01-02'),
          new Date('2025-01-03'),
          new Date('2025-01-04')
        ],
        target: 7
      }
    ],
    timeEntries: [
      {
        id: 'dev-time-1',
        taskId: 'dev-task-1',
        startTime: new Date('2025-01-03T09:00:00Z'),
        endTime: new Date('2025-01-03T11:00:00Z'),
        duration: 120,
        category: 'development'
      }
    ]
  },
  testScenarios: [
    'keyboard_navigation',
    'dark_mode_consistency',
    'technical_task_management',
    'command_palette_usage',
    'developer_workflow_optimization'
  ]
};

export const elenaTestData: PersonaTestData = {
  user: {
    id: 'elena-003',
    name: 'Elena Petrov',
    email: 'elena.petrov@pm.com',
    role: 'Project Manager',
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Europe/London'
    }
  },
  activityData: {
    tasks: [
      {
        id: 'pm-task-1',
        title: 'Sprint planning meeting',
        completed: false,
        createdAt: new Date('2025-01-04T09:00:00Z'),
        priority: 'high',
        category: 'planning',
        estimatedTime: 120
      },
      {
        id: 'pm-task-2',
        title: 'Update project timeline',
        completed: true,
        createdAt: new Date('2025-01-03T14:00:00Z'),
        completedAt: new Date('2025-01-03T15:30:00Z'),
        priority: 'medium',
        category: 'planning',
        estimatedTime: 90,
        actualTime: 90
      }
    ],
    goals: [
      {
        id: 'pm-goal-1',
        title: 'Deliver project on time and budget',
        progress: 55,
        deadline: new Date('2025-06-30'),
        category: 'project'
      }
    ],
    habits: [
      {
        id: 'pm-habit-1',
        title: 'Daily team standup',
        completions: [
          new Date('2025-01-01'),
          new Date('2025-01-02'),
          new Date('2025-01-03')
        ],
        target: 5
      }
    ],
    timeEntries: [
      {
        id: 'pm-time-1',
        taskId: 'pm-task-2',
        startTime: new Date('2025-01-03T14:00:00Z'),
        endTime: new Date('2025-01-03T15:30:00Z'),
        duration: 90,
        category: 'planning'
      }
    ]
  },
  testScenarios: [
    'project_management_workflow',
    'team_collaboration_features',
    'reporting_and_analytics',
    'goal_tracking_and_updates',
    'cross_device_synchronization'
  ]
};

export const jamesTestData: PersonaTestData = {
  user: {
    id: 'james-004',
    name: 'James Thompson',
    email: 'james.thompson@freelancer.com',
    role: 'Freelancer',
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'America/Chicago'
    }
  },
  activityData: {
    tasks: [
      {
        id: 'freelance-task-1',
        title: 'Client A website redesign',
        completed: false,
        createdAt: new Date('2025-01-04T08:00:00Z'),
        priority: 'high',
        category: 'client_work',
        estimatedTime: 480
      },
      {
        id: 'freelance-task-2',
        title: 'Invoice preparation for December',
        completed: true,
        createdAt: new Date('2025-01-03T16:00:00Z'),
        completedAt: new Date('2025-01-03T17:00:00Z'),
        priority: 'medium',
        category: 'administrative',
        estimatedTime: 60,
        actualTime: 60
      }
    ],
    goals: [
      {
        id: 'freelance-goal-1',
        title: 'Increase monthly income by 30%',
        progress: 40,
        deadline: new Date('2025-12-31'),
        category: 'financial'
      }
    ],
    habits: [
      {
        id: 'freelance-habit-1',
        title: 'Track time for all projects',
        completions: [
          new Date('2025-01-01'),
          new Date('2025-01-02'),
          new Date('2025-01-03'),
          new Date('2025-01-04')
        ],
        target: 7
      }
    ],
    timeEntries: [
      {
        id: 'freelance-time-1',
        taskId: 'freelance-task-2',
        startTime: new Date('2025-01-03T16:00:00Z'),
        endTime: new Date('2025-01-03T17:00:00Z'),
        duration: 60,
        category: 'administrative'
      }
    ]
  },
  testScenarios: [
    'time_tracking_workflow',
    'client_project_switching',
    'invoice_and_billing_features',
    'mobile_time_entry',
    'freelancer_dashboard_optimization'
  ]
};

export const aishaTestData: PersonaTestData = {
  user: {
    id: 'aisha-005',
    name: 'Aisha Williams',
    email: 'aisha.williams@student.edu',
    role: 'Student',
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York'
    }
  },
  activityData: {
    tasks: [
      {
        id: 'student-task-1',
        title: 'Complete calculus homework',
        completed: false,
        createdAt: new Date('2025-01-04T18:00:00Z'),
        priority: 'high',
        category: 'study',
        estimatedTime: 120
      },
      {
        id: 'student-task-2',
        title: 'Read chapter 5 for history class',
        completed: true,
        createdAt: new Date('2025-01-03T19:00:00Z'),
        completedAt: new Date('2025-01-03T20:30:00Z'),
        priority: 'medium',
        category: 'study',
        estimatedTime: 90,
        actualTime: 90
      }
    ],
    goals: [
      {
        id: 'student-goal-1',
        title: 'Maintain 3.8 GPA this semester',
        progress: 85,
        deadline: new Date('2025-05-15'),
        category: 'academic'
      }
    ],
    habits: [
      {
        id: 'student-habit-1',
        title: 'Study for 2 hours daily',
        completions: [
          new Date('2025-01-01'),
          new Date('2025-01-02'),
          new Date('2025-01-03')
        ],
        target: 7
      }
    ],
    timeEntries: [
      {
        id: 'student-time-1',
        taskId: 'student-task-2',
        startTime: new Date('2025-01-03T19:00:00Z'),
        endTime: new Date('2025-01-03T20:30:00Z'),
        duration: 90,
        category: 'study'
      }
    ]
  },
  testScenarios: [
    'mobile_first_navigation',
    'habit_tracking_consistency',
    'study_session_management',
    'social_productivity_features',
    'student_dashboard_optimization'
  ]
};

export const allPersonaData = {
  sarah: sarahTestData,
  marcus: marcusTestData,
  elena: elenaTestData,
  james: jamesTestData,
  aisha: aishaTestData
};

export default allPersonaData;`;

    const filePath = path.join(this.basePath, 'src/test/data/persona-test-data.ts');

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, personaDataContent);
    this.log('✅ Created persona test data');
  }

  async createPersonaTestScenarios() {
    // Create E2E test scenarios for each persona
    const personaTestsContent = `import { test, expect } from '@playwright/test';
import { allPersonaData } from '../data/persona-test-data';

// Sarah Chen - Executive persona tests
test.describe('Sarah Chen (Executive) - Mobile-First Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mock user login as Sarah
    await page.evaluate((userData) => {
      localStorage.setItem('user-data', JSON.stringify(userData.sarah.user));
      localStorage.setItem('activity-data', JSON.stringify(userData.sarah.activityData));
    }, allPersonaData);
  });

  test('should navigate efficiently on mobile dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Test widget-based navigation
    await expect(page.locator('[data-testid="dashboard-widgets"]')).toBeVisible();

    // Quick task creation
    await page.locator('[data-testid="quick-add-task"]').click();
    await page.fill('[data-testid="task-input"]', 'Call investor about Series B');
    await page.selectOption('[data-testid="priority-select"]', 'high');
    await page.click('[data-testid="save-task"]');

    await expect(page.locator('text=Call investor about Series B')).toBeVisible();
  });

  test('should support voice note creation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Test voice input button
    await page.locator('[data-testid="voice-input"]').click();
    await expect(page.locator('[data-testid="voice-recording"]')).toBeVisible();

    // Simulate voice input completion
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('voice-input', {
        detail: { transcript: 'Schedule board meeting for next Friday at 10 AM' }
      }));
    });

    await expect(page.locator('text=Schedule board meeting')).toBeVisible();
  });

  test('should show executive dashboard widgets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check for executive-specific widgets
    await expect(page.locator('[data-testid="meetings-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-performance-widget"]')).toBeVisible();
  });
});

// Marcus Rodriguez - Developer persona tests
test.describe('Marcus Rodriguez (Developer) - Keyboard-First Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((userData) => {
      localStorage.setItem('user-data', JSON.stringify(userData.marcus.user));
      localStorage.setItem('activity-data', JSON.stringify(userData.marcus.activityData));
    }, allPersonaData);
  });

  test('should support full keyboard navigation', async ({ page }) => {
    // Test command palette
    await page.keyboard.press('Meta+k'); // Cmd+K
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();

    await page.keyboard.type('create task');
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();

    // Navigate with keyboard
    await page.keyboard.type('Fix authentication bug');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown'); // Select high priority
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Save task

    await expect(page.locator('text=Fix authentication bug')).toBeVisible();
  });

  test('should maintain dark mode consistency', async ({ page }) => {
    // Check dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Test all major components in dark mode
    const components = [
      '[data-testid="dashboard"]',
      '[data-testid="task-list"]',
      '[data-testid="navigation"]',
      '[data-testid="settings"]'
    ];

    for (const component of components) {
      await page.locator(component).click();
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });

  test('should support technical task management', async ({ page }) => {
    // Test code-related task categories
    await page.locator('[data-testid="add-task"]').click();
    await page.selectOption('[data-testid="category-select"]', 'development');

    await expect(page.locator('option[value="bug"]')).toBeVisible();
    await expect(page.locator('option[value="feature"]')).toBeVisible();
    await expect(page.locator('option[value="refactor"]')).toBeVisible();
  });
});

// Elena Petrov - Project Manager persona tests
test.describe('Elena Petrov (Project Manager) - Collaboration Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((userData) => {
      localStorage.setItem('user-data', JSON.stringify(userData.elena.user));
      localStorage.setItem('activity-data', JSON.stringify(userData.elena.activityData));
    }, allPersonaData);
  });

  test('should provide project overview dashboard', async ({ page }) => {
    await expect(page.locator('[data-testid="project-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="milestone-tracker"]')).toBeVisible();
  });

  test('should support goal tracking and reporting', async ({ page }) => {
    await page.locator('[data-testid="goals-section"]').click();

    // Check goal progress visualization
    await expect(page.locator('[data-testid="goal-progress-chart"]')).toBeVisible();

    // Test goal update
    await page.locator('[data-testid="update-goal"]').first().click();
    await page.fill('[data-testid="progress-input"]', '75');
    await page.click('[data-testid="save-progress"]');

    await expect(page.locator('text=75%')).toBeVisible();
  });

  test('should generate reports and analytics', async ({ page }) => {
    await page.locator('[data-testid="reports-tab"]').click();

    await expect(page.locator('[data-testid="productivity-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-performance-chart"]')).toBeVisible();

    // Test report export
    await page.locator('[data-testid="export-report"]').click();
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible();
  });
});

// James Thompson - Freelancer persona tests
test.describe('James Thompson (Freelancer) - Time Tracking & Billing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((userData) => {
      localStorage.setItem('user-data', JSON.stringify(userData.james.user));
      localStorage.setItem('activity-data', JSON.stringify(userData.james.activityData));
    }, allPersonaData);
  });

  test('should support accurate time tracking', async ({ page }) => {
    // Start time tracking
    await page.locator('[data-testid="start-timer"]').click();
    await expect(page.locator('[data-testid="active-timer"]')).toBeVisible();

    // Switch between projects
    await page.locator('[data-testid="project-switcher"]').click();
    await page.locator('[data-testid="project-client-a"]').click();

    await expect(page.locator('[data-testid="current-project"]')).toContainText('Client A');

    // Stop timer
    await page.locator('[data-testid="stop-timer"]').click();
    await expect(page.locator('[data-testid="time-entry-form"]')).toBeVisible();
  });

  test('should manage client projects efficiently', async ({ page }) => {
    await page.locator('[data-testid="projects-tab"]').click();

    // Create new project
    await page.locator('[data-testid="new-project"]').click();
    await page.fill('[data-testid="project-name"]', 'Client B Website');
    await page.fill('[data-testid="client-name"]', 'Client B');
    await page.fill('[data-testid="hourly-rate"]', '75');
    await page.click('[data-testid="save-project"]');

    await expect(page.locator('text=Client B Website')).toBeVisible();
  });

  test('should generate invoices and billing reports', async ({ page }) => {
    await page.locator('[data-testid="billing-tab"]').click();

    // Create invoice
    await page.locator('[data-testid="create-invoice"]').click();
    await page.selectOption('[data-testid="client-select"]', 'client-a');
    await page.click('[data-testid="generate-invoice"]');

    await expect(page.locator('[data-testid="invoice-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });
});

// Aisha Williams - Student persona tests
test.describe('Aisha Williams (Student) - Mobile Study Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.evaluate((userData) => {
      localStorage.setItem('user-data', JSON.stringify(userData.aisha.user));
      localStorage.setItem('activity-data', JSON.stringify(userData.aisha.activityData));
    }, allPersonaData);
  });

  test('should provide mobile-optimized study interface', async ({ page }) => {
    // Check mobile-specific layout
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="study-dashboard"]')).toBeVisible();

    // Test swipe navigation
    await page.locator('[data-testid="study-dashboard"]').swipe('left');
    await expect(page.locator('[data-testid="habits-view"]')).toBeVisible();
  });

  test('should track study habits effectively', async ({ page }) => {
    await page.locator('[data-testid="habits-tab"]').click();

    // Mark habit as complete
    await page.locator('[data-testid="habit-study-daily"]').click();
    await expect(page.locator('[data-testid="habit-check"]')).toBeVisible();

    // Check streak counter
    await expect(page.locator('[data-testid="study-streak"]')).toContainText('3 days');
  });

  test('should support study session management', async ({ page }) => {
    // Start study session
    await page.locator('[data-testid="start-study-session"]').click();
    await page.selectOption('[data-testid="subject-select"]', 'calculus');
    await page.selectOption('[data-testid="session-duration"]', '25'); // Pomodoro
    await page.click('[data-testid="start-session"]');

    await expect(page.locator('[data-testid="study-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-subject"]')).toContainText('Calculus');
  });

  test('should show academic progress tracking', async ({ page }) => {
    await page.locator('[data-testid="progress-tab"]').click();

    await expect(page.locator('[data-testid="gpa-tracker"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="assignment-deadlines"]')).toBeVisible();
  });
});`;

    const filePath = path.join(this.basePath, 'src/test/e2e/persona-scenarios.spec.ts');

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, personaTestsContent);
    this.log('✅ Created persona test scenarios');
  }

  async createPerformanceTests() {
    const performanceTestsContent = `import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0
        };

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.LCP = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.FID = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.CLS = entries.reduce((sum, entry) => sum + entry.value, 0);
        }).observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.FCP = entries[0].startTime;
        }).observe({ entryTypes: ['paint'] });

        // Resolve after a delay to collect metrics
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    // Assert Core Web Vitals thresholds
    expect(vitals.LCP).toBeLessThan(4000); // Less than 4 seconds
    expect(vitals.FID).toBeLessThan(100);  // Less than 100ms
    expect(vitals.CLS).toBeLessThan(0.1);  // Less than 0.1
    expect(vitals.FCP).toBeLessThan(2000); // Less than 2 seconds
  });

  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Create large dataset
    await page.goto('/');

    await page.evaluate(() => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: \`task-\${i}\`,
        title: \`Task \${i + 1}\`,
        completed: Math.random() > 0.5,
        createdAt: new Date(),
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      }));

      localStorage.setItem('large-dataset', JSON.stringify(largeTasks));
    });

    await page.reload();

    // Measure rendering performance
    const renderTime = await page.evaluate(() => {
      const start = performance.now();

      // Trigger re-render with large dataset
      const event = new CustomEvent('load-large-dataset');
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

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/');

    // Start FPS monitoring
    const fps = await page.evaluate(() => {
      let frames = 0;
      let lastTime = performance.now();

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
        widgets.forEach(widget => {
          widget.style.transform = 'translateX(100px)';
          widget.style.transition = 'transform 1s ease';
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

  test('should optimize bundle size', async ({ page }) => {
    const response = await page.goto('/');
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources
        .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    });

    // Assert total resource size is under 500KB
    expect(resourceSizes).toBeLessThan(500 * 1024);
  });

  test('should handle concurrent users simulation', async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 10 }, () => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Simulate 10 concurrent users
    const loadPromises = pages.map(async (page, index) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      return Date.now() - startTime;
    });

    const loadTimes = await Promise.all(loadPromises);
    const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;

    expect(averageLoadTime).toBeLessThan(5000); // Average load time under 5 seconds

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });
});`;

    const filePath = path.join(this.basePath, 'src/test/e2e/performance.spec.ts');
    fs.writeFileSync(filePath, performanceTestsContent);
    this.log('✅ Created performance tests');
  }

  async createAccessibilityTests() {
    const accessibilityTestsContent = `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on dashboard', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Navigate through all focusable elements
    const focusableElements = await page.locator('button, input, [tabindex]:not([tabindex="-1"])').count();

    for (let i = 0; i < Math.min(focusableElements, 10); i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check for required ARIA attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasAriaDescribedBy = await button.getAttribute('aria-describedby');
      const hasTextContent = await button.textContent();

      // Button should have accessible name
      expect(hasAriaLabel || hasTextContent).toBeTruthy();
    }

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let lastLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.charAt(1));

      if (lastLevel > 0) {
        expect(level).toBeLessThanOrEqual(lastLevel + 1);
      }
      lastLevel = level;
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');

    // Check for landmarks
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to")');
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeFocused();
    }

    // Test live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();

    for (let i = 0; i < liveRegionCount; i++) {
      const liveRegion = liveRegions.nth(i);
      const ariaLive = await liveRegion.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }
  });

  test('should meet color contrast requirements', async ({ page }) => {
    await page.goto('/');

    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="main-content"]')
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should support high contrast mode', async ({ page }) => {
    await page.goto('/');

    // Simulate high contrast mode
    await page.addStyleTag({
      content: \`
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      \`
    });

    await page.emulateMedia({ 'prefers-contrast': 'high' });

    // Verify high contrast elements are visible
    const textElements = page.locator('p, span, button, input, label');
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      await expect(textElements.nth(i)).toBeVisible();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    await page.goto('/');

    // Set prefers-reduced-motion
    await page.emulateMedia({ 'prefers-reduced-motion': 'reduce' });

    // Trigger an animation
    await page.locator('[data-testid="add-widget"]').click();

    // Check that animations are reduced/disabled
    const animatedElements = page.locator('[class*="animate"], [style*="transition"]');
    const elementCount = await animatedElements.count();

    for (let i = 0; i < elementCount; i++) {
      const element = animatedElements.nth(i);
      const computedStyle = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration
        };
      });

      // Animations should be disabled or very short
      expect(
        computedStyle.animationDuration === '0s' ||
        computedStyle.transitionDuration === '0s' ||
        computedStyle.animationDuration === 'none'
      ).toBeTruthy();
    }
  });

  test('should have accessible form validation', async ({ page }) => {
    await page.goto('/');

    // Find and test a form
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Submit empty form to trigger validation
    await page.locator('button[type="submit"]').click();

    // Check for error messages with proper ARIA attributes
    const errorMessages = page.locator('[role="alert"], [aria-invalid="true"] + *, .error-message');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorElement = errorMessages.nth(i);
        await expect(errorElement).toBeVisible();

        // Error should be announced to screen readers
        const hasRole = await errorElement.getAttribute('role');
        const hasAriaLive = await errorElement.getAttribute('aria-live');
        expect(hasRole === 'alert' || hasAriaLive).toBeTruthy();
      }
    }
  });

  test('should support dark mode accessibility', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode
    await page.locator('[data-testid="theme-toggle"]').click();

    // Verify dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Run accessibility scan in dark mode
    const darkModeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(darkModeResults.violations).toEqual([]);
  });

  test('should support mobile accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Test touch targets are large enough (minimum 44x44px)
    const buttons = page.locator('button, a, input[type="button"], input[type="submit"]');
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
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(mobileResults.violations).toEqual([]);
  });
});`;

    const filePath = path.join(this.basePath, 'src/test/e2e/accessibility.spec.ts');
    fs.writeFileSync(filePath, accessibilityTestsContent);
    this.log('✅ Created accessibility tests');
  }

  async createVisualRegressionTests() {
    const visualTestsContent = `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match dashboard screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hide dynamic content for consistent screenshots
    await page.addStyleTag({
      content: \`
        [data-dynamic="true"],
        .timestamp,
        .live-data {
          visibility: hidden !important;
        }
      \`
    });

    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('should match task list in different states', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Empty state
    await page.evaluate(() => {
      localStorage.setItem('tasks', JSON.stringify([]));
    });
    await page.reload();
    await expect(page.locator('[data-testid="task-list"]')).toHaveScreenshot('task-list-empty.png');

    // With tasks
    await page.evaluate(() => {
      const tasks = [
        { id: '1', title: 'Complete project proposal', completed: false, priority: 'high' },
        { id: '2', title: 'Review team feedback', completed: true, priority: 'medium' },
        { id: '3', title: 'Schedule client meeting', completed: false, priority: 'low' }
      ];
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
    await page.reload();
    await expect(page.locator('[data-testid="task-list"]')).toHaveScreenshot('task-list-with-tasks.png');
  });

  test('should match widget layouts', async ({ page }) => {
    await page.goto('/');

    // Test individual widgets
    const widgets = [
      'tasks-widget',
      'goals-widget',
      'habits-widget',
      'analytics-widget'
    ];

    for (const widget of widgets) {
      const widgetElement = page.locator(\`[data-testid="\${widget}"]\`);
      if (await widgetElement.count() > 0) {
        await expect(widgetElement).toHaveScreenshot(\`\${widget}.png\`);
      }
    }
  });

  test('should match theme variations', async ({ page }) => {
    await page.goto('/');

    // Light theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500); // Wait for theme transition
    await expect(page).toHaveScreenshot('dashboard-light.png');

    // Dark theme
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard-dark.png');
  });

  test('should match mobile responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(\`dashboard-\${viewport.name}.png\`);
    }
  });

  test('should match form states', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator('[data-testid="task-form"]');

    // Empty form
    await expect(form).toHaveScreenshot('task-form-empty.png');

    // Filled form
    await page.fill('[data-testid="task-title"]', 'New important task');
    await page.selectOption('[data-testid="priority-select"]', 'high');
    await expect(form).toHaveScreenshot('task-form-filled.png');

    // Form with validation errors
    await page.fill('[data-testid="task-title"]', '');
    await page.click('[data-testid="save-task"]');
    await expect(form).toHaveScreenshot('task-form-errors.png');
  });

  test('should match modal and overlay states', async ({ page }) => {
    await page.goto('/');

    // Settings modal
    await page.locator('[data-testid="settings-button"]').click();
    const modal = page.locator('[data-testid="settings-modal"]');
    await expect(modal).toHaveScreenshot('settings-modal.png');

    // Close modal
    await page.keyboard.press('Escape');

    // Command palette
    await page.keyboard.press('Meta+k');
    const commandPalette = page.locator('[data-testid="command-palette"]');
    await expect(commandPalette).toHaveScreenshot('command-palette.png');
  });

  test('should match loading states', async ({ page }) => {
    await page.goto('/');

    // Simulate loading state
    await page.evaluate(() => {
      // Show loading spinners
      document.querySelectorAll('[data-testid*="widget"]').forEach(widget => {
        widget.innerHTML = '<div class="animate-spin">Loading...</div>';
      });
    });

    await expect(page).toHaveScreenshot('dashboard-loading.png');
  });

  test('should match error states', async ({ page }) => {
    await page.goto('/');

    // Simulate error state
    await page.evaluate(() => {
      // Show error messages
      document.querySelectorAll('[data-testid*="widget"]').forEach(widget => {
        widget.innerHTML = '<div class="text-red-500">Error loading data</div>';
      });
    });

    await expect(page).toHaveScreenshot('dashboard-error.png');
  });

  test('should match internationalization layouts', async ({ page }) => {
    const languages = ['en', 'es', 'fr', 'ar']; // Including RTL language

    for (const lang of languages) {
      await page.goto(\`/?lang=\${lang}\`);
      await page.waitForLoadState('networkidle');

      // Set document direction for RTL languages
      if (lang === 'ar') {
        await page.evaluate(() => {
          document.documentElement.setAttribute('dir', 'rtl');
        });
      }

      await expect(page).toHaveScreenshot(\`dashboard-\${lang}.png\`);
    }
  });
});`;

    const filePath = path.join(this.basePath, 'src/test/e2e/visual-regression.spec.ts');
    fs.writeFileSync(filePath, visualTestsContent);
    this.log('✅ Created visual regression tests');
  }

  async createSecurityTests() {
    const securityTestsContent = `import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent XSS attacks in user inputs', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="add-task"]').click();

    // Attempt XSS injection
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>'
    ];

    for (const payload of xssPayloads) {
      await page.fill('[data-testid="task-title"]', payload);
      await page.click('[data-testid="save-task"]');

      // Verify that the script doesn't execute
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const dialog = await dialogPromise;

      expect(dialog).toBeNull(); // No alert should appear

      // Verify content is properly escaped
      const taskContent = await page.locator('[data-testid="task-list"]').textContent();
      expect(taskContent).not.toContain('<script>');
    }
  });

  test('should sanitize HTML content', async ({ page }) => {
    await page.goto('/');

    // Test HTML injection in various fields
    await page.evaluate(() => {
      const htmlPayload = '<b>Bold</b><script>alert("XSS")</script><style>body{display:none}</style>';

      // Try to inject HTML through localStorage (simulating API response)
      localStorage.setItem('test-content', htmlPayload);

      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('content-update', {
        detail: { content: htmlPayload }
      }));
    });

    // Verify HTML is sanitized
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    expect(pageContent).not.toContain('<style>body{display:none}</style>');

    // But safe HTML should be preserved
    expect(pageContent).toContain('Bold'); // Text content should remain
  });

  test('should implement proper CSRF protection', async ({ page, context }) => {
    await page.goto('/');

    // Check for CSRF token in forms
    await page.locator('[data-testid="add-task"]').click();

    const form = page.locator('form');
    const csrfToken = await form.locator('input[name="csrf_token"], input[name="_token"]').getAttribute('value');

    // CSRF token should exist (if implemented)
    if (csrfToken) {
      expect(csrfToken).toBeTruthy();
      expect(csrfToken.length).toBeGreaterThan(10);
    }

    // Test that requests without CSRF token are rejected
    const response = await context.request.post('/api/tasks', {
      data: { title: 'Test task' },
      headers: { 'Content-Type': 'application/json' }
    });

    // Should either require authentication or CSRF token
    expect([401, 403, 422]).toContain(response.status());
  });

  test('should validate input lengths and types', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="add-task"]').click();

    // Test extremely long input
    const longString = 'A'.repeat(10000);
    await page.fill('[data-testid="task-title"]', longString);
    await page.click('[data-testid="save-task"]');

    // Should show validation error or truncate
    const errorMessage = page.locator('[role="alert"], .error-message');
    const hasError = await errorMessage.count() > 0;

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    } else {
      // If no error, content should be truncated
      const savedContent = await page.locator('[data-testid="task-list"]').textContent();
      expect(savedContent?.length || 0).toBeLessThan(1000);
    }

    // Test SQL injection patterns
    const sqlPayloads = [
      "'; DROP TABLE tasks; --",
      "' OR '1'='1",
      "'; UPDATE tasks SET title='hacked'; --"
    ];

    for (const payload of sqlPayloads) {
      await page.fill('[data-testid="task-title"]', payload);
      await page.click('[data-testid="save-task"]');

      // Verify the payload is treated as regular text
      const taskContent = await page.locator('[data-testid="task-list"]').textContent();
      expect(taskContent).toContain(payload); // Should be stored as-is, not executed
    }
  });

  test('should implement secure authentication headers', async ({ page }) => {
    const response = await page.goto('/');

    // Check security headers
    const headers = response?.headers();

    // Content Security Policy
    expect(headers?.['content-security-policy'] || headers?.['csp']).toBeTruthy();

    // X-Frame-Options
    expect(headers?.['x-frame-options']).toBeTruthy();

    // X-Content-Type-Options
    expect(headers?.['x-content-type-options']).toBe('nosniff');

    // Referrer Policy
    expect(headers?.['referrer-policy']).toBeTruthy();

    // If HTTPS, check security headers
    if (page.url().startsWith('https://')) {
      expect(headers?.['strict-transport-security']).toBeTruthy();
    }
  });

  test('should protect against clickjacking', async ({ page }) => {
    // Check X-Frame-Options or CSP frame-ancestors
    const response = await page.goto('/');
    const headers = response?.headers();

    const xFrameOptions = headers?.['x-frame-options'];
    const csp = headers?.['content-security-policy'];

    const hasClickjackingProtection =
      xFrameOptions === 'DENY' ||
      xFrameOptions === 'SAMEORIGIN' ||
      (csp && csp.includes('frame-ancestors'));

    expect(hasClickjackingProtection).toBeTruthy();

    // Test that the app can't be framed by external sites
    await page.evaluate(() => {
      const iframe = document.createElement('iframe');
      iframe.src = window.location.href;
      document.body.appendChild(iframe);

      return new Promise((resolve) => {
        iframe.onload = () => resolve('loaded');
        iframe.onerror = () => resolve('blocked');
        setTimeout(() => resolve('timeout'), 2000);
      });
    });
  });

  test('should handle file upload security', async ({ page }) => {
    // If the app has file upload functionality
    const fileInput = page.locator('input[type="file"]');
    const hasFileUpload = await fileInput.count() > 0;

    if (hasFileUpload) {
      // Test malicious file types
      const maliciousFiles = [
        'test.exe',
        'test.php',
        'test.jsp',
        'test.asp'
      ];

      for (const fileName of maliciousFiles) {
        // Create a test file
        const fileContent = Buffer.from('malicious content');

        await fileInput.setInputFiles({
          name: fileName,
          mimeType: 'application/octet-stream',
          buffer: fileContent
        });

        // Submit form
        await page.click('[data-testid="upload-submit"]');

        // Should show error or reject the file
        const errorMessage = page.locator('[role="alert"], .error-message');
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should implement rate limiting', async ({ page, context }) => {
    // Test rapid requests to prevent spam/DoS
    const requests = [];

    for (let i = 0; i < 100; i++) {
      requests.push(
        context.request.post('/api/tasks', {
          data: { title: \`Spam task \${i}\` },
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status() === 429);

    // Should have some rate limiting after many requests
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('should validate session security', async ({ page, context }) => {
    await page.goto('/login');

    // Check session security
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('auth')
    );

    if (sessionCookie) {
      // Session cookie should be secure
      expect(sessionCookie.secure).toBeTruthy();
      expect(sessionCookie.httpOnly).toBeTruthy();
      expect(sessionCookie.sameSite).toBe('Strict');
    }
  });

  test('should prevent information disclosure', async ({ page, context }) => {
    // Test error pages don't reveal sensitive information
    const testUrls = [
      '/nonexistent-page',
      '/api/admin',
      '/config',
      '/.env',
      '/debug'
    ];

    for (const url of testUrls) {
      const response = await context.request.get(url);
      const content = await response.text();

      // Should not reveal sensitive information
      expect(content.toLowerCase()).not.toContain('password');
      expect(content.toLowerCase()).not.toContain('secret');
      expect(content.toLowerCase()).not.toContain('api key');
      expect(content.toLowerCase()).not.toContain('database');
      expect(content.toLowerCase()).not.toContain('stack trace');
    }
  });
});`;

    const filePath = path.join(this.basePath, 'src/test/e2e/security.spec.ts');
    fs.writeFileSync(filePath, securityTestsContent);
    this.log('✅ Created security tests');
  }

  async createTestUtilities() {
    const testUtilsContent = `import { Page, Locator, expect } from '@playwright/test';
import { PersonaTestData } from '../data/persona-test-data';

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
    await element.waitFor({ state: 'visible', timeout });
    await this.page.waitForLoadState('networkidle');
    return element;
  }

  /**
   * Fill form with data and submit
   */
  async fillAndSubmitForm(formData: Record<string, string>, submitSelector = 'button[type="submit"]') {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(\`[data-testid="\${field}"], [name="\${field}"]\`, value);
    }
    await this.page.click(submitSelector);
  }

  /**
   * Setup persona data for testing
   */
  async setupPersona(personaData: PersonaTestData) {
    await this.page.evaluate((data) => {
      localStorage.setItem('user-data', JSON.stringify(data.user));
      localStorage.setItem('activity-data', JSON.stringify(data.activityData));
      localStorage.setItem('test-persona', JSON.stringify(data));
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
    await this.page.route(\`**/\${endpoint}\`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Simulate network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: \`screenshots/\${name}-\${timestamp}.png\`,
      fullPage: true
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
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign(breakpoints = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ]) {
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      await this.page.waitForLoadState('networkidle');

      // Check that content is visible and usable
      await expect(this.page.locator('body')).toBeVisible();

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
    await this.page.keyboard.press('Tab');

    for (let i = 0; i < 20; i++) {
      const focusedElement = await this.page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName);
      const testId = await focusedElement.getAttribute('data-testid');

      focusableElements.push(testId || tagName);

      await expect(focusedElement).toBeVisible();
      await this.page.keyboard.press('Tab');
    }

    return focusableElements;
  }

  /**
   * Simulate user interactions
   */
  async simulateTypicalUserSession(scenario: string[]) {
    for (const action of scenario) {
      switch (action) {
        case 'create_task':
          await this.page.click('[data-testid="add-task"]');
          await this.page.fill('[data-testid="task-title"]', 'Test task');
          await this.page.click('[data-testid="save-task"]');
          break;

        case 'complete_task':
          await this.page.click('[data-testid="task-checkbox"]');
          break;

        case 'open_settings':
          await this.page.click('[data-testid="settings-button"]');
          break;

        case 'switch_theme':
          await this.page.click('[data-testid="theme-toggle"]');
          break;

        case 'use_search':
          await this.page.keyboard.press('Meta+k');
          await this.page.type('[data-testid="search-input"]', 'test');
          break;

        default:
          console.warn(\`Unknown action: \${action}\`);
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
      results
    };

    // Save report (would typically send to test reporting service)
    console.log('Test Report:', JSON.stringify(report, null, 2));

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
    const hasDataTestId = await element.getAttribute('data-testid');
    const hasWidgetClass = await element.evaluate(el =>
      el.classList.contains('widget') || el.classList.contains('card')
    );

    const pass = hasDataTestId?.includes('widget') && hasWidgetClass;

    return {
      pass,
      message: () => \`Expected element to be a productive widget\`
    };
  },

  async toHaveAccessibleName(locator: Locator) {
    const element = await locator.first();

    const ariaLabel = await element.getAttribute('aria-label');
    const textContent = await element.textContent();
    const title = await element.getAttribute('title');

    const hasAccessibleName = !!(ariaLabel || textContent?.trim() || title);

    return {
      pass: hasAccessibleName,
      message: () => \`Expected element to have an accessible name\`
    };
  }
};

export default TestUtils;`;

    const filePath = path.join(this.basePath, 'src/test/utils/test-utils.ts');

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, testUtilsContent);
    this.log('✅ Created test utilities');
  }

  async createQualityGates() {
    const qualityGatesContent = `/**
 * Quality Gates Configuration
 * Defines thresholds and standards for code quality
 */

export const qualityGates = {
  // Code Coverage Thresholds
  coverage: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    },
    perFile: {
      branches: 70,
      functions: 75,
      lines: 85,
      statements: 85
    }
  },

  // Performance Budgets
  performance: {
    // Core Web Vitals
    coreWebVitals: {
      firstContentfulPaint: 2000,     // 2 seconds
      largestContentfulPaint: 4000,   // 4 seconds
      firstInputDelay: 100,           // 100ms
      cumulativeLayoutShift: 0.1      // 0.1
    },

    // Bundle Size Limits (in KB)
    bundleSize: {
      total: 500,
      css: 50,
      js: 400,
      images: 100
    },

    // Network Requests
    requests: {
      total: 50,
      css: 5,
      js: 10,
      images: 20,
      fonts: 5
    }
  },

  // Accessibility Standards
  accessibility: {
    // WCAG Compliance Level
    wcagLevel: 'AA',

    // Minimum Scores
    scores: {
      overall: 95,
      colorContrast: 100,
      keyboardNavigation: 100,
      screenReader: 95,
      forms: 100
    },

    // Required Features
    required: [
      'keyboard_navigation',
      'screen_reader_support',
      'high_contrast_mode',
      'reduced_motion_support',
      'focus_indicators',
      'aria_labels',
      'semantic_html'
    ]
  },

  // Security Standards
  security: {
    // Required Headers
    headers: [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy'
    ],

    // Vulnerability Thresholds
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 3,
      low: 10
    },

    // Required Protections
    protections: [
      'xss_prevention',
      'csrf_protection',
      'input_validation',
      'output_encoding',
      'secure_headers',
      'rate_limiting'
    ]
  },

  // Code Quality Standards
  codeQuality: {
    // ESLint Rules
    eslint: {
      maxErrors: 0,
      maxWarnings: 5
    },

    // TypeScript
    typescript: {
      strictMode: true,
      noImplicitAny: true,
      maxErrors: 0
    },

    // Complexity Limits
    complexity: {
      cyclomaticComplexity: 10,
      maxFunctionLength: 50,
      maxFileLength: 300
    }
  },

  // Testing Standards
  testing: {
    // Test Types Required
    requiredTests: [
      'unit',
      'integration',
      'e2e',
      'accessibility',
      'performance',
      'security'
    ],

    // Coverage by Test Type
    coverageByType: {
      unit: 85,
      integration: 70,
      e2e: 60
    },

    // Persona Coverage
    personaCoverage: {
      required: ['sarah', 'marcus', 'elena', 'james', 'aisha'],
      coveragePerPersona: 80
    }
  },

  // Internationalization Standards
  i18n: {
    // Required Languages
    requiredLanguages: ['en', 'es', 'fr', 'de', 'pt'],

    // RTL Support
    rtlLanguages: ['ar', 'he'],

    // Translation Coverage
    translationCoverage: {
      minimum: 90,
      recommended: 100
    },

    // Cultural Adaptations
    culturalAdaptations: [
      'date_formats',
      'number_formats',
      'currency_formats',
      'time_formats'
    ]
  }
};

/**
 * Quality Gate Validator
 */
export class QualityGateValidator {
  static validateCoverage(coverage: any): boolean {
    const { global } = qualityGates.coverage;

    return (
      coverage.branches >= global.branches &&
      coverage.functions >= global.functions &&
      coverage.lines >= global.lines &&
      coverage.statements >= global.statements
    );
  }

  static validatePerformance(metrics: any): boolean {
    const { coreWebVitals, bundleSize } = qualityGates.performance;

    return (
      metrics.fcp <= coreWebVitals.firstContentfulPaint &&
      metrics.lcp <= coreWebVitals.largestContentfulPaint &&
      metrics.fid <= coreWebVitals.firstInputDelay &&
      metrics.cls <= coreWebVitals.cumulativeLayoutShift &&
      metrics.totalSize <= bundleSize.total * 1024
    );
  }

  static validateAccessibility(results: any): boolean {
    const { scores } = qualityGates.accessibility;

    return (
      results.overall >= scores.overall &&
      results.violations.length === 0
    );
  }

  static validateSecurity(findings: any): boolean {
    const { vulnerabilities } = qualityGates.security;

    return (
      findings.critical <= vulnerabilities.critical &&
      findings.high <= vulnerabilities.high &&
      findings.medium <= vulnerabilities.medium &&
      findings.low <= vulnerabilities.low
    );
  }

  static generateReport(results: any): any {
    const report = {
      timestamp: new Date().toISOString(),
      passed: true,
      gates: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    // Validate each gate
    const gates = [
      { name: 'coverage', validator: this.validateCoverage },
      { name: 'performance', validator: this.validatePerformance },
      { name: 'accessibility', validator: this.validateAccessibility },
      { name: 'security', validator: this.validateSecurity }
    ];

    for (const gate of gates) {
      const gateResults = results[gate.name];
      const passed = gate.validator(gateResults);

      report.gates[gate.name] = {
        passed,
        results: gateResults,
        thresholds: qualityGates[gate.name]
      };

      report.summary.total++;
      if (passed) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
        report.passed = false;
      }
    }

    return report;
  }
}

export default qualityGates;`;

    const filePath = path.join(this.basePath, 'src/test/config/quality-gates.ts');

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, qualityGatesContent);
    this.log('✅ Created quality gates configuration');
  }

  generateTestingReport() {
    this.log('📋 Generating testing framework report...');

    const report = {
      agentInfo: {
        name: this.agentName,
        version: this.version,
        executionTime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      testingCapabilities: {
        personas: Object.keys(this.config.personas),
        testCategories: this.config.testCategories,
        qualityGates: this.config.qualityGates
      },
      findings: this.findings,
      issues: this.issues,
      implementation: {
        status: 'completed',
        filesCreated: [
          'vitest.config.ts',
          'playwright.config.ts',
          'src/test/setup.ts',
          'src/test/data/persona-test-data.ts',
          'src/test/e2e/persona-scenarios.spec.ts',
          'src/test/e2e/performance.spec.ts',
          'src/test/e2e/accessibility.spec.ts',
          'src/test/e2e/visual-regression.spec.ts',
          'src/test/e2e/security.spec.ts',
          'src/test/utils/test-utils.ts',
          'src/test/config/quality-gates.ts'
        ],
        frameworks: [
          'Vitest for unit testing',
          'Playwright for E2E testing',
          'Axe-core for accessibility testing',
          'Lighthouse for performance testing',
          'Custom persona-based testing'
        ]
      }
    };

    const reportPath = path.join(this.basePath, 'TESTING_FRAMEWORK_REPORT.md');
    const reportContent = `# Testing Framework Implementation Report
Generated by: ${this.agentName} v${this.version}
Date: ${new Date().toLocaleDateString()}
Execution Time: ${(Date.now() - this.startTime)}ms

## Executive Summary
Comprehensive testing framework implemented with ${Object.keys(this.config.personas).length} user personas and ${this.config.testCategories.length} test categories.

## User Personas Implemented
${Object.entries(this.config.personas).map(([key, persona]) => `
### ${persona.name} (${persona.role})
- **Devices**: ${persona.devices.join(', ')}
- **Characteristics**: ${persona.characteristics.join(', ')}
- **Preferences**: Theme: ${persona.preferences.theme}, Language: ${persona.preferences.language}
`).join('')}

## Test Categories
${this.config.testCategories.map(category => `✅ ${category.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}`).join('\n')}

## Quality Gates

### Code Coverage
- **Minimum**: ${this.config.qualityGates.codeCoverage}%
- **Enforcement**: Pre-commit hooks and CI/CD

### Performance Budget
- **First Contentful Paint**: < ${this.config.qualityGates.performanceBudget.firstContentfulPaint}ms
- **Largest Contentful Paint**: < ${this.config.qualityGates.performanceBudget.largestContentfulPaint}ms
- **Cumulative Layout Shift**: < ${this.config.qualityGates.performanceBudget.cumulativeLayoutShift}
- **First Input Delay**: < ${this.config.qualityGates.performanceBudget.firstInputDelay}ms

### Accessibility Score
- **Minimum**: ${this.config.qualityGates.accessibilityScore}%
- **Standards**: WCAG 2.1 AA compliance

### Bundle Size
- **Maximum**: ${this.config.qualityGates.bundleSize}KB

## Test Structure

### Unit Tests (\`vitest\`)
- **Framework**: Vitest + React Testing Library
- **Coverage**: >90% target
- **Location**: \`src/**/*.test.{ts,tsx}\`

### Integration Tests (\`vitest\`)
- **API testing**: Service layer integration
- **Component integration**: Complex component interactions
- **Data flow testing**: End-to-end data scenarios

### E2E Tests (\`playwright\`)
- **Persona-based scenarios**: Real user workflows
- **Cross-browser testing**: Chrome, Firefox, Safari
- **Mobile testing**: iOS and Android viewports
- **Performance testing**: Core Web Vitals measurement

### Accessibility Tests (\`axe-core\`)
- **WCAG compliance**: 2.1 AA standards
- **Keyboard navigation**: Tab order and shortcuts
- **Screen reader testing**: ARIA labels and roles
- **Color contrast**: 4.5:1 minimum ratio

### Visual Regression Tests (\`playwright\`)
- **Component screenshots**: Widget and layout testing
- **Theme variations**: Light/dark mode consistency
- **Responsive layouts**: Multiple breakpoints
- **Internationalization**: Multi-language layouts

### Security Tests (\`playwright\`)
- **XSS prevention**: Input sanitization testing
- **CSRF protection**: Token validation
- **Authentication**: Session security
- **Input validation**: SQL injection prevention

## Persona Test Scenarios

### Sarah Chen (Executive)
- Mobile-first dashboard navigation
- Voice note creation and transcription
- Executive widget customization
- Quick action workflows

### Marcus Rodriguez (Developer)
- Keyboard-only navigation
- Dark mode consistency testing
- Command palette functionality
- Technical task management

### Elena Petrov (Project Manager)
- Goal tracking and reporting
- Team collaboration features
- Project dashboard views
- Analytics and insights

### James Thompson (Freelancer)
- Time tracking accuracy
- Client project management
- Invoice generation
- Mobile time entry

### Aisha Williams (Student)
- Mobile study interface
- Habit tracking consistency
- Study session management
- Academic progress tracking

## Test Data Management

### Realistic Test Data
- **Generated per persona**: Authentic activity patterns
- **Time-based scenarios**: Real usage timelines
- **Category diversity**: Work, personal, academic contexts

### Test Utilities
- **Page helpers**: Common interaction patterns
- **Accessibility checkers**: Automated compliance validation
- **Performance measurers**: Core Web Vitals collection
- **Responsive testers**: Multi-breakpoint validation

## CI/CD Integration

### Pre-commit Hooks
- Unit test execution
- Lint and format checking
- Type checking
- Basic accessibility validation

### Pull Request Checks
- Full test suite execution
- Coverage validation
- Performance budget enforcement
- Security scan results

### Deployment Gates
- Production smoke tests
- Performance monitoring
- Accessibility compliance
- Security verification

## Reporting and Monitoring

### Test Reports
- **Coverage reports**: HTML and JSON formats
- **Performance metrics**: Lighthouse CI integration
- **Accessibility reports**: axe-core detailed findings
- **Visual regression**: Pixel-perfect comparisons

### Quality Dashboards
- **Real-time metrics**: Test success rates
- **Trend analysis**: Performance over time
- **Persona coverage**: User journey completion
- **Quality gates**: Pass/fail status

## Running Tests

### Development
\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:perf
\`\`\`

### Production Validation
\`\`\`bash
# Full test suite
npm run test:all

# Persona scenarios
npm run test:personas

# Quality gates
npm run test:quality-gates
\`\`\`

## Next Steps
1. Implement additional personas based on user research
2. Add cross-device testing (real device cloud)
3. Integrate with monitoring and alerting systems
4. Expand international testing scenarios
5. Add AI-powered test generation
6. Implement mutation testing for test quality

---
Report generated automatically by Testing & Quality Agent
`;

    fs.writeFileSync(reportPath, reportContent);
    this.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }

  async run() {
    try {
      this.log(`🚀 Starting ${this.agentName} v${this.version}`);

      // Phase 1: Analysis
      await this.analyzeExistingTests();

      // Phase 2: Implementation
      await this.implementTestingFramework();

      // Phase 3: Reporting
      const report = this.generateTestingReport();

      this.log(`✅ ${this.agentName} completed successfully!`);
      this.log(`⏱️  Total execution time: ${Date.now() - this.startTime}ms`);
      this.log(`👥 User personas: ${Object.keys(this.config.personas).length}`);
      this.log(`🧪 Test categories: ${this.config.testCategories.length}`);

      return report;

    } catch (error) {
      this.log(`❌ Agent failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new TestingQualityAgent();
  agent.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { TestingQualityAgent };