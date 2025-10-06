# Threat Simulator Agent ⚔️

## Purpose
Automate penetration testing and security threat simulations to validate application defenses. This agent simulates real-world attacks, tests security controls, and identifies vulnerabilities through controlled attack scenarios.

## Capabilities
- Simulates OWASP Top 10 attack vectors
- Performs automated penetration testing
- Tests authentication bypass scenarios
- Validates input sanitization defenses
- Simulates SQL injection and XSS attacks
- Tests rate limiting and DDoS protection
- Validates CSRF protection mechanisms
- Performs session management testing
- Simulates privilege escalation attempts
- Generates detailed attack simulation reports

## Tech Stack & Tools
- **Penetration Testing**: OWASP ZAP, Burp Suite Community
- **Attack Simulation**: Metasploit, SQLMap, XSStrike
- **Network Testing**: Nmap, Masscan
- **Web Testing**: Nikto, Dirb, Gobuster
- **Payload Generation**: SecLists, PayloadsAllTheThings
- **Automation**: Selenium WebDriver, Playwright
- **Reporting**: OWASP ZAP Reports, Custom JSON/HTML

## Attack Simulation Templates

### 1. SQL Injection Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('SQL Injection Defense Testing', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT username, password FROM users --",
    "admin'--",
    "' OR 1=1 --",
    "1' AND (SELECT COUNT(*) FROM users) > 0 --",
    "' OR 'x'='x",
    "1'; WAITFOR DELAY '00:00:05' --",
    "' OR SLEEP(5) --",
    "1' AND EXTRACTVALUE(0x0a,CONCAT(0x0a,(SELECT version()))) --"
  ];

  sqlPayloads.forEach((payload, index) => {
    it(`should prevent SQL injection payload ${index + 1}: ${payload}`, async () => {
      try {
        const response = await axios.post('/api/login', {
          email: `test${payload}@example.com`,
          password: payload
        });

        // Should not return database errors or admin access
        expect(response.status).not.toBe(200);
        expect(response.data).not.toContain('admin');
        expect(response.data).not.toContain('database');
        expect(response.data).not.toContain('mysql');
        expect(response.data).not.toContain('postgres');
      } catch (error: any) {
        // Expect controlled error, not database exposure
        expect(error.response.status).toBe(400);
        expect(error.response.data).not.toContain('SQL');
        expect(error.response.data).not.toContain('syntax error');
      }
    });
  });

  it('should use parameterized queries in database operations', async () => {
    const maliciousId = "1 OR 1=1";

    try {
      const response = await axios.get(`/api/users/${maliciousId}`);
      expect(response.status).toBe(404); // Should not find user
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
```

### 2. XSS Attack Simulation
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DOMPurify from 'isomorphic-dompurify';

describe('XSS Attack Defense Testing', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<div onmouseover="alert(\'XSS\')">Hover me</div>',
    '<input type="image" src=x onerror=alert("XSS")>',
    '<body onload=alert("XSS")>',
    '<link rel=stylesheet href="javascript:alert(\'XSS\')">',
    '<style>@import"javascript:alert(\'XSS\')";</style>',
    '"><script>alert("XSS")</script>',
    '\';alert("XSS");//',
    'javascript:alert("XSS")'
  ];

  xssPayloads.forEach((payload, index) => {
    it(`should prevent XSS payload ${index + 1}: ${payload}`, () => {
      const sanitized = DOMPurify.sanitize(payload);

      // Should not contain executable JavaScript
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('alert(');

      // Test in React component
      const TestComponent = () => (
        <div dangerouslySetInnerHTML={{ __html: sanitized }} />
      );

      render(<TestComponent />);

      // Should not execute JavaScript
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  it('should properly escape user content in templates', () => {
    const userInput = '<script>steal_cookies()</script>';
    const escaped = escapeHtml(userInput);

    expect(escaped).toBe('&lt;script&gt;steal_cookies()&lt;/script&gt;');
  });
});
```

### 3. Authentication Bypass Testing
```typescript
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import axios from 'axios';

describe('Authentication Bypass Testing', () => {
  it('should prevent JWT token manipulation', async () => {
    const originalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    const manipulationAttempts = [
      originalToken.replace('HS256', 'none'), // Algorithm confusion
      originalToken + 'malicious', // Token tampering
      'Bearer malicious-token', // Invalid token format
      '', // Empty token
      'null', // Null token
      originalToken.replace(/.$/, ''), // Truncated token
    ];

    for (const token of manipulationAttempts) {
      try {
        const response = await axios.get('/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });

        expect(response.status).not.toBe(200);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    }
  });

  it('should prevent session fixation attacks', async () => {
    // Attacker's session ID
    const attackerSessionId = 'attacker-session-123';

    // Try to login with pre-set session ID
    try {
      const response = await axios.post('/api/login', {
        email: 'user@example.com',
        password: 'password'
      }, {
        headers: {
          Cookie: `sessionId=${attackerSessionId}`
        }
      });

      // Should generate new session ID, not use the provided one
      const newSessionId = response.headers['set-cookie']
        ?.find(cookie => cookie.startsWith('sessionId='))
        ?.split('=')[1]?.split(';')[0];

      expect(newSessionId).not.toBe(attackerSessionId);
    } catch (error) {
      // Login might fail, but session should still be regenerated
      expect(error).toBeDefined();
    }
  });

  it('should implement proper password reset flow', async () => {
    // Request password reset
    const resetResponse = await axios.post('/api/auth/reset-password', {
      email: 'user@example.com'
    });

    expect(resetResponse.status).toBe(200);

    // Try to use invalid reset token
    const invalidTokens = [
      'invalid-token',
      'expired-token',
      '', // Empty token
      'a'.repeat(1000), // Very long token
    ];

    for (const token of invalidTokens) {
      try {
        const response = await axios.post('/api/auth/reset-password/confirm', {
          token,
          newPassword: 'newPassword123!'
        });

        expect(response.status).not.toBe(200);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    }
  });
});
```

### 4. CSRF Protection Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('CSRF Protection Testing', () => {
  it('should require CSRF token for state-changing operations', async () => {
    // Try to perform state-changing operation without CSRF token
    try {
      const response = await axios.post('/api/user/delete', {
        userId: '123'
      });

      expect(response.status).not.toBe(200);
    } catch (error: any) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toContain('CSRF');
    }
  });

  it('should validate CSRF token authenticity', async () => {
    const invalidTokens = [
      'invalid-csrf-token',
      '', // Empty token
      'a'.repeat(100), // Invalid format
      'csrf-token-from-different-session',
    ];

    for (const token of invalidTokens) {
      try {
        const response = await axios.post('/api/user/update', {
          name: 'Updated Name'
        }, {
          headers: {
            'X-CSRF-Token': token
          }
        });

        expect(response.status).not.toBe(200);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    }
  });

  it('should use SameSite cookie attribute', async () => {
    const response = await axios.post('/api/login', {
      email: 'user@example.com',
      password: 'password'
    });

    const setCookieHeader = response.headers['set-cookie'];
    const sessionCookie = setCookieHeader?.find(cookie =>
      cookie.includes('sessionId')
    );

    expect(sessionCookie).toContain('SameSite=Strict');
  });
});
```

### 5. Rate Limiting & DDoS Protection Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Rate Limiting & DDoS Protection', () => {
  it('should implement login rate limiting', async () => {
    const loginAttempts = [];

    // Generate 10 rapid login attempts
    for (let i = 0; i < 10; i++) {
      loginAttempts.push(
        axios.post('/api/login', {
          email: 'attacker@example.com',
          password: 'wrong-password'
        }).catch(err => err.response)
      );
    }

    const responses = await Promise.all(loginAttempts);

    // Should start rate limiting after 5 attempts
    const rateLimitedResponses = responses.filter(
      response => response.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  it('should implement API rate limiting', async () => {
    const apiCalls = [];

    // Generate 100 rapid API calls
    for (let i = 0; i < 100; i++) {
      apiCalls.push(
        axios.get('/api/public-endpoint').catch(err => err.response)
      );
    }

    const responses = await Promise.all(apiCalls);

    // Should implement rate limiting
    const rateLimitedResponses = responses.filter(
      response => response.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Check rate limit headers
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.headers['x-ratelimit-limit']).toBeDefined();
    expect(lastResponse.headers['x-ratelimit-remaining']).toBeDefined();
  });

  it('should handle resource exhaustion attacks', async () => {
    // Test large payload attack
    const largePayload = 'a'.repeat(10 * 1024 * 1024); // 10MB

    try {
      const response = await axios.post('/api/upload', {
        data: largePayload
      });

      expect(response.status).not.toBe(200);
    } catch (error: any) {
      expect(error.response.status).toBe(413); // Payload Too Large
    }
  });
});
```

### 6. Privilege Escalation Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Privilege Escalation Testing', () => {
  it('should prevent horizontal privilege escalation', async () => {
    // User A tries to access User B's data
    const userAToken = 'user-a-jwt-token';
    const userBId = 'user-b-id';

    try {
      const response = await axios.get(`/api/users/${userBId}/private-data`, {
        headers: { Authorization: `Bearer ${userAToken}` }
      });

      expect(response.status).not.toBe(200);
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });

  it('should prevent vertical privilege escalation', async () => {
    // Regular user tries to access admin endpoints
    const userToken = 'regular-user-jwt-token';

    const adminEndpoints = [
      '/api/admin/users',
      '/api/admin/settings',
      '/api/admin/logs',
      '/api/admin/system-info'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${userToken}` }
        });

        expect(response.status).not.toBe(200);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    }
  });

  it('should validate role-based access control', async () => {
    const roles = {
      admin: 'admin-jwt-token',
      moderator: 'moderator-jwt-token',
      user: 'user-jwt-token'
    };

    // Test permission matrix
    const permissions = [
      { endpoint: '/api/users', roles: ['admin', 'moderator'] },
      { endpoint: '/api/admin/settings', roles: ['admin'] },
      { endpoint: '/api/posts', roles: ['admin', 'moderator', 'user'] }
    ];

    for (const permission of permissions) {
      for (const [role, token] of Object.entries(roles)) {
        try {
          const response = await axios.get(permission.endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (permission.roles.includes(role)) {
            expect(response.status).toBe(200);
          } else {
            expect(response.status).toBe(403);
          }
        } catch (error: any) {
          if (!permission.roles.includes(role)) {
            expect(error.response.status).toBe(403);
          } else {
            throw error;
          }
        }
      }
    }
  });
});
```

## Automated Penetration Testing Pipeline

### OWASP ZAP Integration
```typescript
import { ZapClient } from 'zaproxy';

class AutomatedPenTest {
  private zap: ZapClient;

  constructor() {
    this.zap = new ZapClient({
      proxy: 'http://localhost:8080'
    });
  }

  async runFullScan(targetUrl: string): Promise<ScanResults> {
    // Start ZAP daemon
    await this.zap.core.newSession();

    // Spider the application
    const spiderId = await this.zap.spider.scan(targetUrl);
    await this.waitForSpiderComplete(spiderId);

    // Active security scan
    const scanId = await this.zap.ascan.scan(targetUrl);
    await this.waitForScanComplete(scanId);

    // Get results
    const alerts = await this.zap.core.alerts();

    return this.processResults(alerts);
  }

  private async waitForScanComplete(scanId: string): Promise<void> {
    let progress = 0;
    while (progress < 100) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      progress = await this.zap.ascan.status(scanId);
    }
  }

  private processResults(alerts: any[]): ScanResults {
    return {
      critical: alerts.filter(a => a.risk === 'High').length,
      high: alerts.filter(a => a.risk === 'Medium').length,
      medium: alerts.filter(a => a.risk === 'Low').length,
      low: alerts.filter(a => a.risk === 'Informational').length,
      details: alerts,
      timestamp: new Date()
    };
  }
}
```

### Attack Scenario Orchestration
```typescript
class AttackScenarioOrchestrator {
  private scenarios: AttackScenario[] = [
    new SQLInjectionAttack(),
    new XSSAttack(),
    new CSRFAttack(),
    new AuthBypassAttack(),
    new PrivilegeEscalationAttack(),
    new RateLimitBypassAttack()
  ];

  async runAllScenarios(target: string): Promise<AttackResults> {
    const results: AttackResult[] = [];

    for (const scenario of this.scenarios) {
      console.log(`Running ${scenario.name}...`);

      try {
        const result = await scenario.execute(target);
        results.push({
          scenario: scenario.name,
          success: result.success,
          vulnerabilities: result.vulnerabilities,
          evidence: result.evidence,
          severity: result.severity
        });
      } catch (error) {
        results.push({
          scenario: scenario.name,
          success: false,
          error: error.message,
          severity: 'info'
        });
      }
    }

    return this.generateReport(results);
  }

  private generateReport(results: AttackResult[]): AttackResults {
    const vulnerabilities = results.filter(r => r.success);
    const criticalFindings = vulnerabilities.filter(v => v.severity === 'critical');

    return {
      totalScenarios: results.length,
      vulnerabilitiesFound: vulnerabilities.length,
      criticalFindings: criticalFindings.length,
      overallRisk: this.calculateRiskScore(results),
      recommendations: this.generateRecommendations(results),
      detailedResults: results,
      timestamp: new Date()
    };
  }
}
```

## Threat Intelligence Integration

### Attack Pattern Database
```typescript
interface AttackPattern {
  id: string;
  name: string;
  category: 'injection' | 'auth' | 'xss' | 'csrf' | 'privilege' | 'dos';
  severity: 'critical' | 'high' | 'medium' | 'low';
  payloads: string[];
  detection: string[];
  mitigation: string[];
  cve_references: string[];
}

class ThreatIntelligence {
  private patterns: AttackPattern[] = [];

  async loadLatestPatterns(): Promise<void> {
    // Load from MITRE ATT&CK framework
    const mitrePatterns = await this.fetchMITREPatterns();

    // Load from OWASP
    const owaspPatterns = await this.fetchOWASPPatterns();

    // Load from custom threat feeds
    const customPatterns = await this.fetchCustomPatterns();

    this.patterns = [...mitrePatterns, ...owaspPatterns, ...customPatterns];
  }

  async generateTestCases(): Promise<TestCase[]> {
    return this.patterns.map(pattern => ({
      name: `${pattern.name} Defense Test`,
      category: pattern.category,
      severity: pattern.severity,
      payloads: pattern.payloads,
      expectedBehavior: 'block_and_log'
    }));
  }
}
```

## Real-time Attack Simulation

### Continuous Red Team Testing
```typescript
class ContinuousRedTeam {
  private attackQueue: AttackScenario[] = [];

  async scheduleAttacks(): Promise<void> {
    // Schedule different attack types throughout the day
    schedule.scheduleJob('0 */6 * * *', () => {
      this.runRandomAttack();
    });

    // Weekly comprehensive penetration test
    schedule.scheduleJob('0 2 * * 0', () => {
      this.runFullPenetrationTest();
    });

    // Monthly advanced persistent threat simulation
    schedule.scheduleJob('0 3 1 * *', () => {
      this.runAPTSimulation();
    });
  }

  private async runRandomAttack(): Promise<void> {
    const randomScenario = this.getRandomScenario();
    const results = await randomScenario.execute();

    if (results.vulnerabilitiesFound > 0) {
      await this.alertSecurityTeam(results);
    }

    await this.logResults(results);
  }
}
```

## Success Criteria

### Attack Simulation Metrics
- **Detection Rate**: 100% of simulated attacks detected
- **False Negative Rate**: < 1%
- **Response Time**: Security alerts triggered within 5 minutes
- **Mitigation Effectiveness**: 99%+ of attacks blocked
- **Coverage**: All OWASP Top 10 scenarios tested daily

### Key Performance Indicators
1. **Mean Time to Detection (MTTD)**: < 5 minutes
2. **Attack Success Rate**: < 1% (lower is better)
3. **Security Control Effectiveness**: > 99%
4. **Vulnerability Discovery Rate**: 10+ new findings per month
5. **Remediation Verification**: 100% of fixes verified through re-testing

## Usage Examples

### Run Attack Simulation
```bash
# Run all threat simulations
npm run threats:simulate

# Run specific attack type
npm run threats:simulate --type=injection

# Generate penetration test report
npm run threats:report

# Continuous monitoring mode
npm run threats:monitor
```

### Custom Attack Scenarios
```typescript
// Define custom attack scenario
const customAttack = new AttackScenario({
  name: 'Business Logic Bypass',
  category: 'logic',
  steps: [
    'Identify discount logic',
    'Test negative quantities',
    'Test decimal quantities',
    'Test cart manipulation'
  ]
});

await threatSimulator.addScenario(customAttack);
```

## Integration with Security Pipeline

### Pre-deployment Threat Testing
```typescript
export async function preDeploymentThreatTest(): Promise<void> {
  const threatSimulator = new ThreatSimulator();

  // Run critical attack scenarios
  const results = await threatSimulator.runCriticalScenarios();

  if (results.criticalVulnerabilities > 0) {
    throw new Error('Critical vulnerabilities found - deployment blocked');
  }
}
```

## Best Practices

1. **Safe Testing Environment**: Never test against production
2. **Controlled Payloads**: Use safe, non-destructive test data
3. **Regular Updates**: Keep attack patterns current with latest threats
4. **Documentation**: Record all test scenarios and results
5. **Collaboration**: Work closely with development and security teams
6. **Responsible Disclosure**: Report findings through proper channels

## Related Agents
- **Security Scanner Agent**: For vulnerability detection
- **Compliance Auditor Agent**: For regulatory testing
- **Reliability Monitor Agent**: For resilience testing
- **Performance Profiler Agent**: For security performance impact