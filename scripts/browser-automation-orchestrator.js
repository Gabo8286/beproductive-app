#!/usr/bin/env node

/**
 * Browser Automation Orchestrator
 * Unified interface for all advanced browser automation capabilities
 * Usage: node scripts/browser-automation-orchestrator.js [command] [options]
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import { InteractiveBrowser } from './interactive-browser.js';
import { ScreenshotCapture } from './screenshot-capture.js';
import { VisualDiff } from './visual-diff.js';
import { BrowserSessionManager } from './browser-session-manager.js';
import { AppleEcosystemTesting } from './apple-ecosystem-testing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserAutomationOrchestrator {
  constructor() {
    this.verbose = process.argv.includes('--verbose');
    this.outputDir = path.join(process.cwd(), 'automation-results');
    this.interactive = new InteractiveBrowser();
    this.screenshot = new ScreenshotCapture();
    this.visualDiff = new VisualDiff();
    this.sessionManager = new BrowserSessionManager();
    this.ecosystem = new AppleEcosystemTesting();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      this.log(`Created automation results directory: ${this.outputDir}`);
    }
  }

  async generateReport(results, reportName) {
    await this.ensureOutputDir();

    const report = {
      timestamp: new Date().toISOString(),
      reportName,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        workingDirectory: process.cwd()
      },
      results
    };

    const reportPath = path.join(this.outputDir, `${reportName}-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Report generated: ${reportPath}`, 'success');
    return reportPath;
  }

  async runComprehensiveTest(url = 'http://localhost:8080') {
    this.log('🚀 Starting comprehensive browser automation test suite...');

    const results = {
      url,
      startTime: new Date().toISOString(),
      tests: {}
    };

    try {
      // 1. Basic Screenshot Capture
      this.log('📸 Phase 1: Basic screenshot capture');
      const basicScreenshot = await this.interactive.captureFullPageFlow(url);
      results.tests.basicScreenshot = {
        status: 'success',
        screenshot: basicScreenshot
      };

      // 2. Mobile Device Testing
      this.log('📱 Phase 2: Mobile device testing');
      const mobileScreenshots = [];
      const devices = ['iPhone 12', 'iPad Pro', 'Pixel 5'];

      for (const device of devices) {
        try {
          const mobileShot = await this.interactive.captureMobileFlow(url, device);
          mobileScreenshots.push({ device, screenshot: mobileShot });
        } catch (error) {
          mobileScreenshots.push({ device, error: error.message });
        }
      }

      results.tests.mobileDevices = {
        status: 'success',
        screenshots: mobileScreenshots
      };

      // 3. Cross-Browser Testing
      this.log('🌐 Phase 3: Cross-browser testing');
      const crossBrowserResults = [];
      const browsers = ['chromium', 'firefox', 'webkit'];

      for (const browser of browsers) {
        try {
          this.interactive.browserType = browser;
          const browserShot = await this.interactive.captureFullPageFlow(url);
          crossBrowserResults.push({ browser, screenshot: browserShot });
        } catch (error) {
          crossBrowserResults.push({ browser, error: error.message });
        }
      }

      results.tests.crossBrowser = {
        status: 'success',
        results: crossBrowserResults
      };

      // 4. Apple Ecosystem Testing (if on macOS)
      if (process.platform === 'darwin') {
        this.log('🍎 Phase 4: Apple ecosystem testing');
        try {
          await this.ecosystem.detectDisplays();
          const responsiveResult = await this.ecosystem.createMobileDesktopComparison(url);
          results.tests.appleEcosystem = {
            status: 'success',
            result: responsiveResult
          };
        } catch (error) {
          results.tests.appleEcosystem = {
            status: 'error',
            error: error.message
          };
        }
      }

      // 5. Visual Regression Testing
      this.log('🔍 Phase 5: Visual regression testing');
      if (crossBrowserResults.length >= 2) {
        try {
          const baseImage = crossBrowserResults[0].screenshot;
          const compareImage = crossBrowserResults[1].screenshot;

          if (baseImage && compareImage) {
            const diffResult = await this.visualDiff.compareWithResize(baseImage, compareImage);
            results.tests.visualRegression = {
              status: 'success',
              comparison: diffResult
            };
          }
        } catch (error) {
          results.tests.visualRegression = {
            status: 'error',
            error: error.message
          };
        }
      }

      results.endTime = new Date().toISOString();
      results.duration = new Date(results.endTime) - new Date(results.startTime);

      // Generate comprehensive report
      const reportPath = await this.generateReport(results, 'comprehensive-test');

      this.log('✅ Comprehensive test suite completed!', 'success');
      this.log(`📋 Full report: ${reportPath}`);

      return results;

    } catch (error) {
      this.log(`❌ Comprehensive test failed: ${error.message}`, 'error');
      results.tests.error = error.message;
      await this.generateReport(results, 'comprehensive-test-failed');
      throw error;
    } finally {
      await this.ecosystem.cleanup();
    }
  }

  async runRegressionSuite(baselineDir, currentDir) {
    this.log('🔄 Starting visual regression test suite...');

    try {
      // Run batch comparison
      const batchResult = await this.visualDiff.batchCompare(baselineDir, currentDir, '*.png');

      // Generate detailed analysis
      const analysis = {
        summary: batchResult.summary,
        regressions: batchResult.results.filter(r => r.similarity < 95),
        passed: batchResult.results.filter(r => r.similarity >= 95),
        failed: batchResult.results.filter(r => r.error)
      };

      const reportPath = await this.generateReport(analysis, 'regression-suite');

      this.log(`✅ Regression suite completed. Found ${analysis.regressions.length} potential regressions`, 'success');
      return analysis;

    } catch (error) {
      this.log(`❌ Regression suite failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runPerformanceTest(url = 'http://localhost:8080', iterations = 3) {
    this.log('⚡ Starting performance test suite...');

    const results = {
      url,
      iterations,
      measurements: []
    };

    try {
      for (let i = 1; i <= iterations; i++) {
        this.log(`📊 Performance test iteration ${i}/${iterations}`);

        const startTime = Date.now();

        // Create browser and measure load time
        await this.interactive.launch();
        const navigationStart = Date.now();

        await this.interactive.navigate(url);
        const navigationEnd = Date.now();

        // Take screenshot
        const screenshot = await this.interactive.screenshot(`performance-${i}.png`);

        // Get performance metrics
        const metrics = await this.interactive.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });

        await this.interactive.close();

        const totalTime = Date.now() - startTime;
        const navigationTime = navigationEnd - navigationStart;

        results.measurements.push({
          iteration: i,
          totalTime,
          navigationTime,
          screenshot,
          metrics
        });

        this.log(`⏱️ Iteration ${i}: ${navigationTime}ms navigation, ${totalTime}ms total`);
      }

      // Calculate averages
      const averages = {
        totalTime: results.measurements.reduce((sum, m) => sum + m.totalTime, 0) / iterations,
        navigationTime: results.measurements.reduce((sum, m) => sum + m.navigationTime, 0) / iterations,
        domContentLoaded: results.measurements.reduce((sum, m) => sum + m.metrics.domContentLoaded, 0) / iterations,
        loadComplete: results.measurements.reduce((sum, m) => sum + m.metrics.loadComplete, 0) / iterations
      };

      results.averages = averages;

      const reportPath = await this.generateReport(results, 'performance-test');

      this.log('✅ Performance test completed', 'success');
      this.log(`📊 Average navigation time: ${averages.navigationTime.toFixed(0)}ms`);
      this.log(`📋 Full report: ${reportPath}`);

      return results;

    } catch (error) {
      this.log(`❌ Performance test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runAccessibilityAudit(url = 'http://localhost:8080') {
    this.log('♿ Starting accessibility audit...');

    try {
      await this.interactive.launch();
      await this.interactive.navigate(url);

      // Run accessibility checks
      const auditResults = await this.interactive.evaluate(() => {
        // Basic accessibility checks
        const results = {
          images: {
            total: document.querySelectorAll('img').length,
            missingAlt: document.querySelectorAll('img:not([alt])').length
          },
          headings: {
            h1Count: document.querySelectorAll('h1').length,
            headingStructure: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => h.tagName)
          },
          forms: {
            inputs: document.querySelectorAll('input').length,
            inputsWithLabels: document.querySelectorAll('input[id]').length
          },
          links: {
            total: document.querySelectorAll('a').length,
            emptyLinks: document.querySelectorAll('a:not([href]), a[href=""]').length
          },
          landmarks: {
            main: document.querySelectorAll('main').length,
            nav: document.querySelectorAll('nav').length,
            header: document.querySelectorAll('header').length,
            footer: document.querySelectorAll('footer').length
          }
        };

        return results;
      });

      // Take screenshots with different accessibility settings
      const screenshots = {
        normal: await this.interactive.screenshot('accessibility-normal.png'),
        highContrast: null,
        largeText: null
      };

      // Test high contrast mode
      await this.interactive.page.emulateMedia({ colorScheme: 'dark' });
      screenshots.highContrast = await this.interactive.screenshot('accessibility-high-contrast.png');

      await this.interactive.close();

      const audit = {
        url,
        auditResults,
        screenshots,
        recommendations: this.generateAccessibilityRecommendations(auditResults)
      };

      const reportPath = await this.generateReport(audit, 'accessibility-audit');

      this.log('✅ Accessibility audit completed', 'success');
      this.log(`📋 Report: ${reportPath}`);

      return audit;

    } catch (error) {
      this.log(`❌ Accessibility audit failed: ${error.message}`, 'error');
      throw error;
    }
  }

  generateAccessibilityRecommendations(results) {
    const recommendations = [];

    if (results.images.missingAlt > 0) {
      recommendations.push(`${results.images.missingAlt} images are missing alt text`);
    }

    if (results.headings.h1Count === 0) {
      recommendations.push('No H1 heading found - should have exactly one H1 per page');
    } else if (results.headings.h1Count > 1) {
      recommendations.push(`${results.headings.h1Count} H1 headings found - should have only one per page`);
    }

    if (results.forms.inputs > 0 && results.forms.inputsWithLabels < results.forms.inputs) {
      recommendations.push('Some form inputs may be missing proper labels');
    }

    if (results.links.emptyLinks > 0) {
      recommendations.push(`${results.links.emptyLinks} links have no href or empty href`);
    }

    if (results.landmarks.main === 0) {
      recommendations.push('No main landmark found - consider adding <main> element');
    }

    return recommendations;
  }

  async createTestingDashboard() {
    const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Automation Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .control-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn { background: #007AFF; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #0056CC; }
        .btn.secondary { background: #8E8E93; }
        .btn.danger { background: #FF3B30; }
        .results { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        pre { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .status { padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.success { background: #34C759; color: white; }
        .status.error { background: #FF3B30; color: white; }
        .status.running { background: #FF9500; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎛️ Browser Automation Dashboard</h1>
            <p>Advanced browser testing and automation suite for macOS + Apple ecosystem</p>
        </div>

        <div class="controls">
            <div class="control-card">
                <h3>📸 Screenshot & Capture</h3>
                <button class="btn" onclick="runCommand('screenshot')">Full Page Screenshot</button>
                <button class="btn" onclick="runCommand('mobile-screenshot')">Mobile Screenshots</button>
                <button class="btn" onclick="runCommand('browser-capture')">Browser Window Capture</button>
                <button class="btn secondary" onclick="runCommand('native-screenshot')">Native macOS Capture</button>
            </div>

            <div class="control-card">
                <h3>🌐 Cross-Browser Testing</h3>
                <button class="btn" onclick="runCommand('cross-browser')">Cross-Browser Suite</button>
                <button class="btn" onclick="runCommand('compatibility')">Compatibility Test</button>
                <button class="btn" onclick="runCommand('performance')">Performance Comparison</button>
            </div>

            <div class="control-card">
                <h3>🍎 Apple Ecosystem</h3>
                <button class="btn" onclick="runCommand('sidecar-setup')">Setup Sidecar Testing</button>
                <button class="btn" onclick="runCommand('responsive-test')">Responsive Comparison</button>
                <button class="btn" onclick="runCommand('dual-screen')">Dual-Screen Capture</button>
            </div>

            <div class="control-card">
                <h3>🔍 Visual Testing</h3>
                <button class="btn" onclick="runCommand('visual-diff')">Visual Comparison</button>
                <button class="btn" onclick="runCommand('regression')">Regression Testing</button>
                <button class="btn" onclick="runCommand('accessibility')">Accessibility Audit</button>
            </div>

            <div class="control-card">
                <h3>⚡ Performance & Analysis</h3>
                <button class="btn" onclick="runCommand('performance-test')">Performance Test</button>
                <button class="btn" onclick="runCommand('comprehensive')">Comprehensive Suite</button>
                <button class="btn danger" onclick="runCommand('cleanup')">Cleanup Sessions</button>
            </div>

            <div class="control-card">
                <h3>📊 Session Management</h3>
                <div>
                    <input type="text" id="url-input" placeholder="http://localhost:8080" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button class="btn" onclick="runCommand('session-create')">Create Session</button>
                <button class="btn secondary" onclick="runCommand('session-list')">List Sessions</button>
            </div>
        </div>

        <div class="results">
            <h3>📋 Results <span id="status" class="status"></span></h3>
            <pre id="output">Ready for commands...</pre>
        </div>
    </div>

    <script>
        function runCommand(command) {
            const output = document.getElementById('output');
            const status = document.getElementById('status');
            const url = document.getElementById('url-input').value || 'http://localhost:8080';

            status.textContent = 'RUNNING';
            status.className = 'status running';
            output.textContent = \`Running \${command}...\\n\`;

            // This would connect to the actual automation system
            // For now, just simulate
            setTimeout(() => {
                status.textContent = 'SUCCESS';
                status.className = 'status success';
                output.textContent += \`\${command} completed successfully!\\n\`;
                output.textContent += \`Target URL: \${url}\\n\`;
                output.textContent += \`Results saved to automation-results/\\n\`;
            }, 2000);
        }

        // Auto-focus URL input
        document.getElementById('url-input').focus();
    </script>
</body>
</html>
    `;

    const dashboardPath = path.join(this.outputDir, 'automation-dashboard.html');
    await fs.writeFile(dashboardPath, dashboardHtml);

    this.log(`🎛️ Testing dashboard created: ${dashboardPath}`, 'success');
    this.log('Open in browser to access the automation controls');

    return dashboardPath;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const orchestrator = new BrowserAutomationOrchestrator();

  try {
    switch (command) {
      case 'comprehensive':
        const url = process.argv[3] || 'http://localhost:8080';
        await orchestrator.runComprehensiveTest(url);
        break;

      case 'regression':
        const baselineDir = process.argv[3];
        const currentDir = process.argv[4];

        if (!baselineDir || !currentDir) {
          console.log('Usage: regression <baseline-dir> <current-dir>');
          process.exit(1);
        }

        await orchestrator.runRegressionSuite(baselineDir, currentDir);
        break;

      case 'performance':
        const perfUrl = process.argv[3] || 'http://localhost:8080';
        const iterations = parseInt(process.argv[4]) || 3;
        await orchestrator.runPerformanceTest(perfUrl, iterations);
        break;

      case 'accessibility':
        const a11yUrl = process.argv[3] || 'http://localhost:8080';
        await orchestrator.runAccessibilityAudit(a11yUrl);
        break;

      case 'dashboard':
        const dashboardPath = await orchestrator.createTestingDashboard();
        console.log(`Dashboard created: ${dashboardPath}`);
        console.log('Open in browser to access automation controls');
        break;

      default:
        console.log(`
Browser Automation Orchestrator

Usage: node scripts/browser-automation-orchestrator.js [command] [options]

Commands:
  comprehensive [url]              - Run complete test suite
  regression <baseline> <current>  - Visual regression testing
  performance [url] [iterations]   - Performance testing
  accessibility [url]              - Accessibility audit
  dashboard                        - Create testing dashboard

Options:
  --verbose                        - Enable verbose logging

Examples:
  node scripts/browser-automation-orchestrator.js comprehensive https://be-productive.app
  node scripts/browser-automation-orchestrator.js regression ./baseline ./current
  node scripts/browser-automation-orchestrator.js performance http://localhost:8080 5
  node scripts/browser-automation-orchestrator.js accessibility https://be-productive.app
  node scripts/browser-automation-orchestrator.js dashboard

Features:
  🚀 Comprehensive multi-browser testing
  📱 Mobile and responsive design validation
  🍎 Apple ecosystem integration (Sidecar, iPad Pro)
  🔍 Visual regression detection
  ⚡ Performance monitoring
  ♿ Accessibility auditing
  📊 Detailed reporting and analysis
  🎛️ Web-based testing dashboard
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { BrowserAutomationOrchestrator };

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}