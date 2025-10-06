# Reliability Monitor Agent 🛡️

## Purpose
Continuously monitor system reliability, detect failures, validate redundancy mechanisms, and ensure high availability through automated health checks, failover testing, and proactive issue detection.

## Capabilities
- Real-time uptime monitoring
- Automated health check execution
- Failover mechanism validation
- Circuit breaker testing
- Service dependency mapping
- Error rate tracking
- Recovery time measurement
- Incident detection and alerting
- SLA compliance monitoring
- Chaos engineering automation

## Tech Stack & Tools
- **Monitoring**: Pingdom, DataDog, New Relic, Grafana
- **Health Checks**: Custom REST endpoints, TCP checks
- **Circuit Breakers**: Hystrix, resilience4j
- **Service Mesh**: Istio, Linkerd for observability
- **Chaos Engineering**: Chaos Monkey, Gremlin
- **Alerting**: PagerDuty, Slack, Email
- **Metrics**: Prometheus, CloudWatch

## Reliability Testing Templates

### 1. Service Health Monitoring
```typescript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Service Health Monitoring', () => {
  const services = [
    { name: 'api', url: '/api/health', timeout: 5000 },
    { name: 'database', url: '/api/health/database', timeout: 3000 },
    { name: 'auth', url: '/api/health/auth', timeout: 2000 },
    { name: 'storage', url: '/api/health/storage', timeout: 4000 }
  ];

  services.forEach(service => {
    it(`should verify ${service.name} service health`, async () => {
      const startTime = Date.now();
      
      try {
        const response = await axios.get(service.url, {
          timeout: service.timeout
        });
        
        const responseTime = Date.now() - startTime;
        
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('healthy');
        expect(responseTime).toBeLessThan(service.timeout);
        expect(response.data.timestamp).toBeDefined();
        
        // Verify service-specific health metrics
        if (service.name === 'database') {
          expect(response.data.connectionPool).toBeDefined();
          expect(response.data.queryTime).toBeLessThan(100);
        }
        
        if (service.name === 'auth') {
          expect(response.data.tokenValidation).toBe('working');
        }
        
      } catch (error) {
        throw new Error(`${service.name} health check failed: ${error.message}`);
      }
    });
  });

  it('should detect service degradation', async () => {
    const healthChecks = [];
    
    // Perform multiple health checks over time
    for (let i = 0; i < 10; i++) {
      const checkResult = await performHealthCheck('/api/health');
      healthChecks.push(checkResult);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const avgResponseTime = healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length;
    const errorRate = healthChecks.filter(check => !check.success).length / healthChecks.length;
    
    expect(avgResponseTime).toBeLessThan(1000); // < 1s average
    expect(errorRate).toBeLessThan(0.1); // < 10% error rate
  });
});

async function performHealthCheck(url: string) {
  const startTime = Date.now();
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return {
      success: true,
      responseTime: Date.now() - startTime,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}
```

### 2. Failover Testing
```typescript
import { describe, it, expect } from 'vitest';

describe('Failover Testing', () => {
  it('should failover to backup database', async () => {
    const dbMonitor = new DatabaseMonitor();
    
    // Verify primary database is active
    expect(await dbMonitor.isPrimaryActive()).toBe(true);
    
    // Simulate primary database failure
    await dbMonitor.simulateFailure('primary');
    
    // Wait for failover detection
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify failover occurred
    expect(await dbMonitor.isSecondaryActive()).toBe(true);
    expect(await dbMonitor.canPerformWrites()).toBe(true);
    
    // Test data consistency
    const testData = { id: 'failover-test', value: 'test-value' };
    await dbMonitor.writeData(testData);
    const readData = await dbMonitor.readData(testData.id);
    
    expect(readData).toEqual(testData);
    
    // Restore primary and verify failback
    await dbMonitor.restorePrimary();
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    expect(await dbMonitor.isPrimaryActive()).toBe(true);
  });

  it('should maintain service availability during failover', async () => {
    const serviceMonitor = new ServiceMonitor();
    const requests = [];
    
    // Start continuous requests
    const requestInterval = setInterval(async () => {
      try {
        const response = await axios.get('/api/tasks');
        requests.push({ success: true, timestamp: Date.now() });
      } catch (error) {
        requests.push({ success: false, timestamp: Date.now(), error: error.message });
      }
    }, 1000);
    
    // Simulate service failure after 10 requests
    setTimeout(() => serviceMonitor.simulateFailure(), 10000);
    
    // Let it run for 30 seconds total
    await new Promise(resolve => setTimeout(resolve, 30000));
    clearInterval(requestInterval);
    
    // Analyze availability during failover
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const availability = successfulRequests / totalRequests;
    
    expect(availability).toBeGreaterThan(0.95); // 95% availability
    
    // Check recovery time
    const failureStart = requests.findIndex(r => !r.success);
    const recoveryPoint = requests.slice(failureStart).findIndex(r => r.success) + failureStart;
    
    if (failureStart > -1 && recoveryPoint > failureStart) {
      const recoveryTime = requests[recoveryPoint].timestamp - requests[failureStart].timestamp;
      expect(recoveryTime).toBeLessThan(30000); // < 30 seconds recovery
    }
  });
});
```

### 3. Circuit Breaker Validation
```typescript
import { describe, it, expect } from 'vitest';

describe('Circuit Breaker Testing', () => {
  it('should open circuit breaker on service failures', async () => {
    const circuitBreaker = new CircuitBreakerMonitor();
    
    // Verify circuit is initially closed
    expect(await circuitBreaker.getState()).toBe('CLOSED');
    
    // Generate failures to trigger circuit breaker
    const failureRequests = [];
    for (let i = 0; i < 10; i++) {
      failureRequests.push(
        axios.get('/api/unreliable-service').catch(err => err.response)
      );
    }
    
    await Promise.all(failureRequests);
    
    // Verify circuit breaker opened
    expect(await circuitBreaker.getState()).toBe('OPEN');
    
    // Verify subsequent requests are immediately rejected
    try {
      await axios.get('/api/unreliable-service');
      throw new Error('Request should have been rejected by circuit breaker');
    } catch (error) {
      expect(error.message).toContain('circuit breaker');
    }
  });

  it('should transition to half-open and recover', async () => {
    const circuitBreaker = new CircuitBreakerMonitor();
    
    // Assume circuit breaker is open from previous failures
    await circuitBreaker.forceOpen();
    
    // Wait for timeout period
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Verify transition to half-open
    expect(await circuitBreaker.getState()).toBe('HALF_OPEN');
    
    // Make successful request to trigger recovery
    const response = await axios.get('/api/reliable-service');
    expect(response.status).toBe(200);
    
    // Verify circuit breaker closed
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(await circuitBreaker.getState()).toBe('CLOSED');
  });
});
```

## Success Criteria

### Reliability Metrics
- **Uptime**: > 99.9% availability
- **MTBF (Mean Time Between Failures)**: > 720 hours
- **MTTR (Mean Time To Recovery)**: < 5 minutes
- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 1 hour

### Performance Thresholds
1. **Health Check Response**: < 1 second
2. **Failover Detection**: < 30 seconds
3. **Service Recovery**: < 5 minutes
4. **Circuit Breaker Response**: < 100ms
5. **Error Rate**: < 0.1% under normal conditions

## Usage Examples

```bash
# Run reliability tests
npm run reliability:test

# Monitor system health
npm run reliability:monitor

# Test failover scenarios
npm run reliability:failover-test

# Chaos engineering
npm run reliability:chaos
```

## Related Agents
- **Performance Profiler Agent**: For performance impact analysis
- **Load Tester Agent**: For reliability under load
- **Recovery Driller Agent**: For disaster recovery testing
- **Security Scanner Agent**: For security incident response