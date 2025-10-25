import { IntentAccuracyFramework } from '@/tests/intentAccuracyFramework';
import { getAllTestCases, getTestCasesByCategory } from '@/tests/data/intentTestDatasets';

/**
 * Test runner script for intent recognition accuracy testing
 * Can be run from command line or integrated into CI/CD pipeline
 */

interface TestRunOptions {
  category?: 'basic' | 'edge_case' | 'ambiguous' | 'multilingual' | 'typos' | 'slang';
  outputFile?: string;
  verbose?: boolean;
  threshold?: number; // Minimum accuracy threshold (0-1)
}

export class AccuracyTestRunner {
  private framework: IntentAccuracyFramework;

  constructor() {
    this.framework = new IntentAccuracyFramework();
  }

  /**
   * Run accuracy tests with specified options
   */
  async runTests(options: TestRunOptions = {}) {
    console.log('🚀 Starting Intent Recognition Accuracy Tests...\n');

    const startTime = Date.now();

    try {
      // Determine which tests to run
      let results;
      if (options.category) {
        console.log(`📋 Running tests for category: ${options.category}`);
        results = await this.framework.runTestsByCategory(options.category);
      } else {
        console.log('📋 Running full test suite...');
        results = await this.framework.runFullTestSuite();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Generate and display report
      const report = this.framework.generateReport(results);

      console.log('\n' + '='.repeat(60));
      console.log(report);
      console.log('='.repeat(60));

      // Display summary
      this.displaySummary(results, totalTime);

      // Check if accuracy meets threshold
      if (options.threshold && results.accuracy < options.threshold) {
        console.log(`\n❌ Accuracy ${(results.accuracy * 100).toFixed(2)}% below threshold ${(options.threshold * 100).toFixed(2)}%`);
        process.exit(1);
      }

      // Export results if requested
      if (options.outputFile) {
        const jsonData = this.framework.exportResults(results);
        const fs = require('fs');
        fs.writeFileSync(options.outputFile, jsonData);
        console.log(`\n📄 Results exported to: ${options.outputFile}`);
      }

      // Display verbose results if requested
      if (options.verbose) {
        this.displayVerboseResults(results);
      }

      return results;

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Display test summary
   */
  private displaySummary(results: any, totalTime: number) {
    console.log('\n📊 Test Summary:');
    console.log(`   Total Tests: ${results.totalTests}`);
    console.log(`   Passed: ${results.passed} (${(results.accuracy * 100).toFixed(2)}%)`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Avg Confidence: ${(results.avgConfidence * 100).toFixed(2)}%`);
    console.log(`   Avg Response Time: ${results.avgExecutionTime.toFixed(2)}ms`);
    console.log(`   Total Execution Time: ${(totalTime / 1000).toFixed(2)}s`);

    // Accuracy status
    const accuracy = results.accuracy;
    if (accuracy >= 0.9) {
      console.log('   Status: ✅ Excellent');
    } else if (accuracy >= 0.8) {
      console.log('   Status: ✅ Good');
    } else if (accuracy >= 0.7) {
      console.log('   Status: ⚠️ Needs Improvement');
    } else {
      console.log('   Status: ❌ Poor');
    }
  }

  /**
   * Display verbose test results
   */
  private displayVerboseResults(results: any) {
    console.log('\n🔍 Detailed Results:\n');

    // Category breakdown
    console.log('📂 By Category:');
    Object.entries(results.categoryBreakdown).forEach(([category, stats]: [string, any]) => {
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${(stats.accuracy * 100).toFixed(2)}%)`);
    });

    // Intent breakdown
    console.log('\n🎯 By Intent:');
    Object.entries(results.intentBreakdown).forEach(([intent, stats]: [string, any]) => {
      console.log(`   ${intent}: ${stats.passed}/${stats.total} (${(stats.accuracy * 100).toFixed(2)}%)`);
    });

    // Top misclassifications
    if (results.misclassificationPatterns.length > 0) {
      console.log('\n❌ Top Misclassifications:');
      results.misclassificationPatterns.slice(0, 5).forEach((pattern: any, index: number) => {
        console.log(`   ${index + 1}. ${pattern.expected} → ${pattern.actual} (${pattern.count} cases)`);
      });
    }

    // Failed tests sample
    const failedTests = results.results.filter((r: any) => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n🔍 Sample Failed Tests:');
      failedTests.slice(0, 5).forEach((result: any, index: number) => {
        console.log(`   ${index + 1}. "${result.testCase.input}"`);
        console.log(`      Expected: ${result.testCase.expectedIntent}`);
        console.log(`      Got: ${result.actualIntent} (${(result.actualConfidence * 100).toFixed(2)}%)`);
      });
    }
  }

  /**
   * Run tests and return performance metrics
   */
  async getPerformanceMetrics(category?: TestRunOptions['category']) {
    const results = category
      ? await this.framework.runTestsByCategory(category)
      : await this.framework.runFullTestSuite();

    return this.framework.getPerformanceMetrics(results.results);
  }

  /**
   * Run benchmark tests to compare performance over time
   */
  async runBenchmark(baselineFile?: string) {
    console.log('🏃 Running benchmark tests...\n');

    const currentResults = await this.framework.runFullTestSuite();

    if (baselineFile) {
      try {
        const fs = require('fs');
        const baselineData = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
        const comparison = this.framework.compareResults(baselineData.results, currentResults);

        console.log('\n📈 Performance Comparison:');
        console.log(`   Accuracy Change: ${(comparison.accuracyChange * 100).toFixed(2)}%`);
        console.log(`   Confidence Change: ${(comparison.confidenceChange * 100).toFixed(2)}%`);
        console.log(`   Execution Time Change: ${comparison.executionTimeChange.toFixed(2)}ms`);

        if (comparison.improvedIntents.length > 0) {
          console.log(`   Improved Intents: ${comparison.improvedIntents.join(', ')}`);
        }

        if (comparison.degradedIntents.length > 0) {
          console.log(`   Degraded Intents: ${comparison.degradedIntents.join(', ')}`);
        }

      } catch (error) {
        console.log('⚠️ Could not load baseline file for comparison');
      }
    }

    return currentResults;
  }
}

/**
 * CLI interface for running tests
 */
export async function main() {
  const args = process.argv.slice(2);
  const options: TestRunOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--category':
        options.category = args[++i] as TestRunOptions['category'];
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--threshold':
        options.threshold = parseFloat(args[++i]);
        break;
      case '--help':
        console.log(`
Intent Recognition Accuracy Test Runner

Usage: npm run test:accuracy [options]

Options:
  --category <type>     Run tests for specific category (basic, edge_case, ambiguous, multilingual, typos, slang)
  --output <file>       Export results to JSON file
  --verbose             Show detailed test results
  --threshold <number>  Set minimum accuracy threshold (0-1)
  --help               Show this help message

Examples:
  npm run test:accuracy
  npm run test:accuracy -- --category basic --verbose
  npm run test:accuracy -- --threshold 0.8 --output results.json
        `);
        process.exit(0);
    }
  }

  const runner = new AccuracyTestRunner();
  await runner.runTests(options);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}