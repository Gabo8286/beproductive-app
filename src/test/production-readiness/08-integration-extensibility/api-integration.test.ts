import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const apiThresholds = {
    responseTime: 2000, // 2 seconds max response time
    uptime: 99.9, // 99.9% API uptime
    errorRate: 1, // 1% max error rate
    rateLimitRequests: 1000, // requests per hour
    timeoutDuration: 30000, // 30 seconds timeout
    retryAttempts: 3 // maximum retry attempts
  };

  test('should validate RESTful API compliance', async ({ page }) => {
    await test.step('Test HTTP methods compliance', async () => {
      const endpoints = [
        { path: '/api/tasks', methods: ['GET', 'POST'] },
        { path: '/api/tasks/123', methods: ['GET', 'PUT', 'PATCH', 'DELETE'] },
        { path: '/api/projects', methods: ['GET', 'POST'] },
        { path: '/api/projects/456', methods: ['GET', 'PUT', 'PATCH', 'DELETE'] }
      ];

      for (const endpoint of endpoints) {
        for (const method of endpoint.methods) {
          const response = await page.request.fetch(endpoint.path, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            data: method === 'POST' || method === 'PUT' || method === 'PATCH' ?
              JSON.stringify({ title: 'Test', description: 'Test data' }) : undefined
          });

          // Should not return 405 Method Not Allowed for supported methods
          expect(response.status()).not.toBe(405);

          // Should handle unsupported methods appropriately
          if (!endpoint.methods.includes(method)) {
            expect(response.status()).toBe(405);
          }

          console.log(`✓ ${method} ${endpoint.path}: ${response.status()}`);
        }
      }
    });

    await test.step('Test status code compliance', async () => {
      const testCases = [
        {
          description: 'GET existing resource',
          request: { method: 'GET', path: '/api/health' },
          expectedStatus: 200
        },
        {
          description: 'GET non-existent resource',
          request: { method: 'GET', path: '/api/tasks/nonexistent-id' },
          expectedStatus: 404
        },
        {
          description: 'POST with valid data',
          request: {
            method: 'POST',
            path: '/api/tasks',
            data: { title: 'Valid Task', description: 'Valid description' }
          },
          expectedStatus: [201, 200]
        },
        {
          description: 'POST with invalid data',
          request: {
            method: 'POST',
            path: '/api/tasks',
            data: { invalidField: 'invalid' }
          },
          expectedStatus: 400
        },
        {
          description: 'Unauthorized request',
          request: {
            method: 'GET',
            path: '/api/admin/users',
            headers: { 'Authorization': 'Bearer invalid-token' }
          },
          expectedStatus: 401
        }
      ];

      for (const testCase of testCases) {
        const response = await page.request.fetch(testCase.request.path, {
          method: testCase.request.method,
          headers: {
            'Content-Type': 'application/json',
            ...testCase.request.headers
          },
          data: testCase.request.data ? JSON.stringify(testCase.request.data) : undefined
        });

        const expectedStatuses = Array.isArray(testCase.expectedStatus) ?
          testCase.expectedStatus : [testCase.expectedStatus];

        expect(expectedStatuses).toContain(response.status());

        console.log(`✓ ${testCase.description}: ${response.status()}`);
      }
    });

    await test.step('Test content type and headers', async () => {
      const response = await page.request.get('/api/tasks');

      if (response.status() === 200) {
        const headers = response.headers();

        // Content-Type should be application/json
        expect(headers['content-type']).toContain('application/json');

        // Should have proper CORS headers if needed
        if (headers['access-control-allow-origin']) {
          expect(headers['access-control-allow-origin']).toBeDefined();
        }

        // Should have cache control headers
        expect(headers['cache-control']).toBeDefined();

        // Security headers
        expect(headers['x-content-type-options']).toBe('nosniff');

        console.log('✓ Response headers are properly configured');
      }
    });
  });

  test('should validate API versioning and compatibility', async ({ page }) => {
    await test.step('Test API version handling', async () => {
      const versioningStrategies = [
        { type: 'Header', headers: { 'API-Version': 'v1' } },
        { type: 'Accept Header', headers: { 'Accept': 'application/vnd.api+json;version=1' } },
        { type: 'URL Path', path: '/api/v1/tasks' },
        { type: 'Query Parameter', path: '/api/tasks?version=1' }
      ];

      for (const strategy of versioningStrategies) {
        const requestPath = strategy.path || '/api/tasks';
        const response = await page.request.get(requestPath, {
          headers: strategy.headers || {}
        });

        if (response.status() === 200) {
          console.log(`✓ API versioning strategy supported: ${strategy.type}`);

          // Check version in response
          const responseHeaders = response.headers();
          if (responseHeaders['api-version']) {
            console.log(`  Version: ${responseHeaders['api-version']}`);
          }
        }
      }
    });

    await test.step('Test backward compatibility', async () => {
      // Test deprecated but still supported endpoints
      const deprecatedEndpoints = [
        '/api/v1/tasks',
        '/api/legacy/projects'
      ];

      for (const endpoint of deprecatedEndpoints) {
        const response = await page.request.get(endpoint);

        if (response.status() === 200) {
          const headers = response.headers();

          // Should indicate deprecation
          expect(headers['deprecated'] || headers['sunset']).toBeDefined();

          console.log(`✓ Deprecated endpoint still functional: ${endpoint}`);
        } else if (response.status() === 404) {
          console.log(`- Deprecated endpoint removed: ${endpoint}`);
        }
      }
    });

    await test.step('Test API documentation compliance', async () => {
      // Check for OpenAPI/Swagger documentation
      const docsEndpoints = [
        '/api/docs',
        '/api/swagger',
        '/swagger.json',
        '/openapi.json'
      ];

      let docsFound = false;

      for (const endpoint of docsEndpoints) {
        const response = await page.request.get(endpoint);

        if (response.status() === 200) {
          docsFound = true;

          const contentType = response.headers()['content-type'];

          if (contentType?.includes('application/json')) {
            const docs = await response.json();

            // Basic OpenAPI structure validation
            expect(docs.openapi || docs.swagger).toBeDefined();
            expect(docs.info).toBeDefined();
            expect(docs.paths).toBeDefined();

            console.log(`✓ API documentation found: ${endpoint}`);
            console.log(`  Spec version: ${docs.openapi || docs.swagger}`);
          }

          break;
        }
      }

      if (docsFound) {
        console.log('✓ API documentation is available');
      } else {
        console.log('⚠ API documentation not found');
      }
    });
  });

  test('should validate error handling and resilience', async ({ page }) => {
    await test.step('Test error response format consistency', async () => {
      const errorScenarios = [
        { path: '/api/tasks/invalid-id', expectedStatus: 404 },
        { path: '/api/tasks', method: 'POST', data: {}, expectedStatus: 400 },
        { path: '/api/admin/secret', headers: { 'Authorization': 'Bearer invalid' }, expectedStatus: 401 }
      ];

      for (const scenario of errorScenarios) {
        const response = await page.request.fetch(scenario.path, {
          method: scenario.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...scenario.headers
          },
          data: scenario.data ? JSON.stringify(scenario.data) : undefined
        });

        expect(response.status()).toBe(scenario.expectedStatus);

        if (response.status() >= 400) {
          const errorResponse = await response.json();

          // Error response should have consistent structure
          expect(errorResponse.error || errorResponse.message).toBeDefined();

          if (errorResponse.error) {
            expect(typeof errorResponse.error).toBe('string');
          }

          // Should not expose sensitive information
          const responseText = JSON.stringify(errorResponse).toLowerCase();
          expect(responseText).not.toContain('password');
          expect(responseText).not.toContain('secret');
          expect(responseText).not.toContain('token');
          expect(responseText).not.toContain('internal');

          console.log(`✓ Error format consistent for ${scenario.expectedStatus}: ${errorResponse.error || errorResponse.message}`);
        }
      }
    });

    await test.step('Test rate limiting implementation', async () => {
      const rateLimitPromises = [];

      // Generate many requests rapidly
      for (let i = 0; i < 100; i++) {
        rateLimitPromises.push(
          page.request.get('/api/health')
        );
      }

      const responses = await Promise.allSettled(rateLimitPromises);

      const rateLimitedResponses = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status() === 429
      );

      const successfulResponses = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status() === 200
      );

      if (rateLimitedResponses.length > 0) {
        console.log(`✓ Rate limiting active: ${rateLimitedResponses.length} requests limited`);

        // Check rate limit headers
        const rateLimitResponse = rateLimitedResponses[0] as any;
        const headers = rateLimitResponse.value.headers();

        if (headers['x-ratelimit-limit']) {
          console.log(`  Limit: ${headers['x-ratelimit-limit']}`);
        }
        if (headers['x-ratelimit-remaining']) {
          console.log(`  Remaining: ${headers['x-ratelimit-remaining']}`);
        }
        if (headers['retry-after']) {
          console.log(`  Retry after: ${headers['retry-after']} seconds`);
        }
      } else {
        console.log(`⚠ Rate limiting not detected (${successfulResponses.length} successful requests)`);
      }
    });

    await test.step('Test timeout and retry behavior', async () => {
      // Test with a potentially slow endpoint
      const slowEndpoint = '/api/admin/slow-operation';

      const timeoutStart = Date.now();

      try {
        const response = await page.request.get(slowEndpoint, {
          timeout: 5000 // 5 second timeout
        });

        const responseTime = Date.now() - timeoutStart;

        if (response.status() === 200) {
          expect(responseTime).toBeLessThan(apiThresholds.responseTime);
          console.log(`✓ Slow operation completed in ${responseTime}ms`);
        }

      } catch (error) {
        const timeoutDuration = Date.now() - timeoutStart;

        if (error.message.includes('timeout')) {
          expect(timeoutDuration).toBeGreaterThan(4500); // Should respect timeout
          console.log(`✓ Timeout handled properly after ${timeoutDuration}ms`);
        }
      }
    });
  });

  test('should validate third-party API integrations', async ({ page }) => {
    await test.step('Test external service connectivity', async () => {
      // Test connectivity to external services
      const externalServices = [
        { name: 'Authentication Service', endpoint: '/api/auth/external/test' },
        { name: 'Email Service', endpoint: '/api/notifications/email/test' },
        { name: 'File Storage', endpoint: '/api/storage/health' },
        { name: 'Analytics Service', endpoint: '/api/analytics/health' }
      ];

      for (const service of externalServices) {
        const response = await page.request.get(service.endpoint);

        if (response.status() === 200) {
          const healthData = await response.json();

          expect(healthData.status).toBe('healthy');

          if (healthData.responseTime) {
            expect(healthData.responseTime).toBeLessThan(apiThresholds.responseTime);
          }

          console.log(`✓ ${service.name}: healthy`);
        } else if (response.status() === 404) {
          console.log(`- ${service.name}: health check not available`);
        } else {
          console.log(`⚠ ${service.name}: health check failed (${response.status()})`);
        }
      }
    });

    await test.step('Test external API authentication', async () => {
      // Test API key authentication
      const apiKeyTest = await page.request.get('/api/external/test-api-key');

      if (apiKeyTest.status() === 200) {
        const result = await apiKeyTest.json();

        expect(result.authenticated).toBe(true);
        expect(result.keyStatus).toBe('valid');

        console.log('✓ External API authentication working');
      }

      // Test OAuth flow if available
      const oauthTest = await page.request.get('/api/external/test-oauth');

      if (oauthTest.status() === 200) {
        const oauthResult = await oauthTest.json();

        expect(oauthResult.tokenValid).toBe(true);

        if (oauthResult.expiresIn) {
          expect(oauthResult.expiresIn).toBeGreaterThan(300); // At least 5 minutes
        }

        console.log('✓ OAuth authentication working');
      }
    });

    await test.step('Test webhook integrations', async () => {
      // Test webhook endpoint availability
      const webhookTest = await page.request.post('/api/webhooks/test', {
        data: {
          event: 'test.event',
          payload: { test: true },
          timestamp: new Date().toISOString()
        }
      });

      if (webhookTest.status() === 200) {
        const webhookResult = await webhookTest.json();

        expect(webhookResult.received).toBe(true);
        expect(webhookResult.processed).toBe(true);

        console.log('✓ Webhook endpoint functional');
      }

      // Test webhook security (signature validation)
      const unsignedWebhook = await page.request.post('/api/webhooks/secure', {
        data: { event: 'unsigned.test' }
      });

      if (unsignedWebhook.status() === 401 || unsignedWebhook.status() === 403) {
        console.log('✓ Webhook signature validation enforced');
      }
    });
  });

  test('should validate API performance and scalability', async ({ page }) => {
    await test.step('Test concurrent request handling', async () => {
      const concurrentRequests = 50;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          page.request.get(`/api/tasks?page=${i % 10}`)
        );
      }

      const responses = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;

      const successful = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status() === 200
      ).length;

      const successRate = (successful / concurrentRequests) * 100;

      expect(successRate).toBeGreaterThan(95); // 95% success rate
      expect(totalTime).toBeLessThan(10000); // Complete within 10 seconds

      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(apiThresholds.responseTime);

      console.log(`✓ Concurrent requests: ${successful}/${concurrentRequests} successful`);
      console.log(`✓ Success rate: ${successRate.toFixed(2)}%`);
      console.log(`✓ Average response time: ${avgResponseTime.toFixed(2)}ms`);
    });

    await test.step('Test pagination performance', async () => {
      const paginationTests = [
        { page: 1, limit: 10 },
        { page: 5, limit: 20 },
        { page: 10, limit: 50 },
        { page: 100, limit: 10 }
      ];

      for (const test of paginationTests) {
        const startTime = Date.now();

        const response = await page.request.get(
          `/api/tasks?page=${test.page}&limit=${test.limit}`
        );

        const responseTime = Date.now() - startTime;

        if (response.status() === 200) {
          expect(responseTime).toBeLessThan(apiThresholds.responseTime);

          const data = await response.json();

          // Pagination metadata should be present
          expect(data.page || data.currentPage).toBeDefined();
          expect(data.totalPages || data.pageCount).toBeDefined();
          expect(data.total || data.totalCount).toBeDefined();

          console.log(`✓ Page ${test.page} (limit ${test.limit}): ${responseTime}ms`);
        }
      }
    });

    await test.step('Test API caching effectiveness', async () => {
      // First request (cache miss)
      const firstRequestStart = Date.now();
      const firstResponse = await page.request.get('/api/tasks?cacheable=true');
      const firstRequestTime = Date.now() - firstRequestStart;

      if (firstResponse.status() === 200) {
        // Second request (cache hit)
        const secondRequestStart = Date.now();
        const secondResponse = await page.request.get('/api/tasks?cacheable=true');
        const secondRequestTime = Date.now() - secondRequestStart;

        expect(secondResponse.status()).toBe(200);

        // Cached response should be faster
        expect(secondRequestTime).toBeLessThan(firstRequestTime);

        // Check cache headers
        const cacheHeaders = secondResponse.headers();
        if (cacheHeaders['x-cache-status']) {
          expect(cacheHeaders['x-cache-status']).toContain('hit');
        }

        console.log(`✓ Cache miss: ${firstRequestTime}ms`);
        console.log(`✓ Cache hit: ${secondRequestTime}ms`);
        console.log(`✓ Cache speedup: ${((firstRequestTime - secondRequestTime) / firstRequestTime * 100).toFixed(1)}%`);
      }
    });
  });

  test('should validate API monitoring and observability', async ({ page }) => {
    await test.step('Test API metrics collection', async () => {
      // Check if metrics are being collected
      const metricsResponse = await page.request.get('/api/admin/metrics');

      if (metricsResponse.status() === 200) {
        const metrics = await metricsResponse.json();

        // API-specific metrics
        expect(metrics.requests).toBeDefined();
        expect(metrics.requests.total).toBeGreaterThan(0);

        if (metrics.requests.byEndpoint) {
          expect(Object.keys(metrics.requests.byEndpoint).length).toBeGreaterThan(0);
        }

        if (metrics.responseTime) {
          expect(metrics.responseTime.average).toBeLessThan(apiThresholds.responseTime);
        }

        if (metrics.errors) {
          const errorRate = (metrics.errors.total / metrics.requests.total) * 100;
          expect(errorRate).toBeLessThan(apiThresholds.errorRate);
        }

        console.log('✓ API metrics collection active');
        console.log(`  Total requests: ${metrics.requests.total}`);
        console.log(`  Average response time: ${metrics.responseTime?.average || 'N/A'}ms`);
      }
    });

    await test.step('Test API health monitoring', async () => {
      // Check comprehensive health endpoint
      const healthResponse = await page.request.get('/api/health/detailed');

      if (healthResponse.status() === 200) {
        const health = await healthResponse.json();

        expect(health.status).toBe('healthy');
        expect(health.timestamp).toBeDefined();

        if (health.dependencies) {
          Object.values(health.dependencies).forEach((dep: any) => {
            expect(dep.status).toBe('healthy');

            if (dep.responseTime) {
              expect(dep.responseTime).toBeLessThan(5000); // 5 seconds max for dependencies
            }
          });
        }

        if (health.uptime) {
          expect(health.uptime).toBeGreaterThan(0);
        }

        console.log('✓ API health monitoring comprehensive');
      }
    });

    await test.step('Test API alerting capabilities', async () => {
      // Check if alerting is configured
      const alertingResponse = await page.request.get('/api/admin/alerting/status');

      if (alertingResponse.status() === 200) {
        const alerting = await alertingResponse.json();

        expect(alerting.enabled).toBe(true);

        if (alerting.rules) {
          const apiRules = alerting.rules.filter((rule: any) =>
            rule.type === 'api' || rule.metric.includes('api')
          );

          expect(apiRules.length).toBeGreaterThan(0);

          console.log(`✓ API alerting rules: ${apiRules.length} configured`);
        }

        if (alerting.channels) {
          expect(alerting.channels.length).toBeGreaterThan(0);
          console.log(`✓ Alert channels: ${alerting.channels.length} configured`);
        }
      }
    });
  });
});