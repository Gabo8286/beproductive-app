// Adaptive Interface Hook - Dynamic UI responses based on productivity state
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProductivityState } from '@/utils/productivityState';
import { useAppConfig } from '@/hooks/useAppConfig';
import type { ProductivityState } from '@/utils/productivityState';

export interface AdaptiveUIState {
  layout: 'focused' | 'minimal' | 'comprehensive' | 'planning';
  colorScheme: 'normal' | 'focus' | 'calm' | 'energizing';
  animations: 'full' | 'reduced' | 'minimal';
  notifications: 'all' | 'important' | 'none';
  distractionLevel: 'low' | 'medium' | 'high';
  suggestedWidgets: string[];
  hiddenElements: string[];
  priorityBoosts: Record<string, number>;
}

export interface AdaptationConfig {
  autoAdapt: boolean;
  adaptationSpeed: 'immediate' | 'gradual' | 'manual';
  preserveUserChoices: boolean;
  respectTimePreferences: boolean;
  confidenceThreshold: number;
}

export function useAdaptiveInterface(config?: Partial<AdaptationConfig>) {
  const { getCurrentState, trackAction } = useProductivityState();
  const { updateColors, colors, features } = useAppConfig();

  const [productivityState, setProductivityState] = useState<ProductivityState | null>(null);
  const [adaptiveUI, setAdaptiveUI] = useState<AdaptiveUIState>(getDefaultUIState());
  const [isAdapting, setIsAdapting] = useState(false);
  const [userOverrides, setUserOverrides] = useState<Record<string, any>>({});

  const adaptationConfig: AdaptationConfig = {
    autoAdapt: true,
    adaptationSpeed: 'gradual',
    preserveUserChoices: true,
    respectTimePreferences: true,
    confidenceThreshold: 0.6,
    ...config
  };

  // Update productivity state periodically
  useEffect(() => {
    const updateState = async () => {
      try {
        const state = await getCurrentState();
        setProductivityState(state);

        if (adaptationConfig.autoAdapt && state.confidence >= adaptationConfig.confidenceThreshold) {
          adaptInterface(state);
        }
      } catch (error) {
        console.warn('Failed to get productivity state:', error);
      }
    };

    updateState();
    const interval = setInterval(updateState, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [adaptationConfig.autoAdapt, adaptationConfig.confidenceThreshold]);

  // Main adaptation logic
  const adaptInterface = useCallback(async (state: ProductivityState) => {
    if (!adaptationConfig.autoAdapt) return;

    setIsAdapting(true);
    trackAction('interface-adaptation', `state-${state.currentState}`);

    try {
      const newUIState = calculateAdaptiveUIState(state, adaptationConfig);
      const mergedState = mergeWithUserPreferences(newUIState, userOverrides, adaptationConfig);

      if (adaptationConfig.adaptationSpeed === 'immediate') {
        setAdaptiveUI(mergedState);
        await applyUIChanges(mergedState);
      } else {
        await graduallyAdaptUI(mergedState);
      }

      console.log('🎨 Interface adapted for state:', state.currentState, mergedState);
    } catch (error) {
      console.error('Failed to adapt interface:', error);
    } finally {
      setIsAdapting(false);
    }
  }, [adaptationConfig, userOverrides, trackAction, updateColors]);

  // Calculate what the UI should look like based on productivity state
  const calculateAdaptiveUIState = (state: ProductivityState, config: AdaptationConfig): AdaptiveUIState => {
    const stateAdaptations: Record<string, Partial<AdaptiveUIState>> = {
      'focused': {
        layout: 'focused',
        colorScheme: 'focus',
        animations: 'minimal',
        notifications: 'none',
        distractionLevel: 'low',
        suggestedWidgets: ['timer', 'current-task', 'progress'],
        hiddenElements: ['social-feed', 'notifications-panel', 'secondary-nav'],
        priorityBoosts: { 'current-task': 2.0, 'timer': 1.5 }
      },
      'deep-work': {
        layout: 'minimal',
        colorScheme: 'focus',
        animations: 'minimal',
        notifications: 'none',
        distractionLevel: 'low',
        suggestedWidgets: ['timer', 'current-task'],
        hiddenElements: ['all-notifications', 'social-elements', 'news-feed', 'chat'],
        priorityBoosts: { 'current-task': 3.0, 'timer': 2.0 }
      },
      'distracted': {
        layout: 'minimal',
        colorScheme: 'calm',
        animations: 'reduced',
        notifications: 'important',
        distractionLevel: 'high',
        suggestedWidgets: ['breathing-exercise', 'focus-timer', 'simple-task-list'],
        hiddenElements: ['complex-widgets', 'charts', 'detailed-analytics'],
        priorityBoosts: { 'breathing-exercise': 2.0, 'focus-timer': 1.8 }
      },
      'overwhelmed': {
        layout: 'minimal',
        colorScheme: 'calm',
        animations: 'minimal',
        notifications: 'none',
        distractionLevel: 'high',
        suggestedWidgets: ['priority-tasks', 'breathing-exercise', 'simple-calendar'],
        hiddenElements: ['detailed-stats', 'secondary-features', 'advanced-options'],
        priorityBoosts: { 'priority-tasks': 2.5, 'breathing-exercise': 2.0 }
      },
      'tired': {
        layout: 'comprehensive',
        colorScheme: 'calm',
        animations: 'reduced',
        notifications: 'important',
        distractionLevel: 'medium',
        suggestedWidgets: ['easy-tasks', 'energy-tips', 'break-timer'],
        hiddenElements: ['complex-tasks', 'high-concentration-widgets'],
        priorityBoosts: { 'easy-tasks': 1.8, 'break-timer': 1.5 }
      },
      'planning': {
        layout: 'comprehensive',
        colorScheme: 'normal',
        animations: 'full',
        notifications: 'all',
        distractionLevel: 'low',
        suggestedWidgets: ['calendar', 'task-organizer', 'goals', 'analytics'],
        hiddenElements: [],
        priorityBoosts: { 'calendar': 1.8, 'task-organizer': 1.6, 'goals': 1.4 }
      },
      'energized': {
        layout: 'comprehensive',
        colorScheme: 'energizing',
        animations: 'full',
        notifications: 'all',
        distractionLevel: 'low',
        suggestedWidgets: ['challenging-tasks', 'goal-progress', 'analytics', 'new-projects'],
        hiddenElements: [],
        priorityBoosts: { 'challenging-tasks': 2.0, 'goal-progress': 1.5 }
      }
    };

    const baseState = getDefaultUIState();
    const stateOverrides = stateAdaptations[state.currentState] || {};

    return { ...baseState, ...stateOverrides };
  };

  // Apply UI changes gradually for smooth transitions
  const graduallyAdaptUI = async (targetState: AdaptiveUIState) => {
    const steps = 5;
    const delay = 200; // ms between steps

    for (let step = 1; step <= steps; step++) {
      const progress = step / steps;
      const interpolatedState = interpolateUIStates(adaptiveUI, targetState, progress);

      setAdaptiveUI(interpolatedState);

      if (step < steps) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    await applyUIChanges(targetState);
  };

  // Apply actual UI changes (colors, theme, etc.)
  const applyUIChanges = async (uiState: AdaptiveUIState) => {
    try {
      // Apply color scheme changes
      const colorUpdates = getColorUpdatesForScheme(uiState.colorScheme);
      if (Object.keys(colorUpdates).length > 0) {
        updateColors(colorUpdates);
      }

      // Apply CSS classes for animations and layout
      document.body.className = document.body.className
        .replace(/adaptive-\w+/g, '')
        .concat(` adaptive-${uiState.layout} adaptive-${uiState.animations} adaptive-${uiState.colorScheme}`);

      // Store state for other components to use
      document.body.setAttribute('data-adaptive-layout', uiState.layout);
      document.body.setAttribute('data-adaptive-scheme', uiState.colorScheme);
      document.body.setAttribute('data-distraction-level', uiState.distractionLevel);

    } catch (error) {
      console.error('Failed to apply UI changes:', error);
    }
  };

  // Get color updates for different schemes
  const getColorUpdatesForScheme = (scheme: string) => {
    const colorSchemes = {
      focus: {
        primary: '#2563eb', // Deeper blue for focus
        background: '#fefefe', // Slightly warmer white
        surface: '#f8fafc',
      },
      calm: {
        primary: '#059669', // Calming green
        background: '#f9fafb',
        surface: '#f3f4f6',
      },
      energizing: {
        primary: '#dc2626', // Energizing red
        accent: '#f59e0b', // Bright orange accent
      },
      normal: {} // Use default colors
    };

    return colorSchemes[scheme as keyof typeof colorSchemes] || {};
  };

  // Interpolate between UI states for smooth transitions
  const interpolateUIStates = (from: AdaptiveUIState, to: AdaptiveUIState, progress: number): AdaptiveUIState => {
    // For now, use simple step interpolation
    // In the future, could implement smooth numerical interpolation
    if (progress < 0.5) return from;
    return to;
  };

  // Merge calculated state with user preferences
  const mergeWithUserPreferences = (
    calculatedState: AdaptiveUIState,
    overrides: Record<string, any>,
    config: AdaptationConfig
  ): AdaptiveUIState => {
    if (!config.preserveUserChoices) return calculatedState;

    return {
      ...calculatedState,
      ...overrides,
      // Always preserve certain user choices
      notifications: overrides.notifications || calculatedState.notifications,
      animations: overrides.animations || calculatedState.animations,
    };
  };

  // Manual override functions
  const overrideLayout = useCallback((layout: AdaptiveUIState['layout']) => {
    setUserOverrides(prev => ({ ...prev, layout }));
    setAdaptiveUI(prev => ({ ...prev, layout }));
    trackAction('manual-layout-override', layout);
  }, [trackAction]);

  const overrideColorScheme = useCallback((colorScheme: AdaptiveUIState['colorScheme']) => {
    setUserOverrides(prev => ({ ...prev, colorScheme }));
    setAdaptiveUI(prev => ({ ...prev, colorScheme }));
    applyUIChanges({ ...adaptiveUI, colorScheme });
    trackAction('manual-color-override', colorScheme);
  }, [adaptiveUI, trackAction]);

  const overrideAnimations = useCallback((animations: AdaptiveUIState['animations']) => {
    setUserOverrides(prev => ({ ...prev, animations }));
    setAdaptiveUI(prev => ({ ...prev, animations }));
    trackAction('manual-animation-override', animations);
  }, [trackAction]);

  const toggleAutoAdaptation = useCallback(() => {
    adaptationConfig.autoAdapt = !adaptationConfig.autoAdapt;
    trackAction('toggle-auto-adaptation', adaptationConfig.autoAdapt.toString());
  }, [trackAction]);

  // Computed values for components to use
  const shouldShowWidget = useCallback((widgetId: string): boolean => {
    if (adaptiveUI.hiddenElements.includes(widgetId)) return false;
    return true;
  }, [adaptiveUI.hiddenElements]);

  const getWidgetPriority = useCallback((widgetId: string): number => {
    return adaptiveUI.priorityBoosts[widgetId] || 1.0;
  }, [adaptiveUI.priorityBoosts]);

  const isInFocusMode = useMemo(() => {
    return adaptiveUI.layout === 'focused' || adaptiveUI.layout === 'minimal';
  }, [adaptiveUI.layout]);

  const shouldReduceAnimations = useMemo(() => {
    return adaptiveUI.animations !== 'full';
  }, [adaptiveUI.animations]);

  const currentDistractionLevel = useMemo(() => {
    return adaptiveUI.distractionLevel;
  }, [adaptiveUI.distractionLevel]);

  return {
    // State
    productivityState,
    adaptiveUI,
    isAdapting,
    isInFocusMode,
    shouldReduceAnimations,
    currentDistractionLevel,

    // Configuration
    config: adaptationConfig,

    // Manual overrides
    overrideLayout,
    overrideColorScheme,
    overrideAnimations,
    toggleAutoAdaptation,

    // Utility functions
    shouldShowWidget,
    getWidgetPriority,
    adaptInterface: (state: ProductivityState) => adaptInterface(state),

    // Suggested actions based on current state
    suggestedActions: productivityState?.suggestedActions || [],
    contextualTips: productivityState?.contextualTips || [],
  };
}

// Helper function to get default UI state
function getDefaultUIState(): AdaptiveUIState {
  return {
    layout: 'comprehensive',
    colorScheme: 'normal',
    animations: 'full',
    notifications: 'all',
    distractionLevel: 'low',
    suggestedWidgets: [],
    hiddenElements: [],
    priorityBoosts: {}
  };
}