# Authentication System Migration Strategy

This document outlines the complete strategy for migrating from the old authentication system (AuthContext.tsx) to the new modern authentication system while ensuring zero downtime and data integrity.

## Migration Overview

### Current State
- **Old System**: 924-line AuthContext.tsx with complex state management
- **New System**: Modular architecture with 73% code reduction
- **Challenge**: Seamless transition without user disruption

### Migration Goals
1. **Zero Downtime**: Users continue normal operation during migration
2. **Data Integrity**: No user data loss or corruption
3. **Gradual Rollout**: Feature flags enable controlled deployment
4. **Rollback Ready**: Instant rollback capability if issues arise
5. **Performance**: Improved performance metrics post-migration

## Phase 1: Preparation & Safety Measures

### 1.1 Database Backup & Preparation
```sql
-- Create backup tables for existing auth data
CREATE TABLE auth_migration_backup AS
SELECT * FROM auth.users;

CREATE TABLE profiles_migration_backup AS
SELECT * FROM public.profiles;

-- Add migration tracking
ALTER TABLE public.profiles
ADD COLUMN migration_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN migration_timestamp TIMESTAMP,
ADD COLUMN old_auth_data JSONB;
```

### 1.2 Environment Variables Setup
```bash
# Add to .env files
VITE_USE_NEW_AUTH=false           # Start with old system
VITE_MIGRATION_MODE=enabled       # Enable migration features
VITE_MIGRATION_ROLLBACK=false     # Rollback flag
VITE_MIGRATION_PERCENTAGE=0       # Percentage of users on new system
```

### 1.3 Feature Flag Implementation
```typescript
// src/auth/migration/FeatureFlags.ts
export class AuthMigrationFlags {
  static shouldUseNewAuth(userId?: string): boolean {
    // Environment override
    if (import.meta.env.VITE_USE_NEW_AUTH === 'true') return true;
    if (import.meta.env.VITE_MIGRATION_ROLLBACK === 'true') return false;

    // Percentage-based rollout
    const percentage = parseInt(import.meta.env.VITE_MIGRATION_PERCENTAGE) || 0;
    if (userId) {
      const hash = this.hashUserId(userId);
      return (hash % 100) < percentage;
    }

    return false;
  }

  private static hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

## Phase 2: Dual System Operation

### 2.1 Migration Wrapper Component
```typescript
// src/auth/migration/AuthMigrationWrapper.tsx
import React, { useEffect, useState } from 'react';
import { AuthProvider as NewAuthProvider } from '../core/AuthProvider';
import { AuthContext as OldAuthContext } from '../../contexts/AuthContext';
import { AuthMigrationFlags } from './FeatureFlags';

interface Props {
  children: React.ReactNode;
}

export function AuthMigrationWrapper({ children }: Props) {
  const [useNewAuth, setUseNewAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMigrationStatus = async () => {
      try {
        // Check if user is eligible for new auth
        const shouldMigrate = AuthMigrationFlags.shouldUseNewAuth();
        setUseNewAuth(shouldMigrate);

        // Log migration decision for analytics
        console.info('[AUTH MIGRATION]', {
          useNewAuth: shouldMigrate,
          timestamp: new Date().toISOString(),
          env: import.meta.env.MODE
        });
      } catch (error) {
        console.error('[AUTH MIGRATION] Error determining auth system:', error);
        // Fallback to old system on error
        setUseNewAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMigrationStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return useNewAuth ? (
    <NewAuthProvider>{children}</NewAuthProvider>
  ) : (
    <OldAuthContext>{children}</OldAuthContext>
  );
}
```

### 2.2 Data Migration Service
```typescript
// src/auth/migration/DataMigrationService.ts
export class DataMigrationService {
  static async migrateUserData(userId: string) {
    try {
      const { data: oldProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Transform old data structure to new format
      const migrationData = {
        migration_status: 'migrating',
        migration_timestamp: new Date().toISOString(),
        old_auth_data: {
          originalProfile: oldProfile,
          migrationVersion: '2.0.0'
        }
      };

      // Update profile with migration tracking
      const { error: updateError } = await supabase
        .from('profiles')
        .update(migrationData)
        .eq('id', userId);

      if (updateError) throw updateError;

      return { success: true, migrationId: `migration_${userId}_${Date.now()}` };
    } catch (error) {
      console.error('[DATA MIGRATION] Failed to migrate user:', userId, error);
      return { success: false, error };
    }
  }

  static async rollbackUserMigration(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          migration_status: 'rolled_back',
          migration_timestamp: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[DATA MIGRATION] Rollback failed for user:', userId, error);
      return { success: false, error };
    }
  }
}
```

## Phase 3: Gradual User Migration

### 3.1 Migration Phases
```typescript
// Migration percentages over time
const MIGRATION_SCHEDULE = [
  { week: 1, percentage: 5,  userType: 'internal_testing' },
  { week: 2, percentage: 10, userType: 'beta_users' },
  { week: 3, percentage: 25, userType: 'power_users' },
  { week: 4, percentage: 50, userType: 'active_users' },
  { week: 5, percentage: 75, userType: 'all_users' },
  { week: 6, percentage: 100, userType: 'complete_migration' }
];
```

### 3.2 Migration Monitoring
```typescript
// src/auth/migration/MigrationMonitor.ts
export class MigrationMonitor {
  static async logMigrationEvent(event: {
    userId: string;
    eventType: 'migration_start' | 'migration_success' | 'migration_error' | 'rollback';
    authSystem: 'old' | 'new';
    metadata?: Record<string, any>;
  }) {
    try {
      await supabase.from('auth_migration_logs').insert({
        user_id: event.userId,
        event_type: event.eventType,
        auth_system: event.authSystem,
        metadata: event.metadata,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId()
      });
    } catch (error) {
      console.error('[MIGRATION MONITOR] Failed to log event:', error);
    }
  }

  static async getMigrationHealth(): Promise<{
    totalUsers: number;
    migratedUsers: number;
    successRate: number;
    errorRate: number;
    rollbackRate: number;
  }> {
    const { data, error } = await supabase
      .from('auth_migration_logs')
      .select('event_type, user_id')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const stats = data.reduce((acc, log) => {
      acc.totalEvents++;
      if (log.event_type === 'migration_success') acc.successful++;
      if (log.event_type === 'migration_error') acc.errors++;
      if (log.event_type === 'rollback') acc.rollbacks++;
      return acc;
    }, { totalEvents: 0, successful: 0, errors: 0, rollbacks: 0 });

    const uniqueUsers = new Set(data.map(log => log.user_id)).size;

    return {
      totalUsers: uniqueUsers,
      migratedUsers: stats.successful,
      successRate: (stats.successful / stats.totalEvents) * 100,
      errorRate: (stats.errors / stats.totalEvents) * 100,
      rollbackRate: (stats.rollbacks / stats.totalEvents) * 100
    };
  }

  private static getSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Phase 4: Route Migration

### 4.1 Progressive Route Updates
```typescript
// src/auth/migration/RouteManager.ts
export function AuthRouteManager({ children }: { children: React.ReactNode }) {
  const useNewAuth = AuthMigrationFlags.shouldUseNewAuth();

  if (useNewAuth) {
    return (
      <Routes>
        {/* New authentication routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes with new AuthGate */}
        <Route path="/app/*" element={
          <RequireAuth>
            {children}
          </RequireAuth>
        } />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Legacy authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Legacy protected routes */}
      <Route path="/app/*" element={
        <LegacyAuthGuard>
          {children}
        </LegacyAuthGuard>
      } />
    </Routes>
  );
}
```

## Phase 5: Performance & Security Validation

### 5.1 Performance Metrics
```typescript
// src/auth/migration/PerformanceTracker.ts
export class AuthPerformanceTracker {
  static async trackAuthOperation(operation: string, authSystem: 'old' | 'new') {
    const startTime = performance.now();

    return {
      complete: () => {
        const duration = performance.now() - startTime;

        // Send metrics to monitoring service
        this.sendMetrics({
          operation,
          authSystem,
          duration,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      }
    };
  }

  private static sendMetrics(metrics: any) {
    // Implementation depends on monitoring service
    console.info('[AUTH PERFORMANCE]', metrics);
  }
}
```

## Phase 6: Cleanup & Legacy Removal

### 6.1 Safe Removal Checklist
```typescript
// Files to remove after successful migration:
const LEGACY_FILES_TO_REMOVE = [
  'src/contexts/AuthContext.tsx',           // 924-line monolithic context
  'src/pages/Login.tsx',                    // Old login page
  'src/pages/Signup.tsx',                   // Old signup page
  'src/components/auth/LegacyAuthGuard.tsx' // Legacy route protection
];

// Database cleanup after 30-day retention
const DATABASE_CLEANUP = [
  'DROP TABLE auth_migration_backup CASCADE;',
  'DROP TABLE profiles_migration_backup CASCADE;',
  'ALTER TABLE profiles DROP COLUMN old_auth_data;'
];
```

## Emergency Procedures

### Rollback Strategy
```bash
# Immediate rollback (< 5 minutes)
export VITE_MIGRATION_ROLLBACK=true
export VITE_USE_NEW_AUTH=false

# Deploy rollback
npm run deploy:emergency
```

### Health Checks
```typescript
// Automated health monitoring
const HEALTH_THRESHOLDS = {
  errorRate: 5,      // Max 5% error rate
  loadTime: 3000,    // Max 3s load time
  rollbackRate: 2    // Max 2% rollback rate
};
```

## Success Metrics

### Migration Success Criteria
- [ ] 0% data loss
- [ ] < 2% user-reported issues
- [ ] 50% improvement in authentication performance
- [ ] 100% feature parity maintained
- [ ] All security tests passing
- [ ] Accessibility compliance maintained

### Performance Improvements Expected
- **Bundle Size**: -73% (auth code reduction)
- **Time to Interactive**: -40% (lazy loading)
- **First Contentful Paint**: -30% (optimized loading)
- **User Conversion**: +25% (progressive UX)

## Timeline

| Week | Phase | Percentage | Focus |
|------|--------|------------|--------|
| 1 | Preparation | 0% | Infrastructure & safety measures |
| 2 | Beta Testing | 5% | Internal users & monitoring setup |
| 3 | Early Adoption | 15% | Power users & feedback collection |
| 4 | Gradual Rollout | 40% | Performance validation |
| 5 | Mass Migration | 75% | Scale testing |
| 6 | Complete | 100% | Legacy cleanup |
| 7 | Validation | 100% | Final testing & documentation |

This migration strategy ensures a safe, monitored, and reversible transition to the new authentication system while maintaining the highest standards of user experience and data integrity.