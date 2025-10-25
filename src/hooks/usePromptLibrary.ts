import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLuna } from '@/components/luna/context/LunaContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIntent,
  AppContext,
  PromptTemplate,
  PromptSearchOptions,
  PromptLibraryStats,
  PromptFeedback
} from '@/types/promptLibrary';
import { PromptLibraryManager } from '@/services/promptLibraryManager';

// Global instance of the prompt library manager
let promptLibraryManager: PromptLibraryManager | null = null;

const getPromptLibraryManager = (): PromptLibraryManager => {
  if (!promptLibraryManager) {
    promptLibraryManager = new PromptLibraryManager();
  }
  return promptLibraryManager;
};

/**
 * Main hook for using the Luna Prompt Library system
 * Integrates with existing Luna context and provides intelligent prompt routing
 */
export const usePromptLibrary = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const lunaContext = useLuna();

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastIntent, setLastIntent] = useState<UserIntent | null>(null);
  const [lastPrompt, setLastPrompt] = useState<PromptTemplate | null>(null);
  const [processingHistory, setProcessingHistory] = useState<Array<{
    input: string;
    intent: UserIntent;
    prompt: PromptTemplate;
    timestamp: Date;
  }>>([]);

  const manager = useMemo(() => getPromptLibraryManager(), []);

  // Create app context from current state
  const createAppContext = useCallback((): AppContext => {
    return {
      currentRoute: location.pathname,
      currentModule: location.pathname.split('/')[2] || 'dashboard',
      userState: {
        tasks: [], // This would integrate with actual task data
        goals: [], // This would integrate with actual goal data
        habits: [], // This would integrate with actual habit data
        projects: [], // This would integrate with actual project data
        recentActivity: [] // This would integrate with actual activity data
      },
      timeContext: {
        timeOfDay: getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
        currentDate: new Date()
      },
      userPreferences: {
        language: profile?.preferred_language || 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        communicationStyle: profile?.communication_style || 'conversational'
      },
      sessionContext: {
        recentIntents: processingHistory.slice(-5).map(h => h.intent),
        conversationHistory: lunaContext.messages.slice(-10),
        currentFocus: inferCurrentFocus(location.pathname)
      }
    };
  }, [location.pathname, profile, lunaContext.messages, processingHistory]);

  /**
   * Main method: Process user input through the prompt library
   */
  const processInput = useCallback(async (userInput: string) => {
    setIsProcessing(true);

    try {
      const context = createAppContext();
      const result = await manager.processUserInput(userInput, context);

      setLastIntent(result.intent);
      setLastPrompt(result.prompt);

      // Add to processing history
      setProcessingHistory(prev => [...prev, {
        input: userInput,
        intent: result.intent,
        prompt: result.prompt,
        timestamp: new Date()
      }].slice(-50)); // Keep last 50 entries

      return result;

    } catch (error) {
      console.error('Error processing input:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [manager, createAppContext]);

  /**
   * Process input and send to Luna for AI response
   */
  const sendToLuna = useCallback(async (userInput: string, additionalContext?: any) => {
    try {
      const result = await processInput(userInput);

      // Send enhanced prompt to Luna's AI system
      await lunaContext.sendMessage(result.enhancedPrompt, result.intent.category);

      return result;

    } catch (error) {
      console.error('Error sending to Luna:', error);
      // Fallback to regular Luna chat
      await lunaContext.sendMessage(userInput, 'general');
      throw error;
    }
  }, [processInput, lunaContext]);

  return {
    // Main functionality
    processInput,
    sendToLuna,

    // State
    isProcessing,
    lastIntent,
    lastPrompt,
    processingHistory,

    // Context
    appContext: createAppContext(),

    // Manager access for advanced usage
    manager
  };
};

/**
 * Hook for searching and browsing prompts
 */
export const usePromptSearch = () => {
  const [searchResults, setSearchResults] = useState<PromptTemplate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState<PromptLibraryStats | null>(null);

  const manager = useMemo(() => getPromptLibraryManager(), []);

  const searchPrompts = useCallback(async (query: string, options: PromptSearchOptions = {}) => {
    setIsSearching(true);

    try {
      const response = await manager.searchPrompts(query, options);
      if (response.success) {
        setSearchResults(response.data);
      }
      return response;
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [manager]);

  const getPrompts = useCallback(async (options: PromptSearchOptions = {}) => {
    const response = await manager.getPrompts(options);
    if (response.success) {
      setSearchResults(response.data);
    }
    return response;
  }, [manager]);

  const getStats = useCallback(async () => {
    const response = await manager.getLibraryStats();
    if (response.success) {
      setSearchStats(response.data);
    }
    return response;
  }, [manager]);

  return {
    searchPrompts,
    getPrompts,
    getStats,
    searchResults,
    isSearching,
    searchStats,
    clearResults: () => setSearchResults([])
  };
};

/**
 * Hook for managing custom prompts
 */
export const useCustomPrompts = () => {
  const [customPrompts, setCustomPrompts] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const manager = useMemo(() => getPromptLibraryManager(), []);

  const loadCustomPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await manager.getPrompts({ author: 'user' });
      if (response.success) {
        setCustomPrompts(response.data);
      }
    } catch (error) {
      console.error('Error loading custom prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  const createCustomPrompt = useCallback(async (promptData: any) => {
    try {
      const id = await manager.createCustomPrompt(promptData);
      await loadCustomPrompts(); // Refresh list
      return id;
    } catch (error) {
      console.error('Error creating custom prompt:', error);
      throw error;
    }
  }, [manager, loadCustomPrompts]);

  const updateCustomPrompt = useCallback(async (id: string, updates: any) => {
    try {
      const success = await manager.updateCustomPrompt(id, updates);
      if (success) {
        await loadCustomPrompts(); // Refresh list
      }
      return success;
    } catch (error) {
      console.error('Error updating custom prompt:', error);
      throw error;
    }
  }, [manager, loadCustomPrompts]);

  const deleteCustomPrompt = useCallback(async (id: string) => {
    try {
      const success = await manager.deleteCustomPrompt(id);
      if (success) {
        await loadCustomPrompts(); // Refresh list
      }
      return success;
    } catch (error) {
      console.error('Error deleting custom prompt:', error);
      throw error;
    }
  }, [manager, loadCustomPrompts]);

  // Load custom prompts on mount
  useEffect(() => {
    loadCustomPrompts();
  }, [loadCustomPrompts]);

  return {
    customPrompts,
    isLoading,
    createCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    refreshPrompts: loadCustomPrompts
  };
};

/**
 * Hook for prompt feedback and analytics
 */
export const usePromptFeedback = () => {
  const manager = useMemo(() => getPromptLibraryManager(), []);

  const submitFeedback = useCallback(async (
    promptId: string,
    rating: number,
    feedback: string,
    wasHelpful: boolean,
    suggestedImprovements?: string
  ) => {
    try {
      await manager.submitFeedback({
        promptId,
        rating,
        feedback,
        wasHelpful,
        suggestedImprovements
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }, [manager]);

  const trainFromFeedback = useCallback(async (
    originalInput: string,
    correctIntent: UserIntent,
    wasCorrect: boolean
  ) => {
    try {
      await manager.trainFromFeedback(originalInput, correctIntent, wasCorrect);
      return true;
    } catch (error) {
      console.error('Error training from feedback:', error);
      throw error;
    }
  }, [manager]);

  return {
    submitFeedback,
    trainFromFeedback
  };
};

/**
 * Hook for prompt library analytics
 */
export const usePromptAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [intentStats, setIntentStats] = useState<any>({});

  const manager = useMemo(() => getPromptLibraryManager(), []);

  const refreshAnalytics = useCallback(() => {
    const recentAnalytics = manager.getRecentAnalytics(100);
    const stats = manager.getIntentStats();

    setAnalytics(recentAnalytics);
    setIntentStats(stats);
  }, [manager]);

  useEffect(() => {
    refreshAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(refreshAnalytics, 30000);
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    analytics,
    intentStats,
    refreshAnalytics
  };
};

// Helper functions

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function inferCurrentFocus(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const module = segments[segments.length - 1];

  switch (module) {
    case 'capture':
    case 'tasks':
      return 'task management';
    case 'plan':
    case 'calendar':
      return 'planning and scheduling';
    case 'engage':
    case 'goals':
      return 'goal achievement';
    case 'analytics':
      return 'performance analysis';
    case 'habits':
      return 'habit formation';
    case 'projects':
      return 'project management';
    case 'luna':
      return 'AI assistance';
    default:
      return 'general productivity';
  }
}