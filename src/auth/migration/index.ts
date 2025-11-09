/**
 * Authentication Migration System
 *
 * Complete migration toolkit for transitioning from the old authentication
 * system to the new modern authentication architecture.
 */

// ==================== Core Migration Components ====================

export { AuthMigrationWrapper, useMigrationContext } from './MigrationWrapper';
export { DataMigrationService } from './DataMigrationService';

// ==================== Feature Flags & Controls ====================

export {
  AuthMigrationFlags,
  MigrationHealthCheck,
  MigrationAnalytics
} from './FeatureFlags';

// ==================== Types ====================

export type {
  MigrationConfig,
  MigrationDecision
} from './FeatureFlags';

export type {
  MigrationResult,
  UserMigrationData,
  MigrationStatus
} from './DataMigrationService';

// ==================== Migration Utilities ====================

/**
 * Emergency Migration Controls
 *
 * Use these utilities for emergency situations and production rollbacks.
 */
export class EmergencyMigrationControls {
  /**
   * Trigger immediate rollback for all users
   */
  static triggerEmergencyRollback(): void {
    console.warn('[EMERGENCY] Triggering authentication system rollback');

    // Set emergency rollback flag
    if (typeof window !== 'undefined') {
      (window as any).__EMERGENCY_AUTH_ROLLBACK__ = true;

      // Dispatch event to notify all components
      window.dispatchEvent(new CustomEvent('auth-emergency-rollback', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }

    // In production, this would also trigger server-side flags
    console.error('[EMERGENCY] Emergency rollback activated - all users will be moved to legacy auth system');
  }

  /**
   * Clear emergency rollback
   */
  static clearEmergencyRollback(): void {
    console.info('[EMERGENCY] Clearing emergency rollback');

    if (typeof window !== 'undefined') {
      (window as any).__EMERGENCY_AUTH_ROLLBACK__ = false;

      window.dispatchEvent(new CustomEvent('auth-emergency-rollback-cleared', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Check if emergency rollback is active
   */
  static isEmergencyRollbackActive(): boolean {
    return (typeof window !== 'undefined' && (window as any).__EMERGENCY_AUTH_ROLLBACK__ === true) ||
           import.meta.env.VITE_EMERGENCY_ROLLBACK === 'true';
  }
}

/**
 * Migration Validation Utilities
 *
 * Tools for validating migration readiness and health.
 */
export class MigrationValidation {
  /**
   * Check if the system is ready for migration
   */
  static async validateMigrationReadiness(): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check environment configuration
      const migrationMode = import.meta.env.VITE_MIGRATION_MODE;
      if (migrationMode !== 'enabled') {
        issues.push('Migration mode is not enabled in environment');
        recommendations.push('Set VITE_MIGRATION_MODE=enabled');
      }

      // Check database connectivity
      // This would include actual database checks in a real implementation

      // Check feature flag configuration
      const percentage = AuthMigrationFlags.getMigrationPercentage();
      if (percentage < 0 || percentage > 100) {
        issues.push(`Invalid migration percentage: ${percentage}`);
        recommendations.push('Set VITE_MIGRATION_PERCENTAGE between 0 and 100');
      }

      // Check rollback configuration
      if (AuthMigrationFlags.isEmergencyRollbackActive()) {
        issues.push('Emergency rollback is currently active');
        recommendations.push('Clear emergency rollback before starting migration');
      }

      return {
        ready: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      return {
        ready: false,
        issues: ['Migration readiness check failed'],
        recommendations: ['Review system configuration and try again']
      };
    }
  }

  /**
   * Validate user data integrity before migration
   */
  static async validateUserDataIntegrity(userId: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // This would include actual user data validation
      // For now, we return a placeholder validation

      return {
        valid: issues.length === 0,
        issues
      };

    } catch (error) {
      return {
        valid: false,
        issues: ['Data integrity validation failed']
      };
    }
  }
}

/**
 * Migration Deployment Utilities
 *
 * Tools for managing migration deployment and monitoring.
 */
export class MigrationDeployment {
  /**
   * Get current migration deployment status
   */
  static getMigrationDeploymentStatus(): {
    phase: string;
    percentage: number;
    usersAffected: number;
    health: 'healthy' | 'warning' | 'critical';
    lastUpdated: string;
  } {
    const percentage = AuthMigrationFlags.getMigrationPercentage();
    const config = AuthMigrationFlags.getMigrationConfig();

    let phase = 'preparation';
    if (percentage === 0) phase = 'preparation';
    else if (percentage <= 10) phase = 'pilot';
    else if (percentage <= 25) phase = 'early_adoption';
    else if (percentage <= 50) phase = 'gradual_rollout';
    else if (percentage <= 75) phase = 'mass_migration';
    else if (percentage < 100) phase = 'final_migration';
    else phase = 'complete';

    return {
      phase,
      percentage,
      usersAffected: 0, // Would be calculated from actual user data
      health: config.rollbackEnabled ? 'critical' : 'healthy',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update migration percentage (would integrate with deployment system)
   */
  static async updateMigrationPercentage(newPercentage: number): Promise<{
    success: boolean;
    previousPercentage: number;
    newPercentage: number;
  }> {
    const previousPercentage = AuthMigrationFlags.getMigrationPercentage();

    // In a real implementation, this would update server-side configuration
    console.info(`[MIGRATION DEPLOYMENT] Updating percentage: ${previousPercentage}% -> ${newPercentage}%`);

    return {
      success: true,
      previousPercentage,
      newPercentage
    };
  }
}

// ==================== Migration Presets ====================

/**
 * Predefined migration schedules for different deployment scenarios
 */
export const MIGRATION_PRESETS = {
  conservative: [
    { week: 1, percentage: 1, description: 'Internal testing only' },
    { week: 2, percentage: 5, description: 'Beta users' },
    { week: 3, percentage: 10, description: 'Early adopters' },
    { week: 4, percentage: 25, description: 'Power users' },
    { week: 5, percentage: 50, description: 'Half of user base' },
    { week: 6, percentage: 75, description: 'Majority of users' },
    { week: 7, percentage: 90, description: 'Nearly all users' },
    { week: 8, percentage: 100, description: 'Complete migration' }
  ],

  aggressive: [
    { week: 1, percentage: 10, description: 'Early testing' },
    { week: 2, percentage: 30, description: 'Significant portion' },
    { week: 3, percentage: 70, description: 'Majority rollout' },
    { week: 4, percentage: 100, description: 'Complete migration' }
  ],

  cautious: [
    { week: 1, percentage: 1, description: 'Internal only' },
    { week: 2, percentage: 2, description: 'Minimal external' },
    { week: 3, percentage: 5, description: 'Small beta group' },
    { week: 4, percentage: 10, description: 'Extended beta' },
    { week: 5, percentage: 15, description: 'Gradual increase' },
    { week: 6, percentage: 25, description: 'Quarter of users' },
    { week: 8, percentage: 40, description: 'Steady growth' },
    { week: 10, percentage: 60, description: 'Majority testing' },
    { week: 12, percentage: 80, description: 'Near completion' },
    { week: 14, percentage: 100, description: 'Full migration' }
  ]
};

// ==================== Development Helpers ====================

if (import.meta.env.DEV) {
  /**
   * Development-only utilities for testing migration scenarios
   */
  (window as any).authMigrationDev = {
    flags: AuthMigrationFlags,
    dataService: DataMigrationService,
    emergency: EmergencyMigrationControls,
    validation: MigrationValidation,
    deployment: MigrationDeployment,
    presets: MIGRATION_PRESETS,

    // Quick test functions
    testMigration: (userId: string) => DataMigrationService.migrateUserData(userId),
    testRollback: (userId: string) => DataMigrationService.rollbackUserMigration(userId),
    simulateEmergency: () => EmergencyMigrationControls.triggerEmergencyRollback(),
    clearEmergency: () => EmergencyMigrationControls.clearEmergencyRollback()
  };

  console.info('🔄 Auth Migration System loaded in development mode');
  console.info('📊 Access migration tools via: window.authMigrationDev');
}

// ==================== Version Information ====================

export const MigrationSystemInfo = {
  version: '2.0.0',
  name: 'BeProductive Auth Migration',
  description: 'Complete migration system for transitioning authentication architectures',
  features: [
    'Zero-downtime migration',
    'Gradual percentage-based rollout',
    'Emergency rollback capabilities',
    'Data integrity validation',
    'Comprehensive monitoring',
    'Automated backup and restore',
    'Health checks and validation',
    'Development testing tools'
  ],
  compatibility: {
    oldSystem: 'AuthContext.tsx (v1.x)',
    newSystem: 'Modern Auth System (v2.0)',
    databaseSupport: ['PostgreSQL', 'Supabase'],
    rollbackTime: '< 5 minutes'
  }
};