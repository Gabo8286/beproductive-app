import { IntentRecognitionEngine } from '@/services/intentRecognition';
import { IntentTestCase, getAllTestCases, getTestCasesByCategory } from '@/tests/data/intentTestDatasets';
import { UserIntent } from '@/types/promptLibrary';

/**
 * Automated testing framework for intent recognition accuracy
 * Provides comprehensive testing, reporting, and analysis capabilities
 */

export interface TestResult {
  testCase: IntentTestCase;
  actualIntent: UserIntent;
  actualConfidence: number;
  passed: boolean;
  confidenceMet: boolean;
  executionTime: number;
  error?: string;
}

export interface TestSuiteResult {
  totalTests: number;
  passed: number;
  failed: number;
  accuracy: number;
  avgConfidence: number;
  avgExecutionTime: number;
  results: TestResult[];
  categoryBreakdown: Record<string, {
    total: number;
    passed: number;
    accuracy: number;
  }>;
  intentBreakdown: Record<string, {
    total: number;
    passed: number;
    accuracy: number;
    avgConfidence: number;
  }>;
  misclassificationPatterns: {
    expected: UserIntent;
    actual: UserIntent;
    count: number;
    examples: string[];
  }[];
}

export interface PerformanceMetrics {
  totalTests: number;
  overallAccuracy: number;
  confidenceThresholdMet: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errorRate: number;
}

export class IntentAccuracyFramework {
  private engine: IntentRecognitionEngine;
  private results: TestResult[] = [];

  constructor() {
    this.engine = new IntentRecognitionEngine();
  }

  /**
   * Run a single test case
   */
  async runSingleTest(testCase: IntentTestCase): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const recognition = await this.engine.recognizeIntent(testCase.input);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const passed = recognition.intent === testCase.expectedIntent;
      const confidenceMet = !testCase.expectedConfidence ||
        recognition.confidence >= testCase.expectedConfidence;

      return {
        testCase,
        actualIntent: recognition.intent,
        actualConfidence: recognition.confidence,
        passed,
        confidenceMet,
        executionTime
      };
    } catch (error) {
      const endTime = performance.now();

      return {
        testCase,
        actualIntent: 'general_assistance',
        actualConfidence: 0,
        passed: false,
        confidenceMet: false,
        executionTime: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run multiple test cases
   */
  async runTests(testCases: IntentTestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runSingleTest(testCase);
      results.push(result);

      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.results = results;
    return results;
  }

  /**
   * Run all test datasets
   */
  async runFullTestSuite(): Promise<TestSuiteResult> {
    const allTestCases = getAllTestCases();
    const results = await this.runTests(allTestCases);

    return this.analyzeResults(results);
  }

  /**
   * Run tests by category
   */
  async runTestsByCategory(category: IntentTestCase['category']): Promise<TestSuiteResult> {
    const testCases = getTestCasesByCategory(category);
    const results = await this.runTests(testCases);

    return this.analyzeResults(results);
  }

  /**
   * Analyze test results and generate comprehensive report
   */
  private analyzeResults(results: TestResult[]): TestSuiteResult {
    const totalTests = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = totalTests - passed;
    const accuracy = totalTests > 0 ? passed / totalTests : 0;

    const avgConfidence = results.length > 0
      ? results.reduce((sum, r) => sum + r.actualConfidence, 0) / results.length
      : 0;

    const avgExecutionTime = results.length > 0
      ? results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
      : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, {total: number; passed: number; accuracy: number}> = {};
    results.forEach(result => {
      const category = result.testCase.category;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { total: 0, passed: 0, accuracy: 0 };
      }
      categoryBreakdown[category].total++;
      if (result.passed) {
        categoryBreakdown[category].passed++;
      }
    });

    Object.keys(categoryBreakdown).forEach(category => {
      const breakdown = categoryBreakdown[category];
      breakdown.accuracy = breakdown.total > 0 ? breakdown.passed / breakdown.total : 0;
    });

    // Intent breakdown
    const intentBreakdown: Record<string, {
      total: number;
      passed: number;
      accuracy: number;
      avgConfidence: number;
    }> = {};

    results.forEach(result => {
      const intent = result.testCase.expectedIntent;
      if (!intentBreakdown[intent]) {
        intentBreakdown[intent] = { total: 0, passed: 0, accuracy: 0, avgConfidence: 0 };
      }
      intentBreakdown[intent].total++;
      if (result.passed) {
        intentBreakdown[intent].passed++;
      }
    });

    Object.keys(intentBreakdown).forEach(intent => {
      const breakdown = intentBreakdown[intent];
      breakdown.accuracy = breakdown.total > 0 ? breakdown.passed / breakdown.total : 0;

      const intentResults = results.filter(r => r.testCase.expectedIntent === intent);
      breakdown.avgConfidence = intentResults.length > 0
        ? intentResults.reduce((sum, r) => sum + r.actualConfidence, 0) / intentResults.length
        : 0;
    });

    // Misclassification patterns
    const misclassificationMap = new Map<string, {
      expected: UserIntent;
      actual: UserIntent;
      count: number;
      examples: string[];
    }>();

    results.filter(r => !r.passed).forEach(result => {
      const key = `${result.testCase.expectedIntent}->${result.actualIntent}`;
      if (!misclassificationMap.has(key)) {
        misclassificationMap.set(key, {
          expected: result.testCase.expectedIntent,
          actual: result.actualIntent,
          count: 0,
          examples: []
        });
      }

      const pattern = misclassificationMap.get(key)!;
      pattern.count++;
      if (pattern.examples.length < 3) {
        pattern.examples.push(result.testCase.input);
      }
    });

    const misclassificationPatterns = Array.from(misclassificationMap.values())
      .sort((a, b) => b.count - a.count);

    return {
      totalTests,
      passed,
      failed,
      accuracy,
      avgConfidence,
      avgExecutionTime,
      results,
      categoryBreakdown,
      intentBreakdown,
      misclassificationPatterns
    };
  }

  /**
   * Generate detailed report
   */
  generateReport(results: TestSuiteResult): string {
    const report = [];

    report.push('# Intent Recognition Accuracy Report');
    report.push('');
    report.push(`## Overall Performance`);
    report.push(`- **Total Tests**: ${results.totalTests}`);
    report.push(`- **Passed**: ${results.passed} (${(results.accuracy * 100).toFixed(2)}%)`);
    report.push(`- **Failed**: ${results.failed}`);
    report.push(`- **Average Confidence**: ${(results.avgConfidence * 100).toFixed(2)}%`);
    report.push(`- **Average Execution Time**: ${results.avgExecutionTime.toFixed(2)}ms`);
    report.push('');

    // Category breakdown
    report.push('## Performance by Category');
    report.push('');
    Object.entries(results.categoryBreakdown).forEach(([category, stats]) => {
      report.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      report.push(`- Tests: ${stats.total}`);
      report.push(`- Accuracy: ${(stats.accuracy * 100).toFixed(2)}%`);
      report.push('');
    });

    // Intent breakdown
    report.push('## Performance by Intent');
    report.push('');
    Object.entries(results.intentBreakdown).forEach(([intent, stats]) => {
      report.push(`### ${intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
      report.push(`- Tests: ${stats.total}`);
      report.push(`- Accuracy: ${(stats.accuracy * 100).toFixed(2)}%`);
      report.push(`- Avg Confidence: ${(stats.avgConfidence * 100).toFixed(2)}%`);
      report.push('');
    });

    // Misclassification patterns
    if (results.misclassificationPatterns.length > 0) {
      report.push('## Common Misclassification Patterns');
      report.push('');
      results.misclassificationPatterns.slice(0, 10).forEach((pattern, index) => {
        report.push(`${index + 1}. **${pattern.expected}** → **${pattern.actual}** (${pattern.count} cases)`);
        pattern.examples.forEach(example => {
          report.push(`   - "${example}"`);
        });
        report.push('');
      });
    }

    // Failed tests details
    const failedTests = results.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      report.push('## Failed Test Cases');
      report.push('');
      failedTests.slice(0, 20).forEach((result, index) => {
        report.push(`${index + 1}. **Input**: "${result.testCase.input}"`);
        report.push(`   - Expected: ${result.testCase.expectedIntent}`);
        report.push(`   - Actual: ${result.actualIntent}`);
        report.push(`   - Confidence: ${(result.actualConfidence * 100).toFixed(2)}%`);
        report.push(`   - Category: ${result.testCase.category}`);
        if (result.error) {
          report.push(`   - Error: ${result.error}`);
        }
        report.push('');
      });
    }

    return report.join('\n');
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(results: TestResult[]): PerformanceMetrics {
    const totalTests = results.length;
    const passed = results.filter(r => r.passed).length;
    const overallAccuracy = totalTests > 0 ? passed / totalTests : 0;

    const confidenceThresholdMet = results.filter(r => r.confidenceMet).length;
    const confidenceRate = totalTests > 0 ? confidenceThresholdMet / totalTests : 0;

    const executionTimes = results.map(r => r.executionTime);
    const avgResponseTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    const maxResponseTime = Math.max(...executionTimes);
    const minResponseTime = Math.min(...executionTimes);

    const errors = results.filter(r => r.error).length;
    const errorRate = totalTests > 0 ? errors / totalTests : 0;

    return {
      totalTests,
      overallAccuracy,
      confidenceThresholdMet: confidenceRate,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      errorRate
    };
  }

  /**
   * Export results to JSON
   */
  exportResults(results: TestSuiteResult, filename?: string): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      results,
      metadata: {
        version: '1.0.0',
        totalTests: results.totalTests,
        accuracy: results.accuracy
      }
    };

    const jsonData = JSON.stringify(exportData, null, 2);

    if (filename && typeof window !== 'undefined') {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    return jsonData;
  }

  /**
   * Compare two test results
   */
  compareResults(before: TestSuiteResult, after: TestSuiteResult): {
    accuracyChange: number;
    confidenceChange: number;
    executionTimeChange: number;
    improvedIntents: string[];
    degradedIntents: string[];
  } {
    const accuracyChange = after.accuracy - before.accuracy;
    const confidenceChange = after.avgConfidence - before.avgConfidence;
    const executionTimeChange = after.avgExecutionTime - before.avgExecutionTime;

    const improvedIntents: string[] = [];
    const degradedIntents: string[] = [];

    Object.keys(before.intentBreakdown).forEach(intent => {
      const beforeAccuracy = before.intentBreakdown[intent]?.accuracy || 0;
      const afterAccuracy = after.intentBreakdown[intent]?.accuracy || 0;

      if (afterAccuracy > beforeAccuracy) {
        improvedIntents.push(intent);
      } else if (afterAccuracy < beforeAccuracy) {
        degradedIntents.push(intent);
      }
    });

    return {
      accuracyChange,
      confidenceChange,
      executionTimeChange,
      improvedIntents,
      degradedIntents
    };
  }
}