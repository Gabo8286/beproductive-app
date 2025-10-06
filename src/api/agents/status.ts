// AI Agents Status API Endpoints
import { agentOrchestrator } from '../../agents/agent-orchestrator';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Get overall system status
export async function getSystemStatus(): Promise<ApiResponse> {
  try {
    const status = await agentOrchestrator.getSystemStatus();
    return {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Get monitoring agent status
export async function getMonitoringStatus(): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getMonitoringAgent();
    if (!agent) {
      throw new Error('Monitoring agent not available');
    }

    const status = agent.getStatus();
    const healthStatus = await agent.getLastHealthStatus();

    return {
      success: true,
      data: {
        agent_status: status,
        health_status: healthStatus,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Get security agent status
export async function getSecurityStatus(): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getSecurityAgent();
    if (!agent) {
      throw new Error('Security agent not available');
    }

    const securityStatus = await agent.getSecurityStatus();
    const blockedIPs = agent.getBlockedIPs();

    return {
      success: true,
      data: {
        security_metrics: securityStatus.metrics,
        blocked_ips: blockedIPs,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Get backup agent status
export async function getBackupStatus(): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getBackupAgent();
    if (!agent) {
      throw new Error('Backup agent not available');
    }

    const backupStatus = agent.getBackupStatus();
    const backupHistory = agent.getBackupHistory().slice(-10); // Last 10 backups

    return {
      success: true,
      data: {
        backup_metrics: backupStatus,
        recent_backups: backupHistory,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Force health check
export async function forceHealthCheck(): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getMonitoringAgent();
    if (!agent) {
      throw new Error('Monitoring agent not available');
    }

    const healthStatus = await agent.forceHealthCheck();

    return {
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Force security scan
export async function forceSecurityScan(): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getSecurityAgent();
    if (!agent) {
      throw new Error('Security agent not available');
    }

    const securityMetrics = await agent.forceSecurityScan();

    return {
      success: true,
      data: securityMetrics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Create manual backup
export async function createManualBackup(type: 'full' | 'incremental' = 'full'): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getBackupAgent();
    if (!agent) {
      throw new Error('Backup agent not available');
    }

    const backupResult = await agent.createManualBackup(type);

    return {
      success: true,
      data: backupResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Restart specific agent
export async function restartAgent(agentName: string): Promise<ApiResponse> {
  try {
    const success = await agentOrchestrator.restartAgent(agentName);

    return {
      success,
      data: {
        agent_name: agentName,
        restarted: success,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Unblock IP address
export async function unblockIP(ip: string): Promise<ApiResponse> {
  try {
    const agent = agentOrchestrator.getSecurityAgent();
    if (!agent) {
      throw new Error('Security agent not available');
    }

    const unblocked = await agent.unblockIP(ip);

    return {
      success: true,
      data: {
        ip_address: ip,
        unblocked,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Start agent system
export async function startAgentSystem(): Promise<ApiResponse> {
  try {
    if (agentOrchestrator.isSystemRunning()) {
      return {
        success: true,
        data: { message: 'Agent system is already running' },
        timestamp: new Date().toISOString(),
      };
    }

    await agentOrchestrator.start();

    return {
      success: true,
      data: { message: 'Agent system started successfully' },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Stop agent system
export async function stopAgentSystem(): Promise<ApiResponse> {
  try {
    if (!agentOrchestrator.isSystemRunning()) {
      return {
        success: true,
        data: { message: 'Agent system is already stopped' },
        timestamp: new Date().toISOString(),
      };
    }

    await agentOrchestrator.stop();

    return {
      success: true,
      data: { message: 'Agent system stopped successfully' },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}