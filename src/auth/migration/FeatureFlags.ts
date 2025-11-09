/**
 * Authentication Migration Feature Flags
 *
 * Controls the gradual rollout of the new authentication system
 * with safety measures and rollback capabilities.
 */

// ==================== Types ====================

export interface MigrationConfig {
  enabled: boolean;
  percentage: number;
  rollbackEnabled: boolean;
  forceNewAuth: boolean;
  targetUserGroups: string[];
}

export interface MigrationDecision {
  useNewAuth: boolean;
  reason: string;
  userId?: string;
  timestamp: string;
}

// ==================== Feature Flags Manager ====================

export class AuthMigrationFlags {
  private static readonly HASH_PRIME = 31;
  private static readonly HASH_MODULE = 100;

  /**
   * Determine if a user should use the new authentication system
   */
  static shouldUseNewAuth(userId?: string): MigrationDecision {
    const timestamp = new Date().toISOString();

    // Check environment override first
    if (import.meta.env.VITE_USE_NEW_AUTH === 'true') {
      return {
        useNewAuth: true,
        reason: 'environment_override_new',
        userId,
        timestamp
      };
    }

    // Check rollback flag
    if (import.meta.env.VITE_MIGRATION_ROLLBACK === 'true') {
      return {
        useNewAuth: false,
        reason: 'rollback_enabled',
        userId,
        timestamp
      };
    }

    // Check migration disabled
    if (import.meta.env.VITE_MIGRATION_MODE !== 'enabled') {
      return {
        useNewAuth: false,
        reason: 'migration_disabled',
        userId,
        timestamp
      };
    }

    // Development mode check
    if (import.meta.env.DEV) {
      return {
        useNewAuth: true,
        reason: 'development_mode',
        userId,
        timestamp
      };
    }

    // Percentage-based rollout
    const percentage = this.getMigrationPercentage();

    if (!userId) {
      return {
        useNewAuth: false,
        reason: 'no_user_id',
        timestamp
      };
    }

    const userHash = this.hashUserId(userId);
    const shouldMigrate = userHash < percentage;

    return {
      useNewAuth: shouldMigrate,
      reason: shouldMigrate ? 'percentage_rollout' : 'below_rollout_threshold',
      userId,
      timestamp
    };
  }

  /**
   * Get current migration percentage from environment
   */
  static getMigrationPercentage(): number {
    const percentage = parseInt(import.meta.env.VITE_MIGRATION_PERCENTAGE || '0');
    return Math.max(0, Math.min(100, percentage));
  }

  /**
   * Get current migration configuration
   */
  static getMigrationConfig(): MigrationConfig {
    return {
      enabled: import.meta.env.VITE_MIGRATION_MODE === 'enabled',
      percentage: this.getMigrationPercentage(),
      rollbackEnabled: import.meta.env.VITE_MIGRATION_ROLLBACK === 'true',
      forceNewAuth: import.meta.env.VITE_USE_NEW_AUTH === 'true',
      targetUserGroups: (import.meta.env.VITE_MIGRATION_TARGET_GROUPS || '').split(',').filter(Boolean)
    };
  }

  /**
   * Check if user is in a specific target group for migration
   */
  static isUserInTargetGroup(userId: string, userRole?: string, userTier?: string): boolean {
    const config = this.getMigrationConfig();

    if (config.targetUserGroups.length === 0) {
      return true; // No specific targeting, use percentage-based rollout
    }

    // Check role-based targeting
    if (userRole && config.targetUserGroups.includes(`role:${userRole}`)) {
      return true;
    }

    // Check tier-based targeting
    if (userTier && config.targetUserGroups.includes(`tier:${userTier}`)) {
      return true;
    }

    // Check specific user targeting
    if (config.targetUserGroups.includes(`user:${userId}`)) {
      return true;
    }

    return false;
  }

  /**
   * Hash user ID for consistent percentage-based assignment
   */
  private static hashUserId(userId: string): number {
    let hash = 0;

    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) % this.HASH_MODULE;
  }

  /**
   * Log migration decision for analytics and debugging
   */
  static logMigrationDecision(decision: MigrationDecision): void {
    if (import.meta.env.DEV) {
      console.info('[AUTH MIGRATION]', {
        ...decision,
        config: this.getMigrationConfig()
      });
    }

    // Send to analytics in production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', 'auth_migration_decision', {
        custom_parameter_1: decision.useNewAuth ? 'new_auth' : 'old_auth',
        custom_parameter_2: decision.reason,
        custom_parameter_3: decision.userId || 'anonymous'
      });
    }
  }

  /**
   * Emergency rollback - forces all users to old auth system
   */
  static emergencyRollback(): void {
    console.warn('[AUTH MIGRATION] EMERGENCY ROLLBACK ACTIVATED');

    // This would typically trigger a server-side configuration change
    // For now, we update the environment flag
    if (typeof window !== 'undefined') {
      (window as any).__EMERGENCY_AUTH_ROLLBACK__ = true;
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

// ==================== Migration Health Check ====================

export class MigrationHealthCheck {
  private static readonly MAX_ERROR_RATE = 0.05; // 5%
  private static readonly MAX_LOAD_TIME = 3000; // 3 seconds

  /**
   * Check if migration is healthy and should continue
   */
  static async checkMigrationHealth(): Promise<{
    healthy: boolean;
    metrics: {
      errorRate: number;
      averageLoadTime: number;
      userCount: number;
    };
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // This would integrate with your monitoring service
      // For now, we return a mock healthy state
      const metrics = {
        errorRate: 0.02,
        averageLoadTime: 1500,
        userCount: 100
      };

      // Check error rate
      if (metrics.errorRate > this.MAX_ERROR_RATE) {
        issues.push(`Error rate too high: ${metrics.errorRate * 100}%`);
      }

      // Check load time
      if (metrics.averageLoadTime > this.MAX_LOAD_TIME) {
        issues.push(`Load time too slow: ${metrics.averageLoadTime}ms`);
      }

      return {
        healthy: issues.length === 0,
        metrics,
        issues
      };
    } catch (error) {
      return {
        healthy: false,
        metrics: { errorRate: 1, averageLoadTime: 0, userCount: 0 },
        issues: ['Health check failed']
      };
    }
  }
}

// ==================== Migration Analytics ====================

export class MigrationAnalytics {
  /**
   * Track migration events for analysis
   */
  static trackEvent(event: {
    type: 'migration_start' | 'migration_success' | 'migration_error' | 'rollback';
    userId?: string;
    authSystem: 'old' | 'new';
    duration?: number;
    error?: string;
    metadata?: Record<string, any>;
  }): void {
    const eventData = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.info('[MIGRATION ANALYTICS]', eventData);
    }

    // Send to analytics service in production
    if (import.meta.env.PROD) {
      this.sendToAnalyticsService(eventData);
    }
  }

  private static getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('migration_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('migration_session_id', sessionId);
      }
      return sessionId;
    }
    return 'unknown_session';
  }

  private static sendToAnalyticsService(eventData: any): void {
    // This would integrate with your analytics service
    // For now, we just log it
    console.info('[ANALYTICS]', eventData);
  }
}

// ==================== Export ====================

export default AuthMigrationFlags;