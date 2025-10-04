
// healthCheck.ts
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  environment: string;
  checks: {
    database: HealthStatus;
    api: HealthStatus;
    cache: HealthStatus;
    auth: HealthStatus;
  };
  performance: {
    responseTime: number;
    memoryUsage?: number;
  };
}

interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  responseTime?: number;
  lastChecked: number;
}

class HealthChecker {
  private cache: Map<string, HealthStatus> = new Map();
  private readonly cacheTimeout = 30000; // 30 seconds

  async checkDatabase(): Promise<HealthStatus> {
    const cached = this.getCached('database');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      // Simple database connectivity check
      const response = await fetch('/api/health/db', {
        method: 'GET',
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'error',
        message: response.ok ? 'Database connected' : 'Database connection failed',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('database', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: `Database check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('database', status);
      return status;
    }
  }

  async checkAPI(): Promise<HealthStatus> {
    const cached = this.getCached('api');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      const response = await fetch('/api/health/api', {
        method: 'GET',
        timeout: 3000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'warning',
        message: response.ok ? 'API responding' : 'API slow response',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('api', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: `API check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('api', status);
      return status;
    }
  }

  async checkAuth(): Promise<HealthStatus> {
    const cached = this.getCached('auth');
    if (cached) return cached;

    const startTime = Date.now();
    try {
      // Check if auth service is responsive
      const response = await fetch('/api/health/auth', {
        method: 'GET',
        timeout: 3000
      });

      const responseTime = Date.now() - startTime;
      const status: HealthStatus = {
        status: response.ok ? 'ok' : 'warning',
        message: response.ok ? 'Auth service available' : 'Auth service issues',
        responseTime,
        lastChecked: Date.now()
      };

      this.cache.set('auth', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        status: 'error',
        message: `Auth check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      };

      this.cache.set('auth', status);
      return status;
    }
  }

  checkCache(): HealthStatus {
    try {
      localStorage.setItem('health-check-test', 'test');
      localStorage.removeItem('health-check-test');

      return {
        status: 'ok',
        message: 'Local storage available',
        lastChecked: Date.now()
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Local storage issues',
        lastChecked: Date.now()
      };
    }
  }

  private getCached(key: string): HealthStatus | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.lastChecked < this.cacheTimeout) {
      return cached;
    }
    return null;
  }

  async getHealthStatus(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const [database, api, auth] = await Promise.all([
      this.checkDatabase(),
      this.checkAPI(),
      this.checkAuth()
    ]);

    const cache = this.checkCache();

    const checks = { database, api, cache, auth };

    // Determine overall status
    const hasError = Object.values(checks).some(check => check.status === 'error');
    const hasWarning = Object.values(checks).some(check => check.status === 'warning');

    const overallStatus = hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      timestamp: Date.now(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
      checks,
      performance: {
        responseTime: Date.now() - startTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  }
}

export const healthChecker = new HealthChecker();

// React hook for health monitoring
export function useHealthCheck(intervalMs: number = 60000) {
  const [health, setHealth] = React.useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkHealth() {
      try {
        const result = await healthChecker.getHealthStatus();
        setHealth(result);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    interval = setInterval(checkHealth, intervalMs);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [intervalMs]);

  return { health, loading };
}
