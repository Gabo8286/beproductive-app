#!/usr/bin/env node

/**
 * Automated Visual Feedback System
 * Provides real-time visual verification of code changes without manual intervention
 * Usage: node scripts/automated-visual-feedback.js [command] [options]
 */

import { chromium } from '@playwright/test';
import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AutomatedVisualFeedback {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:8080';
    this.screenshotDir = path.join(process.cwd(), 'visual-feedback');
    this.verbose = process.argv.includes('--verbose');
    this.isMonitoring = false;
    this.changeHistory = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : '🤖';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true });
      await fs.mkdir(path.join(this.screenshotDir, 'current'), { recursive: true });
      await fs.mkdir(path.join(this.screenshotDir, 'history'), { recursive: true });
      await fs.mkdir(path.join(this.screenshotDir, 'comparisons'), { recursive: true });
    } catch (error) {
      this.log(`Failed to create directories: ${error.message}`, 'error');
    }
  }

  /**
   * Initialize Playwright browser in headless mode
   */
  async initBrowser(options = {}) {
    const {
      headless = true,
      viewport = { width: 1280, height: 720 }
    } = options;

    try {
      this.log('Initializing automated browser...');

      // Launch browser
      this.browser = await chromium.launch({
        headless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ]
      });

      // Create context with viewport
      this.context = await this.browser.newContext({
        viewport,
        deviceScaleFactor: 2, // High quality screenshots
        hasTouch: false
      });

      // Create page
      this.page = await this.context.newPage();

      // Navigate to base URL
      await this.page.goto(this.baseUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      this.log(`Browser initialized at ${this.baseUrl}`, 'success');
      return this.page;

    } catch (error) {
      this.log(`Browser initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Take automated screenshot without any user interaction
   */
  async captureScreenshot(name = 'auto-capture', options = {}) {
    const {
      fullPage = false,
      clip = null,
      element = null
    } = options;

    try {
      if (!this.page) {
        await this.initBrowser();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, 'current', filename);

      // Wait for any animations to complete
      await this.page.waitForTimeout(500);

      let screenshotOptions = {
        path: filepath,
        fullPage
      };

      // Add clip if specified (for specific regions)
      if (clip) {
        screenshotOptions.clip = clip;
      }

      // Capture element if specified
      if (element) {
        const elementHandle = await this.page.$(element);
        if (elementHandle) {
          await elementHandle.screenshot({ path: filepath });
          this.log(`Element screenshot captured: ${element}`, 'success');
        } else {
          this.log(`Element not found: ${element}`, 'warning');
          await this.page.screenshot(screenshotOptions);
        }
      } else {
        await this.page.screenshot(screenshotOptions);
      }

      this.log(`Screenshot captured: ${filepath}`, 'success');

      // Store in history
      const historyPath = path.join(this.screenshotDir, 'history', filename);
      await fs.copyFile(filepath, historyPath);

      return filepath;

    } catch (error) {
      this.log(`Screenshot capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Capture specific UI elements automatically
   */
  async captureElement(selector, name = 'element') {
    try {
      if (!this.page) {
        await this.initBrowser();
      }

      // Wait for element to be visible
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 10000
      });

      return await this.captureScreenshot(name, {
        element: selector
      });

    } catch (error) {
      this.log(`Element capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Capture Luna FAB specifically
   */
  async captureLunaFAB() {
    try {
      this.log('Attempting to capture Luna FAB...');

      // Try multiple selectors for Luna FAB
      const selectors = [
        'button[aria-label*="Luna"]',
        '.fixed.z-50.rounded-full', // Based on our z-index fix
        'button.shadow-lg',
        '[data-testid="luna-fab"]'
      ];

      for (const selector of selectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const box = await element.boundingBox();
            if (box) {
              // Capture with some padding around the element
              const padding = 20;
              const screenshot = await this.captureScreenshot('luna-fab', {
                clip: {
                  x: Math.max(0, box.x - padding),
                  y: Math.max(0, box.y - padding),
                  width: box.width + padding * 2,
                  height: box.height + padding * 2
                }
              });

              this.log(`Luna FAB captured using selector: ${selector}`, 'success');
              return screenshot;
            }
          }
        } catch (err) {
          // Try next selector
          continue;
        }
      }

      // Fallback: capture bottom-right corner where Luna FAB should be
      const viewport = this.page.viewportSize();
      const fallbackScreenshot = await this.captureScreenshot('luna-fab-area', {
        clip: {
          x: viewport.width - 150,
          y: viewport.height - 150,
          width: 150,
          height: 150
        }
      });

      this.log('Luna FAB captured using bottom-right corner fallback', 'warning');
      return fallbackScreenshot;

    } catch (error) {
      this.log(`Luna FAB capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Monitor file changes and automatically capture screenshots
   */
  async startMonitoring(watchPaths = ['src/**/*.tsx', 'src/**/*.css'], options = {}) {
    const {
      debounceDelay = 2000,
      captureDelay = 1000
    } = options;

    this.log('Starting visual feedback monitoring...', 'success');

    // Initialize browser
    if (!this.page) {
      await this.initBrowser();
    }

    // Create file watcher
    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    let debounceTimer = null;

    watcher.on('change', async (filepath) => {
      this.log(`File changed: ${filepath}`);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce to avoid multiple captures
      debounceTimer = setTimeout(async () => {
        try {
          // Wait for HMR to complete
          await new Promise(resolve => setTimeout(resolve, captureDelay));

          // Reload page to get latest changes
          await this.page.reload({
            waitUntil: 'networkidle',
            timeout: 10000
          });

          // Capture screenshots
          const fullPage = await this.captureScreenshot('after-change-full', { fullPage: false });
          const lunaFab = await this.captureLunaFAB();

          // Record change
          this.changeHistory.push({
            file: filepath,
            timestamp: new Date().toISOString(),
            screenshots: {
              fullPage,
              lunaFab
            }
          });

          this.log(`Visual feedback captured for ${path.basename(filepath)}`, 'success');

          // Generate comparison report
          await this.generateComparisonReport();

        } catch (error) {
          this.log(`Failed to capture after change: ${error.message}`, 'error');
        }
      }, debounceDelay);
    });

    this.isMonitoring = true;
    this.log('Monitoring active. Make changes to see visual feedback.', 'success');

    // Keep process running
    process.on('SIGINT', async () => {
      this.log('Stopping monitoring...');
      await watcher.close();
      await this.cleanup();
      process.exit(0);
    });
  }

  /**
   * Test specific code changes and capture results
   */
  async testCodeChange(changeDescription, changeFunction) {
    try {
      this.log(`Testing: ${changeDescription}`);

      // Capture before state
      const beforeScreenshot = await this.captureScreenshot('before-change');

      // Apply the change
      if (typeof changeFunction === 'function') {
        await changeFunction();
      }

      // Wait for changes to reflect
      await this.page.reload({
        waitUntil: 'networkidle'
      });

      // Capture after state
      const afterScreenshot = await this.captureScreenshot('after-change');

      // Generate comparison
      const comparison = {
        description: changeDescription,
        before: beforeScreenshot,
        after: afterScreenshot,
        timestamp: new Date().toISOString()
      };

      this.log(`Change tested: ${changeDescription}`, 'success');
      return comparison;

    } catch (error) {
      this.log(`Test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Navigate to different pages and capture
   */
  async captureMultiplePages(pages = []) {
    const screenshots = [];

    for (const pageConfig of pages) {
      try {
        const { path, name, waitFor } = pageConfig;

        await this.page.goto(`${this.baseUrl}${path}`, {
          waitUntil: 'networkidle'
        });

        if (waitFor) {
          await this.page.waitForSelector(waitFor, { state: 'visible' });
        }

        const screenshot = await this.captureScreenshot(name || path.replace(/\//g, '-'));
        screenshots.push({
          path,
          screenshot,
          timestamp: new Date().toISOString()
        });

        this.log(`Captured page: ${path}`, 'success');

      } catch (error) {
        this.log(`Failed to capture ${pageConfig.path}: ${error.message}`, 'error');
      }
    }

    return screenshots;
  }

  /**
   * Generate visual comparison report
   */
  async generateComparisonReport() {
    try {
      const reportPath = path.join(this.screenshotDir, 'visual-feedback-report.json');

      const report = {
        generated: new Date().toISOString(),
        baseUrl: this.baseUrl,
        totalChanges: this.changeHistory.length,
        changes: this.changeHistory,
        latestScreenshots: await this.getLatestScreenshots()
      };

      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      this.log(`Visual feedback report generated: ${reportPath}`, 'success');

      return report;

    } catch (error) {
      this.log(`Report generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get latest screenshots from current directory
   */
  async getLatestScreenshots() {
    try {
      const currentDir = path.join(this.screenshotDir, 'current');
      const files = await fs.readdir(currentDir);

      const screenshots = await Promise.all(
        files
          .filter(f => f.endsWith('.png'))
          .map(async (file) => {
            const filepath = path.join(currentDir, file);
            const stats = await fs.stat(filepath);
            return {
              name: file,
              path: filepath,
              size: stats.size,
              created: stats.mtime.toISOString()
            };
          })
      );

      return screenshots.sort((a, b) =>
        new Date(b.created) - new Date(a.created)
      );

    } catch (error) {
      this.log(`Failed to get latest screenshots: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Clean up browser resources
   */
  async cleanup() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();

      this.page = null;
      this.context = null;
      this.browser = null;

      this.log('Browser resources cleaned up', 'success');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
    }
  }

  /**
   * Quick visual test for Luna FAB
   */
  async quickLunaFABTest() {
    try {
      this.log('Running quick Luna FAB visual test...');

      await this.ensureDirectories();
      await this.initBrowser();

      // Navigate to app
      await this.page.goto(`${this.baseUrl}/app`, {
        waitUntil: 'networkidle'
      });

      // Capture full page
      const fullPage = await this.captureScreenshot('luna-fab-test-full');

      // Capture Luna FAB specifically
      const lunaFab = await this.captureLunaFAB();

      // Try to click Luna FAB
      try {
        await this.page.click('.fixed.z-50.rounded-full', {
          timeout: 5000
        });

        // Wait for carousel/modal to appear
        await this.page.waitForTimeout(1000);

        // Capture after click
        const afterClick = await this.captureScreenshot('luna-fab-after-click');

        this.log('Luna FAB interaction tested successfully', 'success');

        return {
          success: true,
          screenshots: {
            fullPage,
            lunaFab,
            afterClick
          }
        };

      } catch (error) {
        this.log(`Luna FAB interaction failed: ${error.message}`, 'warning');
        return {
          success: false,
          screenshots: { fullPage, lunaFab },
          error: error.message
        };
      }

    } catch (error) {
      this.log(`Quick test failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const feedback = new AutomatedVisualFeedback();

  try {
    await feedback.ensureDirectories();

    switch (command) {
      case 'capture':
        await feedback.initBrowser();
        const screenshot = await feedback.captureScreenshot();
        console.log(`Screenshot saved: ${screenshot}`);
        await feedback.cleanup();
        break;

      case 'luna-fab':
        const result = await feedback.quickLunaFABTest();
        console.log('Test result:', result);
        break;

      case 'monitor':
        await feedback.startMonitoring();
        // Process will keep running
        break;

      case 'pages':
        await feedback.initBrowser();
        const pages = [
          { path: '/', name: 'landing' },
          { path: '/app', name: 'app-dashboard' },
          { path: '/app/plan', name: 'plan-page' }
        ];
        const screenshots = await feedback.captureMultiplePages(pages);
        console.log(`Captured ${screenshots.length} pages`);
        await feedback.cleanup();
        break;

      case 'element':
        const selector = process.argv[3];
        if (!selector) {
          throw new Error('Please provide an element selector');
        }
        await feedback.initBrowser();
        const elementScreenshot = await feedback.captureElement(selector);
        console.log(`Element captured: ${elementScreenshot}`);
        await feedback.cleanup();
        break;

      default:
        console.log(`
Automated Visual Feedback System

Usage: node scripts/automated-visual-feedback.js [command] [options]

Commands:
  capture               - Take automated screenshot of current page
  luna-fab             - Quick visual test of Luna FAB
  monitor              - Start monitoring file changes with auto-capture
  pages                - Capture multiple pages automatically
  element <selector>   - Capture specific element by selector

Options:
  --verbose           - Enable verbose logging
  --headless=false    - Run browser in visible mode

Examples:
  node scripts/automated-visual-feedback.js capture
  node scripts/automated-visual-feedback.js luna-fab
  node scripts/automated-visual-feedback.js monitor
  node scripts/automated-visual-feedback.js element ".luna-fab"

Features:
  ✅ Fully automated - no manual clicking required
  ✅ Headless browser operation
  ✅ File change monitoring with auto-capture
  ✅ Element-specific screenshots
  ✅ Visual change history tracking
  ✅ Multi-page navigation and capture
  ✅ Automatic visual feedback for code changes
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
// AutomatedVisualFeedback is already exported as a class above

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}