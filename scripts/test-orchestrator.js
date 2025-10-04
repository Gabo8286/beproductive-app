#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';

const execAsync = promisify(exec);

/**
 * Enterprise Test Orchestration System
 * Provides advanced test execution, parallel processing, smart scheduling,
 * and comprehensive reporting for large-scale testing operations
 */

class TestOrchestrator {
  constructor() {
    this.outputDir = 'test-orchestration';
    this.config = {
      maxParallelJobs: 4,
      timeout: 300000, // 5 minutes
      retries: 2,
      smartScheduling: true,
      failFast: false,
      coverageThreshold: 80
    };
    this.testSuites = new Map();
    this.executionHistory = [];
    this.metrics = {};
  }

  async initialize() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await this.discoverTestSuites();
    console.log('🎭 Test Orchestrator Initialized');
  }

  async discoverTestSuites() {
    console.log('🔍 Discovering test suites...');

    const testCategories = {
      unit: {
        pattern: 'src/**/*.test.{ts,tsx}',
        priority: 1,
        timeout: 30000,
        parallel: true
      },
      integration: {
        pattern: 'src/test/integration/**/*.test.{ts,tsx}',
        priority: 2,
        timeout: 60000,
        parallel: true
      },
      e2e: {
        pattern: 'tests/e2e/**/*.spec.{ts,tsx}',
        priority: 3,
        timeout: 120000,
        parallel: false
      },
      performance: {
        pattern: 'src/test/performance/**/*.test.{ts,tsx}',
        priority: 2,
        timeout: 90000,
        parallel: false
      },
      accessibility: {
        pattern: 'src/test/accessibility/**/*.test.{ts,tsx}',
        priority: 2,
        timeout: 45000,
        parallel: true
      },
      security: {
        pattern: 'src/test/security/**/*.test.{ts,tsx}',
        priority: 1,
        timeout: 60000,
        parallel: true
      },
      i18n: {
        pattern: 'src/test/i18n/**/*.test.{ts,tsx}',
        priority: 3,
        timeout: 30000,
        parallel: true
      },
      analytics: {
        pattern: 'src/test/analytics/**/*.test.{ts,tsx}',
        priority: 3,
        timeout: 45000,
        parallel: true
      },
      monitoring: {
        pattern: 'src/test/monitoring/**/*.test.{ts,tsx}',
        priority: 2,
        timeout: 30000,
        parallel: true
      },
      visual: {
        pattern: 'tests/visual/**/*.spec.{ts,tsx}',
        priority: 4,
        timeout: 180000,
        parallel: false
      }
    };

    for (const [category, config] of Object.entries(testCategories)) {
      try {
        const { stdout } = await execAsync(`find . -path "./${config.pattern}" 2>/dev/null || echo ""`);
        const files = stdout.trim().split('\n').filter(f => f.length > 0);

        if (files.length > 0) {
          this.testSuites.set(category, {
            ...config,
            files,
            fileCount: files.length,
            estimatedDuration: files.length * (config.timeout / 1000 / 60) // rough estimate in minutes
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not discover tests for ${category}: ${error.message}`);
      }
    }

    console.log(`📊 Discovered ${this.testSuites.size} test categories with ${this.getTotalTestCount()} test files`);
  }

  getTotalTestCount() {
    return Array.from(this.testSuites.values()).reduce((total, suite) => total + suite.fileCount, 0);
  }

  async createExecutionPlan() {
    console.log('📋 Creating optimized execution plan...');

    const suites = Array.from(this.testSuites.entries());

    // Sort by priority and estimated duration
    const sortedSuites = suites.sort(([, a], [, b]) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority number = higher priority
      }
      return b.estimatedDuration - a.estimatedDuration; // Longer tests first for better parallelization
    });

    const executionPlan = {
      phases: [],
      totalEstimatedDuration: 0,
      parallelizable: [],
      sequential: []
    };

    // Phase 1: Critical tests (unit, security)
    const criticalTests = sortedSuites.filter(([, suite]) => suite.priority === 1);
    if (criticalTests.length > 0) {
      executionPlan.phases.push({
        name: 'Critical Tests',
        tests: criticalTests.map(([name]) => name),
        parallel: true,
        failFast: true
      });
    }

    // Phase 2: Core functionality tests (integration, performance, accessibility, monitoring)
    const coreTests = sortedSuites.filter(([, suite]) => suite.priority === 2);
    if (coreTests.length > 0) {
      executionPlan.phases.push({
        name: 'Core Functionality Tests',
        tests: coreTests.map(([name]) => name),
        parallel: true,
        failFast: false
      });
    }

    // Phase 3: Feature tests (i18n, analytics)
    const featureTests = sortedSuites.filter(([, suite]) => suite.priority === 3);
    if (featureTests.length > 0) {
      executionPlan.phases.push({
        name: 'Feature Tests',
        tests: featureTests.map(([name]) => name),
        parallel: true,
        failFast: false
      });
    }

    // Phase 4: Visual and E2E tests (sequential)
    const visualTests = sortedSuites.filter(([, suite]) => suite.priority === 4);
    if (visualTests.length > 0) {
      executionPlan.phases.push({
        name: 'Visual & E2E Tests',
        tests: visualTests.map(([name]) => name),
        parallel: false,
        failFast: false
      });
    }

    // Calculate total estimated duration
    executionPlan.totalEstimatedDuration = sortedSuites.reduce((total, [, suite]) => {
      return total + (suite.parallel ? suite.estimatedDuration / this.config.maxParallelJobs : suite.estimatedDuration);
    }, 0);

    await fs.writeFile(
      `${this.outputDir}/execution-plan.json`,
      JSON.stringify(executionPlan, null, 2)
    );

    return executionPlan;
  }

  async executeTestSuite(suiteName, options = {}) {
    console.log(`🧪 Executing ${suiteName} tests...`);

    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`);
    }

    const startTime = Date.now();
    const execution = {
      suite: suiteName,
      startTime,
      endTime: null,
      duration: null,
      status: 'running',
      results: null,
      retries: 0,
      ...options
    };

    try {
      let command;
      let args = [];

      switch (suiteName) {
        case 'unit':
        case 'integration':
        case 'performance':
        case 'accessibility':
        case 'security':
        case 'i18n':
        case 'analytics':
        case 'monitoring':
          command = 'npm';
          args = ['run', 'test:run', '--', suite.pattern];
          break;

        case 'e2e':
        case 'visual':
          command = 'npx';
          args = ['playwright', 'test', suite.pattern];
          break;

        default:
          command = 'npm';
          args = ['run', 'test:run'];
      }

      const result = await this.runCommand(command, args, {
        timeout: suite.timeout,
        cwd: process.cwd()
      });

      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
      execution.status = result.success ? 'passed' : 'failed';
      execution.results = result;

      if (!result.success && options.retryOnFailure && execution.retries < this.config.retries) {
        console.log(`🔄 Retrying ${suiteName} (attempt ${execution.retries + 1}/${this.config.retries})`);
        execution.retries++;
        return this.executeTestSuite(suiteName, { ...options, retries: execution.retries });
      }

    } catch (error) {
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
      execution.status = 'error';
      execution.results = { error: error.message };
    }

    this.executionHistory.push(execution);
    return execution;
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(command, args, {
        stdio: 'pipe',
        cwd: options.cwd || process.cwd(),
        timeout: options.timeout || this.config.timeout
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr,
          duration,
          command: `${command} ${args.join(' ')}`
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: stderr + error.message,
          duration: Date.now() - startTime,
          command: `${command} ${args.join(' ')}`
        });
      });

      // Handle timeout
      if (options.timeout) {
        setTimeout(() => {
          child.kill('SIGTERM');
        }, options.timeout);
      }
    });
  }

  async executeParallel(suiteNames, options = {}) {
    console.log(`🔄 Executing ${suiteNames.length} test suites in parallel...`);

    const promises = suiteNames.map(suiteName =>
      this.executeTestSuite(suiteName, { ...options, retryOnFailure: true })
    );

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => ({
      suite: suiteNames[index],
      status: result.status,
      execution: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  async executeSequential(suiteNames, options = {}) {
    console.log(`📝 Executing ${suiteNames.length} test suites sequentially...`);

    const results = [];

    for (const suiteName of suiteNames) {
      const execution = await this.executeTestSuite(suiteName, { ...options, retryOnFailure: true });
      results.push({ suite: suiteName, execution });

      // Fail fast if enabled and test failed
      if (options.failFast && execution.status !== 'passed') {
        console.log(`❌ Failing fast due to ${suiteName} failure`);
        break;
      }
    }

    return results;
  }

  async executeAll() {
    console.log('🚀 Starting comprehensive test execution...');

    const executionPlan = await this.createExecutionPlan();
    const overallStartTime = Date.now();
    const phaseResults = [];

    for (const phase of executionPlan.phases) {
      console.log(`\n📋 Phase: ${phase.name}`);

      const phaseStartTime = Date.now();
      let phaseResult;

      if (phase.parallel) {
        phaseResult = await this.executeParallel(phase.tests, { failFast: phase.failFast });
      } else {
        phaseResult = await this.executeSequential(phase.tests, { failFast: phase.failFast });
      }

      const phaseEndTime = Date.now();
      const phaseDuration = phaseEndTime - phaseStartTime;

      phaseResults.push({
        phase: phase.name,
        tests: phase.tests,
        results: phaseResult,
        duration: phaseDuration,
        success: phaseResult.every(r => r.execution?.status === 'passed')
      });

      // Log phase summary
      const passed = phaseResult.filter(r => r.execution?.status === 'passed').length;
      const failed = phaseResult.filter(r => r.execution?.status === 'failed').length;
      const errors = phaseResult.filter(r => r.execution?.status === 'error').length;

      console.log(`✅ Phase completed: ${passed} passed, ${failed} failed, ${errors} errors (${(phaseDuration / 1000).toFixed(1)}s)`);

      // Fail fast at phase level if enabled
      if (phase.failFast && !phaseResults[phaseResults.length - 1].success) {
        console.log(`❌ Stopping execution due to phase failure`);
        break;
      }
    }

    const overallEndTime = Date.now();
    const overallDuration = overallEndTime - overallStartTime;

    const summary = await this.generateExecutionSummary(phaseResults, overallDuration);

    console.log(`\n🎯 Execution completed in ${(overallDuration / 1000 / 60).toFixed(1)} minutes`);

    return summary;
  }

  async generateExecutionSummary(phaseResults, overallDuration) {
    console.log('📊 Generating execution summary...');

    const allResults = phaseResults.flatMap(phase => phase.results);
    const totalTests = allResults.length;
    const passed = allResults.filter(r => r.execution?.status === 'passed').length;
    const failed = allResults.filter(r => r.execution?.status === 'failed').length;
    const errors = allResults.filter(r => r.execution?.status === 'error').length;

    const summary = {
      timestamp: new Date().toISOString(),
      duration: overallDuration,
      overview: {
        totalSuites: totalTests,
        passed,
        failed,
        errors,
        successRate: ((passed / totalTests) * 100).toFixed(1) + '%'
      },
      phases: phaseResults.map(phase => ({
        name: phase.phase,
        duration: phase.duration,
        success: phase.success,
        tests: phase.tests.length,
        results: phase.results.map(r => ({
          suite: r.suite,
          status: r.execution?.status || 'error',
          duration: r.execution?.duration || 0
        }))
      })),
      performance: {
        totalDuration: overallDuration,
        averageTestDuration: allResults.reduce((sum, r) => sum + (r.execution?.duration || 0), 0) / totalTests,
        slowestSuite: this.findSlowestSuite(allResults),
        fastestSuite: this.findFastestSuite(allResults)
      },
      recommendations: this.generateRecommendations(phaseResults, overallDuration)
    };

    await fs.writeFile(
      `${this.outputDir}/execution-summary.json`,
      JSON.stringify(summary, null, 2)
    );

    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport(summary);
    await fs.writeFile(`${this.outputDir}/EXECUTION_REPORT.md`, humanReport);

    return summary;
  }

  findSlowestSuite(results) {
    return results.reduce((slowest, current) => {
      const currentDuration = current.execution?.duration || 0;
      const slowestDuration = slowest?.execution?.duration || 0;
      return currentDuration > slowestDuration ? current : slowest;
    }, null);
  }

  findFastestSuite(results) {
    return results.reduce((fastest, current) => {
      const currentDuration = current.execution?.duration || Infinity;
      const fastestDuration = fastest?.execution?.duration || Infinity;
      return currentDuration < fastestDuration ? current : fastest;
    }, null);
  }

  generateRecommendations(phaseResults, overallDuration) {
    const recommendations = [];

    // Performance recommendations
    if (overallDuration > 600000) { // > 10 minutes
      recommendations.push('Consider optimizing test execution time - overall duration exceeds 10 minutes');
    }

    // Failure analysis
    const failedPhases = phaseResults.filter(phase => !phase.success);
    if (failedPhases.length > 0) {
      recommendations.push(`Address failures in: ${failedPhases.map(p => p.phase).join(', ')}`);
    }

    // Parallelization opportunities
    const sequentialPhases = phaseResults.filter(phase => phase.tests.length > 1);
    if (sequentialPhases.length > 0) {
      recommendations.push('Consider parallelizing sequential test phases for better performance');
    }

    return recommendations;
  }

  generateHumanReadableReport(summary) {
    return `# Test Execution Report

Generated: ${summary.timestamp}

## Summary
- **Total Duration**: ${(summary.duration / 1000 / 60).toFixed(1)} minutes
- **Test Suites**: ${summary.overview.totalSuites}
- **Success Rate**: ${summary.overview.successRate}
- **Results**: ✅ ${summary.overview.passed} passed, ❌ ${summary.overview.failed} failed, ⚠️ ${summary.overview.errors} errors

## Phase Results

${summary.phases.map(phase => `### ${phase.name}
- Duration: ${(phase.duration / 1000).toFixed(1)}s
- Status: ${phase.success ? '✅ Passed' : '❌ Failed'}
- Tests: ${phase.tests}
- Results: ${phase.results.map(r => `${r.suite}: ${r.status}`).join(', ')}`).join('\n\n')}

## Performance Metrics
- **Average Test Duration**: ${(summary.performance.averageTestDuration / 1000).toFixed(1)}s
- **Slowest Suite**: ${summary.performance.slowestSuite?.suite || 'N/A'} (${((summary.performance.slowestSuite?.execution?.duration || 0) / 1000).toFixed(1)}s)
- **Fastest Suite**: ${summary.performance.fastestSuite?.suite || 'N/A'} (${((summary.performance.fastestSuite?.execution?.duration || 0) / 1000).toFixed(1)}s)

## Recommendations

${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
1. Review failed test suites
2. Implement performance optimizations
3. Set up automated test scheduling
4. Monitor test execution trends
`;
  }

  async run() {
    try {
      await this.initialize();

      console.log('🎭 Starting enterprise test orchestration...\n');

      const summary = await this.executeAll();

      console.log('\n✅ Test orchestration complete!');
      console.log(`📁 Reports saved to: ${this.outputDir}/`);
      console.log(`📊 Success Rate: ${summary.overview.successRate}`);
      console.log(`⏱️ Total Duration: ${(summary.duration / 1000 / 60).toFixed(1)} minutes`);

      // Exit with non-zero code if tests failed
      if (summary.overview.failed > 0 || summary.overview.errors > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Test orchestration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new TestOrchestrator();
  orchestrator.run();
}

export default TestOrchestrator;