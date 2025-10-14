import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { streamChat } from '@/utils/aiStreaming';
import { streamFrameworkChat, generateContextualSuggestions, type FrameworkContext } from '@/utils/aiFrameworkStreaming';
import { LunaExpression } from '@/assets/luna/luna-assets';
import { useLunaFramework } from './LunaFrameworkContext';

interface Message {
  id: string;
  role: 'user' | 'luna';
  content: string;
  timestamp: Date;
  context?: string; // Context like 'capture', 'plan', 'engage'
}

interface LunaState {
  // Chat state
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  currentExpression: LunaExpression;

  // Unified menu state
  isUnifiedMenuOpen: boolean;

  // Contextual state
  currentContext: 'capture' | 'plan' | 'engage' | 'general';
  hasUnreadMessages: boolean;
  suggestionsEnabled: boolean;

  // User preferences
  lunaPersonality: 'helpful' | 'enthusiastic' | 'focused';
  showProactiveSuggestions: boolean;
  reminderFrequency: 'high' | 'medium' | 'low' | 'off';

  // Framework integration
  frameworkEnabled: boolean;
  contextualSuggestions: string[];
}

interface LunaActions {
  // Chat actions
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string, context?: string) => void;
  clearMessages: () => void;
  markMessagesAsRead: () => void;

  // Expression actions
  setExpression: (expression: LunaExpression) => void;
  resetExpression: () => void;

  // Unified menu actions
  openUnifiedMenu: () => void;
  closeUnifiedMenu: () => void;
  toggleUnifiedMenu: () => void;

  // Context actions
  setContext: (context: 'capture' | 'plan' | 'engage' | 'general') => void;

  // Settings actions
  updatePreferences: (preferences: Partial<Pick<LunaState, 'lunaPersonality' | 'showProactiveSuggestions' | 'reminderFrequency' | 'frameworkEnabled'>>) => void;
  toggleSuggestions: () => void;

  // Framework actions
  toggleFramework: () => void;
  refreshSuggestions: () => void;
  sendFrameworkMessage: (content: string, context?: string) => void;
}

type LunaContextType = LunaState & LunaActions;

const LunaContext = createContext<LunaContextType | undefined>(undefined);

// Default Luna state
const defaultLunaState: LunaState = {
  isOpen: false,
  messages: [],
  isTyping: false,
  currentExpression: 'default',

  isUnifiedMenuOpen: false,

  currentContext: 'general',
  hasUnreadMessages: false,
  suggestionsEnabled: true,

  lunaPersonality: 'helpful',
  showProactiveSuggestions: true,
  reminderFrequency: 'medium',

  frameworkEnabled: true,
  contextualSuggestions: [],
};

interface LunaProviderProps {
  children: ReactNode;
}

export const LunaProvider: React.FC<LunaProviderProps> = ({ children }) => {
  const [state, setState] = useState<LunaState>(defaultLunaState);
  const [initializationState, setInitializationState] = useState<'loading' | 'ready'>('loading');

  // ALWAYS call hook at top level (React Rules of Hooks)
  const framework = useLunaFramework();

  // Check if framework is available AFTER calling the hook
  const frameworkAvailable = framework?.productivityProfile?.currentStage !== undefined;
  
  // MEMOIZE framework context to prevent infinite re-renders
  const frameworkContext: FrameworkContext | undefined = useMemo(() => {
    if (!frameworkAvailable || !framework) return undefined;
    
    return {
      userStage: framework.productivityProfile.currentStage,
      weekInStage: framework.productivityProfile.weekInStage,
      completedPrinciples: framework.productivityProfile.completedPrinciples,
      currentMetrics: framework.productivityProfile.currentMetrics,
      wellBeingScore: framework.productivityProfile.wellBeingScore,
      systemHealthScore: framework.productivityProfile.systemHealthScore,
      energyPattern: framework.productivityProfile.energyPattern,
      isInRecoveryMode: framework.isInRecoveryMode,
      currentRecoveryLevel: framework.currentRecoveryLevel || undefined,
      userPreferences: framework.userPreferences,
    };
  }, [frameworkAvailable, framework]);

  // Auto-reset expression after some time
  useEffect(() => {
    if (state.currentExpression !== 'default') {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, currentExpression: 'default' }));
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [state.currentExpression]);

  // Single initialization effect to prevent cascading renders
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Load preferences synchronously
        const savedPreferences = localStorage.getItem('luna-preferences');
        if (savedPreferences && mounted) {
          const preferences = JSON.parse(savedPreferences);
          setState(prev => ({ ...prev, ...preferences }));
        }

        if (mounted) {
          setInitializationState('ready');
        }
      } catch (error) {
        console.warn('Luna initialization error:', error);
        if (mounted) {
          setInitializationState('ready'); // Continue anyway
        }
      }
    };

    initialize();
    return () => { mounted = false; };
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    const preferences = {
      lunaPersonality: state.lunaPersonality,
      showProactiveSuggestions: state.showProactiveSuggestions,
      reminderFrequency: state.reminderFrequency,
      suggestionsEnabled: state.suggestionsEnabled,
      frameworkEnabled: state.frameworkEnabled,
    };
    localStorage.setItem('luna-preferences', JSON.stringify(preferences));
  }, [state.lunaPersonality, state.showProactiveSuggestions, state.reminderFrequency, state.suggestionsEnabled, state.frameworkEnabled]);

  // Update contextual suggestions when context or framework state changes (after initialization)
  useEffect(() => {
    if (initializationState !== 'ready') return;

    if (state.frameworkEnabled && frameworkAvailable && frameworkContext) {
      const suggestions = generateContextualSuggestions(state.currentContext, frameworkContext);
      setState(prev => ({ ...prev, contextualSuggestions: suggestions }));
    } else {
      setState(prev => ({ ...prev, contextualSuggestions: [] }));
    }
  }, [initializationState, state.currentContext, state.frameworkEnabled, frameworkAvailable, frameworkContext]);

  // Listen for unified menu open events from bottom navigation
  useEffect(() => {
    const handleUnifiedMenuEvent = (e: CustomEvent) => {
      setState(prev => ({ ...prev, isUnifiedMenuOpen: true }));
    };

    window.addEventListener('open-luna-unified-menu' as any, handleUnifiedMenuEvent as EventListener);

    return () => {
      window.removeEventListener('open-luna-unified-menu' as any, handleUnifiedMenuEvent as EventListener);
    };
  }, []);

  // Create a function to handle message sending logic
  const handleMessageSending = (content: string, context?: string, useFramework: boolean = true) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      context: context || state.currentContext,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isTyping: true,
      currentExpression: 'thinking'
    }));

    // Create placeholder Luna message that we'll update
    const lunaMessageId = (Date.now() + 1).toString();
    let lunaContent = '';

    // Add initial empty Luna message
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: lunaMessageId,
          role: 'luna',
          content: '',
          timestamp: new Date(),
          context: context || state.currentContext,
        }
      ]
    }));

    // Convert messages to AI format (role: 'luna' -> 'assistant')
    const aiMessages = [...state.messages, newMessage].map(msg => ({
      role: msg.role === 'luna' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

    // Use framework-enhanced streaming if enabled and requested
    if (useFramework && state.frameworkEnabled) {
      streamFrameworkChat({
        messages: aiMessages,
        context: context || state.currentContext,
        personality: state.lunaPersonality,
        frameworkContext,
        onDelta: (chunk: string) => {
          lunaContent += chunk;

          // Update the last message's content
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === lunaMessageId
                ? { ...msg, content: lunaContent }
                : msg
            ),
            currentExpression: 'happy'
          }));
        },
        onDone: () => {
          setState(prev => ({
            ...prev,
            isTyping: false,
            currentExpression: 'happy',
            hasUnreadMessages: !prev.isOpen
          }));
        },
        onError: (error: Error) => {
          console.error('Luna Framework AI error:', error);

          // Show error message to user
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === lunaMessageId
                ? {
                    ...msg,
                    content: "Oops! I'm having trouble with the framework integration right now. 🦊💔 Please try again in a moment."
                  }
                : msg
            ),
            isTyping: false,
            currentExpression: 'error'
          }));
        }
      });
    } else {
      // Fallback to regular streaming
      streamChat({
        messages: aiMessages,
        context: context || state.currentContext,
        personality: state.lunaPersonality,
        onDelta: (chunk: string) => {
          lunaContent += chunk;

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === lunaMessageId
                ? { ...msg, content: lunaContent }
                : msg
            ),
            currentExpression: 'happy'
          }));
        },
        onDone: () => {
          setState(prev => ({
            ...prev,
            isTyping: false,
            currentExpression: 'happy',
            hasUnreadMessages: !prev.isOpen
          }));
        },
        onError: (error: Error) => {
          console.error('Luna AI error:', error);

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === lunaMessageId
                ? {
                    ...msg,
                    content: "Oops! I'm having trouble connecting right now. 🦊💔 Please try again in a moment."
                  }
                : msg
            ),
            isTyping: false,
            currentExpression: 'error'
          }));
        }
      });
    }
  };

  const actions: LunaActions = {
    // Chat actions
    openChat: () => {
      setState(prev => ({
        ...prev,
        isOpen: true,
        hasUnreadMessages: false,
        currentExpression: 'happy'
      }));
    },

    closeChat: () => {
      setState(prev => ({
        ...prev,
        isOpen: false,
        currentExpression: 'default'
      }));
    },

    sendMessage: (content: string, context?: string) => {
      handleMessageSending(content, context, true);
    },

    clearMessages: () => {
      setState(prev => ({ ...prev, messages: [] }));
    },

    markMessagesAsRead: () => {
      setState(prev => ({ ...prev, hasUnreadMessages: false }));
    },

    // Expression actions
    setExpression: (expression: LunaExpression) => {
      setState(prev => ({ ...prev, currentExpression: expression }));
    },

    resetExpression: () => {
      setState(prev => ({ ...prev, currentExpression: 'default' }));
    },

    // Unified menu actions
    openUnifiedMenu: () => {
      setState(prev => ({ ...prev, isUnifiedMenuOpen: true }));
    },

    closeUnifiedMenu: () => {
      setState(prev => ({ ...prev, isUnifiedMenuOpen: false }));
    },

    toggleUnifiedMenu: () => {
      setState(prev => ({ ...prev, isUnifiedMenuOpen: !prev.isUnifiedMenuOpen }));
    },

    // Context actions
    setContext: (context) => {
      setState(prev => ({ ...prev, currentContext: context }));
    },

    // Settings actions
    updatePreferences: (preferences) => {
      setState(prev => ({ ...prev, ...preferences }));
    },

    toggleSuggestions: () => {
      setState(prev => ({ ...prev, suggestionsEnabled: !prev.suggestionsEnabled }));
    },

    // Framework actions
    toggleFramework: () => {
      setState(prev => ({ ...prev, frameworkEnabled: !prev.frameworkEnabled }));
    },

    refreshSuggestions: () => {
      if (state.frameworkEnabled && frameworkAvailable && frameworkContext) {
        const suggestions = generateContextualSuggestions(state.currentContext, frameworkContext);
        setState(prev => ({ ...prev, contextualSuggestions: suggestions }));
      }
    },

    sendFrameworkMessage: (content: string, context?: string) => {
      handleMessageSending(content, context, true);
    },
  };

  const contextValue: LunaContextType = {
    ...state,
    ...actions,
  };

  return (
    <LunaContext.Provider value={contextValue}>
      {children}
    </LunaContext.Provider>
  );
};

// Custom hook to use Luna context
export const useLuna = (): LunaContextType => {
  const context = useContext(LunaContext);
  if (context === undefined) {
    throw new Error('useLuna must be used within a LunaProvider');
  }
  return context;
};

// Utility hooks for specific Luna functionality
export const useLunaChat = () => {
  const { isOpen, messages, isTyping, openChat, closeChat, sendMessage, clearMessages } = useLuna();
  return { isOpen, messages, isTyping, openChat, closeChat, sendMessage, clearMessages };
};

export const useLunaExpression = () => {
  const { currentExpression, setExpression, resetExpression } = useLuna();
  return { currentExpression, setExpression, resetExpression };
};

export const useLunaUnifiedMenu = () => {
  const { isUnifiedMenuOpen, openUnifiedMenu, closeUnifiedMenu, toggleUnifiedMenu } = useLuna();
  return { isUnifiedMenuOpen, openUnifiedMenu, closeUnifiedMenu, toggleUnifiedMenu };
};