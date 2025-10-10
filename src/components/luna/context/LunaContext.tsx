import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LunaExpression } from '@/assets/luna/luna-assets';

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

  // Floating avatar state
  isFloating: boolean;
  floatPosition: 'top-right' | 'bottom-right' | 'hidden';

  // Contextual state
  currentContext: 'capture' | 'plan' | 'engage' | 'general';
  hasUnreadMessages: boolean;
  suggestionsEnabled: boolean;

  // User preferences
  lunaPersonality: 'helpful' | 'enthusiastic' | 'focused';
  showProactiveSuggestions: boolean;
  reminderFrequency: 'high' | 'medium' | 'low' | 'off';
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

  // Float actions
  showFloat: () => void;
  hideFloat: () => void;
  setFloatPosition: (position: 'top-right' | 'bottom-right' | 'hidden') => void;

  // Context actions
  setContext: (context: 'capture' | 'plan' | 'engage' | 'general') => void;

  // Settings actions
  updatePreferences: (preferences: Partial<Pick<LunaState, 'lunaPersonality' | 'showProactiveSuggestions' | 'reminderFrequency'>>) => void;
  toggleSuggestions: () => void;
}

type LunaContextType = LunaState & LunaActions;

const LunaContext = createContext<LunaContextType | undefined>(undefined);

// Default Luna state
const defaultLunaState: LunaState = {
  isOpen: false,
  messages: [],
  isTyping: false,
  currentExpression: 'default',

  isFloating: true,
  floatPosition: 'top-right',

  currentContext: 'general',
  hasUnreadMessages: false,
  suggestionsEnabled: true,

  lunaPersonality: 'helpful',
  showProactiveSuggestions: true,
  reminderFrequency: 'medium',
};

interface LunaProviderProps {
  children: ReactNode;
}

export const LunaProvider: React.FC<LunaProviderProps> = ({ children }) => {
  const [state, setState] = useState<LunaState>(defaultLunaState);

  // Auto-reset expression after some time
  useEffect(() => {
    if (state.currentExpression !== 'default') {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, currentExpression: 'default' }));
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [state.currentExpression]);

  // Load Luna preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('luna-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setState(prev => ({ ...prev, ...preferences }));
      } catch (error) {
        console.warn('Failed to load Luna preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    const preferences = {
      lunaPersonality: state.lunaPersonality,
      showProactiveSuggestions: state.showProactiveSuggestions,
      reminderFrequency: state.reminderFrequency,
      suggestionsEnabled: state.suggestionsEnabled,
    };
    localStorage.setItem('luna-preferences', JSON.stringify(preferences));
  }, [state.lunaPersonality, state.showProactiveSuggestions, state.reminderFrequency, state.suggestionsEnabled]);

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

      // Simulate Luna response (in real app, this would call AI service)
      setTimeout(() => {
        const lunaResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'luna',
          content: generateLunaResponse(content, context || state.currentContext),
          timestamp: new Date(),
          context: context || state.currentContext,
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, lunaResponse],
          isTyping: false,
          currentExpression: 'happy',
          hasUnreadMessages: !prev.isOpen
        }));
      }, 1500);
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

    // Float actions
    showFloat: () => {
      setState(prev => ({ ...prev, isFloating: true }));
    },

    hideFloat: () => {
      setState(prev => ({ ...prev, isFloating: false }));
    },

    setFloatPosition: (position) => {
      setState(prev => ({ ...prev, floatPosition: position }));
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

// Helper function to generate Luna responses (placeholder for actual AI integration)
function generateLunaResponse(userMessage: string, context: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Context-aware responses
  if (context === 'capture') {
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'd love to help you capture your ideas! 🌟 Try using the quick capture buttons above, or tell me what you'd like to add and I'll guide you through it.";
    }
    return "Great! I'm here to help you capture your thoughts and ideas. What would you like to add to your productivity system? 📝";
  }

  if (context === 'plan') {
    if (lowerMessage.includes('organize') || lowerMessage.includes('plan')) {
      return "Perfect! Let me help you organize your items. 📋 I can suggest ways to group your tasks, set priorities, or create a timeline. What would work best for you?";
    }
    return "I'm here to help you plan and organize! ✨ Whether it's sorting tasks, setting priorities, or creating schedules, I've got your back.";
  }

  if (context === 'engage') {
    if (lowerMessage.includes('focus') || lowerMessage.includes('start')) {
      return "Time to get things done! 🎯 I can help you start a focus session, set a timer, or choose what to work on first. What sounds good to you?";
    }
    return "Ready to engage and be productive! 🚀 I'm here to help you stay focused and motivated. What would you like to tackle today?";
  }

  // General helpful responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello there! 👋 I'm Luna, your AI productivity companion. I'm here to help you capture ideas, plan your work, and stay engaged with your goals. How can I assist you today?";
  }

  if (lowerMessage.includes('thank')) {
    return "You're so welcome! 😊 I'm always happy to help you be more productive. Is there anything else I can assist you with?";
  }

  // Default response
  return "I'm here to help! 🦊✨ Whether you need assistance with capturing ideas, planning your work, or staying focused, just let me know what you'd like to do.";
}

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

export const useLunaFloat = () => {
  const { isFloating, floatPosition, showFloat, hideFloat, setFloatPosition } = useLuna();
  return { isFloating, floatPosition, showFloat, hideFloat, setFloatPosition };
};