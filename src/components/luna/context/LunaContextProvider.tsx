import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LunaAction } from '@/components/luna/actionsheets/types';

interface UserContext {
  currentRoute: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  userActivity: 'capture' | 'planning' | 'execution' | 'review' | 'idle';
  productivity: 'high' | 'medium' | 'low';
  recentActions: string[];
  preferences: {
    preferredActionSheetType: string;
    frequentActions: string[];
    workingHours: { start: number; end: number };
  };
}

interface LunaContextState {
  userContext: UserContext;
  contextualActions: LunaAction[];
  updateUserActivity: (activity: UserContext['userActivity']) => void;
  logAction: (actionId: string) => void;
  getSmartSuggestions: () => LunaAction[];
}

const LunaContextContext = createContext<LunaContextState | undefined>(undefined);

export const useLunaContext = () => {
  const context = useContext(LunaContextContext);
  if (!context) {
    throw new Error('useLunaContext must be used within a LunaContextProvider');
  }
  return context;
};

interface LunaContextProviderProps {
  children: React.ReactNode;
  baseActions: LunaAction[];
}

export const LunaContextProvider: React.FC<LunaContextProviderProps> = ({
  children,
  baseActions
}) => {
  const location = useLocation();
  const [userContext, setUserContext] = useState<UserContext>(() => {
    const hour = new Date().getHours();
    const day = new Date().toLocaleDateString('en', { weekday: 'long' });

    return {
      currentRoute: location.pathname,
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night',
      dayOfWeek: day,
      userActivity: 'idle',
      productivity: 'medium',
      recentActions: [],
      preferences: {
        preferredActionSheetType: 'floating-panel',
        frequentActions: [],
        workingHours: { start: 9, end: 17 }
      }
    };
  });

  const [contextualActions, setContextualActions] = useState<LunaAction[]>(baseActions);

  // Update context when route changes
  useEffect(() => {
    setUserContext(prev => ({
      ...prev,
      currentRoute: location.pathname,
      userActivity: inferActivityFromRoute(location.pathname)
    }));
  }, [location.pathname]);

  // Update time-based context
  useEffect(() => {
    const updateTimeContext = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

      setUserContext(prev => ({
        ...prev,
        timeOfDay,
        productivity: calculateProductivity(hour, prev.preferences.workingHours)
      }));
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Generate contextual actions based on current context
  useEffect(() => {
    const smartActions = generateContextualActions(baseActions, userContext);
    setContextualActions(smartActions);
  }, [baseActions, userContext]);

  const updateUserActivity = (activity: UserContext['userActivity']) => {
    setUserContext(prev => ({ ...prev, userActivity: activity }));
  };

  const logAction = (actionId: string) => {
    setUserContext(prev => ({
      ...prev,
      recentActions: [actionId, ...prev.recentActions.slice(0, 9)], // Keep last 10 actions
      preferences: {
        ...prev.preferences,
        frequentActions: updateFrequentActions(prev.preferences.frequentActions, actionId)
      }
    }));
  };

  const getSmartSuggestions = (): LunaAction[] => {
    return generateSmartSuggestions(contextualActions, userContext);
  };

  return (
    <LunaContextContext.Provider
      value={{
        userContext,
        contextualActions,
        updateUserActivity,
        logAction,
        getSmartSuggestions
      }}
    >
      {children}
    </LunaContextContext.Provider>
  );
};

// Helper functions
function inferActivityFromRoute(pathname: string): UserContext['userActivity'] {
  if (pathname.includes('/capture')) return 'capture';
  if (pathname.includes('/plan')) return 'planning';
  if (pathname.includes('/engage')) return 'execution';
  if (pathname.includes('/profile') || pathname.includes('/analytics')) return 'review';
  return 'idle';
}

function calculateProductivity(hour: number, workingHours: { start: number; end: number }): 'high' | 'medium' | 'low' {
  // Peak productivity hours: 9-11 AM, 2-4 PM
  if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) return 'high';
  if (hour >= workingHours.start && hour <= workingHours.end) return 'medium';
  return 'low';
}

function generateContextualActions(baseActions: LunaAction[], context: UserContext): LunaAction[] {
  return baseActions.map(action => {
    let priority = action.priority || 'medium';
    let relevanceScore = 1;

    // Route-based scoring
    if (context.currentRoute.includes('/capture') && action.category === 'capture') {
      relevanceScore += 2;
      priority = 'high';
    } else if (context.currentRoute.includes('/plan') && action.category === 'productivity') {
      relevanceScore += 2;
      priority = 'high';
    } else if (context.currentRoute.includes('/engage') && action.category === 'communication') {
      relevanceScore += 2;
      priority = 'high';
    }

    // Time-based scoring
    if (context.timeOfDay === 'morning' && action.category === 'capture') {
      relevanceScore += 1;
    } else if (context.timeOfDay === 'afternoon' && action.category === 'communication') {
      relevanceScore += 1;
    }

    // Productivity-based scoring
    if (context.productivity === 'high' && action.category === 'productivity') {
      relevanceScore += 1;
    }

    // Frequent actions get boost
    if (context.preferences.frequentActions.includes(action.id)) {
      relevanceScore += 1;
    }

    return {
      ...action,
      priority,
      contextScore: relevanceScore
    };
  });
}

function generateSmartSuggestions(actions: LunaAction[], context: UserContext): LunaAction[] {
  // Filter and sort actions by relevance
  const scored = actions
    .filter(action => action.contextScore && action.contextScore > 1)
    .sort((a, b) => (b.contextScore || 0) - (a.contextScore || 0));

  // Return top 3 most relevant actions
  return scored.slice(0, 3);
}

function updateFrequentActions(current: string[], newActionId: string): string[] {
  const updated = [newActionId, ...current.filter(id => id !== newActionId)];
  return updated.slice(0, 5); // Keep top 5 frequent actions
}