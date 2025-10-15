#!/usr/bin/env node

/**
 * Unified Test Runner
 * Consolidates all testing operations into a single, intelligent script
 * Replaces multiple individual test scripts with a unified interface
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.verbose = process.argv.includes('--verbose') || process.env.VERBOSE === 'true';
    this.parallel = process.argv.includes('--parallel') || process.env.PARALLEL === 'true';
    this.failFast = process.argv.includes('--fail-fast') || process.env.FAIL_FAST === 'true';
    this.coverage = process.argv.includes('--coverage');
    this.watch = process.argv.includes('--watch');

    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      details: []
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';

    if (this.verbose || level !== 'debug') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.log(`Running: ${command} ${args.join(' ')}`, 'debug');

      const proc = spawn(command, args, {
        stdio: this.verbose ? 'inherit' : 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        proc.stdout?.on('data', (data) => stdout += data);
        proc.stderr?.on('data', (data) => stderr += data);
      }

      proc.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = {
          command: `${command} ${args.join(' ')}`,
          code,
          duration,
          stdout,
          stderr
        };

        if (code === 0) {
          this.results.passed++;
          this.log(`✅ ${command} completed in ${duration}ms`, 'success');
          resolve(result);
        } else {
          this.results.failed++;
          this.log(`❌ ${command} failed with code ${code}`, 'error');
          if (!this.verbose && stderr) {
            console.error(stderr);
          }

          if (this.failFast) {
            reject(new Error(`Command failed: ${command}`));
          } else {
            resolve(result);
          }
        }

        this.results.details.push(result);
      });

      proc.on('error', (error) => {
        this.results.failed++;
        this.log(`❌ Failed to run ${command}: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async runUnit() {
    this.log('Running unit tests...');
    const args = ['run'];

    if (this.coverage) args.push('--coverage');
    if (this.watch) args.push('--watch');

    return await this.runCommand('npx', ['vitest', ...args]);
  }

  async runE2E() {
    this.log('Running E2E tests...');
    const args = ['test'];

    if (this.verbose) args.push('--reporter=list');

    return await this.runCommand('npx', ['playwright', ...args]);
  }

  async runPerformance() {
    this.log('Running performance tests...');
    return await this.runCommand('npx', [
      'playwright',
      'test',
      '--config=tests/performance/playwright.config.ts'
    ]);
  }

  async runProduction() {
    this.log('Running production readiness tests...');
    const args = [];

    if (this.parallel) args.push('--parallel');
    if (this.failFast) args.push('--fail-fast');

    return await this.runCommand('node', ['scripts/production-readiness-orchestrator.js', ...args]);
  }

  async runLint() {
    this.log('Running linting...');
    return await this.runCommand('npm', ['run', 'lint']);
  }

  async runTypeCheck() {
    this.log('Running type checking...');
    return await this.runCommand('npm', ['run', 'type-check']);
  }

  async runSecurity() {
    this.log('Running security tests...');
    return await this.runCommand('npx', [
      'playwright',
      'test',
      'src/test/production-readiness/01-security/',
      '--config=src/test/production-readiness/config/production-readiness.config.ts'
    ]);
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        duration: this.results.duration
      },
      details: this.results.details,
      environment: {
        node: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };

    const reportPath = path.join(process.cwd(), 'test-results', 'test-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Test report written to: ${reportPath}`);
    return report;
  }

  async run(suite = 'all') {
    const startTime = Date.now();
    this.log(`Starting test suite: ${suite}`);

    try {
      const runners = [];

      switch (suite) {
        case 'unit':
          runners.push(() => this.runUnit());
          break;

        case 'e2e':
          runners.push(() => this.runE2E());
          break;

        case 'performance':
          runners.push(() => this.runPerformance());
          break;

        case 'production':
          runners.push(() => this.runProduction());
          break;

        case 'security':
          runners.push(() => this.runSecurity());
          break;

        case 'quick':
          runners.push(() => this.runLint());
          runners.push(() => this.runTypeCheck());
          runners.push(() => this.runUnit());
          break;

        case 'ci':
          runners.push(() => this.runLint());
          runners.push(() => this.runTypeCheck());
          runners.push(() => this.runUnit());
          runners.push(() => this.runE2E());
          break;

        case 'all':
        default:
          runners.push(() => this.runLint());
          runners.push(() => this.runTypeCheck());
          runners.push(() => this.runUnit());
          runners.push(() => this.runE2E());
          runners.push(() => this.runPerformance());
          break;
      }

      if (this.parallel && runners.length > 1) {
        this.log('Running tests in parallel...');
        await Promise.all(runners.map(runner => runner().catch(() => {})));
      } else {
        this.log('Running tests sequentially...');
        for (const runner of runners) {
          await runner();
          if (this.failFast && this.results.failed > 0) {
            break;
          }
        }
      }

      this.results.duration = Date.now() - startTime;

      const report = await this.generateReport();

      // Summary
      this.log('\n=== Test Results Summary ===');
      this.log(`Total: ${report.summary.total}`);
      this.log(`Passed: ${report.summary.passed}`, 'success');
      if (report.summary.failed > 0) {
        this.log(`Failed: ${report.summary.failed}`, 'error');
      }
      this.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);

      if (report.summary.failed > 0) {
        process.exit(1);
      } else {
        this.log('🎉 All tests passed!', 'success');
      }

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI Interface
function showHelp() {
  console.log(`
Usage: node scripts/test-runner.js [suite] [options]

Test Suites:
  unit         Run unit tests only
  e2e          Run E2E tests only
  performance  Run performance tests only
  production   Run production readiness tests
  security     Run security tests only
  quick        Run quick validation (lint + types + unit)
  ci           Run CI pipeline tests (lint + types + unit + e2e)
  all          Run all tests (default)

Options:
  --verbose    Detailed output
  --parallel   Run tests in parallel where possible
  --fail-fast  Stop on first failure
  --coverage   Include coverage reporting
  --watch      Watch mode for unit tests
  --help       Show this help

Environment Variables:
  VERBOSE=true      Enable verbose logging
  PARALLEL=true     Enable parallel execution
  FAIL_FAST=true    Stop on first failure

Examples:
  npm test                           # Run all tests
  npm run test:quick                 # Quick validation
  npm run test:ci                    # CI pipeline
  npm run test:unit -- --coverage   # Unit tests with coverage
  npm run test:e2e -- --verbose     # Verbose E2E tests
`);
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

const suite = process.argv[2] || 'all';
const runner = new TestRunner();
runner.run(suite);