/**
 * Enhanced Navigation Context Hook
 * Provides intelligent context detection for the Luna orbital navigation system
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLuna } from '@/components/luna/context/LunaContext';
import {
  EnhancedNavigationContext,
  TemporalContext,
  WorkflowState,
  NavigationPreferences,
  UserRole,
  NavigationHubId
} from '@/types/navigation';

// Default navigation preferences
const DEFAULT_PREFERENCES: NavigationPreferences = {
  hubOrder: [
    'capture-productivity',
    'planning-time',
    'engage-collaboration',
    'profile-user',
    'insights-growth',
    'advanced-admin',
    'search-assistant'
  ],
  favoriteQuickActions: [],
  hiddenHubs: [],
  customShortcuts: {},
  animationLevel: 'full',
  hapticFeedback: true,
  voiceCommands: false,
  autoContextSwitching: true,
};

/**
 * Hook for enhanced navigation context detection
 */
export function useEnhancedNavigationContext(): {
  context: EnhancedNavigationContext;
  updateWorkflowState: (state: WorkflowState) => void;
  updatePreferences: (preferences: Partial<NavigationPreferences>) => void;
  isLoading: boolean;
} {
  const location = useLocation();
  const { user } = useAuth();
  const { currentContext } = useLuna();

  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const [preferences, setPreferences] = useState<NavigationPreferences>(DEFAULT_PREFERENCES);
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user role
  const userRole: UserRole = useMemo(() => {
    if (!user) return 'user';

    // Check user metadata for role
    const role = user.user_metadata?.role || user.app_metadata?.role;
    if (['super_admin', 'admin', 'enterprise', 'team_lead'].includes(role)) {
      return role as UserRole;
    }

    return 'user';
  }, [user]);

  // Get temporal context based on current time
  const timeContext: TemporalContext = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: TemporalContext['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const workingHours = hour >= 9 && hour <= 17 && !isWeekend;

    return {
      timeOfDay,
      dayOfWeek: isWeekend ? 'weekend' : 'weekday',
      workingHours,
      upcomingDeadlines: [], // TODO: Integrate with task/goal system
      scheduleOverview: workingHours ? 'busy' : 'free',
    };
  }, []);

  // Determine current hub based on path
  const currentHub: NavigationHubId | null = useMemo(() => {
    const path = location.pathname;

    if (path.includes('/app/capture') || path.includes('/tasks')) {
      return 'capture-productivity';
    }
    if (path.includes('/app/plan') || path.includes('/calendar') || path.includes('/goals')) {
      return 'planning-time';
    }
    if (path.includes('/app/engage') || path.includes('/team')) {
      return 'engage-collaboration';
    }
    if (path.includes('/app/profile') || path.includes('/settings') || path.includes('/account')) {
      return 'profile-user';
    }
    if (path.includes('/analytics') || path.includes('/ai-insights') || path.includes('/gamification')) {
      return 'insights-growth';
    }
    if (path.includes('/admin') || path.includes('/enterprise')) {
      return 'advanced-admin';
    }
    if (path.includes('/search') || path.includes('/assistant') || path.includes('/luna')) {
      return 'search-assistant';
    }

    return null;
  }, [location.pathname]);

  // Detect workflow state based on user behavior and context
  const detectWorkflowState = useCallback((): WorkflowState => {
    const path = location.pathname;
    const hour = new Date().getHours();

    // Morning planning pattern
    if (hour >= 8 && hour <= 10 && (path.includes('/plan') || path.includes('/calendar'))) {
      return 'planning';
    }

    // Active work hours
    if (hour >= 10 && hour <= 16 && (
      path.includes('/tasks') ||
      path.includes('/projects') ||
      path.includes('/app/capture')
    )) {
      return 'executing';
    }

    // Team/collaboration context
    if (path.includes('/team') || path.includes('/engage') || path.includes('/meetings')) {
      return 'collaborating';
    }

    // Evening review/analysis
    if (hour >= 17 && hour <= 19 && (
      path.includes('/analytics') ||
      path.includes('/insights') ||
      path.includes('/reflections')
    )) {
      return 'reviewing';
    }

    // Learning/development context
    if (path.includes('/profile-assessment') || path.includes('/habits') || path.includes('/gamification')) {
      return 'learning';
    }

    return 'idle';
  }, [location.pathname]);

  // Update recent pages
  useEffect(() => {
    setRecentPages(prev => {
      const newPages = [location.pathname, ...prev.filter(p => p !== location.pathname)];
      return newPages.slice(0, 10); // Keep last 10 pages
    });
  }, [location.pathname]);

  // Auto-detect workflow state changes
  useEffect(() => {
    const detectedState = detectWorkflowState();
    if (detectedState !== workflowState && preferences.autoContextSwitching) {
      setWorkflowState(detectedState);
    }
  }, [location.pathname, detectWorkflowState, workflowState, preferences.autoContextSwitching]);

  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = localStorage.getItem('luna-navigation-preferences');
        if (stored) {
          const parsedPreferences = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
        }
      } catch (error) {
        console.error('Failed to load navigation preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('luna-navigation-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save navigation preferences:', error);
      }
    }
  }, [preferences, isLoading]);

  // Get mock data for unread notifications and active projects
  // TODO: Replace with real data from respective services
  const getContextualData = useMemo(() => {
    return {
      unreadNotifications: 3, // Mock data
      upcomingTasks: 5, // Mock data
      activeProjects: ['project-1', 'project-2'], // Mock data
    };
  }, []);

  // Build enhanced navigation context
  const context: EnhancedNavigationContext = useMemo(() => ({
    currentHub,
    currentPage: location.pathname,
    userRole,
    workflowState,
    timeContext,
    userPreferences: preferences,
    recentPages,
    activeProjects: getContextualData.activeProjects,
    upcomingTasks: getContextualData.upcomingTasks,
    unreadNotifications: getContextualData.unreadNotifications,
  }), [
    currentHub,
    location.pathname,
    userRole,
    workflowState,
    timeContext,
    preferences,
    recentPages,
    getContextualData
  ]);

  // Update workflow state manually
  const updateWorkflowState = useCallback((state: WorkflowState) => {
    setWorkflowState(state);
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<NavigationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  return {
    context,
    updateWorkflowState,
    updatePreferences,
    isLoading,
  };
}

/**
 * Hook for simplified context detection (backward compatibility)
 */
export function useNavigationContext() {
  const { context } = useEnhancedNavigationContext();

  return {
    currentPage: context.currentPage,
    currentHub: context.currentHub,
    userRole: context.userRole,
    workflowState: context.workflowState,
  };
}

/**
 * Hook for temporal context awareness
 */
export function useTemporalContext() {
  const { context } = useEnhancedNavigationContext();
  return context.timeContext;
}

/**
 * Hook for navigation preferences management
 */
export function useNavigationPreferences() {
  const { context, updatePreferences } = useEnhancedNavigationContext();

  return {
    preferences: context.userPreferences,
    updatePreferences,
    resetToDefaults: () => updatePreferences(DEFAULT_PREFERENCES),
  };
}