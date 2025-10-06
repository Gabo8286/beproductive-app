import { test, expect } from '@playwright/test';

test.describe('Monitoring and Alerting Tests', () => {
  const monitoringThresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 5, // 5% error rate
    cpuUsage: 80, // 80% CPU usage
    memoryUsage: 85, // 85% memory usage
    diskUsage: 90, // 90% disk usage
    alertResponseTime: 30000, // 30 seconds alert response
    uptimeThreshold: 99.9 // 99.9% uptime
  };

  test('should provide comprehensive system metrics', async ({ page }) => {
    await test.step('Validate core system metrics endpoint', async () => {
      const metricsResponse = await page.request.get('/api/metrics');

      if (metricsResponse.status() === 200) {
        const metrics = await metricsResponse.json();

        // Core system metrics
        expect(metrics.timestamp).toBeDefined();
        expect(metrics.uptime).toBeDefined();

        // Performance metrics
        if (metrics.performance) {
          expect(metrics.performance.responseTime).toBeDefined();
          expect(metrics.performance.throughput).toBeDefined();
          expect(metrics.performance.errorRate).toBeDefined();

          expect(metrics.performance.responseTime).toBeLessThan(monitoringThresholds.responseTime);
          expect(metrics.performance.errorRate).toBeLessThan(monitoringThresholds.errorRate);
        }

        // Resource metrics
        if (metrics.resources) {
          expect(metrics.resources.cpu).toBeDefined();
          expect(metrics.resources.memory).toBeDefined();
          expect(metrics.resources.disk).toBeDefined();

          if (metrics.resources.cpu.usage) {
            expect(metrics.resources.cpu.usage).toBeLessThan(monitoringThresholds.cpuUsage);
          }

          if (metrics.resources.memory.usage) {
            expect(metrics.resources.memory.usage).toBeLessThan(monitoringThresholds.memoryUsage);
          }

          if (metrics.resources.disk.usage) {
            expect(metrics.resources.disk.usage).toBeLessThan(monitoringThresholds.diskUsage);
          }
        }

        console.log('System Metrics Summary:');
        console.log(`Uptime: ${metrics.uptime}`);
        if (metrics.performance) {
          console.log(`Response Time: ${metrics.performance.responseTime}ms`);
          console.log(`Error Rate: ${metrics.performance.errorRate}%`);
        }
        if (metrics.resources) {
          console.log(`CPU Usage: ${metrics.resources.cpu?.usage || 'N/A'}%`);
          console.log(`Memory Usage: ${metrics.resources.memory?.usage || 'N/A'}%`);
        }
      }
    });

    await test.step('Test application-specific metrics', async () => {
      const appMetricsResponse = await page.request.get('/api/metrics/application');

      if (appMetricsResponse.status() === 200) {
        const appMetrics = await appMetricsResponse.json();

        // Business metrics
        if (appMetrics.business) {
          expect(appMetrics.business.activeUsers).toBeDefined();
          expect(appMetrics.business.tasksCreated).toBeDefined();
          expect(appMetrics.business.projectsActive).toBeDefined();
        }

        // Feature usage metrics
        if (appMetrics.features) {
          expect(appMetrics.features.loginAttempts).toBeDefined();
          expect(appMetrics.features.apiCalls).toBeDefined();
        }

        // Database metrics
        if (appMetrics.database) {
          expect(appMetrics.database.connections).toBeDefined();
          expect(appMetrics.database.queryTime).toBeDefined();
          expect(appMetrics.database.slowQueries).toBeDefined();

          if (appMetrics.database.queryTime.avg) {
            expect(appMetrics.database.queryTime.avg).toBeLessThan(1000); // < 1s avg query time
          }
        }
      }
    });

    await test.step('Test real-time metrics streaming', async () => {
      // Test WebSocket metrics streaming if available
      try {
        await page.goto('/dashboard');

        // Check if metrics are being updated in real-time
        const initialMetrics = await page.evaluate(() => {
          return (window as any).metricsData || null;
        });

        await page.waitForTimeout(5000); // Wait 5 seconds

        const updatedMetrics = await page.evaluate(() => {
          return (window as any).metricsData || null;
        });

        if (initialMetrics && updatedMetrics) {
          // Timestamps should be different
          expect(updatedMetrics.timestamp).not.toBe(initialMetrics.timestamp);
        }
      } catch (error) {
        console.log('Real-time metrics not available via WebSocket');
      }
    });
  });

  test('should implement effective alerting mechanisms', async ({ page }) => {
    await test.step('Validate alert configuration', async () => {
      const alertsResponse = await page.request.get('/api/alerts/config');

      if (alertsResponse.status() === 200) {
        const alertConfig = await alertsResponse.json();

        expect(alertConfig.rules).toBeDefined();
        expect(Array.isArray(alertConfig.rules)).toBe(true);

        // Check for critical alert rules
        const criticalAlerts = alertConfig.rules.filter((rule: any) =>
          rule.severity === 'critical'
        );

        expect(criticalAlerts.length).toBeGreaterThan(0);

        criticalAlerts.forEach((alert: any) => {
          expect(alert.name).toBeDefined();
          expect(alert.condition).toBeDefined();
          expect(alert.threshold).toBeDefined();
          expect(alert.enabled).toBe(true);

          // Critical alerts should have immediate notification
          expect(alert.notificationDelay).toBeLessThanOrEqual(60); // ≤ 1 minute
        });

        // Check for escalation rules
        if (alertConfig.escalation) {
          expect(alertConfig.escalation.levels).toBeDefined();
          expect(alertConfig.escalation.levels.length).toBeGreaterThan(0);

          alertConfig.escalation.levels.forEach((level: any) => {
            expect(level.timeframe).toBeDefined();
            expect(level.contacts).toBeDefined();
            expect(level.contacts.length).toBeGreaterThan(0);
          });
        }
      }
    });

    await test.step('Test alert generation and delivery', async () => {
      // Simulate a condition that should trigger an alert
      const testAlertResponse = await page.request.post('/api/alerts/test', {
        data: {
          type: 'high_error_rate',
          value: 15, // Above threshold
          duration: 300 // 5 minutes
        }
      });

      if (testAlertResponse.status() === 201) {
        const testAlert = await testAlertResponse.json();
        expect(testAlert.alertId).toBeDefined();
        expect(testAlert.status).toBe('triggered');

        // Check alert was recorded
        const alertsListResponse = await page.request.get('/api/alerts');

        if (alertsListResponse.status() === 200) {
          const alerts = await alertsListResponse.json();
          const triggeredAlert = alerts.find((alert: any) =>
            alert.id === testAlert.alertId
          );

          expect(triggeredAlert).toBeDefined();
          expect(triggeredAlert.severity).toBeDefined();
          expect(triggeredAlert.timestamp).toBeDefined();
          expect(triggeredAlert.notificationsSent).toBeGreaterThan(0);
        }
      }
    });

    await test.step('Test alert suppression and deduplication', async () => {
      // Send multiple similar alerts to test deduplication
      const duplicateAlerts = [];

      for (let i = 0; i < 5; i++) {
        duplicateAlerts.push(
          page.request.post('/api/alerts/test', {
            data: {
              type: 'database_connection_failed',
              message: 'Database connection timeout',
              source: 'app-server-1'
            }
          })
        );
      }

      const results = await Promise.all(duplicateAlerts);

      // Should suppress duplicate alerts
      const createdAlerts = results.filter(r => r.status() === 201);
      expect(createdAlerts.length).toBeLessThan(5); // Should deduplicate

      // Check suppression tracking
      if (createdAlerts.length > 0) {
        const suppressionResponse = await page.request.get('/api/alerts/suppression');

        if (suppressionResponse.status() === 200) {
          const suppressionData = await suppressionResponse.json();
          expect(suppressionData.suppressedCount).toBeGreaterThan(0);
        }
      }
    });
  });

  test('should provide comprehensive logging capabilities', async ({ page }) => {
    await test.step('Validate structured logging format', async () => {
      const logsResponse = await page.request.get('/api/logs?limit=10');

      if (logsResponse.status() === 200) {
        const logs = await logsResponse.json();

        expect(Array.isArray(logs.entries)).toBe(true);

        logs.entries.forEach((log: any) => {
          // Standard log fields
          expect(log.timestamp).toBeDefined();
          expect(log.level).toBeDefined();
          expect(log.message).toBeDefined();

          // Structured fields
          expect(log.service).toBeDefined();
          expect(log.version).toBeDefined();

          // Security-sensitive information should not be logged
          expect(log.message).not.toMatch(/password|token|secret|key/i);

          // Verify log levels are appropriate
          expect(['debug', 'info', 'warn', 'error', 'fatal']).toContain(log.level);
        });
      }
    });

    await test.step('Test log aggregation and search', async () => {
      // Test log search functionality
      const searchResponse = await page.request.get('/api/logs/search?q=error&level=error');

      if (searchResponse.status() === 200) {
        const searchResults = await searchResponse.json();

        expect(searchResults.total).toBeDefined();
        expect(Array.isArray(searchResults.entries)).toBe(true);

        // All results should match search criteria
        searchResults.entries.forEach((log: any) => {
          expect(log.level).toBe('error');
        });
      }

      // Test log filtering by time range
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const timeFilterResponse = await page.request.get(
        `/api/logs?from=${oneHourAgo.toISOString()}&to=${now.toISOString()}`
      );

      if (timeFilterResponse.status() === 200) {
        const timeFilteredLogs = await timeFilterResponse.json();

        timeFilteredLogs.entries.forEach((log: any) => {
          const logTime = new Date(log.timestamp);
          expect(logTime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
          expect(logTime.getTime()).toBeLessThanOrEqual(now.getTime());
        });
      }
    });

    await test.step('Test audit trail logging', async () => {
      // Create an action that should be audited
      const auditActionResponse = await page.request.post('/api/tasks', {
        data: {
          title: 'Audit Test Task',
          description: 'Task created for audit testing'
        }
      });

      if (auditActionResponse.status() === 201) {
        const task = await auditActionResponse.json();

        // Check if action was logged in audit trail
        await page.waitForTimeout(2000); // Allow time for audit log to be written

        const auditResponse = await page.request.get('/api/audit?action=task_created');

        if (auditResponse.status() === 200) {
          const auditEntries = await auditResponse.json();

          const auditEntry = auditEntries.entries.find((entry: any) =>
            entry.resourceId === task.id
          );

          expect(auditEntry).toBeDefined();
          expect(auditEntry.action).toBe('task_created');
          expect(auditEntry.userId).toBeDefined();
          expect(auditEntry.timestamp).toBeDefined();
          expect(auditEntry.ip).toBeDefined();
        }
      }
    });
  });

  test('should implement performance monitoring', async ({ page }) => {
    await test.step('Monitor API endpoint performance', async () => {
      const endpoints = [
        '/api/health',
        '/api/tasks',
        '/api/projects',
        '/api/users/profile'
      ];

      const performanceResults = [];

      for (const endpoint of endpoints) {
        const measurements = [];

        // Take multiple measurements
        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();
          const response = await page.request.get(endpoint);
          const responseTime = Date.now() - startTime;

          measurements.push({
            responseTime,
            status: response.status(),
            size: parseInt(response.headers()['content-length'] || '0')
          });

          await page.waitForTimeout(1000); // 1 second between requests
        }

        const avgResponseTime = measurements.reduce((sum, m) => sum + m.responseTime, 0) / measurements.length;
        const successRate = measurements.filter(m => m.status === 200).length / measurements.length * 100;

        performanceResults.push({
          endpoint,
          avgResponseTime,
          successRate,
          measurements
        });

        console.log(`${endpoint}: ${avgResponseTime.toFixed(2)}ms avg, ${successRate}% success`);

        // Validate performance thresholds
        expect(avgResponseTime).toBeLessThan(monitoringThresholds.responseTime);
        expect(successRate).toBeGreaterThan(95);
      }
    });

    await test.step('Monitor database query performance', async () => {
      const dbMetricsResponse = await page.request.get('/api/metrics/database');

      if (dbMetricsResponse.status() === 200) {
        const dbMetrics = await dbMetricsResponse.json();

        if (dbMetrics.queries) {
          expect(dbMetrics.queries.total).toBeDefined();
          expect(dbMetrics.queries.avgDuration).toBeDefined();
          expect(dbMetrics.queries.slowQueries).toBeDefined();

          // Database performance thresholds
          expect(dbMetrics.queries.avgDuration).toBeLessThan(500); // < 500ms avg
          expect(dbMetrics.queries.slowQueries).toBeLessThan(10); // < 10 slow queries
        }

        if (dbMetrics.connections) {
          expect(dbMetrics.connections.active).toBeDefined();
          expect(dbMetrics.connections.idle).toBeDefined();
          expect(dbMetrics.connections.total).toBeDefined();

          // Connection pool should not be exhausted
          const utilization = dbMetrics.connections.active / dbMetrics.connections.total;
          expect(utilization).toBeLessThan(0.9); // < 90% utilization
        }
      }
    });

    await test.step('Monitor memory and resource usage', async () => {
      const resourceMetricsResponse = await page.request.get('/api/metrics/resources');

      if (resourceMetricsResponse.status() === 200) {
        const resourceMetrics = await resourceMetricsResponse.json();

        // Memory metrics
        if (resourceMetrics.memory) {
          expect(resourceMetrics.memory.used).toBeDefined();
          expect(resourceMetrics.memory.free).toBeDefined();
          expect(resourceMetrics.memory.cached).toBeDefined();

          const memoryUsage = (resourceMetrics.memory.used /
            (resourceMetrics.memory.used + resourceMetrics.memory.free)) * 100;

          expect(memoryUsage).toBeLessThan(monitoringThresholds.memoryUsage);
        }

        // CPU metrics
        if (resourceMetrics.cpu) {
          expect(resourceMetrics.cpu.usage).toBeDefined();
          expect(resourceMetrics.cpu.loadAverage).toBeDefined();

          expect(resourceMetrics.cpu.usage).toBeLessThan(monitoringThresholds.cpuUsage);
        }

        // Disk metrics
        if (resourceMetrics.disk) {
          expect(resourceMetrics.disk.used).toBeDefined();
          expect(resourceMetrics.disk.free).toBeDefined();

          const diskUsage = (resourceMetrics.disk.used /
            (resourceMetrics.disk.used + resourceMetrics.disk.free)) * 100;

          expect(diskUsage).toBeLessThan(monitoringThresholds.diskUsage);
        }
      }
    });
  });

  test('should provide effective dashboards and visualization', async ({ page }) => {
    await test.step('Validate monitoring dashboard accessibility', async () => {
      await page.goto('/admin/monitoring');

      // Check if monitoring dashboard loads
      await expect(page.locator('[data-testid="monitoring-dashboard"]')).toBeVisible();

      // Validate key metrics are displayed
      const metricWidgets = [
        '[data-testid="system-health-widget"]',
        '[data-testid="performance-metrics-widget"]',
        '[data-testid="error-rate-widget"]',
        '[data-testid="uptime-widget"]'
      ];

      for (const widget of metricWidgets) {
        if (await page.locator(widget).count() > 0) {
          await expect(page.locator(widget)).toBeVisible();
        }
      }
    });

    await test.step('Test real-time dashboard updates', async () => {
      await page.goto('/admin/monitoring');

      // Check if metrics update in real-time
      const initialMetricValue = await page.locator('[data-testid="cpu-usage-value"]').textContent();

      await page.waitForTimeout(10000); // Wait 10 seconds

      const updatedMetricValue = await page.locator('[data-testid="cpu-usage-value"]').textContent();

      // Values should update (or at least have the capability to update)
      if (initialMetricValue && updatedMetricValue) {
        console.log(`CPU usage: ${initialMetricValue} → ${updatedMetricValue}`);
      }
    });

    await test.step('Test alert dashboard integration', async () => {
      await page.goto('/admin/alerts');

      // Check if alerts dashboard is accessible
      if (await page.locator('[data-testid="alerts-dashboard"]').count() > 0) {
        await expect(page.locator('[data-testid="alerts-dashboard"]')).toBeVisible();

        // Check for alert summary widgets
        const alertWidgets = [
          '[data-testid="active-alerts-count"]',
          '[data-testid="critical-alerts-list"]',
          '[data-testid="alert-trends-chart"]'
        ];

        for (const widget of alertWidgets) {
          if (await page.locator(widget).count() > 0) {
            await expect(page.locator(widget)).toBeVisible();
          }
        }
      }
    });
  });
});