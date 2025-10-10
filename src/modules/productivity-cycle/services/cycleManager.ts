// Productivity Cycle Manager Service
import {
  ProductivityCycleState,
  ProductivityPhase,
  CycleProgress,
  DailyGoal,
  DailyReflection,
  Adjustment,
  getNextPhase,
  calculateCycleCompletion,
  estimateCycleCompletion
} from '../types/cycle';

export type CycleAction =
  | { type: 'SET_PHASE'; payload: ProductivityPhase }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'ADD_DAILY_GOAL'; payload: DailyGoal }
  | { type: 'REMOVE_DAILY_GOAL'; payload: string }
  | { type: 'UPDATE_DAILY_GOAL'; payload: { id: string; updates: Partial<DailyGoal> } }
  | { type: 'ADD_REFLECTION'; payload: DailyReflection }
  | { type: 'ADD_ADJUSTMENT'; payload: Adjustment }
  | { type: 'COMPLETE_CAPTURE' }
  | { type: 'COMPLETE_ENGAGE'; payload: any }
  | { type: 'RESET_DAILY_STATE' }
  | { type: 'ENABLE_AI_OPTIMIZATIONS'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<ProductivityCycleState> };

const initialState: ProductivityCycleState = {
  currentPhase: 'capture',
  phaseProgress: 0,
  currentDate: new Date().toISOString().split('T')[0],
  dailyGoals: [],
  reflections: [],
  adjustments: [],
  captureCompleted: false,
  engageCompleted: false,
  aiOptimizationsEnabled: true,
  cycleStartTime: new Date().toISOString()
};

class CycleManager {
  private state: ProductivityCycleState = initialState;
  private listeners: Array<(state: ProductivityCycleState) => void> = [];

  constructor() {
    this.loadPersistedState();
  }

  // State management
  public getState(): ProductivityCycleState {
    return { ...this.state };
  }

  public dispatch(action: CycleAction): void {
    this.state = this.cycleReducer(this.state, action);
    this.notifyListeners();
    this.persistState();
  }

  public subscribe(listener: (state: ProductivityCycleState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private persistState(): void {
    try {
      localStorage.setItem('productivityCycle', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to persist cycle state:', error);
    }
  }

  private loadPersistedState(): void {
    try {
      const savedState = localStorage.getItem('productivityCycle');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const today = new Date().toISOString().split('T')[0];

        // If it's a new day, reset the daily state
        if (parsedState.currentDate !== today) {
          this.dispatch({ type: 'RESET_DAILY_STATE' });
        } else {
          this.dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error('Failed to load persisted cycle state:', error);
    }
  }

  // Cycle reducer
  private cycleReducer(state: ProductivityCycleState, action: CycleAction): ProductivityCycleState {
    switch (action.type) {
      case 'SET_PHASE':
        return {
          ...state,
          currentPhase: action.payload,
          phaseProgress: 0,
          cycleStartTime: action.payload === 'capture' ? new Date().toISOString() : state.cycleStartTime
        };

      case 'UPDATE_PROGRESS':
        const newProgress = Math.max(0, Math.min(100, action.payload));
        return {
          ...state,
          phaseProgress: newProgress,
          estimatedCycleCompletion: estimateCycleCompletion({
            ...state,
            phaseProgress: newProgress
          }).toISOString()
        };

      case 'ADD_DAILY_GOAL':
        return {
          ...state,
          dailyGoals: [...state.dailyGoals, action.payload],
        };

      case 'REMOVE_DAILY_GOAL':
        return {
          ...state,
          dailyGoals: state.dailyGoals.filter(goal => goal.id !== action.payload),
        };

      case 'UPDATE_DAILY_GOAL':
        return {
          ...state,
          dailyGoals: state.dailyGoals.map(goal =>
            goal.id === action.payload.id
              ? { ...goal, ...action.payload.updates }
              : goal
          ),
        };

      case 'ADD_REFLECTION':
        return {
          ...state,
          reflections: [...state.reflections, action.payload],
        };

      case 'ADD_ADJUSTMENT':
        return {
          ...state,
          adjustments: [...state.adjustments, action.payload],
        };

      case 'COMPLETE_CAPTURE':
        return {
          ...state,
          captureCompleted: true,
          phaseProgress: 100,
        };

      case 'COMPLETE_ENGAGE':
        return {
          ...state,
          engageCompleted: true,
          phaseProgress: 100,
          reflections: [...state.reflections, action.payload],
        };

      case 'ENABLE_AI_OPTIMIZATIONS':
        return {
          ...state,
          aiOptimizationsEnabled: action.payload,
        };

      case 'RESET_DAILY_STATE':
        const newDate = new Date().toISOString().split('T')[0];
        return {
          ...initialState,
          currentDate: newDate,
          cycleStartTime: new Date().toISOString(),
          aiOptimizationsEnabled: state.aiOptimizationsEnabled,
          // Keep yesterday's reflections and adjustments for reference
          reflections: state.reflections,
          adjustments: state.adjustments,
        };

      case 'LOAD_STATE':
        return {
          ...state,
          ...action.payload,
        };

      default:
        return state;
    }
  }

  // Public API methods
  public setCurrentPhase(phase: ProductivityPhase): void {
    this.dispatch({ type: 'SET_PHASE', payload: phase });
  }

  public updatePhaseProgress(progress: number): void {
    this.dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  }

  public addDailyGoal(goal: DailyGoal): void {
    this.dispatch({ type: 'ADD_DAILY_GOAL', payload: goal });
  }

  public removeDailyGoal(goalId: string): void {
    this.dispatch({ type: 'REMOVE_DAILY_GOAL', payload: goalId });
  }

  public updateDailyGoal(goalId: string, updates: Partial<DailyGoal>): void {
    this.dispatch({ type: 'UPDATE_DAILY_GOAL', payload: { id: goalId, updates } });
  }

  public addReflection(reflection: DailyReflection): void {
    this.dispatch({ type: 'ADD_REFLECTION', payload: reflection });
  }

  public addAdjustment(adjustment: Adjustment): void {
    this.dispatch({ type: 'ADD_ADJUSTMENT', payload: adjustment });
  }

  public completeCapture(): void {
    this.dispatch({ type: 'COMPLETE_CAPTURE' });
  }

  public completeEngage(reflection: any): void {
    this.dispatch({ type: 'COMPLETE_ENGAGE', payload: reflection });
  }

  public advanceToNextPhase(): void {
    const nextPhase = getNextPhase(this.state.currentPhase);
    if (nextPhase) {
      this.setCurrentPhase(nextPhase);
    }
  }

  public getCycleProgress(): CycleProgress {
    const nextPhase = getNextPhase(this.state.currentPhase);

    let canAdvance = false;
    switch (this.state.currentPhase) {
      case 'capture':
        canAdvance = this.state.captureCompleted && this.state.dailyGoals.length > 0;
        break;
      case 'execute':
        canAdvance = true; // Can always advance to engage
        break;
      case 'engage':
        canAdvance = this.state.engageCompleted;
        break;
    }

    return {
      phase: this.state.currentPhase,
      progress: this.state.phaseProgress,
      nextPhase,
      canAdvance,
    };
  }

  public resetDailyState(): void {
    this.dispatch({ type: 'RESET_DAILY_STATE' });
  }

  public enableAIOptimizations(enabled: boolean): void {
    this.dispatch({ type: 'ENABLE_AI_OPTIMIZATIONS', payload: enabled });
  }

  // Analytics methods
  public getCycleAnalytics() {
    return {
      totalCycleCompletion: calculateCycleCompletion(this.state),
      estimatedCompletion: this.state.estimatedCycleCompletion,
      dailyGoalsCount: this.state.dailyGoals.length,
      completedGoalsCount: this.state.dailyGoals.filter(g => g.completed).length,
      totalEstimatedTime: this.state.dailyGoals.reduce((acc, goal) => acc + goal.estimated_time, 0),
      currentPhaseTimeSpent: this.calculatePhaseTimeSpent(),
      aiOptimizationsEnabled: this.state.aiOptimizationsEnabled
    };
  }

  private calculatePhaseTimeSpent(): number {
    if (!this.state.cycleStartTime) return 0;

    const startTime = new Date(this.state.cycleStartTime);
    const now = new Date();
    return Math.round((now.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
  }

  // AI Integration methods
  public async requestAIOptimization(): Promise<void> {
    if (!this.state.aiOptimizationsEnabled) return;

    // TODO: Integrate with AI assistant module for optimization suggestions
  }

  public async autoDetectPhaseCompletion(): Promise<boolean> {
    if (!this.state.aiOptimizationsEnabled) return false;

    // TODO: Implement AI-based phase completion detection
    return false;
  }
}

// Export singleton instance
export const cycleManager = new CycleManager();