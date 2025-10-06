#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ProductionReadinessReporter {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categories: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        criticalFailures: 0
      },
      recommendations: [],
      deploymentApproval: false
    };

    this.categories = [
      { name: 'Security', weight: 25, critical: true, dir: '01-security' },
      { name: 'Performance & Scalability', weight: 20, critical: true, dir: '02-scalability-performance' },
      { name: 'Reliability & Availability', weight: 20, critical: true, dir: '03-reliability-availability' },
      { name: 'Compliance & Legal', weight: 15, critical: false, dir: '04-compliance-legal' },
      { name: 'UX & Usability', weight: 10, critical: false, dir: '05-ux-usability' },
      { name: 'DevOps & Maintainability', weight: 5, critical: false, dir: '06-devops-maintainability' },
      { name: 'Data Management', weight: 3, critical: false, dir: '07-data-management' },
      { name: 'Integration & Extensibility', weight: 2, critical: false, dir: '08-integration-extensibility' }
    ];

    this.thresholds = {
      deployment: {
        overallScore: 85,
        criticalScore: 95,
        maxCriticalFailures: 0
      },
      scoring: {
        excellent: 95,
        good: 85,
        acceptable: 70,
        poor: 50
      }
    };
  }

  async generateReport() {
    console.log('🚀 Generating Production Readiness Report...\n');

    try {
      await this.runAllTests();
      await this.calculateScores();
      await this.generateRecommendations();
      await this.determineDeploymentApproval();
      await this.exportReport();

      this.printSummary();

    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      process.exit(1);
    }
  }

  async runAllTests() {
    console.log('📋 Running production readiness tests...\n');

    for (const category of this.categories) {
      console.log(`Testing ${category.name}...`);

      try {
        const testCommand = `npx playwright test src/test/production-readiness/${category.dir}/ --config=src/test/production-readiness/config/production-readiness.config.ts --reporter=json`;

        const { stdout, stderr } = await execAsync(testCommand, {
          timeout: 300000, // 5 minutes per category
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        const testResults = JSON.parse(stdout);
        this.processCategoryResults(category, testResults);

      } catch (error) {
        // Handle test failures
        if (error.stdout) {
          try {
            const testResults = JSON.parse(error.stdout);
            this.processCategoryResults(category, testResults);
          } catch (parseError) {
            this.handleCategoryError(category, error);
          }
        } else {
          this.handleCategoryError(category, error);
        }
      }
    }
  }

  processCategoryResults(category, testResults) {
    const stats = testResults.stats || {};

    const categoryResult = {
      name: category.name,
      weight: category.weight,
      critical: category.critical,
      totalTests: stats.total || 0,
      passedTests: stats.passed || 0,
      failedTests: stats.failed || 0,
      skippedTests: stats.skipped || 0,
      duration: stats.duration || 0,
      score: 0,
      issues: [],
      details: testResults.suites || []
    };

    // Calculate category score
    if (categoryResult.totalTests > 0) {
      const passRate = categoryResult.passedTests / categoryResult.totalTests;
      categoryResult.score = Math.round(passRate * 100);
    }

    // Extract issues from failed tests
    if (testResults.suites) {
      testResults.suites.forEach(suite => {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (spec.tests) {
              spec.tests.forEach(test => {
                if (test.status === 'failed') {
                  categoryResult.issues.push({
                    test: test.title,
                    suite: suite.title,
                    error: test.error?.message || 'Unknown error'
                  });
                }
              });
            }
          });
        }
      });
    }

    // Track critical failures
    if (category.critical && categoryResult.failedTests > 0) {
      this.results.summary.criticalFailures += categoryResult.failedTests;
    }

    this.results.categories[category.name] = categoryResult;
    this.results.summary.totalTests += categoryResult.totalTests;
    this.results.summary.passedTests += categoryResult.passedTests;
    this.results.summary.failedTests += categoryResult.failedTests;
    this.results.summary.skippedTests += categoryResult.skippedTests;

    console.log(`  ✓ ${category.name}: ${categoryResult.passedTests}/${categoryResult.totalTests} passed (${categoryResult.score}%)`);
  }

  handleCategoryError(category, error) {
    console.log(`  ❌ ${category.name}: Failed to run tests`);

    const categoryResult = {
      name: category.name,
      weight: category.weight,
      critical: category.critical,
      totalTests: 0,
      passedTests: 0,
      failedTests: 1,
      skippedTests: 0,
      duration: 0,
      score: 0,
      issues: [{
        test: 'Test Execution',
        suite: 'Test Runner',
        error: error.message
      }],
      details: []
    };

    if (category.critical) {
      this.results.summary.criticalFailures += 1;
    }

    this.results.categories[category.name] = categoryResult;
    this.results.summary.failedTests += 1;
  }

  async calculateScores() {
    let weightedScore = 0;
    let totalWeight = 0;

    Object.values(this.results.categories).forEach(category => {
      weightedScore += category.score * category.weight;
      totalWeight += category.weight;
    });

    this.results.overallScore = Math.round(weightedScore / totalWeight);
  }

  async generateRecommendations() {
    const recommendations = [];

    // Check overall score
    if (this.results.overallScore < this.thresholds.deployment.overallScore) {
      recommendations.push({
        priority: 'high',
        category: 'Overall',
        issue: `Overall score (${this.results.overallScore}%) below deployment threshold (${this.thresholds.deployment.overallScore}%)`,
        action: 'Address failing tests before deployment'
      });
    }

    // Check critical categories
    Object.values(this.results.categories).forEach(category => {
      if (category.critical && category.score < this.thresholds.deployment.criticalScore) {
        recommendations.push({
          priority: 'critical',
          category: category.name,
          issue: `Critical category score (${category.score}%) below threshold (${this.thresholds.deployment.criticalScore}%)`,
          action: `Fix all failures in ${category.name} category`
        });
      }

      // Check for specific issues
      if (category.failedTests > 0) {
        const priority = category.critical ? 'critical' : 'medium';
        recommendations.push({
          priority,
          category: category.name,
          issue: `${category.failedTests} failed tests`,
          action: `Review and fix failed tests: ${category.issues.slice(0, 3).map(i => i.test).join(', ')}${category.issues.length > 3 ? '...' : ''}`
        });
      }
    });

    // Performance recommendations
    const performanceCategory = this.results.categories['Performance & Scalability'];
    if (performanceCategory && performanceCategory.score < 90) {
      recommendations.push({
        priority: 'medium',
        category: 'Performance & Scalability',
        issue: 'Performance optimizations needed',
        action: 'Review Core Web Vitals, optimize bundle size, implement caching'
      });
    }

    // Security recommendations
    const securityCategory = this.results.categories['Security'];
    if (securityCategory && securityCategory.failedTests > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Security',
        issue: 'Security vulnerabilities detected',
        action: 'Immediate security review and fixes required before deployment'
      });
    }

    this.results.recommendations = recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async determineDeploymentApproval() {
    const conditions = [
      this.results.overallScore >= this.thresholds.deployment.overallScore,
      this.results.summary.criticalFailures <= this.thresholds.deployment.maxCriticalFailures
    ];

    // Check critical categories
    const criticalCategoriesPass = this.categories
      .filter(cat => cat.critical)
      .every(cat => {
        const categoryResult = this.results.categories[cat.name];
        return categoryResult && categoryResult.score >= this.thresholds.deployment.criticalScore;
      });

    this.results.deploymentApproval = conditions.every(c => c) && criticalCategoriesPass;
  }

  async exportReport() {
    const reportDir = path.join(process.cwd(), 'test-results', 'production-readiness');
    await fs.mkdir(reportDir, { recursive: true });

    // JSON Report
    const jsonReportPath = path.join(reportDir, `production-readiness-${Date.now()}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify(this.results, null, 2));

    // HTML Report
    const htmlReport = this.generateHTMLReport();
    const htmlReportPath = path.join(reportDir, `production-readiness-${Date.now()}.html`);
    await fs.writeFile(htmlReportPath, htmlReport);

    // Markdown Report
    const markdownReport = this.generateMarkdownReport();
    const mdReportPath = path.join(reportDir, `production-readiness-${Date.now()}.md`);
    await fs.writeFile(mdReportPath, markdownReport);

    console.log(`\n📊 Reports generated:`);
    console.log(`  JSON: ${jsonReportPath}`);
    console.log(`  HTML: ${htmlReportPath}`);
    console.log(`  Markdown: ${mdReportPath}`);
  }

  generateHTMLReport() {
    const scoreColor = (score) => {
      if (score >= 95) return '#22c55e';
      if (score >= 85) return '#84cc16';
      if (score >= 70) return '#f59e0b';
      return '#ef4444';
    };

    const categoriesHTML = Object.values(this.results.categories)
      .map(cat => `
        <div class="category">
          <h3>${cat.name} <span class="score" style="color: ${scoreColor(cat.score)}">${cat.score}%</span></h3>
          <div class="category-stats">
            <span>Tests: ${cat.passedTests}/${cat.totalTests}</span>
            <span>Weight: ${cat.weight}%</span>
            ${cat.critical ? '<span class="critical">Critical</span>' : ''}
          </div>
          ${cat.issues.length > 0 ? `
            <div class="issues">
              <h4>Issues:</h4>
              <ul>
                ${cat.issues.slice(0, 5).map(issue => `<li>${issue.test}: ${issue.error}</li>`).join('')}
                ${cat.issues.length > 5 ? `<li>... and ${cat.issues.length - 5} more</li>` : ''}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('');

    const recommendationsHTML = this.results.recommendations
      .slice(0, 10)
      .map(rec => `
        <div class="recommendation ${rec.priority}">
          <strong>${rec.category}</strong>: ${rec.issue}
          <br><em>Action: ${rec.action}</em>
        </div>
      `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Production Readiness Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .overall-score { font-size: 3em; font-weight: bold; color: ${scoreColor(this.results.overallScore)}; }
        .approval { padding: 20px; border-radius: 8px; text-align: center; font-weight: bold; margin: 20px 0; }
        .approved { background: #dcfce7; color: #166534; }
        .rejected { background: #fef2f2; color: #dc2626; }
        .category { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .category h3 { margin: 0 0 10px 0; display: flex; justify-content: space-between; }
        .category-stats { display: flex; gap: 20px; margin-bottom: 15px; }
        .critical { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; }
        .score { font-weight: bold; }
        .issues { margin-top: 15px; }
        .issues ul { margin: 5px 0; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 8px; }
        .recommendation.critical { background: #fef2f2; border-left: 4px solid #dc2626; }
        .recommendation.high { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .recommendation.medium { background: #f0f9ff; border-left: 4px solid #3b82f6; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat { text-align: center; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .stat-value { font-size: 2em; font-weight: bold; color: #1f2937; }
        .stat-label { color: #6b7280; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Production Readiness Report</h1>
        <div class="overall-score">${this.results.overallScore}%</div>
        <p>Generated on ${new Date(this.results.timestamp).toLocaleString()}</p>

        <div class="approval ${this.results.deploymentApproval ? 'approved' : 'rejected'}">
            ${this.results.deploymentApproval ? '✅ APPROVED FOR DEPLOYMENT' : '❌ NOT READY FOR DEPLOYMENT'}
        </div>
    </div>

    <div class="summary">
        <div class="stat">
            <div class="stat-value">${this.results.summary.totalTests}</div>
            <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat">
            <div class="stat-value">${this.results.summary.passedTests}</div>
            <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
            <div class="stat-value">${this.results.summary.failedTests}</div>
            <div class="stat-label">Failed</div>
        </div>
        <div class="stat">
            <div class="stat-value">${this.results.summary.criticalFailures}</div>
            <div class="stat-label">Critical Failures</div>
        </div>
    </div>

    <h2>Category Results</h2>
    ${categoriesHTML}

    <h2>Recommendations</h2>
    ${recommendationsHTML}
</body>
</html>
    `;
  }

  generateMarkdownReport() {
    const categoryTable = Object.values(this.results.categories)
      .map(cat => `| ${cat.name} | ${cat.score}% | ${cat.passedTests}/${cat.totalTests} | ${cat.critical ? '🔴' : '🟢'} | ${cat.failedTests} |`)
      .join('\n');

    const recommendations = this.results.recommendations
      .slice(0, 10)
      .map((rec, i) => `${i + 1}. **${rec.priority.toUpperCase()}** - ${rec.category}: ${rec.issue}\n   - *Action*: ${rec.action}`)
      .join('\n\n');

    return `# Production Readiness Report

**Overall Score: ${this.results.overallScore}%**

**Deployment Status:** ${this.results.deploymentApproval ? '✅ APPROVED' : '❌ NOT READY'}

*Generated on ${new Date(this.results.timestamp).toLocaleString()}*

## Summary

- **Total Tests:** ${this.results.summary.totalTests}
- **Passed:** ${this.results.summary.passedTests}
- **Failed:** ${this.results.summary.failedTests}
- **Skipped:** ${this.results.summary.skippedTests}
- **Critical Failures:** ${this.results.summary.criticalFailures}

## Category Results

| Category | Score | Tests | Critical | Failures |
|----------|-------|-------|----------|----------|
${categoryTable}

## Top Recommendations

${recommendations}

## Deployment Criteria

- ✅ Overall Score ≥ 85%: ${this.results.overallScore >= 85 ? 'PASS' : 'FAIL'}
- ✅ Critical Failures = 0: ${this.results.summary.criticalFailures === 0 ? 'PASS' : 'FAIL'}
- ✅ Critical Categories ≥ 95%: ${this.checkCriticalCategories() ? 'PASS' : 'FAIL'}

---

*This report was automatically generated by the Production Readiness Test Suite*
`;
  }

  checkCriticalCategories() {
    return this.categories
      .filter(cat => cat.critical)
      .every(cat => {
        const categoryResult = this.results.categories[cat.name];
        return categoryResult && categoryResult.score >= 95;
      });
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PRODUCTION READINESS REPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`🎯 Overall Score: ${this.results.overallScore}%`);
    console.log(`📋 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passedTests}`);
    console.log(`❌ Failed: ${this.results.summary.failedTests}`);
    console.log(`🔥 Critical Failures: ${this.results.summary.criticalFailures}`);
    console.log();

    // Category breakdown
    console.log('📁 CATEGORY BREAKDOWN:');
    Object.values(this.results.categories).forEach(cat => {
      const icon = cat.score >= 95 ? '🟢' : cat.score >= 85 ? '🟡' : '🔴';
      const critical = cat.critical ? '[CRITICAL]' : '';
      console.log(`${icon} ${cat.name} ${critical}: ${cat.score}% (${cat.passedTests}/${cat.totalTests})`);
    });
    console.log();

    // Deployment decision
    console.log('🚀 DEPLOYMENT DECISION:');
    if (this.results.deploymentApproval) {
      console.log('✅ APPROVED FOR PRODUCTION DEPLOYMENT');
      console.log('   All criteria met. Ready to deploy!');
    } else {
      console.log('❌ NOT READY FOR DEPLOYMENT');
      console.log('   The following issues must be resolved:');

      this.results.recommendations
        .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
        .slice(0, 5)
        .forEach(rec => {
          console.log(`   • ${rec.category}: ${rec.issue}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 Run individual test suites:');
    console.log('   npm run test:production-readiness:security');
    console.log('   npm run test:production-readiness:performance');
    console.log('   npm run test:production-readiness:reliability');
    console.log('   npm run test:production-readiness:full');
    console.log('='.repeat(80));

    // Exit with appropriate code
    process.exit(this.results.deploymentApproval ? 0 : 1);
  }
}

// Run the report generator
if (require.main === module) {
  const reporter = new ProductionReadinessReporter();
  reporter.generateReport().catch(error => {
    console.error('Failed to generate report:', error);
    process.exit(1);
  });
}

module.exports = ProductionReadinessReporter;