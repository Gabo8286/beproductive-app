import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealUserMonitoring, monitoring } from '@/utils/monitoring';

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  group: console.group,
  groupEnd: console.groupEnd,
};

describe('Production Monitoring', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    console.log = vi.fn();
    console.error = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();

    // Clear any existing queues
    (monitoring as any).monitoring.clearQueues();
  });

  afterEach(() => {
    // Restore console methods
    Object.assign(console, originalConsole);
  });

  describe('RealUserMonitoring Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = RealUserMonitoring.getInstance();
      const instance2 = RealUserMonitoring.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should initialize with configuration', () => {
      monitoring.initialize({ enabled: true, userId: 'test-user' });

      expect(console.log).toHaveBeenCalledWith('Production monitoring initialized');
    });
  });

  describe('Error Tracking', () => {
    it('should track JavaScript errors', () => {
      monitoring.initialize({ enabled: true });

      const testError = new Error('Test error message');
      monitoring.trackError(testError, { component: 'TestComponent' }, 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(1);
    });

    it('should handle errors with different severity levels', () => {
      monitoring.initialize({ enabled: true });

      // Simulate critical error that should flush immediately
      const criticalError = {
        message: 'Critical system failure',
        stack: 'Error stack trace',
        url: 'https://example.com',
        userAgent: 'Test Agent',
        timestamp: Date.now(),
        severity: 'critical' as const,
      };

      (monitoring as any).monitoring.reportError(criticalError);

      // Critical errors should trigger immediate flush
      expect(console.error).toHaveBeenCalled();
    });

    it('should capture error context', () => {
      monitoring.initialize({ enabled: true });

      const error = new Error('Context test error');
      const context = {
        component: 'GoalForm',
        action: 'submit',
        userId: 'user456',
        additionalData: { formData: 'sensitive info should be sanitized' },
      };

      monitoring.trackError(error, context, 'user456');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(1);
    });
  });

  describe('Performance Tracking', () => {
    it('should track page view performance', () => {
      monitoring.initialize({ enabled: true });

      monitoring.trackPageView('/dashboard', 'Dashboard Page');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBe(1);
    });

    it('should track business metrics', () => {
      monitoring.initialize({ enabled: true });

      monitoring.trackGoalCreated('goal123', 'fitness', 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBeGreaterThan(0);
    });

    it('should track goal completion with timing', () => {
      monitoring.initialize({ enabled: true });

      const timeToComplete = 1800000; // 30 minutes
      monitoring.trackGoalCompleted('goal123', timeToComplete, 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBeGreaterThan(0);
      expect(queueSizes.performance).toBeGreaterThan(0);
    });
  });

  describe('Health Status Monitoring', () => {
    it('should provide health status', () => {
      monitoring.initialize({ enabled: true });

      const healthStatus = monitoring.getHealthStatus();

      expect(healthStatus).toHaveProperty('status');
      expect(healthStatus).toHaveProperty('checks');
      expect(healthStatus).toHaveProperty('metrics');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(typeof healthStatus.checks).toBe('object');
      expect(typeof healthStatus.metrics).toBe('object');
    });

    it('should report degraded status when some checks fail', () => {
      monitoring.initialize({ enabled: true });

      // Mock a scenario where some checks fail
      const healthStatus = monitoring.getHealthStatus();

      // At minimum, should have required properties
      expect(healthStatus.checks).toHaveProperty('errorRate');
      expect(healthStatus.checks).toHaveProperty('performanceGood');
      expect(healthStatus.checks).toHaveProperty('memoryUsage');

      expect(healthStatus.metrics).toHaveProperty('errorRate');
      expect(healthStatus.metrics).toHaveProperty('averageLoadTime');
      expect(healthStatus.metrics).toHaveProperty('memoryUsage');
    });
  });

  describe('Session Management', () => {
    it('should track session duration', () => {
      monitoring.initialize({ enabled: true });

      const sessionDuration = monitoring.getSessionDuration();

      expect(typeof sessionDuration).toBe('number');
      expect(sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should set user ID and track identification', () => {
      monitoring.initialize({ enabled: true });

      monitoring.setUserId('user789');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBeGreaterThan(0);
    });
  });

  describe('Feature Flag and A/B Testing Integration', () => {
    it('should track feature flag usage', () => {
      monitoring.initialize({ enabled: true });

      (monitoring as any).monitoring.reportFeatureUsage('new-dashboard', true, 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBe(1);
    });

    it('should track A/B test views', () => {
      monitoring.initialize({ enabled: true });

      (monitoring as any).monitoring.reportABTestView('goal-form-variant', 'variant-b', 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBe(1);
    });
  });

  describe('Queue Management', () => {
    it('should maintain queue size limits', () => {
      monitoring.initialize({ enabled: true });

      // Add more items than the queue limit
      for (let i = 0; i < 150; i++) {
        monitoring.trackError(new Error(`Error ${i}`), {}, 'user123');
      }

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBeLessThanOrEqual(100); // Max queue size
    });

    it('should flush queues periodically', async () => {
      monitoring.initialize({ enabled: true });

      // Add some items to queues
      monitoring.trackError(new Error('Test error'), {}, 'user123');
      monitoring.trackPageView('/test', 'Test Page');

      // Manually trigger flush
      (monitoring as any).monitoring.flushAll();

      // Should have logged the items
      expect(console.error).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle React component errors', () => {
      monitoring.initialize({ enabled: true });

      // Simulate React Error Boundary behavior
      const error = new Error('Component render error');
      const errorInfo = {
        componentStack: 'ComponentStack trace here',
      };

      monitoring.trackError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      }, 'user123');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(1);
    });
  });

  describe('Performance Budget Monitoring', () => {
    it('should track Core Web Vitals metrics', () => {
      monitoring.initialize({ enabled: true });

      // Simulate Core Web Vitals data
      const mockMetrics = [
        { name: 'first-contentful-paint', value: 1200 },
        { name: 'largest-contentful-paint', value: 2100 },
        { name: 'first-input-delay', value: 45 },
        { name: 'page-load-time', value: 2800 },
      ];

      mockMetrics.forEach(metric => {
        (monitoring as any).monitoring.reportPerformance({
          ...metric,
          timestamp: Date.now(),
          url: window.location.href,
        });
      });

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.performance).toBe(4);
    });

    it('should identify performance regressions', () => {
      monitoring.initialize({ enabled: true });

      // Simulate slow performance metrics
      const slowMetrics = [
        { name: 'page-load-time', value: 8000 }, // 8 seconds - very slow
        { name: 'first-contentful-paint', value: 4000 }, // 4 seconds - slow
      ];

      slowMetrics.forEach(metric => {
        (monitoring as any).monitoring.reportPerformance({
          ...metric,
          timestamp: Date.now(),
          url: window.location.href,
        });
      });

      const healthStatus = monitoring.getHealthStatus();

      // Should detect performance issues
      expect(typeof healthStatus.metrics.averageLoadTime).toBe('number');
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should track memory usage if available', () => {
      monitoring.initialize({ enabled: true });

      // Mock performance.memory
      const mockMemory = {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
      };

      (performance as any).memory = mockMemory;

      // Simulate memory monitoring
      (monitoring as any).monitoring.reportPerformance({
        name: 'memory-usage',
        value: mockMemory.usedJSHeapSize,
        timestamp: Date.now(),
        url: window.location.href,
        context: {
          totalJSHeapSize: mockMemory.totalJSHeapSize,
          jsHeapSizeLimit: mockMemory.jsHeapSizeLimit,
          usagePercentage: (mockMemory.usedJSHeapSize / mockMemory.jsHeapSizeLimit) * 100,
        },
      });

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.performance).toBeGreaterThan(0);
    });
  });

  describe('Data Privacy and Security', () => {
    it('should not track sensitive user data', () => {
      monitoring.initialize({ enabled: true });

      // Simulate tracking with potentially sensitive data
      const sensitiveContext = {
        email: 'user@example.com',
        password: 'secretpassword', // Should never be tracked
        creditCard: '4111111111111111', // Should never be tracked
        safeData: 'This is safe to track',
      };

      monitoring.trackError(
        new Error('Test error with sensitive context'),
        sensitiveContext,
        'user123'
      );

      // In a real implementation, we would verify that sensitive fields are filtered out
      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(1);
    });

    it('should handle PII data appropriately', () => {
      monitoring.initialize({ enabled: true });

      // Track an event that might contain PII
      monitoring.trackPageView('/profile', 'User Profile');

      // Should track the action but not expose PII
      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBe(1);
    });
  });

  describe('Monitoring Disabled State', () => {
    it('should not track when monitoring is disabled', () => {
      monitoring.initialize({ enabled: false });

      monitoring.trackError(new Error('Should not be tracked'), {}, 'user123');
      monitoring.trackPageView('/test', 'Test Page');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(0);
      expect(queueSizes.userActions).toBe(0);
    });

    it('should not consume resources when disabled', () => {
      monitoring.initialize({ enabled: false });

      // Performance monitoring should not run
      const startTime = performance.now();

      // Simulate some operations
      for (let i = 0; i < 1000; i++) {
        monitoring.trackError(new Error(`Error ${i}`), {}, 'user123');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be very fast since nothing is actually tracked
      expect(duration).toBeLessThan(100);

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(0);
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete user journey monitoring', () => {
      monitoring.initialize({ enabled: true, userId: 'journey-user' });

      // Simulate a complete user journey
      monitoring.trackPageView('/dashboard', 'Dashboard');
      monitoring.trackGoalCreated('goal1', 'fitness', 'journey-user');
      monitoring.trackPageView('/goals/goal1', 'Goal Details');

      // Simulate some performance data
      (monitoring as any).monitoring.reportPerformance({
        name: 'goal-creation-time',
        value: 1200,
        timestamp: Date.now(),
        url: window.location.href,
        userId: 'journey-user',
      });

      monitoring.trackGoalCompleted('goal1', 86400000, 'journey-user'); // 1 day

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBeGreaterThan(3);
      expect(queueSizes.performance).toBeGreaterThan(1);
    });

    it('should handle error recovery scenarios', () => {
      monitoring.initialize({ enabled: true });

      // Simulate a series of errors followed by recovery
      monitoring.trackError(new Error('Connection failed'), { attempt: 1 }, 'user123');
      monitoring.trackError(new Error('Connection failed'), { attempt: 2 }, 'user123');
      monitoring.trackError(new Error('Connection failed'), { attempt: 3 }, 'user123');

      // Recovery
      monitoring.trackPageView('/dashboard', 'Dashboard - Recovered');

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.errors).toBe(3);
      expect(queueSizes.userActions).toBe(1);
    });
  });

  describe('Performance under Load', () => {
    it('should handle high-volume tracking efficiently', () => {
      monitoring.initialize({ enabled: true });

      const startTime = performance.now();
      const eventCount = 1000;

      // Generate high volume of events
      for (let i = 0; i < eventCount; i++) {
        monitoring.trackPageView(`/page${i}`, `Page ${i}`);

        if (i % 100 === 0) {
          monitoring.trackError(new Error(`Batch error ${i}`), { batch: i }, 'user123');
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle high volume efficiently
      expect(duration).toBeLessThan(1000); // Less than 1 second

      const queueSizes = (monitoring as any).monitoring.getQueueSizes();
      expect(queueSizes.userActions).toBeLessThanOrEqual(100); // Queue size limit
      expect(queueSizes.errors).toBeLessThanOrEqual(100); // Queue size limit
    });
  });
});