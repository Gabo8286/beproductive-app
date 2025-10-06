#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionReadinessOrchestrator {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      categories: {},
      overall: { passed: 0, failed: 0, total: 0 },
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      readyForProduction: false
    };
    this.config = {
      parallelExecution: process.env.PARALLEL_TESTS !== 'false',
      timeoutPerCategory: 30 * 60 * 1000, // 30 minutes per category
      totalTimeout: 3 * 60 * 60 * 1000, // 3 hours total
      failFast: process.env.FAIL_FAST === 'true',
      verbose: process.env.VERBOSE === 'true'
    };
  }

  async run() {
    console.log('🚀 Starting Production Readiness Test Orchestrator');
    console.log('================================================');

    try {
      await this.validateEnvironment();
      await this.setupTestEnvironment();

      if (this.config.parallelExecution) {
        await this.runTestsInParallel();
      } else {
        await this.runTestsSequentially();
      }

      await this.generateFinalReport();
      await this.validateProductionReadiness();

    } catch (error) {
      console.error('❌ Production Readiness Test Failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');

    const requiredCommands = ['npx', 'playwright', 'node'];
    for (const cmd of requiredCommands) {
      try {
        await this.executeCommand(`which ${cmd}`, { timeout: 5000 });
      } catch (error) {
        throw new Error(`Required command '${cmd}' not found`);
      }
    }

    // Check if application is running
    const baseURL = process.env.STAGING_URL || 'http://localhost:8080';
    try {
      const response = await fetch(baseURL);
      if (!response.ok) {
        console.log('⚠️  Application not responding, will be started by test runner');
      }
    } catch (error) {
      console.log('⚠️  Application not available, will be started by test runner');
    }

    console.log('✅ Environment validation complete');
  }

  async setupTestEnvironment() {
    console.log('🛠️  Setting up test environment...');

    // Ensure test directories exist
    const testDir = 'test-results/production-readiness';
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(`${testDir}/reports`, { recursive: true });

    // Initialize results tracking
    this.results.testDir = testDir;

    console.log('✅ Test environment setup complete');
  }

  async runTestsInParallel() {
    console.log('🔄 Running tests in parallel...');

    const testCategories = [
      { name: 'security', critical: true },
      { name: 'performance', critical: true },
      { name: 'reliability', critical: true },
      { name: 'compliance', critical: true },
      { name: 'ux', critical: false },
      { name: 'devops', critical: false },
      { name: 'data', critical: false },
      { name: 'integration', critical: false }
    ];

    const promises = testCategories.map(category =>
      this.runCategoryTests(category.name, category.critical)
    );

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const category = testCategories[index];
      if (result.status === 'rejected') {
        console.error(`❌ ${category.name} tests failed:`, result.reason);
        this.results.categories[category.name] = {
          status: 'failed',
          error: result.reason.message,
          critical: category.critical
        };
      }
    });

    console.log('✅ Parallel test execution complete');
  }

  async runTestsSequentially() {
    console.log('🔄 Running tests sequentially...');

    const testCategories = [
      { name: 'security', critical: true },
      { name: 'performance', critical: true },
      { name: 'reliability', critical: true },
      { name: 'compliance', critical: true },
      { name: 'ux', critical: false },
      { name: 'devops', critical: false },
      { name: 'data', critical: false },
      { name: 'integration', critical: false }
    ];

    for (const category of testCategories) {
      try {
        await this.runCategoryTests(category.name, category.critical);

        if (this.config.failFast && this.results.categories[category.name]?.status === 'failed' && category.critical) {
          throw new Error(`Critical category '${category.name}' failed, stopping execution (fail-fast mode)`);
        }
      } catch (error) {
        console.error(`❌ ${category.name} tests failed:`, error.message);

        if (this.config.failFast && category.critical) {
          throw error;
        }
      }
    }

    console.log('✅ Sequential test execution complete');
  }

  async runCategoryTests(categoryName, isCritical) {
    const startTime = Date.now();
    console.log(`🧪 Running ${categoryName} tests...`);

    try {
      // Determine which tests to run based on category
      let testCommand;
      let testConfig;

      switch (categoryName) {
        case 'security':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=security-tests';
          break;
        case 'performance':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=performance-tests';
          break;
        case 'reliability':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=reliability-tests';
          break;
        case 'compliance':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=compliance-tests';
          break;
        case 'ux':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=ux-tests';
          break;
        case 'devops':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=devops-tests';
          break;
        case 'data':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=data-tests';
          break;
        case 'integration':
          testCommand = 'playwright test --config=src/test/production-readiness/config/production-readiness.config.ts --project=integration-tests';
          break;
        default:
          throw new Error(`Unknown test category: ${categoryName}`);
      }

      const result = await this.executeCommand(`npx ${testCommand}`, {
        timeout: this.config.timeoutPerCategory,
        cwd: process.cwd()
      });

      const duration = Date.now() - startTime;

      this.results.categories[categoryName] = {
        status: 'passed',
        duration,
        output: result.stdout,
        critical: isCritical
      };

      console.log(`✅ ${categoryName} tests completed in ${Math.round(duration / 1000)}s`);

    } catch (error) {
      const duration = Date.now() - startTime;

      this.results.categories[categoryName] = {
        status: 'failed',
        duration,
        error: error.message,
        output: error.stdout,
        critical: isCritical
      };

      if (isCritical) {
        console.error(`❌ CRITICAL: ${categoryName} tests failed in ${Math.round(duration / 1000)}s`);
        throw error;
      } else {
        console.warn(`⚠️  ${categoryName} tests failed in ${Math.round(duration / 1000)}s (non-critical)`);
      }
    }
  }

  async generateFinalReport() {
    console.log('📊 Generating final report...');

    this.results.endTime = new Date().toISOString();
    this.results.duration = Date.now() - this.startTime;

    // Calculate overall statistics
    let totalPassed = 0;
    let totalFailed = 0;
    let criticalFailures = 0;

    Object.entries(this.results.categories).forEach(([name, result]) => {
      if (result.status === 'passed') {
        totalPassed++;
      } else {
        totalFailed++;
        if (result.critical) {
          criticalFailures++;
        }
      }
    });

    this.results.overall = {
      passed: totalPassed,
      failed: totalFailed,
      total: totalPassed + totalFailed,
      passRate: Math.round((totalPassed / (totalPassed + totalFailed)) * 100),
      criticalFailures
    };

    // Determine production readiness
    this.results.readyForProduction = criticalFailures === 0 && this.results.overall.passRate >= 95;

    // Write detailed report
    const reportPath = `${this.results.testDir}/orchestrator-report.json`;
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    // Generate summary report
    await this.generateSummaryReport();

    console.log(`✅ Final report generated: ${reportPath}`);
  }

  async generateSummaryReport() {
    const summary = `
# Production Readiness Test Summary

**Generated**: ${new Date().toLocaleString()}
**Duration**: ${Math.round(this.results.duration / 1000)}s

## Overall Results

- **Pass Rate**: ${this.results.overall.passRate}%
- **Categories Passed**: ${this.results.overall.passed}/${this.results.overall.total}
- **Critical Failures**: ${this.results.overall.criticalFailures}

## Production Readiness

${this.results.readyForProduction ? '✅ **READY FOR PRODUCTION**' : '❌ **NOT READY FOR PRODUCTION**'}

## Category Results

${Object.entries(this.results.categories).map(([name, result]) => {
  const status = result.status === 'passed' ? '✅' : '❌';
  const critical = result.critical ? ' (CRITICAL)' : '';
  const duration = Math.round(result.duration / 1000);
  return `- **${name}**: ${status} ${duration}s${critical}`;
}).join('\\n')}

${this.results.readyForProduction
  ? '## ✅ Deployment Approved\\n\\nYour application has passed all production readiness tests and is approved for deployment.'
  : `## ❌ Deployment Blocked\\n\\nYour application has ${this.results.overall.criticalFailures} critical failures that must be resolved before production deployment.`
}

---
*Generated by BeProductive Production Readiness Test Orchestrator*
`;

    const summaryPath = `${this.results.testDir}/reports/summary.md`;
    await fs.writeFile(summaryPath, summary);

    console.log(`📝 Summary report generated: ${summaryPath}`);
  }

  async validateProductionReadiness() {
    console.log('🔍 Validating production readiness...');

    if (this.results.readyForProduction) {
      console.log('✅ 🎉 PRODUCTION DEPLOYMENT APPROVED! 🎉');
      console.log(`✅ Pass Rate: ${this.results.overall.passRate}%`);
      console.log('✅ All critical categories passed');
      console.log('✅ No critical failures detected');

      // Set success exit code
      process.exitCode = 0;
    } else {
      console.log('❌ 🚫 PRODUCTION DEPLOYMENT BLOCKED 🚫');
      console.log(`❌ Pass Rate: ${this.results.overall.passRate}% (required: 95%)`);
      console.log(`❌ Critical Failures: ${this.results.overall.criticalFailures}`);

      // List failed critical categories
      Object.entries(this.results.categories).forEach(([name, result]) => {
        if (result.status === 'failed' && result.critical) {
          console.log(`❌ CRITICAL FAILURE: ${name}`);
        }
      });

      // Set failure exit code
      process.exitCode = 1;
    }

    console.log('================================================');
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        cwd: options.cwd || process.cwd(),
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (this.config.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (this.config.verbose) {
          process.stderr.write(data);
        }
      });

      const timeout = options.timeout ? setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${options.timeout}ms: ${command}`));
      }, options.timeout) : null;

      child.on('close', (code) => {
        if (timeout) clearTimeout(timeout);

        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          const error = new Error(`Command failed with code ${code}: ${command}`);
          error.stdout = stdout;
          error.stderr = stderr;
          error.code = code;
          reject(error);
        }
      });

      child.on('error', (error) => {
        if (timeout) clearTimeout(timeout);
        reject(error);
      });
    });
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg === '--parallel') options.parallel = true;
  if (arg === '--sequential') options.parallel = false;
  if (arg === '--fail-fast') options.failFast = true;
  if (arg === '--verbose') options.verbose = true;
});

// Set environment variables based on options
if (options.parallel === false) process.env.PARALLEL_TESTS = 'false';
if (options.failFast) process.env.FAIL_FAST = 'true';
if (options.verbose) process.env.VERBOSE = 'true';

// Run the orchestrator
const orchestrator = new ProductionReadinessOrchestrator();
orchestrator.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});