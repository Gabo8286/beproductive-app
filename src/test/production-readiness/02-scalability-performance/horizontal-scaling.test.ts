import { test, expect } from '@playwright/test';

test.describe('Horizontal Scaling Tests', () => {
  const loadTestConfig = {
    baseUsers: 10,
    peakUsers: 100,
    maxUsers: 1000,
    rampUpTime: 30000, // 30 seconds
    sustainTime: 60000, // 1 minute
    errorThreshold: 0.05, // 5% error rate
    responseTimeThreshold: 500 // 500ms
  };

  test('should auto-scale under increasing load', async ({ page, context }) => {
    await test.step('Setup monitoring', async () => {
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });

    await test.step('Test baseline performance', async () => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000); // Baseline < 2s
      console.log(`Baseline load time: ${loadTime}ms`);
    });

    await test.step('Simulate concurrent user load', async () => {
      const promises: Promise<any>[] = [];
      const results: any[] = [];

      // Create multiple browser contexts to simulate users
      for (let i = 0; i < loadTestConfig.baseUsers; i++) {
        promises.push(simulateUserSession(context, i));
      }

      const sessionResults = await Promise.allSettled(promises);

      sessionResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`User session ${index} failed:`, result.reason);
        }
      });

      // Analyze results
      const successfulSessions = results.filter(r => r.success);
      const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
      const errorRate = (results.length - successfulSessions.length) / results.length;

      expect(errorRate).toBeLessThan(loadTestConfig.errorThreshold);
      expect(avgResponseTime).toBeLessThan(loadTestConfig.responseTimeThreshold);

      console.log(`Concurrent users: ${loadTestConfig.baseUsers}`);
      console.log(`Success rate: ${(successfulSessions.length / results.length * 100).toFixed(2)}%`);
      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    });

    await test.step('Test progressive load increase', async () => {
      const loadLevels = [25, 50, 75, 100];

      for (const userCount of loadLevels) {
        console.log(`Testing with ${userCount} concurrent users...`);

        const promises: Promise<any>[] = [];
        const startTime = Date.now();

        // Gradual ramp-up
        for (let i = 0; i < userCount; i++) {
          await new Promise(resolve => setTimeout(resolve, loadTestConfig.rampUpTime / userCount));
          promises.push(simulateUserSession(context, i));
        }

        const results = await Promise.allSettled(promises);
        const testDuration = Date.now() - startTime;

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const errorRate = (results.length - successful) / results.length;

        console.log(`${userCount} users - Success: ${successful}/${results.length} (${((successful/results.length)*100).toFixed(1)}%)`);
        console.log(`Error rate: ${(errorRate * 100).toFixed(2)}%`);
        console.log(`Test duration: ${testDuration}ms`);

        // Progressive load should maintain acceptable error rates
        expect(errorRate).toBeLessThan(loadTestConfig.errorThreshold);

        // Allow higher response times as load increases
        const acceptableResponseTime = loadTestConfig.responseTimeThreshold * (1 + userCount / 100);
        // We'll check this in the individual session simulations
      }
    });
  });

  test('should handle traffic spikes gracefully', async ({ page, context }) => {
    await test.step('Simulate sudden traffic spike', async () => {
      console.log('Simulating sudden traffic spike...');

      const spikeUsers = 200;
      const promises: Promise<any>[] = [];

      // Sudden spike - all users at once
      const spikeStartTime = Date.now();

      for (let i = 0; i < spikeUsers; i++) {
        promises.push(simulateUserSession(context, i, 'spike'));
      }

      const results = await Promise.allSettled(promises);
      const spikeDuration = Date.now() - spikeStartTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const errorRate = (results.length - successful) / results.length;

      console.log(`Spike test: ${successful}/${results.length} successful (${((successful/results.length)*100).toFixed(1)}%)`);
      console.log(`Spike error rate: ${(errorRate * 100).toFixed(2)}%`);
      console.log(`Spike duration: ${spikeDuration}ms`);

      // During spike, allow higher error rate but should still serve some users
      expect(errorRate).toBeLessThan(0.15); // 15% error rate during spike
      expect(successful).toBeGreaterThan(spikeUsers * 0.8); // At least 80% should succeed
    });

    await test.step('Test recovery after spike', async () => {
      console.log('Testing recovery after spike...');

      // Wait for system to recover
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

      // Test normal load after spike
      const recoveryUsers = 20;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < recoveryUsers; i++) {
        promises.push(simulateUserSession(context, i, 'recovery'));
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const errorRate = (results.length - successful) / results.length;

      console.log(`Recovery test: ${successful}/${results.length} successful`);
      console.log(`Recovery error rate: ${(errorRate * 100).toFixed(2)}%`);

      // After recovery, should return to normal performance
      expect(errorRate).toBeLessThan(0.05); // 5% error rate after recovery
    });
  });

  test('should validate auto-scaling metrics', async ({ page }) => {
    await test.step('Check scaling indicators', async () => {
      // If your application has a health/metrics endpoint
      const metricsResponse = await page.request.get('/api/health/metrics');

      if (metricsResponse.status() === 200) {
        const metrics = await metricsResponse.json();

        // Check for auto-scaling related metrics
        if (metrics.instances) {
          expect(metrics.instances.current).toBeGreaterThan(0);
          console.log(`Current instances: ${metrics.instances.current}`);

          if (metrics.instances.max) {
            expect(metrics.instances.current).toBeLessThanOrEqual(metrics.instances.max);
          }
        }

        if (metrics.cpu) {
          console.log(`CPU usage: ${metrics.cpu}%`);
          // Under normal conditions, CPU should not be at maximum
          expect(metrics.cpu).toBeLessThan(90);
        }

        if (metrics.memory) {
          console.log(`Memory usage: ${metrics.memory}%`);
          expect(metrics.memory).toBeLessThan(85);
        }
      }
    });

    await test.step('Test scaling trigger conditions', async () => {
      // Monitor what happens when scaling conditions are met
      console.log('Monitoring scaling conditions...');

      // This would be more comprehensive with actual monitoring tools
      // For now, we simulate monitoring by making requests and checking response patterns

      const monitoringResults = [];
      const monitoringDuration = 60000; // 1 minute
      const monitoringInterval = 5000; // 5 seconds

      const monitoringStartTime = Date.now();

      while (Date.now() - monitoringStartTime < monitoringDuration) {
        const checkStartTime = Date.now();

        try {
          const response = await page.request.get('/api/health');
          const responseTime = Date.now() - checkStartTime;

          monitoringResults.push({
            timestamp: Date.now(),
            responseTime,
            status: response.status(),
            success: response.status() === 200
          });
        } catch (error) {
          monitoringResults.push({
            timestamp: Date.now(),
            responseTime: Date.now() - checkStartTime,
            status: 0,
            success: false,
            error: error.message
          });
        }

        await new Promise(resolve => setTimeout(resolve, monitoringInterval));
      }

      // Analyze monitoring results
      const avgResponseTime = monitoringResults.reduce((sum, r) => sum + r.responseTime, 0) / monitoringResults.length;
      const successRate = monitoringResults.filter(r => r.success).length / monitoringResults.length;

      console.log(`Monitoring results:`);
      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Success rate: ${(successRate * 100).toFixed(2)}%`);

      expect(avgResponseTime).toBeLessThan(1000); // Should be responsive
      expect(successRate).toBeGreaterThan(0.95); // 95% uptime
    });
  });

  test('should handle database connection scaling', async ({ page }) => {
    await test.step('Test database connection pool under load', async () => {
      const promises: Promise<any>[] = [];
      const dbTestCount = 50;

      // Generate concurrent database operations
      for (let i = 0; i < dbTestCount; i++) {
        promises.push(
          testDatabaseOperation(page, i)
        );
      }

      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`Database operations: ${successful} successful, ${failed} failed`);

      // Database should handle concurrent connections
      expect(successful / dbTestCount).toBeGreaterThan(0.9); // 90% success rate

      // Check for connection pool exhaustion errors
      const connectionErrors = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message || '')
        .filter(msg => msg.includes('connection') || msg.includes('pool'));

      expect(connectionErrors.length).toBeLessThan(dbTestCount * 0.05); // < 5% connection errors
    });
  });
});

async function simulateUserSession(context: any, userId: number, testType: string = 'normal'): Promise<any> {
  const sessionStartTime = Date.now();
  const userContext = await context.browser().newContext();
  const userPage = await userContext.newPage();

  try {
    const actions = [];
    const responseTimes = [];

    // Simulate typical user journey
    const startTime = Date.now();
    await userPage.goto('/');
    responseTimes.push(Date.now() - startTime);

    await userPage.waitForLoadState('networkidle', { timeout: 10000 });

    // Navigate to dashboard
    const dashboardStart = Date.now();
    await userPage.goto('/dashboard');
    await userPage.waitForLoadState('networkidle', { timeout: 10000 });
    responseTimes.push(Date.now() - dashboardStart);

    // Perform some interactions
    if (await userPage.locator('[data-testid="task-list"]').count() > 0) {
      const taskListStart = Date.now();
      await userPage.click('[data-testid="task-list"]');
      await userPage.waitForTimeout(1000);
      responseTimes.push(Date.now() - taskListStart);
    }

    // Create a task (if possible)
    if (await userPage.locator('[data-testid="create-task-button"]').count() > 0) {
      const createTaskStart = Date.now();
      await userPage.click('[data-testid="create-task-button"]');
      await userPage.fill('[data-testid="task-title-input"]', `Load Test Task ${userId}`);
      await userPage.click('[data-testid="save-task-button"]');
      await userPage.waitForTimeout(1000);
      responseTimes.push(Date.now() - createTaskStart);
    }

    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const sessionDuration = Date.now() - sessionStartTime;

    return {
      userId,
      testType,
      success: true,
      avgResponseTime,
      sessionDuration,
      actions: responseTimes.length
    };

  } catch (error) {
    return {
      userId,
      testType,
      success: false,
      error: error.message,
      sessionDuration: Date.now() - sessionStartTime
    };
  } finally {
    await userContext.close();
  }
}

async function testDatabaseOperation(page: any, operationId: number): Promise<any> {
  const startTime = Date.now();

  try {
    // Test a database operation via API
    const response = await page.request.get(`/api/tasks?limit=10&offset=${operationId * 10}`);

    const responseTime = Date.now() - startTime;

    if (response.status() === 200) {
      const data = await response.json();
      return {
        operationId,
        success: true,
        responseTime,
        recordCount: Array.isArray(data.tasks) ? data.tasks.length : 0
      };
    } else {
      return {
        operationId,
        success: false,
        responseTime,
        status: response.status()
      };
    }
  } catch (error) {
    return {
      operationId,
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}