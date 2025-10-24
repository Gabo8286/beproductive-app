/**
 * Luna AI Framework - Configuration Module
 * Centralized configuration management for Luna AI system
 * Cross-platform compatible configuration handling
 */

import {
  LunaFrameworkConfig,
  LunaAgentConfig,
  LunaAgentType,
  LunaSize,
  LunaExpression,
  LunaCapability
} from './types';

// MARK: - Default Configuration

export const DEFAULT_LUNA_CONFIG: LunaFrameworkConfig = {
  agents: [
    {
      type: 'productivity_monitor',
      enabled: true,
      priority: 9,
      max_concurrent_tasks: 3,
      timeout: 30000, // 30 seconds
      retry_attempts: 2,
      cache_enabled: true,
      configuration: {
        monitoring_interval: 300000, // 5 minutes
        insights_threshold: 0.7,
        auto_suggestions: true,
        notification_level: 'medium'
      }
    },
    {
      type: 'insight_analyzer',
      enabled: true,
      priority: 8,
      max_concurrent_tasks: 2,
      timeout: 45000, // 45 seconds
      retry_attempts: 3,
      cache_enabled: true,
      configuration: {
        analysis_depth: 'moderate',
        confidence_threshold: 0.8,
        learning_enabled: true,
        personalization_level: 'medium'
      }
    },
    {
      type: 'workflow_optimizer',
      enabled: true,
      priority: 7,
      max_concurrent_tasks: 2,
      timeout: 60000, // 1 minute
      retry_attempts: 2,
      cache_enabled: true,
      configuration: {
        optimization_level: 'moderate',
        auto_apply: false,
        suggestion_frequency: 'weekly',
        focus_areas: ['time_management', 'task_organization', 'productivity_habits']
      }
    },
    {
      type: 'presentation_assistant',
      enabled: false, // Activated on demand
      priority: 6,
      max_concurrent_tasks: 1,
      timeout: 90000, // 1.5 minutes
      retry_attempts: 2,
      cache_enabled: false, // Presentation data is dynamic
      configuration: {
        default_theme: 'professional',
        auto_optimize: true,
        real_time_analysis: true,
        performance_tracking: true
      }
    },
    {
      type: 'security_agent',
      enabled: true,
      priority: 10, // High priority for security
      max_concurrent_tasks: 1,
      timeout: 120000, // 2 minutes
      retry_attempts: 1,
      cache_enabled: false, // Security scans should be fresh
      configuration: {
        scan_frequency: 'daily',
        threat_detection_level: 'moderate',
        auto_remediation: false,
        alert_threshold: 'medium'
      }
    },
    {
      type: 'backup_coordinator',
      enabled: true,
      priority: 5,
      max_concurrent_tasks: 1,
      timeout: 300000, // 5 minutes
      retry_attempts: 3,
      cache_enabled: true,
      configuration: {
        backup_frequency: 'daily',
        retention_period: '30_days',
        auto_backup: true,
        compression_enabled: true
      }
    },
    {
      type: 'collaboration_facilitator',
      enabled: false, // Enabled for team accounts
      priority: 6,
      max_concurrent_tasks: 2,
      timeout: 60000,
      retry_attempts: 2,
      cache_enabled: true,
      configuration: {
        notification_aggregation: true,
        meeting_optimization: true,
        team_insights: true,
        communication_analysis: false
      }
    },
    {
      type: 'learning_companion',
      enabled: true,
      priority: 4,
      max_concurrent_tasks: 1,
      timeout: 45000,
      retry_attempts: 2,
      cache_enabled: true,
      configuration: {
        learning_style: 'adaptive',
        difficulty_adjustment: 'auto',
        progress_tracking: true,
        personalized_recommendations: true
      }
    },
    {
      type: 'accessibility_helper',
      enabled: true,
      priority: 8, // High priority for accessibility
      max_concurrent_tasks: 2,
      timeout: 30000,
      retry_attempts: 2,
      cache_enabled: true,
      configuration: {
        voice_commands: true,
        screen_reader_optimization: true,
        keyboard_navigation: true,
        high_contrast_support: true
      }
    }
  ],
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

// MARK: - Configuration Manager

export class LunaConfigManager {
  private static instance: LunaConfigManager;
  private config: LunaFrameworkConfig;
  private configListeners: Array<(config: LunaFrameworkConfig) => void> = [];

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): LunaConfigManager {
    if (!LunaConfigManager.instance) {
      LunaConfigManager.instance = new LunaConfigManager();
    }
    return LunaConfigManager.instance;
  }

  // MARK: - Configuration Access

  getConfig(): LunaFrameworkConfig {
    return { ...this.config }; // Return a copy to prevent direct mutation
  }

  getAgentConfig(agentType: LunaAgentType): LunaAgentConfig | undefined {
    return this.config.agents.find(agent => agent.type === agentType);
  }

  getEnabledAgents(): LunaAgentConfig[] {
    return this.config.agents.filter(agent => agent.enabled);
  }

  getAgentsByCapability(capability: LunaCapability): LunaAgentConfig[] {
    // This would need capability mapping - simplified for now
    return this.config.agents.filter(agent => agent.enabled);
  }

  // MARK: - Configuration Updates

  updateConfig(updates: Partial<LunaFrameworkConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfig();
    this.notifyListeners();
  }

  updateAgentConfig(agentType: LunaAgentType, updates: Partial<LunaAgentConfig>): void {
    const agentIndex = this.config.agents.findIndex(agent => agent.type === agentType);

    if (agentIndex !== -1) {
      this.config.agents[agentIndex] = {
        ...this.config.agents[agentIndex],
        ...updates
      };
      this.saveConfig();
      this.notifyListeners();
    }
  }

  enableAgent(agentType: LunaAgentType): void {
    this.updateAgentConfig(agentType, { enabled: true });
  }

  disableAgent(agentType: LunaAgentType): void {
    this.updateAgentConfig(agentType, { enabled: false });
  }

  updateGlobalSettings(updates: Partial<LunaFrameworkConfig['global_settings']>): void {
    this.config.global_settings = {
      ...this.config.global_settings,
      ...updates
    };
    this.saveConfig();
    this.notifyListeners();
  }

  updateUISettings(updates: Partial<LunaFrameworkConfig['ui_settings']>): void {
    this.config.ui_settings = {
      ...this.config.ui_settings,
      ...updates
    };
    this.saveConfig();
    this.notifyListeners();
  }

  updateSecuritySettings(updates: Partial<LunaFrameworkConfig['security_settings']>): void {
    this.config.security_settings = {
      ...this.config.security_settings,
      ...updates
    };
    this.saveConfig();
    this.notifyListeners();
  }

  // MARK: - Configuration Presets

  applyPreset(presetName: string): void {
    const presets = this.getConfigurationPresets();
    const preset = presets[presetName];

    if (preset) {
      this.updateConfig(preset);
      console.log(`🦊 Luna Config: Applied preset "${presetName}"`);
    } else {
      console.warn(`Luna Config: Preset "${presetName}" not found`);
    }
  }

  getConfigurationPresets(): Record<string, Partial<LunaFrameworkConfig>> {
    return {
      'minimal': {
        agents: this.config.agents.map(agent => ({
          ...agent,
          enabled: ['productivity_monitor', 'insight_analyzer'].includes(agent.type)
        })),
        global_settings: {
          ...this.config.global_settings,
          local_processing_enabled: true,
          ai_fallback_enabled: false,
          performance_monitoring: false
        }
      },
      'performance': {
        agents: this.config.agents.map(agent => ({
          ...agent,
          enabled: true,
          max_concurrent_tasks: Math.min(agent.max_concurrent_tasks + 1, 5),
          timeout: agent.timeout * 0.8 // Reduce timeouts by 20%
        })),
        global_settings: {
          ...this.config.global_settings,
          max_cache_size: 2000,
          cache_ttl: 7200000, // 2 hours
          performance_monitoring: true
        }
      },
      'privacy': {
        global_settings: {
          ...this.config.global_settings,
          local_processing_enabled: true,
          ai_fallback_enabled: false
        },
        security_settings: {
          ...this.config.security_settings,
          data_encryption: true,
          secure_storage: true,
          audit_logging: false,
          privacy_mode: true
        }
      },
      'accessibility': {
        agents: this.config.agents.map(agent => ({
          ...agent,
          enabled: agent.type === 'accessibility_helper' ? true : agent.enabled
        })),
        ui_settings: {
          ...this.config.ui_settings,
          animation_enabled: false,
          haptic_feedback: true,
          voice_feedback: true
        }
      },
      'team': {
        agents: this.config.agents.map(agent => ({
          ...agent,
          enabled: ['collaboration_facilitator', 'productivity_monitor', 'insight_analyzer', 'workflow_optimizer'].includes(agent.type)
        }))
      }
    };
  }

  // MARK: - Environment-Specific Configurations

  getEnvironmentConfig(): Partial<LunaFrameworkConfig> {
    const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    let environmentConfig: Partial<LunaFrameworkConfig> = {};

    if (isProduction) {
      environmentConfig.global_settings = {
        ...environmentConfig.global_settings,
        debug_mode: false,
        performance_monitoring: true
      };
    }

    if (isMobile) {
      environmentConfig.ui_settings = {
        ...environmentConfig.ui_settings,
        default_size: 'small',
        animation_enabled: true, // Animations are important on mobile
        haptic_feedback: true
      };

      // Reduce resource usage on mobile
      environmentConfig.global_settings = {
        ...environmentConfig.global_settings,
        max_cache_size: 500
      };
    }

    if (isOffline) {
      environmentConfig.global_settings = {
        ...environmentConfig.global_settings,
        local_processing_enabled: true,
        ai_fallback_enabled: false
      };
    }

    return environmentConfig;
  }

  // MARK: - Validation and Migration

  validateConfig(config: LunaFrameworkConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate agents
    for (const agent of config.agents) {
      if (!agent.type || !agent.configuration) {
        errors.push(`Invalid agent configuration for type: ${agent.type}`);
      }

      if (agent.max_concurrent_tasks < 1 || agent.max_concurrent_tasks > 10) {
        errors.push(`Invalid max_concurrent_tasks for agent ${agent.type}: must be between 1 and 10`);
      }

      if (agent.timeout < 1000 || agent.timeout > 600000) {
        errors.push(`Invalid timeout for agent ${agent.type}: must be between 1s and 10min`);
      }
    }

    // Validate global settings
    if (config.global_settings.max_cache_size < 100 || config.global_settings.max_cache_size > 10000) {
      errors.push('max_cache_size must be between 100 and 10000');
    }

    if (config.global_settings.cache_ttl < 60000 || config.global_settings.cache_ttl > 86400000) {
      errors.push('cache_ttl must be between 1 minute and 24 hours');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  migrateConfig(oldConfig: any, version: string): LunaFrameworkConfig {
    // Simple migration logic - in production, this would be more sophisticated
    let migratedConfig = { ...DEFAULT_LUNA_CONFIG };

    if (oldConfig.agents) {
      // Merge existing agent configurations
      for (const oldAgent of oldConfig.agents) {
        const defaultAgent = migratedConfig.agents.find(a => a.type === oldAgent.type);
        if (defaultAgent) {
          Object.assign(defaultAgent, oldAgent);
        }
      }
    }

    if (oldConfig.global_settings) {
      migratedConfig.global_settings = { ...migratedConfig.global_settings, ...oldConfig.global_settings };
    }

    if (oldConfig.ui_settings) {
      migratedConfig.ui_settings = { ...migratedConfig.ui_settings, ...oldConfig.ui_settings };
    }

    if (oldConfig.security_settings) {
      migratedConfig.security_settings = { ...migratedConfig.security_settings, ...oldConfig.security_settings };
    }

    console.log(`🔄 Luna Config: Migrated configuration from version ${version}`);
    return migratedConfig;
  }

  // MARK: - Event Handling

  addConfigListener(listener: (config: LunaFrameworkConfig) => void): () => void {
    this.configListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.configListeners.indexOf(listener);
      if (index > -1) {
        this.configListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    for (const listener of this.configListeners) {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Luna Config: Listener error:', error);
      }
    }
  }

  // MARK: - Persistence

  private loadConfig(): LunaFrameworkConfig {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_LUNA_CONFIG };
    }

    try {
      const savedConfig = localStorage.getItem('luna-config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);

        // Validate and migrate if necessary
        const validation = this.validateConfig(parsed);
        if (validation.isValid) {
          return this.mergeConfigs(DEFAULT_LUNA_CONFIG, parsed);
        } else {
          console.warn('Luna Config: Invalid saved config, using defaults:', validation.errors);
        }
      }
    } catch (error) {
      console.error('Luna Config: Error loading config:', error);
    }

    return { ...DEFAULT_LUNA_CONFIG };
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('luna-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Luna Config: Error saving config:', error);
    }
  }

  private mergeConfigs(base: LunaFrameworkConfig, updates: Partial<LunaFrameworkConfig>): LunaFrameworkConfig {
    return {
      agents: updates.agents || base.agents,
      global_settings: { ...base.global_settings, ...updates.global_settings },
      ui_settings: { ...base.ui_settings, ...updates.ui_settings },
      security_settings: { ...base.security_settings, ...updates.security_settings }
    };
  }

  // MARK: - Utility Methods

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(configJson);
      const validation = this.validateConfig(imported);

      if (validation.isValid) {
        this.config = imported;
        this.saveConfig();
        this.notifyListeners();
        return { success: true };
      } else {
        return { success: false, error: validation.errors.join(', ') };
      }
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }

  resetToDefaults(): void {
    this.config = { ...DEFAULT_LUNA_CONFIG };
    this.saveConfig();
    this.notifyListeners();
    console.log('🔄 Luna Config: Reset to default configuration');
  }

  getConfigSummary(): {
    enabledAgents: number;
    totalAgents: number;
    cacheSize: number;
    localProcessing: boolean;
    performanceMonitoring: boolean;
  } {
    return {
      enabledAgents: this.config.agents.filter(a => a.enabled).length,
      totalAgents: this.config.agents.length,
      cacheSize: this.config.global_settings.max_cache_size,
      localProcessing: this.config.global_settings.local_processing_enabled,
      performanceMonitoring: this.config.global_settings.performance_monitoring
    };
  }
}

// MARK: - Exports

export const LUNA_CONFIG = DEFAULT_LUNA_CONFIG;
export type LunaConfig = LunaFrameworkConfig;

// Export singleton instance
export const lunaConfig = LunaConfigManager.getInstance();

// Convenience functions
export function getLunaConfig(): LunaFrameworkConfig {
  return lunaConfig.getConfig();
}

export function updateLunaConfig(updates: Partial<LunaFrameworkConfig>): void {
  lunaConfig.updateConfig(updates);
}

export function enableLunaAgent(agentType: LunaAgentType): void {
  lunaConfig.enableAgent(agentType);
}

export function disableLunaAgent(agentType: LunaAgentType): void {
  lunaConfig.disableAgent(agentType);
}

export function applyLunaPreset(presetName: string): void {
  lunaConfig.applyPreset(presetName);
}