/**
 * Smart Navigation Suggestions Hook
 * React hook for integrating AI-powered navigation suggestions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnhancedNavigationContext } from './useEnhancedNavigationContext';
import {
  smartNavigationSuggestionsService,
  NavigationSuggestion,
  UserBehaviorPattern,
  SuggestionRule
} from '@/services/SmartNavigationSuggestionsService';
import { NavigationHubId } from '@/types/navigation';

interface SmartSuggestionsState {
  suggestions: NavigationSuggestion[];
  isLoading: boolean;
  lastUpdated: Date | null;
  preloadHubs: NavigationHubId[];
}

interface SmartSuggestionsActions {
  refreshSuggestions: () => void;
  recordNavigation: (hubId: NavigationHubId, duration?: number) => void;
  executeSuggestion: (suggestion: NavigationSuggestion) => void;
  dismissSuggestion: (suggestionId: string) => void;
  getBehaviorAnalytics: () => ReturnType<typeof smartNavigationSuggestionsService.getBehaviorAnalytics>;
}

export function useSmartNavigationSuggestions(): SmartSuggestionsState & SmartSuggestionsActions {
  const { context } = useEnhancedNavigationContext();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [suggestions, setSuggestions] = useState<NavigationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  // Generate suggestions based on current context
  const generateSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Small delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const rawSuggestions = smartNavigationSuggestionsService.generateSuggestions(context);

      // Filter out dismissed suggestions
      const filteredSuggestions = rawSuggestions.filter(s =>
        !dismissedSuggestions.has(s.id)
      );

      setSuggestions(filteredSuggestions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [context, dismissedSuggestions]);

  // Get predictive suggestions for preloading
  const preloadHubs = useMemo(() => {
    return smartNavigationSuggestionsService.getPredictiveSuggestions(context);
  }, [context]);

  // Record navigation behavior when location changes
  useEffect(() => {
    const currentHub = context.currentHub;
    if (currentHub) {
      // Calculate session duration
      const now = new Date();
      const duration = now.getTime() - sessionStartTime.getTime();

      // Only record if session was longer than 10 seconds (meaningful interaction)
      if (duration > 10000) {
        smartNavigationSuggestionsService.recordNavigation(currentHub, context, duration);
      }

      // Reset session timer
      setSessionStartTime(now);
    }
  }, [location.pathname, context, sessionStartTime]);

  // Auto-refresh suggestions when context changes significantly
  useEffect(() => {
    const shouldRefresh =
      !lastUpdated ||
      (new Date().getTime() - lastUpdated.getTime()) > 300000; // 5 minutes

    if (shouldRefresh) {
      generateSuggestions();
    }
  }, [context.workflowState, context.timeContext.timeOfDay, generateSuggestions, lastUpdated]);

  // Actions
  const refreshSuggestions = useCallback(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  const recordNavigation = useCallback((hubId: NavigationHubId, duration?: number) => {
    smartNavigationSuggestionsService.recordNavigation(hubId, context, duration);
  }, [context]);

  const executeSuggestion = useCallback((suggestion: NavigationSuggestion) => {
    // Execute the suggestion action
    if (suggestion.action) {
      suggestion.action();
    } else if (suggestion.path) {
      navigate(suggestion.path);
    }

    // Record this as a successful suggestion
    if (suggestion.hubId) {
      recordNavigation(suggestion.hubId, 0);
    }

    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [navigate, recordNavigation]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  const getBehaviorAnalytics = useCallback(() => {
    return smartNavigationSuggestionsService.getBehaviorAnalytics();
  }, []);

  // Initial load
  useEffect(() => {
    generateSuggestions();
  }, []); // Only run once on mount

  return {
    // State
    suggestions,
    isLoading,
    lastUpdated,
    preloadHubs,

    // Actions
    refreshSuggestions,
    recordNavigation,
    executeSuggestion,
    dismissSuggestion,
    getBehaviorAnalytics,
  };
}

/**
 * Hook for managing suggestion rules (admin use)
 */
export function useSmartSuggestionsAdmin() {
  const addCustomRule = useCallback((rule: SuggestionRule) => {
    smartNavigationSuggestionsService.addSuggestionRule(rule);
  }, []);

  const getBehaviorAnalytics = useCallback(() => {
    return smartNavigationSuggestionsService.getBehaviorAnalytics();
  }, []);

  return {
    addCustomRule,
    getBehaviorAnalytics,
  };
}

/**
 * Hook for temporal awareness suggestions
 */
export function useTemporalNavigationSuggestions() {
  const { context } = useEnhancedNavigationContext();

  const getTimeBasedSuggestions = useCallback(() => {
    const hour = new Date().getHours();
    const suggestions: NavigationSuggestion[] = [];

    // Morning suggestions (7-11 AM)
    if (hour >= 7 && hour <= 11) {
      suggestions.push({
        id: 'morning-planning',
        type: 'hub',
        title: 'Morning Planning',
        description: 'Start your day with goal setting and task review',
        hubId: 'planning-time',
        path: '/app/plan',
        confidence: 0.8,
        reasoning: 'Optimal time for planning and goal setting',
        priority: 'high',
        category: 'temporal'
      });
    }

    // Afternoon focus (1-4 PM)
    if (hour >= 13 && hour <= 16) {
      suggestions.push({
        id: 'afternoon-focus',
        type: 'hub',
        title: 'Deep Work Session',
        description: 'Your most productive hours for focused work',
        hubId: 'capture-productivity',
        path: '/app/capture',
        confidence: 0.9,
        reasoning: 'Peak afternoon focus period',
        priority: 'high',
        category: 'temporal'
      });
    }

    // Evening review (5-8 PM)
    if (hour >= 17 && hour <= 20) {
      suggestions.push({
        id: 'evening-review',
        type: 'hub',
        title: 'Daily Reflection',
        description: 'Review accomplishments and plan tomorrow',
        hubId: 'insights-growth',
        path: '/analytics',
        confidence: 0.7,
        reasoning: 'Ideal time for reflection and learning',
        priority: 'medium',
        category: 'temporal'
      });
    }

    return suggestions;
  }, []);

  return {
    getTimeBasedSuggestions,
    currentTimeContext: context.timeContext
  };
}