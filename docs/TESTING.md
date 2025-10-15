# Testing Guide

This document outlines the unified testing strategy for the BeProductive v2 application, built around simplified commands and intelligent automation.

## 🚀 Quick Start

### Essential Commands

```bash
# Run all tests (unit + e2e + performance)
npm test

# Quick validation (lint + types + unit tests)
npm run test:quick

# CI pipeline tests (lint + types + unit + e2e)
npm run test:ci

# Quality gates (all validation checks)
npm run gates:check
```

### Development Workflow

```bash
# Watch mode for active development
npm run test:watch

# Unit tests with coverage
npm run test:coverage

# E2E tests only
npm run test:e2e

# Performance testing
npm run test:performance
```

## 📋 Test Suites

### 1. Unit Tests (`npm run test:unit`)
- **Framework**: Vitest + Testing Library
- **Coverage**: 83% current target
- **Location**: `src/**/*.test.{ts,tsx}`
- **Focus**: Component logic, utility functions, hooks

### 2. E2E Tests (`npm run test:e2e`)
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Location**: `tests/e2e/`
- **Focus**: User workflows, integration scenarios

### 3. Performance Tests (`npm run test:performance`)
- **Framework**: Playwright + Web Vitals
- **Metrics**: LCP, FID, CLS, TTFB
- **Location**: `tests/performance/`
- **Focus**: Loading times, Core Web Vitals

### 4. Production Readiness (`npm run test:production`)
- **Framework**: Custom orchestrator
- **Coverage**: Security, compliance, reliability
- **Location**: `src/test/production-readiness/`
- **Focus**: Production deployment validation

### 5. Security Tests (`npm run test:security`)
- **Framework**: Playwright + Custom scanners
- **Coverage**: XSS, CSRF, dependency vulnerabilities
- **Location**: `src/test/production-readiness/01-security/`
- **Focus**: Security compliance and vulnerability assessment

## 🎯 Quality Gates

The quality gate system validates code readiness through automated checks:

```bash
# Run all quality gates
npm run gates:check

# Strict mode (fail on any gate failure)
npm run gates:check -- --strict

# Skip specific checks
npm run gates:check -- --skip-tests --skip-bundle
```

### Gate Validation Steps

1. **Linting** - ESLint code quality rules
2. **TypeScript** - Type checking and compilation
3. **Tests & Coverage** - Unit tests with coverage threshold
4. **Bundle Size** - Build output size analysis
5. **Code Quality** - Complexity and maintainability metrics

### Configurable Thresholds

Set via environment variables:

```bash
COVERAGE_THRESHOLD=80      # Minimum test coverage %
BUNDLE_SIZE_LIMIT=500      # Maximum bundle size (KB)
QUALITY_THRESHOLD=80       # Minimum code quality score
```

## 🔧 Configuration

### Test Runner Options

The unified test runner supports multiple options:

```bash
# Parallel execution
npm test -- --parallel

# Verbose output
npm test -- --verbose

# Fail fast (stop on first failure)
npm test -- --fail-fast

# Watch mode
npm run test:unit -- --watch

# Coverage reporting
npm run test:unit -- --coverage
```

### Environment Variables

```bash
# Global test configuration
VERBOSE=true          # Detailed logging
PARALLEL=true         # Enable parallel execution
FAIL_FAST=true        # Stop on first failure

# Quality thresholds
COVERAGE_THRESHOLD=80
BUNDLE_SIZE_LIMIT=500
QUALITY_THRESHOLD=80

# CI/CD specific
CI=true               # CI environment detection
STRICT=true           # Strict validation mode
```

## 📊 Test Reports

### Report Locations

- **Unit Tests**: `coverage/` directory
- **E2E Tests**: `test-results/` directory
- **Performance**: `test-results/performance-report/`
- **Quality Gate**: `quality-gate-report.json`
- **Production Readiness**: `production-readiness-report/`

### Report Formats

- **JSON**: Machine-readable for CI/CD integration
- **HTML**: Interactive reports with charts
- **Console**: Real-time feedback during execution
- **Markdown**: Human-readable summaries

## 🚦 CI/CD Integration

### GitHub Actions Integration

The testing system integrates seamlessly with the optimized CI pipeline:

```yaml
# PR Validation (Fast)
- name: Quick Quality Check
  run: npm run test:quick

- name: E2E Tests (Chromium only)
  run: npm run test:e2e -- --project=chromium

# Main/Develop Branch (Comprehensive)
- name: Full Quality Gates
  run: npm run gates:check

- name: Cross-browser E2E
  run: npm run test:e2e
```

### Cost Optimization

- **PR validation**: Fast checks only (~3 minutes)
- **Main branch**: Full cross-browser validation (~12 minutes)
- **Parallel execution**: Reduces total pipeline time by 70%
- **Smart caching**: Dependency and build artifact caching

## 🧪 Writing Tests

### Unit Test Example

```typescript
// src/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('displays task title and description', () => {
    const task = {
      id: '1',
      title: 'Complete project',
      description: 'Finish the final implementation'
    };

    render(<TaskCard task={task} />);

    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Finish the final implementation')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and complete a task', async ({ page }) => {
  await page.goto('/app/capture');

  // Create task
  await page.fill('[data-testid="task-title"]', 'New Task');
  await page.click('[data-testid="create-task"]');

  // Complete task
  await page.click('[data-testid="task-checkbox"]');

  await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();
});
```

### Performance Test Example

```typescript
// tests/performance/web-vitals.spec.ts
import { test } from '@playwright/test';
import { injectWebVitals, reportWebVitals } from '../utils/web-vitals';

test('Core Web Vitals meet thresholds', async ({ page }) => {
  await injectWebVitals(page);
  await page.goto('/');

  const vitals = await reportWebVitals(page);

  expect(vitals.LCP).toBeLessThan(2500); // 2.5s
  expect(vitals.FID).toBeLessThan(100);  // 100ms
  expect(vitals.CLS).toBeLessThan(0.1);  // 0.1
});
```

## 🔍 Debugging Tests

### Local Debugging

```bash
# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Open Playwright UI for debugging
npm run test:e2e -- --ui

# Debug specific test file
npm run test:e2e -- tests/e2e/task-management.spec.ts --debug

# Run single unit test
npm run test:unit -- --run TaskCard.test.tsx
```

### CI Debugging

- **Artifacts**: Test reports and screenshots saved in CI
- **Video recording**: Available for failed E2E tests
- **Verbose logs**: Enable with `--verbose` flag
- **Trace files**: Playwright trace files for detailed debugging

## 📈 Performance Optimization

### Test Execution Speed

- **Parallel execution**: Run compatible tests simultaneously
- **Test sharding**: Split large test suites across workers
- **Smart retries**: Retry flaky tests automatically
- **Cache optimization**: Reuse build artifacts and dependencies

### Resource Management

- **Browser instances**: Efficient browser lifecycle management
- **Memory usage**: Monitor and optimize test memory consumption
- **Cleanup**: Proper test isolation and cleanup
- **Timeouts**: Appropriate timeouts for different test types

## 🛠 Migration from Legacy Scripts

### Before (20+ scripts)
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:performance:vitals
npm run test:performance:load
npm run test:security:scan
npm run test:security:audit
# ... 12+ more scripts
```

### After (5 core scripts)
```bash
npm test                 # All tests
npm run test:quick       # Quick validation
npm run test:ci          # CI pipeline
npm run test:production  # Production readiness
npm run gates:check      # Quality gates
```

### Benefits

- **83% reduction** in script complexity
- **Unified interface** for all testing operations
- **Intelligent automation** with smart defaults
- **Better developer experience** with clear commands
- **Consistent reporting** across all test types

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Guidelines](https://testing-library.com/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [CI/CD Best Practices](../.github/README.md)