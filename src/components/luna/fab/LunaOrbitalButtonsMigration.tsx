/**
 * Luna Orbital Buttons Migration Wrapper
 * Provides backward compatibility and gradual migration from legacy to enhanced navigation system
 */

import React, { useState, useEffect } from 'react';
import { LunaOrbitalButtons } from './LunaOrbitalButtons';
import { EnhancedLunaOrbitalButtons } from './EnhancedLunaOrbitalButtons';
import { useAuth } from '@/contexts/AuthContext';

interface LunaOrbitalButtonsMigrationProps {
  isVisible: boolean;
  centerX: number;
  centerY: number;
  radius?: number;
  onClose: () => void;
  className?: string;
  showOrbitalButtons?: boolean;
}

// Feature flag configuration
interface FeatureFlags {
  enableEnhancedNavigation: boolean;
  enableAdvancedFeatures: boolean;
  enableBetaFeatures: boolean;
  rolloutPercentage: number;
}

// Default feature flags
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableEnhancedNavigation: false, // Start with legacy system
  enableAdvancedFeatures: false,
  enableBetaFeatures: false,
  rolloutPercentage: 0, // 0% rollout initially
};

/**
 * Migration wrapper component that decides which navigation system to use
 */
export const LunaOrbitalButtonsMigration: React.FC<LunaOrbitalButtonsMigrationProps> = (props) => {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [shouldUseEnhanced, setShouldUseEnhanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load feature flags and determine which system to use
  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // Load feature flags from localStorage or remote config
        const storedFlags = localStorage.getItem('luna-navigation-feature-flags');
        let flags = DEFAULT_FEATURE_FLAGS;

        if (storedFlags) {
          flags = { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(storedFlags) };
        }

        // Check if user is in rollout group
        const userInRollout = checkUserInRollout(user?.id || '', flags.rolloutPercentage);

        // Determine if enhanced navigation should be used
        const useEnhanced = flags.enableEnhancedNavigation && (
          userInRollout ||
          isAdminUser(user) ||
          isBetaUser(user)
        );

        setFeatureFlags(flags);
        setShouldUseEnhanced(useEnhanced);

        // Log migration decision for debugging
        console.log('Luna Navigation Migration:', {
          useEnhanced,
          userInRollout,
          flags,
          userId: user?.id,
        });

      } catch (error) {
        console.error('Failed to load feature flags:', error);
        // Fallback to legacy system on error
        setShouldUseEnhanced(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatureFlags();
  }, [user]);

  // Update feature flags (for admin testing)
  const updateFeatureFlags = (newFlags: Partial<FeatureFlags>) => {
    const updatedFlags = { ...featureFlags, ...newFlags };
    setFeatureFlags(updatedFlags);
    localStorage.setItem('luna-navigation-feature-flags', JSON.stringify(updatedFlags));

    // Re-evaluate if enhanced system should be used
    const userInRollout = checkUserInRollout(user?.id || '', updatedFlags.rolloutPercentage);
    const useEnhanced = updatedFlags.enableEnhancedNavigation && (
      userInRollout ||
      isAdminUser(user) ||
      isBetaUser(user)
    );

    setShouldUseEnhanced(useEnhanced);
  };

  // Show loading state while determining which system to use
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Admin debug panel (only shown to admins)
  const renderDebugPanel = () => {
    if (!isAdminUser(user) || !props.isVisible) return null;

    return (
      <div className="fixed top-4 left-4 z-[70] bg-black/90 text-white p-4 rounded-lg text-sm max-w-xs">
        <div className="mb-2 font-bold">Luna Navigation Debug</div>
        <div className="mb-2">
          System: {shouldUseEnhanced ? 'Enhanced' : 'Legacy'}
        </div>
        <div className="space-y-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={featureFlags.enableEnhancedNavigation}
              onChange={(e) => updateFeatureFlags({ enableEnhancedNavigation: e.target.checked })}
              className="mr-2"
            />
            Enhanced Navigation
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={featureFlags.enableAdvancedFeatures}
              onChange={(e) => updateFeatureFlags({ enableAdvancedFeatures: e.target.checked })}
              className="mr-2"
            />
            Advanced Features
          </label>
          <div className="flex items-center">
            <span className="mr-2">Rollout %:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={featureFlags.rolloutPercentage}
              onChange={(e) => updateFeatureFlags({ rolloutPercentage: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="ml-2 w-8">{featureFlags.rolloutPercentage}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate navigation system
  return (
    <>
      {shouldUseEnhanced ? (
        <EnhancedLunaOrbitalButtons
          {...props}
          enableAdvancedFeatures={featureFlags.enableAdvancedFeatures}
        />
      ) : (
        <LunaOrbitalButtons {...props} />
      )}

      {renderDebugPanel()}
    </>
  );
};

// Helper functions

/**
 * Check if user ID falls within rollout percentage using deterministic hash
 */
function checkUserInRollout(userId: string, rolloutPercentage: number): boolean {
  if (rolloutPercentage === 0) return false;
  if (rolloutPercentage === 100) return true;

  // Use simple hash to create deterministic rollout
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const bucket = Math.abs(hash) % 100;
  return bucket < rolloutPercentage;
}

/**
 * Check if user has admin privileges
 */
function isAdminUser(user: any): boolean {
  if (!user) return false;
  const role = user.user_metadata?.role || user.app_metadata?.role;
  return ['admin', 'super_admin'].includes(role);
}

/**
 * Check if user is in beta program
 */
function isBetaUser(user: any): boolean {
  if (!user) return false;
  return user.user_metadata?.beta_user === true ||
         user.app_metadata?.beta_user === true;
}

/**
 * Hook for managing feature flags (for admin use)
 */
export function useNavigationFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  useEffect(() => {
    const stored = localStorage.getItem('luna-navigation-feature-flags');
    if (stored) {
      setFlags({ ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(stored) });
    }
  }, []);

  const updateFlags = (newFlags: Partial<FeatureFlags>) => {
    const updated = { ...flags, ...newFlags };
    setFlags(updated);
    localStorage.setItem('luna-navigation-feature-flags', JSON.stringify(updated));
  };

  return { flags, updateFlags };
}

/**
 * Gradual rollout plan:
 *
 * Week 1-2: 0% rollout (admins and beta users only)
 * Week 3-4: 10% rollout (early adopters)
 * Week 5-6: 25% rollout (expand to more users)
 * Week 7-8: 50% rollout (half of users)
 * Week 9-10: 75% rollout (majority of users)
 * Week 11-12: 100% rollout (all users)
 *
 * Rollback plan:
 * If issues are detected, immediately set rolloutPercentage to 0
 * All users will fall back to legacy system
 * Investigate and fix issues before resuming rollout
 */