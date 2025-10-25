import React, { createContext, useContext, ReactNode } from 'react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import {
  ProductivityCycleState,
  ProductivityPhase,
  DailyGoal,
  DailyReflection,
  Adjustment,
  CycleProgress
} from '../types/cycle';

interface ProductivityCycleContextType {
  state: ProductivityCycleState;
  setCurrentPhase: (phase: ProductivityPhase) => void;
  updatePhaseProgress: (progress: number) => void;
  addDailyGoal: (goal: DailyGoal) => void;
  removeDailyGoal: (goalId: string) => void;
  updateDailyGoal: (goalId: string, updates: Partial<DailyGoal>) => void;
  addReflection: (reflection: DailyReflection) => void;
  addAdjustment: (adjustment: Adjustment) => void;
  completeCapture: () => void;
  completeEngage: (reflection: any) => void;
  advanceToNextPhase: () => void;
  getCycleProgress: () => CycleProgress;
  resetDailyState: () => void;
  enableAIOptimizations: (enabled: boolean) => void;
  requestAIOptimization: () => Promise<void>;
  autoDetectPhaseCompletion: () => Promise<boolean>;
  cycleProgress: CycleProgress;
  analytics: any;
  isCapturing: boolean;
  isExecuting: boolean;
  isEngaging: boolean;
  canAdvance: boolean;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
  aiEnabled: boolean;
}

const ProductivityCycleContext = createContext<ProductivityCycleContextType | undefined>(undefined);

interface ProductivityCycleProviderProps {
  children: ReactNode;
}

export function ProductivityCycleProvider({ children }: ProductivityCycleProviderProps) {
  const cycleData = useProductivityCycle();

  return (
    <ProductivityCycleContext.Provider value={cycleData}>
      {children}
    </ProductivityCycleContext.Provider>
  );
}

export function useProductivityCycleContext() {
  const context = useContext(ProductivityCycleContext);
  if (context === undefined) {
    throw new Error('useProductivityCycleContext must be used within a ProductivityCycleProvider');
  }
  return context;
}

// For backward compatibility, export the hook as well
export { useProductivityCycle };