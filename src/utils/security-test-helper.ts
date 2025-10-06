export class SecurityTestHelper {
  private static instance: SecurityTestHelper;

  static getInstance(): SecurityTestHelper {
    if (!this.instance) {
      this.instance = new SecurityTestHelper();
    }
    return this.instance;
  }

  /**
   * Common XSS payloads for testing
   */
  getXSSPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//",
      '<div onmouseover="alert(\'XSS\')">Hover me</div>',
      '<input type="image" src=x onerror=alert("XSS")>',
      '<style>@import"javascript:alert(\'XSS\')";</style>',
      '<link rel=stylesheet href="javascript:alert(\'XSS\')">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">'
    ];
  }

  /**
   * SQL injection payloads for testing
   */
  getSQLInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "' OR 1=1 --",
      "1'; WAITFOR DELAY '00:00:05' --",
      "' OR SLEEP(5) --",
      "' UNION SELECT username, password FROM users --",
      "1' AND (SELECT COUNT(*) FROM users) > 0 --",
      "' OR 'x'='x",
      "1' AND EXTRACTVALUE(0x0a,CONCAT(0x0a,(SELECT version()))) --",
      "' OR (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
      "'; INSERT INTO users (username, password) VALUES ('hacker', 'password'); --"
    ];
  }

  /**
   * Path traversal payloads for testing
   */
  getPathTraversalPayloads(): string[] {
    return [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
      'file:///etc/passwd',
      '/var/log/apache/access.log',
      'C:\\windows\\system32\\config\\sam'
    ];
  }

  /**
   * Command injection payloads for testing
   */
  getCommandInjectionPayloads(): string[] {
    return [
      '; cat /etc/passwd',
      '| whoami',
      '&& ls -la',
      '$(id)',
      '`id`',
      '; rm -rf /',
      '|| ping -c 10 127.0.0.1',
      '; shutdown -h now',
      '& net user hacker password /add',
      '| powershell -c "Get-Process"'
    ];
  }

  /**
   * NoSQL injection payloads for testing
   */
  getNoSQLInjectionPayloads(): string[] {
    return [
      '{"$gt":""}',
      '{"$ne":null}',
      '{"$regex":".*"}',
      '{"$where":"sleep(1000)"}',
      '{"$or":[{},{"a":"a"}]}',
      '{"$gt":"", "$lt":"zzz"}',
      '{"$exists":true}',
      '{"$in":["admin","user"]}',
      '{"username":{"$ne":"foo"},"password":{"$ne":"bar"}}',
      '{"$or":[{"username":"admin"},{"username":{"$exists":true}}]}'
    ];
  }

  /**
   * LDAP injection payloads for testing
   */
  getLDAPInjectionPayloads(): string[] {
    return [
      '*)(uid=*',
      '*)(|(uid=*))',
      '*)(&(uid=*',
      ')(cn=*))(|(cn=*',
      '*)((|(*)(uid=*)',
      '*)(objectClass=*',
      '*))%00',
      '*(|(mail=*))',
      '*(|(objectClass=*))'
    ];
  }

  /**
   * Generate weak passwords for testing
   */
  getWeakPasswords(): string[] {
    return [
      '123456',
      'password',
      'qwerty',
      'abc123',
      '111111',
      'password123',
      'admin',
      'test',
      'user',
      'guest',
      'root',
      'toor',
      '12345678',
      'welcome',
      'login',
      'passw0rd',
      'letmein',
      'monkey',
      'dragon',
      'master'
    ];
  }

  /**
   * Test if string contains potentially dangerous content
   */
  containsDangerousContent(content: string): boolean {
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi
    ];

    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Validate if content has been properly sanitized
   */
  isSanitized(original: string, sanitized: string): boolean {
    // Original had dangerous content but sanitized doesn't
    return this.containsDangerousContent(original) && !this.containsDangerousContent(sanitized);
  }

  /**
   * Generate test user credentials
   */
  getTestCredentials(): Array<{email: string, password: string, role: string}> {
    return [
      {
        email: 'admin@test.beproductive.com',
        password: 'AdminTest123!',
        role: 'admin'
      },
      {
        email: 'user@test.beproductive.com',
        password: 'UserTest123!',
        role: 'user'
      },
      {
        email: 'viewer@test.beproductive.com',
        password: 'ViewerTest123!',
        role: 'viewer'
      },
      {
        email: 'manager@test.beproductive.com',
        password: 'ManagerTest123!',
        role: 'manager'
      }
    ];
  }

  /**
   * Test rate limiting implementation
   */
  async testRateLimit(
    requestFn: () => Promise<Response>,
    maxRequests: number = 100,
    timeWindow: number = 60000 // 1 minute
  ): Promise<{
    totalRequests: number;
    rateLimitedRequests: number;
    firstRateLimitAt: number | null;
  }> {
    const requests: Promise<Response>[] = [];
    const startTime = Date.now();

    // Generate requests
    for (let i = 0; i < maxRequests; i++) {
      requests.push(requestFn());
    }

    const responses = await Promise.all(requests);

    let firstRateLimitAt: number | null = null;
    let rateLimitedCount = 0;

    responses.forEach((response, index) => {
      if (response.status === 429) {
        rateLimitedCount++;
        if (firstRateLimitAt === null) {
          firstRateLimitAt = index;
        }
      }
    });

    return {
      totalRequests: maxRequests,
      rateLimitedRequests: rateLimitedCount,
      firstRateLimitAt
    };
  }

  /**
   * Test session security
   */
  validateSessionSecurity(cookies: Array<{name: string, value: string, httpOnly?: boolean, secure?: boolean, sameSite?: string}>): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    cookies.forEach(cookie => {
      if (cookie.name.toLowerCase().includes('session') || cookie.name.toLowerCase().includes('token')) {
        if (!cookie.httpOnly) {
          issues.push(`Cookie ${cookie.name} should be httpOnly`);
        }
        if (!cookie.secure && process.env.NODE_ENV === 'production') {
          issues.push(`Cookie ${cookie.name} should be secure in production`);
        }
        if (cookie.sameSite !== 'Strict' && cookie.sameSite !== 'Lax') {
          issues.push(`Cookie ${cookie.name} should have proper sameSite attribute`);
        }
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    score: number; // 0-5
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Password should contain uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Password should contain numbers');

    if (/[^a-zA-Z\d]/.test(password)) score++;
    else feedback.push('Password should contain special characters');

    // Common password check
    const commonPasswords = this.getWeakPasswords();
    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.min(score, 1);
      feedback.push('Password is too common');
    }

    return {
      score: Math.max(0, Math.min(5, score)),
      feedback,
      isStrong: score >= 4 && feedback.length === 0
    };
  }

  /**
   * Check for information disclosure in error messages
   */
  checkErrorDisclosure(errorMessage: string): {
    safe: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const dangerousPatterns = [
      /Error: .*/gi,
      /at .*/gi,
      /\/Users\/.*/gi,
      /C:\\.*/gi,
      /node_modules/gi,
      /stack trace/gi,
      /database error/gi,
      /sql error/gi,
      /mysql/gi,
      /postgresql/gi,
      /mongodb/gi,
      /Internal Server Error/gi
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(errorMessage)) {
        issues.push(`Error message contains potentially sensitive information: ${pattern.source}`);
      }
    });

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Generate malicious file upload test cases
   */
  getMaliciousFiles(): Array<{name: string, content: string, mimeType: string, expectedBlock: boolean}> {
    return [
      {
        name: 'malware.exe',
        content: 'MZ\x90\x00\x03\x00\x00\x00',
        mimeType: 'application/x-executable',
        expectedBlock: true
      },
      {
        name: 'script.php',
        content: '<?php system($_GET["cmd"]); ?>',
        mimeType: 'application/x-php',
        expectedBlock: true
      },
      {
        name: 'virus.bat',
        content: '@echo off\nformat c: /y',
        mimeType: 'application/x-bat',
        expectedBlock: true
      },
      {
        name: 'shell.jsp',
        content: '<%@ page import="java.io.*" %>',
        mimeType: 'application/x-jsp',
        expectedBlock: true
      },
      {
        name: 'backdoor.asp',
        content: '<%eval request("cmd")%>',
        mimeType: 'application/x-asp',
        expectedBlock: true
      },
      {
        name: 'huge-file.txt',
        content: 'A'.repeat(100 * 1024 * 1024), // 100MB
        mimeType: 'text/plain',
        expectedBlock: true
      },
      {
        name: 'normal-file.txt',
        content: 'This is a normal text file',
        mimeType: 'text/plain',
        expectedBlock: false
      }
    ];
  }

  /**
   * Test CSRF protection
   */
  async testCSRFProtection(
    apiCall: (csrfToken?: string) => Promise<Response>
  ): Promise<{
    protectedWithoutToken: boolean;
    protectedWithInvalidToken: boolean;
  }> {
    // Test without CSRF token
    const responseWithoutToken = await apiCall();
    const protectedWithoutToken = responseWithoutToken.status === 403 || responseWithoutToken.status === 400;

    // Test with invalid CSRF token
    const responseWithInvalidToken = await apiCall('invalid-csrf-token');
    const protectedWithInvalidToken = responseWithInvalidToken.status === 403 || responseWithInvalidToken.status === 400;

    return {
      protectedWithoutToken,
      protectedWithInvalidToken
    };
  }

  /**
   * Validate security headers
   */
  validateSecurityHeaders(headers: Record<string, string>): {
    score: number;
    missing: string[];
    present: string[];
  } {
    const requiredHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-xss-protection': '1; mode=block',
      'content-security-policy': null, // Just check presence
      'strict-transport-security': null, // Only required in production
      'referrer-policy': ['strict-origin-when-cross-origin', 'strict-origin', 'no-referrer']
    };

    const present: string[] = [];
    const missing: string[] = [];

    Object.entries(requiredHeaders).forEach(([header, expectedValue]) => {
      const actualValue = headers[header.toLowerCase()];

      if (actualValue) {
        if (expectedValue === null) {
          present.push(header);
        } else if (Array.isArray(expectedValue)) {
          if (expectedValue.some(val => actualValue.includes(val))) {
            present.push(header);
          } else {
            missing.push(`${header} (invalid value: ${actualValue})`);
          }
        } else if (actualValue.includes(expectedValue)) {
          present.push(header);
        } else {
          missing.push(`${header} (invalid value: ${actualValue})`);
        }
      } else {
        // HSTS only required in production
        if (header === 'strict-transport-security' && process.env.NODE_ENV !== 'production') {
          // Skip
        } else {
          missing.push(header);
        }
      }
    });

    const score = Math.round((present.length / Object.keys(requiredHeaders).length) * 100);

    return { score, missing, present };
  }
}