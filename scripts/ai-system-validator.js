#!/usr/bin/env node

/**
 * AI System Validation Script
 *
 * Performs comprehensive validation of the AI system including:
 * - Service availability checks
 * - Component integration validation
 * - Test coverage analysis
 * - Configuration verification
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class AISystemValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      components: {},
      services: {},
      tests: {},
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async validateAIServices() {
    this.log('Validating AI Services...', 'info');

    const aiServiceFiles = [
      'src/services/ai/aiServiceManager.ts',
      'src/services/ai/smartTaskPrioritizer.ts',
      'src/services/ai/productivityInsightsGenerator.ts',
      'src/services/ai/aiSystemValidator.ts'
    ];

    const serviceResults = {};

    for (const serviceFile of aiServiceFiles) {
      const fullPath = join(projectRoot, serviceFile);
      const serviceName = serviceFile.split('/').pop().replace('.ts', '');

      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');

          serviceResults[serviceName] = {
            exists: true,
            size: content.length,
            hasErrorHandling: content.includes('try') && content.includes('catch'),
            hasTypeDefinitions: content.includes('interface') || content.includes('type'),
            hasLogging: content.includes('console.') || content.includes('logger'),
            hasValidation: content.includes('validate') || content.includes('check'),
            score: 0
          };

          // Calculate service score
          let score = 0;
          if (serviceResults[serviceName].hasErrorHandling) score += 25;
          if (serviceResults[serviceName].hasTypeDefinitions) score += 25;
          if (serviceResults[serviceName].hasLogging) score += 25;
          if (serviceResults[serviceName].hasValidation) score += 25;
          serviceResults[serviceName].score = score;

          this.log(`${serviceName}: ${score}% (${score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Improvement'})`,
                   score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error');

        } catch (error) {
          serviceResults[serviceName] = {
            exists: true,
            error: error.message,
            score: 0
          };
          this.log(`Failed to analyze ${serviceName}: ${error.message}`, 'error');
        }
      } else {
        serviceResults[serviceName] = {
          exists: false,
          score: 0
        };
        this.log(`Service file not found: ${serviceFile}`, 'error');
      }
    }

    this.results.services = serviceResults;
    return serviceResults;
  }

  async validateAIComponents() {
    this.log('Validating AI Components...', 'info');

    const aiComponentFiles = [
      'src/components/ai/AISettingsDashboard.tsx',
      'src/components/ai/AISystemValidator.tsx',
      'src/components/ai/SmartRecommendations.tsx',
      'src/components/ai/ProductivityCoachAssistant.tsx',
      'src/components/widgets/SmartRecommendationsWidget.tsx'
    ];

    const componentResults = {};

    for (const componentFile of aiComponentFiles) {
      const fullPath = join(projectRoot, componentFile);
      const componentName = componentFile.split('/').pop().replace('.tsx', '');

      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');

          componentResults[componentName] = {
            exists: true,
            size: content.length,
            hasUseEffect: content.includes('useEffect'),
            hasErrorBoundary: content.includes('ErrorBoundary') || content.includes('try'),
            hasTypeScript: content.includes('interface') || content.includes('type'),
            hasAccessibility: content.includes('aria-') || content.includes('role='),
            hasTestId: content.includes('data-testid'),
            score: 0
          };

          // Calculate component score
          let score = 0;
          if (componentResults[componentName].hasUseEffect) score += 20;
          if (componentResults[componentName].hasErrorBoundary) score += 20;
          if (componentResults[componentName].hasTypeScript) score += 20;
          if (componentResults[componentName].hasAccessibility) score += 20;
          if (componentResults[componentName].hasTestId) score += 20;
          componentResults[componentName].score = score;

          this.log(`${componentName}: ${score}% (${score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'})`,
                   score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error');

        } catch (error) {
          componentResults[componentName] = {
            exists: true,
            error: error.message,
            score: 0
          };
          this.log(`Failed to analyze ${componentName}: ${error.message}`, 'error');
        }
      } else {
        componentResults[componentName] = {
          exists: false,
          score: 0
        };
        this.log(`Component file not found: ${componentFile}`, 'error');
      }
    }

    this.results.components = componentResults;
    return componentResults;
  }

  async runAITests() {
    this.log('Running AI Tests...', 'info');

    const testResults = {
      integration: { passed: 0, failed: 0, total: 0 },
      component: { passed: 0, failed: 0, total: 0 },
      overall: { passed: 0, failed: 0, total: 0 }
    };

    try {
      // Run AI integration tests
      this.log('Running AI integration tests...', 'info');
      const integrationResult = execSync(
        'npm run test:run -- src/__tests__/integration/ai/AIServiceIntegration.test.ts --reporter=json',
        {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );

      // Parse integration test results
      const integrationData = JSON.parse(integrationResult);
      testResults.integration.total = integrationData.testResults[0]?.numPassingTests + integrationData.testResults[0]?.numFailingTests || 0;
      testResults.integration.passed = integrationData.testResults[0]?.numPassingTests || 0;
      testResults.integration.failed = integrationData.testResults[0]?.numFailingTests || 0;

    } catch (error) {
      this.log('AI integration tests failed to run completely', 'warning');
      // Try to extract partial results from error output
      if (error.stdout) {
        const output = error.stdout.toString();
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        if (passedMatch) testResults.integration.passed = parseInt(passedMatch[1]);
        if (failedMatch) testResults.integration.failed = parseInt(failedMatch[1]);
        testResults.integration.total = testResults.integration.passed + testResults.integration.failed;
      }
    }

    try {
      // Run AI component tests
      this.log('Running AI component tests...', 'info');
      const componentResult = execSync(
        'npm run test:run -- src/components/ai/AISettingsDashboard.test.tsx --reporter=json',
        {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );

      // Parse component test results
      const componentData = JSON.parse(componentResult);
      testResults.component.total = componentData.testResults[0]?.numPassingTests + componentData.testResults[0]?.numFailingTests || 0;
      testResults.component.passed = componentData.testResults[0]?.numPassingTests || 0;
      testResults.component.failed = componentData.testResults[0]?.numFailingTests || 0;

    } catch (error) {
      this.log('AI component tests failed to run completely', 'warning');
      // Try to extract partial results from error output
      if (error.stdout) {
        const output = error.stdout.toString();
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        if (passedMatch) testResults.component.passed = parseInt(passedMatch[1]);
        if (failedMatch) testResults.component.failed = parseInt(failedMatch[1]);
        testResults.component.total = testResults.component.passed + testResults.component.failed;
      }
    }

    // Calculate overall test results
    testResults.overall.passed = testResults.integration.passed + testResults.component.passed;
    testResults.overall.failed = testResults.integration.failed + testResults.component.failed;
    testResults.overall.total = testResults.overall.passed + testResults.overall.failed;

    const overallPassRate = testResults.overall.total > 0
      ? Math.round((testResults.overall.passed / testResults.overall.total) * 100)
      : 0;

    this.log(`Test Results Summary:`, 'info');
    this.log(`  Integration: ${testResults.integration.passed}/${testResults.integration.total} (${Math.round((testResults.integration.passed / Math.max(testResults.integration.total, 1)) * 100)}%)`,
             testResults.integration.passed > testResults.integration.failed ? 'success' : 'warning');
    this.log(`  Component: ${testResults.component.passed}/${testResults.component.total} (${Math.round((testResults.component.passed / Math.max(testResults.component.total, 1)) * 100)}%)`,
             testResults.component.passed > testResults.component.failed ? 'success' : 'warning');
    this.log(`  Overall: ${testResults.overall.passed}/${testResults.overall.total} (${overallPassRate}%)`,
             overallPassRate >= 70 ? 'success' : overallPassRate >= 50 ? 'warning' : 'error');

    this.results.tests = testResults;
    return testResults;
  }

  generateRecommendations() {
    this.log('Generating Recommendations...', 'info');

    const recommendations = [];

    // Service recommendations
    const serviceScores = Object.values(this.results.services).map(s => s.score || 0);
    const avgServiceScore = serviceScores.length > 0 ? serviceScores.reduce((a, b) => a + b, 0) / serviceScores.length : 0;

    if (avgServiceScore < 75) {
      recommendations.push({
        category: 'Services',
        priority: 'High',
        description: 'AI services need improved error handling and validation',
        action: 'Add comprehensive try-catch blocks and input validation to all AI services'
      });
    }

    // Component recommendations
    const componentScores = Object.values(this.results.components).map(c => c.score || 0);
    const avgComponentScore = componentScores.length > 0 ? componentScores.reduce((a, b) => a + b, 0) / componentScores.length : 0;

    if (avgComponentScore < 80) {
      recommendations.push({
        category: 'Components',
        priority: 'Medium',
        description: 'AI components need better accessibility and error boundaries',
        action: 'Add aria labels, error boundaries, and test IDs to AI components'
      });
    }

    // Test recommendations
    const testPassRate = this.results.tests.overall.total > 0
      ? (this.results.tests.overall.passed / this.results.tests.overall.total) * 100
      : 0;

    if (testPassRate < 70) {
      recommendations.push({
        category: 'Testing',
        priority: 'High',
        description: 'AI test coverage is insufficient',
        action: 'Fix failing tests and add missing test scenarios for AI services'
      });
    }

    // Integration recommendations
    if (this.results.tests.integration.failed > this.results.tests.integration.passed) {
      recommendations.push({
        category: 'Integration',
        priority: 'Critical',
        description: 'AI service integration is failing',
        action: 'Fix database mocking issues and API key configuration in tests'
      });
    }

    this.results.recommendations = recommendations;
    return recommendations;
  }

  calculateOverallScore() {
    const serviceScores = Object.values(this.results.services).map(s => s.score || 0);
    const componentScores = Object.values(this.results.components).map(c => c.score || 0);
    const testPassRate = this.results.tests.overall.total > 0
      ? (this.results.tests.overall.passed / this.results.tests.overall.total) * 100
      : 0;

    const avgServiceScore = serviceScores.length > 0 ? serviceScores.reduce((a, b) => a + b, 0) / serviceScores.length : 0;
    const avgComponentScore = componentScores.length > 0 ? componentScores.reduce((a, b) => a + b, 0) / componentScores.length : 0;

    // Weighted average: Services (40%), Components (30%), Tests (30%)
    const overallScore = Math.round(
      (avgServiceScore * 0.4) + (avgComponentScore * 0.3) + (testPassRate * 0.3)
    );

    this.results.overallScore = overallScore;
    return overallScore;
  }

  async generateReport() {
    this.log('AI System Validation Complete!', 'success');
    this.log('='.repeat(50), 'info');

    const overallScore = this.calculateOverallScore();

    console.log('\n📊 AI SYSTEM HEALTH REPORT');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${overallScore}/100 ${this.getScoreEmoji(overallScore)}`);
    console.log(`Timestamp: ${this.results.timestamp}`);

    console.log('\n🔧 Services:');
    Object.entries(this.results.services).forEach(([name, data]) => {
      console.log(`  ${name}: ${data.score}% ${this.getScoreEmoji(data.score)}`);
    });

    console.log('\n🎨 Components:');
    Object.entries(this.results.components).forEach(([name, data]) => {
      console.log(`  ${name}: ${data.score}% ${this.getScoreEmoji(data.score)}`);
    });

    console.log('\n🧪 Tests:');
    console.log(`  Integration: ${this.results.tests.integration.passed}/${this.results.tests.integration.total}`);
    console.log(`  Component: ${this.results.tests.component.passed}/${this.results.tests.component.total}`);
    console.log(`  Overall: ${this.results.tests.overall.passed}/${this.results.tests.overall.total}`);

    console.log('\n💡 Recommendations:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.priority}] ${rec.description}`);
      console.log(`     Action: ${rec.action}`);
    });

    // Save detailed report
    const reportPath = join(projectRoot, 'tests/ai-validation-results.json');
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return this.results;
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  }

  async run() {
    try {
      console.log('🤖 Starting AI System Validation...\n');

      await this.validateAIServices();
      await this.validateAIComponents();
      await this.runAITests();
      this.generateRecommendations();
      await this.generateReport();

      return this.results;
    } catch (error) {
      this.log(`Validation failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AISystemValidator();
  validator.run().catch(console.error);
}

export default AISystemValidator;