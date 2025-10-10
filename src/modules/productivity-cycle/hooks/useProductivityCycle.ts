// Productivity Cycle Hook
import { useState, useEffect, useCallback } from 'react';
import { cycleManager } from '../services/cycleManager';
import {
  ProductivityCycleState,
  ProductivityPhase,
  DailyGoal,
  DailyReflection,
  Adjustment,
  CycleProgress
} from '../types/cycle';

export function useProductivityCycle() {
  const [state, setState] = useState<ProductivityCycleState>(cycleManager.getState());

  // Subscribe to cycle manager state changes
  useEffect(() => {
    const unsubscribe = cycleManager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Cycle management methods
  const setCurrentPhase = useCallback((phase: ProductivityPhase) => {
    cycleManager.setCurrentPhase(phase);
  }, []);

  const updatePhaseProgress = useCallback((progress: number) => {
    cycleManager.updatePhaseProgress(progress);
  }, []);

  const addDailyGoal = useCallback((goal: DailyGoal) => {
    cycleManager.addDailyGoal(goal);
  }, []);

  const removeDailyGoal = useCallback((goalId: string) => {
    cycleManager.removeDailyGoal(goalId);
  }, []);

  const updateDailyGoal = useCallback((goalId: string, updates: Partial<DailyGoal>) => {
    cycleManager.updateDailyGoal(goalId, updates);
  }, []);

  const addReflection = useCallback((reflection: DailyReflection) => {
    cycleManager.addReflection(reflection);
  }, []);

  const addAdjustment = useCallback((adjustment: Adjustment) => {
    cycleManager.addAdjustment(adjustment);
  }, []);

  const completeCapture = useCallback(() => {
    cycleManager.completeCapture();
  }, []);

  const completeEngage = useCallback((reflection: any) => {
    cycleManager.completeEngage(reflection);
  }, []);

  const advanceToNextPhase = useCallback(() => {
    cycleManager.advanceToNextPhase();
  }, []);

  const getCycleProgress = useCallback((): CycleProgress => {
    return cycleManager.getCycleProgress();
  }, []);

  const resetDailyState = useCallback(() => {
    cycleManager.resetDailyState();
  }, []);

  const enableAIOptimizations = useCallback((enabled: boolean) => {
    cycleManager.enableAIOptimizations(enabled);
  }, []);

  // Analytics and insights
  const getCycleAnalytics = useCallback(() => {
    return cycleManager.getCycleAnalytics();
  }, []);

  // AI integration methods
  const requestAIOptimization = useCallback(async () => {
    await cycleManager.requestAIOptimization();
  }, []);

  const autoDetectPhaseCompletion = useCallback(async () => {
    return await cycleManager.autoDetectPhaseCompletion();
  }, []);

  // Computed values
  const cycleProgress = getCycleProgress();
  const analytics = getCycleAnalytics();

  return {
    // State
    state,
    cycleProgress,
    analytics,

    // Phase management
    setCurrentPhase,
    updatePhaseProgress,
    advanceToNextPhase,

    // Goal management
    addDailyGoal,
    removeDailyGoal,
    updateDailyGoal,

    // Reflection and adjustment
    addReflection,
    addAdjustment,

    // Phase completion
    completeCapture,
    completeEngage,

    // Utilities
    getCycleProgress,
    resetDailyState,

    // AI features
    enableAIOptimizations,
    requestAIOptimization,
    autoDetectPhaseCompletion,

    // Derived state
    isCapturing: state.currentPhase === 'capture',
    isExecuting: state.currentPhase === 'execute',
    isEngaging: state.currentPhase === 'engage',
    canAdvance: cycleProgress.canAdvance,
    totalGoals: state.dailyGoals.length,
    completedGoals: state.dailyGoals.filter(g => g.completed).length,
    hasGoals: state.dailyGoals.length > 0,
    aiEnabled: state.aiOptimizationsEnabled
  };
}