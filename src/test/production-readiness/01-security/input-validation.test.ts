import { test, expect } from '@playwright/test';

test.describe('Input Validation Security Tests', () => {
  const maliciousPayloads = {
    xss: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//",
      '<div onmouseover="alert(\'XSS\')">Hover me</div>',
      '<input type="image" src=x onerror=alert("XSS")>'
    ],
    sqlInjection: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "' OR 1=1 --",
      "1'; WAITFOR DELAY '00:00:05' --",
      "' OR SLEEP(5) --",
      "' UNION SELECT username, password FROM users --",
      "1' AND (SELECT COUNT(*) FROM users) > 0 --",
      "' OR 'x'='x",
      "1' AND EXTRACTVALUE(0x0a,CONCAT(0x0a,(SELECT version()))) --"
    ],
    pathTraversal: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
    ],
    commandInjection: [
      '; cat /etc/passwd',
      '| whoami',
      '&& ls -la',
      '$(id)',
      '`id`',
      '; rm -rf /',
      '|| ping -c 10 127.0.0.1',
      '; shutdown -h now'
    ],
    ldapInjection: [
      '*)(uid=*',
      '*)(|(uid=*))',
      '*)(&(uid=*',
      ')(cn=*))(|(cn=*',
      '*)((|(*)(uid=*))'
    ]
  };

  test('should sanitize XSS payloads in form inputs', async ({ page }) => {
    await test.step('Navigate to task creation form', async () => {
      await page.goto('/tasks/new');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    });

    await test.step('Test XSS payloads in text inputs', async () => {
      for (const payload of maliciousPayloads.xss) {
        // Test task title input
        await page.fill('[data-testid="task-title-input"]', payload);
        await page.fill('[data-testid="task-description-input"]', 'Normal description');
        await page.click('[data-testid="save-task-button"]');

        // Verify the payload is sanitized
        await page.waitForSelector('[data-testid="task-item"]');
        const titleText = await page.locator('[data-testid="task-title"]').textContent();

        // Should not contain script tags or event handlers
        expect(titleText).not.toContain('<script>');
        expect(titleText).not.toContain('onerror');
        expect(titleText).not.toContain('onload');
        expect(titleText).not.toContain('javascript:');

        // Clean up
        await page.click('[data-testid="delete-task-button"]');
        await page.click('[data-testid="confirm-delete"]');
      }
    });

    await test.step('Test XSS payloads in textarea inputs', async () => {
      for (const payload of maliciousPayloads.xss) {
        await page.fill('[data-testid="task-title-input"]', 'XSS Test Task');
        await page.fill('[data-testid="task-description-input"]', payload);
        await page.click('[data-testid="save-task-button"]');

        // Verify description is sanitized
        await page.click('[data-testid="task-item"]'); // Open task details
        const descriptionText = await page.locator('[data-testid="task-description"]').textContent();

        expect(descriptionText).not.toContain('<script>');
        expect(descriptionText).not.toContain('onerror');
        expect(descriptionText).not.toContain('onload');

        await page.click('[data-testid="close-task-details"]');
        await page.click('[data-testid="delete-task-button"]');
        await page.click('[data-testid="confirm-delete"]');
      }
    });

    await test.step('Test XSS in rich text editor', async () => {
      if (await page.locator('[data-testid="rich-text-editor"]').count() > 0) {
        for (const payload of maliciousPayloads.xss) {
          await page.fill('[data-testid="rich-text-editor"]', payload);
          await page.click('[data-testid="save-content-button"]');

          // Verify rich text content is sanitized
          const content = await page.locator('[data-testid="rendered-content"]').innerHTML();
          expect(content).not.toContain('<script');
          expect(content).not.toMatch(/on\w+=/);
          expect(content).not.toContain('javascript:');
        }
      }
    });
  });

  test('should prevent SQL injection in search and filters', async ({ page }) => {
    await test.step('Navigate to tasks list with search', async () => {
      await page.goto('/tasks');
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    });

    await test.step('Test SQL injection payloads in search', async () => {
      for (const payload of maliciousPayloads.sqlInjection) {
        await page.fill('[data-testid="search-input"]', payload);
        await page.press('[data-testid="search-input"]', 'Enter');

        // Verify no database errors or unauthorized data access
        await expect(page.locator('[data-testid="database-error"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="sql-error"]')).not.toBeVisible();

        // Results should be empty or safe
        const results = await page.locator('[data-testid="search-results"]').count();
        // Should not return all data (which would indicate successful injection)
        expect(results).toBeLessThan(1000);

        await page.fill('[data-testid="search-input"]', '');
      }
    });

    await test.step('Test SQL injection in filter parameters', async () => {
      for (const payload of maliciousPayloads.sqlInjection) {
        // Test via URL parameters
        await page.goto(`/tasks?status=${encodeURIComponent(payload)}`);

        // Should not cause database errors
        await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();

        // Test via form filters
        if (await page.locator('[data-testid="status-filter"]').count() > 0) {
          await page.selectOption('[data-testid="status-filter"]', payload);
          await page.click('[data-testid="apply-filters"]');

          await expect(page.locator('[data-testid="database-error"]')).not.toBeVisible();
        }
      }
    });
  });

  test('should prevent path traversal attacks', async ({ page }) => {
    await test.step('Test path traversal in file uploads', async () => {
      if (await page.locator('[data-testid="file-upload"]').count() > 0) {
        for (const payload of maliciousPayloads.pathTraversal) {
          // Create a temporary file with malicious name
          const fileContent = 'test content';

          // Test file upload with malicious filename
          await page.setInputFiles('[data-testid="file-upload"]', {
            name: payload,
            mimeType: 'text/plain',
            buffer: Buffer.from(fileContent)
          });

          await page.click('[data-testid="upload-button"]');

          // Should either reject the file or sanitize the filename
          const uploadError = await page.locator('[data-testid="upload-error"]').count();
          const fileName = await page.locator('[data-testid="uploaded-filename"]').textContent();

          if (uploadError === 0 && fileName) {
            // If upload succeeded, filename should be sanitized
            expect(fileName).not.toContain('../');
            expect(fileName).not.toContain('..\\');
            expect(fileName).not.toContain('/etc/');
            expect(fileName).not.toContain('\\windows\\');
          }
        }
      }
    });

    await test.step('Test path traversal in API endpoints', async () => {
      for (const payload of maliciousPayloads.pathTraversal) {
        // Test file download endpoint
        const response = await page.request.get(`/api/files/${encodeURIComponent(payload)}`);

        // Should not return system files
        expect(response.status()).not.toBe(200);

        if (response.status() === 200) {
          const content = await response.text();
          expect(content).not.toContain('root:');
          expect(content).not.toContain('127.0.0.1');
        }
      }
    });
  });

  test('should prevent command injection attacks', async ({ page }) => {
    await test.step('Test command injection in system integration features', async () => {
      // If your app has features that interact with system commands
      if (await page.locator('[data-testid="export-data"]').count() > 0) {
        for (const payload of maliciousPayloads.commandInjection) {
          await page.fill('[data-testid="export-filename"]', payload);
          await page.click('[data-testid="export-button"]');

          // Should not execute system commands
          await expect(page.locator('[data-testid="command-error"]')).not.toBeVisible();

          // Export should either fail safely or sanitize input
          const downloadPromise = page.waitForDownload({ timeout: 5000 }).catch(() => null);
          const download = await downloadPromise;

          if (download) {
            const filename = download.suggestedFilename();
            expect(filename).not.toContain(';');
            expect(filename).not.toContain('|');
            expect(filename).not.toContain('&&');
            expect(filename).not.toContain('$(');
            expect(filename).not.toContain('`');
          }
        }
      }
    });
  });

  test('should validate input length limits', async ({ page }) => {
    await test.step('Test input length validation', async () => {
      await page.goto('/tasks/new');

      // Test extremely long inputs
      const longString = 'A'.repeat(10000);
      const veryLongString = 'A'.repeat(100000);

      // Test task title length limit
      await page.fill('[data-testid="task-title-input"]', longString);
      await page.click('[data-testid="save-task-button"]');

      // Should show validation error for too long input
      await expect(page.locator('[data-testid="title-length-error"]')).toBeVisible();

      // Test description length limit
      await page.fill('[data-testid="task-title-input"]', 'Normal Title');
      await page.fill('[data-testid="task-description-input"]', veryLongString);
      await page.click('[data-testid="save-task-button"]');

      await expect(page.locator('[data-testid="description-length-error"]')).toBeVisible();
    });
  });

  test('should validate file upload security', async ({ page }) => {
    await test.step('Test malicious file uploads', async () => {
      if (await page.locator('[data-testid="file-upload"]').count() > 0) {
        const maliciousFiles = [
          { name: 'malware.exe', content: 'MZ\x90\x00\x03\x00\x00\x00', type: 'application/x-executable' },
          { name: 'script.php', content: '<?php system($_GET["cmd"]); ?>', type: 'application/x-php' },
          { name: 'virus.bat', content: '@echo off\nformat c: /y', type: 'application/x-bat' },
          { name: 'shell.jsp', content: '<%@ page import="java.io.*" %>', type: 'application/x-jsp' }
        ];

        for (const file of maliciousFiles) {
          await page.setInputFiles('[data-testid="file-upload"]', {
            name: file.name,
            mimeType: file.type,
            buffer: Buffer.from(file.content)
          });

          await page.click('[data-testid="upload-button"]');

          // Should reject malicious file types
          await expect(page.locator('[data-testid="file-type-error"]')).toBeVisible();
        }
      }
    });

    await test.step('Test file size limits', async () => {
      if (await page.locator('[data-testid="file-upload"]').count() > 0) {
        // Create a large file (simulated)
        const largeFileContent = 'A'.repeat(50 * 1024 * 1024); // 50MB

        await page.setInputFiles('[data-testid="file-upload"]', {
          name: 'largefile.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from(largeFileContent)
        });

        await page.click('[data-testid="upload-button"]');

        // Should reject files exceeding size limit
        await expect(page.locator('[data-testid="file-size-error"]')).toBeVisible();
      }
    });
  });

  test('should validate API input sanitization', async ({ page }) => {
    await test.step('Test API endpoint input validation', async () => {
      const apiEndpoints = [
        { method: 'POST', url: '/api/tasks', field: 'title' },
        { method: 'POST', url: '/api/projects', field: 'name' },
        { method: 'PUT', url: '/api/users/profile', field: 'bio' }
      ];

      for (const endpoint of apiEndpoints) {
        for (const payload of maliciousPayloads.xss) {
          const requestBody = { [endpoint.field]: payload };

          const response = await page.request[endpoint.method.toLowerCase()](endpoint.url, {
            data: requestBody
          });

          if (response.status() === 200 || response.status() === 201) {
            const responseData = await response.json().catch(() => ({}));

            // Verify response data is sanitized
            const fieldValue = responseData[endpoint.field];
            if (fieldValue) {
              expect(fieldValue).not.toContain('<script>');
              expect(fieldValue).not.toContain('onerror');
              expect(fieldValue).not.toContain('javascript:');
            }
          }
        }
      }
    });

    await test.step('Test API parameter injection', async () => {
      for (const payload of maliciousPayloads.sqlInjection) {
        const response = await page.request.get(`/api/tasks?search=${encodeURIComponent(payload)}`);

        // Should not return database errors
        expect(response.status()).not.toBe(500);

        if (response.status() === 200) {
          const data = await response.json().catch(() => ({}));

          // Should not return suspiciously large datasets (indicating successful injection)
          if (Array.isArray(data.tasks)) {
            expect(data.tasks.length).toBeLessThan(10000);
          }
        }
      }
    });
  });

  test('should prevent NoSQL injection attacks', async ({ page }) => {
    await test.step('Test NoSQL injection payloads', async () => {
      const noSqlPayloads = [
        '{"$gt":""}',
        '{"$ne":null}',
        '{"$regex":".*"}',
        '{"$where":"sleep(1000)"}',
        '{"$or":[{},{"a":"a"}]}',
        '{"$gt":"", "$lt":"zzz"}',
        '{"$exists":true}',
        '{"$in":["admin","user"]}'
      ];

      for (const payload of noSqlPayloads) {
        // Test in search parameters
        const response = await page.request.get(`/api/tasks?filter=${encodeURIComponent(payload)}`);

        // Should not return all data or cause errors
        expect(response.status()).not.toBe(500);

        if (response.status() === 200) {
          const data = await response.json().catch(() => ({}));
          if (Array.isArray(data.tasks)) {
            expect(data.tasks.length).toBeLessThan(1000);
          }
        }
      }
    });
  });
});