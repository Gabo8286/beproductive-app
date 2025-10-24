#!/usr/bin/env node

/**
 * Interactive Browser Automation Tool
 * Provides real-time browser automation capabilities for testing and debugging
 * Usage: node scripts/interactive-browser.js [command] [options]
 */

import { chromium, firefox, webkit } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InteractiveBrowser {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.screenshotDir = path.join(process.cwd(), 'screenshots');
    this.verbose = process.argv.includes('--verbose');
    this.browserType = this.getBrowserType();
    this.device = this.getDevice();
    this.baseUrl = this.getBaseUrl();
  }

  getBrowserType() {
    if (process.argv.includes('--firefox')) return 'firefox';
    if (process.argv.includes('--safari') || process.argv.includes('--webkit')) return 'webkit';
    return 'chromium'; // default
  }

  getDevice() {
    const deviceArg = process.argv.find(arg => arg.startsWith('--device='));
    if (deviceArg) {
      return deviceArg.split('=')[1];
    }
    return null;
  }

  getBaseUrl() {
    const urlArg = process.argv.find(arg => arg.startsWith('--url='));
    if (urlArg) {
      return urlArg.split('=')[1];
    }
    return 'http://localhost:8080'; // default for dev server
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureScreenshotDir() {
    try {
      await fs.access(this.screenshotDir);
    } catch {
      await fs.mkdir(this.screenshotDir, { recursive: true });
      this.log(`Created screenshots directory: ${this.screenshotDir}`);
    }
  }

  async launch() {
    try {
      this.log(`Launching ${this.browserType} browser...`);

      const browserInstance = this.browserType === 'firefox' ? firefox :
                             this.browserType === 'webkit' ? webkit : chromium;

      this.browser = await browserInstance.launch({
        headless: process.argv.includes('--headless'),
        devtools: process.argv.includes('--devtools')
      });

      // Create context with device emulation if specified
      if (this.device) {
        const { devices } = await import('playwright');
        this.context = await this.browser.newContext({
          ...devices[this.device]
        });
        this.log(`Emulating device: ${this.device}`);
      } else {
        this.context = await this.browser.newContext();
      }

      this.page = await this.context.newPage();

      // Enable console logging if verbose
      if (this.verbose) {
        this.page.on('console', msg => this.log(`Console: ${msg.text()}`, 'debug'));
        this.page.on('pageerror', err => this.log(`Page Error: ${err.message}`, 'error'));
      }

      this.log('Browser launched successfully');
      return this.page;
    } catch (error) {
      this.log(`Failed to launch browser: ${error.message}`, 'error');
      throw error;
    }
  }

  async navigate(url = null) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const targetUrl = url || this.baseUrl;
    this.log(`Navigating to: ${targetUrl}`);

    try {
      await this.page.goto(targetUrl, { waitUntil: 'networkidle' });
      this.log('Navigation completed', 'success');
      return this.page;
    } catch (error) {
      this.log(`Navigation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async screenshot(filename = null, options = {}) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    await this.ensureScreenshotDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename || `screenshot-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, name);

    const defaultOptions = {
      fullPage: true,
      ...options
    };

    try {
      await this.page.screenshot({ path: filepath, ...defaultOptions });
      this.log(`Screenshot saved: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Screenshot failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async screenshotElement(selector, filename = null, options = {}) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    await this.ensureScreenshotDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename || `element-${selector.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, name);

    try {
      const element = await this.page.locator(selector);
      await element.screenshot({ path: filepath, ...options });
      this.log(`Element screenshot saved: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Element screenshot failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async click(selector) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      this.log(`Clicking element: ${selector}`);
      await this.page.click(selector);
      this.log('Click completed', 'success');
      return this.page;
    } catch (error) {
      this.log(`Click failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async type(selector, text) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      this.log(`Typing into element: ${selector}`);
      await this.page.fill(selector, text);
      this.log('Typing completed', 'success');
      return this.page;
    } catch (error) {
      this.log(`Typing failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async wait(selector, options = {}) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      this.log(`Waiting for element: ${selector}`);
      await this.page.waitForSelector(selector, { timeout: 30000, ...options });
      this.log('Element found', 'success');
      return this.page;
    } catch (error) {
      this.log(`Wait failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async evaluate(script) {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      this.log('Executing JavaScript...');
      const result = await this.page.evaluate(script);
      this.log('JavaScript executed successfully', 'success');
      return result;
    } catch (error) {
      this.log(`JavaScript execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getCurrentUrl() {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }
    return this.page.url();
  }

  async getTitle() {
    if (!this.page) {
      throw new Error('Browser not launched. Call launch() first.');
    }
    return this.page.title();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.log('Browser closed');
    }
  }

  // Preset automation workflows
  async captureFullPageFlow(url = null) {
    await this.launch();
    await this.navigate(url);
    await this.wait('body');

    // Wait for any loading states to complete
    await this.page.waitForLoadState('networkidle');

    // Take full page screenshot
    const screenshotPath = await this.screenshot('full-page-capture.png');

    await this.close();
    return screenshotPath;
  }

  async captureMobileFlow(url = null, device = 'iPhone 12') {
    this.device = device;
    await this.launch();
    await this.navigate(url);
    await this.wait('body');

    // Wait for mobile layout to stabilize
    await this.page.waitForTimeout(1000);

    const screenshotPath = await this.screenshot(`mobile-${device.replace(/\s+/g, '-').toLowerCase()}.png`);

    await this.close();
    return screenshotPath;
  }

  async captureComponentStates(url = null, selectors = []) {
    await this.launch();
    await this.navigate(url);

    const screenshots = [];

    for (const selector of selectors) {
      try {
        await this.wait(selector);
        const filepath = await this.screenshotElement(selector);
        screenshots.push(filepath);
      } catch (error) {
        this.log(`Failed to capture component ${selector}: ${error.message}`, 'warning');
      }
    }

    await this.close();
    return screenshots;
  }

  async captureUserFlow(steps) {
    await this.launch();
    const screenshots = [];
    let stepIndex = 0;

    for (const step of steps) {
      stepIndex++;
      this.log(`Executing step ${stepIndex}: ${step.description || step.action}`);

      try {
        switch (step.action) {
          case 'navigate':
            await this.navigate(step.url);
            break;
          case 'click':
            await this.click(step.selector);
            break;
          case 'type':
            await this.type(step.selector, step.text);
            break;
          case 'wait':
            await this.wait(step.selector);
            break;
          case 'screenshot':
            const filepath = await this.screenshot(`step-${stepIndex}-${step.name || 'capture'}.png`);
            screenshots.push(filepath);
            break;
        }

        // Auto-screenshot after each significant action
        if (['navigate', 'click'].includes(step.action)) {
          await this.page.waitForTimeout(500); // Brief pause for UI to settle
          const autoPath = await this.screenshot(`step-${stepIndex}-auto.png`);
          screenshots.push(autoPath);
        }

      } catch (error) {
        this.log(`Step ${stepIndex} failed: ${error.message}`, 'error');
        // Take screenshot of error state
        const errorPath = await this.screenshot(`step-${stepIndex}-error.png`);
        screenshots.push(errorPath);
      }
    }

    await this.close();
    return screenshots;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const browser = new InteractiveBrowser();

  try {
    switch (command) {
      case 'capture':
        const url = process.argv[3] || browser.baseUrl;
        const screenshotPath = await browser.captureFullPageFlow(url);
        console.log(`Screenshot saved: ${screenshotPath}`);
        break;

      case 'mobile':
        const mobileUrl = process.argv[3] || browser.baseUrl;
        const device = process.argv[4] || 'iPhone 12';
        const mobilePath = await browser.captureMobileFlow(mobileUrl, device);
        console.log(`Mobile screenshot saved: ${mobilePath}`);
        break;

      case 'components':
        const compUrl = process.argv[3] || browser.baseUrl;
        const selectors = process.argv.slice(4);
        if (selectors.length === 0) {
          console.log('Please provide CSS selectors for components to capture');
          process.exit(1);
        }
        const componentPaths = await browser.captureComponentStates(compUrl, selectors);
        console.log(`Component screenshots saved: ${componentPaths.join(', ')}`);
        break;

      case 'interactive':
        await browser.launch();
        console.log('Interactive browser launched. Use browser.* methods to interact.');
        console.log('Available methods: navigate(), screenshot(), click(), type(), wait(), evaluate()');
        // Keep browser open for interactive use
        break;

      case 'test-flow':
        // Example user flow for testing
        const testSteps = [
          { action: 'navigate', url: browser.baseUrl },
          { action: 'wait', selector: 'body' },
          { action: 'screenshot', name: 'landing-page' },
          { action: 'click', selector: '[data-testid="cta-button"]', description: 'Click main CTA' },
          { action: 'wait', selector: '[data-testid="next-screen"]' },
          { action: 'screenshot', name: 'after-cta' }
        ];
        const flowPaths = await browser.captureUserFlow(testSteps);
        console.log(`User flow screenshots: ${flowPaths.join(', ')}`);
        break;

      default:
        console.log(`
Interactive Browser Automation Tool

Usage: node scripts/interactive-browser.js [command] [options]

Commands:
  capture [url]                    - Take full page screenshot
  mobile [url] [device]            - Take mobile screenshot
  components [url] [selectors...]  - Capture specific components
  interactive                      - Launch interactive browser session
  test-flow                        - Run predefined test flow

Options:
  --firefox                        - Use Firefox browser
  --safari, --webkit               - Use Safari/WebKit browser
  --device=<device_name>           - Emulate specific device
  --url=<base_url>                 - Set base URL (default: http://localhost:8080)
  --headless                       - Run in headless mode
  --devtools                       - Open browser devtools
  --verbose                        - Enable verbose logging

Examples:
  node scripts/interactive-browser.js capture
  node scripts/interactive-browser.js mobile https://be-productive.app "iPhone 12"
  node scripts/interactive-browser.js components http://localhost:8080 ".btn" ".card" "#header"
  node scripts/interactive-browser.js capture --firefox --device="iPad Pro"
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { InteractiveBrowser };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}