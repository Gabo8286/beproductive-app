import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserMode = 'creator' | 'pro' | 'adaptive';
export type UserExperience = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserPreferences {
  mode: UserMode;
  experience: UserExperience;
  showAdvancedFeatures: boolean;
  enableVoiceCommands: boolean;
  preferVisualWorkflows: boolean;
  autoSaveProjects: boolean;
  enableAIAssistance: boolean;
  interfaceComplexity: 'minimal' | 'standard' | 'full';
  notifications: {
    achievements: boolean;
    tips: boolean;
    errors: boolean;
    updates: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xl';
  };
}

export interface UserStats {
  projectsCreated: number;
  assetsGenerated: number;
  deploymentsSuccessful: number;
  aiInteractions: number;
  timeSpentInApp: number;
  featuresUsed: string[];
  lastActiveDate: Date;
  skillProgressions: {
    [skill: string]: number; // 0-100 progress
  };
}

export interface UserModeContextType {
  preferences: UserPreferences;
  stats: UserStats;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateStats: (updates: Partial<UserStats>) => void;
  switchMode: (mode: UserMode) => void;
  isCreatorMode: boolean;
  isProMode: boolean;
  isAdaptiveMode: boolean;
  shouldShowFeature: (feature: string) => boolean;
  getComplexityLevel: () => 'minimal' | 'standard' | 'full';
  trackFeatureUsage: (feature: string) => void;
  getPersonalizedTips: () => string[];
}

const defaultPreferences: UserPreferences = {
  mode: 'adaptive',
  experience: 'beginner',
  showAdvancedFeatures: false,
  enableVoiceCommands: false,
  preferVisualWorkflows: true,
  autoSaveProjects: true,
  enableAIAssistance: true,
  interfaceComplexity: 'standard',
  notifications: {
    achievements: true,
    tips: true,
    errors: true,
    updates: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 'medium'
  }
};

const defaultStats: UserStats = {
  projectsCreated: 0,
  assetsGenerated: 0,
  deploymentsSuccessful: 0,
  aiInteractions: 0,
  timeSpentInApp: 0,
  featuresUsed: [],
  lastActiveDate: new Date(),
  skillProgressions: {
    'project-management': 0,
    'ai-interaction': 0,
    'deployment': 0,
    'asset-creation': 0,
    'code-understanding': 0
  }
};

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
};

interface UserModeProviderProps {
  children: ReactNode;
}

export const UserModeProvider: React.FC<UserModeProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [stats, setStats] = useState<UserStats>(defaultStats);

  // Load user data from storage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Save user data when preferences or stats change
  useEffect(() => {
    saveUserData();
  }, [preferences, stats]);

  // Auto-detect user experience level based on usage
  useEffect(() => {
    const detectedExperience = detectExperienceLevel(stats);
    if (detectedExperience !== preferences.experience && preferences.mode === 'adaptive') {
      updatePreferences({ experience: detectedExperience });
    }
  }, [stats]);

  const loadUserData = () => {
    try {
      const storedPreferences = localStorage.getItem('spark-user-preferences');
      const storedStats = localStorage.getItem('spark-user-stats');

      if (storedPreferences) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(storedPreferences) });
      }

      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        parsedStats.lastActiveDate = new Date(parsedStats.lastActiveDate);
        setStats({ ...defaultStats, ...parsedStats });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const saveUserData = () => {
    try {
      localStorage.setItem('spark-user-preferences', JSON.stringify(preferences));
      localStorage.setItem('spark-user-stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const detectExperienceLevel = (userStats: UserStats): UserExperience => {
    const { projectsCreated, assetsGenerated, deploymentsSuccessful, featuresUsed } = userStats;
    const totalActivity = projectsCreated + assetsGenerated + deploymentsSuccessful;
    const uniqueFeatures = featuresUsed.length;

    if (totalActivity === 0) return 'beginner';
    if (totalActivity < 5 && uniqueFeatures < 10) return 'beginner';
    if (totalActivity < 20 && uniqueFeatures < 25) return 'intermediate';
    if (totalActivity < 50 && uniqueFeatures < 40) return 'advanced';
    return 'expert';
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const updateStats = (updates: Partial<UserStats>) => {
    setStats(prev => ({
      ...prev,
      ...updates,
      lastActiveDate: new Date()
    }));
  };

  const switchMode = (mode: UserMode) => {
    const modePreferences: Partial<UserPreferences> = {
      mode,
      ...(mode === 'creator' && {
        showAdvancedFeatures: false,
        preferVisualWorkflows: true,
        interfaceComplexity: 'minimal',
        enableAIAssistance: true
      }),
      ...(mode === 'pro' && {
        showAdvancedFeatures: true,
        preferVisualWorkflows: false,
        interfaceComplexity: 'full',
        enableAIAssistance: true
      })
    };

    updatePreferences(modePreferences);
  };

  const shouldShowFeature = (feature: string): boolean => {
    const complexityFeatures = {
      minimal: ['project-creation', 'ai-chat', 'templates', 'basic-deployment'],
      standard: ['asset-studio', 'platform-integrations', 'automation', 'monitoring'],
      full: ['advanced-git', 'custom-pipelines', 'team-collaboration', 'extensions', 'api-access']
    };

    const currentComplexity = getComplexityLevel();

    // Always show minimal features
    if (complexityFeatures.minimal.includes(feature)) return true;

    // Show standard features for standard and full complexity
    if (complexityFeatures.standard.includes(feature)) {
      return ['standard', 'full'].includes(currentComplexity);
    }

    // Show full features only for full complexity
    if (complexityFeatures.full.includes(feature)) {
      return currentComplexity === 'full';
    }

    // For unlisted features, use advanced features setting
    return preferences.showAdvancedFeatures;
  };

  const getComplexityLevel = (): 'minimal' | 'standard' | 'full' => {
    if (preferences.mode === 'creator') return 'minimal';
    if (preferences.mode === 'pro') return 'full';

    // Adaptive mode - base on experience
    switch (preferences.experience) {
      case 'beginner': return 'minimal';
      case 'intermediate': return 'standard';
      case 'advanced':
      case 'expert': return 'full';
      default: return 'standard';
    }
  };

  const trackFeatureUsage = (feature: string) => {
    const newFeaturesUsed = stats.featuresUsed.includes(feature)
      ? stats.featuresUsed
      : [...stats.featuresUsed, feature];

    updateStats({
      featuresUsed: newFeaturesUsed,
      aiInteractions: feature.includes('ai') ? stats.aiInteractions + 1 : stats.aiInteractions
    });

    // Update skill progressions
    const skillMappings: { [key: string]: string } = {
      'project-create': 'project-management',
      'ai-chat': 'ai-interaction',
      'asset-generate': 'asset-creation',
      'deploy': 'deployment',
      'code-review': 'code-understanding'
    };

    const skill = skillMappings[feature];
    if (skill) {
      const currentProgress = stats.skillProgressions[skill] || 0;
      const newProgress = Math.min(100, currentProgress + 2); // Increase by 2 points per use

      updateStats({
        skillProgressions: {
          ...stats.skillProgressions,
          [skill]: newProgress
        }
      });
    }
  };

  const getPersonalizedTips = (): string[] => {
    const tips: string[] = [];
    const { experience, mode } = preferences;
    const { featuresUsed, skillProgressions } = stats;

    // Experience-based tips
    if (experience === 'beginner') {
      tips.push('💡 Try using the AI chat to get help with your projects');
      tips.push('🎨 Explore the Asset Studio to create beautiful components without coding');
      tips.push('📚 Check out the templates to get started quickly');
    }

    // Feature usage tips
    if (!featuresUsed.includes('ai-chat')) {
      tips.push('🤖 Ask the AI assistant anything about your project');
    }

    if (!featuresUsed.includes('asset-generate') && mode !== 'pro') {
      tips.push('✨ Generate UI components with natural language descriptions');
    }

    if (skillProgressions['project-management'] < 50) {
      tips.push('🏗️ Create multiple projects to master project management');
    }

    // Mode-specific tips
    if (mode === 'creator') {
      tips.push('🎯 Use voice commands to speed up your workflow');
      tips.push('👁️ Try the visual workflow builder for easier automation');
    }

    if (mode === 'pro') {
      tips.push('⚡ Set up custom deployment pipelines for your workflow');
      tips.push('🔧 Explore the advanced Git features for better version control');
    }

    return tips.slice(0, 3); // Return max 3 tips
  };

  const value: UserModeContextType = {
    preferences,
    stats,
    updatePreferences,
    updateStats,
    switchMode,
    isCreatorMode: preferences.mode === 'creator',
    isProMode: preferences.mode === 'pro',
    isAdaptiveMode: preferences.mode === 'adaptive',
    shouldShowFeature,
    getComplexityLevel,
    trackFeatureUsage,
    getPersonalizedTips
  };

  return (
    <UserModeContext.Provider value={value}>
      {children}
    </UserModeContext.Provider>
  );
};