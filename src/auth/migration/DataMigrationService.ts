/**
 * Data Migration Service
 *
 * Handles safe migration of user data from the old authentication system
 * to the new system with backup, rollback, and integrity validation.
 */

import { supabase } from '../../integrations/supabase/client';

// ==================== Types ====================

export interface MigrationResult {
  success: boolean;
  migrationId?: string;
  error?: Error | string;
  metadata?: {
    startTime: string;
    endTime: string;
    duration: number;
    dataIntegrityChecks: boolean;
    backupCreated: boolean;
  };
}

export interface UserMigrationData {
  userId: string;
  email: string;
  fullName?: string;
  role: string;
  subscriptionTier: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MigrationStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  migrationVersion: string;
  dataIntegrityChecks: boolean;
  backupLocation?: string;
}

// ==================== Data Migration Service ====================

export class DataMigrationService {
  private static readonly MIGRATION_VERSION = '2.0.0';
  private static readonly BACKUP_TABLE_PREFIX = 'migration_backup_';

  /**
   * Migrate user data to the new authentication system
   */
  static async migrateUserData(userId: string): Promise<MigrationResult> {
    const startTime = new Date().toISOString();
    const migrationId = `migration_${userId}_${Date.now()}`;

    try {
      console.info(`[DATA MIGRATION] Starting migration for user: ${userId}`);

      // Step 1: Validate user exists and get current data
      const userData = await this.validateAndFetchUserData(userId);
      if (!userData) {
        throw new Error(`User not found: ${userId}`);
      }

      // Step 2: Create backup of current data
      const backupResult = await this.createUserDataBackup(userId, userData);
      if (!backupResult.success) {
        throw new Error(`Backup failed: ${backupResult.error}`);
      }

      // Step 3: Update migration status to in_progress
      await this.updateMigrationStatus(userId, {
        status: 'in_progress',
        startedAt: startTime,
        migrationVersion: this.MIGRATION_VERSION,
        dataIntegrityChecks: false,
        backupLocation: backupResult.backupLocation
      });

      // Step 4: Transform and validate data for new system
      const transformedData = await this.transformUserDataForNewSystem(userData);

      // Step 5: Perform data integrity checks
      const integrityCheck = await this.performDataIntegrityCheck(userData, transformedData);
      if (!integrityCheck.passed) {
        throw new Error(`Data integrity check failed: ${integrityCheck.errors.join(', ')}`);
      }

      // Step 6: Update user profile with new auth system compatibility
      await this.updateUserProfileForNewAuth(userId, transformedData);

      // Step 7: Mark migration as completed
      const endTime = new Date().toISOString();
      await this.updateMigrationStatus(userId, {
        status: 'completed',
        startedAt: startTime,
        completedAt: endTime,
        migrationVersion: this.MIGRATION_VERSION,
        dataIntegrityChecks: true,
        backupLocation: backupResult.backupLocation
      });

      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

      console.info(`[DATA MIGRATION] Successfully migrated user: ${userId} (${duration}ms)`);

      return {
        success: true,
        migrationId,
        metadata: {
          startTime,
          endTime,
          duration,
          dataIntegrityChecks: true,
          backupCreated: true
        }
      };

    } catch (error) {
      console.error(`[DATA MIGRATION] Failed to migrate user: ${userId}`, error);

      // Mark migration as failed
      await this.updateMigrationStatus(userId, {
        status: 'failed',
        startedAt: startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        migrationVersion: this.MIGRATION_VERSION,
        dataIntegrityChecks: false
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Rollback user migration to the old authentication system
   */
  static async rollbackUserMigration(userId: string): Promise<MigrationResult> {
    const startTime = new Date().toISOString();

    try {
      console.info(`[DATA MIGRATION] Starting rollback for user: ${userId}`);

      // Step 1: Get current migration status
      const currentStatus = await this.getMigrationStatus(userId);
      if (!currentStatus || currentStatus.status !== 'completed') {
        throw new Error(`Cannot rollback user that is not migrated: ${userId}`);
      }

      // Step 2: Restore data from backup
      const restoreResult = await this.restoreUserDataFromBackup(userId, currentStatus.backupLocation);
      if (!restoreResult.success) {
        throw new Error(`Data restore failed: ${restoreResult.error}`);
      }

      // Step 3: Mark migration as rolled back
      const endTime = new Date().toISOString();
      await this.updateMigrationStatus(userId, {
        status: 'rolled_back',
        startedAt: currentStatus.startedAt || startTime,
        completedAt: endTime,
        migrationVersion: this.MIGRATION_VERSION,
        dataIntegrityChecks: true
      });

      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

      console.info(`[DATA MIGRATION] Successfully rolled back user: ${userId} (${duration}ms)`);

      return {
        success: true,
        metadata: {
          startTime,
          endTime,
          duration,
          dataIntegrityChecks: true,
          backupCreated: false
        }
      };

    } catch (error) {
      console.error(`[DATA MIGRATION] Failed to rollback user: ${userId}`, error);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Validate and fetch user data from the current system
   */
  private static async validateAndFetchUserData(userId: string): Promise<UserMigrationData | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      return {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role || 'user',
        subscriptionTier: profile.subscription_tier || 'free',
        emailVerified: profile.email_verified ?? false,
        onboardingCompleted: profile.onboarding_completed ?? false,
        preferences: profile.preferences,
        metadata: profile.metadata
      };

    } catch (error) {
      console.error('[DATA MIGRATION] Failed to fetch user data:', error);
      return null;
    }
  }

  /**
   * Create backup of user data before migration
   */
  private static async createUserDataBackup(
    userId: string,
    userData: UserMigrationData
  ): Promise<{ success: boolean; backupLocation?: string; error?: string }> {
    try {
      const backupId = `${this.BACKUP_TABLE_PREFIX}${userId}_${Date.now()}`;

      const { error } = await supabase
        .from('migration_backups')
        .insert({
          backup_id: backupId,
          user_id: userId,
          original_data: userData,
          backup_timestamp: new Date().toISOString(),
          migration_version: this.MIGRATION_VERSION
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        backupLocation: backupId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed'
      };
    }
  }

  /**
   * Transform user data for compatibility with the new auth system
   */
  private static async transformUserDataForNewSystem(userData: UserMigrationData): Promise<UserMigrationData> {
    // Transform data structure for new auth system
    return {
      ...userData,
      // Add any new fields required by the new system
      metadata: {
        ...userData.metadata,
        migratedAt: new Date().toISOString(),
        originalSystem: 'legacy',
        migrationVersion: this.MIGRATION_VERSION
      }
    };
  }

  /**
   * Perform data integrity checks
   */
  private static async performDataIntegrityCheck(
    originalData: UserMigrationData,
    transformedData: UserMigrationData
  ): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check essential fields are preserved
    if (originalData.userId !== transformedData.userId) {
      errors.push('User ID mismatch');
    }

    if (originalData.email !== transformedData.email) {
      errors.push('Email mismatch');
    }

    if (originalData.role !== transformedData.role) {
      errors.push('Role mismatch');
    }

    // Check data types
    if (typeof transformedData.emailVerified !== 'boolean') {
      errors.push('Email verified field is not boolean');
    }

    if (typeof transformedData.onboardingCompleted !== 'boolean') {
      errors.push('Onboarding completed field is not boolean');
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * Update user profile for new auth system compatibility
   */
  private static async updateUserProfileForNewAuth(
    userId: string,
    transformedData: UserMigrationData
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        // Update any fields that need to be modified for new auth system
        metadata: transformedData.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Update migration status in the database
   */
  private static async updateMigrationStatus(userId: string, status: MigrationStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_migrations')
        .upsert({
          user_id: userId,
          migration_status: status.status,
          started_at: status.startedAt,
          completed_at: status.completedAt,
          error_message: status.error,
          migration_version: status.migrationVersion,
          data_integrity_checks: status.dataIntegrityChecks,
          backup_location: status.backupLocation,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[DATA MIGRATION] Failed to update migration status:', error);
      // Don't throw here as this shouldn't fail the migration
    }
  }

  /**
   * Get migration status for a user
   */
  static async getMigrationStatus(userId: string): Promise<MigrationStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_migrations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        status: data.migration_status,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        error: data.error_message,
        migrationVersion: data.migration_version,
        dataIntegrityChecks: data.data_integrity_checks,
        backupLocation: data.backup_location
      };

    } catch (error) {
      console.error('[DATA MIGRATION] Failed to get migration status:', error);
      return null;
    }
  }

  /**
   * Restore user data from backup
   */
  private static async restoreUserDataFromBackup(
    userId: string,
    backupLocation?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!backupLocation) {
        throw new Error('No backup location provided');
      }

      const { data: backup, error } = await supabase
        .from('migration_backups')
        .select('original_data')
        .eq('backup_id', backupLocation)
        .eq('user_id', userId)
        .single();

      if (error || !backup) {
        throw new Error(`Backup not found: ${backupLocation}`);
      }

      const originalData = backup.original_data as UserMigrationData;

      // Restore original data structure
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: originalData.fullName,
          role: originalData.role,
          subscription_tier: originalData.subscriptionTier,
          email_verified: originalData.emailVerified,
          onboarding_completed: originalData.onboardingCompleted,
          preferences: originalData.preferences,
          metadata: originalData.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed'
      };
    }
  }

  /**
   * Get migration statistics
   */
  static async getMigrationStatistics(): Promise<{
    totalUsers: number;
    pendingMigrations: number;
    completedMigrations: number;
    failedMigrations: number;
    rolledBackMigrations: number;
    successRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_migrations')
        .select('migration_status');

      if (error) throw error;

      const stats = data.reduce((acc, item) => {
        acc.totalUsers++;
        switch (item.migration_status) {
          case 'pending':
            acc.pendingMigrations++;
            break;
          case 'completed':
            acc.completedMigrations++;
            break;
          case 'failed':
            acc.failedMigrations++;
            break;
          case 'rolled_back':
            acc.rolledBackMigrations++;
            break;
        }
        return acc;
      }, {
        totalUsers: 0,
        pendingMigrations: 0,
        completedMigrations: 0,
        failedMigrations: 0,
        rolledBackMigrations: 0
      });

      const successRate = stats.totalUsers > 0
        ? (stats.completedMigrations / stats.totalUsers) * 100
        : 0;

      return { ...stats, successRate };

    } catch (error) {
      console.error('[DATA MIGRATION] Failed to get migration statistics:', error);
      return {
        totalUsers: 0,
        pendingMigrations: 0,
        completedMigrations: 0,
        failedMigrations: 0,
        rolledBackMigrations: 0,
        successRate: 0
      };
    }
  }
}

// ==================== Export ====================

export default DataMigrationService;