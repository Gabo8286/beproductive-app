import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  FRAMEWORK_OVERVIEW,
  CORE_PRINCIPLES,
  IMPLEMENTATION_STAGES,
  RECOVERY_LEVELS,
  LUNA_CAPABILITIES,
  LUNA_COMMANDS,
  SUCCESS_METRICS,
  LUNA_PERSONALITY,
  PRACTICE_TEMPLATES,
  type FrameworkPrinciple,
  type ImplementationStage,
  type RecoveryLevel,
  type LunaCapability,
  type ProductivityMetric,
} from '@/components/luna/framework/LunaFrameworkDocumentation';

// Framework-specific interfaces
interface UserProductivityProfile {
  currentStage: 'foundation' | 'optimization' | 'mastery' | 'sustainability';
  weekInStage: number;
  completedPrinciples: string[];
  currentMetrics: UserMetric[];
  lastAssessment: Date | null;
  wellBeingScore: number; // 1-10 scale
  systemHealthScore: number; // 1-10 scale
  energyPattern: EnergyLevel[];
}

interface UserMetric {
  metricId: string;
  category: string;
  name: string;
  currentValue: number;
  target: string;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

interface EnergyLevel {
  hour: number; // 0-23
  level: 'high' | 'medium' | 'low';
  confidence: number; // 0-1, how sure we are about this pattern
}

interface FrameworkInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'celebration' | 'guidance';
  principle: string;
  title: string;
  description: string;
  actionItems?: string[];
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface FrameworkAssessment {
  date: Date;
  stage: 'foundation' | 'optimization' | 'mastery' | 'sustainability';
  completionPercentage: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  metrics: UserMetric[];
}

// Extended Luna state for framework integration
interface LunaFrameworkState {
  // User's productivity profile
  productivityProfile: UserProductivityProfile;

  // Framework-specific data
  currentPrinciple: FrameworkPrinciple | null;
  activeInsights: FrameworkInsight[];
  recentAssessments: FrameworkAssessment[];

  // Proactive guidance
  isProactiveMode: boolean;
  lastProactiveCheck: Date | null;
  scheduledReminders: FrameworkReminder[];

  // Framework learning and adaptation
  userPreferences: FrameworkPreferences;
  behaviorPatterns: BehaviorPattern[];

  // Recovery system
  isInRecoveryMode: boolean;
  currentRecoveryLevel: number | null;
  recoveryProgress: RecoveryProgress | null;
}

interface FrameworkReminder {
  id: string;
  type: 'review' | 'break' | 'reflection' | 'goal-check' | 'well-being';
  title: string;
  description: string;
  scheduledFor: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface FrameworkPreferences {
  preferredReviewTime: string; // e.g., "18:00"
  preferredBreakInterval: number; // minutes
  focusSessionLength: number; // minutes
  wellBeingCheckFrequency: 'daily' | 'weekly' | 'biweekly';
  guidanceStyle: 'gentle' | 'direct' | 'motivational';
  celebrationStyle: 'minimal' | 'moderate' | 'enthusiastic';
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  suggestedAction?: string;
  confidence: number; // 0-1
}

interface RecoveryProgress {
  level: number;
  startTime: Date;
  estimatedDuration: number; // minutes
  completedSteps: string[];
  remainingSteps: string[];
  currentStep: string;
}

// Framework-specific actions
interface LunaFrameworkActions {
  // Profile management
  updateProductivityProfile: (updates: Partial<UserProductivityProfile>) => void;
  advanceToNextStage: () => void;
  recordMetric: (metric: Omit<UserMetric, 'lastUpdated'>) => void;

  // Assessment and insights
  triggerAssessment: () => Promise<FrameworkAssessment>;
  addInsight: (insight: Omit<FrameworkInsight, 'id' | 'timestamp'>) => void;
  dismissInsight: (insightId: string) => void;

  // Proactive guidance
  enableProactiveMode: () => void;
  disableProactiveMode: () => void;
  checkForProactiveGuidance: () => void;
  scheduleReminder: (reminder: Omit<FrameworkReminder, 'id'>) => void;
  completeReminder: (reminderId: string) => void;

  // Recovery system
  startRecovery: (level: number) => void;
  completeRecoveryStep: (step: string) => void;
  finishRecovery: () => void;

  // Learning and adaptation
  updatePreferences: (preferences: Partial<FrameworkPreferences>) => void;
  recordBehaviorPattern: (pattern: BehaviorPattern) => void;

  // Framework commands
  executeFrameworkCommand: (command: string, context?: any) => Promise<string>;
  getContextualSuggestions: (context: string) => string[];

  // Well-being monitoring
  recordWellBeingScore: (score: number) => void;
  recordEnergyLevel: (hour: number, level: 'high' | 'medium' | 'low') => void;
  getEnergyRecommendation: (currentHour: number) => 'high' | 'medium' | 'low' | null;
}

type LunaFrameworkContextType = LunaFrameworkState & LunaFrameworkActions;

const LunaFrameworkContext = createContext<LunaFrameworkContextType | undefined>(undefined);

// Default framework state
const defaultFrameworkState: LunaFrameworkState = {
  productivityProfile: {
    currentStage: 'foundation',
    weekInStage: 1,
    completedPrinciples: [],
    currentMetrics: [],
    lastAssessment: null,
    wellBeingScore: 7,
    systemHealthScore: 5,
    energyPattern: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      level: hour >= 9 && hour <= 17 ? 'high' : hour >= 6 && hour <= 22 ? 'medium' : 'low',
      confidence: 0.3, // Low initial confidence
    })),
  },

  currentPrinciple: null,
  activeInsights: [],
  recentAssessments: [],

  isProactiveMode: true,
  lastProactiveCheck: null,
  scheduledReminders: [],

  userPreferences: {
    preferredReviewTime: "17:00",
    preferredBreakInterval: 90,
    focusSessionLength: 25,
    wellBeingCheckFrequency: 'daily',
    guidanceStyle: 'gentle',
    celebrationStyle: 'moderate',
  },
  behaviorPatterns: [],

  isInRecoveryMode: false,
  currentRecoveryLevel: null,
  recoveryProgress: null,
};

interface LunaFrameworkProviderProps {
  children: ReactNode;
}

export const LunaFrameworkProvider: React.FC<LunaFrameworkProviderProps> = ({ children }) => {
  const [state, setState] = useState<LunaFrameworkState>(defaultFrameworkState);

  // Load framework data from localStorage
  useEffect(() => {
    const savedFrameworkData = localStorage.getItem('luna-framework-data');
    if (savedFrameworkData) {
      try {
        const data = JSON.parse(savedFrameworkData);
        setState(prev => ({
          ...prev,
          ...data,
          // Convert date strings back to Date objects
          productivityProfile: {
            ...data.productivityProfile,
            lastAssessment: data.productivityProfile.lastAssessment
              ? new Date(data.productivityProfile.lastAssessment)
              : null,
          },
          lastProactiveCheck: data.lastProactiveCheck ? new Date(data.lastProactiveCheck) : null,
          scheduledReminders: data.scheduledReminders?.map((r: any) => ({
            ...r,
            scheduledFor: new Date(r.scheduledFor),
          })) || [],
          activeInsights: data.activeInsights?.map((i: any) => ({
            ...i,
            timestamp: new Date(i.timestamp),
          })) || [],
          recentAssessments: data.recentAssessments?.map((a: any) => ({
            ...a,
            date: new Date(a.date),
          })) || [],
        }));
      } catch (error) {
        console.warn('Failed to load Luna framework data:', error);
      }
    }
  }, []);

  // Save framework data to localStorage when state changes
  useEffect(() => {
    const dataToSave = {
      ...state,
      // We don't need to save all behavioral patterns, just the most recent/relevant ones
      behaviorPatterns: state.behaviorPatterns.slice(-10),
      activeInsights: state.activeInsights.slice(-5),
      recentAssessments: state.recentAssessments.slice(-3),
    };
    localStorage.setItem('luna-framework-data', JSON.stringify(dataToSave));
  }, [state]);

  // Proactive guidance checker
  useEffect(() => {
    if (!state.isProactiveMode) return;

    const checkInterval = setInterval(() => {
      actions.checkForProactiveGuidance();
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(checkInterval);
  }, [state.isProactiveMode]);

  const actions: LunaFrameworkActions = {
    // Profile management
    updateProductivityProfile: (updates) => {
      setState(prev => ({
        ...prev,
        productivityProfile: { ...prev.productivityProfile, ...updates }
      }));
    },

    advanceToNextStage: () => {
      setState(prev => {
        const stages = ['foundation', 'optimization', 'mastery', 'sustainability'] as const;
        const currentIndex = stages.indexOf(prev.productivityProfile.currentStage);
        const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : prev.productivityProfile.currentStage;

        return {
          ...prev,
          productivityProfile: {
            ...prev.productivityProfile,
            currentStage: nextStage,
            weekInStage: 1,
          }
        };
      });
    },

    recordMetric: (metric) => {
      setState(prev => {
        const updatedMetrics = prev.productivityProfile.currentMetrics.filter(m => m.metricId !== metric.metricId);
        updatedMetrics.push({ ...metric, lastUpdated: new Date() });

        return {
          ...prev,
          productivityProfile: {
            ...prev.productivityProfile,
            currentMetrics: updatedMetrics,
          }
        };
      });
    },

    // Assessment and insights
    triggerAssessment: async () => {
      const now = new Date();
      const stage = state.productivityProfile.currentStage;

      // Calculate completion percentage based on current stage and week
      const stageData = IMPLEMENTATION_STAGES.find(s => s.id === `stage-${state.productivityProfile.currentStage === 'foundation' ? '1' : state.productivityProfile.currentStage === 'optimization' ? '2' : '3'}`);
      const totalWeeks = stageData?.weeks.length || 8;
      const completionPercentage = Math.min((state.productivityProfile.weekInStage / totalWeeks) * 100, 100);

      const assessment: FrameworkAssessment = {
        date: now,
        stage,
        completionPercentage,
        strengths: [], // Would be populated by actual assessment logic
        improvements: [],
        nextSteps: [],
        metrics: [...state.productivityProfile.currentMetrics],
      };

      setState(prev => ({
        ...prev,
        recentAssessments: [assessment, ...prev.recentAssessments].slice(0, 5),
        productivityProfile: {
          ...prev.productivityProfile,
          lastAssessment: now,
        }
      }));

      return assessment;
    },

    addInsight: (insight) => {
      const newInsight: FrameworkInsight = {
        ...insight,
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        activeInsights: [newInsight, ...prev.activeInsights].slice(0, 10),
      }));
    },

    dismissInsight: (insightId) => {
      setState(prev => ({
        ...prev,
        activeInsights: prev.activeInsights.filter(i => i.id !== insightId),
      }));
    },

    // Proactive guidance
    enableProactiveMode: () => {
      setState(prev => ({ ...prev, isProactiveMode: true }));
    },

    disableProactiveMode: () => {
      setState(prev => ({ ...prev, isProactiveMode: false }));
    },

    checkForProactiveGuidance: () => {
      const now = new Date();
      const lastCheck = state.lastProactiveCheck;

      // Only check once per hour
      if (lastCheck && now.getTime() - lastCheck.getTime() < 60 * 60 * 1000) {
        return;
      }

      setState(prev => ({ ...prev, lastProactiveCheck: now }));

      // Check for various guidance opportunities
      const insights: Omit<FrameworkInsight, 'id' | 'timestamp'>[] = [];

      // Check if weekly review is overdue
      if (!state.productivityProfile.lastAssessment ||
          now.getTime() - state.productivityProfile.lastAssessment.getTime() > 7 * 24 * 60 * 60 * 1000) {
        insights.push({
          type: 'warning',
          principle: 'principle-4',
          title: 'Weekly Review Overdue',
          description: 'It\'s been over a week since your last review. Regular reflection maintains system health.',
          actionItems: ['Schedule 30 minutes for a comprehensive review', 'Process any accumulated tasks', 'Check goal alignment'],
          priority: 'high',
        });
      }

      // Check well-being score
      if (state.productivityProfile.wellBeingScore < 6) {
        insights.push({
          type: 'warning',
          principle: 'principle-4',
          title: 'Well-being Score Needs Attention',
          description: `Your well-being score is ${state.productivityProfile.wellBeingScore}/10. Let's focus on sustainable productivity.`,
          actionItems: ['Take a 10-minute break', 'Check if you\'re overcommitted', 'Consider rescheduling non-critical tasks'],
          priority: 'high',
        });
      }

      // Add insights
      insights.forEach(insight => actions.addInsight(insight));
    },

    scheduleReminder: (reminder) => {
      const newReminder: FrameworkReminder = {
        ...reminder,
        id: Date.now().toString(),
      };

      setState(prev => ({
        ...prev,
        scheduledReminders: [...prev.scheduledReminders, newReminder],
      }));
    },

    completeReminder: (reminderId) => {
      setState(prev => ({
        ...prev,
        scheduledReminders: prev.scheduledReminders.map(r =>
          r.id === reminderId ? { ...r, completed: true } : r
        ),
      }));
    },

    // Recovery system
    startRecovery: (level) => {
      const recoveryLevel = RECOVERY_LEVELS.find(r => r.level === level);
      if (!recoveryLevel) return;

      const progress: RecoveryProgress = {
        level,
        startTime: new Date(),
        estimatedDuration: parseInt(recoveryLevel.duration) || 30,
        completedSteps: [],
        remainingSteps: [recoveryLevel.action],
        currentStep: recoveryLevel.action,
      };

      setState(prev => ({
        ...prev,
        isInRecoveryMode: true,
        currentRecoveryLevel: level,
        recoveryProgress: progress,
      }));
    },

    completeRecoveryStep: (step) => {
      setState(prev => {
        if (!prev.recoveryProgress) return prev;

        const updatedProgress = {
          ...prev.recoveryProgress,
          completedSteps: [...prev.recoveryProgress.completedSteps, step],
          remainingSteps: prev.recoveryProgress.remainingSteps.filter(s => s !== step),
        };

        return {
          ...prev,
          recoveryProgress: updatedProgress,
        };
      });
    },

    finishRecovery: () => {
      setState(prev => ({
        ...prev,
        isInRecoveryMode: false,
        currentRecoveryLevel: null,
        recoveryProgress: null,
      }));
    },

    // Learning and adaptation
    updatePreferences: (preferences) => {
      setState(prev => ({
        ...prev,
        userPreferences: { ...prev.userPreferences, ...preferences },
      }));
    },

    recordBehaviorPattern: (pattern) => {
      setState(prev => ({
        ...prev,
        behaviorPatterns: [pattern, ...prev.behaviorPatterns].slice(0, 20),
      }));
    },

    // Framework commands
    executeFrameworkCommand: async (command, context) => {
      // This would integrate with the AI system to execute framework-specific commands
      // For now, return a placeholder response
      return `Executing framework command: ${command}`;
    },

    getContextualSuggestions: (context) => {
      const commandGroup = LUNA_COMMANDS.find(group =>
        group.category.toLowerCase().includes(context.toLowerCase())
      );
      return commandGroup?.commands || [];
    },

    // Well-being monitoring
    recordWellBeingScore: (score) => {
      setState(prev => ({
        ...prev,
        productivityProfile: {
          ...prev.productivityProfile,
          wellBeingScore: Math.max(1, Math.min(10, score)),
        }
      }));
    },

    recordEnergyLevel: (hour, level) => {
      setState(prev => {
        const updatedPattern = prev.productivityProfile.energyPattern.map(entry =>
          entry.hour === hour
            ? { ...entry, level, confidence: Math.min(1, entry.confidence + 0.1) }
            : entry
        );

        return {
          ...prev,
          productivityProfile: {
            ...prev.productivityProfile,
            energyPattern: updatedPattern,
          }
        };
      });
    },

    getEnergyRecommendation: (currentHour) => {
      const entry = state.productivityProfile.energyPattern.find(p => p.hour === currentHour);
      return entry && entry.confidence > 0.5 ? entry.level : null;
    },
  };

  const contextValue: LunaFrameworkContextType = {
    ...state,
    ...actions,
  };

  return (
    <LunaFrameworkContext.Provider value={contextValue}>
      {children}
    </LunaFrameworkContext.Provider>
  );
};

// Custom hook to use Luna framework context
export const useLunaFramework = (): LunaFrameworkContextType => {
  const context = useContext(LunaFrameworkContext);
  if (context === undefined) {
    throw new Error('useLunaFramework must be used within a LunaFrameworkProvider');
  }
  return context;
};

// Utility hooks for specific framework functionality
export const useProductivityProfile = () => {
  const { productivityProfile, updateProductivityProfile, recordMetric } = useLunaFramework();
  return { productivityProfile, updateProductivityProfile, recordMetric };
};

export const useFrameworkInsights = () => {
  const { activeInsights, addInsight, dismissInsight } = useLunaFramework();
  return { activeInsights, addInsight, dismissInsight };
};

export const useRecoverySystem = () => {
  const {
    isInRecoveryMode,
    currentRecoveryLevel,
    recoveryProgress,
    startRecovery,
    completeRecoveryStep,
    finishRecovery
  } = useLunaFramework();

  return {
    isInRecoveryMode,
    currentRecoveryLevel,
    recoveryProgress,
    startRecovery,
    completeRecoveryStep,
    finishRecovery
  };
};

export const useProactiveGuidance = () => {
  const {
    isProactiveMode,
    scheduledReminders,
    enableProactiveMode,
    disableProactiveMode,
    checkForProactiveGuidance,
    scheduleReminder,
    completeReminder
  } = useLunaFramework();

  return {
    isProactiveMode,
    scheduledReminders,
    enableProactiveMode,
    disableProactiveMode,
    checkForProactiveGuidance,
    scheduleReminder,
    completeReminder
  };
};

export const useWellBeingMonitor = () => {
  const {
    productivityProfile,
    recordWellBeingScore,
    recordEnergyLevel,
    getEnergyRecommendation
  } = useLunaFramework();

  return {
    wellBeingScore: productivityProfile.wellBeingScore,
    energyPattern: productivityProfile.energyPattern,
    recordWellBeingScore,
    recordEnergyLevel,
    getEnergyRecommendation
  };
};