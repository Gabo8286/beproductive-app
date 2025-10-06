# Load Tester Agent 🏋️

## Purpose
Simulate realistic user loads and stress test the application infrastructure to validate scalability, identify performance bottlenecks under load, and ensure the system can handle expected traffic patterns and peak usage scenarios.

## Capabilities
- Automated load testing with realistic user scenarios
- Stress testing to find breaking points
- Spike testing for traffic surges
- Volume testing for large data sets
- Endurance testing for extended periods
- API rate limiting validation
- Database connection pool testing
- CDN and caching performance evaluation
- Auto-scaling trigger validation
- Performance degradation analysis

## Tech Stack & Tools
- **Load Testing**: JMeter, Locust, Artillery, k6
- **HTTP Testing**: Axios, SuperTest, Postman Newman
- **Browser Testing**: Playwright, Puppeteer for UI load testing
- **Monitoring**: Grafana, Prometheus, DataDog
- **Infrastructure**: Docker for test runners
- **Reporting**: Custom HTML/JSON reports, Slack notifications
- **Cloud**: AWS Load Testing Solution, Azure Load Testing

## Load Testing Templates

### 1. Basic HTTP Load Testing
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('HTTP Load Testing', () => {
  const API_BASE_URL = process.env.VITE_API_URL;
  const CONCURRENT_USERS = 100;
  const TEST_DURATION = 60000; // 1 minute

  it('should handle concurrent user authentication', async () => {
    const authRequests = [];
    const startTime = Date.now();

    // Simulate 100 concurrent users logging in
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      authRequests.push(
        axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: `testuser${i}@example.com`,
          password: 'testpassword123'
        }).catch(err => err.response)
      );
    }

    const responses = await Promise.all(authRequests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Analyze results
    const successfulLogins = responses.filter(r => r?.status === 200).length;
    const failedLogins = responses.filter(r => r?.status !== 200).length;
    const averageResponseTime = totalTime / CONCURRENT_USERS;

    expect(successfulLogins).toBeGreaterThan(CONCURRENT_USERS * 0.95); // 95% success rate
    expect(averageResponseTime).toBeLessThan(2000); // < 2 seconds average
    expect(failedLogins).toBeLessThan(CONCURRENT_USERS * 0.05); // < 5% failure rate
  });

  it('should maintain API performance under sustained load', async () => {
    const results = [];
    const testEndTime = Date.now() + TEST_DURATION;

    while (Date.now() < testEndTime) {
      const batchRequests = [];

      // Send 10 concurrent requests every 5 seconds
      for (let i = 0; i < 10; i++) {
        batchRequests.push(
          timeRequest(() => axios.get(`${API_BASE_URL}/api/tasks`))
        );
      }

      const batchResults = await Promise.all(batchRequests);
      results.push(...batchResults);

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Analyze sustained performance
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const successRate = results.filter(r => r.success).length / results.length;
    const p95ResponseTime = calculatePercentile(results.map(r => r.responseTime), 95);

    expect(avgResponseTime).toBeLessThan(500);
    expect(successRate).toBeGreaterThan(0.99);
    expect(p95ResponseTime).toBeLessThan(1000);
  });

  async function timeRequest(requestFn: () => Promise<any>) {
    const startTime = Date.now();
    try {
      const response = await requestFn();
      return {
        success: true,
        responseTime: Date.now() - startTime,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
});
```

### 2. Database Load Testing
```typescript
import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Database Load Testing', () => {
  it('should handle concurrent database operations', async () => {
    const concurrentOperations = 50;
    const operations = [];

    // Mix of read and write operations
    for (let i = 0; i < concurrentOperations; i++) {
      if (i % 3 === 0) {
        // Write operations (33%)
        operations.push(
          timeOperation(() => supabase.from('tasks').insert({
            title: `Load Test Task ${i}`,
            description: `Generated during load test`,
            status: 'pending',
            user_id: 'test-user-id'
          }))
        );
      } else {
        // Read operations (67%)
        operations.push(
          timeOperation(() => supabase.from('tasks').select('*').limit(20))
        );
      }
    }

    const results = await Promise.all(operations);

    // Analyze results
    const successfulOps = results.filter(r => r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));

    expect(successfulOps / concurrentOperations).toBeGreaterThan(0.98); // 98% success
    expect(avgResponseTime).toBeLessThan(300); // < 300ms average
    expect(maxResponseTime).toBeLessThan(1000); // < 1s max
  });

  it('should maintain performance with connection pool stress', async () => {
    const connectionTests = [];

    // Simulate connection pool exhaustion
    for (let i = 0; i < 200; i++) {
      connectionTests.push(
        timeOperation(() => supabase.from('users').select('id').limit(1))
      );
    }

    const results = await Promise.all(connectionTests);

    const failedConnections = results.filter(r => !r.success).length;
    const connectionFailureRate = failedConnections / connectionTests.length;

    expect(connectionFailureRate).toBeLessThan(0.02); // < 2% connection failures
  });

  it('should handle large dataset queries under load', async () => {
    const largeQueries = [];

    // Simulate 20 concurrent large queries
    for (let i = 0; i < 20; i++) {
      largeQueries.push(
        timeOperation(() => supabase
          .from('tasks')
          .select(`
            *,
            projects(*),
            task_assignments(users(*))
          `)
          .range(0, 500) // Large result set
        )
      );
    }

    const results = await Promise.all(largeQueries);

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const successRate = results.filter(r => r.success).length / results.length;

    expect(avgResponseTime).toBeLessThan(2000); // < 2s for large queries
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
  });

  async function timeOperation(operation: () => Promise<any>) {
    const startTime = Date.now();
    try {
      const result = await operation();
      return {
        success: !result.error,
        responseTime: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
});
```

### 3. UI Load Testing with Playwright
```typescript
import { test, expect } from '@playwright/test';

test.describe('UI Load Testing', () => {
  test('should handle multiple users accessing the dashboard simultaneously', async ({ browser }) => {
    const CONCURRENT_USERS = 10;
    const userSessions = [];

    // Create multiple browser contexts to simulate different users
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();

      userSessions.push({
        page,
        context,
        userId: i
      });
    }

    const startTime = Date.now();

    // Simulate all users logging in and navigating simultaneously
    const navigationPromises = userSessions.map(async (session) => {
      try {
        // Login
        await session.page.goto('/login');
        await session.page.fill('[data-testid="email"]', `user${session.userId}@test.com`);
        await session.page.fill('[data-testid="password"]', 'password123');
        await session.page.click('[data-testid="login-button"]');

        // Navigate to dashboard
        await session.page.waitForURL('/dashboard');
        await session.page.waitForLoadState('networkidle');

        // Perform typical user actions
        await session.page.click('[data-testid="tasks-tab"]');
        await session.page.waitForSelector('[data-testid="task-list"]');

        await session.page.click('[data-testid="create-task-button"]');
        await session.page.fill('[data-testid="task-title"]', `Load Test Task ${session.userId}`);
        await session.page.click('[data-testid="save-task-button"]');

        return { success: true, userId: session.userId };
      } catch (error) {
        return { success: false, userId: session.userId, error: error.message };
      } finally {
        await session.context.close();
      }
    });

    const results = await Promise.all(navigationPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Analyze results
    const successfulSessions = results.filter(r => r.success).length;
    const failedSessions = results.filter(r => !r.success).length;
    const averageTimePerUser = totalTime / CONCURRENT_USERS;

    expect(successfulSessions).toBeGreaterThan(CONCURRENT_USERS * 0.9); // 90% success
    expect(averageTimePerUser).toBeLessThan(10000); // < 10 seconds per user
    expect(failedSessions).toBeLessThan(2); // < 2 failed sessions
  });

  test('should maintain UI responsiveness under load', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate rapid user interactions
    const interactions = [];
    for (let i = 0; i < 50; i++) {
      interactions.push(
        page.click('[data-testid="refresh-button"]', { timeout: 5000 })
      );

      // Small delay between clicks
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const startTime = Date.now();
    const results = await Promise.allSettled(interactions);
    const endTime = Date.now();

    const successfulInteractions = results.filter(r => r.status === 'fulfilled').length;
    const totalTime = endTime - startTime;
    const averageResponseTime = totalTime / interactions.length;

    expect(successfulInteractions / interactions.length).toBeGreaterThan(0.95);
    expect(averageResponseTime).toBeLessThan(200); // < 200ms per interaction
  });
});
```

### 4. Stress Testing for Breaking Points
```typescript
import { describe, it, expect } from 'vitest';

describe('Stress Testing', () => {
  it('should identify system breaking point gracefully', async () => {
    const stressLevels = [10, 50, 100, 200, 500, 1000];
    const results = [];

    for (const concurrentUsers of stressLevels) {
      console.log(`Testing with ${concurrentUsers} concurrent users...`);

      const stressResult = await runStressTest(concurrentUsers);
      results.push({
        concurrentUsers,
        ...stressResult
      });

      // Stop if we found the breaking point
      if (stressResult.successRate < 0.9) {
        console.log(`Breaking point found at ${concurrentUsers} users`);
        break;
      }

      // Cool down between stress levels
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    // Analyze stress test results
    const lastSuccessfulLevel = results.findLast(r => r.successRate >= 0.9);
    const firstFailureLevel = results.find(r => r.successRate < 0.9);

    expect(lastSuccessfulLevel).toBeDefined();
    expect(lastSuccessfulLevel.concurrentUsers).toBeGreaterThan(100); // Should handle at least 100 users

    if (firstFailureLevel) {
      expect(firstFailureLevel.errorTypes).toContain('rate_limiting'); // Should fail gracefully
    }
  });

  async function runStressTest(concurrentUsers: number) {
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < concurrentUsers; i++) {
      requests.push(
        performUserJourney(i)
      );
    }

    const results = await Promise.all(requests);
    const endTime = Date.now();

    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = results.filter(r => !r.success);
    const errorTypes = [...new Set(failedRequests.map(r => r.errorType))];

    return {
      successRate: successfulRequests / concurrentUsers,
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      totalTime: endTime - startTime,
      errorTypes,
      throughput: (successfulRequests * 1000) / (endTime - startTime) // requests per second
    };
  }

  async function performUserJourney(userId: number) {
    const startTime = Date.now();
    try {
      // Simulate a complete user journey
      await axios.post('/api/auth/login', {
        email: `user${userId}@test.com`,
        password: 'password'
      });

      await axios.get('/api/dashboard/metrics');
      await axios.get('/api/tasks');
      await axios.get('/api/projects');

      await axios.post('/api/tasks', {
        title: `Stress Test Task ${userId}`,
        description: 'Generated during stress test'
      });

      return {
        success: true,
        responseTime: Date.now() - startTime,
        userId
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        userId,
        errorType: classifyError(error)
      };
    }
  }

  function classifyError(error: any): string {
    if (error.response?.status === 429) return 'rate_limiting';
    if (error.response?.status === 503) return 'service_unavailable';
    if (error.response?.status === 500) return 'server_error';
    if (error.code === 'ECONNREFUSED') return 'connection_refused';
    if (error.code === 'TIMEOUT') return 'timeout';
    return 'unknown';
  }
});
```

### 5. Auto-scaling Validation
```typescript
import { describe, it, expect } from 'vitest';

describe('Auto-scaling Validation', () => {
  it('should trigger auto-scaling under load', async () => {
    const loadGenerator = new LoadGenerator();
    const scalingMonitor = new ScalingMonitor();

    // Start with baseline metrics
    const baselineMetrics = await scalingMonitor.getCurrentMetrics();

    // Gradually increase load
    const loadPhases = [
      { users: 50, duration: 120000 }, // 2 minutes
      { users: 150, duration: 180000 }, // 3 minutes
      { users: 300, duration: 240000 }, // 4 minutes
    ];

    for (const phase of loadPhases) {
      console.log(`Starting load phase: ${phase.users} users for ${phase.duration}ms`);

      await loadGenerator.rampUpTo(phase.users, 30000); // 30s ramp-up

      const phaseStartTime = Date.now();
      while (Date.now() - phaseStartTime < phase.duration) {
        await loadGenerator.maintainLoad();
        await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10s
      }

      // Check if auto-scaling was triggered
      const currentMetrics = await scalingMonitor.getCurrentMetrics();

      if (phase.users >= 150) {
        expect(currentMetrics.instanceCount).toBeGreaterThan(baselineMetrics.instanceCount);
        expect(currentMetrics.cpuUtilization).toBeLessThan(80); // Should scale before high CPU
      }
    }

    // Scale down gracefully
    await loadGenerator.scaleDown();

    // Wait for scale-down
    await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes

    const finalMetrics = await scalingMonitor.getCurrentMetrics();
    expect(finalMetrics.instanceCount).toBeLessThanOrEqual(baselineMetrics.instanceCount + 1);
  });

  it('should handle traffic spikes effectively', async () => {
    const spikeGenerator = new SpikeGenerator();

    // Generate sudden traffic spike
    const spikeResult = await spikeGenerator.generateSpike({
      fromUsers: 10,
      toUsers: 500,
      rampTime: 30000, // 30 seconds
      sustainTime: 120000, // 2 minutes
      downTime: 60000 // 1 minute
    });

    // Analyze spike handling
    expect(spikeResult.peakResponseTime).toBeLessThan(5000); // < 5s during spike
    expect(spikeResult.errorRate).toBeLessThan(0.05); // < 5% errors
    expect(spikeResult.recoveryTime).toBeLessThan(180000); // < 3 minutes recovery
  });
});

class LoadGenerator {
  private currentLoad = 0;
  private workers: Worker[] = [];

  async rampUpTo(targetUsers: number, rampTime: number): Promise<void> {
    const step = (targetUsers - this.currentLoad) / (rampTime / 1000);

    while (this.currentLoad < targetUsers) {
      this.currentLoad += step;
      await this.adjustWorkers(Math.floor(this.currentLoad));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async maintainLoad(): Promise<void> {
    // Keep current load steady
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async scaleDown(): Promise<void> {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.currentLoad = 0;
  }

  private async adjustWorkers(targetWorkers: number): Promise<void> {
    while (this.workers.length < targetWorkers) {
      const worker = new Worker('load-worker.js');
      this.workers.push(worker);
    }

    while (this.workers.length > targetWorkers) {
      const worker = this.workers.pop();
      worker?.terminate();
    }
  }
}
```

## Advanced Load Testing Scenarios

### JMeter Integration
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="BeProductive Load Test">
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>

    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="User Load">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">100</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">300</stringProp>
        <longProp name="ThreadGroup.start_time">1609459200000</longProp>
        <longProp name="ThreadGroup.end_time">1609459200000</longProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### k6 Load Testing Script
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  // Login
  let loginRes = http.post('https://api.beproductive.com/auth/login', {
    email: 'testuser@example.com',
    password: 'testpassword',
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  let authToken = loginRes.json('token');

  // Get tasks
  let tasksRes = http.get('https://api.beproductive.com/tasks', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  check(tasksRes, {
    'tasks status is 200': (r) => r.status === 200,
    'tasks response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Create task
  let createRes = http.post('https://api.beproductive.com/tasks',
    JSON.stringify({
      title: 'Load Test Task',
      description: 'Created during load test',
    }), {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(createRes, {
    'create task status is 201': (r) => r.status === 201,
  }) || errorRate.add(1);

  sleep(1);
}
```

## Success Criteria

### Load Testing Metrics
- **Concurrent Users**: Handle 1000+ simultaneous users
- **Response Time**: < 500ms average under normal load
- **Throughput**: > 100 requests/second sustained
- **Error Rate**: < 1% under normal load, < 5% under stress
- **Recovery Time**: < 5 minutes after load spike

### Performance Thresholds
1. **Login Performance**: < 2 seconds for 95% of requests
2. **API Response Time**: < 300ms for 90% of requests
3. **Database Queries**: < 100ms for simple queries
4. **Memory Usage**: < 85% of available memory
5. **CPU Utilization**: < 70% under normal load

## Usage Examples

### Run Load Tests
```bash
# Run basic load test
npm run load-test:basic

# Run stress test
npm run load-test:stress

# Run spike test
npm run load-test:spike

# Run endurance test
npm run load-test:endurance
```

### Custom Load Testing
```typescript
// Create custom load test scenario
const loadTest = new LoadTestScenario({
  name: 'User Registration Flow',
  stages: [
    { users: 10, duration: '1m' },
    { users: 50, duration: '5m' },
    { users: 100, duration: '3m' }
  ],
  actions: [
    'navigate_to_signup',
    'fill_registration_form',
    'verify_email',
    'complete_onboarding'
  ]
});

await loadTest.execute();
```

## Best Practices

1. **Realistic Scenarios**: Test actual user behavior patterns
2. **Gradual Load Increase**: Ramp up load gradually to identify breaking points
3. **Environment Isolation**: Use dedicated testing environments
4. **Baseline Establishment**: Establish performance baselines before changes
5. **Continuous Testing**: Integrate load testing into CI/CD pipeline
6. **Resource Monitoring**: Monitor all system components during tests

## Related Agents
- **Performance Profiler Agent**: For detailed performance analysis
- **Reliability Monitor Agent**: For system stability assessment
- **Security Scanner Agent**: For security under load
- **DevOps Automator Agent**: For automated infrastructure scaling