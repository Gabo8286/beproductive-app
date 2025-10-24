/**
 * Analytics Storage Module
 * Handles data persistence and loading for analytics system
 */

import type {
  DailyProductivityStats,
  BehaviorPattern,
  PersonalRecommendation,
  Achievement,
  StoredAnalyticsData
} from './types';
import type { ProductivityInsight } from '@/types/ai';

export class AnalyticsStorageService {
  private readonly STORAGE_KEY = 'beproductive-analytics';
  private readonly BACKUP_KEY = 'beproductive-analytics-backup';
  private readonly VERSION_KEY = 'beproductive-analytics-version';
  private readonly CURRENT_VERSION = '2.0.0';

  /**
   * Save analytics data to localStorage
   */
  saveData(data: {
    dailyData: Map<string, DailyProductivityStats>;
    patterns: BehaviorPattern[];
    insights: ProductivityInsight[];
    recommendations: PersonalRecommendation[];
    achievements: Achievement[];
  }): boolean {
    try {
      const storedData: StoredAnalyticsData = {
        dailyData: Array.from(data.dailyData.entries()),
        patterns: data.patterns,
        insights: data.insights,
        recommendations: data.recommendations,
        achievements: data.achievements
      };

      // Create backup of current data before saving new data
      this.createBackup();

      // Save new data
      const serializedData = JSON.stringify(storedData);
      localStorage.setItem(this.STORAGE_KEY, serializedData);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);

      // Validate the save operation
      const verification = localStorage.getItem(this.STORAGE_KEY);
      if (!verification) {
        throw new Error('Save verification failed');
      }

      console.log('📊 Analytics Storage: Data saved successfully');
      return true;

    } catch (error) {
      console.error('📊 Analytics Storage: Failed to save data:', error);
      this.restoreFromBackup();
      return false;
    }
  }

  /**
   * Load analytics data from localStorage
   */
  loadData(): {
    dailyData: Map<string, DailyProductivityStats>;
    patterns: BehaviorPattern[];
    insights: ProductivityInsight[];
    recommendations: PersonalRecommendation[];
    achievements: Achievement[];
  } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const version = localStorage.getItem(this.VERSION_KEY);

      if (!stored) {
        console.log('📊 Analytics Storage: No stored data found');
        return null;
      }

      // Check for version compatibility
      if (version && this.needsMigration(version)) {
        console.log('📊 Analytics Storage: Migrating data from version', version);
        return this.migrateData(stored, version);
      }

      const data: StoredAnalyticsData = JSON.parse(stored);

      // Validate data structure
      if (!this.validateDataStructure(data)) {
        throw new Error('Invalid data structure');
      }

      console.log('📊 Analytics Storage: Data loaded successfully');

      return {
        dailyData: new Map(data.dailyData || []),
        patterns: data.patterns || [],
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        achievements: data.achievements || []
      };

    } catch (error) {
      console.warn('📊 Analytics Storage: Failed to load data:', error);
      return this.attemptDataRecovery();
    }
  }

  /**
   * Create backup of current data
   */
  private createBackup(): void {
    try {
      const currentData = localStorage.getItem(this.STORAGE_KEY);
      if (currentData) {
        localStorage.setItem(this.BACKUP_KEY, currentData);
        console.log('📊 Analytics Storage: Backup created');
      }
    } catch (error) {
      console.warn('📊 Analytics Storage: Failed to create backup:', error);
    }
  }

  /**
   * Restore data from backup
   */
  private restoreFromBackup(): boolean {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (backupData) {
        localStorage.setItem(this.STORAGE_KEY, backupData);
        console.log('📊 Analytics Storage: Data restored from backup');
        return true;
      }
      return false;
    } catch (error) {
      console.error('📊 Analytics Storage: Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Check if data needs migration
   */
  private needsMigration(version: string): boolean {
    const currentVersion = this.CURRENT_VERSION.split('.').map(Number);
    const dataVersion = version.split('.').map(Number);

    // Compare major.minor version (ignore patch)
    return (
      dataVersion[0] < currentVersion[0] ||
      (dataVersion[0] === currentVersion[0] && dataVersion[1] < currentVersion[1])
    );
  }

  /**
   * Migrate data from older versions
   */
  private migrateData(stored: string, fromVersion: string): any {
    try {
      const data = JSON.parse(stored);

      // Migration logic for different versions
      if (fromVersion.startsWith('1.')) {
        return this.migrateFromV1(data);
      }

      return data;
    } catch (error) {
      console.error('📊 Analytics Storage: Migration failed:', error);
      return null;
    }
  }

  /**
   * Migrate from version 1.x to 2.x
   */
  private migrateFromV1(data: any): any {
    try {
      // Add new fields that might be missing in v1
      const migratedData = {
        dailyData: data.dailyData || [],
        patterns: (data.patterns || []).map((pattern: any) => ({
          ...pattern,
          confidence: pattern.confidence || 0.5, // Add default confidence
          discoveredAt: pattern.discoveredAt ? new Date(pattern.discoveredAt) : new Date()
        })),
        insights: (data.insights || []).map((insight: any) => ({
          ...insight,
          generatedAt: insight.generatedAt ? new Date(insight.generatedAt) : new Date()
        })),
        recommendations: (data.recommendations || []).map((rec: any) => ({
          ...rec,
          createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date()
        })),
        achievements: (data.achievements || []).map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : new Date()
        }))
      };

      console.log('📊 Analytics Storage: Successfully migrated from v1');
      return migratedData;
    } catch (error) {
      console.error('📊 Analytics Storage: V1 migration failed:', error);
      return null;
    }
  }

  /**
   * Validate data structure integrity
   */
  private validateDataStructure(data: any): boolean {
    try {
      // Check required fields exist
      if (!data || typeof data !== 'object') return false;

      // Validate dailyData structure
      if (data.dailyData && !Array.isArray(data.dailyData)) return false;

      // Validate arrays
      const arrayFields = ['patterns', 'insights', 'recommendations', 'achievements'];
      for (const field of arrayFields) {
        if (data[field] && !Array.isArray(data[field])) return false;
      }

      // Additional validation for critical fields
      if (data.dailyData) {
        for (const [date, stats] of data.dailyData) {
          if (typeof date !== 'string' || !stats || typeof stats !== 'object') {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('📊 Analytics Storage: Validation failed:', error);
      return false;
    }
  }

  /**
   * Attempt data recovery from backup or partial data
   */
  private attemptDataRecovery(): any {
    console.log('📊 Analytics Storage: Attempting data recovery...');

    // Try backup first
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (backupData) {
        const data = JSON.parse(backupData);
        if (this.validateDataStructure(data)) {
          console.log('📊 Analytics Storage: Recovered from backup');
          return {
            dailyData: new Map(data.dailyData || []),
            patterns: data.patterns || [],
            insights: data.insights || [],
            recommendations: data.recommendations || [],
            achievements: data.achievements || []
          };
        }
      }
    } catch (error) {
      console.error('📊 Analytics Storage: Backup recovery failed:', error);
    }

    // Try partial recovery
    try {
      return this.partialDataRecovery();
    } catch (error) {
      console.error('📊 Analytics Storage: Partial recovery failed:', error);
      return null;
    }
  }

  /**
   * Attempt to recover partial data
   */
  private partialDataRecovery(): any {
    const recovered = {
      dailyData: new Map(),
      patterns: [],
      insights: [],
      recommendations: [],
      achievements: []
    };

    // Try to recover individual pieces
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Recover what we can
        if (data.dailyData && Array.isArray(data.dailyData)) {
          recovered.dailyData = new Map(data.dailyData);
        }
        if (data.patterns && Array.isArray(data.patterns)) {
          recovered.patterns = data.patterns;
        }
        if (data.insights && Array.isArray(data.insights)) {
          recovered.insights = data.insights;
        }
        if (data.recommendations && Array.isArray(data.recommendations)) {
          recovered.recommendations = data.recommendations;
        }
        if (data.achievements && Array.isArray(data.achievements)) {
          recovered.achievements = data.achievements;
        }

        console.log('📊 Analytics Storage: Partial recovery successful');
      }
    } catch (error) {
      console.error('📊 Analytics Storage: Partial recovery failed:', error);
    }

    return recovered;
  }

  /**
   * Clear all stored data
   */
  clearData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      localStorage.removeItem(this.VERSION_KEY);
      console.log('📊 Analytics Storage: All data cleared');
    } catch (error) {
      console.error('📊 Analytics Storage: Failed to clear data:', error);
    }
  }

  /**
   * Export data for backup purposes
   */
  exportData(): string | null {
    try {
      const data = this.loadData();
      if (!data) return null;

      const exportData = {
        ...data,
        dailyData: Array.from(data.dailyData.entries()),
        exportedAt: new Date().toISOString(),
        version: this.CURRENT_VERSION
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('📊 Analytics Storage: Export failed:', error);
      return null;
    }
  }

  /**
   * Import data from backup
   */
  importData(exportedData: string): boolean {
    try {
      const data = JSON.parse(exportedData);

      if (!this.validateDataStructure(data)) {
        throw new Error('Invalid imported data structure');
      }

      // Convert back to the expected format
      const importData = {
        dailyData: new Map(data.dailyData || []),
        patterns: data.patterns || [],
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        achievements: data.achievements || []
      };

      return this.saveData(importData);
    } catch (error) {
      console.error('📊 Analytics Storage: Import failed:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const backup = localStorage.getItem(this.BACKUP_KEY);
      const version = localStorage.getItem(this.VERSION_KEY);

      return {
        hasData: !!stored,
        hasBackup: !!backup,
        version: version || 'unknown',
        dataSize: stored ? stored.length : 0,
        backupSize: backup ? backup.length : 0,
        lastModified: this.getLastModifiedDate()
      };
    } catch (error) {
      console.error('📊 Analytics Storage: Failed to get storage stats:', error);
      return {
        hasData: false,
        hasBackup: false,
        version: 'unknown',
        dataSize: 0,
        backupSize: 0,
        lastModified: null
      };
    }
  }

  /**
   * Get last modified date (approximation)
   */
  private getLastModifiedDate(): Date | null {
    try {
      const data = this.loadData();
      if (!data) return null;

      // Find the most recent date from various data sources
      const dates: Date[] = [];

      // Check daily data
      for (const [, stats] of data.dailyData) {
        if (stats.date) {
          dates.push(new Date(stats.date));
        }
      }

      // Check patterns
      data.patterns.forEach(p => dates.push(p.discoveredAt));

      // Check insights
      data.insights.forEach(i => dates.push(i.generatedAt));

      // Check recommendations
      data.recommendations.forEach(r => dates.push(r.createdAt));

      // Check achievements
      data.achievements.forEach(a => dates.push(a.unlockedAt));

      return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
    } catch (error) {
      return null;
    }
  }
}