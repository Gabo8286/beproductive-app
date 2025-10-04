import { useState, useCallback, useContext, createContext, useEffect } from 'react';
import AIService, { AIConfig, AIMessage, TaskExtractionResult, ProductivityInsight } from '@/lib/ai-service';
import { ProductivityAnalyzer, UserActivityData } from '@/lib/predictive-insights';
import { nlpProcessor } from '@/lib/nlp-utils';

interface AIContextType {
  service: AIService | null;
  messages: AIMessage[];
  isLoading: boolean;
  isConfigured: boolean;
  config: AIConfig | null;
  configure: (config: AIConfig) => void;
  sendMessage: (message: string) => Promise<string>;
  extractTask: (text: string) => Promise<TaskExtractionResult>;
  generateInsights: () => Promise<ProductivityInsight[]>;
  suggestNextAction: () => Promise<string>;
  clearConversation: () => void;
  error: string | null;
}

const AIContext = createContext<AIContextType | null>(null);

interface AIProviderProps {
  children: React.ReactNode;
  userData?: UserActivityData;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children, userData }) => {
  const [service, setService] = useState<AIService | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configure = useCallback((newConfig: AIConfig) => {
    try {
      const newService = new AIService(newConfig);
      setService(newService);
      setConfig(newConfig);
      setError(null);

      // Save config to localStorage (without API key for security)
      const publicConfig = { ...newConfig };
      delete (publicConfig as any).apiKey;
      localStorage.setItem('ai-config', JSON.stringify(publicConfig));
    } catch (err) {
      setError('Failed to configure AI service');
      console.error('AI configuration error:', err);
    }
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (!service) {
      throw new Error('AI service not configured');
    }

    setIsLoading(true);
    setError(null);

    try {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await service.chat(message);

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const extractTask = useCallback(async (text: string): Promise<TaskExtractionResult> => {
    if (!service) {
      // Fallback to local NLP processing
      return nlpProcessor.parseTaskFromText(text);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await service.extractTaskFromText(text);
      return result;
    } catch (err) {
      console.error('Task extraction error:', err);
      // Fallback to local processing
      return nlpProcessor.parseTaskFromText(text);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const generateInsights = useCallback(async (): Promise<ProductivityInsight[]> => {
    if (!userData) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Always use local analysis as primary method
      const localInsights = ProductivityAnalyzer.generateInsights(userData);

      // If AI service is available, enhance with AI insights
      if (service) {
        try {
          const aiInsights = await service.generateProductivityInsights(userData);
          return [...localInsights, ...aiInsights].slice(0, 10); // Limit to top 10
        } catch (err) {
          console.warn('AI insights failed, using local analysis:', err);
          return localInsights;
        }
      }

      return localInsights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [service, userData]);

  const suggestNextAction = useCallback(async (): Promise<string> => {
    if (!service || !userData) {
      return 'I recommend reviewing your task list and working on the highest priority item.';
    }

    setIsLoading(true);
    setError(null);

    try {
      const context = {
        currentTime: new Date(),
        tasks: userData.tasks,
        goals: userData.goals,
        userPreferences: {} // Could be expanded
      };

      const suggestion = await service.suggestNextAction(context);
      return suggestion;
    } catch (err) {
      console.error('Next action suggestion error:', err);
      return 'I recommend reviewing your task list and working on the highest priority item.';
    } finally {
      setIsLoading(false);
    }
  }, [service, userData]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    if (service) {
      service.clearContext();
    }
  }, [service]);

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // API key needs to be provided separately for security
        if (parsedConfig.provider) {
          setConfig(parsedConfig);
        }
      } catch (err) {
        console.error('Failed to load saved AI config:', err);
      }
    }
  }, []);

  const contextValue: AIContextType = {
    service,
    messages,
    isLoading,
    isConfigured: !!service,
    config,
    configure,
    sendMessage,
    extractTask,
    generateInsights,
    suggestNextAction,
    clearConversation,
    error
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

/**
 * Hook to access AI functionality
 */
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

/**
 * Hook for AI configuration management
 */
export const useAIConfig = () => {
  const { config, configure, isConfigured, error } = useAI();

  const updateProvider = useCallback((provider: 'anthropic' | 'openai') => {
    if (config) {
      configure({ ...config, provider });
    }
  }, [config, configure]);

  const updateModel = useCallback((model: string) => {
    if (config) {
      configure({ ...config, model });
    }
  }, [config, configure]);

  const updateSettings = useCallback((settings: Partial<Omit<AIConfig, 'apiKey' | 'provider'>>) => {
    if (config) {
      configure({ ...config, ...settings });
    }
  }, [config, configure]);

  return {
    config,
    isConfigured,
    error,
    updateProvider,
    updateModel,
    updateSettings,
    configure
  };
};

/**
 * Hook for task extraction with enhanced features
 */
export const useTaskExtraction = () => {
  const { extractTask, isLoading } = useAI();

  const extractMultipleTasks = useCallback(async (text: string): Promise<TaskExtractionResult[]> => {
    // Split text into potential tasks
    const actionItems = nlpProcessor.extractActionItems(text);

    if (actionItems.length <= 1) {
      const result = await extractTask(text);
      return [result];
    }

    // Extract each action item as a separate task
    const tasks = await Promise.all(
      actionItems.map(item => extractTask(item))
    );

    return tasks.filter(task => task.confidence > 0.3);
  }, [extractTask]);

  return {
    extractTask,
    extractMultipleTasks,
    isLoading
  };
};

/**
 * Hook for productivity insights with caching
 */
export const useProductivityInsights = (refreshInterval: number = 5 * 60 * 1000) => {
  const { generateInsights, isLoading } = useAI();
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshInsights = useCallback(async () => {
    try {
      const newInsights = await generateInsights();
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh insights:', err);
    }
  }, [generateInsights]);

  // Auto-refresh insights
  useEffect(() => {
    const interval = setInterval(refreshInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInsights, refreshInterval]);

  // Initial load
  useEffect(() => {
    if (!lastUpdated) {
      refreshInsights();
    }
  }, [refreshInsights, lastUpdated]);

  return {
    insights,
    isLoading,
    lastUpdated,
    refreshInsights
  };
};

export default useAI;