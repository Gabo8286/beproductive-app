/**
 * AI & Intelligence Hooks Module
 * Consolidated hooks for AI functionality, Luna integration, and intelligent automation
 * Integrates with the Luna AI framework for cross-platform consistency
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { lunaManager, processWithLocalIntelligence, canHandleLocally } from '@/shared/luna';
import type {
  LunaContext,
  LunaResult,
  LunaAgentType,
  LunaTask,
  AIProvider,
  AIModelType,
  AIInsight,
  AISuggestion
} from '../luna/types';
import type { UUID, Score, ConfidenceLevel } from '../types/core';

// MARK: - Luna AI Integration Hooks

/**
 * Main Luna AI hook for intelligent assistance
 */
export function useLunaAI() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTasks, setActiveTasks] = useState<LunaTask[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Initialize Luna on mount
  useEffect(() => {
    const initializeLuna = async () => {
      try {
        await lunaManager.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Luna:', error);
      }
    };

    initializeLuna();

    // Cleanup on unmount
    return () => {
      lunaManager.shutdown();
    };
  }, []);

  const processRequest = useCallback(async (
    userInput: string,
    context?: Partial<LunaContext>
  ): Promise<LunaResult> => {
    if (!isInitialized) {
      throw new Error('Luna is not initialized');
    }

    // First try local processing
    const fullContext: LunaContext = {
      userInput,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      timeOfDay: getTimeOfDay(),
      ...context
    };

    try {
      return await processWithLocalIntelligence(userInput, fullContext);
    } catch (error) {
      console.error('Luna processing failed:', error);
      throw error;
    }
  }, [isInitialized]);

  const executeTask = useCallback(async (
    type: any, // LunaActionType
    context: LunaContext,
    agentType?: LunaAgentType
  ): Promise<LunaResult> => {
    if (!isInitialized) {
      throw new Error('Luna is not initialized');
    }

    return lunaManager.executeTask(type, context, agentType);
  }, [isInitialized]);

  const getSystemHealth = useCallback(async () => {
    if (!isInitialized) return null;

    const health = await lunaManager.getSystemHealth();
    setSystemHealth(health);
    return health;
  }, [isInitialized]);

  // Monitor active tasks
  useEffect(() => {
    if (!isInitialized) return;

    const updateTasks = () => {
      const tasks = lunaManager.getActiveTasks();
      setActiveTasks(tasks);
    };

    // Update tasks periodically
    const interval = setInterval(updateTasks, 5000);
    updateTasks(); // Initial update

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    isInitialized,
    activeTasks,
    systemHealth,
    processRequest,
    executeTask,
    getSystemHealth,
    canHandleLocally: (input: string) => canHandleLocally(input),
    taskCount: activeTasks.length
  };
}

// MARK: - AI Insights Hook

interface InsightState {
  insights: AIInsight[];
  isGenerating: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

/**
 * AI-powered insights and recommendations
 */
export function useAIInsights() {
  const [state, setState] = useState<InsightState>({
    insights: [],
    isGenerating: false,
    lastUpdate: null,
    error: null
  });

  const { executeTask, isInitialized } = useLunaAI();

  const generateInsights = useCallback(async (
    category?: string,
    context?: Record<string, any>
  ) => {
    if (!isInitialized) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const lunaContext: LunaContext = {
        userInput: `Generate insights${category ? ` for ${category}` : ''}`,
        timeOfDay: getTimeOfDay(),
        currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...context
      };

      const result = await executeTask('insights', lunaContext, 'insight_analyzer');

      // Extract insights from result (simplified)
      const insights: AIInsight[] = result.metadata?.insights || [];

      setState(prev => ({
        ...prev,
        insights,
        isGenerating: false,
        lastUpdate: new Date()
      }));

      return insights;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate insights'
      }));
      throw error;
    }
  }, [executeTask, isInitialized]);

  const getInsightsByCategory = useCallback((category: string) => {
    return state.insights.filter(insight => insight.category === category);
  }, [state.insights]);

  const getInsightsByConfidence = useCallback((minConfidence: number) => {
    return state.insights.filter(insight => insight.confidence >= minConfidence);
  }, [state.insights]);

  const markInsightAsApplied = useCallback((insightId: UUID) => {
    setState(prev => ({
      ...prev,
      insights: prev.insights.map(insight =>
        insight.id === insightId
          ? { ...insight, applied: true, applied_at: new Date().toISOString() }
          : insight
      )
    }));
  }, []);

  const dismissInsight = useCallback((insightId: UUID) => {
    setState(prev => ({
      ...prev,
      insights: prev.insights.filter(insight => insight.id !== insightId)
    }));
  }, []);

  // Auto-generate insights periodically
  useEffect(() => {
    if (!isInitialized) return;

    const autoGenerate = () => {
      const shouldGenerate = !state.lastUpdate ||
        Date.now() - state.lastUpdate.getTime() > 30 * 60 * 1000; // 30 minutes

      if (shouldGenerate && !state.isGenerating) {
        generateInsights();
      }
    };

    const interval = setInterval(autoGenerate, 10 * 60 * 1000); // Check every 10 minutes
    autoGenerate(); // Initial check

    return () => clearInterval(interval);
  }, [isInitialized, state.lastUpdate, state.isGenerating, generateInsights]);

  return {
    ...state,
    generateInsights,
    getInsightsByCategory,
    getInsightsByConfidence,
    markInsightAsApplied,
    dismissInsight,
    // Convenience getters
    highConfidenceInsights: state.insights.filter(i => i.confidence >= 0.8),
    actionableInsights: state.insights.filter(i => i.actionable),
    appliedInsights: state.insights.filter(i => i.applied),
    pendingInsights: state.insights.filter(i => !i.applied)
  };
}

// MARK: - AI Suggestions Hook

interface SuggestionState {
  suggestions: AISuggestion[];
  isGenerating: boolean;
  lastUpdate: Date | null;
  appliedSuggestions: UUID[];
}

/**
 * AI-powered suggestions and recommendations
 */
export function useAISuggestions() {
  const [state, setState] = useState<SuggestionState>({
    suggestions: [],
    isGenerating: false,
    lastUpdate: null,
    appliedSuggestions: []
  });

  const { executeTask, isInitialized } = useLunaAI();

  const generateSuggestions = useCallback(async (
    context?: Record<string, any>
  ) => {
    if (!isInitialized) return;

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const lunaContext: LunaContext = {
        userInput: 'Generate productivity suggestions',
        timeOfDay: getTimeOfDay(),
        currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...context
      };

      const result = await executeTask('suggestion', lunaContext, 'workflow_optimizer');

      // Extract suggestions from result (simplified)
      const suggestions: AISuggestion[] = result.metadata?.suggestions || [];

      setState(prev => ({
        ...prev,
        suggestions,
        isGenerating: false,
        lastUpdate: new Date()
      }));

      return suggestions;
    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      throw error;
    }
  }, [executeTask, isInitialized]);

  const applySuggestion = useCallback((suggestionId: UUID) => {
    setState(prev => ({
      ...prev,
      appliedSuggestions: [...prev.appliedSuggestions, suggestionId],
      suggestions: prev.suggestions.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, applied: true }
          : suggestion
      )
    }));
  }, []);

  const dismissSuggestion = useCallback((suggestionId: UUID) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
    }));
  }, []);

  const getSuggestionsByType = useCallback((type: string) => {
    return state.suggestions.filter(s => s.type === type);
  }, [state.suggestions]);

  const getSuggestionsByPriority = useCallback((priority: string) => {
    return state.suggestions.filter(s => s.priority === priority);
  }, [state.suggestions]);

  return {
    ...state,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    getSuggestionsByType,
    getSuggestionsByPriority,
    // Convenience getters
    highPrioritySuggestions: state.suggestions.filter(s => s.priority === 'high' || s.priority === 'critical'),
    unappliedSuggestions: state.suggestions.filter(s => !state.appliedSuggestions.includes(s.id))
  };
}

// MARK: - AI Settings Hook

interface AISettings {
  provider: AIProvider;
  model: AIModelType;
  temperature: number;
  maxTokens: number;
  enableLocalProcessing: boolean;
  enableAIFallback: boolean;
  autoGenerateInsights: boolean;
  insightFrequency: 'low' | 'medium' | 'high';
  apiKeys: Record<AIProvider, string>;
}

/**
 * AI configuration and settings management
 */
export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(() => {
    const defaultSettings: AISettings = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      enableLocalProcessing: true,
      enableAIFallback: true,
      autoGenerateInsights: true,
      insightFrequency: 'medium',
      apiKeys: {
        openai: '',
        anthropic: '',
        google: '',
        local: '',
        custom: ''
      }
    };

    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch (error) {
          console.warn('Failed to load AI settings:', error);
        }
      }
    }

    return defaultSettings;
  });

  const updateSettings = useCallback((updates: Partial<AISettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai-settings', JSON.stringify(newSettings));
      }

      return newSettings;
    });
  }, []);

  const updateApiKey = useCallback((provider: AIProvider, apiKey: string) => {
    updateSettings({
      apiKeys: {
        ...settings.apiKeys,
        [provider]: apiKey
      }
    });
  }, [settings.apiKeys, updateSettings]);

  const testConnection = useCallback(async (provider?: AIProvider) => {
    const targetProvider = provider || settings.provider;
    const apiKey = settings.apiKeys[targetProvider];

    if (!apiKey) {
      throw new Error(`No API key configured for ${targetProvider}`);
    }

    // In production, this would test the actual connection
    // For now, simulate a test
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, provider: targetProvider };
  }, [settings.provider, settings.apiKeys]);

  const resetSettings = useCallback(() => {
    const defaultSettings: AISettings = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      enableLocalProcessing: true,
      enableAIFallback: true,
      autoGenerateInsights: true,
      insightFrequency: 'medium',
      apiKeys: {
        openai: '',
        anthropic: '',
        google: '',
        local: '',
        custom: ''
      }
    };

    setSettings(defaultSettings);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-settings');
    }
  }, []);

  const isConfigured = useMemo(() => {
    return settings.apiKeys[settings.provider] !== '';
  }, [settings.apiKeys, settings.provider]);

  return {
    settings,
    updateSettings,
    updateApiKey,
    testConnection,
    resetSettings,
    isConfigured,
    // Convenience getters
    currentProvider: settings.provider,
    currentModel: settings.model,
    hasApiKey: (provider: AIProvider) => settings.apiKeys[provider] !== ''
  };
}

// MARK: - AI Usage Statistics Hook

interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  locallyProcessed: number;
  aiProcessed: number;
  averageResponseTime: number;
  tokensUsed: number;
  estimatedCost: number;
  lastReset: Date;
}

/**
 * AI usage tracking and statistics
 */
export function useAIUsageStats() {
  const [stats, setStats] = useState<UsageStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-usage-stats');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...parsed, lastReset: new Date(parsed.lastReset) };
        } catch (error) {
          console.warn('Failed to load AI usage stats:', error);
        }
      }
    }

    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      locallyProcessed: 0,
      aiProcessed: 0,
      averageResponseTime: 0,
      tokensUsed: 0,
      estimatedCost: 0,
      lastReset: new Date()
    };
  });

  const recordRequest = useCallback((
    success: boolean,
    handledLocally: boolean,
    responseTime: number,
    tokens?: number,
    cost?: number
  ) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successfulRequests: success ? prev.successfulRequests + 1 : prev.successfulRequests,
        failedRequests: success ? prev.failedRequests : prev.failedRequests + 1,
        locallyProcessed: handledLocally ? prev.locallyProcessed + 1 : prev.locallyProcessed,
        aiProcessed: handledLocally ? prev.aiProcessed : prev.aiProcessed + 1,
        averageResponseTime: (prev.averageResponseTime * (prev.totalRequests - 1) + responseTime) / prev.totalRequests,
        tokensUsed: prev.tokensUsed + (tokens || 0),
        estimatedCost: prev.estimatedCost + (cost || 0)
      };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai-usage-stats', JSON.stringify(newStats));
      }

      return newStats;
    });
  }, []);

  const resetStats = useCallback(() => {
    const resetStats: UsageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      locallyProcessed: 0,
      aiProcessed: 0,
      averageResponseTime: 0,
      tokensUsed: 0,
      estimatedCost: 0,
      lastReset: new Date()
    };

    setStats(resetStats);

    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-usage-stats', JSON.stringify(resetStats));
    }
  }, []);

  const getSuccessRate = useCallback(() => {
    return stats.totalRequests > 0 ? stats.successfulRequests / stats.totalRequests : 0;
  }, [stats.totalRequests, stats.successfulRequests]);

  const getLocalProcessingRate = useCallback(() => {
    return stats.totalRequests > 0 ? stats.locallyProcessed / stats.totalRequests : 0;
  }, [stats.totalRequests, stats.locallyProcessed]);

  const getDailyUsage = useCallback(() => {
    const now = new Date();
    const daysSinceReset = Math.max(1, Math.ceil((now.getTime() - stats.lastReset.getTime()) / (24 * 60 * 60 * 1000)));

    return {
      requestsPerDay: stats.totalRequests / daysSinceReset,
      tokensPerDay: stats.tokensUsed / daysSinceReset,
      costPerDay: stats.estimatedCost / daysSinceReset
    };
  }, [stats]);

  return {
    stats,
    recordRequest,
    resetStats,
    getSuccessRate,
    getLocalProcessingRate,
    getDailyUsage,
    // Convenience getters
    successRate: getSuccessRate(),
    localProcessingRate: getLocalProcessingRate(),
    failureRate: 1 - getSuccessRate(),
    dailyUsage: getDailyUsage()
  };
}

// MARK: - Automation Hook

interface AutomationRule {
  id: UUID;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    value: any;
  };
  action: {
    type: 'ai_task' | 'function' | 'notification';
    value: any;
  };
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

/**
 * AI-powered automation and workflow management
 */
export function useAIAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const { executeTask, isInitialized } = useLunaAI();

  const addRule = useCallback((rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      triggerCount: 0
    };

    setRules(prev => [...prev, newRule]);
    return newRule.id;
  }, []);

  const updateRule = useCallback((id: UUID, updates: Partial<AutomationRule>) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const deleteRule = useCallback((id: UUID) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const triggerRule = useCallback(async (id: UUID, context?: Record<string, any>) => {
    const rule = rules.find(r => r.id === id);
    if (!rule || !rule.enabled || !isInitialized) return;

    try {
      if (rule.action.type === 'ai_task') {
        const lunaContext: LunaContext = {
          userInput: rule.action.value.prompt || rule.description,
          timeOfDay: getTimeOfDay(),
          ...context
        };

        await executeTask(rule.action.value.taskType, lunaContext);
      } else if (rule.action.type === 'function') {
        rule.action.value();
      }

      // Update trigger stats
      setRules(prev => prev.map(r =>
        r.id === id
          ? { ...r, lastTriggered: new Date(), triggerCount: r.triggerCount + 1 }
          : r
      ));
    } catch (error) {
      console.error(`Automation rule ${id} failed:`, error);
    }
  }, [rules, isInitialized, executeTask]);

  const enableRule = useCallback((id: UUID) => {
    updateRule(id, { enabled: true });
  }, [updateRule]);

  const disableRule = useCallback((id: UUID) => {
    updateRule(id, { enabled: false });
  }, [updateRule]);

  const getActiveRules = useCallback(() => {
    return rules.filter(rule => rule.enabled);
  }, [rules]);

  const getRulesByType = useCallback((type: string) => {
    return rules.filter(rule => rule.trigger.type === type);
  }, [rules]);

  return {
    rules,
    addRule,
    updateRule,
    deleteRule,
    triggerRule,
    enableRule,
    disableRule,
    getActiveRules,
    getRulesByType,
    // Convenience getters
    activeRules: getActiveRules(),
    totalRules: rules.length,
    enabledRules: rules.filter(r => r.enabled).length
  };
}

// MARK: - Utility Functions

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

// MARK: - Export All Hooks

export const AIIntelligenceHooks = {
  useLunaAI,
  useAIInsights,
  useAISuggestions,
  useAISettings,
  useAIUsageStats,
  useAIAutomation
};

export default AIIntelligenceHooks;