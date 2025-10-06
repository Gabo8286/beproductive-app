export interface TestCategory {
  id: string;
  name: string;
  weight: number; // Percentage weight in overall score
  description: string;
  criticalPath: boolean; // Must pass for production deployment
  tests: TestDefinition[];
}

export interface TestDefinition {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'manual' | 'hybrid';
  estimatedDuration: number; // in seconds
  successCriteria: string;
  dependencies?: string[];
  tags: string[];
}

export interface ProductionReadinessScore {
  overall: number;
  categories: CategoryScore[];
  timestamp: Date;
  readyForProduction: boolean;
  blockers: string[];
  warnings: string[];
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  passed: number;
  total: number;
  criticalFailures: number;
  warnings: number;
}

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'security',
    name: 'Security',
    weight: 25,
    description: 'Authentication, authorization, encryption, and vulnerability testing',
    criticalPath: true,
    tests: [
      {
        id: 'auth-authorization',
        name: 'Authentication & Authorization Test',
        description: 'Simulate login attempts, role escalations, and MFA bypasses',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '100% unauthorized attempts blocked; no session hijacking',
        tags: ['auth', 'security', 'mfa']
      },
      {
        id: 'data-encryption',
        name: 'Data Encryption Test',
        description: 'Verify data in transit/rest with packet analysis',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: 'All sensitive data encrypted (AES-256); decryption fails without keys',
        tags: ['encryption', 'data-protection']
      },
      {
        id: 'input-validation',
        name: 'Input Validation Test',
        description: 'Fuzz inputs for SQL injection/XSS vulnerabilities',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: '0 exploits detected; all inputs sanitized',
        tags: ['injection', 'xss', 'input-validation']
      },
      {
        id: 'access-logging',
        name: 'Access Logging Test',
        description: 'Review logs for completeness during user sessions',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: '100% of actions logged with timestamps; logs tamper-proof',
        tags: ['logging', 'audit-trail']
      },
      {
        id: 'vulnerability-scanning',
        name: 'Vulnerability Scanning Test',
        description: 'Run full security scans with Snyk/OWASP tools',
        type: 'automated',
        estimatedDuration: 600,
        successCriteria: 'No high/critical vulnerabilities; all medium/low justified',
        tags: ['vulnerability', 'scanning', 'dependencies']
      }
    ]
  },
  {
    id: 'performance',
    name: 'Scalability & Performance',
    weight: 20,
    description: 'Load testing, caching, optimization, and scalability validation',
    criticalPath: true,
    tests: [
      {
        id: 'horizontal-scaling',
        name: 'Horizontal Scaling Test',
        description: 'Ramp user load to 10x expected traffic',
        type: 'automated',
        estimatedDuration: 900,
        successCriteria: 'Auto-scales seamlessly; error rate <5%; response <500ms',
        tags: ['scaling', 'load-testing', 'auto-scaling']
      },
      {
        id: 'caching-optimization',
        name: 'Caching & Optimization Test',
        description: 'Measure response times before/after caching',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: 'Average latency <200ms; cache hit rate >80%',
        tags: ['caching', 'optimization', 'redis']
      },
      {
        id: 'load-balancing',
        name: 'Load Balancing Test',
        description: 'Distribute simulated traffic across nodes',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: 'Even distribution (variance <10%); no single point failure',
        tags: ['load-balancing', 'distribution']
      },
      {
        id: 'database-optimization',
        name: 'Database Optimization Test',
        description: 'Execute high-volume queries and analyze performance',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: 'No queries >100ms; indexing covers 95% operations',
        tags: ['database', 'queries', 'optimization']
      },
      {
        id: 'api-rate-limiting',
        name: 'API Rate Limiting Test',
        description: 'Send burst requests exceeding limits',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: 'Throttling activates correctly; CPU <80%',
        tags: ['rate-limiting', 'api', 'throttling']
      }
    ]
  },
  {
    id: 'reliability',
    name: 'Reliability & Availability',
    weight: 20,
    description: 'Failover, error handling, disaster recovery, and uptime validation',
    criticalPath: true,
    tests: [
      {
        id: 'redundancy-failover',
        name: 'Redundancy & Failover Test',
        description: 'Induce failures and monitor recovery',
        type: 'automated',
        estimatedDuration: 600,
        successCriteria: 'Uptime >99.99% during tests; failover <1 minute',
        tags: ['failover', 'redundancy', 'chaos-engineering']
      },
      {
        id: 'error-handling',
        name: 'Error Handling Test',
        description: 'Inject exceptions in code paths',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: '100% errors caught with graceful degradation',
        tags: ['error-handling', 'exceptions', 'graceful-degradation']
      },
      {
        id: 'disaster-recovery',
        name: 'Disaster Recovery Test',
        description: 'Simulate data loss and restore from backups',
        type: 'hybrid',
        estimatedDuration: 1800,
        successCriteria: 'RTO <4 hours; RPO <1 hour; 100% data integrity',
        tags: ['disaster-recovery', 'backup', 'restore']
      },
      {
        id: 'circuit-breakers',
        name: 'Circuit Breakers Test',
        description: 'Trigger failures in dependent services',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: 'Isolates issues; no cascade failures; recovery <30s',
        tags: ['circuit-breaker', 'isolation', 'recovery']
      },
      {
        id: 'health-checks',
        name: 'Health Checks Test',
        description: 'Monitor endpoints continuously',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '>99.99% availability; alerts on >1% downtime',
        tags: ['health-checks', 'monitoring', 'availability']
      }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Legal',
    weight: 15,
    description: 'GDPR, accessibility, audit documentation, and regulatory compliance',
    criticalPath: true,
    tests: [
      {
        id: 'data-privacy',
        name: 'Data Privacy Test',
        description: 'Validate GDPR consent flows and user rights',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '100% compliance; data export <1 minute',
        tags: ['gdpr', 'privacy', 'consent']
      },
      {
        id: 'accessibility',
        name: 'Accessibility Test',
        description: 'Audit UI for WCAG 2.1 AA compliance',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: '0 critical errors; AA level achieved',
        tags: ['wcag', 'accessibility', 'a11y']
      },
      {
        id: 'audit-documentation',
        name: 'Audit Documentation Test',
        description: 'Generate and review compliance reports',
        type: 'manual',
        estimatedDuration: 600,
        successCriteria: '100% coverage; no gaps in data flows',
        tags: ['audit', 'documentation', 'soc2']
      },
      {
        id: 'third-party-compliance',
        name: 'Third-Party Compliance Test',
        description: 'Check integrations for certifications',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: 'All vendors compliant; no security risks',
        tags: ['vendor', 'third-party', 'compliance']
      },
      {
        id: 'penetration-testing',
        name: 'Penetration Testing Test',
        description: 'Conduct ethical hacks by certified testers',
        type: 'manual',
        estimatedDuration: 3600,
        successCriteria: 'All findings remediated; clean report',
        tags: ['penetration', 'ethical-hacking', 'security']
      }
    ]
  },
  {
    id: 'ux',
    name: 'Usability & User Experience',
    weight: 10,
    description: 'Responsive design, onboarding, internationalization, and user analytics',
    criticalPath: false,
    tests: [
      {
        id: 'responsive-design',
        name: 'Responsive Design Test',
        description: 'Test across devices and browsers',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '100% compatibility; no layout breaks',
        tags: ['responsive', 'cross-browser', 'mobile']
      },
      {
        id: 'user-onboarding',
        name: 'User Onboarding Test',
        description: 'Run A/B tests on onboarding flows',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: 'Completion rate >90%; average time <2 minutes',
        tags: ['onboarding', 'a-b-testing', 'conversion']
      },
      {
        id: 'internationalization',
        name: 'Internationalization Test',
        description: 'Verify locales, translations, and RTL support',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: '100% accurate rendering; no cultural issues',
        tags: ['i18n', 'localization', 'rtl']
      },
      {
        id: 'performance-metrics',
        name: 'Performance Metrics Test',
        description: 'Score Core Web Vitals with Lighthouse',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: 'All metrics >90 (LCP <2.5s, FID <100ms)',
        tags: ['core-web-vitals', 'lighthouse', 'performance']
      },
      {
        id: 'user-analytics',
        name: 'User Analytics Test',
        description: 'Simulate sessions and track engagement',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: 'Churn rate <10%; session > benchmark',
        tags: ['analytics', 'engagement', 'tracking']
      }
    ]
  },
  {
    id: 'devops',
    name: 'Maintainability & DevOps',
    weight: 5,
    description: 'CI/CD, code quality, documentation, and environment management',
    criticalPath: false,
    tests: [
      {
        id: 'cicd-pipeline',
        name: 'Version Control & CI/CD Test',
        description: 'Run full pipelines on changes',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '100% build/deploy success; deployment <5 minutes',
        tags: ['cicd', 'pipeline', 'deployment']
      },
      {
        id: 'modular-architecture',
        name: 'Modular Architecture Test',
        description: 'Check dependencies for couplings',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: 'Modules independent; updates affect <5% of app',
        tags: ['architecture', 'modularity', 'coupling']
      },
      {
        id: 'code-quality',
        name: 'Code Quality Test',
        description: 'Lint and test coverage analysis',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: '>80% coverage; 0 lint errors; code smells <5%',
        tags: ['code-quality', 'coverage', 'linting']
      },
      {
        id: 'documentation',
        name: 'Documentation Test',
        description: 'Validate API docs against specs',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: '100% endpoints documented; no validation errors',
        tags: ['documentation', 'api-docs', 'swagger']
      },
      {
        id: 'environment-management',
        name: 'Environment Management Test',
        description: 'Compare dev/staging/prod configs',
        type: 'automated',
        estimatedDuration: 90,
        successCriteria: '100% parity; no drifts in secrets',
        tags: ['environment', 'config', 'parity']
      }
    ]
  },
  {
    id: 'data',
    name: 'Data Management',
    weight: 3,
    description: 'Data integrity, backup validation, query optimization, and governance',
    criticalPath: false,
    tests: [
      {
        id: 'data-integrity',
        name: 'Data Integrity Test',
        description: 'Run ACID-compliant transactions under load',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: '0 inconsistencies; all commits/rollbacks expected',
        tags: ['acid', 'integrity', 'transactions']
      },
      {
        id: 'backup-archiving',
        name: 'Backup & Archiving Test',
        description: 'Perform and verify restores',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: '100% recovery; backups meet retention policies',
        tags: ['backup', 'archiving', 'restore']
      },
      {
        id: 'query-optimization',
        name: 'Query Optimization Test',
        description: 'Benchmark under simulated production data',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: 'Efficient scaling; costs < budgeted thresholds',
        tags: ['queries', 'optimization', 'performance']
      },
      {
        id: 'data-governance',
        name: 'Data Governance Test',
        description: 'Test access policies for PII',
        type: 'automated',
        estimatedDuration: 120,
        successCriteria: 'No unauthorized exposures; 100% tagging accuracy',
        tags: ['governance', 'pii', 'access-control']
      }
    ]
  },
  {
    id: 'integration',
    name: 'Integration & Extensibility',
    weight: 2,
    description: 'API standards, webhooks, plugin ecosystem, and SLA monitoring',
    criticalPath: false,
    tests: [
      {
        id: 'api-standards',
        name: 'API Standards Test',
        description: 'Validate contracts with OpenAPI specs',
        type: 'automated',
        estimatedDuration: 180,
        successCriteria: '100% compliance with OpenAPI specs',
        tags: ['api', 'openapi', 'contracts']
      },
      {
        id: 'webhook-events',
        name: 'Webhook & Event-Driven Test',
        description: 'End-to-end sync simulations',
        type: 'automated',
        estimatedDuration: 240,
        successCriteria: '100% event delivery; latency <1 second',
        tags: ['webhooks', 'events', 'real-time']
      },
      {
        id: 'plugin-ecosystem',
        name: 'Plugin Ecosystem Test',
        description: 'Install and test extensions',
        type: 'automated',
        estimatedDuration: 300,
        successCriteria: 'No compatibility issues; seamless integration',
        tags: ['plugins', 'extensions', 'ecosystem']
      },
      {
        id: 'sla-monitoring',
        name: 'SLA Monitoring Test',
        description: 'Track uptime over extended periods',
        type: 'automated',
        estimatedDuration: 600,
        successCriteria: 'Meets 99.99% commitment; no breaches',
        tags: ['sla', 'monitoring', 'uptime']
      }
    ]
  }
];

// Production readiness thresholds
export const PRODUCTION_THRESHOLDS = {
  OVERALL_PASS_RATE: 95, // 95% overall pass rate required
  CRITICAL_CATEGORIES_PASS_RATE: 100, // Critical categories must be 100%
  MAX_CRITICAL_FAILURES: 0, // No critical failures allowed
  MAX_HIGH_SEVERITY_WARNINGS: 3, // Maximum 3 high severity warnings
};

export function calculateProductionReadinessScore(categoryScores: CategoryScore[]): ProductionReadinessScore {
  let weightedScore = 0;
  let totalWeight = 0;
  const blockers: string[] = [];
  const warnings: string[] = [];

  categoryScores.forEach(categoryScore => {
    const category = TEST_CATEGORIES.find(c => c.id === categoryScore.categoryId);
    if (!category) return;

    weightedScore += categoryScore.score * category.weight;
    totalWeight += category.weight;

    // Check for critical path failures
    if (category.criticalPath && categoryScore.score < PRODUCTION_THRESHOLDS.CRITICAL_CATEGORIES_PASS_RATE) {
      blockers.push(`Critical category '${category.name}' failed (${categoryScore.score}%)`);
    }

    // Check for critical failures
    if (categoryScore.criticalFailures > 0) {
      blockers.push(`${categoryScore.criticalFailures} critical failures in '${category.name}'`);
    }

    // Check for warnings
    if (categoryScore.warnings > PRODUCTION_THRESHOLDS.MAX_HIGH_SEVERITY_WARNINGS) {
      warnings.push(`${categoryScore.warnings} warnings in '${category.name}' (max: ${PRODUCTION_THRESHOLDS.MAX_HIGH_SEVERITY_WARNINGS})`);
    }
  });

  const overall = Math.round(weightedScore / totalWeight);
  const readyForProduction = overall >= PRODUCTION_THRESHOLDS.OVERALL_PASS_RATE && blockers.length === 0;

  return {
    overall,
    categories: categoryScores,
    timestamp: new Date(),
    readyForProduction,
    blockers,
    warnings
  };
}