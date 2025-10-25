// AI Agents Orchestrator - Main coordination system
import { MonitoringAgent } from '@/agents/monitoring/monitoring-agent';
import { SecurityMonitoringAgent } from '@/agents/security/security-monitor';
import { BackupRecoveryAgent } from '@/agents/backup/backup-agent';
import { AgentConfig, getConfig } from '@/agents/shared/config';
import { NotificationService } from '@/agents/shared/notification-service';

export interface AgentStatus {
  name: string;
  running: boolean;
  last_check?: string;
  health: 'healthy' | 'warning' | 'error';
  metrics?: any;
}

export interface OrchestatorStatus {
  total_agents: number;
  running_agents: number;
  system_health: 'healthy' | 'warning' | 'critical';
  last_update: string;
  agents: AgentStatus[];
}

export class AgentOrchestrator {
  private config: AgentConfig;
  private notifications: NotificationService;
  private agents: Map<string, any> = new Map();
  private isRunning = false;
  private healthCheckInterval?: NodeJS.Timeout;

  // Agent instances
  private monitoringAgent?: MonitoringAgent;
  private securityAgent?: SecurityMonitoringAgent;
  private backupAgent?: BackupRecoveryAgent;

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...getConfig(), ...config };
    this.notifications = new NotificationService(this.config);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🤖 Agent Orchestrator is already running');
      return;
    }

    console.log('🤖 Starting AI Agent Orchestrator...');
    this.isRunning = true;

    try {
      // Initialize all agents
      await this.initializeAgents();

      // Start health monitoring
      this.startHealthMonitoring();

      await this.notifications.sendInfo(
        'Orchestrator',
        'AI Agents System Started',
        `Successfully started ${this.agents.size} agents in ${this.config.environment} environment`,
        { agents: Array.from(this.agents.keys()) },
      );

      console.log('✅ All agents started successfully');
    } catch (error) {
      console.error('Failed to start agents:', error);
      await this.notifications.sendCritical(
        'Orchestrator',
        'Agent System Startup Failed',
        `Critical failure during agent initialization: ${error}`,
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🤖 Stopping AI Agent Orchestrator...');
    this.isRunning = false;

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Stop all agents
    const stopPromises: Promise<void>[] = [];

    if (this.monitoringAgent) {
      stopPromises.push(this.monitoringAgent.stop());
    }

    if (this.securityAgent) {
      stopPromises.push(this.securityAgent.stop());
    }

    if (this.backupAgent) {
      stopPromises.push(this.backupAgent.stop());
    }

    await Promise.all(stopPromises);

    await this.notifications.sendInfo(
      'Orchestrator',
      'AI Agents System Stopped',
      'All agents have been gracefully shut down',
    );

    console.log('🤖 Agent Orchestrator stopped');
  }

  private async initializeAgents(): Promise<void> {
    console.log('🚀 Initializing agents...');

    // Initialize Monitoring Agent
    try {
      this.monitoringAgent = new MonitoringAgent(this.config);
      await this.monitoringAgent.start();
      this.agents.set('monitoring', this.monitoringAgent);
      console.log('✅ Monitoring Agent initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Monitoring Agent:', error);
      throw error;
    }

    // Initialize Security Agent
    try {
      this.securityAgent = new SecurityMonitoringAgent(this.config);
      await this.securityAgent.start();
      this.agents.set('security', this.securityAgent);
      console.log('✅ Security Agent initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Security Agent:', error);
      throw error;
    }

    // Initialize Backup Agent
    try {
      this.backupAgent = new BackupRecoveryAgent(this.config);
      await this.backupAgent.start();
      this.agents.set('backup', this.backupAgent);
      console.log('✅ Backup Agent initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Backup Agent:', error);
      throw error;
    }
  }

  private startHealthMonitoring(): void {
    // Check agent health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async performHealthCheck(): Promise<void> {
    console.log('🔍 Performing orchestrator health check...');

    const agentStatuses: AgentStatus[] = [];

    // Check Monitoring Agent
    if (this.monitoringAgent) {
      try {
        const status = this.monitoringAgent.getStatus();
        const healthStatus = await this.monitoringAgent.getLastHealthStatus();

        agentStatuses.push({
          name: 'monitoring',
          running: status.running,
          last_check: new Date().toISOString(),
          health: healthStatus?.status === 'healthy' ? 'healthy' :
                  healthStatus?.status === 'warning' ? 'warning' : 'error',
          metrics: healthStatus,
        });
      } catch (error) {
        agentStatuses.push({
          name: 'monitoring',
          running: false,
          health: 'error',
        });
      }
    }

    // Check Security Agent
    if (this.securityAgent) {
      try {
        const securityStatus = await this.securityAgent.getSecurityStatus();

        agentStatuses.push({
          name: 'security',
          running: true,
          last_check: new Date().toISOString(),
          health: securityStatus.metrics.threat_level === 'critical' ? 'error' :
                  securityStatus.metrics.threat_level === 'high' ? 'warning' : 'healthy',
          metrics: securityStatus.metrics,
        });
      } catch (error) {
        agentStatuses.push({
          name: 'security',
          running: false,
          health: 'error',
        });
      }
    }

    // Check Backup Agent
    if (this.backupAgent) {
      try {
        const backupStatus = this.backupAgent.getBackupStatus();
        const recentFailures = backupStatus.failed_backups > 0;

        agentStatuses.push({
          name: 'backup',
          running: true,
          last_check: new Date().toISOString(),
          health: recentFailures ? 'warning' : 'healthy',
          metrics: backupStatus,
        });
      } catch (error) {
        agentStatuses.push({
          name: 'backup',
          running: false,
          health: 'error',
        });
      }
    }

    // Determine overall system health
    const errorAgents = agentStatuses.filter(a => a.health === 'error').length;
    const warningAgents = agentStatuses.filter(a => a.health === 'warning').length;

    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorAgents > 0) {
      systemHealth = 'critical';
    } else if (warningAgents > 0) {
      systemHealth = 'warning';
    }

    // Send alerts if system health is degraded
    if (systemHealth !== 'healthy') {
      await this.notifications.sendWarning(
        'Orchestrator',
        `System Health: ${systemHealth.toUpperCase()}`,
        `Detected ${errorAgents} error(s) and ${warningAgents} warning(s) across agents`,
        { agents: agentStatuses },
      );
    }

    if (this.config.enableLogging) {
      console.log('Agent Health Summary:', {
        systemHealth,
        totalAgents: agentStatuses.length,
        healthyAgents: agentStatuses.filter(a => a.health === 'healthy').length,
        warningAgents,
        errorAgents,
      });
    }
  }

  // Public API methods
  async getSystemStatus(): Promise<OrchestatorStatus> {
    const agentStatuses: AgentStatus[] = [];
    let runningCount = 0;

    // Get status for each agent
    for (const [name, agent] of this.agents) {
      try {
        let health: 'healthy' | 'warning' | 'error' = 'healthy';
        let metrics = {};

        if (name === 'monitoring' && this.monitoringAgent) {
          const status = this.monitoringAgent.getStatus();
          const healthStatus = await this.monitoringAgent.getLastHealthStatus();

          if (status.running) runningCount++;
          health = healthStatus?.status === 'healthy' ? 'healthy' :
                   healthStatus?.status === 'warning' ? 'warning' : 'error';
          metrics = healthStatus || {};
        } else if (name === 'security' && this.securityAgent) {
          const securityStatus = await this.securityAgent.getSecurityStatus();
          runningCount++;
          health = securityStatus.metrics.threat_level === 'critical' ? 'error' :
                   securityStatus.metrics.threat_level === 'high' ? 'warning' : 'healthy';
          metrics = securityStatus.metrics;
        } else if (name === 'backup' && this.backupAgent) {
          const backupStatus = this.backupAgent.getBackupStatus();
          runningCount++;
          health = backupStatus.failed_backups > 0 ? 'warning' : 'healthy';
          metrics = backupStatus;
        }

        agentStatuses.push({
          name,
          running: true,
          last_check: new Date().toISOString(),
          health,
          metrics,
        });
      } catch (error) {
        agentStatuses.push({
          name,
          running: false,
          health: 'error',
        });
      }
    }

    // Determine system health
    const errorAgents = agentStatuses.filter(a => a.health === 'error').length;
    const warningAgents = agentStatuses.filter(a => a.health === 'warning').length;

    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorAgents > 0) {
      systemHealth = 'critical';
    } else if (warningAgents > 0) {
      systemHealth = 'warning';
    }

    return {
      total_agents: this.agents.size,
      running_agents: runningCount,
      system_health: systemHealth,
      last_update: new Date().toISOString(),
      agents: agentStatuses,
    };
  }

  async restartAgent(agentName: string): Promise<boolean> {
    try {
      console.log(`🔄 Restarting agent: ${agentName}`);

      if (agentName === 'monitoring' && this.monitoringAgent) {
        await this.monitoringAgent.stop();
        await this.monitoringAgent.start();
      } else if (agentName === 'security' && this.securityAgent) {
        await this.securityAgent.stop();
        await this.securityAgent.start();
      } else if (agentName === 'backup' && this.backupAgent) {
        await this.backupAgent.stop();
        await this.backupAgent.start();
      } else {
        throw new Error(`Unknown agent: ${agentName}`);
      }

      await this.notifications.sendInfo(
        'Orchestrator',
        `Agent Restarted: ${agentName}`,
        `Successfully restarted ${agentName} agent`,
      );

      return true;
    } catch (error) {
      await this.notifications.sendError(
        'Orchestrator',
        `Agent Restart Failed: ${agentName}`,
        `Failed to restart ${agentName} agent: ${error}`,
      );
      return false;
    }
  }

  // Agent-specific access methods
  getMonitoringAgent(): MonitoringAgent | undefined {
    return this.monitoringAgent;
  }

  getSecurityAgent(): SecurityMonitoringAgent | undefined {
    return this.securityAgent;
  }

  getBackupAgent(): BackupRecoveryAgent | undefined {
    return this.backupAgent;
  }

  isSystemRunning(): boolean {
    return this.isRunning;
  }

  getConfiguration(): AgentConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();