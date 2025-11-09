/**
 * Authentication Migration Wrapper
 *
 * Manages the transition between old and new authentication systems
 * with monitoring, error handling, and rollback capabilities.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AuthProvider as NewAuthProvider } from '../core/AuthProvider';
import { AuthMigrationFlags, MigrationAnalytics } from './FeatureFlags';
import { DataMigrationService } from './DataMigrationService';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ==================== Types ====================

interface MigrationState {
  isLoading: boolean;
  useNewAuth: boolean;
  migrationReason: string;
  error: string | null;
  retryCount: number;
}

interface AuthMigrationWrapperProps {
  children: React.ReactNode;
  userId?: string;
  onMigrationComplete?: (success: boolean) => void;
  onMigrationError?: (error: Error) => void;
}

// ==================== Migration Context ====================

interface MigrationContextType {
  migrationState: MigrationState;
  switchToOldAuth: () => void;
  switchToNewAuth: () => void;
  retryMigration: () => void;
}

const MigrationContext = React.createContext<MigrationContextType | undefined>(undefined);

export function useMigrationContext(): MigrationContextType {
  const context = React.useContext(MigrationContext);
  if (!context) {
    throw new Error('useMigrationContext must be used within AuthMigrationWrapper');
  }
  return context;
}

// ==================== Migration Wrapper Component ====================

export function AuthMigrationWrapper({
  children,
  userId,
  onMigrationComplete,
  onMigrationError
}: AuthMigrationWrapperProps) {
  const [migrationState, setMigrationState] = useState<MigrationState>({
    isLoading: true,
    useNewAuth: false,
    migrationReason: 'initializing',
    error: null,
    retryCount: 0
  });

  // ==================== Migration Decision Logic ====================

  const determineMigrationPath = useCallback(async () => {
    const startTime = Date.now();

    try {
      setMigrationState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Check for emergency rollback
      if (AuthMigrationFlags.isEmergencyRollbackActive()) {
        throw new Error('Emergency rollback is active');
      }

      // Get migration decision
      const decision = AuthMigrationFlags.shouldUseNewAuth(userId);

      // Log the decision
      AuthMigrationFlags.logMigrationDecision(decision);

      // Track migration analytics
      MigrationAnalytics.trackEvent({
        type: 'migration_start',
        userId,
        authSystem: decision.useNewAuth ? 'new' : 'old',
        metadata: {
          reason: decision.reason,
          timestamp: decision.timestamp
        }
      });

      // If using new auth and we have a user ID, migrate their data
      if (decision.useNewAuth && userId) {
        await DataMigrationService.migrateUserData(userId);
      }

      setMigrationState(prev => ({
        ...prev,
        isLoading: false,
        useNewAuth: decision.useNewAuth,
        migrationReason: decision.reason,
        retryCount: 0
      }));

      // Track successful migration decision
      const duration = Date.now() - startTime;
      MigrationAnalytics.trackEvent({
        type: 'migration_success',
        userId,
        authSystem: decision.useNewAuth ? 'new' : 'old',
        duration,
        metadata: {
          reason: decision.reason
        }
      });

      onMigrationComplete?.(true);

    } catch (error) {
      console.error('[AUTH MIGRATION] Migration decision failed:', error);

      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Track migration error
      MigrationAnalytics.trackEvent({
        type: 'migration_error',
        userId,
        authSystem: 'old', // Fallback to old system on error
        duration,
        error: errorMessage,
        metadata: {
          retryCount: migrationState.retryCount
        }
      });

      setMigrationState(prev => ({
        ...prev,
        isLoading: false,
        useNewAuth: false, // Fallback to old system on error
        migrationReason: 'error_fallback',
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      onMigrationError?.(error instanceof Error ? error : new Error(errorMessage));
      onMigrationComplete?.(false);
    }
  }, [userId, onMigrationComplete, onMigrationError, migrationState.retryCount]);

  // ==================== Manual Migration Controls ====================

  const switchToOldAuth = useCallback(async () => {
    try {
      if (userId && migrationState.useNewAuth) {
        await DataMigrationService.rollbackUserMigration(userId);
      }

      MigrationAnalytics.trackEvent({
        type: 'rollback',
        userId,
        authSystem: 'old',
        metadata: { reason: 'manual_switch' }
      });

      setMigrationState(prev => ({
        ...prev,
        useNewAuth: false,
        migrationReason: 'manual_rollback',
        error: null
      }));
    } catch (error) {
      console.error('[AUTH MIGRATION] Failed to switch to old auth:', error);
    }
  }, [userId, migrationState.useNewAuth]);

  const switchToNewAuth = useCallback(async () => {
    try {
      if (userId) {
        await DataMigrationService.migrateUserData(userId);
      }

      MigrationAnalytics.trackEvent({
        type: 'migration_start',
        userId,
        authSystem: 'new',
        metadata: { reason: 'manual_switch' }
      });

      setMigrationState(prev => ({
        ...prev,
        useNewAuth: true,
        migrationReason: 'manual_migration',
        error: null
      }));
    } catch (error) {
      console.error('[AUTH MIGRATION] Failed to switch to new auth:', error);
      setMigrationState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Migration failed'
      }));
    }
  }, [userId]);

  const retryMigration = useCallback(() => {
    if (migrationState.retryCount < 3) {
      determineMigrationPath();
    }
  }, [determineMigrationPath, migrationState.retryCount]);

  // ==================== Effects ====================

  // Initial migration decision
  useEffect(() => {
    determineMigrationPath();
  }, [determineMigrationPath]);

  // Listen for emergency rollback events
  useEffect(() => {
    const handleEmergencyRollback = () => {
      console.warn('[AUTH MIGRATION] Emergency rollback triggered');
      switchToOldAuth();
    };

    window.addEventListener('auth-emergency-rollback', handleEmergencyRollback);
    return () => window.removeEventListener('auth-emergency-rollback', handleEmergencyRollback);
  }, [switchToOldAuth]);

  // ==================== Loading State ====================

  if (migrationState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
          {import.meta.env.DEV && (
            <p className="mt-2 text-xs text-gray-500">
              Migration reason: {migrationState.migrationReason}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== Error State ====================

  if (migrationState.error && migrationState.retryCount >= 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>

          <p className="text-gray-600 mb-4">
            We're having trouble initializing the authentication system.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>

          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <strong>Debug Info:</strong>
              <br />Error: {migrationState.error}
              <br />Reason: {migrationState.migrationReason}
              <br />Retries: {migrationState.retryCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== Migration Context Provider ====================

  const migrationContextValue: MigrationContextType = {
    migrationState,
    switchToOldAuth,
    switchToNewAuth,
    retryMigration
  };

  // ==================== Auth System Selection ====================

  if (migrationState.useNewAuth) {
    return (
      <MigrationContext.Provider value={migrationContextValue}>
        <NewAuthProvider>
          {children}
          {import.meta.env.DEV && <MigrationDebugPanel />}
        </NewAuthProvider>
      </MigrationContext.Provider>
    );
  }

  // Fallback to old auth system (would import the old AuthContext here)
  return (
    <MigrationContext.Provider value={migrationContextValue}>
      {/* This would wrap with the old AuthContext */}
      <div className="legacy-auth-wrapper">
        {children}
        {import.meta.env.DEV && <MigrationDebugPanel />}
      </div>
    </MigrationContext.Provider>
  );
}

// ==================== Development Debug Panel ====================

function MigrationDebugPanel() {
  const { migrationState, switchToOldAuth, switchToNewAuth, retryMigration } = useMigrationContext();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h4 className="font-bold text-yellow-800 mb-2">🚧 Migration Debug</h4>

      <div className="text-xs text-yellow-700 space-y-1 mb-3">
        <div><strong>System:</strong> {migrationState.useNewAuth ? 'New Auth' : 'Old Auth'}</div>
        <div><strong>Reason:</strong> {migrationState.migrationReason}</div>
        <div><strong>Config:</strong> {AuthMigrationFlags.getMigrationPercentage()}% rollout</div>
      </div>

      <div className="space-y-2">
        <button
          onClick={switchToNewAuth}
          disabled={migrationState.useNewAuth}
          className="w-full text-xs bg-green-600 text-white py-1 px-2 rounded disabled:opacity-50"
        >
          Switch to New Auth
        </button>

        <button
          onClick={switchToOldAuth}
          disabled={!migrationState.useNewAuth}
          className="w-full text-xs bg-gray-600 text-white py-1 px-2 rounded disabled:opacity-50"
        >
          Switch to Old Auth
        </button>

        {migrationState.error && (
          <button
            onClick={retryMigration}
            className="w-full text-xs bg-blue-600 text-white py-1 px-2 rounded"
          >
            Retry Migration
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== Export ====================

export default AuthMigrationWrapper;