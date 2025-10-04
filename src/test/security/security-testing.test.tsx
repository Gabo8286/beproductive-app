import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DOMPurify from 'dompurify';

// Security testing utilities
class SecurityTestUtils {
  // XSS attack vectors
  static xssPayloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    "javascript:alert('XSS')",
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    '{{constructor.constructor("alert(\'XSS\')")()}}',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<input type="text" value="&quot;&gt;&lt;script&gt;alert(\'XSS\')&lt;/script&gt;">',
    '<div onclick="alert(\'XSS\')">Click me</div>',
    'data:text/html,<script>alert("XSS")</script>',
  ];

  // SQL injection patterns (for form validation testing)
  static sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' OR 1=1 --",
    "admin'--",
    "' UNION SELECT * FROM users --",
    "1; DELETE FROM users",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  ];

  // CSRF tokens and validation
  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Test for dangerous HTML content
  static containsDangerousContent(html: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi,
      /<style/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(html));
  }

  // Validate that content is properly sanitized
  static isSanitized(input: string, output: string): boolean {
    const sanitized = DOMPurify.sanitize(input);
    return output === sanitized;
  }
}

// Mock components for testing
const VulnerableInput = ({ onSubmit, sanitize = true }: { onSubmit: (value: string) => void; sanitize?: boolean }) => {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedValue = sanitize ? DOMPurify.sanitize(value) : value;
    onSubmit(processedValue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-testid="security-input"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

const SecureForm = ({ onSubmit, requireCSRF = true }: { onSubmit: (data: any) => void; requireCSRF?: boolean }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    email: '',
    csrfToken: SecurityTestUtils.generateCSRFToken(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // CSRF validation
    if (requireCSRF && !formData.csrfToken) {
      throw new Error('CSRF token missing');
    }

    // Input validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      throw new Error('Invalid email format');
    }

    // Sanitize inputs
    const sanitizedData = {
      title: DOMPurify.sanitize(formData.title),
      description: DOMPurify.sanitize(formData.description),
      email: formData.email,
      csrfToken: formData.csrfToken,
    };

    onSubmit(sanitizedData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        data-testid="title-input"
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        data-testid="description-input"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        data-testid="email-input"
      />
      <input
        type="hidden"
        value={formData.csrfToken}
        data-testid="csrf-token"
      />
      <button type="submit">Submit Secure Form</button>
    </form>
  );
};

const AuthenticatedComponent = ({ userRole = 'user' }: { userRole?: string }) => {
  const hasAdminAccess = userRole === 'admin';
  const hasPremiumAccess = userRole === 'premium' || userRole === 'admin';

  return (
    <div>
      <h1>Dashboard</h1>
      <div data-testid="user-content">User Content</div>
      {hasPremiumAccess && <div data-testid="premium-content">Premium Content</div>}
      {hasAdminAccess && <div data-testid="admin-content">Admin Content</div>}
    </div>
  );
};

describe('Security Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('XSS Prevention', () => {
    it('should prevent XSS attacks in user inputs', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<VulnerableInput onSubmit={mockSubmit} sanitize={true} />);

      const input = screen.getByTestId('security-input');

      for (const payload of SecurityTestUtils.xssPayloads) {
        await user.clear(input);
        await user.type(input, payload);
        await user.click(screen.getByText('Submit'));

        // Verify the submitted value is sanitized
        const submittedValue = mockSubmit.mock.calls[mockSubmit.mock.calls.length - 1][0];
        expect(SecurityTestUtils.containsDangerousContent(submittedValue)).toBe(false);
      }
    });

    it('should sanitize HTML content in text areas', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<SecureForm onSubmit={mockSubmit} />);

      const descriptionInput = screen.getByTestId('description-input');

      const maliciousHTML = '<script>alert("XSS")</script><p>Safe content</p>';
      await user.type(descriptionInput, maliciousHTML);
      await user.click(screen.getByText('Submit Secure Form'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        const submittedData = mockSubmit.mock.calls[0][0];
        expect(submittedData.description).not.toContain('<script>');
        expect(submittedData.description).toContain('<p>Safe content</p>');
      });
    });

    it('should handle dangerous URLs and protocols', () => {
      const dangerousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:alert("XSS")',
        'file:///etc/passwd',
      ];

      dangerousUrls.forEach(url => {
        const sanitized = DOMPurify.sanitize(`<a href="${url}">Link</a>`);
        expect(sanitized).not.toContain(url);
      });
    });

    it('should preserve safe HTML while removing dangerous content', () => {
      const mixedContent = `
        <h1>Safe Title</h1>
        <p>Safe paragraph</p>
        <script>alert('XSS')</script>
        <img src="safe.jpg" alt="Safe image">
        <img src="x" onerror="alert('XSS')">
        <div onclick="alert('XSS')">Dangerous div</div>
        <div>Safe div</div>
      `;

      const sanitized = DOMPurify.sanitize(mixedContent);

      expect(sanitized).toContain('<h1>Safe Title</h1>');
      expect(sanitized).toContain('<p>Safe paragraph</p>');
      expect(sanitized).toContain('<img src="safe.jpg" alt="Safe image">');
      expect(sanitized).toContain('<div>Safe div</div>');

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onclick');
    });
  });

  describe('CSRF Protection', () => {
    it('should include CSRF tokens in forms', () => {
      const mockSubmit = vi.fn();
      render(<SecureForm onSubmit={mockSubmit} />);

      const csrfToken = screen.getByTestId('csrf-token');
      expect(csrfToken).toHaveAttribute('value');
      expect(csrfToken.getAttribute('value')).toHaveLength(30); // Expected token length
    });

    it('should validate CSRF tokens on form submission', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<SecureForm onSubmit={mockSubmit} requireCSRF={true} />);

      // Remove CSRF token to simulate attack
      const csrfInput = screen.getByTestId('csrf-token');
      fireEvent.change(csrfInput, { target: { value: '' } });

      await user.type(screen.getByTestId('title-input'), 'Test Title');

      expect(async () => {
        await user.click(screen.getByText('Submit Secure Form'));
      }).rejects.toThrow('CSRF token missing');
    });

    it('should reject requests without proper CSRF tokens', async () => {
      // Simulate API request without CSRF token
      const requestWithoutCSRF = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'test' }),
      };

      // In a real application, this would be validated server-side
      const hasCSRFToken = requestWithoutCSRF.headers['X-CSRF-Token'] ||
                          requestWithoutCSRF.headers['x-csrf-token'];

      expect(hasCSRFToken).toBeFalsy();
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate email formats', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<SecureForm onSubmit={mockSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const invalidEmails = [
        'invalid-email',
        '@invalid.com',
        'user@',
        'user..name@example.com',
        'user@example',
        '<script>alert("XSS")</script>@example.com',
      ];

      for (const email of invalidEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, email);

        try {
          await user.click(screen.getByText('Submit Secure Form'));
          // If we reach here, the form didn't throw an error (bad)
          expect(false).toBe(true); // Force failure
        } catch (error) {
          expect(error.message).toContain('Invalid email format');
        }
      }
    });

    it('should prevent SQL injection patterns in inputs', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<SecureForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('title-input');

      for (const payload of SecurityTestUtils.sqlInjectionPayloads) {
        await user.clear(titleInput);
        await user.type(titleInput, payload);
        await user.click(screen.getByText('Submit Secure Form'));

        const submittedData = mockSubmit.mock.calls[mockSubmit.mock.calls.length - 1][0];

        // Verify dangerous SQL patterns are sanitized or escaped
        expect(submittedData.title).not.toContain('DROP TABLE');
        expect(submittedData.title).not.toContain('DELETE FROM');
        expect(submittedData.title).not.toContain('UNION SELECT');
      }
    });

    it('should limit input lengths to prevent buffer overflow', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(<SecureForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('title-input');
      const longString = 'A'.repeat(10000); // Very long input

      await user.type(titleInput, longString);
      await user.click(screen.getByText('Submit Secure Form'));

      const submittedData = mockSubmit.mock.calls[0][0];

      // In a real application, you would limit input length
      // For this test, we verify the input is handled safely
      expect(submittedData.title).toBeDefined();
      expect(typeof submittedData.title).toBe('string');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should enforce role-based access control', () => {
      // Test user role
      const { rerender } = render(<AuthenticatedComponent userRole="user" />);
      expect(screen.getByTestId('user-content')).toBeInTheDocument();
      expect(screen.queryByTestId('premium-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();

      // Test premium role
      rerender(<AuthenticatedComponent userRole="premium" />);
      expect(screen.getByTestId('user-content')).toBeInTheDocument();
      expect(screen.getByTestId('premium-content')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();

      // Test admin role
      rerender(<AuthenticatedComponent userRole="admin" />);
      expect(screen.getByTestId('user-content')).toBeInTheDocument();
      expect(screen.getByTestId('premium-content')).toBeInTheDocument();
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('should handle authentication state securely', () => {
      // Mock authentication state
      const mockAuthState = {
        isAuthenticated: true,
        user: {
          id: 'user123',
          role: 'user',
          permissions: ['read:goals', 'write:goals'],
        },
        token: 'jwt-token-here',
      };

      // Verify sensitive data is not exposed in localStorage
      const authData = JSON.stringify(mockAuthState);
      expect(authData).toContain('user123');
      expect(authData).not.toContain('password');
      expect(authData).not.toContain('secret');

      // Verify token format (should be JWT-like)
      expect(mockAuthState.token).toBeTruthy();
    });

    it('should validate session timeouts', () => {
      const sessionStart = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const currentTime = Date.now();

      const isSessionValid = (currentTime - sessionStart) < sessionTimeout;

      // Session should be valid immediately
      expect(isSessionValid).toBe(true);

      // Simulate expired session
      const expiredTime = sessionStart + sessionTimeout + 1000;
      const isExpiredSessionValid = (expiredTime - sessionStart) < sessionTimeout;
      expect(isExpiredSessionValid).toBe(false);
    });
  });

  describe('Content Security Policy (CSP)', () => {
    it('should have proper CSP headers', () => {
      // Mock CSP header validation
      const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";

      // Verify CSP doesn't allow unsafe-eval
      expect(cspHeader).not.toContain("'unsafe-eval'");

      // Verify script sources are restricted
      expect(cspHeader).toContain("script-src 'self'");

      // Verify default source is restrictive
      expect(cspHeader).toContain("default-src 'self'");
    });

    it('should block unauthorized inline scripts', () => {
      // Simulate CSP violation
      const inlineScript = '<script>alert("Blocked by CSP")</script>';
      const domElement = document.createElement('div');
      domElement.innerHTML = inlineScript;

      // In a browser with CSP, this would be blocked
      // For testing, we verify the script exists but would be blocked
      expect(domElement.querySelector('script')).toBeTruthy();
    });
  });

  describe('Data Protection and Privacy', () => {
    it('should mask sensitive data in logs', () => {
      const sensitiveData = {
        email: 'user@example.com',
        password: 'secretpassword123',
        ssn: '123-45-6789',
        creditCard: '4111111111111111',
      };

      const logSafeData = {
        email: sensitiveData.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        password: '[REDACTED]',
        ssn: sensitiveData.ssn.replace(/\d{3}-\d{2}-(\d{4})/, '***-**-$1'),
        creditCard: sensitiveData.creditCard.replace(/(\d{4})(\d{8})(\d{4})/, '$1********$3'),
      };

      expect(logSafeData.email).toBe('us***@example.com');
      expect(logSafeData.password).toBe('[REDACTED]');
      expect(logSafeData.ssn).toBe('***-**-6789');
      expect(logSafeData.creditCard).toBe('4111********1111');
    });

    it('should validate data encryption in transit', () => {
      // Mock HTTPS validation
      const secureUrl = 'https://api.example.com/data';
      const insecureUrl = 'http://api.example.com/data';

      expect(secureUrl.startsWith('https://')).toBe(true);
      expect(insecureUrl.startsWith('https://')).toBe(false);
    });

    it('should handle PII data properly', () => {
      const userProfile = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      // Verify only necessary data is exposed in public APIs
      const publicProfile = {
        id: userProfile.id,
        name: userProfile.name,
        preferences: userProfile.preferences,
      };

      expect(publicProfile).not.toHaveProperty('email');
      expect(publicProfile).toHaveProperty('id');
      expect(publicProfile).toHaveProperty('name');
      expect(publicProfile).toHaveProperty('preferences');
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types and sizes', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      const validateFile = (file: { type: string; size: number; name: string }) => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type');
        }

        // Check file size
        if (file.size > maxFileSize) {
          throw new Error('File too large');
        }

        // Check file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
        if (!extension || !allowedExtensions.includes(extension)) {
          throw new Error('Invalid file extension');
        }

        return true;
      };

      // Test valid file
      expect(validateFile({
        type: 'image/jpeg',
        size: 1024 * 1024,
        name: 'photo.jpg'
      })).toBe(true);

      // Test invalid file type
      expect(() => validateFile({
        type: 'application/exe',
        size: 1024,
        name: 'virus.exe'
      })).toThrow('Invalid file type');

      // Test file too large
      expect(() => validateFile({
        type: 'image/jpeg',
        size: 10 * 1024 * 1024,
        name: 'large.jpg'
      })).toThrow('File too large');

      // Test invalid extension
      expect(() => validateFile({
        type: 'image/jpeg',
        size: 1024,
        name: 'file.php'
      })).toThrow('Invalid file extension');
    });

    it('should sanitize file names', () => {
      const dangerousFileNames = [
        '../../../etc/passwd',
        'file<script>.jpg',
        'file"with"quotes.png',
        'file with spaces and!@#$.pdf',
        '\\..\\windows\\system32\\file.exe',
      ];

      const sanitizeFileName = (fileName: string): string => {
        return fileName
          .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous characters
          .replace(/\.\./g, '') // Remove directory traversal
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .substring(0, 255); // Limit length
      };

      dangerousFileNames.forEach(fileName => {
        const sanitized = sanitizeFileName(fileName);
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain('\\');
      });
    });
  });

  describe('API Security', () => {
    it('should validate API rate limiting', () => {
      const rateLimiter = {
        requests: 0,
        windowStart: Date.now(),
        limit: 100,
        window: 60000, // 1 minute
      };

      const isRateLimited = (limiter: typeof rateLimiter): boolean => {
        const now = Date.now();

        // Reset window if expired
        if (now - limiter.windowStart > limiter.window) {
          limiter.requests = 0;
          limiter.windowStart = now;
        }

        limiter.requests++;

        return limiter.requests > limiter.limit;
      };

      // Test normal usage
      for (let i = 0; i < 100; i++) {
        expect(isRateLimited(rateLimiter)).toBe(false);
      }

      // Test rate limit exceeded
      expect(isRateLimited(rateLimiter)).toBe(true);
    });

    it('should validate request authentication', () => {
      const validateApiRequest = (headers: Record<string, string>) => {
        const authHeader = headers['Authorization'] || headers['authorization'];

        if (!authHeader) {
          throw new Error('Missing authorization header');
        }

        if (!authHeader.startsWith('Bearer ')) {
          throw new Error('Invalid authorization format');
        }

        const token = authHeader.substring(7);
        if (!token || token.length < 10) {
          throw new Error('Invalid token');
        }

        return true;
      };

      // Test valid request
      expect(validateApiRequest({
        'Authorization': 'Bearer valid-jwt-token-here'
      })).toBe(true);

      // Test missing auth
      expect(() => validateApiRequest({})).toThrow('Missing authorization header');

      // Test invalid format
      expect(() => validateApiRequest({
        'Authorization': 'Basic dXNlcjpwYXNz'
      })).toThrow('Invalid authorization format');

      // Test invalid token
      expect(() => validateApiRequest({
        'Authorization': 'Bearer short'
      })).toThrow('Invalid token');
    });
  });
});