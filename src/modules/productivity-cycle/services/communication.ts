// Productivity Cycle Module Communication Service
import { moduleComm, MESSAGE_TYPES, ModuleMessage, ModuleResponse } from '@/shared/services/moduleComm';
import { cycleManager } from './cycleManager';
import { DailyGoal } from '../types/cycle';

const MODULE_NAME = 'productivity-cycle';

export function setupCommunication() {
  // Register message handlers for Productivity Cycle module

  // Handle get state requests
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.CYCLE_GET_STATE, async (): Promise<ModuleResponse> => {
    try {
      const state = cycleManager.getState();
      return { success: true, data: state };
    } catch (error) {
      return { success: false, error: `Failed to get cycle state: ${error}` };
    }
  });

  // Handle set phase requests
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.CYCLE_SET_PHASE, async (message: ModuleMessage): Promise<ModuleResponse> => {
    try {
      const { phase } = message.payload;
      if (!phase) {
        return { success: false, error: 'Phase is required' };
      }

      cycleManager.setCurrentPhase(phase);
      return { success: true, data: { phase, timestamp: new Date().toISOString() } };
    } catch (error) {
      return { success: false, error: `Failed to set phase: ${error}` };
    }
  });

  // Handle add goal requests
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.CYCLE_ADD_GOAL, async (message: ModuleMessage): Promise<ModuleResponse> => {
    try {
      const { goal } = message.payload;
      if (!goal) {
        return { success: false, error: 'Goal is required' };
      }

      cycleManager.addDailyGoal(goal as DailyGoal);
      return { success: true, data: { goalId: goal.id, timestamp: new Date().toISOString() } };
    } catch (error) {
      return { success: false, error: `Failed to add goal: ${error}` };
    }
  });

  // Handle progress update requests
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.CYCLE_UPDATE_PROGRESS, async (message: ModuleMessage): Promise<ModuleResponse> => {
    try {
      const { progress } = message.payload;
      if (typeof progress !== 'number') {
        return { success: false, error: 'Progress must be a number' };
      }

      cycleManager.updatePhaseProgress(progress);
      return { success: true, data: { progress, timestamp: new Date().toISOString() } };
    } catch (error) {
      return { success: false, error: `Failed to update progress: ${error}` };
    }
  });

  // Handle health check
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.HEALTH_CHECK, async (): Promise<ModuleResponse> => {
    return {
      success: true,
      data: {
        module: MODULE_NAME,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        currentPhase: cycleManager.getState().currentPhase,
        capabilities: ['cycle-management', 'phase-transitions', 'goal-tracking', 'progress-analytics']
      }
    };
  });

  // Handle get status requests
  moduleComm.registerHandler(MODULE_NAME, MESSAGE_TYPES.GET_STATUS, async (): Promise<ModuleResponse> => {
    const state = cycleManager.getState();
    const analytics = cycleManager.getCycleAnalytics();

    return {
      success: true,
      data: {
        module: MODULE_NAME,
        initialized: true,
        currentPhase: state.currentPhase,
        progress: state.phaseProgress,
        dailyGoalsCount: state.dailyGoals.length,
        analytics
      }
    };
  });

  console.log(`${MODULE_NAME} communication handlers registered`);
}

// Helper functions for other modules to communicate with Productivity Cycle
export const productivityCycleComm = {
  // Get current cycle state
  async getState(fromModule: string): Promise<any> {
    const response = await moduleComm.request(fromModule, MODULE_NAME, MESSAGE_TYPES.CYCLE_GET_STATE);
    return response.success ? response.data : null;
  },

  // Set current phase
  async setPhase(phase: string, fromModule: string): Promise<boolean> {
    const response = await moduleComm.request(fromModule, MODULE_NAME, MESSAGE_TYPES.CYCLE_SET_PHASE, { phase });
    return response.success;
  },

  // Add a daily goal
  async addGoal(goal: DailyGoal, fromModule: string): Promise<boolean> {
    const response = await moduleComm.request(fromModule, MODULE_NAME, MESSAGE_TYPES.CYCLE_ADD_GOAL, { goal });
    return response.success;
  },

  // Update phase progress
  async updateProgress(progress: number, fromModule: string): Promise<boolean> {
    const response = await moduleComm.request(fromModule, MODULE_NAME, MESSAGE_TYPES.CYCLE_UPDATE_PROGRESS, { progress });
    return response.success;
  }
};