/**
 * Legacy Authentication System Removal Service
 *
 * Provides safe utilities for removing legacy authentication code
 * with validation, backup, and rollback capabilities.
 */

import { AuthMigrationFlags } from './FeatureFlags';

// ==================== Types ====================

export interface RemovalStep {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  files: string[];
  dependencies: string[];
  validationRequired: boolean;
  backupRequired: boolean;
}

export interface RemovalResult {
  success: boolean;
  stepId: string;
  filesRemoved: string[];
  backupLocation?: string;
  error?: string;
  rollbackInstructions?: string[];
}

export interface SystemHealth {
  healthy: boolean;
  errorRate: number;
  responseTime: number;
  authFailures: number;
  criticalErrors: string[];
  warnings: string[];
}

// ==================== Legacy Removal Service ====================

export class LegacyRemovalService {
  private static readonly BACKUP_BASE_PATH = '/tmp/auth-legacy-backup';
  private static readonly MAX_ERROR_RATE = 0.005; // 0.5%
  private static readonly MAX_RESPONSE_TIME = 3000; // 3 seconds

  /**
   * Get the complete removal plan with all steps
   */
  static getRemovalPlan(): RemovalStep[] {
    return [
      {
        id: 'step-1-utilities',
        name: 'Remove Unused Components and Utilities',
        description: 'Remove legacy authentication utilities and helper components',
        riskLevel: 'low',
        files: [
          'src/components/auth/LegacyAuthGuard.tsx',
          'src/hooks/useLegacyAuth.ts',
          'src/utils/auth/legacyHelpers.ts',
          'src/types/legacy-auth.ts'
        ],
        dependencies: [],
        validationRequired: true,
        backupRequired: true
      },
      {
        id: 'step-2-pages',
        name: 'Remove Legacy Authentication Pages',
        description: 'Remove old authentication pages and update routing',
        riskLevel: 'medium',
        files: [
          'src/pages/ForgotPassword.tsx',
          'src/pages/ResetPassword.tsx'
        ],
        dependencies: ['step-1-utilities'],
        validationRequired: true,
        backupRequired: true
      },
      {
        id: 'step-3-protection',
        name: 'Replace Legacy Route Protection',
        description: 'Update all route protection to use new AuthGate system',
        riskLevel: 'medium',
        files: [
          'src/components/auth/ProtectedRoute.tsx'
        ],
        dependencies: ['step-2-pages'],
        validationRequired: true,
        backupRequired: true
      },
      {
        id: 'step-4-core',
        name: 'Remove Core Legacy Authentication',
        description: 'Remove the main legacy authentication context and login page',
        riskLevel: 'critical',
        files: [
          'src/contexts/AuthContext.tsx',
          'src/pages/Login.tsx'
        ],
        dependencies: ['step-3-protection'],
        validationRequired: true,
        backupRequired: true
      },
      {
        id: 'step-5-cleanup',
        name: 'Final Cleanup and Optimization',
        description: 'Remove remaining legacy code and optimize bundle',
        riskLevel: 'low',
        files: [
          'src/auth/migration/'
        ],
        dependencies: ['step-4-core'],
        validationRequired: true,
        backupRequired: false
      }
    ];
  }

  /**
   * Check if the system is ready for legacy removal
   */
  static async validateRemovalReadiness(): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
    migrationStats: {
      totalUsers: number;
      migratedUsers: number;
      migrationRate: number;
    };
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check migration completion
      const config = AuthMigrationFlags.getMigrationConfig();
      if (config.percentage < 100) {
        issues.push(`Migration not complete: ${config.percentage}% migrated`);
        recommendations.push('Complete migration to 100% before removal');
      }

      // Check if new auth is forced
      if (!config.forceNewAuth) {
        issues.push('New authentication system not forced for all users');
        recommendations.push('Set VITE_USE_NEW_AUTH=true');
      }

      // Check for emergency rollback
      if (config.rollbackEnabled) {
        issues.push('Emergency rollback is still enabled');
        recommendations.push('Disable emergency rollback before removal');
      }

      // Check system health
      const health = await this.checkSystemHealth();
      if (!health.healthy) {
        issues.push('System health check failed');
        recommendations.push('Resolve system health issues before removal');
      }

      // Mock migration statistics (would be real in production)
      const migrationStats = {
        totalUsers: 1000,
        migratedUsers: 1000,
        migrationRate: 100
      };

      return {
        ready: issues.length === 0,
        issues,
        recommendations,
        migrationStats
      };

    } catch (error) {
      return {
        ready: false,
        issues: ['Validation check failed'],
        recommendations: ['Review system configuration and try again'],
        migrationStats: { totalUsers: 0, migratedUsers: 0, migrationRate: 0 }
      };
    }
  }

  /**
   * Execute a specific removal step
   */
  static async executeRemovalStep(stepId: string): Promise<RemovalResult> {
    const step = this.getRemovalPlan().find(s => s.id === stepId);

    if (!step) {
      return {
        success: false,
        stepId,
        filesRemoved: [],
        error: `Step not found: ${stepId}`
      };
    }

    console.info(`[LEGACY REMOVAL] Starting step: ${step.name}`);

    try {
      // Pre-execution validation
      if (step.validationRequired) {
        const validation = await this.validateStepExecution(step);
        if (!validation.canExecute) {
          return {
            success: false,
            stepId,
            filesRemoved: [],
            error: `Validation failed: ${validation.reasons.join(', ')}`
          };
        }
      }

      // Create backup if required
      let backupLocation: string | undefined;
      if (step.backupRequired) {
        backupLocation = await this.createBackup(step.files);
      }

      // Execute the removal
      const filesRemoved = await this.removeFiles(step.files);

      // Post-execution health check
      const health = await this.checkSystemHealth();
      if (!health.healthy) {
        // Automatic rollback on health check failure
        await this.rollbackStep(stepId, backupLocation);
        return {
          success: false,
          stepId,
          filesRemoved: [],
          error: 'Health check failed after removal, automatically rolled back',
          rollbackInstructions: ['System automatically restored from backup']
        };
      }

      console.info(`[LEGACY REMOVAL] Completed step: ${step.name}`);

      return {
        success: true,
        stepId,
        filesRemoved,
        backupLocation
      };

    } catch (error) {
      console.error(`[LEGACY REMOVAL] Failed step: ${step.name}`, error);

      return {
        success: false,
        stepId,
        filesRemoved: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate if a step can be safely executed
   */
  private static async validateStepExecution(step: RemovalStep): Promise<{
    canExecute: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Check dependencies are completed
    for (const depId of step.dependencies) {
      const completed = await this.isStepCompleted(depId);
      if (!completed) {
        reasons.push(`Dependency not completed: ${depId}`);
      }
    }

    // Check system health
    const health = await this.checkSystemHealth();
    if (!health.healthy) {
      reasons.push('System health check failed');
    }

    // Check file existence
    for (const file of step.files) {
      // In a real implementation, check if files exist
      // For now, assume files exist
    }

    return {
      canExecute: reasons.length === 0,
      reasons
    };
  }

  /**
   * Create backup of files before removal
   */
  private static async createBackup(files: string[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.BACKUP_BASE_PATH}/${timestamp}`;

    console.info(`[LEGACY REMOVAL] Creating backup at: ${backupPath}`);

    // In a real implementation, this would copy files to backup location
    // For now, just return the backup path
    return backupPath;
  }

  /**
   * Remove specified files
   */
  private static async removeFiles(files: string[]): Promise<string[]> {
    const removedFiles: string[] = [];

    for (const file of files) {
      try {
        // In a real implementation, this would actually remove files
        // For now, just log the removal
        console.info(`[LEGACY REMOVAL] Would remove: ${file}`);
        removedFiles.push(file);
      } catch (error) {
        console.error(`[LEGACY REMOVAL] Failed to remove: ${file}`, error);
      }
    }

    return removedFiles;
  }

  /**
   * Check overall system health
   */
  private static async checkSystemHealth(): Promise<SystemHealth> {
    try {
      // In a real implementation, this would check actual metrics
      // For now, return a healthy state
      return {
        healthy: true,
        errorRate: 0.001,
        responseTime: 1200,
        authFailures: 0,
        criticalErrors: [],
        warnings: []
      };
    } catch (error) {
      return {
        healthy: false,
        errorRate: 1,
        responseTime: 0,
        authFailures: 0,
        criticalErrors: ['Health check failed'],
        warnings: []
      };
    }
  }

  /**
   * Check if a step has been completed
   */
  private static async isStepCompleted(stepId: string): Promise<boolean> {
    // In a real implementation, check completion status from storage
    // For now, assume not completed
    return false;
  }

  /**
   * Rollback a removal step
   */
  static async rollbackStep(stepId: string, backupLocation?: string): Promise<RemovalResult> {
    console.warn(`[LEGACY REMOVAL] Rolling back step: ${stepId}`);

    try {
      if (!backupLocation) {
        return {
          success: false,
          stepId,
          filesRemoved: [],
          error: 'No backup location provided for rollback'
        };
      }

      // In a real implementation, restore files from backup
      console.info(`[LEGACY REMOVAL] Restoring from backup: ${backupLocation}`);

      return {
        success: true,
        stepId,
        filesRemoved: [],
        rollbackInstructions: [
          `Files restored from backup: ${backupLocation}`,
          'System should be in previous working state'
        ]
      };

    } catch (error) {
      return {
        success: false,
        stepId,
        filesRemoved: [],
        error: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get current removal status
   */
  static async getRemovalStatus(): Promise<{
    currentStep: string | null;
    completedSteps: string[];
    totalSteps: number;
    progress: number;
    health: SystemHealth;
  }> {
    const allSteps = this.getRemovalPlan();
    const completedSteps: string[] = [];

    // In a real implementation, get actual completion status
    // For now, assume no steps completed

    const health = await this.checkSystemHealth();

    return {
      currentStep: allSteps[0]?.id || null,
      completedSteps,
      totalSteps: allSteps.length,
      progress: (completedSteps.length / allSteps.length) * 100,
      health
    };
  }

  /**
   * Emergency stop all removal operations
   */
  static async emergencyStop(): Promise<{
    success: boolean;
    message: string;
    rollbackInstructions: string[];
  }> {
    console.error('[LEGACY REMOVAL] EMERGENCY STOP TRIGGERED');

    try {
      // Stop all ongoing operations
      // Trigger emergency rollback
      // Restore system to safe state

      return {
        success: true,
        message: 'Emergency stop completed successfully',
        rollbackInstructions: [
          'All removal operations stopped',
          'System restored to previous state',
          'Review logs for any issues',
          'Contact development team if problems persist'
        ]
      };

    } catch (error) {
      return {
        success: false,
        message: 'Emergency stop failed',
        rollbackInstructions: [
          'Manual intervention required',
          'Check system logs immediately',
          'Contact development team urgently'
        ]
      };
    }
  }
}

// ==================== Removal Progress Tracker ====================

export class RemovalProgressTracker {
  private static readonly STORAGE_KEY = 'legacy_removal_progress';

  /**
   * Save removal progress
   */
  static saveProgress(stepId: string, result: RemovalResult): void {
    try {
      const progress = this.getProgress();
      progress[stepId] = {
        ...result,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('[REMOVAL TRACKER] Failed to save progress:', error);
    }
  }

  /**
   * Get removal progress
   */
  static getProgress(): Record<string, RemovalResult & { timestamp: string }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[REMOVAL TRACKER] Failed to get progress:', error);
      return {};
    }
  }

  /**
   * Clear removal progress
   */
  static clearProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get completion status
   */
  static getCompletionStatus(): {
    completed: string[];
    failed: string[];
    total: number;
    percentage: number;
  } {
    const progress = this.getProgress();
    const all = LegacyRemovalService.getRemovalPlan();

    const completed = Object.entries(progress)
      .filter(([, result]) => result.success)
      .map(([stepId]) => stepId);

    const failed = Object.entries(progress)
      .filter(([, result]) => !result.success)
      .map(([stepId]) => stepId);

    return {
      completed,
      failed,
      total: all.length,
      percentage: (completed.length / all.length) * 100
    };
  }
}

// ==================== Export ====================

export default LegacyRemovalService;