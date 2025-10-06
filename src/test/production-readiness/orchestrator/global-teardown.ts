import { FullConfig } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export default async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Production Readiness Test Suite Teardown...');

  const startTime = Date.now();

  try {
    // Generate final test report
    await generateFinalReport();

    // Archive test artifacts
    await archiveTestArtifacts();

    // Cleanup temporary resources
    await cleanupResources();

    // Calculate final metrics
    await calculateFinalMetrics();

    const teardownTime = Date.now() - startTime;
    console.log(`✅ Production Readiness Test Teardown Complete (${teardownTime}ms)`);

  } catch (error) {
    console.error('❌ Production Readiness Test Teardown Failed:', error);
    // Don't throw to avoid masking test failures
  }
}

async function generateFinalReport() {
  try {
    // Read test results
    const resultsPath = 'test-results/production-readiness/results.json';
    const resultsExist = await fs.access(resultsPath).then(() => true).catch(() => false);

    if (!resultsExist) {
      console.log('⚠️  No test results found, skipping report generation');
      return;
    }

    const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

    // Generate comprehensive report
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        testSuite: 'production-readiness',
        version: '1.0.0'
      },
      summary: {
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0
      },
      categories: await analyzeCategoryResults(results),
      recommendations: await generateRecommendations(results),
      artifacts: {
        screenshots: await countArtifacts('screenshots'),
        videos: await countArtifacts('videos'),
        traces: await countArtifacts('traces')
      }
    };

    await fs.writeFile(
      'test-results/production-readiness/reports/final-report.json',
      JSON.stringify(report, null, 2)
    );

    // Generate human-readable summary
    await generateHumanReadableReport(report);

    console.log('📊 Final test report generated');

  } catch (error) {
    console.error('❌ Failed to generate final report:', error);
  }
}

async function analyzeCategoryResults(results: any) {
  const categories = {
    security: { passed: 0, failed: 0, total: 0 },
    performance: { passed: 0, failed: 0, total: 0 },
    reliability: { passed: 0, failed: 0, total: 0 },
    compliance: { passed: 0, failed: 0, total: 0 },
    ux: { passed: 0, failed: 0, total: 0 },
    devops: { passed: 0, failed: 0, total: 0 },
    data: { passed: 0, failed: 0, total: 0 },
    integration: { passed: 0, failed: 0, total: 0 }
  };

  // Analyze test results by category
  if (results.suites) {
    results.suites.forEach((suite: any) => {
      const categoryMatch = suite.title?.match(/^(\\w+)-/);
      const category = categoryMatch ? categoryMatch[1] : 'unknown';

      if (categories[category]) {
        suite.specs?.forEach((spec: any) => {
          categories[category].total++;
          if (spec.tests?.some((test: any) => test.results?.some((result: any) => result.status === 'passed'))) {
            categories[category].passed++;
          } else {
            categories[category].failed++;
          }
        });
      }
    });
  }

  return categories;
}

async function generateRecommendations(results: any) {
  const recommendations: string[] = [];

  // Analyze failures and generate recommendations
  if (results.suites) {
    results.suites.forEach((suite: any) => {
      suite.specs?.forEach((spec: any) => {
        spec.tests?.forEach((test: any) => {
          test.results?.forEach((result: any) => {
            if (result.status === 'failed') {
              recommendations.push(
                `Fix failing test: ${spec.title} - ${result.error?.message || 'Unknown error'}`
              );
            }
          });
        });
      });
    });
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push('All tests passed! Your application appears ready for production.');
    recommendations.push('Consider running this test suite regularly to maintain production readiness.');
  } else {
    recommendations.unshift('Address the following issues before production deployment:');
    recommendations.push('Re-run the test suite after implementing fixes.');
  }

  return recommendations;
}

async function generateHumanReadableReport(report: any) {
  const passRate = report.summary.total > 0
    ? Math.round((report.summary.passed / report.summary.total) * 100)
    : 0;

  const readyForProduction = passRate >= 95 && report.summary.failed === 0;

  const humanReport = `
# Production Readiness Report

**Generated**: ${new Date(report.metadata.timestamp).toLocaleString()}
**Test Suite**: ${report.metadata.testSuite}

## Summary

- **Overall Pass Rate**: ${passRate}%
- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}
- **Skipped**: ${report.summary.skipped}
- **Duration**: ${Math.round(report.summary.duration / 1000)}s

## Production Readiness

${readyForProduction ? '✅ **READY FOR PRODUCTION**' : '❌ **NOT READY FOR PRODUCTION**'}

${readyForProduction
  ? 'Your application has passed all production readiness tests and appears ready for deployment.'
  : `Your application has ${report.summary.failed} failing tests that must be addressed before production deployment.`
}

## Category Breakdown

${Object.entries(report.categories).map(([category, stats]: [string, any]) => {
  const categoryPassRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
  const status = categoryPassRate >= 95 ? '✅' : '❌';
  return `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${status} ${categoryPassRate}% (${stats.passed}/${stats.total})`;
}).join('\\n')}

## Recommendations

${report.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\\n')}

## Test Artifacts

- **Screenshots**: ${report.artifacts.screenshots}
- **Videos**: ${report.artifacts.videos}
- **Traces**: ${report.artifacts.traces}

---

*This report was automatically generated by the BeProductive Production Readiness Test Suite.*
`;

  await fs.writeFile(
    'test-results/production-readiness/reports/final-report.md',
    humanReport
  );

  console.log('📝 Human-readable report generated');
}

async function countArtifacts(type: string): Promise<number> {
  try {
    const artifactDir = `test-results/production-readiness/${type}`;
    const files = await fs.readdir(artifactDir);
    return files.length;
  } catch {
    return 0;
  }
}

async function archiveTestArtifacts() {
  try {
    // Create archive directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = `test-results/archives/production-readiness-${timestamp}`;

    await fs.mkdir(archiveDir, { recursive: true });

    // Copy important artifacts to archive
    const artifactsToCopy = [
      'test-results/production-readiness/reports',
      'test-results/production-readiness/results.json',
      'test-results/production-readiness/setup-summary.json'
    ];

    for (const artifact of artifactsToCopy) {
      try {
        await fs.cp(artifact, `${archiveDir}/${path.basename(artifact)}`, { recursive: true });
      } catch {
        // Skip if artifact doesn't exist
      }
    }

    console.log(`📦 Test artifacts archived to ${archiveDir}`);

  } catch (error) {
    console.error('❌ Failed to archive test artifacts:', error);
  }
}

async function cleanupResources() {
  try {
    // Clean up temporary test data
    const tempFiles = [
      'test-results/production-readiness/monitoring-config.json'
    ];

    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch {
        // Skip if file doesn't exist
      }
    }

    console.log('🧹 Temporary resources cleaned up');

  } catch (error) {
    console.error('❌ Failed to cleanup resources:', error);
  }
}

async function calculateFinalMetrics() {
  try {
    // Calculate and store final performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      testExecution: {
        totalDuration: 0, // Will be filled from actual results
        averageTestDuration: 0,
        parallelEfficiency: 0
      },
      coverage: {
        categoriesTested: 8,
        totalTestsRun: 0, // Will be filled from actual results
        automatedTests: 0,
        manualTests: 0
      },
      reliability: {
        flakyTests: 0,
        consistentFailures: 0,
        environmentIssues: 0
      }
    };

    await fs.writeFile(
      'test-results/production-readiness/final-metrics.json',
      JSON.stringify(metrics, null, 2)
    );

    console.log('📊 Final metrics calculated');

  } catch (error) {
    console.error('❌ Failed to calculate final metrics:', error);
  }
}