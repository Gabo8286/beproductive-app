// Backup & Recovery Agent
import { ClaudeClient } from '@/agents/shared/claude-client';
import { NotificationService } from '@/agents/shared/notification-service';
import { AgentConfig, getConfig } from '@/agents/shared/config';

export interface BackupResult {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'schema';
  status: 'success' | 'failed' | 'partial';
  size_bytes: number;
  duration_ms: number;
  tables_backed_up: string[];
  error?: string;
  storage_location: string;
}

export interface BackupConfig {
  schedule: {
    full_backup: string; // cron format
    incremental_backup: string;
    schema_backup: string;
  };
  retention: {
    daily_backups: number; // days to keep
    weekly_backups: number;
    monthly_backups: number;
  };
  storage: {
    primary_location: string;
    secondary_location?: string;
    encryption_enabled: boolean;
  };
}

export interface RestoreOperation {
  id: string;
  backup_id: string;
  timestamp: string;
  target_environment: string;
  status: 'in_progress' | 'success' | 'failed';
  tables_restored: string[];
  duration_ms?: number;
  error?: string;
}

export class BackupRecoveryAgent {
  private config: AgentConfig;
  private claude: ClaudeClient;
  private notifications: NotificationService;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private backupHistory: BackupResult[] = [];

  private readonly backupConfig: BackupConfig = {
    schedule: {
      full_backup: '0 2 * * *', // Daily at 2 AM
      incremental_backup: '0 */6 * * *', // Every 6 hours
      schema_backup: '0 1 * * 0', // Weekly on Sunday at 1 AM
    },
    retention: {
      daily_backups: 7,
      weekly_backups: 4,
      monthly_backups: 12,
    },
    storage: {
      primary_location: 's3://beproductive-backups/',
      secondary_location: 'gs://beproductive-backup-secondary/',
      encryption_enabled: true,
    },
  };

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...getConfig(), ...config };
    this.claude = new ClaudeClient(this.config.claudeApiKey, this.config.claudeModel);
    this.notifications = new NotificationService(this.config);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('💾 Backup Agent is already running');
      return;
    }

    this.isRunning = true;
    console.log('💾 Starting Backup & Recovery Agent...');

    // Run initial backup verification
    await this.verifyBackupSystem();

    // Schedule backup operations
    this.intervalId = setInterval(async () => {
      try {
        await this.runScheduledBackups();
        await this.cleanupOldBackups();
        await this.verifyBackupIntegrity();
      } catch (error) {
        console.error('Backup operation failed:', error);
        await this.notifications.sendError(
          'BackupAgent',
          'Backup Operation Failed',
          `Failed to complete backup operations: ${error}`,
        );
      }
    }, this.config.intervals.backup);

    await this.notifications.sendInfo(
      'BackupAgent',
      'Backup Agent Started',
      `Backup monitoring active with daily backup schedule`,
    );
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    console.log('💾 Backup Agent stopped');
    await this.notifications.sendInfo(
      'BackupAgent',
      'Backup Agent Stopped',
      'Backup monitoring has been gracefully shut down',
    );
  }

  private async verifyBackupSystem(): Promise<void> {
    try {
      console.log('💾 Verifying backup system...');

      // Check storage connectivity
      const storageStatus = await this.checkStorageConnectivity();

      // Check database connectivity
      const dbStatus = await this.checkDatabaseConnectivity();

      // Verify encryption setup
      const encryptionStatus = await this.verifyEncryption();

      if (!storageStatus || !dbStatus || !encryptionStatus) {
        throw new Error('Backup system verification failed');
      }

      console.log('✅ Backup system verified successfully');
    } catch (error) {
      await this.notifications.sendCritical(
        'BackupAgent',
        'Backup System Verification Failed',
        `Critical backup system issues detected: ${error}`,
      );
      throw error;
    }
  }

  private async checkStorageConnectivity(): Promise<boolean> {
    try {
      // In production, you'd test actual S3/GCS connectivity
      // For simulation, we'll just validate configuration
      console.log('Checking storage connectivity...');

      if (!this.backupConfig.storage.primary_location) {
        throw new Error('Primary storage location not configured');
      }

      // Simulate storage test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Storage connectivity check failed:', error);
      return false;
    }
  }

  private async checkDatabaseConnectivity(): Promise<boolean> {
    try {
      // Test Supabase connectivity
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.config.supabaseKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Database connectivity check failed:', error);
      return false;
    }
  }

  private async verifyEncryption(): Promise<boolean> {
    try {
      // Verify encryption configuration
      return this.backupConfig.storage.encryption_enabled;
    } catch (error) {
      console.error('Encryption verification failed:', error);
      return false;
    }
  }

  private async runScheduledBackups(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Full backup at 2 AM daily
    if (hour === 2) {
      await this.createFullBackup();
    }

    // Incremental backup every 6 hours
    if (hour % 6 === 0 && hour !== 2) {
      await this.createIncrementalBackup();
    }

    // Schema backup on Sundays at 1 AM
    if (dayOfWeek === 0 && hour === 1) {
      await this.createSchemaBackup();
    }
  }

  private async createFullBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = `full_${Date.now()}`;

    try {
      console.log('💾 Creating full backup...');

      // Get all tables
      const tables = await this.getDatabaseTables();

      // Simulate backup creation
      await this.simulateBackupOperation('full', tables);

      const duration = Date.now() - startTime;
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'full',
        status: 'success',
        size_bytes: Math.floor(Math.random() * 1000000000 + 100000000), // 100MB - 1GB
        duration_ms: duration,
        tables_backed_up: tables,
        storage_location: `${this.backupConfig.storage.primary_location}${backupId}.sql.gz`,
      };

      this.backupHistory.push(result);

      await this.notifications.sendInfo(
        'BackupAgent',
        'Full Backup Completed',
        `Backup ${backupId} completed successfully in ${duration}ms`,
        result,
      );

      return result;
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'full',
        status: 'failed',
        size_bytes: 0,
        duration_ms: Date.now() - startTime,
        tables_backed_up: [],
        error: String(error),
        storage_location: '',
      };

      this.backupHistory.push(result);

      await this.notifications.sendError(
        'BackupAgent',
        'Full Backup Failed',
        `Backup ${backupId} failed: ${error}`,
        result,
      );

      throw error;
    }
  }

  private async createIncrementalBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = `incremental_${Date.now()}`;

    try {
      console.log('💾 Creating incremental backup...');

      // Get tables with recent changes
      const changedTables = await this.getChangedTables();

      if (changedTables.length === 0) {
        console.log('No changes detected, skipping incremental backup');
        return {
          id: backupId,
          timestamp: new Date().toISOString(),
          type: 'incremental',
          status: 'success',
          size_bytes: 0,
          duration_ms: Date.now() - startTime,
          tables_backed_up: [],
          storage_location: '',
        };
      }

      await this.simulateBackupOperation('incremental', changedTables);

      const duration = Date.now() - startTime;
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'incremental',
        status: 'success',
        size_bytes: Math.floor(Math.random() * 100000000 + 10000000), // 10MB - 100MB
        duration_ms: duration,
        tables_backed_up: changedTables,
        storage_location: `${this.backupConfig.storage.primary_location}${backupId}.sql.gz`,
      };

      this.backupHistory.push(result);

      return result;
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'incremental',
        status: 'failed',
        size_bytes: 0,
        duration_ms: Date.now() - startTime,
        tables_backed_up: [],
        error: String(error),
        storage_location: '',
      };

      this.backupHistory.push(result);
      throw error;
    }
  }

  private async createSchemaBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = `schema_${Date.now()}`;

    try {
      console.log('💾 Creating schema backup...');

      // Get database schema
      const schema = await this.getDatabaseSchema();

      await this.simulateSchemaBackup(schema);

      const duration = Date.now() - startTime;
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'schema',
        status: 'success',
        size_bytes: Math.floor(Math.random() * 10000000 + 1000000), // 1MB - 10MB
        duration_ms: duration,
        tables_backed_up: ['schema_definitions'],
        storage_location: `${this.backupConfig.storage.primary_location}schema/${backupId}.sql`,
      };

      this.backupHistory.push(result);

      return result;
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'schema',
        status: 'failed',
        size_bytes: 0,
        duration_ms: Date.now() - startTime,
        tables_backed_up: [],
        error: String(error),
        storage_location: '',
      };

      this.backupHistory.push(result);
      throw error;
    }
  }

  private async getDatabaseTables(): Promise<string[]> {
    // In production, you'd query the database for actual table names
    return [
      'profiles',
      'workspaces',
      'workspace_members',
      'tasks',
      'goals',
      'milestones',
      'habits',
      'habit_entries',
      'time_entries',
      'active_timers',
      'tags',
      'quick_todos',
      'achievements',
      'user_achievements',
      'projects',
      'notes',
    ];
  }

  private async getChangedTables(): Promise<string[]> {
    // Simulate checking for tables with recent changes
    const allTables = await this.getDatabaseTables();
    const changePercentage = 0.3; // 30% chance each table has changes

    return allTables.filter(() => Math.random() < changePercentage);
  }

  private async getDatabaseSchema(): Promise<string> {
    // In production, you'd extract the actual database schema
    return 'CREATE TABLE ... (simulated schema)';
  }

  private async simulateBackupOperation(type: string, tables: string[]): Promise<void> {
    // Simulate backup time based on table count
    const baseTime = 1000; // 1 second base
    const timePerTable = 500; // 500ms per table
    const totalTime = baseTime + (tables.length * timePerTable);

    await new Promise(resolve => setTimeout(resolve, totalTime));
  }

  private async simulateSchemaBackup(schema: string): Promise<void> {
    // Simulate schema backup time
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.backupConfig.retention.daily_backups);

      const oldBackups = this.backupHistory.filter(
        backup => new Date(backup.timestamp) < cutoffDate,
      );

      if (oldBackups.length > 0) {
        console.log(`🧹 Cleaning up ${oldBackups.length} old backups...`);

        // Remove from history (in production, delete from storage too)
        this.backupHistory = this.backupHistory.filter(
          backup => new Date(backup.timestamp) >= cutoffDate,
        );

        await this.notifications.sendInfo(
          'BackupAgent',
          'Backup Cleanup Completed',
          `Cleaned up ${oldBackups.length} old backups`,
        );
      }
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      await this.notifications.sendWarning(
        'BackupAgent',
        'Backup Cleanup Failed',
        `Failed to clean up old backups: ${error}`,
      );
    }
  }

  private async verifyBackupIntegrity(): Promise<void> {
    try {
      const recentBackups = this.backupHistory
        .filter(backup => backup.status === 'success')
        .slice(-5); // Check last 5 successful backups

      for (const backup of recentBackups) {
        const isValid = await this.testBackupIntegrity(backup);
        if (!isValid) {
          await this.notifications.sendError(
            'BackupAgent',
            'Backup Integrity Check Failed',
            `Backup ${backup.id} failed integrity verification`,
            backup,
          );
        }
      }
    } catch (error) {
      console.error('Backup integrity verification failed:', error);
    }
  }

  private async testBackupIntegrity(backup: BackupResult): Promise<boolean> {
    try {
      // Simulate integrity check
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 95% chance backup is valid (simulate occasional corruption)
      return Math.random() < 0.95;
    } catch (error) {
      console.error(`Integrity check failed for backup ${backup.id}:`, error);
      return false;
    }
  }

  // Public API methods
  async createManualBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupResult> {
    console.log(`💾 Creating manual ${type} backup...`);

    if (type === 'full') {
      return await this.createFullBackup();
    } else {
      return await this.createIncrementalBackup();
    }
  }

  async restoreFromBackup(backupId: string, targetEnvironment = 'staging'): Promise<RestoreOperation> {
    const startTime = Date.now();
    const restoreId = `restore_${Date.now()}`;

    try {
      const backup = this.backupHistory.find(b => b.id === backupId);
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }

      console.log(`🔄 Starting restore operation ${restoreId}...`);

      // Simulate restore operation
      await this.simulateRestoreOperation(backup);

      const duration = Date.now() - startTime;
      const result: RestoreOperation = {
        id: restoreId,
        backup_id: backupId,
        timestamp: new Date().toISOString(),
        target_environment: targetEnvironment,
        status: 'success',
        tables_restored: backup.tables_backed_up,
        duration_ms: duration,
      };

      await this.notifications.sendInfo(
        'BackupAgent',
        'Restore Operation Completed',
        `Successfully restored backup ${backupId} to ${targetEnvironment}`,
        result,
      );

      return result;
    } catch (error) {
      const result: RestoreOperation = {
        id: restoreId,
        backup_id: backupId,
        timestamp: new Date().toISOString(),
        target_environment: targetEnvironment,
        status: 'failed',
        tables_restored: [],
        duration_ms: Date.now() - startTime,
        error: String(error),
      };

      await this.notifications.sendError(
        'BackupAgent',
        'Restore Operation Failed',
        `Failed to restore backup ${backupId}: ${error}`,
        result,
      );

      return result;
    }
  }

  private async simulateRestoreOperation(backup: BackupResult): Promise<void> {
    // Simulate restore time based on backup size
    const baseTime = 2000; // 2 seconds base
    const timePerMB = 100; // 100ms per MB
    const sizeInMB = backup.size_bytes / (1024 * 1024);
    const totalTime = baseTime + (sizeInMB * timePerMB);

    await new Promise(resolve => setTimeout(resolve, Math.min(totalTime, 30000))); // Max 30 seconds
  }

  getBackupHistory(): BackupResult[] {
    return [...this.backupHistory];
  }

  getBackupStatus(): {
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    last_backup: BackupResult | null;
    storage_used_bytes: number;
  } {
    const successfulBackups = this.backupHistory.filter(b => b.status === 'success');
    const failedBackups = this.backupHistory.filter(b => b.status === 'failed');
    const lastBackup = this.backupHistory[this.backupHistory.length - 1] || null;
    const storageUsed = successfulBackups.reduce((total, backup) => total + backup.size_bytes, 0);

    return {
      total_backups: this.backupHistory.length,
      successful_backups: successfulBackups.length,
      failed_backups: failedBackups.length,
      last_backup: lastBackup,
      storage_used_bytes: storageUsed,
    };
  }
}