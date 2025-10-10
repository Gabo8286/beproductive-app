// Productivity Cycle Module
// Manage the 3-step productivity cycle (Capture → Execute → Engage)

// Services
export { cycleManager } from './services/cycleManager';
export { setupCommunication, productivityCycleComm } from './services/communication';

// Hooks
export { useProductivityCycle } from './hooks/useProductivityCycle';

// Types
export type * from './types/cycle';

// Module configuration
export const PRODUCTIVITY_CYCLE_MODULE = {
  name: 'productivity-cycle',
  version: '1.0.0',
  description: 'Manage the 3-step productivity cycle (Capture → Execute → Engage)',
  dependencies: ['ai-assistant', 'automation-engine', 'task-management'],
  capabilities: [
    'cycle-management',
    'phase-transitions',
    'automated-detection',
    'progress-tracking',
    'ai-optimization'
  ]
} as const;

// Module initialization function
export async function init() {

  // Setup inter-module communication
  const { setupCommunication } = await import('./services/communication');
  setupCommunication();

  return {
    cycleManager,
    capabilities: {
      'cycle-management': () => cycleManager.getState(),
      'phase-transitions': (phase: string) => cycleManager.setCurrentPhase(phase as any),
      'goal-tracking': () => cycleManager.getCycleAnalytics(),
      'progress-analytics': () => cycleManager.getCycleProgress()
    }
  };
}