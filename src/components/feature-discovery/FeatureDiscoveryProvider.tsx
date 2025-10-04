import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureDiscovery, Feature, UserProgress } from './FeatureDiscovery';
import { FeatureTour, FeatureTourData, SAMPLE_TOURS } from './FeatureTour';
import { FeatureSpotlight, SpotlightFeature, FEATURE_SPOTLIGHTS, useFeatureSpotlight } from './FeatureSpotlight';

export interface FeatureDiscoveryState {
  // Discovery UI State
  isDiscoveryOpen: boolean;
  activeTour: FeatureTourData | null;
  userProgress: UserProgress;

  // Feature Analytics
  featureUsage: Record<string, {
    accessCount: number;
    lastAccessed: Date;
    completionTime?: number;
    rating?: number;
  }>;

  // Discovery Settings
  settings: {
    enableAutoSuggestions: boolean;
    enableSpotlights: boolean;
    showProgressTracking: boolean;
    notificationLevel: 'all' | 'important' | 'none';
  };
}

export interface FeatureDiscoveryContextValue {
  // State
  state: FeatureDiscoveryState;

  // Discovery Management
  openDiscovery: () => void;
  closeDiscovery: () => void;

  // Tour Management
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  closeTour: () => void;

  // Feature Interaction
  selectFeature: (feature: Feature) => void;
  markFeatureDiscovered: (featureId: string) => void;
  markFeatureCompleted: (featureId: string) => void;
  toggleFeatureBookmark: (featureId: string) => void;
  rateFeature: (featureId: string, rating: number) => void;

  // Spotlight Management
  showSpotlight: (featureId: string) => void;
  hideSpotlight: () => void;
  queueSpotlight: (featureId: string) => void;

  // Suggestions & Analytics
  getSuggestedFeatures: () => Feature[];
  getPersonalizedRecommendations: () => Feature[];
  trackFeatureUsage: (featureId: string, duration?: number) => void;

  // Settings
  updateSettings: (settings: Partial<FeatureDiscoveryState['settings']>) => void;
}

const FeatureDiscoveryContext = createContext<FeatureDiscoveryContextValue | null>(null);

interface FeatureDiscoveryProviderProps {
  children: ReactNode;
  initialUserProgress?: UserProgress;
  enablePersistence?: boolean;
}

const DEFAULT_USER_PROGRESS: UserProgress = {
  discoveredFeatures: [],
  completedFeatures: [],
  bookmarkedFeatures: []
};

const DEFAULT_SETTINGS: FeatureDiscoveryState['settings'] = {
  enableAutoSuggestions: true,
  enableSpotlights: true,
  showProgressTracking: true,
  notificationLevel: 'important'
};

const STORAGE_KEYS = {
  userProgress: 'feature-discovery-progress',
  featureUsage: 'feature-discovery-usage',
  settings: 'feature-discovery-settings'
};

export const FeatureDiscoveryProvider: React.FC<FeatureDiscoveryProviderProps> = ({
  children,
  initialUserProgress = DEFAULT_USER_PROGRESS,
  enablePersistence = true
}) => {
  // Core State
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<FeatureTourData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.userProgress);
      return stored ? JSON.parse(stored) : initialUserProgress;
    }
    return initialUserProgress;
  });

  const [featureUsage, setFeatureUsage] = useState<FeatureDiscoveryState['featureUsage']>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.featureUsage);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  const [settings, setSettings] = useState<FeatureDiscoveryState['settings']>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.settings);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  // Spotlight Management
  const spotlight = useFeatureSpotlight();

  // Persistence Effect
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.userProgress, JSON.stringify(userProgress));
    }
  }, [userProgress, enablePersistence]);

  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.featureUsage, JSON.stringify(featureUsage));
    }
  }, [featureUsage, enablePersistence]);

  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    }
  }, [settings, enablePersistence]);

  // Discovery Management
  const openDiscovery = () => setIsDiscoveryOpen(true);
  const closeDiscovery = () => setIsDiscoveryOpen(false);

  // Tour Management
  const startTour = (tourId: string) => {
    const tour = SAMPLE_TOURS[tourId];
    if (tour) {
      setActiveTour(tour);
      trackFeatureUsage(tourId);
    }
  };

  const completeTour = (tourId: string) => {
    markFeatureCompleted(tourId);
    setActiveTour(null);

    // Show completion spotlight if enabled
    if (settings.enableSpotlights) {
      setTimeout(() => {
        spotlight.showSpotlight('completion-celebration');
      }, 1000);
    }
  };

  const closeTour = () => setActiveTour(null);

  // Feature Interaction
  const selectFeature = (feature: Feature) => {
    markFeatureDiscovered(feature.id);
    trackFeatureUsage(feature.id);

    // Handle feature-specific actions
    if (feature.demoUrl) {
      // Navigate to demo or open in new tab
      window.open(feature.demoUrl, '_blank');
    }
  };

  const markFeatureDiscovered = (featureId: string) => {
    setUserProgress(prev => ({
      ...prev,
      discoveredFeatures: prev.discoveredFeatures.includes(featureId)
        ? prev.discoveredFeatures
        : [...prev.discoveredFeatures, featureId]
    }));
  };

  const markFeatureCompleted = (featureId: string) => {
    setUserProgress(prev => ({
      ...prev,
      completedFeatures: prev.completedFeatures.includes(featureId)
        ? prev.completedFeatures
        : [...prev.completedFeatures, featureId],
      discoveredFeatures: prev.discoveredFeatures.includes(featureId)
        ? prev.discoveredFeatures
        : [...prev.discoveredFeatures, featureId]
    }));
  };

  const toggleFeatureBookmark = (featureId: string) => {
    setUserProgress(prev => ({
      ...prev,
      bookmarkedFeatures: prev.bookmarkedFeatures.includes(featureId)
        ? prev.bookmarkedFeatures.filter(id => id !== featureId)
        : [...prev.bookmarkedFeatures, featureId]
    }));
  };

  const rateFeature = (featureId: string, rating: number) => {
    setFeatureUsage(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        rating,
        accessCount: (prev[featureId]?.accessCount || 0) + 1,
        lastAccessed: new Date()
      }
    }));
  };

  // Spotlight Management
  const showSpotlight = (featureId: string) => {
    if (settings.enableSpotlights) {
      spotlight.showSpotlight(featureId);
      trackFeatureUsage(featureId);
    }
  };

  const hideSpotlight = spotlight.hideSpotlight;
  const queueSpotlight = spotlight.queueSpotlight;

  // Analytics & Tracking
  const trackFeatureUsage = (featureId: string, duration?: number) => {
    setFeatureUsage(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        accessCount: (prev[featureId]?.accessCount || 0) + 1,
        lastAccessed: new Date(),
        ...(duration && { completionTime: duration })
      }
    }));
  };

  // Recommendations & Suggestions
  const getSuggestedFeatures = (): Feature[] => {
    // Simple algorithm based on completion status and difficulty
    const allFeatures = Object.values(SAMPLE_TOURS).map(tour => ({
      id: tour.id,
      title: tour.title,
      description: tour.description,
      category: tour.category as any,
      difficulty: tour.difficulty,
      estimatedTime: tour.estimatedTime,
      benefits: tour.learningObjectives,
      prerequisites: tour.prerequisites
    }));

    return allFeatures
      .filter(feature => !userProgress.completedFeatures.includes(feature.id))
      .filter(feature => {
        // Check if prerequisites are met
        if (feature.prerequisites) {
          return feature.prerequisites.every(prereq =>
            userProgress.completedFeatures.includes(prereq)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Prioritize by difficulty (easier first for beginners)
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, 5);
  };

  const getPersonalizedRecommendations = (): Feature[] => {
    const suggested = getSuggestedFeatures();
    const usage = featureUsage;

    // Enhance suggestions with usage data
    return suggested
      .map(feature => ({
        ...feature,
        score: calculateRecommendationScore(feature, usage, userProgress)
      }))
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 3);
  };

  const calculateRecommendationScore = (
    feature: Feature,
    usage: FeatureDiscoveryState['featureUsage'],
    progress: UserProgress
  ): number => {
    let score = 0;

    // Base score by difficulty (easier = higher score for new users)
    const completedCount = progress.completedFeatures.length;
    if (completedCount < 3 && feature.difficulty === 'beginner') score += 10;
    else if (completedCount >= 3 && feature.difficulty === 'intermediate') score += 8;
    else if (completedCount >= 6 && feature.difficulty === 'advanced') score += 6;

    // Boost score if related features are used
    if (feature.prerequisites) {
      const metPrereqs = feature.prerequisites.filter(prereq =>
        progress.completedFeatures.includes(prereq)
      ).length;
      score += metPrereqs * 3;
    }

    // Reduce score if recently accessed
    const recentAccess = usage[feature.id]?.lastAccessed;
    if (recentAccess) {
      const daysSinceAccess = (Date.now() - new Date(recentAccess).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) score -= 5;
    }

    return score;
  };

  // Settings
  const updateSettings = (newSettings: Partial<FeatureDiscoveryState['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // State Object
  const state: FeatureDiscoveryState = {
    isDiscoveryOpen,
    activeTour,
    userProgress,
    featureUsage,
    settings
  };

  // Context Value
  const contextValue: FeatureDiscoveryContextValue = {
    state,
    openDiscovery,
    closeDiscovery,
    startTour,
    completeTour,
    closeTour,
    selectFeature,
    markFeatureDiscovered,
    markFeatureCompleted,
    toggleFeatureBookmark,
    rateFeature,
    showSpotlight,
    hideSpotlight,
    queueSpotlight,
    getSuggestedFeatures,
    getPersonalizedRecommendations,
    trackFeatureUsage,
    updateSettings
  };

  return (
    <FeatureDiscoveryContext.Provider value={contextValue}>
      {children}

      {/* Render Discovery Components */}
      {isDiscoveryOpen && (
        <FeatureDiscovery
          onFeatureSelect={selectFeature}
          onClose={closeDiscovery}
          userProgress={userProgress}
        />
      )}

      {activeTour && (
        <FeatureTour
          tourData={activeTour}
          onComplete={completeTour}
          onClose={closeTour}
          autoPlay={false}
          showProgress={settings.showProgressTracking}
        />
      )}

      {spotlight.currentSpotlight && (
        <FeatureSpotlight
          feature={spotlight.currentSpotlight}
          onClose={hideSpotlight}
          onStartDemo={(featureId) => {
            hideSpotlight();
            startTour(featureId);
          }}
          onStartTutorial={(featureId) => {
            hideSpotlight();
            startTour(featureId);
          }}
          onExploreRelated={(featureId) => {
            hideSpotlight();
            openDiscovery();
          }}
          showUsageStats={true}
          position="center"
        />
      )}
    </FeatureDiscoveryContext.Provider>
  );
};

// Hook for using the Feature Discovery context
export const useFeatureDiscovery = (): FeatureDiscoveryContextValue => {
  const context = useContext(FeatureDiscoveryContext);
  if (!context) {
    throw new Error('useFeatureDiscovery must be used within a FeatureDiscoveryProvider');
  }
  return context;
};

// Higher-order component for feature discovery integration
export const withFeatureDiscovery = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const discovery = useFeatureDiscovery();
    return <Component {...props} featureDiscovery={discovery} />;
  };
};

// Hook for automatic feature suggestions based on current route/context
export const useContextualSuggestions = (context: string) => {
  const { getSuggestedFeatures, state, showSpotlight } = useFeatureDiscovery();
  const [suggestions, setSuggestions] = useState<Feature[]>([]);

  useEffect(() => {
    if (state.settings.enableAutoSuggestions) {
      const contextualFeatures = getSuggestedFeatures()
        .filter(feature => feature.category === context ||
          feature.title.toLowerCase().includes(context.toLowerCase()));

      setSuggestions(contextualFeatures.slice(0, 2));

      // Auto-show spotlight for highly relevant features
      if (contextualFeatures.length > 0 && state.settings.enableSpotlights) {
        const topFeature = contextualFeatures[0];
        // Show spotlight with a delay to avoid overwhelming the user
        setTimeout(() => {
          showSpotlight(topFeature.id);
        }, 3000);
      }
    }
  }, [context, state.settings.enableAutoSuggestions, state.settings.enableSpotlights, getSuggestedFeatures, showSpotlight, state]);

  return suggestions;
};