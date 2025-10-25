/**
 * Luna AI Framework - Core Manager
 * Central management system for all Luna AI functionality
 * Provides unified interface for intelligence, assets, navigation, and performance
 */

import {
  LunaAgent,
  LunaTask,
  LunaContext,
  LunaResult,
  LunaFrameworkConfig,
  LunaSystemHealth,
  LunaEvent,
  LunaEventListener,
  LunaPerformanceMetrics,
  LunaUsageAnalytics,
  LunaAgentType,
  LunaActionType,
  LunaTaskStatus,
  LunaCapability
} from './types';
import { UUID, Timestamp, Score, ConfidenceLevel } from '@/shared/types/core';

/**
 * Luna AI Framework Core Manager
 * Singleton class that orchestrates all Luna AI functionality
 */
export class LunaManager {
  private static instance: LunaManager;

  // Core state
  private agents: Map<UUID, LunaAgent> = new Map();
  private activeTasks: Map<UUID, LunaTask> = new Map();
  private eventListeners: Map<UUID, LunaEventListener> = new Map();
  private performanceMetrics: Map<string, LunaPerformanceMetrics> = new Map();
  private config: LunaFrameworkConfig;

  // System state
  private isInitialized: boolean = false;
  private startTime: number = Date.now();
  private lastHealthCheck: Timestamp = new Date().toISOString();

  // Event emitter for real-time updates
  private eventQueue: LunaEvent[] = [];
  private isProcessingEvents: boolean = false;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  static getInstance(): LunaManager {
    if (!LunaManager.instance) {
      LunaManager.instance = new LunaManager();
    }
    return LunaManager.instance;
  }

  // MARK: - Initialization

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🦊 Luna: Already initialized');
      return;
    }

    console.log('🚀 Luna: Initializing AI Framework');

    try {
      // Initialize core agents
      await this.initializeAgents();

      // Start performance monitoring
      this.startPerformanceMonitoring();

      // Initialize event processing
      this.startEventProcessing();

      // Load user preferences and personalization
      await this.loadPersonalization();

      this.isInitialized = true;

      this.emitEvent({
        id: this.generateUUID(),
        type: 'agent_activated',
        source: 'system',
        data: { message: 'Luna Framework initialized' },
        timestamp: new Date().toISOString(),
        severity: 'info'
      });

      console.log('✅ Luna: Framework initialized successfully');

    } catch (error) {
      console.error('❌ Luna: Initialization failed:', error);
      throw error;
    }
  }

  private async initializeAgents(): Promise<void> {
    const defaultAgents: Partial<LunaAgent>[] = [
      {
        type: 'productivity_monitor',
        name: 'Productivity Monitor',
        description: 'Monitors and analyzes productivity patterns',
        capabilities: ['local_processing', 'productivity_insights', 'performance_monitoring'],
        is_active: true,
        configuration: { monitoring_interval: 300000, insights_threshold: 0.7 }
      },
      {
        type: 'insight_analyzer',
        name: 'Insight Analyzer',
        description: 'Generates actionable insights from user data',
        capabilities: ['ai_integration', 'productivity_insights', 'local_processing'],
        is_active: true,
        configuration: { analysis_depth: 'moderate', confidence_threshold: 0.8 }
      },
      {
        type: 'workflow_optimizer',
        name: 'Workflow Optimizer',
        description: 'Optimizes user workflows and suggests improvements',
        capabilities: ['workflow_optimization', 'automation', 'task_management'],
        is_active: true,
        configuration: { optimization_level: 'moderate', auto_apply: false }
      },
      {
        type: 'presentation_assistant',
        name: 'Presentation Assistant',
        description: 'Assists with presentation creation and optimization',
        capabilities: ['presentation_assistance', 'ai_integration', 'visual_assets'],
        is_active: false, // Activated on demand
        configuration: { default_theme: 'professional', auto_optimize: true }
      }
    ];

    for (const agentData of defaultAgents) {
      const agent: LunaAgent = {
        id: this.generateUUID(),
        type: agentData.type!,
        name: agentData.name!,
        description: agentData.description!,
        capabilities: agentData.capabilities!,
        is_active: agentData.is_active!,
        configuration: agentData.configuration!,
        performance_score: 0.8, // Initial score
        total_tasks: 0,
        successful_tasks: 0,
        failed_tasks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.agents.set(agent.id, agent);

      if (agent.is_active) {
        await this.activateAgent(agent.id);
      }
    }
  }

  // MARK: - Agent Management

  async activateAgent(agentId: UUID): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.is_active = true;
    agent.updated_at = new Date().toISOString();

    this.emitEvent({
      id: this.generateUUID(),
      type: 'agent_activated',
      source: 'system',
      agent_id: agentId,
      data: { agent_type: agent.type, agent_name: agent.name },
      timestamp: new Date().toISOString(),
      severity: 'info'
    });

    console.log(`🟢 Luna: Activated agent ${agent.name}`);
  }

  async deactivateAgent(agentId: UUID): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.is_active = false;
    agent.updated_at = new Date().toISOString();

    // Cancel any active tasks for this agent
    for (const [taskId, task] of this.activeTasks) {
      if (task.type === agent.type && task.status === 'processing') {
        await this.cancelTask(taskId);
      }
    }

    console.log(`🔴 Luna: Deactivated agent ${agent.name}`);
  }

  getAgent(agentId: UUID): LunaAgent | undefined {
    return this.agents.get(agentId);
  }

  getAgentsByType(type: LunaAgentType): LunaAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  getActiveAgents(): LunaAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.is_active);
  }

  // MARK: - Task Management

  async executeTask(
    type: LunaActionType,
    context: LunaContext,
    agentType?: LunaAgentType
  ): Promise<LunaResult> {
    const taskId = this.generateUUID();

    const task: LunaTask = {
      id: taskId,
      type,
      status: 'pending',
      title: this.getTaskTitle(type),
      description: this.getTaskDescription(type, context),
      input: { context },
      confidence: 0,
      executionTime: 0,
      handledLocally: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.activeTasks.set(taskId, task);

    try {
      // Find appropriate agent
      const agent = this.findBestAgent(type, agentType);
      if (!agent) {
        throw new Error(`No suitable agent found for task type: ${type}`);
      }

      // Update task status
      task.status = 'processing';
      task.updated_at = new Date().toISOString();

      this.emitEvent({
        id: this.generateUUID(),
        type: 'task_started',
        source: 'system',
        agent_id: agent.id,
        task_id: taskId,
        data: { task_type: type, agent_type: agent.type },
        timestamp: new Date().toISOString(),
        severity: 'info'
      });

      // Execute task
      const startTime = performance.now();
      const result = await this.executeAgentTask(agent, task, context);
      const endTime = performance.now();

      // Update task with results
      task.status = 'completed';
      task.output = { result };
      task.confidence = result.confidence;
      task.executionTime = endTime - startTime;
      task.handledLocally = result.handledLocally;
      task.suggestedActions = result.suggestedActions;
      task.completed_at = new Date().toISOString();
      task.updated_at = new Date().toISOString();

      // Update agent metrics
      agent.total_tasks++;
      agent.successful_tasks++;
      agent.performance_score = this.calculateAgentPerformance(agent);
      agent.updated_at = new Date().toISOString();

      this.emitEvent({
        id: this.generateUUID(),
        type: 'task_completed',
        source: 'agent',
        agent_id: agent.id,
        task_id: taskId,
        data: {
          task_type: type,
          execution_time: task.executionTime,
          confidence: result.confidence,
          handled_locally: result.handledLocally
        },
        timestamp: new Date().toISOString(),
        severity: 'info'
      });

      console.log(`✅ Luna: Task ${type} completed by ${agent.name} in ${task.executionTime.toFixed(2)}ms`);

      return result;

    } catch (error) {
      // Handle task failure
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.updated_at = new Date().toISOString();

      const agent = this.findBestAgent(type, agentType);
      if (agent) {
        agent.total_tasks++;
        agent.failed_tasks++;
        agent.performance_score = this.calculateAgentPerformance(agent);
        agent.updated_at = new Date().toISOString();
      }

      this.emitEvent({
        id: this.generateUUID(),
        type: 'task_failed',
        source: 'system',
        agent_id: agent?.id,
        task_id: taskId,
        data: { task_type: type, error: task.error },
        timestamp: new Date().toISOString(),
        severity: 'error'
      });

      console.error(`❌ Luna: Task ${type} failed:`, error);

      // Return fallback result
      return {
        type: 'error',
        content: 'I encountered an issue processing your request. Please try again.',
        executionTime: performance.now(),
        handledLocally: false,
        confidence: 0,
        metadata: { error: task.error }
      };
    } finally {
      // Clean up completed/failed tasks after a delay
      setTimeout(() => {
        this.activeTasks.delete(taskId);
      }, 60000); // Keep for 1 minute for debugging
    }
  }

  async cancelTask(taskId: UUID): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return;
    }

    task.status = 'cancelled';
    task.updated_at = new Date().toISOString();

    this.emitEvent({
      id: this.generateUUID(),
      type: 'task_failed',
      source: 'user',
      task_id: taskId,
      data: { reason: 'cancelled_by_user' },
      timestamp: new Date().toISOString(),
      severity: 'info'
    });

    console.log(`🚫 Luna: Task ${taskId} cancelled`);
  }

  getTask(taskId: UUID): LunaTask | undefined {
    return this.activeTasks.get(taskId);
  }

  getActiveTasks(): LunaTask[] {
    return Array.from(this.activeTasks.values()).filter(
      task => task.status === 'processing' || task.status === 'pending'
    );
  }

  // MARK: - System Health & Monitoring

  async getSystemHealth(): Promise<LunaSystemHealth> {
    const activeAgents = this.getActiveAgents();
    const activeTasks = this.getActiveTasks();
    const totalAgents = this.agents.size;

    // Calculate memory usage (simplified)
    const memoryUsage = this.estimateMemoryUsage();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical' | 'offline' = 'healthy';
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (activeAgents.length === 0) {
      status = 'offline';
      issues.push('No active agents');
      recommendations.push('Activate at least one agent');
    } else if (activeAgents.length < totalAgents * 0.5) {
      status = 'degraded';
      issues.push('Less than 50% of agents are active');
      recommendations.push('Consider activating more agents for better performance');
    }

    if (activeTasks.length > 10) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push('High task queue');
      recommendations.push('Monitor task processing performance');
    }

    if (memoryUsage > 100) { // MB
      status = status === 'healthy' ? 'degraded' : status;
      issues.push('High memory usage');
      recommendations.push('Clear cache or restart framework');
    }

    this.lastHealthCheck = new Date().toISOString();

    return {
      overall_status: status,
      active_agents: activeAgents.length,
      total_agents: totalAgents,
      processing_queue_size: activeTasks.length,
      cache_size: this.eventQueue.length,
      memory_usage: memoryUsage,
      uptime: Date.now() - this.startTime,
      last_health_check: this.lastHealthCheck,
      issues,
      recommendations
    };
  }

  // MARK: - Event System

  addEventListener(
    eventTypes: string[],
    callback: (event: LunaEvent) => void
  ): UUID {
    const listenerId = this.generateUUID();

    const listener: LunaEventListener = {
      id: listenerId,
      event_types: eventTypes,
      callback,
      enabled: true,
      created_at: new Date().toISOString()
    };

    this.eventListeners.set(listenerId, listener);
    return listenerId;
  }

  removeEventListener(listenerId: UUID): void {
    this.eventListeners.delete(listenerId);
  }

  private emitEvent(event: LunaEvent): void {
    this.eventQueue.push(event);

    // Process immediately if not already processing
    if (!this.isProcessingEvents) {
      this.processEventQueue();
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessingEvents || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessingEvents = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;

        // Notify all relevant listeners
        for (const listener of this.eventListeners.values()) {
          if (listener.enabled && listener.event_types.includes(event.type)) {
            try {
              listener.callback(event);
            } catch (error) {
              console.error('Luna: Event listener error:', error);
            }
          }
        }
      }
    } finally {
      this.isProcessingEvents = false;
    }
  }

  // MARK: - Private Helper Methods

  private findBestAgent(
    taskType: LunaActionType,
    preferredAgentType?: LunaAgentType
  ): LunaAgent | undefined {
    const activeAgents = this.getActiveAgents();

    if (preferredAgentType) {
      const preferredAgent = activeAgents.find(agent => agent.type === preferredAgentType);
      if (preferredAgent) {
        return preferredAgent;
      }
    }

    // Find agent with highest performance score that can handle the task
    return activeAgents
      .filter(agent => this.canAgentHandleTask(agent, taskType))
      .sort((a, b) => b.performance_score - a.performance_score)[0];
  }

  private canAgentHandleTask(agent: LunaAgent, taskType: LunaActionType): boolean {
    const taskCapabilityMap: Record<LunaActionType, LunaCapability[]> = {
      insights: ['productivity_insights', 'ai_integration'],
      optimize: ['workflow_optimization', 'performance_monitoring'],
      backup: ['backup_management'],
      security_scan: ['security_scanning'],
      performance_analysis: ['performance_monitoring', 'productivity_insights'],
      suggestion: ['ai_integration', 'workflow_optimization'],
      automation: ['workflow_optimization', 'task_management'],
      presentation_mode: ['presentation_assistance', 'visual_assets'],
      navigation_assist: ['navigation'],
      task_creation: ['task_management', 'local_processing'],
      learning_assist: ['ai_integration', 'accessibility_support']
    };

    const requiredCapabilities = taskCapabilityMap[taskType] || [];
    return requiredCapabilities.some(capability => agent.capabilities.includes(capability));
  }

  private async executeAgentTask(
    agent: LunaAgent,
    task: LunaTask,
    context: LunaContext
  ): Promise<LunaResult> {
    // This is a simplified implementation
    // In a real implementation, this would delegate to specific agent implementations

    const simulatedDelay = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));

    return {
      type: 'success',
      content: `Task ${task.type} processed successfully by ${agent.name}`,
      executionTime: simulatedDelay,
      handledLocally: agent.capabilities.includes('local_processing'),
      confidence: 0.8 + Math.random() * 0.2, // 0.8-1.0
      suggestedActions: ['Apply result', 'Save for later', 'Share with team']
    };
  }

  private calculateAgentPerformance(agent: LunaAgent): Score {
    if (agent.total_tasks === 0) return 0.8; // Initial score

    const successRate = agent.successful_tasks / agent.total_tasks;
    return Math.max(0, Math.min(1, successRate * 0.9 + 0.1)); // 0.1-1.0 range
  }

  private getTaskTitle(type: LunaActionType): string {
    const titles: Record<LunaActionType, string> = {
      insights: 'Generate Insights',
      optimize: 'Optimize Workflow',
      backup: 'Backup Data',
      security_scan: 'Security Scan',
      performance_analysis: 'Performance Analysis',
      suggestion: 'Generate Suggestion',
      automation: 'Automate Task',
      presentation_mode: 'Presentation Assistance',
      navigation_assist: 'Navigation Assistance',
      task_creation: 'Create Task',
      learning_assist: 'Learning Assistance'
    };
    return titles[type] || 'Unknown Task';
  }

  private getTaskDescription(type: LunaActionType, context: LunaContext): string {
    return `Processing ${type} request: "${context.userInput?.substring(0, 100) || 'No input provided'}"`;
  }

  private async loadPersonalization(): Promise<void> {
    // In a real implementation, this would load user preferences from storage
    console.log('🎯 Luna: Loading personalization settings');
  }

  private startPerformanceMonitoring(): void {
    // Start monitoring system performance
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000); // Every minute
  }

  private startEventProcessing(): void {
    // Event processing is handled by emitEvent and processEventQueue
    console.log('📡 Luna: Event processing started');
  }

  private collectPerformanceMetrics(): void {
    // Collect and store performance metrics
    const timestamp = new Date().toISOString();

    for (const agent of this.agents.values()) {
      const metrics: LunaPerformanceMetrics = {
        agent_type: agent.type,
        success_rate: agent.total_tasks > 0 ? agent.successful_tasks / agent.total_tasks : 0,
        average_confidence: 0.85, // Would be calculated from actual task results
        response_time: 100, // Would be calculated from actual execution times
        accuracy_score: agent.performance_score,
        user_satisfaction: 0.8, // Would come from user feedback
        insights_generated: 0, // Would be tracked
        suggestions_applied: 0, // Would be tracked
        errors_count: agent.failed_tasks,
        cache_hit_rate: 0.7, // Would be calculated
        local_processing_rate: 0.6, // Would be calculated
        timestamp
      };

      this.performanceMetrics.set(`${agent.type}-${timestamp}`, metrics);
    }
  }

  private estimateMemoryUsage(): number {
    // Simplified memory usage estimation
    return (
      this.agents.size * 0.1 +
      this.activeTasks.size * 0.05 +
      this.eventQueue.length * 0.001 +
      this.eventListeners.size * 0.01
    );
  }

  private generateUUID(): UUID {
    return crypto.randomUUID?.() ||
           'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
             const r = Math.random() * 16 | 0;
             const v = c === 'x' ? r : (r & 0x3 | 0x8);
             return v.toString(16);
           });
  }

  private getDefaultConfig(): LunaFrameworkConfig {
    return {
      agents: [],
      global_settings: {
        max_cache_size: 1000,
        cache_ttl: 3600000, // 1 hour
        local_processing_enabled: true,
        ai_fallback_enabled: true,
        performance_monitoring: true,
        debug_mode: false
      },
      ui_settings: {
        default_size: 'medium',
        default_expression: 'default',
        animation_enabled: true,
        haptic_feedback: true,
        voice_feedback: false
      },
      security_settings: {
        data_encryption: true,
        secure_storage: true,
        audit_logging: true,
        privacy_mode: false
      }
    };
  }

  // MARK: - Public Configuration Methods

  getConfig(): LunaFrameworkConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<LunaFrameworkConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('⚙️ Luna: Configuration updated');
  }

  // MARK: - Cleanup

  async shutdown(): Promise<void> {
    console.log('🛑 Luna: Shutting down framework');

    // Cancel all active tasks
    for (const taskId of this.activeTasks.keys()) {
      await this.cancelTask(taskId);
    }

    // Deactivate all agents
    for (const agent of this.agents.values()) {
      if (agent.is_active) {
        await this.deactivateAgent(agent.id);
      }
    }

    // Clear event listeners
    this.eventListeners.clear();
    this.eventQueue.length = 0;

    this.isInitialized = false;
    console.log('✅ Luna: Framework shutdown complete');
  }
}

// Export singleton instance
export const lunaManager = LunaManager.getInstance();