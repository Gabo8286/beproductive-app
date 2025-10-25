// Monitoring & Alerting Agent
import { ClaudeClient } from '@/agents/shared/claude-client';
import { NotificationService } from '@/agents/shared/notification-service';
import { AgentConfig, getConfig } from '@/agents/shared/config';

export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  resources: {
    cpu: { usage: number; cores: number };
    memory: { usage: number; total: number; free: number };
    disk: { usage: number; total: number; free: number };
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  api: {
    requestsPerMinute: number;
    activeUsers: number;
    failedRequests: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  lastCheck: string;
}

export class MonitoringAgent {
  private config: AgentConfig;
  private claude: ClaudeClient;
  private notifications: NotificationService;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...getConfig(), ...config };
    this.claude = new ClaudeClient(this.config.claudeApiKey, this.config.claudeModel);
    this.notifications = new NotificationService(this.config);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔍 Monitoring Agent is already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting Monitoring Agent...');

    // Run initial check
    await this.runHealthCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(async () => {
      try {
        await this.runHealthCheck();
      } catch (error) {
        console.error('Monitoring check failed:', error);
        await this.notifications.sendError(
          'MonitoringAgent',
          'Monitoring Check Failed',
          `Failed to complete health check: ${error}`,
        );
      }
    }, this.config.intervals.monitoring);

    await this.notifications.sendInfo(
      'MonitoringAgent',
      'Monitoring Agent Started',
      `Agent started with ${this.config.intervals.monitoring / 1000}s intervals`,
    );
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    console.log('🔍 Monitoring Agent stopped');
    await this.notifications.sendInfo(
      'MonitoringAgent',
      'Monitoring Agent Stopped',
      'Agent has been gracefully shut down',
    );
  }

  private async runHealthCheck(): Promise<HealthStatus> {
    try {
      console.log('🔍 Running health check...');

      // Collect system metrics
      const metrics = await this.collectMetrics();

      // Analyze metrics with Claude AI
      const analysis = await this.claude.analyzeMetrics(metrics);

      // Determine overall health status
      const healthStatus: HealthStatus = {
        status: this.mapSeverityToStatus(analysis.severity),
        issues: analysis.issues,
        recommendations: analysis.recommendations,
        lastCheck: new Date().toISOString(),
      };

      // Send alerts if issues detected
      if (healthStatus.status !== 'healthy') {
        await this.sendHealthAlert(healthStatus, metrics);
      }

      // Log results
      if (this.config.enableLogging) {
        console.log('Health Status:', healthStatus);
      }

      return healthStatus;
    } catch (error) {
      console.error('Health check failed:', error);
      const errorStatus: HealthStatus = {
        status: 'critical',
        issues: [`Health check failed: ${error}`],
        recommendations: ['Check monitoring agent configuration', 'Verify API endpoints'],
        lastCheck: new Date().toISOString(),
      };

      await this.notifications.sendCritical(
        'MonitoringAgent',
        'Health Check Failed',
        `Unable to complete health check: ${error}`,
      );

      return errorStatus;
    }
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const startTime = Date.now();

    // Simulate metric collection from various sources
    // In production, these would come from your actual monitoring endpoints
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: await this.getPerformanceMetrics(),
      resources: await this.getResourceMetrics(),
      database: await this.getDatabaseMetrics(),
      api: await this.getApiMetrics(),
    };

    const collectionTime = Date.now() - startTime;
    console.log(`📊 Metrics collected in ${collectionTime}ms`);

    return metrics;
  }

  private async getPerformanceMetrics(): Promise<SystemMetrics['performance']> {
    try {
      // Try to fetch from your application's metrics endpoint
      const response = await fetch(`${this.config.supabaseUrl.replace('supabase.co', 'supabase.co')}/api/metrics`);
      if (response.ok) {
        const data = await response.json();
        return {
          responseTime: data.performance?.responseTime || 0,
          throughput: data.performance?.throughput || 0,
          errorRate: data.performance?.errorRate || 0,
        };
      }
    } catch (error) {
      console.warn('Could not fetch performance metrics:', error);
    }

    // Fallback to simulated metrics
    return {
      responseTime: Math.random() * 1000 + 200, // 200-1200ms
      throughput: Math.random() * 100 + 50, // 50-150 requests/sec
      errorRate: Math.random() * 2, // 0-2%
    };
  }

  private async getResourceMetrics(): Promise<SystemMetrics['resources']> {
    // In a real implementation, you'd get this from system monitoring tools
    return {
      cpu: {
        usage: Math.random() * 60 + 20, // 20-80%
        cores: 4,
      },
      memory: {
        usage: Math.random() * 60 + 30, // 30-90%
        total: 8192, // 8GB
        free: 2048, // 2GB
      },
      disk: {
        usage: Math.random() * 40 + 40, // 40-80%
        total: 100, // 100GB
        free: 30, // 30GB
      },
    };
  }

  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    try {
      // For Supabase, you might query system tables or use monitoring APIs
      // This is a simplified simulation
      return {
        connections: Math.floor(Math.random() * 50 + 10), // 10-60 connections
        queryTime: Math.random() * 100 + 10, // 10-110ms average
        slowQueries: Math.floor(Math.random() * 5), // 0-5 slow queries
      };
    } catch (error) {
      console.warn('Database metrics unavailable:', error);
      return {
        connections: 0,
        queryTime: 0,
        slowQueries: 0,
      };
    }
  }

  private async getApiMetrics(): Promise<SystemMetrics['api']> {
    return {
      requestsPerMinute: Math.floor(Math.random() * 1000 + 100), // 100-1100 RPM
      activeUsers: Math.floor(Math.random() * 500 + 50), // 50-550 users
      failedRequests: Math.floor(Math.random() * 20), // 0-20 failed requests
    };
  }

  private mapSeverityToStatus(severity: string): HealthStatus['status'] {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'critical';
      case 'medium':
        return 'warning';
      default:
        return 'healthy';
    }
  }

  private async sendHealthAlert(status: HealthStatus, metrics: SystemMetrics): Promise<void> {
    const title = `System Health Alert: ${status.status.toUpperCase()}`;
    const message = `
Issues detected:
${status.issues.map(issue => `• ${issue}`).join('\n')}

Recommendations:
${status.recommendations.map(rec => `• ${rec}`).join('\n')}

Current Metrics:
• Response Time: ${metrics.performance.responseTime.toFixed(2)}ms
• Error Rate: ${metrics.performance.errorRate.toFixed(2)}%
• CPU Usage: ${metrics.resources.cpu.usage.toFixed(1)}%
• Memory Usage: ${metrics.resources.memory.usage.toFixed(1)}%
    `.trim();

    if (status.status === 'critical') {
      await this.notifications.sendCritical('MonitoringAgent', title, message, { metrics, status });
    } else {
      await this.notifications.sendWarning('MonitoringAgent', title, message, { metrics, status });
    }
  }

  // Public API methods
  async getLastHealthStatus(): Promise<HealthStatus | null> {
    try {
      return await this.runHealthCheck();
    } catch (error) {
      console.error('Failed to get health status:', error);
      return null;
    }
  }

  async forceHealthCheck(): Promise<HealthStatus> {
    return await this.runHealthCheck();
  }

  getStatus(): { running: boolean; config: AgentConfig } {
    return {
      running: this.isRunning,
      config: this.config,
    };
  }
}