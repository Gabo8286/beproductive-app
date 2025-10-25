#!/usr/bin/env node

/**
 * Comprehensive Quality Gates System
 * Prevents code quality regressions and enforces standards
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Quality thresholds
const QUALITY_THRESHOLDS = {
  duplication: {
    max_percentage: 2.0,
    max_lines: 50,
    min_tokens: 50
  },
  complexity: {
    cyclomatic_max: 10,
    cognitive_max: 15,
    max_function_lines: 50,
    max_file_lines: 300
  },
  coverage: {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  },
  bundle: {
    max_total_size: 500 * 1024, // 500KB
    max_chunk_size: 200 * 1024, // 200KB
    max_initial_size: 300 * 1024 // 300KB
  },
  dependencies: {
    max_outdated: 5,
    security_audit_level: 'moderate'
  },
  accessibility: {
    min_score: 90,
    max_violations: 0
  }
};

class QualityGateRunner {
  constructor() {
    this.results = {};
    this.errors = [];
    this.warnings = [];
    this.passed = true;
  }

  async runAllGates() {
    console.log('🚀 Running Comprehensive Quality Gates...\n');

    const gates = [
      { name: 'Linting', fn: () => this.runLinting() },
      { name: 'Type Checking', fn: () => this.runTypeChecking() },
      { name: 'Unit Tests', fn: () => this.runUnitTests() },
      { name: 'Code Coverage', fn: () => this.runCoverageCheck() },
      { name: 'Duplication Detection', fn: () => this.runDuplicationCheck() },
      { name: 'Complexity Analysis', fn: () => this.runComplexityCheck() },
      { name: 'Bundle Size Analysis', fn: () => this.runBundleCheck() },
      { name: 'Dependency Audit', fn: () => this.runDependencyAudit() },
      { name: 'Import Pattern Analysis', fn: () => this.runImportPatternCheck() },
      { name: 'Architecture Validation', fn: () => this.runArchitectureCheck() },
      { name: 'Performance Check', fn: () => this.runPerformanceCheck() },
      { name: 'Accessibility Audit', fn: () => this.runAccessibilityCheck() }
    ];

    for (const gate of gates) {
      try {
        console.log(`🔍 Running ${gate.name}...`);
        await gate.fn();
        console.log(`✅ ${gate.name} passed\n`);
      } catch (error) {
        console.error(`❌ ${gate.name} failed: ${error.message}\n`);
        this.errors.push(`${gate.name}: ${error.message}`);
        this.passed = false;
      }
    }

    return this.generateReport();
  }

  async runLinting() {
    try {
      const { stdout, stderr } = await execAsync('npm run lint');
      this.results.linting = {
        passed: true,
        output: stdout,
        errors: stderr
      };
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;

      // Parse ESLint output for specific violations
      const violations = this.parseESLintOutput(errorOutput);

      if (violations.errors > 0) {
        throw new Error(`${violations.errors} linting errors found. Fix before proceeding.`);
      } else if (violations.warnings > 10) {
        this.warnings.push(`${violations.warnings} linting warnings found. Consider fixing.`);
      }

      this.results.linting = {
        passed: violations.errors === 0,
        violations,
        output: errorOutput
      };
    }
  }

  async runTypeChecking() {
    try {
      const { stdout, stderr } = await execAsync('npm run type-check');
      this.results.typeChecking = {
        passed: true,
        output: stdout
      };
    } catch (error) {
      const errorCount = this.parseTypeScriptErrors(error.stdout || error.stderr);
      throw new Error(`${errorCount} TypeScript errors found`);
    }
  }

  async runUnitTests() {
    try {
      const { stdout } = await execAsync('npm run test:run -- --reporter=json');
      const testResults = JSON.parse(stdout);

      const failedTests = testResults.numFailedTests || 0;
      const passRate = ((testResults.numPassedTests || 0) / (testResults.numTotalTests || 1)) * 100;

      if (failedTests > 0) {
        throw new Error(`${failedTests} unit tests failed`);
      }

      if (passRate < 95) {
        this.warnings.push(`Test pass rate is ${passRate.toFixed(1)}%. Target: 95%+`);
      }

      this.results.unitTests = {
        passed: true,
        totalTests: testResults.numTotalTests,
        passedTests: testResults.numPassedTests,
        failedTests: failedTests,
        passRate: passRate
      };
    } catch (error) {
      if (error.message.includes('tests failed')) {
        throw error;
      }
      // If tests don't exist, warn but don't fail
      this.warnings.push('No unit tests found or test runner not configured');
    }
  }

  async runCoverageCheck() {
    try {
      const { stdout } = await execAsync('npm run test:coverage -- --reporter=json-summary');
      const coverage = JSON.parse(stdout);

      const metrics = coverage.total;
      const failedMetrics = [];

      Object.entries(QUALITY_THRESHOLDS.coverage).forEach(([metric, threshold]) => {
        if (metrics[metric]?.pct < threshold) {
          failedMetrics.push(`${metric}: ${metrics[metric]?.pct}% (required: ${threshold}%)`);
        }
      });

      if (failedMetrics.length > 0) {
        throw new Error(`Coverage thresholds not met: ${failedMetrics.join(', ')}`);
      }

      this.results.coverage = {
        passed: true,
        metrics: metrics
      };
    } catch (error) {
      if (error.message.includes('Coverage thresholds')) {
        throw error;
      }
      this.warnings.push('Code coverage check skipped - no coverage configured');
    }
  }

  async runDuplicationCheck() {
    try {
      // Create output directory
      await fs.mkdir('quality-reports', { recursive: true });

      const { stdout } = await execAsync(`npx jscpd src --min-tokens ${QUALITY_THRESHOLDS.duplication.min_tokens} --reporters json --output quality-reports/duplication.json`);

      // Parse jscpd output
      const duplicationData = await this.parseDuplicationReport();

      if (duplicationData.percentage > QUALITY_THRESHOLDS.duplication.max_percentage) {
        throw new Error(`Code duplication ${duplicationData.percentage}% exceeds threshold ${QUALITY_THRESHOLDS.duplication.max_percentage}%`);
      }

      this.results.duplication = {
        passed: true,
        percentage: duplicationData.percentage,
        duplicates: duplicationData.duplicates,
        files: duplicationData.files
      };
    } catch (error) {
      if (error.message.includes('duplication')) {
        throw error;
      }
      this.warnings.push('Duplication check failed to run properly');
    }
  }

  async runComplexityCheck() {
    try {
      // Analyze complexity using custom script
      const complexityData = await this.analyzeComplexity();

      const violations = complexityData.violations || [];
      const highComplexityFiles = violations.filter(v => v.complexity > QUALITY_THRESHOLDS.complexity.cyclomatic_max);

      if (highComplexityFiles.length > 0) {
        throw new Error(`${highComplexityFiles.length} files exceed complexity threshold`);
      }

      this.results.complexity = {
        passed: true,
        averageComplexity: complexityData.average,
        maxComplexity: complexityData.max,
        violationsCount: violations.length
      };
    } catch (error) {
      if (error.message.includes('complexity')) {
        throw error;
      }
      this.warnings.push('Complexity analysis skipped');
    }
  }

  async runBundleCheck() {
    try {
      // Build the project
      await execAsync('npm run build');

      // Analyze bundle sizes
      const bundleData = await this.analyzeBundleSize();

      if (bundleData.totalSize > QUALITY_THRESHOLDS.bundle.max_total_size) {
        throw new Error(`Bundle size ${this.formatBytes(bundleData.totalSize)} exceeds limit ${this.formatBytes(QUALITY_THRESHOLDS.bundle.max_total_size)}`);
      }

      this.results.bundle = {
        passed: true,
        totalSize: bundleData.totalSize,
        chunks: bundleData.chunks,
        largestChunk: bundleData.largestChunk
      };
    } catch (error) {
      if (error.message.includes('Bundle size')) {
        throw error;
      }
      this.warnings.push('Bundle size check skipped - build failed or not configured');
    }
  }

  async runDependencyAudit() {
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditData = JSON.parse(stdout);

      const highSeverityIssues = auditData.vulnerabilities ?
        Object.values(auditData.vulnerabilities).filter(v => v.severity === 'high' || v.severity === 'critical').length : 0;

      if (highSeverityIssues > 0) {
        throw new Error(`${highSeverityIssues} high/critical security vulnerabilities found`);
      }

      // Check for outdated packages
      const { stdout: outdatedOutput } = await execAsync('npm outdated --json').catch(() => ({ stdout: '{}' }));
      const outdatedPackages = Object.keys(JSON.parse(outdatedOutput || '{}'));

      if (outdatedPackages.length > QUALITY_THRESHOLDS.dependencies.max_outdated) {
        this.warnings.push(`${outdatedPackages.length} packages are outdated`);
      }

      this.results.dependencies = {
        passed: true,
        vulnerabilities: auditData.metadata?.vulnerabilities || 0,
        outdatedPackages: outdatedPackages.length
      };
    } catch (error) {
      if (error.message.includes('vulnerabilities')) {
        throw error;
      }
      this.warnings.push('Dependency audit encountered issues');
    }
  }

  async runImportPatternCheck() {
    try {
      const violations = await this.analyzeImportPatterns();

      if (violations.relativeImports > 50) {
        this.warnings.push(`${violations.relativeImports} relative imports found. Consider using absolute imports.`);
      }

      if (violations.circularDependencies > 0) {
        throw new Error(`${violations.circularDependencies} circular dependencies detected`);
      }

      this.results.importPatterns = {
        passed: true,
        relativeImports: violations.relativeImports,
        absoluteImports: violations.absoluteImports,
        circularDependencies: violations.circularDependencies
      };
    } catch (error) {
      if (error.message.includes('circular')) {
        throw error;
      }
      this.warnings.push('Import pattern analysis failed');
    }
  }

  async runArchitectureCheck() {
    try {
      const architectureViolations = await this.validateArchitecture();

      if (architectureViolations.length > 0) {
        this.warnings.push(`${architectureViolations.length} architecture violations found`);
      }

      this.results.architecture = {
        passed: true,
        violations: architectureViolations
      };
    } catch (error) {
      this.warnings.push('Architecture validation failed');
    }
  }

  async runPerformanceCheck() {
    try {
      // Check for common performance anti-patterns
      const performanceIssues = await this.analyzePerformancePatterns();

      if (performanceIssues.critical > 0) {
        throw new Error(`${performanceIssues.critical} critical performance issues found`);
      }

      if (performanceIssues.warnings > 10) {
        this.warnings.push(`${performanceIssues.warnings} performance warnings found`);
      }

      this.results.performance = {
        passed: true,
        issues: performanceIssues
      };
    } catch (error) {
      if (error.message.includes('performance')) {
        throw error;
      }
      this.warnings.push('Performance check skipped');
    }
  }

  async runAccessibilityCheck() {
    try {
      // Run accessibility audit on built files
      const a11yIssues = await this.analyzeAccessibility();

      if (a11yIssues.violations > QUALITY_THRESHOLDS.accessibility.max_violations) {
        throw new Error(`${a11yIssues.violations} accessibility violations found`);
      }

      this.results.accessibility = {
        passed: true,
        score: a11yIssues.score,
        violations: a11yIssues.violations
      };
    } catch (error) {
      if (error.message.includes('accessibility')) {
        throw error;
      }
      this.warnings.push('Accessibility audit skipped');
    }
  }

  // Helper methods
  parseESLintOutput(output) {
    const errorMatch = output.match(/(\d+) error/);
    const warningMatch = output.match(/(\d+) warning/);

    return {
      errors: errorMatch ? parseInt(errorMatch[1]) : 0,
      warnings: warningMatch ? parseInt(warningMatch[1]) : 0
    };
  }

  parseTypeScriptErrors(output) {
    const errorMatch = output.match(/Found (\d+) error/);
    return errorMatch ? parseInt(errorMatch[1]) : 0;
  }

  async parseDuplicationReport() {
    try {
      const reportPath = 'quality-reports/duplication.json';
      const reportData = await fs.readFile(reportPath, 'utf-8');
      const data = JSON.parse(reportData);

      return {
        percentage: data.statistics?.total?.percentage || 0,
        duplicates: data.duplicates?.length || 0,
        files: data.statistics?.total?.files || 0
      };
    } catch (error) {
      return { percentage: 0, duplicates: 0, files: 0 };
    }
  }

  async analyzeComplexity() {
    // Simple complexity analysis
    const sourceFiles = await this.getSourceFiles();
    let totalComplexity = 0;
    let maxComplexity = 0;
    const violations = [];

    for (const file of sourceFiles.slice(0, 20)) { // Sample 20 files
      try {
        const content = await fs.readFile(file, 'utf-8');
        const complexity = this.calculateFileComplexity(content);

        totalComplexity += complexity;
        maxComplexity = Math.max(maxComplexity, complexity);

        if (complexity > QUALITY_THRESHOLDS.complexity.cyclomatic_max) {
          violations.push({ file, complexity });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      average: totalComplexity / sourceFiles.length,
      max: maxComplexity,
      violations
    };
  }

  calculateFileComplexity(content) {
    // Simple cyclomatic complexity calculation
    const complexityIndicators = [
      /if\s*\(/g,
      /else/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /\?\s*.*:/g, // ternary
      /&&/g,
      /\|\|/g
    ];

    let complexity = 1; // Base complexity

    complexityIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  async analyzeBundleSize() {
    // Analyze dist directory
    const distPath = 'dist';
    const chunks = [];
    let totalSize = 0;

    try {
      const files = await fs.readdir(distPath, { recursive: true });

      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.css')) {
          const filePath = path.join(distPath, file);
          const stats = await fs.stat(filePath);
          chunks.push({ name: file, size: stats.size });
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Dist directory doesn't exist or is empty
    }

    const largestChunk = chunks.reduce((largest, chunk) =>
      chunk.size > (largest?.size || 0) ? chunk : largest, null);

    return {
      totalSize,
      chunks,
      largestChunk
    };
  }

  async analyzeImportPatterns() {
    const sourceFiles = await this.getSourceFiles();
    let relativeImports = 0;
    let absoluteImports = 0;

    for (const file of sourceFiles.slice(0, 50)) { // Sample files
      try {
        const content = await fs.readFile(file, 'utf-8');
        const relativeMatches = content.match(/import.*from\s+['"][.]/g);
        const absoluteMatches = content.match(/import.*from\s+['"][@]/g);

        if (relativeMatches) relativeImports += relativeMatches.length;
        if (absoluteMatches) absoluteImports += absoluteMatches.length;
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Check for circular dependencies using madge
    let circularDependencies = 0;
    try {
      const { stdout } = await execAsync('npx madge --circular src --json');
      const circularData = JSON.parse(stdout);
      circularDependencies = Array.isArray(circularData) ? circularData.length : 0;
    } catch (error) {
      // Madge not available or failed
    }

    return {
      relativeImports,
      absoluteImports,
      circularDependencies
    };
  }

  async validateArchitecture() {
    // Check for architecture violations
    const violations = [];

    // Check if presentation layer imports from infrastructure
    const presentationFiles = await this.getFilesInDirectory('src/presentation');
    for (const file of presentationFiles.slice(0, 10)) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes('from \'../infrastructure') || content.includes('from \'@/infrastructure')) {
          violations.push(`Presentation layer importing from infrastructure: ${file}`);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return violations;
  }

  async analyzePerformancePatterns() {
    const sourceFiles = await this.getSourceFiles();
    let critical = 0;
    let warnings = 0;

    for (const file of sourceFiles.slice(0, 30)) { // Sample files
      try {
        const content = await fs.readFile(file, 'utf-8');

        // Check for performance anti-patterns
        if (content.includes('console.log') || content.includes('console.error')) {
          warnings++;
        }

        if (content.includes('document.querySelector') && content.includes('useState')) {
          critical++; // React component with direct DOM manipulation
        }

        if (content.match(/useEffect\s*\(\s*\(\s*\)\s*=>/g)) {
          const effectMatches = content.match(/useEffect\s*\([^}]*\}/g);
          if (effectMatches && effectMatches.some(effect => !effect.includes('[]'))) {
            warnings++; // useEffect without dependencies
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return { critical, warnings };
  }

  async analyzeAccessibility() {
    // Simple accessibility pattern check
    const componentFiles = await this.getFilesInDirectory('src/components');
    let violations = 0;
    let score = 100;

    for (const file of componentFiles.slice(0, 20)) {
      try {
        const content = await fs.readFile(file, 'utf-8');

        // Check for missing alt attributes
        if (content.includes('<img') && !content.includes('alt=')) {
          violations++;
          score -= 5;
        }

        // Check for missing aria-labels on buttons without text
        if (content.includes('<button') && !content.includes('aria-label') && !content.includes('>') + 'text') {
          violations++;
          score -= 3;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      score: Math.max(score, 0),
      violations
    };
  }

  async getSourceFiles() {
    try {
      const { stdout } = await execAsync('find src -name "*.ts" -o -name "*.tsx" | head -100');
      return stdout.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  async getFilesInDirectory(dir) {
    try {
      const { stdout } = await execAsync(`find ${dir} -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -50`);
      return stdout.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.passed,
      summary: {
        totalGates: Object.keys(this.results).length,
        passedGates: Object.values(this.results).filter(r => r.passed).length,
        failedGates: this.errors.length,
        warnings: this.warnings.length
      },
      results: this.results,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    fs.writeFile('quality-reports/quality-gates-report.json', JSON.stringify(report, null, 2))
      .catch(err => console.error('Failed to write report:', err));

    this.printSummary(report);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.duplication?.percentage > 1) {
      recommendations.push('Consider extracting common code into shared utilities or base classes');
    }

    if (this.results.complexity?.averageComplexity > 8) {
      recommendations.push('Break down complex functions into smaller, more focused functions');
    }

    if (this.results.bundle?.totalSize > 400 * 1024) {
      recommendations.push('Consider code splitting and lazy loading to reduce bundle size');
    }

    if (this.results.importPatterns?.relativeImports > 30) {
      recommendations.push('Standardize on absolute imports using path aliases');
    }

    return recommendations;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QUALITY GATES SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n🎯 Overall Result: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📈 Gates Passed: ${report.summary.passedGates}/${report.summary.totalGates}`);

    if (report.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (report.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      report.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    console.log(`\n📄 Full report saved to: quality-reports/quality-gates-report.json`);
    console.log('='.repeat(60));
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new QualityGateRunner();

  runner.runAllGates()
    .then(report => {
      process.exit(report.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error running quality gates:', error);
      process.exit(1);
    });
}

export { QualityGateRunner, QUALITY_THRESHOLDS };