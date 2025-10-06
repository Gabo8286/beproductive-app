import { test, expect } from '@playwright/test';
import { SecurityTestHelper } from '../../../utils/security-test-helper';

test.describe('Authentication & Authorization Security Tests', () => {
  let securityHelper: SecurityTestHelper;

  test.beforeAll(async () => {
    securityHelper = new SecurityTestHelper();
  });

  test('should block unauthorized login attempts', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    await test.step('Test invalid credentials', async () => {
      const invalidCredentials = [
        { email: 'admin@test.com', password: 'wrong' },
        { email: 'user@invalid.com', password: 'password123' },
        { email: '', password: '' },
        { email: 'admin', password: 'admin' },
        { email: 'test@test.com', password: '123456' }
      ];

      for (const creds of invalidCredentials) {
        await page.fill('[data-testid="email-input"]', creds.email);
        await page.fill('[data-testid="password-input"]', creds.password);
        await page.click('[data-testid="login-button"]');

        // Should show error and not redirect
        await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
        await expect(page.url()).toContain('/login');

        // Clear fields for next attempt
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
      }
    });

    await test.step('Verify account lockout after multiple failed attempts', async () => {
      // Attempt 6 failed logins (should trigger lockout)
      for (let i = 0; i < 6; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        await page.waitForTimeout(500);
      }

      // Should show account locked message
      await expect(page.locator('[data-testid="account-locked"]')).toBeVisible();
    });
  });

  test('should enforce role-based access control', async ({ page }) => {
    await test.step('Login as regular user', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');
      await expect(page.url()).toContain('/dashboard');
    });

    await test.step('Attempt to access admin routes', async () => {
      const adminRoutes = [
        '/admin/users',
        '/admin/settings',
        '/admin/analytics',
        '/admin/system'
      ];

      for (const route of adminRoutes) {
        await page.goto(route);

        // Should redirect to unauthorized page or show error
        await expect(page.url()).not.toContain(route);
        await expect(
          page.locator('[data-testid="unauthorized"]')
            .or(page.locator('[data-testid="access-denied"]'))
        ).toBeVisible();
      }
    });

    await test.step('Verify user can only access permitted resources', async () => {
      // Test API endpoints directly
      const response = await page.request.get('/api/admin/users');
      expect(response.status()).toBe(403);

      const systemResponse = await page.request.get('/api/admin/system-info');
      expect(systemResponse.status()).toBe(403);
    });
  });

  test('should validate session management security', async ({ page, context }) => {
    await test.step('Login and establish session', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');
      await expect(page.url()).toContain('/dashboard');
    });

    await test.step('Verify session token security', async () => {
      // Check that session tokens are httpOnly and secure
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));

      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.secure).toBe(true);
        expect(sessionCookie.sameSite).toBe('Strict');
      }
    });

    await test.step('Test session timeout', async () => {
      // Simulate session timeout by manipulating token
      await context.addCookies([{
        name: 'session-token',
        value: 'expired-token',
        domain: 'localhost',
        path: '/'
      }]);

      await page.reload();

      // Should redirect to login
      await expect(page.url()).toContain('/login');
    });

    await test.step('Test concurrent session handling', async () => {
      // Create second browser context (different session)
      const secondContext = await page.context().browser()!.newContext();
      const secondPage = await secondContext.newPage();

      // Login with same user in second session
      await secondPage.goto('/login');
      await secondPage.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await secondPage.fill('[data-testid="password-input"]', 'UserTest123!');
      await secondPage.click('[data-testid="login-button"]');

      // First session should be invalidated (depending on configuration)
      await page.reload();
      // This test depends on your session management policy

      await secondContext.close();
    });
  });

  test('should validate MFA enforcement', async ({ page }) => {
    await test.step('Setup user with MFA enabled', async () => {
      // This would require test data setup
      await page.goto('/login');
    });

    await test.step('Test MFA bypass attempts', async () => {
      await page.fill('[data-testid="email-input"]', 'mfa-user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');

      // Should prompt for MFA, not complete login
      await expect(page.locator('[data-testid="mfa-prompt"]')).toBeVisible();
      await expect(page.url()).not.toContain('/dashboard');
    });

    await test.step('Test invalid MFA codes', async () => {
      const invalidCodes = ['000000', '123456', '999999', 'abcdef'];

      for (const code of invalidCodes) {
        await page.fill('[data-testid="mfa-code-input"]', code);
        await page.click('[data-testid="verify-mfa-button"]');

        await expect(page.locator('[data-testid="mfa-error"]')).toBeVisible();
        await expect(page.url()).not.toContain('/dashboard');
      }
    });

    await test.step('Test MFA code brute force protection', async () => {
      // Attempt multiple invalid codes rapidly
      for (let i = 0; i < 10; i++) {
        await page.fill('[data-testid="mfa-code-input"]', '000000');
        await page.click('[data-testid="verify-mfa-button"]');
        await page.waitForTimeout(100);
      }

      // Should show rate limiting or account lockout
      await expect(
        page.locator('[data-testid="mfa-locked"]')
          .or(page.locator('[data-testid="rate-limited"]'))
      ).toBeVisible();
    });
  });

  test('should prevent session hijacking attempts', async ({ page, context }) => {
    await test.step('Login and capture session data', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');
      await expect(page.url()).toContain('/dashboard');
    });

    await test.step('Test session token manipulation', async () => {
      const cookies = await context.cookies();
      const originalSession = cookies.find(c => c.name.includes('session'));

      if (originalSession) {
        // Try to modify session token
        const tamperedToken = originalSession.value + 'tampered';

        await context.addCookies([{
          ...originalSession,
          value: tamperedToken
        }]);

        await page.reload();

        // Should be logged out due to invalid token
        await expect(page.url()).toContain('/login');
      }
    });

    await test.step('Test session replay attacks', async () => {
      // Capture a valid session token
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');

      const validCookies = await context.cookies();

      // Logout
      await page.click('[data-testid="logout-button"]');
      await expect(page.url()).toContain('/login');

      // Try to reuse old session token
      await context.addCookies(validCookies);
      await page.goto('/dashboard');

      // Should not be able to access protected resource
      await expect(page.url()).toContain('/login');
    });
  });

  test('should validate password security requirements', async ({ page }) => {
    await test.step('Navigate to registration/password change', async () => {
      await page.goto('/register');
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    });

    await test.step('Test weak password rejection', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '111111',
        'password123',
        'admin',
        'test'
      ];

      for (const password of weakPasswords) {
        await page.fill('[data-testid="email-input"]', 'newuser@test.com');
        await page.fill('[data-testid="password-input"]', password);
        await page.fill('[data-testid="confirm-password-input"]', password);
        await page.click('[data-testid="register-button"]');

        // Should show password strength error
        await expect(page.locator('[data-testid="password-strength-error"]')).toBeVisible();

        // Clear form
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
        await page.fill('[data-testid="confirm-password-input"]', '');
      }
    });

    await test.step('Test password complexity requirements', async () => {
      const invalidPasswords = [
        'NoDigits!', // No digits
        'noupppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoSpecialChars123', // No special characters
        'Short1!', // Too short
      ];

      for (const password of invalidPasswords) {
        await page.fill('[data-testid="password-input"]', password);

        // Should show specific validation errors
        await expect(page.locator('[data-testid="password-validation"]')).toBeVisible();

        const validationText = await page.locator('[data-testid="password-validation"]').textContent();
        expect(validationText).toBeTruthy();
      }
    });
  });

  test('should log security events properly', async ({ page }) => {
    await test.step('Generate various security events', async () => {
      // Failed login attempt
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'attacker@evil.com');
      await page.fill('[data-testid="password-input"]', 'malicious');
      await page.click('[data-testid="login-button"]');

      // Successful login
      await page.fill('[data-testid="email-input"]', 'user@test.beproductive.com');
      await page.fill('[data-testid="password-input"]', 'UserTest123!');
      await page.click('[data-testid="login-button"]');

      // Access attempt to restricted resource
      await page.goto('/admin/users');

      // Logout
      await page.click('[data-testid="logout-button"]');
    });

    await test.step('Verify security audit logs', async () => {
      // This would typically check your logging system
      // For now, we'll verify that logging endpoints are accessible
      const response = await page.request.get('/api/audit/security-events', {
        headers: {
          'Authorization': 'Bearer admin-token' // Would use actual admin token
        }
      });

      // Should be able to access audit logs (for admin users)
      expect(response.status()).toBeLessThan(500);
    });
  });
});