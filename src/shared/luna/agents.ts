/**
 * Luna AI Agents Module
 * Specialized AI agents for monitoring, security, backup, and automation
 */

import type { AIProvider, ChatMessage, ChatResponse } from './providers.js';

export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: AIProvider;
  systemPrompt: string;
  isActive: boolean;
  lastActivity?: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

// Base Agent Class
export abstract class BaseAgent implements Agent {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract systemPrompt: string;

  provider: AIProvider;
  isActive = true;
  lastActivity?: number;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async execute(input: string): Promise<string> {
    if (!this.provider.isAvailable) {
      throw new Error(`Provider ${this.provider.name} is not available`);
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: input }
    ];

    const response = await this.provider.chat(messages);
    this.lastActivity = Date.now();

    return response.content;
  }

  abstract processTask(task: AgentTask): Promise<any>;
}

// Monitoring Agent
export class MonitoringAgent extends BaseAgent {
  id = 'monitoring-agent';
  name = 'System Monitor';
  description = 'Monitors application performance, errors, and user behavior patterns';
  systemPrompt = `You are a system monitoring agent. Analyze application metrics, identify performance issues, and provide actionable insights. Focus on:
- Performance bottlenecks
- Error patterns
- User experience issues
- Resource utilization
- Security anomalies

Provide clear, concise recommendations for improvements.`;

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'performance-analysis':
        return this.analyzePerformance(task.input);
      case 'error-analysis':
        return this.analyzeErrors(task.input);
      case 'usage-patterns':
        return this.analyzeUsagePatterns(task.input);
      default:
        return this.execute(JSON.stringify(task.input));
    }
  }

  private async analyzePerformance(metrics: any): Promise<string> {
    const prompt = `Analyze these performance metrics and provide recommendations:
${JSON.stringify(metrics, null, 2)}

Focus on load times, memory usage, and bottlenecks.`;

    return this.execute(prompt);
  }

  private async analyzeErrors(errors: any[]): Promise<string> {
    const prompt = `Analyze these error patterns and suggest fixes:
${JSON.stringify(errors, null, 2)}

Identify common causes and prevention strategies.`;

    return this.execute(prompt);
  }

  private async analyzeUsagePatterns(usage: any): Promise<string> {
    const prompt = `Analyze user behavior patterns and suggest UX improvements:
${JSON.stringify(usage, null, 2)}

Focus on user flows, drop-off points, and engagement.`;

    return this.execute(prompt);
  }
}

// Security Agent
export class SecurityAgent extends BaseAgent {
  id = 'security-agent';
  name = 'Security Analyst';
  description = 'Monitors security threats, validates inputs, and ensures data protection';
  systemPrompt = `You are a security monitoring agent. Analyze security events, detect threats, and provide protection recommendations. Focus on:
- Authentication anomalies
- Data access patterns
- Input validation issues
- Potential vulnerabilities
- Compliance requirements

Prioritize data protection and user privacy.`;

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'threat-detection':
        return this.detectThreats(task.input);
      case 'access-analysis':
        return this.analyzeAccess(task.input);
      case 'vulnerability-scan':
        return this.scanVulnerabilities(task.input);
      default:
        return this.execute(JSON.stringify(task.input));
    }
  }

  private async detectThreats(events: any[]): Promise<string> {
    const prompt = `Analyze these security events for potential threats:
${JSON.stringify(events, null, 2)}

Identify suspicious patterns and recommend actions.`;

    return this.execute(prompt);
  }

  private async analyzeAccess(accessLogs: any[]): Promise<string> {
    const prompt = `Review access patterns for anomalies:
${JSON.stringify(accessLogs, null, 2)}

Flag unusual access patterns and unauthorized attempts.`;

    return this.execute(prompt);
  }

  private async scanVulnerabilities(codeOrConfig: string): Promise<string> {
    const prompt = `Scan for security vulnerabilities:
${codeOrConfig}

Identify potential security issues and suggest fixes.`;

    return this.execute(prompt);
  }
}

// Backup Agent
export class BackupAgent extends BaseAgent {
  id = 'backup-agent';
  name = 'Data Guardian';
  description = 'Manages data backups, recovery planning, and data integrity checks';
  systemPrompt = `You are a data backup and recovery agent. Ensure data integrity, manage backups, and plan recovery strategies. Focus on:
- Backup validation
- Recovery procedures
- Data corruption detection
- Retention policies
- Disaster recovery planning

Prioritize data safety and quick recovery capabilities.`;

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'backup-validation':
        return this.validateBackup(task.input);
      case 'recovery-planning':
        return this.planRecovery(task.input);
      case 'integrity-check':
        return this.checkIntegrity(task.input);
      default:
        return this.execute(JSON.stringify(task.input));
    }
  }

  private async validateBackup(backupInfo: any): Promise<string> {
    const prompt = `Validate this backup configuration and suggest improvements:
${JSON.stringify(backupInfo, null, 2)}

Check completeness, frequency, and reliability.`;

    return this.execute(prompt);
  }

  private async planRecovery(scenario: any): Promise<string> {
    const prompt = `Create a recovery plan for this scenario:
${JSON.stringify(scenario, null, 2)}

Provide step-by-step recovery procedures.`;

    return this.execute(prompt);
  }

  private async checkIntegrity(dataInfo: any): Promise<string> {
    const prompt = `Check data integrity and identify issues:
${JSON.stringify(dataInfo, null, 2)}

Report corruption, missing data, or inconsistencies.`;

    return this.execute(prompt);
  }
}

// Agent Manager
export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getActiveAgents(): BaseAgent[] {
    return this.getAllAgents().filter(agent => agent.isActive);
  }

  async createTask(agentId: string, type: string, input: any, priority: AgentTask['priority'] = 'medium'): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const task: AgentTask = {
      id: taskId,
      agentId,
      type,
      priority,
      status: 'pending',
      input,
      createdAt: Date.now()
    };

    this.tasks.set(taskId, task);
    return taskId;
  }

  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const agent = this.agents.get(task.agentId);
    if (!agent) throw new Error(`Agent ${task.agentId} not found`);

    try {
      task.status = 'running';
      const result = await agent.processTask(task);

      task.status = 'completed';
      task.output = result;
      task.completedAt = Date.now();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasksByAgent(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
  }

  getPendingTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === 'pending');
  }
}

// Factory for creating pre-configured agents
export class AgentFactory {
  static createMonitoringAgent(provider: AIProvider): MonitoringAgent {
    return new MonitoringAgent(provider);
  }

  static createSecurityAgent(provider: AIProvider): SecurityAgent {
    return new SecurityAgent(provider);
  }

  static createBackupAgent(provider: AIProvider): BackupAgent {
    return new BackupAgent(provider);
  }

  static createAllAgents(provider: AIProvider): BaseAgent[] {
    return [
      new MonitoringAgent(provider),
      new SecurityAgent(provider),
      new BackupAgent(provider)
    ];
  }
}

export default {
  BaseAgent,
  MonitoringAgent,
  SecurityAgent,
  BackupAgent,
  AgentManager,
  AgentFactory
};