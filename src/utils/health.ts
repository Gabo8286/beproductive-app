/**
 * Health Check and System Status Utilities
 * For production monitoring and deployment validation
 */

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      duration: number;
      output?: string;
      error?: string;
    };
  };
}

export interface SystemInfo {
  version: string;
  buildTime: string;
  commitHash: string;
  environment: string;
  features: string[];
  performance: {
    memoryUsage?: any;
    bundleSize: number;
    loadTime: number;
  };
}

class HealthChecker {
  private startTime = Date.now();
  private version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  private environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';

  async runHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;
    const checks: HealthCheckResult['checks'] = {};

    // Database connectivity check
    checks.database = await this.checkDatabase();

    // API connectivity check
    checks.api = await this.checkAPI();

    // Authentication service check
    checks.auth = await this.checkAuth();

    // Performance check
    checks.performance = await this.checkPerformance();

    // Feature availability check
    checks.features = await this.checkFeatures();

    // Memory usage check
    checks.memory = await this.checkMemory();

    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    let status: HealthCheckResult['status'] = 'healthy';

    if (statuses.includes('fail')) {
      status = 'unhealthy';
    } else if (statuses.includes('warn')) {
      status = 'degraded';
    }

    return {
      status,
      timestamp,
      version: this.version,
      uptime,
      checks
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    try {
      // Check Supabase connection
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { error } = await supabase.from('profiles').select('count').limit(1);
      const duration = performance.now() - start;

      if (error) {
        return {
          status: 'fail',
          duration,
          error: error.message
        };
      }

      return {
        status: duration > 1000 ? 'warn' : 'pass',
        duration,
        output: `Database responsive in ${duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  private async checkAPI(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const duration = performance.now() - start;

      if (!response.ok) {
        return {
          status: 'fail',
          duration,
          error: `API returned ${response.status}: ${response.statusText}`
        };
      }

      return {
        status: duration > 2000 ? 'warn' : 'pass',
        duration,
        output: `API responsive in ${duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : 'API unreachable'
      };
    }
  }

  private async checkAuth(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase.auth.getSession();
      const duration = performance.now() - start;

      if (error) {
        return {
          status: 'warn',
          duration,
          output: 'Auth service accessible but returned error'
        };
      }

      return {
        status: 'pass',
        duration,
        output: `Auth service responsive in ${duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        error: error instanceof Error ? error.message : 'Auth service unavailable'
      };
    }
  }

  private async checkPerformance(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const metrics = {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime
      };

      const duration = performance.now() - start;

      // Check if performance is acceptable
      const slowMetrics = Object.entries(metrics).filter(([_, value]) => value && value > 3000);

      return {
        status: slowMetrics.length > 0 ? 'warn' : 'pass',
        duration,
        output: `Performance metrics collected: ${JSON.stringify(metrics)}`
      };
    } catch (error) {
      return {
        status: 'warn',
        duration: performance.now() - start,
        error: 'Performance metrics unavailable'
      };
    }
  }

  private async checkFeatures(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    const features = {
      aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      collaboration: import.meta.env.VITE_ENABLE_COLLABORATION === 'true',
      gamification: import.meta.env.VITE_ENABLE_GAMIFICATION === 'true'
    };

    const enabledFeatures = Object.entries(features).filter(([_, enabled]) => enabled);
    const duration = performance.now() - start;

    return {
      status: 'pass',
      duration,
      output: `Features enabled: ${enabledFeatures.map(([name]) => name).join(', ')}`
    };
  }

  private async checkMemory(): Promise<HealthCheckResult['checks'][string]> {
    const start = performance.now();

    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        const duration = performance.now() - start;

        return {
          status: usedPercent > 80 ? 'warn' : 'pass',
          duration,
          output: `Memory usage: ${usedPercent.toFixed(2)}% (${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB)`
        };
      }

      return {
        status: 'pass',
        duration: performance.now() - start,
        output: 'Memory monitoring not supported'
      };
    } catch (error) {
      return {
        status: 'warn',
        duration: performance.now() - start,
        error: 'Memory check failed'
      };
    }
  }

  getSystemInfo(): SystemInfo {
    const features = [];

    if (import.meta.env.VITE_ENABLE_AI_FEATURES === 'true') features.push('ai');
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') features.push('analytics');
    if (import.meta.env.VITE_ENABLE_COLLABORATION === 'true') features.push('collaboration');
    if (import.meta.env.VITE_ENABLE_GAMIFICATION === 'true') features.push('gamification');

    return {
      version: this.version,
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
      commitHash: import.meta.env.VITE_COMMIT_HASH || 'unknown',
      environment: this.environment,
      features,
      performance: {
        memoryUsage: 'memory' in performance ? (performance as any).memory : undefined,
        bundleSize: 0, // Would be populated by build process
        loadTime: performance.now()
      }
    };
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker();

// React hook for health monitoring
export const useHealthCheck = () => {
  const [healthData, setHealthData] = React.useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const checkHealth = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await healthChecker.runHealthCheck();
      setHealthData(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkHealth();

    // Run health check every 5 minutes in production
    if (import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
      const interval = setInterval(checkHealth, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [checkHealth]);

  return {
    healthData,
    isLoading,
    checkHealth,
    systemInfo: healthChecker.getSystemInfo()
  };
};

// Endpoint handlers for status page
export const handleHealthCheck = async () => {
  return await healthChecker.runHealthCheck();
};

export const handleSystemInfo = () => {
  return healthChecker.getSystemInfo();
};

// Initialize health monitoring in production
if (typeof window !== 'undefined' && import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
  // Expose health check for monitoring tools
  (window as any).__health = {
    check: () => healthChecker.runHealthCheck(),
    info: () => healthChecker.getSystemInfo()
  };
}