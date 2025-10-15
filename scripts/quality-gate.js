#!/usr/bin/env node

/**
 * Quality Gate Script
 * Unified quality validation for development and CI/CD
 * Consolidates lint, type-check, tests, and quality analysis
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

class QualityGate {
  constructor() {
    this.verbose = process.argv.includes('--verbose') || process.env.VERBOSE === 'true';
    this.strict = process.argv.includes('--strict') || process.env.STRICT === 'true';
    this.skipTests = process.argv.includes('--skip-tests');
    this.skipBundle = process.argv.includes('--skip-bundle');

    this.results = {
      passed: 0,
      failed: 0,
      gates: []
    };

    this.thresholds = {
      coverage: parseInt(process.env.COVERAGE_THRESHOLD) || 80,
      bundleSize: parseInt(process.env.BUNDLE_SIZE_LIMIT) || 500, // KB
      qualityScore: parseInt(process.env.QUALITY_THRESHOLD) || 80
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : 'ℹ️';

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
        resolve({
          command: `${command} ${args.join(' ')}`,
          code,
          duration,
          stdout,
          stderr,
          success: code === 0
        });
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkLinting() {
    this.log('🔍 Checking code linting...');
    const result = await this.runCommand('npm', ['run', 'lint']);

    const gate = {
      name: 'Linting',
      passed: result.success,
      duration: result.duration,
      details: result.success ? 'All linting rules passed' : 'Linting errors found',
      stderr: result.stderr
    };

    this.results.gates.push(gate);

    if (gate.passed) {
      this.results.passed++;
      this.log('✅ Linting passed', 'success');
    } else {
      this.results.failed++;
      this.log('❌ Linting failed', 'error');
      if (result.stderr && !this.verbose) {
        console.error(result.stderr);
      }
    }

    return gate;
  }

  async checkTypeScript() {
    this.log('🔍 Checking TypeScript types...');
    const result = await this.runCommand('npm', ['run', 'type-check']);

    const gate = {
      name: 'TypeScript',
      passed: result.success,
      duration: result.duration,
      details: result.success ? 'No type errors found' : 'TypeScript errors found',
      stderr: result.stderr
    };

    this.results.gates.push(gate);

    if (gate.passed) {
      this.results.passed++;
      this.log('✅ TypeScript check passed', 'success');
    } else {
      this.results.failed++;
      this.log('❌ TypeScript check failed', 'error');
      if (result.stderr && !this.verbose) {
        console.error(result.stderr);
      }
    }

    return gate;
  }

  async checkTests() {
    if (this.skipTests) {
      this.log('⏭️ Skipping tests (--skip-tests flag)');
      return { name: 'Tests', passed: true, skipped: true };
    }

    this.log('🧪 Running tests...');
    const result = await this.runCommand('node', ['scripts/test-runner.js', 'ci', '--coverage']);

    // Parse coverage from output if available
    let coverage = null;
    if (result.stdout) {
      const coverageMatch = result.stdout.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
      if (coverageMatch) {
        coverage = parseFloat(coverageMatch[1]);
      }
    }

    const coveragePassed = !coverage || coverage >= this.thresholds.coverage;

    const gate = {
      name: 'Tests & Coverage',
      passed: result.success && coveragePassed,
      duration: result.duration,
      details: `Tests: ${result.success ? 'Passed' : 'Failed'}${coverage ? `, Coverage: ${coverage}%` : ''}`,
      coverage,
      coverageThreshold: this.thresholds.coverage,
      stderr: result.stderr
    };

    this.results.gates.push(gate);

    if (gate.passed) {
      this.results.passed++;
      this.log(`✅ Tests passed${coverage ? ` with ${coverage}% coverage` : ''}`, 'success');
    } else {
      this.results.failed++;
      if (!result.success) {
        this.log('❌ Tests failed', 'error');
      }
      if (coverage && coverage < this.thresholds.coverage) {
        this.log(`❌ Coverage ${coverage}% below threshold ${this.thresholds.coverage}%`, 'error');
      }
    }

    return gate;
  }

  async checkBundleSize() {
    if (this.skipBundle) {
      this.log('⏭️ Skipping bundle analysis (--skip-bundle flag)');
      return { name: 'Bundle Size', passed: true, skipped: true };
    }

    this.log('📦 Analyzing bundle size...');

    // Build first
    const buildResult = await this.runCommand('npm', ['run', 'build']);
    if (!buildResult.success) {
      const gate = {
        name: 'Bundle Analysis',
        passed: false,
        duration: buildResult.duration,
        details: 'Build failed',
        stderr: buildResult.stderr
      };
      this.results.gates.push(gate);
      this.results.failed++;
      return gate;
    }

    // Analyze bundle
    const analyzeResult = await this.runCommand('node', ['scripts/bundle-analyzer.js']);

    // Parse bundle size from output
    let bundleSize = null;
    if (analyzeResult.stdout) {
      const sizeMatch = analyzeResult.stdout.match(/Total bundle size:\s+(\d+(?:\.\d+)?)\s*KB/i);
      if (sizeMatch) {
        bundleSize = parseFloat(sizeMatch[1]);
      }
    }

    const sizePassed = !bundleSize || bundleSize <= this.thresholds.bundleSize;

    const gate = {
      name: 'Bundle Size',
      passed: analyzeResult.success && sizePassed,
      duration: buildResult.duration + analyzeResult.duration,
      details: `Bundle analysis: ${analyzeResult.success ? 'Completed' : 'Failed'}${bundleSize ? `, Size: ${bundleSize}KB` : ''}`,
      bundleSize,
      bundleThreshold: this.thresholds.bundleSize,
      stderr: analyzeResult.stderr
    };

    this.results.gates.push(gate);

    if (gate.passed) {
      this.results.passed++;
      this.log(`✅ Bundle analysis passed${bundleSize ? ` (${bundleSize}KB)` : ''}`, 'success');
    } else {
      this.results.failed++;
      if (!analyzeResult.success) {
        this.log('❌ Bundle analysis failed', 'error');
      }
      if (bundleSize && bundleSize > this.thresholds.bundleSize) {
        this.log(`❌ Bundle size ${bundleSize}KB exceeds threshold ${this.thresholds.bundleSize}KB`, 'error');
      }
    }

    return gate;
  }

  async checkCodeQuality() {
    this.log('📊 Analyzing code quality...');
    const result = await this.runCommand('node', ['scripts/code-quality-analyzer.js']);

    // Parse quality score from output
    let qualityScore = null;
    if (result.stdout) {
      const scoreMatch = result.stdout.match(/Overall Quality Score:\s+(\d+(?:\.\d+)?)/i);
      if (scoreMatch) {
        qualityScore = parseFloat(scoreMatch[1]);
      }
    }

    const qualityPassed = !qualityScore || qualityScore >= this.thresholds.qualityScore;

    const gate = {
      name: 'Code Quality',
      passed: result.success && qualityPassed,
      duration: result.duration,
      details: `Quality analysis: ${result.success ? 'Completed' : 'Failed'}${qualityScore ? `, Score: ${qualityScore}` : ''}`,
      qualityScore,
      qualityThreshold: this.thresholds.qualityScore,
      stderr: result.stderr
    };

    this.results.gates.push(gate);

    if (gate.passed) {
      this.results.passed++;
      this.log(`✅ Code quality passed${qualityScore ? ` (score: ${qualityScore})` : ''}`, 'success');
    } else {
      this.results.failed++;
      if (!result.success) {
        this.log('❌ Code quality analysis failed', 'error');
      }
      if (qualityScore && qualityScore < this.thresholds.qualityScore) {
        this.log(`❌ Quality score ${qualityScore} below threshold ${this.thresholds.qualityScore}`, 'error');
      }
    }

    return gate;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.results.failed === 0,
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        threshold: this.thresholds
      },
      gates: this.results.gates,
      environment: {
        node: process.version,
        platform: process.platform,
        strict: this.strict
      }
    };

    const reportPath = path.join(process.cwd(), 'quality-gate-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  async run() {
    const startTime = Date.now();
    this.log('🚦 Starting Quality Gate validation...');

    try {
      // Run all checks
      await this.checkLinting();
      await this.checkTypeScript();
      await this.checkTests();
      await this.checkBundleSize();
      await this.checkCodeQuality();

      const duration = Date.now() - startTime;
      const report = await this.generateReport();

      // Summary
      this.log('\n=== Quality Gate Results ===');
      this.log(`Total Gates: ${report.summary.total}`);
      this.log(`Passed: ${report.summary.passed}`, 'success');
      if (report.summary.failed > 0) {
        this.log(`Failed: ${report.summary.failed}`, 'error');
      }
      this.log(`Duration: ${Math.round(duration / 1000)}s`);

      // Detailed results
      if (this.verbose) {
        this.log('\n=== Gate Details ===');
        for (const gate of this.results.gates) {
          const status = gate.passed ? '✅' : '❌';
          const duration = Math.round(gate.duration / 1000);
          this.log(`${status} ${gate.name}: ${gate.details} (${duration}s)`);
        }
      }

      if (report.passed) {
        this.log('\n🎉 All quality gates passed! Ready for deployment.', 'success');
        process.exit(0);
      } else {
        this.log('\n❌ Quality gates failed. Please fix issues before deployment.', 'error');

        if (this.strict) {
          process.exit(1);
        } else {
          this.log('⚠️ Non-strict mode: continuing despite failures', 'warning');
          process.exit(0);
        }
      }

    } catch (error) {
      this.log(`Quality gate validation failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI Interface
function showHelp() {
  console.log(`
Usage: node scripts/quality-gate.js [options]

Options:
  --verbose      Detailed output and gate results
  --strict       Exit with error code on any gate failure
  --skip-tests   Skip test execution
  --skip-bundle  Skip bundle size analysis
  --help         Show this help

Environment Variables:
  VERBOSE=true           Enable verbose logging
  STRICT=true            Enable strict mode
  COVERAGE_THRESHOLD=80  Minimum test coverage percentage
  BUNDLE_SIZE_LIMIT=500  Maximum bundle size in KB
  QUALITY_THRESHOLD=80   Minimum code quality score

Quality Gates:
  1. Linting        - ESLint code quality rules
  2. TypeScript     - Type checking and compilation
  3. Tests          - Unit tests and coverage validation
  4. Bundle Size    - Build output size analysis
  5. Code Quality   - Complexity and maintainability metrics

Examples:
  npm run gates:check           # Run all quality gates
  npm run gates:check --strict  # Fail on any gate failure
  npm run gates:check --verbose # Detailed output
`);
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

const gate = new QualityGate();
gate.run();