# Performance Testing Suite

A comprehensive performance testing framework built with Playwright to monitor and validate application performance across multiple dimensions.

## Overview

This performance testing suite provides:

- **Web Vitals Monitoring** - Core Web Vitals (FCP, LCP, CLS) tracking
- **Load Testing** - High-frequency interaction and stress testing
- **Regression Detection** - Baseline comparison and degradation alerts
- **Memory Profiling** - Memory leak detection and usage monitoring
- **Bundle Analysis** - Resource loading and bundle size tracking

## Test Files

### 1. Web Vitals Testing (`web-vitals.spec.ts`)

Tests Core Web Vitals and critical performance metrics:

- **First Contentful Paint (FCP)** - Target: < 1.8s
- **Largest Contentful Paint (LCP)** - Target: < 2.5s
- **Cumulative Layout Shift (CLS)** - Target: < 0.1
- **Time to Interactive (TTI)** - Target: < 3.8s
- **Memory Usage** - Target: < 50MB
- **Resource Loading** - Efficiency and caching validation

### 2. Load Testing (`load-testing.spec.ts`)

Validates performance under various load conditions:

- **High-Frequency Interactions** - 100 rapid interactions test
- **Continuous Scrolling** - Scroll performance validation
- **Rapid Navigation** - Section-to-section navigation speed
- **Large Data Sets** - 1000+ item processing tests
- **Memory Stress** - Memory-intensive operation handling
- **Network Conditions** - Slow network and interruption handling

### 3. Regression Testing (`regression-testing.spec.ts`)

Detects performance degradations over time:

- **Baseline Comparison** - Automatic baseline management
- **Regression Detection** - 20% degradation threshold alerts
- **Memory Leak Detection** - Multi-load memory trend analysis
- **Bundle Size Monitoring** - JavaScript/CSS size tracking
- **Web Vitals Trends** - Historical performance analysis

## Running Tests

### Quick Start

```bash
# Run all performance tests
npm run test:performance

# Run specific test suites
npm run test:perf:vitals        # Web Vitals only
npm run test:perf:load          # Load testing only
npm run test:perf:regression    # Regression testing only

# Run with browser visible
npm run test:performance:headed

# View performance reports
npm run test:performance:report
```

### Advanced Usage

```bash
# Run on specific browser
npx playwright test --config=tests/performance/playwright.config.ts --project=performance-chromium

# Run single test file
npx playwright test --config=tests/performance/playwright.config.ts web-vitals.spec.ts

# Generate detailed reports
npx playwright test --config=tests/performance/playwright.config.ts --reporter=html
```

## Performance Thresholds

### Web Vitals Targets (Google's "Good" thresholds)
- **FCP**: < 1800ms
- **LCP**: < 2500ms
- **CLS**: < 0.1
- **TTI**: < 3800ms

### Application-Specific Targets
- **Page Load**: < 5000ms
- **Interaction Response**: < 100ms
- **Memory Usage**: < 50MB
- **Bundle Size**: < 5MB total

### Regression Thresholds
- **Performance Degradation**: 20% threshold
- **Memory Increase**: 30% variance allowed
- **Bundle Size Increase**: 10% warning threshold

## Output Files

The performance tests generate several output files:

```
tests/performance/
├── baseline.json              # Performance baseline metrics
├── bundle-baseline.json       # Bundle size baseline
├── vitals-trends.json         # Historical Web Vitals data
└── test-results/
    ├── performance-report/     # HTML test reports
    └── performance-results.json # Machine-readable results
```

## Baseline Management

### Creating Initial Baseline
The first run of regression tests automatically creates a baseline:

```bash
npm run test:perf:regression
```

### Updating Baseline
Baselines are automatically updated when:
- Performance improves significantly
- No regressions are detected
- New measurements show consistent improvements

### Manual Baseline Reset
To reset baselines manually:

```bash
rm tests/performance/baseline.json
rm tests/performance/bundle-baseline.json
rm tests/performance/vitals-trends.json
npm run test:perf:regression
```

## Continuous Integration

### CI Configuration Example

```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:performance
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: performance-report
          path: test-results/performance-report/
```

### Performance Gates
Set up performance gates that fail CI builds:

```bash
# Add to CI pipeline
npm run test:perf:regression  # Fails if >20% regression detected
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **Load Time Trends** - Track page load performance over time
2. **Memory Growth** - Monitor for memory leaks
3. **Bundle Size** - Alert on significant size increases
4. **Web Vitals** - Track Core Web Vitals score
5. **Error Rates** - Performance test failure rates

### Setting Up Alerts
Configure alerts based on:
- Regression test failures
- Web Vitals threshold breaches
- Memory usage spikes
- Bundle size increases

## Troubleshooting

### Common Issues

#### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running on correct port
- Verify network connectivity

#### Inconsistent Results
- Run tests with single worker (`workers: 1`)
- Disable animations: `--disable-animations-api`
- Use dedicated testing environment

#### Memory Tests Failing
- Enable precise memory info: `--enable-precise-memory-info`
- Close other applications during testing
- Run garbage collection: `--js-flags="--expose-gc"`

### Browser-Specific Notes

#### Chromium
- Best for memory profiling
- Most accurate Web Vitals measurements
- Supports advanced performance APIs

#### Firefox
- May have different performance characteristics
- Some Web Vitals APIs unavailable
- Good for cross-browser validation

#### Mobile Testing
- Simulates mobile network conditions
- Tests touch interactions
- Validates mobile-specific performance

## Best Practices

### Test Environment
- Use dedicated testing environment
- Consistent hardware/network conditions
- Minimal background processes
- Stable browser versions

### Test Design
- Run tests sequentially for consistency
- Use realistic data sets
- Test common user workflows
- Include edge cases and stress scenarios

### Baseline Management
- Regular baseline updates
- Version-controlled baselines
- Document significant changes
- Separate baselines per environment

### Reporting
- Track trends over time
- Include context for changes
- Set up automated reporting
- Share results with team

## Integration with Other Testing

This performance suite complements:
- **Unit Tests** - Component-level performance
- **E2E Tests** - User workflow validation
- **Load Tests** - Server-side performance
- **Accessibility Tests** - Performance impact analysis

## Performance Budget

Consider implementing performance budgets:

```typescript
// Example performance budget
const PERFORMANCE_BUDGET = {
  loadTime: 3000,        // 3 seconds max load time
  bundleSize: 2048,      // 2MB max bundle size
  memoryUsage: 50,       // 50MB max memory usage
  lcpThreshold: 2500,    // 2.5s max LCP
  fcpThreshold: 1800,    // 1.8s max FCP
  clsThreshold: 0.1      // 0.1 max CLS
};
```

## Contributing

When adding new performance tests:
1. Follow existing test patterns
2. Include appropriate thresholds
3. Add documentation for new metrics
4. Test across different browsers
5. Update this README with new features

## Support

For issues with performance testing:
1. Check browser console for errors
2. Verify dev server is running
3. Review test configuration
4. Check Playwright documentation
5. Review performance test logs