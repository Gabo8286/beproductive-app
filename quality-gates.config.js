/**
 * Quality Gates Configuration
 * Defines thresholds, rules, and automation for quality assurance
 */

export const qualityGatesConfig = {
  // Global configuration
  global: {
    enabled: true,
    failFast: false,
    reportFormat: 'json',
    outputDirectory: 'quality-reports',
    notificationWebhook: process.env.QUALITY_WEBHOOK_URL,
    slackChannel: process.env.SLACK_QUALITY_CHANNEL
  },

  // Code Quality Thresholds
  codeQuality: {
    enabled: true,
    thresholds: {
      overallScore: 80,        // Minimum overall quality score
      complexity: 10,          // Maximum cyclomatic complexity per function
      duplication: 5,          // Maximum code duplication percentage
      maintainability: 70,     // Minimum maintainability score
      technicalDebt: 60        // Maximum technical debt in hours
    },
    rules: {
      maxFileLength: 500,      // Maximum lines per file
      maxFunctionLength: 50,   // Maximum lines per function
      maxNestingDepth: 4,      // Maximum nesting depth
      namingConventions: true, // Enforce naming conventions
      documentationCoverage: 80 // Minimum documentation coverage
    },
    exclusions: [
      'src/**/*.test.{ts,tsx}',
      'src/test/**/*',
      'dist/**/*',
      'node_modules/**/*'
    ]
  },

  // Test Coverage Gates
  testCoverage: {
    enabled: true,
    thresholds: {
      global: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      components: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      },
      hooks: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      },
      utils: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95
      }
    },
    exclusions: [
      'src/**/*.stories.{ts,tsx}',
      'src/**/*.test.{ts,tsx}',
      'src/test/**/*',
      'src/mocks/**/*'
    ],
    reportFormats: ['text', 'html', 'json', 'lcov']
  },

  // Performance Gates
  performance: {
    enabled: true,
    budgets: {
      'default': {
        lcp: 2500,           // Largest Contentful Paint (ms)
        fid: 100,            // First Input Delay (ms)
        cls: 0.1,            // Cumulative Layout Shift
        fcp: 1800,           // First Contentful Paint (ms)
        ttfb: 600,           // Time to First Byte (ms)
        tti: 3500,           // Time to Interactive (ms)
        si: 3000,            // Speed Index (ms)
        tbt: 200             // Total Blocking Time (ms)
      },
      'mobile': {
        lcp: 3000,
        fid: 100,
        cls: 0.1,
        fcp: 2200,
        ttfb: 800,
        tti: 4000,
        si: 3500,
        tbt: 300
      }
    },
    bundleSize: {
      maxTotalSize: 2048,    // KB
      maxChunkSize: 1024,    // KB
      maxAssetSize: 512,     // KB
      compressionRatio: 0.3, // Expected gzip compression ratio
      chunkCount: 20         // Maximum number of chunks
    },
    monitoring: {
      alertThreshold: 2,     // Number of violations before alert
      trendAnalysis: true,   // Enable performance trend analysis
      regressionDetection: true // Detect performance regressions
    }
  },

  // Security Gates
  security: {
    enabled: true,
    vulnerabilities: {
      critical: 0,           // Maximum critical vulnerabilities
      high: 0,              // Maximum high severity vulnerabilities
      medium: 3,            // Maximum medium severity vulnerabilities
      low: 10               // Maximum low severity vulnerabilities
    },
    dependencies: {
      auditLevel: 'moderate', // npm audit level
      excludePackages: [],    // Packages to exclude from audit
      allowedLicenses: [      // Allowed dependency licenses
        'MIT',
        'Apache-2.0',
        'BSD-2-Clause',
        'BSD-3-Clause',
        'ISC'
      ]
    },
    codeScanning: {
      eslintSecurity: true,   // Enable ESLint security rules
      sonarQube: false,       // Enable SonarQube analysis
      codeQL: false,          // Enable GitHub CodeQL
      snyk: false             // Enable Snyk scanning
    }
  },

  // Accessibility Gates
  accessibility: {
    enabled: true,
    standards: {
      wcag: '2.1',           // WCAG version
      level: 'AA',           // Compliance level (A, AA, AAA)
      rules: [               // Additional axe-core rules
        'color-contrast',
        'keyboard-navigation',
        'focus-management',
        'aria-labels',
        'semantic-markup'
      ]
    },
    thresholds: {
      violations: 0,         // Maximum accessibility violations
      incomplete: 5,         // Maximum incomplete tests
      warnings: 10           // Maximum warnings
    },
    testing: {
      automatedTests: true,  // Run automated a11y tests
      manualChecklist: false, // Require manual a11y checklist
      screenReaderTesting: false // Require screen reader testing
    }
  },

  // Browser Compatibility Gates
  browserCompatibility: {
    enabled: true,
    targets: [
      'Chrome >= 90',
      'Firefox >= 88',
      'Safari >= 14',
      'Edge >= 90'
    ],
    testing: {
      crossBrowser: true,    // Enable cross-browser testing
      devices: [             // Test devices for mobile compatibility
        'iPhone 12',
        'Samsung Galaxy S21',
        'iPad Pro'
      ]
    }
  },

  // Deployment Gates
  deployment: {
    enabled: true,
    requirements: {
      allGatesMustPass: true,    // All gates must pass for deployment
      manualApproval: false,     // Require manual approval
      stagingValidation: true,   // Validate in staging before prod
      rollbackStrategy: true     // Rollback strategy must be defined
    },
    environments: {
      staging: {
        autoPromote: true,       // Auto-promote to staging
        requiresApproval: false,
        runSmokeTests: true
      },
      production: {
        autoPromote: false,      // Manual promotion to production
        requiresApproval: true,
        runSmokeTests: true,
        canaryDeployment: true   // Use canary deployment
      }
    }
  },

  // 5S Codebase Organization Gates
  fiveS: {
    enabled: true,
    budgets: {
      seiri: {
        maxDeadCodeFiles: 5,
        maxDuplicateBlocks: 3,
        maxUnusedDependencies: 2,
        maxObsoleteFiles: 3
      },
      seiton: {
        maxDisorganizedDirectories: 3,
        maxUnorganizedImports: 5,
        maxNamingViolations: 5,
        minOrganizationScore: 80
      },
      seiso: {
        maxFormattingIssues: 10,
        maxCommentIssues: 8,
        maxCodeSmells: 5,
        maxTechnicalDebtHours: 40,
        minCleanlinessScore: 75
      },
      seiketsu: {
        maxStandardsViolations: 3,
        minPatternsCompliance: 85,
        minDocumentationCoverage: 75,
        minReviewCompliance: 90,
        minStandardizationScore: 80
      },
      shitsuke: {
        minAutomationCoverage: 80,
        minTeamCompliance: 85,
        minSustainabilityScore: 80,
        requireMonitoringActive: true
      }
    },
    overallThresholds: {
      minOverallScore: 80,      // Minimum overall 5S score
      gradingScale: {
        A: 90,   // Excellent organization
        B: 80,   // Good organization
        C: 70,   // Acceptable organization
        D: 60,   // Poor organization
        F: 0     // Failing organization
      }
    },
    enforcement: {
      blockDeployment: true,    // Block deployment on 5S failures
      requireConsensus: true,   // Require agent consensus for changes
      safetyChecks: true,       // Enable safety validation
      dryRunFirst: true         // Always dry-run changes first
    },
    collaboration: {
      agentCoordination: true,  // Enable multi-agent coordination
      qualityIntegration: true, // Integrate with quality analyzer
      testValidation: true,     // Validate with test orchestrator
      performanceCheck: true    // Check with bundle analyzer
    }
  },

  // Monitoring and Alerting
  monitoring: {
    enabled: true,
    metrics: {
      errorRate: {
        threshold: 0.01,      // 1% error rate threshold
        window: '5m',         // Time window for measurement
        severity: 'critical'
      },
      responseTime: {
        threshold: 2000,      // 2s response time threshold
        percentile: 95,       // 95th percentile
        severity: 'high'
      },
      availability: {
        threshold: 99.9,      // 99.9% availability threshold
        window: '1h',
        severity: 'critical'
      },
      fiveSScore: {
        threshold: 80,        // Minimum 5S score
        window: '1d',         // Daily measurement
        severity: 'medium'
      },
      organizationTrend: {
        threshold: -5,        // Alert on 5% degradation
        window: '7d',         // Weekly trend analysis
        severity: 'medium'
      }
    },
    notifications: {
      slack: {
        enabled: true,
        channel: '#quality-alerts',
        mentions: ['@dev-team']
      },
      email: {
        enabled: false,
        recipients: []
      },
      webhook: {
        enabled: false,
        url: null
      }
    }
  },

  // Reporting Configuration
  reporting: {
    enabled: true,
    formats: ['json', 'html', 'markdown'],
    destinations: [
      'local',              // Save to local file system
      'artifacts',          // Upload as CI/CD artifacts
      'dashboard'           // Send to quality dashboard
    ],
    retention: {
      local: 30,            // Days to keep local reports
      artifacts: 90,        // Days to keep CI/CD artifacts
      dashboard: 365        // Days to keep dashboard data
    },
    aggregation: {
      daily: true,          // Generate daily quality reports
      weekly: true,         // Generate weekly quality reports
      monthly: true,        // Generate monthly quality reports
      trends: true          // Include trend analysis
    }
  },

  // Integration Configuration
  integrations: {
    github: {
      enabled: true,
      prComments: true,     // Comment on PRs with quality results
      statusChecks: true,   // Create GitHub status checks
      labels: {
        qualityPassed: 'quality:passed',
        qualityFailed: 'quality:failed',
        needsReview: 'needs:review'
      }
    },
    jira: {
      enabled: false,
      createIssues: false,  // Create JIRA issues for quality failures
      project: null,
      issueType: 'Bug'
    },
    sonarQube: {
      enabled: false,
      server: null,
      token: null,
      projectKey: null
    }
  }
};

// Environment-specific overrides
export const environmentOverrides = {
  development: {
    codeQuality: {
      thresholds: {
        overallScore: 70    // Relaxed for development
      }
    },
    testCoverage: {
      thresholds: {
        global: {
          statements: 70,
          branches: 65,
          functions: 70,
          lines: 70
        }
      }
    },
    fiveS: {
      overallThresholds: {
        minOverallScore: 70 // Relaxed 5S requirements for development
      },
      budgets: {
        seiri: {
          maxDeadCodeFiles: 8,        // More lenient in dev
          maxDuplicateBlocks: 5,
          maxUnusedDependencies: 5
        },
        seiso: {
          maxTechnicalDebtHours: 60,  // Allow more debt in development
          maxCodeSmells: 8
        }
      },
      enforcement: {
        blockDeployment: false,       // Don't block dev deployments
        dryRunFirst: true            // Still require dry runs
      }
    }
  },

  staging: {
    performance: {
      budgets: {
        'default': {
          lcp: 3000,        // More lenient for staging
          fcp: 2000
        }
      }
    },
    fiveS: {
      overallThresholds: {
        minOverallScore: 75 // Slightly relaxed for staging
      },
      enforcement: {
        blockDeployment: true,        // Block staging deployments on 5S failures
        requireConsensus: true        // Require agent consensus
      }
    }
  },

  production: {
    security: {
      vulnerabilities: {
        critical: 0,        // Zero tolerance in production
        high: 0,
        medium: 0
      }
    },
    performance: {
      monitoring: {
        alertThreshold: 1   // Alert on first violation
      }
    },
    fiveS: {
      overallThresholds: {
        minOverallScore: 85 // Strict 5S requirements for production
      },
      budgets: {
        seiri: {
          maxDeadCodeFiles: 2,        // Very strict in production
          maxDuplicateBlocks: 1,
          maxUnusedDependencies: 0    // Zero unused deps in production
        },
        seiton: {
          minOrganizationScore: 90    // High organization standards
        },
        seiso: {
          maxTechnicalDebtHours: 20,  // Minimal debt in production
          maxCodeSmells: 2,
          minCleanlinessScore: 85
        },
        seiketsu: {
          minPatternsCompliance: 95,  // Strict pattern compliance
          minDocumentationCoverage: 90,
          minReviewCompliance: 95
        },
        shitsuke: {
          minAutomationCoverage: 95,  // High automation in production
          minTeamCompliance: 95,
          minSustainabilityScore: 90
        }
      },
      enforcement: {
        blockDeployment: true,        // Strict deployment blocking
        requireConsensus: true,       // Require full agent consensus
        safetyChecks: true           // Enable all safety checks
      }
    }
  }
};

export default qualityGatesConfig;