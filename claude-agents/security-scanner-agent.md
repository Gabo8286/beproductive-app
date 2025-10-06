# Security Scanner Agent 🔒

## Purpose
Automate comprehensive security scanning, vulnerability detection, and compliance verification across the BeProductive framework. This agent performs daily security audits, prioritizes fixes based on severity, and generates detailed security reports.

## Capabilities
- Runs automated vulnerability scans using multiple tools
- Performs OWASP Top 10 compliance checks
- Audits dependencies for known vulnerabilities
- Validates authentication and authorization mechanisms
- Checks for exposed secrets and credentials
- Monitors security headers and CSP policies
- Generates security reports with remediation guidance
- Integrates with CI/CD for continuous security testing

## Tech Stack & Tools
- **Vulnerability Scanning**: Snyk, npm audit, OWASP ZAP
- **Static Analysis**: ESLint security plugins, Semgrep
- **Secret Detection**: GitLeaks, TruffleHog
- **Dependency Audit**: npm audit, Dependabot
- **Network Security**: nmap, SSL Labs API
- **Container Security**: Docker Bench, Trivy
- **Cloud Security**: AWS Security Hub, CloudTrail

## Security Test Templates

### 1. Vulnerability Scanning Test
```typescript
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Security Vulnerability Scan', () => {
  it('should have no critical vulnerabilities in dependencies', async () => {
    const { stdout } = await execAsync('npm audit --json');
    const audit = JSON.parse(stdout);

    const criticalVulnerabilities = audit.vulnerabilities
      ? Object.values(audit.vulnerabilities).filter((v: any) =>
          v.severity === 'critical' || v.severity === 'high'
        )
      : [];

    expect(criticalVulnerabilities).toHaveLength(0);
  });

  it('should pass Snyk security scan', async () => {
    try {
      await execAsync('snyk test --severity-threshold=high');
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});
```

### 2. Authentication Security Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Authentication Security', () => {
  it('should implement rate limiting on login attempts', async () => {
    const attempts = [];

    for (let i = 0; i < 6; i++) {
      attempts.push(
        fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrong-password'
          })
        })
      );
    }

    const responses = await Promise.all(attempts);
    const lastResponse = responses[responses.length - 1];

    expect(lastResponse.status).toBe(429); // Too Many Requests
  });

  it('should enforce MFA when enabled', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'mfa-user@example.com',
        password: 'correct-password'
      })
    });

    const data = await response.json();
    expect(data.requiresMFA).toBe(true);
    expect(data.sessionToken).toBeUndefined();
  });

  it('should validate password strength requirements', () => {
    const weakPasswords = ['123456', 'password', 'qwerty'];
    const strongPassword = 'Str0ng!P@ssw0rd#2024';

    weakPasswords.forEach(pwd => {
      expect(validatePassword(pwd)).toBe(false);
    });

    expect(validatePassword(strongPassword)).toBe(true);
  });
});
```

### 3. Input Validation & XSS Prevention
```typescript
import { describe, it, expect } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';

describe('Input Validation & XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>'
  ];

  it('should sanitize user inputs against XSS', () => {
    xssPayloads.forEach(payload => {
      const sanitized = DOMPurify.sanitize(payload);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onload');
    });
  });

  it('should validate and escape SQL inputs', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1' = '1",
      "admin'--",
      "1' UNION SELECT * FROM users--"
    ];

    sqlPayloads.forEach(payload => {
      const escaped = escapeSQL(payload);
      expect(escaped).not.toContain('DROP');
      expect(escaped).not.toContain('UNION');
      expect(escaped).not.toContain('--');
    });
  });
});
```

### 4. OWASP Compliance Checker
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('OWASP Top 10 Compliance', () => {
  const baseURL = process.env.VITE_PUBLIC_SUPABASE_URL;

  it('should have secure headers configured', async () => {
    const response = await axios.get(baseURL);
    const headers = response.headers;

    // Security headers checklist
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toMatch(/max-age=/);
    expect(headers['content-security-policy']).toBeDefined();
  });

  it('should implement CSRF protection', async () => {
    const response = await axios.post('/api/protected-endpoint', {}, {
      withCredentials: true
    });

    expect(response.headers['x-csrf-token']).toBeDefined();
  });

  it('should not expose sensitive information in errors', async () => {
    try {
      await axios.get('/api/nonexistent-endpoint');
    } catch (error: any) {
      expect(error.response.data).not.toContain('stack');
      expect(error.response.data).not.toContain('database');
      expect(error.response.data).not.toContain('password');
    }
  });
});
```

### 5. Secret Detection Script
```typescript
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

describe('Secret Detection', () => {
  it('should not contain exposed API keys or secrets', async () => {
    // Scan for common secret patterns
    const secretPatterns = [
      /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
      /secret[_-]?key\s*=\s*['"][^'"]+['"]/gi,
      /password\s*=\s*['"][^'"]+['"]/gi,
      /token\s*=\s*['"][^'"]+['"]/gi,
      /aws[_-]?access[_-]?key[_-]?id\s*=\s*['"][^'"]+['"]/gi,
      /sk_live_[a-zA-Z0-9]+/g, // Stripe keys
      /ghp_[a-zA-Z0-9]+/g, // GitHub tokens
    ];

    const files = await fs.readdir('./src', { recursive: true });
    const sourceFiles = files.filter(f =>
      f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')
    );

    for (const file of sourceFiles) {
      const content = await fs.readFile(`./src/${file}`, 'utf-8');

      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        expect(matches, `Found potential secret in ${file}`).toBeNull();
      });
    }
  });

  it('should use environment variables for sensitive data', async () => {
    const envExample = await fs.readFile('.env.example', 'utf-8');
    const requiredEnvVars = [
      'VITE_PUBLIC_SUPABASE_URL',
      'VITE_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    requiredEnvVars.forEach(envVar => {
      expect(envExample).toContain(envVar);
    });
  });
});
```

## Automated Security Scanning Pipeline

### GitHub Actions Workflow
```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run ESLint security check
        run: npx eslint . --ext .ts,.tsx --plugin security

      - name: Run GitLeaks
        uses: zricethezav/gitleaks-action@master

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'BeProductive'
          path: '.'
          format: 'HTML'

      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            dependency-check-report.html
            snyk-report.json
```

## Security Monitoring Dashboard

### Real-time Security Metrics
```typescript
interface SecurityMetrics {
  vulnerabilityCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastScanTime: Date;
  complianceScore: number;
  openSecurityIssues: number;
  patchedInLast30Days: number;
  failedAuthAttempts: number;
  suspiciousActivities: Alert[];
}

class SecurityDashboard {
  async getMetrics(): Promise<SecurityMetrics> {
    const [vulns, compliance, auth] = await Promise.all([
      this.getVulnerabilities(),
      this.getComplianceScore(),
      this.getAuthMetrics()
    ]);

    return {
      vulnerabilityCount: vulns,
      lastScanTime: new Date(),
      complianceScore: compliance,
      openSecurityIssues: await this.getOpenIssues(),
      patchedInLast30Days: await this.getPatchCount(),
      failedAuthAttempts: auth.failedAttempts,
      suspiciousActivities: await this.getSuspiciousActivities()
    };
  }

  async generateReport(): Promise<SecurityReport> {
    const metrics = await this.getMetrics();

    return {
      executive_summary: this.generateExecutiveSummary(metrics),
      vulnerability_details: await this.getVulnerabilityDetails(),
      compliance_status: await this.getComplianceDetails(),
      recommendations: this.generateRecommendations(metrics),
      risk_score: this.calculateRiskScore(metrics)
    };
  }
}
```

## Integration with CI/CD

### Pre-deployment Security Gates
```typescript
export class SecurityGate {
  async validateDeployment(): Promise<DeploymentDecision> {
    const checks = await Promise.all([
      this.runVulnerabilityCheck(),
      this.runComplianceCheck(),
      this.runSecretScan(),
      this.validateSecurityHeaders(),
      this.checkSSLCertificate()
    ]);

    const failures = checks.filter(check => !check.passed);

    if (failures.length > 0) {
      return {
        allowed: false,
        reason: `Security checks failed: ${failures.map(f => f.name).join(', ')}`,
        details: failures
      };
    }

    return { allowed: true };
  }
}
```

## Alert & Notification System

### Security Alert Configuration
```typescript
interface SecurityAlert {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'vulnerability' | 'breach_attempt' | 'compliance' | 'configuration';
  message: string;
  affectedResources: string[];
  remediation: string;
  timestamp: Date;
}

class SecurityAlertManager {
  async sendAlert(alert: SecurityAlert): Promise<void> {
    // Critical alerts
    if (alert.severity === 'critical') {
      await this.sendSlackAlert(alert);
      await this.sendEmailToSecurityTeam(alert);
      await this.createJiraTicket(alert);
      await this.triggerPagerDuty(alert);
    }

    // High severity
    else if (alert.severity === 'high') {
      await this.sendSlackAlert(alert);
      await this.sendEmailToSecurityTeam(alert);
    }

    // Log all alerts
    await this.logToSIEM(alert);
  }
}
```

## Success Criteria

### Security Scanning Metrics
- **Vulnerability Detection Rate**: 100% of known CVEs detected
- **False Positive Rate**: < 5%
- **Scan Completion Time**: < 10 minutes for full scan
- **Remediation Time**: Critical issues fixed within 24 hours
- **Compliance Score**: Maintain > 95% OWASP compliance

### Key Performance Indicators
1. **Mean Time to Detect (MTTD)**: < 1 hour for critical vulnerabilities
2. **Mean Time to Remediate (MTTR)**: < 24 hours for critical, < 7 days for high
3. **Security Coverage**: 100% of code scanned daily
4. **Dependency Updates**: All critical patches applied within 48 hours
5. **Zero-day Response**: Mitigation plan within 4 hours

## Usage Examples

### Run Complete Security Audit
```bash
# Execute full security scan
npm run security:audit

# Run specific security tests
npm run test:security

# Generate security report
npm run security:report

# Check OWASP compliance
npm run security:owasp-check
```

### Integrate with Development Workflow
```typescript
// Pre-commit hook
export async function preCommitSecurityCheck(): Promise<void> {
  const scanner = new SecurityScanner();

  // Check for secrets
  await scanner.scanForSecrets();

  // Validate dependencies
  await scanner.auditDependencies();

  // Run quick security lints
  await scanner.runSecurityLint();
}
```

### Schedule Automated Scans
```typescript
// Cron job for daily security scans
schedule.scheduleJob('0 2 * * *', async () => {
  const agent = new SecurityScannerAgent();

  const results = await agent.runFullScan();
  await agent.analyzeResults(results);
  await agent.generateReport(results);
  await agent.notifyStakeholders(results);
});
```

## Best Practices

1. **Shift-Left Security**: Integrate security testing early in development
2. **Continuous Monitoring**: Run scans on every commit and deployment
3. **Automated Remediation**: Auto-fix low-risk issues, flag high-risk for review
4. **Security as Code**: Version control all security configurations
5. **Defense in Depth**: Layer multiple security controls
6. **Regular Updates**: Keep all dependencies and tools updated
7. **Security Training**: Regular team training on secure coding practices

## Troubleshooting

### Common Issues
- **High False Positive Rate**: Tune detection rules, whitelist safe patterns
- **Slow Scan Times**: Parallelize scans, optimize scan scope
- **Integration Conflicts**: Use containerized security tools
- **Alert Fatigue**: Prioritize and group related alerts

## Related Agents
- **Threat Simulator Agent**: For active attack simulation
- **Compliance Auditor Agent**: For regulatory compliance
- **Code Quality Guardian Agent**: For secure code practices
- **DevOps Automator Agent**: For secure CI/CD pipelines