/**
 * Quality Gates Configuration
 * Defines thresholds and standards for code quality
 */

export const qualityGates = {
  // Code Coverage Thresholds
  coverage: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    perFile: {
      branches: 70,
      functions: 75,
      lines: 85,
      statements: 85,
    },
  },

  // Performance Budgets
  performance: {
    // Core Web Vitals
    coreWebVitals: {
      firstContentfulPaint: 2000, // 2 seconds
      largestContentfulPaint: 4000, // 4 seconds
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
    },

    // Bundle Size Limits (in KB)
    bundleSize: {
      total: 500,
      css: 50,
      js: 400,
      images: 100,
    },

    // Network Requests
    requests: {
      total: 50,
      css: 5,
      js: 10,
      images: 20,
      fonts: 5,
    },
  },

  // Accessibility Standards
  accessibility: {
    // WCAG Compliance Level
    wcagLevel: "AA",

    // Minimum Scores
    scores: {
      overall: 95,
      colorContrast: 100,
      keyboardNavigation: 100,
      screenReader: 95,
      forms: 100,
    },

    // Required Features
    required: [
      "keyboard_navigation",
      "screen_reader_support",
      "high_contrast_mode",
      "reduced_motion_support",
      "focus_indicators",
      "aria_labels",
      "semantic_html",
    ],
  },

  // Security Standards
  security: {
    // Required Headers
    headers: [
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
    ],

    // Vulnerability Thresholds
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 3,
      low: 10,
    },

    // Required Protections
    protections: [
      "xss_prevention",
      "csrf_protection",
      "input_validation",
      "output_encoding",
      "secure_headers",
      "rate_limiting",
    ],
  },

  // Code Quality Standards
  codeQuality: {
    // ESLint Rules
    eslint: {
      maxErrors: 0,
      maxWarnings: 5,
    },

    // TypeScript
    typescript: {
      strictMode: true,
      noImplicitAny: true,
      maxErrors: 0,
    },

    // Complexity Limits
    complexity: {
      cyclomaticComplexity: 10,
      maxFunctionLength: 50,
      maxFileLength: 300,
    },
  },

  // Testing Standards
  testing: {
    // Test Types Required
    requiredTests: [
      "unit",
      "integration",
      "e2e",
      "accessibility",
      "performance",
      "security",
    ],

    // Coverage by Test Type
    coverageByType: {
      unit: 85,
      integration: 70,
      e2e: 60,
    },

    // Persona Coverage
    personaCoverage: {
      required: ["sarah", "marcus", "elena", "james", "aisha"],
      coveragePerPersona: 80,
    },
  },

  // Internationalization Standards
  i18n: {
    // Required Languages
    requiredLanguages: ["en", "es", "fr", "de", "pt"],

    // RTL Support
    rtlLanguages: ["ar", "he"],

    // Translation Coverage
    translationCoverage: {
      minimum: 90,
      recommended: 100,
    },

    // Cultural Adaptations
    culturalAdaptations: [
      "date_formats",
      "number_formats",
      "currency_formats",
      "time_formats",
    ],
  },
};

/**
 * Quality Gate Validator
 */
export class QualityGateValidator {
  static validateCoverage(coverage: any): boolean {
    const { global } = qualityGates.coverage;

    return (
      coverage.branches >= global.branches &&
      coverage.functions >= global.functions &&
      coverage.lines >= global.lines &&
      coverage.statements >= global.statements
    );
  }

  static validatePerformance(metrics: any): boolean {
    const { coreWebVitals, bundleSize } = qualityGates.performance;

    return (
      metrics.fcp <= coreWebVitals.firstContentfulPaint &&
      metrics.lcp <= coreWebVitals.largestContentfulPaint &&
      metrics.fid <= coreWebVitals.firstInputDelay &&
      metrics.cls <= coreWebVitals.cumulativeLayoutShift &&
      metrics.totalSize <= bundleSize.total * 1024
    );
  }

  static validateAccessibility(results: any): boolean {
    const { scores } = qualityGates.accessibility;

    return results.overall >= scores.overall && results.violations.length === 0;
  }

  static validateSecurity(findings: any): boolean {
    const { vulnerabilities } = qualityGates.security;

    return (
      findings.critical <= vulnerabilities.critical &&
      findings.high <= vulnerabilities.high &&
      findings.medium <= vulnerabilities.medium &&
      findings.low <= vulnerabilities.low
    );
  }

  static generateReport(results: any): any {
    const report = {
      timestamp: new Date().toISOString(),
      passed: true,
      gates: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // Validate each gate
    const gates = [
      { name: "coverage", validator: this.validateCoverage },
      { name: "performance", validator: this.validatePerformance },
      { name: "accessibility", validator: this.validateAccessibility },
      { name: "security", validator: this.validateSecurity },
    ];

    for (const gate of gates) {
      const gateResults = results[gate.name];
      const passed = gate.validator(gateResults);

      report.gates[gate.name] = {
        passed,
        results: gateResults,
        thresholds: qualityGates[gate.name],
      };

      report.summary.total++;
      if (passed) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
        report.passed = false;
      }
    }

    return report;
  }
}

export default qualityGates;
