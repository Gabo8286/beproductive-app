#!/usr/bin/env node

/**
 * Apple Ecosystem Testing Suite
 * M4 MacBook Air + iPad Pro dual-device browser testing automation
 * Usage: node scripts/apple-ecosystem-testing.js [command] [options]
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium, firefox, webkit } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AppleEcosystemTesting {
  constructor() {
    this.verbose = process.argv.includes('--verbose');
    this.screenshotDir = path.join(process.cwd(), 'ecosystem-screenshots');
    this.displays = [];
    this.browsers = new Map();
    this.sidecarActive = false;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async runAppleScript(script) {
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: this.verbose ? 'inherit' : 'pipe' });

      let stdout = '';
      let stderr = '';

      if (proc.stdout) {
        proc.stdout.on('data', (data) => stdout += data.toString());
      }

      if (proc.stderr) {
        proc.stderr.on('data', (data) => stderr += data.toString());
      }

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  async ensureScreenshotDir() {
    try {
      await fs.access(this.screenshotDir);
    } catch {
      await fs.mkdir(this.screenshotDir, { recursive: true });
      this.log(`Created ecosystem screenshots directory: ${this.screenshotDir}`);
    }
  }

  async detectDisplays() {
    try {
      this.log('Detecting display configuration...');

      // Get display information using system_profiler
      const { stdout } = await this.runCommand('system_profiler', ['SPDisplaysDataType', '-json']);
      const displayData = JSON.parse(stdout);

      const displays = [];

      if (displayData.SPDisplaysDataType && displayData.SPDisplaysDataType[0]) {
        const graphics = displayData.SPDisplaysDataType[0];

        if (graphics.spdisplays_ndrvs) {
          graphics.spdisplays_ndrvs.forEach((display, index) => {
            displays.push({
              id: index,
              name: display._name || `Display ${index + 1}`,
              resolution: display._spdisplays_resolution || 'Unknown',
              pixelDepth: display._spdisplays_depth || 'Unknown',
              main: index === 0
            });
          });
        }
      }

      this.displays = displays;
      this.log(`Detected ${displays.length} display(s):`);
      displays.forEach(display => {
        this.log(`  ${display.name}: ${display.resolution} ${display.main ? '(Main)' : ''}`, 'debug');
      });

      return displays;
    } catch (error) {
      this.log(`Failed to detect displays: ${error.message}`, 'error');
      return [];
    }
  }

  async enableSidecar() {
    try {
      this.log('Enabling Sidecar...');

      // AppleScript to enable Sidecar
      const script = `
        tell application "System Preferences"
          activate
          reveal pane "Sidecar"
        end tell

        delay 2

        tell application "System Events"
          tell process "System Preferences"
            try
              click button "Connect" of window 1
            on error
              -- Sidecar might already be connected
            end try
          end tell
        end tell

        tell application "System Preferences"
          quit
        end tell
      `;

      await this.runAppleScript(script);

      // Wait for Sidecar to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify Sidecar is active by checking display count
      const displaysAfter = await this.detectDisplays();
      this.sidecarActive = displaysAfter.length > 1;

      if (this.sidecarActive) {
        this.log('Sidecar enabled successfully', 'success');
      } else {
        this.log('Sidecar may not be properly connected', 'warning');
      }

      return this.sidecarActive;
    } catch (error) {
      this.log(`Failed to enable Sidecar: ${error.message}`, 'error');
      return false;
    }
  }

  async disableSidecar() {
    try {
      this.log('Disabling Sidecar...');

      const script = `
        tell application "System Events"
          tell process "SystemUIServer"
            try
              click menu bar item "Sidecar" of menu bar 1
              delay 1
              click menu item "Disconnect" of menu 1 of menu bar item "Sidecar" of menu bar 1
            on error
              -- Sidecar might not be connected
            end try
          end tell
        end tell
      `;

      await this.runAppleScript(script);

      await new Promise(resolve => setTimeout(resolve, 2000));

      this.sidecarActive = false;
      this.log('Sidecar disabled', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to disable Sidecar: ${error.message}`, 'error');
      return false;
    }
  }

  async createBrowserOnDisplay(browserType = 'chromium', displayIndex = 0, options = {}) {
    try {
      this.log(`Creating ${browserType} browser on display ${displayIndex}...`);

      const browserInstance = browserType === 'firefox' ? firefox :
                             browserType === 'webkit' ? webkit : chromium;

      const browser = await browserInstance.launch({
        headless: false,
        ...options
      });

      const context = await browser.newContext({
        viewport: displayIndex === 1 ? { width: 1194, height: 834 } : null, // iPad Pro resolution
        ...options.contextOptions
      });

      const page = await context.newPage();

      // Move browser window to specific display
      if (displayIndex > 0) {
        await this.moveWindowToDisplay(page, displayIndex);
      }

      const browserId = `${browserType}_display_${displayIndex}_${Date.now()}`;
      this.browsers.set(browserId, {
        browser,
        context,
        page,
        browserType,
        displayIndex,
        created: new Date()
      });

      this.log(`Browser ${browserId} created on display ${displayIndex}`, 'success');
      return { browserId, browser, context, page };
    } catch (error) {
      this.log(`Failed to create browser: ${error.message}`, 'error');
      throw error;
    }
  }

  async moveWindowToDisplay(page, displayIndex) {
    try {
      // Get the browser process name (approximate)
      let processName = 'Google Chrome'; // Default for Chromium

      // Use AppleScript to move window to specific display
      const script = `
        tell application "${processName}"
          activate
        end tell

        delay 1

        tell application "System Events"
          tell process "${processName}"
            set frontWindow to first window
            ${displayIndex === 1 ?
              'set position of frontWindow to {1440, 0}' : // Move to second display (approximate)
              'set position of frontWindow to {100, 100}' // Keep on main display
            }
          end tell
        end tell
      `;

      await this.runAppleScript(script);
      this.log(`Moved window to display ${displayIndex}`);
    } catch (error) {
      this.log(`Failed to move window: ${error.message}`, 'warning');
    }
  }

  async captureDualScreenshot(filename = null) {
    await this.ensureScreenshotDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename || `dual-screen-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, name);

    try {
      this.log('Capturing dual-screen screenshot...');

      // Capture all displays
      await this.runCommand('screencapture', ['-x', '-D', '1', filepath]);

      this.log(`Dual-screen screenshot saved: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Dual-screen capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async captureDisplayScreenshot(displayIndex, filename = null) {
    await this.ensureScreenshotDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename || `display-${displayIndex}-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, name);

    try {
      this.log(`Capturing screenshot of display ${displayIndex}...`);

      // Capture specific display
      await this.runCommand('screencapture', ['-x', '-D', (displayIndex + 1).toString(), filepath]);

      this.log(`Display ${displayIndex} screenshot saved: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`Display capture failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async setupResponsiveTestingEnvironment(url = 'http://localhost:8080') {
    try {
      this.log('Setting up responsive testing environment...');

      // Enable Sidecar first
      await this.enableSidecar();
      await this.detectDisplays();

      if (!this.sidecarActive) {
        throw new Error('Sidecar is required for dual-device testing');
      }

      // Create desktop browser on main display
      const desktop = await this.createBrowserOnDisplay('chromium', 0, {
        contextOptions: {
          viewport: { width: 1440, height: 900 },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      // Create mobile browser on iPad display (Sidecar)
      const mobile = await this.createBrowserOnDisplay('chromium', 1, {
        contextOptions: {
          viewport: { width: 1194, height: 834 },
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          isMobile: true,
          hasTouch: true
        }
      });

      // Navigate both to the same URL
      await desktop.page.goto(url, { waitUntil: 'networkidle' });
      await mobile.page.goto(url, { waitUntil: 'networkidle' });

      this.log('Responsive testing environment ready', 'success');
      return { desktop, mobile };
    } catch (error) {
      this.log(`Failed to setup responsive environment: ${error.message}`, 'error');
      throw error;
    }
  }

  async runCrossBrowserSuite(url = 'http://localhost:8080') {
    try {
      this.log('Running cross-browser suite...');

      const browsers = ['chromium', 'firefox', 'webkit'];
      const results = [];

      for (let i = 0; i < browsers.length; i++) {
        const browserType = browsers[i];
        const displayIndex = i % 2; // Alternate between displays

        try {
          const { browserId, page } = await this.createBrowserOnDisplay(
            browserType,
            displayIndex,
            { headless: false }
          );

          await page.goto(url, { waitUntil: 'networkidle' });

          // Wait for page to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Take screenshot
          const screenshotPath = path.join(
            this.screenshotDir,
            `cross-browser-${browserType}-display-${displayIndex}-${Date.now()}.png`
          );

          await page.screenshot({ path: screenshotPath, fullPage: true });

          results.push({
            browser: browserType,
            display: displayIndex,
            screenshot: screenshotPath,
            url: page.url(),
            title: await page.title()
          });

          this.log(`${browserType} test completed on display ${displayIndex}`, 'success');

        } catch (error) {
          this.log(`${browserType} test failed: ${error.message}`, 'error');
          results.push({
            browser: browserType,
            error: error.message
          });
        }
      }

      // Generate comparison report
      const reportPath = path.join(this.screenshotDir, `cross-browser-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        url,
        results,
        environment: {
          sidecarActive: this.sidecarActive,
          displays: this.displays.length
        }
      }, null, 2));

      this.log(`Cross-browser suite completed. Report: ${reportPath}`, 'success');
      return results;
    } catch (error) {
      this.log(`Cross-browser suite failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async createMobileDesktopComparison(url = 'http://localhost:8080') {
    try {
      this.log('Creating mobile-desktop comparison...');

      const { desktop, mobile } = await this.setupResponsiveTestingEnvironment(url);

      // Wait for both pages to load completely
      await Promise.all([
        desktop.page.waitForLoadState('networkidle'),
        mobile.page.waitForLoadState('networkidle')
      ]);

      // Take synchronized screenshots
      const timestamp = Date.now();
      const desktopScreenshot = path.join(this.screenshotDir, `desktop-${timestamp}.png`);
      const mobileScreenshot = path.join(this.screenshotDir, `mobile-${timestamp}.png`);

      await Promise.all([
        desktop.page.screenshot({ path: desktopScreenshot, fullPage: true }),
        mobile.page.screenshot({ path: mobileScreenshot, fullPage: true })
      ]);

      // Create side-by-side comparison using ImageMagick
      const comparisonPath = path.join(this.screenshotDir, `comparison-${timestamp}.png`);

      try {
        await this.runCommand('montage', [
          desktopScreenshot,
          mobileScreenshot,
          '-tile', '2x1',
          '-geometry', '+10+10',
          '-border', '2',
          '-bordercolor', '#cccccc',
          comparisonPath
        ]);

        this.log(`Comparison image created: ${comparisonPath}`, 'success');
      } catch (error) {
        this.log('ImageMagick not available for comparison image', 'warning');
      }

      // Also capture the full dual-screen view
      const dualScreenPath = await this.captureDualScreenshot(`dual-view-${timestamp}.png`);

      const result = {
        timestamp: new Date().toISOString(),
        url,
        screenshots: {
          desktop: desktopScreenshot,
          mobile: mobileScreenshot,
          comparison: comparisonPath,
          dualScreen: dualScreenPath
        },
        metadata: {
          desktopViewport: await desktop.page.viewportSize(),
          mobileViewport: await mobile.page.viewportSize(),
          desktopUserAgent: await desktop.page.evaluate(() => navigator.userAgent),
          mobileUserAgent: await mobile.page.evaluate(() => navigator.userAgent)
        }
      };

      const reportPath = path.join(this.screenshotDir, `responsive-report-${timestamp}.json`);
      await fs.writeFile(reportPath, JSON.stringify(result, null, 2));

      this.log('Mobile-desktop comparison completed', 'success');
      return result;
    } catch (error) {
      this.log(`Comparison failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async cleanup() {
    this.log('Cleaning up browser sessions...');

    for (const [browserId, session] of this.browsers) {
      try {
        await session.browser.close();
        this.log(`Closed browser: ${browserId}`, 'debug');
      } catch (error) {
        this.log(`Failed to close browser ${browserId}: ${error.message}`, 'warning');
      }
    }

    this.browsers.clear();

    if (this.sidecarActive) {
      await this.disableSidecar();
    }

    this.log('Cleanup completed');
  }

  async getSystemInfo() {
    try {
      const { stdout: swVers } = await this.runCommand('sw_vers', []);
      const { stdout: hwInfo } = await this.runCommand('system_profiler', ['SPHardwareDataType']);

      return {
        macOS: swVers.trim(),
        hardware: hwInfo,
        displays: this.displays,
        sidecarActive: this.sidecarActive,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.log(`Failed to get system info: ${error.message}`, 'warning');
      return null;
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const ecosystem = new AppleEcosystemTesting();

  // Handle cleanup on exit
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await ecosystem.cleanup();
    process.exit(0);
  });

  try {
    switch (command) {
      case 'setup':
        await ecosystem.detectDisplays();
        await ecosystem.enableSidecar();
        console.log('Apple ecosystem testing environment ready!');
        break;

      case 'responsive':
        const url = process.argv[3] || 'http://localhost:8080';
        const result = await ecosystem.createMobileDesktopComparison(url);
        console.log('\n📱💻 Responsive Comparison Results:');
        console.log(`Desktop screenshot: ${result.screenshots.desktop}`);
        console.log(`Mobile screenshot: ${result.screenshots.mobile}`);
        console.log(`Comparison view: ${result.screenshots.comparison}`);
        console.log(`Dual-screen capture: ${result.screenshots.dualScreen}`);
        await ecosystem.cleanup();
        break;

      case 'cross-browser':
        const testUrl = process.argv[3] || 'http://localhost:8080';
        const browsers = await ecosystem.runCrossBrowserSuite(testUrl);
        console.log('\n🌐 Cross-Browser Results:');
        browsers.forEach(b => {
          if (b.error) {
            console.log(`❌ ${b.browser}: ${b.error}`);
          } else {
            console.log(`✅ ${b.browser} (Display ${b.display}): ${b.screenshot}`);
          }
        });
        await ecosystem.cleanup();
        break;

      case 'displays':
        const displays = await ecosystem.detectDisplays();
        console.log('\n🖥️ Display Configuration:');
        displays.forEach((display, index) => {
          console.log(`  ${index}: ${display.name} - ${display.resolution} ${display.main ? '(Main)' : ''}`);
        });
        break;

      case 'sidecar':
        const action = process.argv[3];
        if (action === 'enable') {
          await ecosystem.enableSidecar();
        } else if (action === 'disable') {
          await ecosystem.disableSidecar();
        } else {
          console.log('Usage: sidecar [enable|disable]');
        }
        break;

      case 'info':
        const info = await ecosystem.getSystemInfo();
        console.log('\n🍎 System Information:');
        console.log(JSON.stringify(info, null, 2));
        break;

      default:
        console.log(`
Apple Ecosystem Testing Suite - M4 MacBook Air + iPad Pro

Usage: node scripts/apple-ecosystem-testing.js [command] [options]

Commands:
  setup                           - Initialize ecosystem testing environment
  responsive [url]                - Create mobile-desktop comparison testing
  cross-browser [url]             - Run cross-browser suite across displays
  displays                        - Show display configuration
  sidecar [enable|disable]        - Control Sidecar connection
  info                           - Show system information

Options:
  --verbose                       - Enable verbose logging

Examples:
  node scripts/apple-ecosystem-testing.js setup
  node scripts/apple-ecosystem-testing.js responsive https://be-productive.app
  node scripts/apple-ecosystem-testing.js cross-browser http://localhost:8080
  node scripts/apple-ecosystem-testing.js sidecar enable

Features:
  🍎 Native Apple ecosystem integration
  📱 iPad Pro as second display via Sidecar
  🖥️ Multi-display browser automation
  📸 Dual-screen screenshot capture
  📱💻 Real mobile vs desktop comparison
  🌐 Cross-browser testing across displays
  ⚡ M4 performance optimization
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    await ecosystem.cleanup();
    process.exit(1);
  }
}

// Export for use as module
export { AppleEcosystemTesting };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}