// Productivity Cycle Types
export type ProductivityPhase = 'capture' | 'execute' | 'engage';

export interface DailyGoal {
  id: string;
  task_id: string;
  priority: number;
  estimated_time: number; // in minutes
  energy_required: 'low' | 'medium' | 'high';
  time_block?: {
    start_time: string;
    end_time: string;
  };
  date: string;
  completed?: boolean;
  actual_time?: number;
  completion_notes?: string;
}

export interface DailyReflection {
  id: string;
  date: string;
  completedTasks: number;
  plannedTasks: number;
  timeAccuracy: number; // percentage of time estimates that were accurate
  energyLevel: 'low' | 'medium' | 'high';
  whatWentWell: string;
  whatCouldImprove: string;
  insights: string;
  tomorrowPriorities: string[];
  created_at: string;
  satisfaction_rating?: number; // 1-5 scale
  productivity_score?: number; // 0-100
}

export interface Adjustment {
  id: string;
  date: string;
  type: 'reschedule' | 'priority_change' | 'energy_match' | 'workload_balance';
  description: string;
  task_id?: string;
  applied: boolean;
  created_at: string;
  impact_rating?: number; // 1-5 scale
  ai_suggested?: boolean;
}

export interface ProductivityCycleState {
  currentPhase: ProductivityPhase;
  phaseProgress: number; // 0-100%
  currentDate: string;
  dailyGoals: DailyGoal[];
  reflections: DailyReflection[];
  adjustments: Adjustment[];
  captureCompleted: boolean;
  engageCompleted: boolean;
  cycleStartTime?: string;
  estimatedCycleCompletion?: string;
  aiOptimizationsEnabled: boolean;
}

export interface CycleProgress {
  phase: ProductivityPhase;
  progress: number;
  nextPhase: ProductivityPhase | null;
  canAdvance: boolean;
  timeSpentInPhase?: number; // minutes
  estimatedTimeRemaining?: number; // minutes
}

export interface PhaseMetrics {
  phase: ProductivityPhase;
  averageDuration: number; // minutes
  completionRate: number; // 0-1
  satisfactionScore: number; // 1-5
  productivityScore: number; // 0-100
  commonIssues: string[];
  improvementSuggestions: string[];
}

export interface CyclePattern {
  userId: string;
  optimalStartTime: string;
  preferredPhaseOrder: ProductivityPhase[];
  averageCycleDuration: number; // minutes
  peakProductivityHours: string[];
  energyPatterns: {
    morning: number; // 0-1
    afternoon: number; // 0-1
    evening: number; // 0-1
  };
  lastUpdated: string;
}

export interface AutomationTrigger {
  id: string;
  phase: ProductivityPhase;
  condition: string;
  action: string;
  enabled: boolean;
  confidence: number; // 0-1
  timesTriggered: number;
  successRate: number; // 0-1
}

export interface CycleInsight {
  id: string;
  type: 'pattern' | 'optimization' | 'warning' | 'achievement';
  title: string;
  description: string;
  data: Record<string, any>;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at?: string;
}

// Helper function to determine next phase
export function getNextPhase(currentPhase: ProductivityPhase): ProductivityPhase | null {
  const phaseOrder: ProductivityPhase[] = ['capture', 'execute', 'engage'];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  if (currentIndex === phaseOrder.length - 1) {
    return 'capture'; // Cycle back to capture for next day
  }

  return phaseOrder[currentIndex + 1];
}

// Helper function to get phase display info
export function getPhaseInfo(phase: ProductivityPhase) {
  const phaseMap = {
    capture: {
      title: 'Capture & Record',
      description: 'Sort, clean, and prioritize your work',
      icon: '📝',
      color: 'blue',
      estimatedDuration: 30, // minutes
      keyActivities: ['Task capture', 'Priority setting', 'Planning']
    },
    execute: {
      title: 'Organized Execution',
      description: 'Focus on completing your work efficiently',
      icon: '⚡',
      color: 'green',
      estimatedDuration: 120, // minutes
      keyActivities: ['Focused work', 'Task completion', 'Progress tracking']
    },
    engage: {
      title: 'Engage & Control',
      description: 'Review progress and collaborate',
      icon: '🤝',
      color: 'purple',
      estimatedDuration: 45, // minutes
      keyActivities: ['Reflection', 'Collaboration', 'Planning ahead']
    }
  };

  return phaseMap[phase];
}

// Helper function to calculate cycle completion percentage
export function calculateCycleCompletion(state: ProductivityCycleState): number {
  const phaseWeights = {
    capture: 0.2, // 20% of cycle
    execute: 0.6, // 60% of cycle
    engage: 0.2   // 20% of cycle
  };

  const currentPhaseWeight = phaseWeights[state.currentPhase];
  const completedPhasesWeight = Object.entries(phaseWeights)
    .filter(([phase]) => {
      const phaseOrder: ProductivityPhase[] = ['capture', 'execute', 'engage'];
      const currentIndex = phaseOrder.indexOf(state.currentPhase);
      const phaseIndex = phaseOrder.indexOf(phase as ProductivityPhase);
      return phaseIndex < currentIndex;
    })
    .reduce((sum, [, weight]) => sum + weight, 0);

  const currentPhaseProgress = (state.phaseProgress / 100) * currentPhaseWeight;

  return Math.round((completedPhasesWeight + currentPhaseProgress) * 100);
}

// Helper function to estimate cycle completion time
export function estimateCycleCompletion(state: ProductivityCycleState, patterns?: CyclePattern): Date {
  const now = new Date();
  const phaseInfo = getPhaseInfo(state.currentPhase);

  // Calculate remaining time in current phase
  const remainingInCurrentPhase = phaseInfo.estimatedDuration * (1 - state.phaseProgress / 100);

  // Calculate time for remaining phases
  const phaseOrder: ProductivityPhase[] = ['capture', 'execute', 'engage'];
  const currentIndex = phaseOrder.indexOf(state.currentPhase);
  const remainingPhases = phaseOrder.slice(currentIndex + 1);

  const remainingPhasesTime = remainingPhases.reduce((total, phase) => {
    return total + getPhaseInfo(phase).estimatedDuration;
  }, 0);

  const totalRemainingMinutes = remainingInCurrentPhase + remainingPhasesTime;

  return new Date(now.getTime() + totalRemainingMinutes * 60 * 1000);
}