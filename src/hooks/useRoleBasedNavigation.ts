/**
 * Role-Based Navigation Hook
 * React hook for role-specific navigation adaptation and workspace management
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedNavigationContext } from './useEnhancedNavigationContext';
import {
  roleBasedNavigationService,
  RoleConfiguration,
  WorkspaceTemplate
} from '@/services/RoleBasedNavigationService';
import { navigationHubRegistry } from '@/services/NavigationHubRegistry';
import {
  NavigationHub,
  NavigationHubId,
  SubNavigationItem,
  QuickAction
} from '@/types/navigation';
import {
  UserRole,
  Feature,
  PageAccessLevel
} from '@/types/roles';
import {
  hasPageAccess,
  hasFeaturePermission,
  getEffectiveUserRole,
  getAccessibleFeatures
} from '@/utils/permissions';
import { PAGE_ACCESS_MATRIX, getPageAccess } from '@/config/pageAccess';

interface RoleBasedNavigationState {
  roleConfig: RoleConfiguration | null;
  adaptedHubs: NavigationHub[];
  workspaceTemplate: WorkspaceTemplate | null;
  availableFeatures: string[];
  customizations: RoleConfiguration['customizations'];
  onboardingSteps: ReturnType<typeof roleBasedNavigationService.getRoleBasedOnboarding>;
}

interface RoleBasedNavigationActions {
  switchWorkspaceTemplate: (templateId: string) => void;
  checkFeatureAccess: (featureId: string) => boolean;
  getAdaptedQuickActions: (hubId: NavigationHubId, baseActions: QuickAction[]) => QuickAction[];
  getAdaptedSubNavigation: (hubId: NavigationHubId, baseSubNav: SubNavigationItem[]) => SubNavigationItem[];
  applyRoleBasedSettings: () => void;

  // New enhanced navigation methods
  canAccessPage: (pathname: string) => boolean;
  getFilteredNavItems: (items: NavigationItem[]) => NavigationItem[];
  getAccessibleRoutes: () => string[];
  hasFeature: (feature: Feature) => boolean;
  needsUpgrade: (feature: Feature) => boolean;
  getUpgradePath: (feature: Feature) => UserRole | null;
}

interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  requiredRole?: PageAccessLevel;
  requiredFeatures?: Feature[];
  children?: NavigationItem[];
}

export function useRoleBasedNavigation(): RoleBasedNavigationState & RoleBasedNavigationActions {
  const { user, profile } = useAuth();
  const { context, updatePreferences } = useEnhancedNavigationContext();

  // State
  const [currentWorkspaceTemplate, setCurrentWorkspaceTemplate] = useState<WorkspaceTemplate | null>(null);
  const [roleConfig, setRoleConfig] = useState<RoleConfiguration | null>(null);

  // Get user role using new permission system
  const userRole: UserRole = useMemo(() => {
    return getEffectiveUserRole(profile);
  }, [profile]);

  // Get role configuration
  useEffect(() => {
    const config = roleBasedNavigationService.getRoleConfiguration(userRole);
    setRoleConfig(config);
  }, [userRole]);

  // Get adapted hubs based on role
  const adaptedHubs = useMemo(() => {
    const allHubs = navigationHubRegistry.getAllHubs();
    return roleBasedNavigationService.getAdaptedHubs(userRole, allHubs);
  }, [userRole]);

  // Get workspace template
  useEffect(() => {
    if (!currentWorkspaceTemplate) {
      const defaultTemplate = roleBasedNavigationService.getWorkspaceTemplate(userRole);
      setCurrentWorkspaceTemplate(defaultTemplate);
    }
  }, [userRole, currentWorkspaceTemplate]);

  // Get available features for role
  const availableFeatures = useMemo(() => {
    if (!roleConfig) return [];

    const allFeatures = [
      'bulk-task-operations',
      'team-analytics',
      'user-management',
      'system-configuration',
      'api-access',
      'advanced-automation',
      'custom-reporting',
      'white-label-settings',
    ];

    return allFeatures.filter(feature =>
      roleBasedNavigationService.isFeatureAvailableForRole(feature, userRole)
    );
  }, [userRole, roleConfig]);

  // Get customizations
  const customizations = useMemo(() => {
    return roleBasedNavigationService.getRoleBasedCustomizations(userRole);
  }, [userRole]);

  // Get onboarding steps
  const onboardingSteps = useMemo(() => {
    return roleBasedNavigationService.getRoleBasedOnboarding(userRole);
  }, [userRole]);

  // Actions
  const switchWorkspaceTemplate = useCallback((templateId: string) => {
    const availableTemplates = roleBasedNavigationService.getAvailableWorkspaceTemplates(userRole);
    const template = availableTemplates.find(t => t.id === templateId);

    if (template) {
      setCurrentWorkspaceTemplate(template);

      // Apply template preferences
      updatePreferences({
        hubOrder: template.hubLayout,
        favoriteQuickActions: template.quickActions,
        ...template.defaultSettings
      });
    }
  }, [userRole, updatePreferences]);

  const checkFeatureAccess = useCallback((featureId: string): boolean => {
    return roleBasedNavigationService.isFeatureAvailableForRole(featureId, userRole);
  }, [userRole]);

  const getAdaptedQuickActions = useCallback((
    hubId: NavigationHubId,
    baseActions: QuickAction[]
  ): QuickAction[] => {
    return roleBasedNavigationService.getRoleBasedQuickActions(hubId, userRole, baseActions);
  }, [userRole]);

  const getAdaptedSubNavigation = useCallback((
    hubId: NavigationHubId,
    baseSubNav: SubNavigationItem[]
  ): SubNavigationItem[] => {
    return roleBasedNavigationService.getRoleBasedSubNavigation(hubId, userRole, baseSubNav);
  }, [userRole]);

  const applyRoleBasedSettings = useCallback(() => {
    if (!roleConfig || !currentWorkspaceTemplate) return;

    // Apply role-based navigation preferences
    updatePreferences({
      hubOrder: currentWorkspaceTemplate.hubLayout,
      favoriteQuickActions: currentWorkspaceTemplate.quickActions,
      ...currentWorkspaceTemplate.defaultSettings,
      // Override with role-specific settings
      animationLevel: customizations.showAdvancedFeatures ? 'full' : 'reduced',
    });
  }, [roleConfig, currentWorkspaceTemplate, customizations, updatePreferences]);

  // Auto-apply role-based settings when role changes
  useEffect(() => {
    if (roleConfig && currentWorkspaceTemplate) {
      applyRoleBasedSettings();
    }
  }, [roleConfig, currentWorkspaceTemplate, applyRoleBasedSettings]);

  // Enhanced navigation methods
  const canAccessPage = useCallback((pathname: string): boolean => {
    const pageAccess = getPageAccess(pathname);
    if (!pageAccess) return true; // Default to accessible for unknown routes

    return hasPageAccess(userRole, pageAccess.accessLevel);
  }, [userRole]);

  const getFilteredNavItems = useCallback((items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check role-based access
      if (item.requiredRole && !hasPageAccess(userRole, item.requiredRole)) {
        return false;
      }

      // Check feature-based access
      if (item.requiredFeatures && item.requiredFeatures.length > 0) {
        const hasAllRequiredFeatures = item.requiredFeatures.every(feature =>
          hasFeaturePermission(userRole, feature)
        );
        if (!hasAllRequiredFeatures) {
          return false;
        }
      }

      // Recursively filter children
      if (item.children) {
        item.children = getFilteredNavItems(item.children);
      }

      return true;
    });
  }, [userRole]);

  const getAccessibleRoutes = useCallback((): string[] => {
    return Object.keys(PAGE_ACCESS_MATRIX).filter(route => {
      const pageAccess = PAGE_ACCESS_MATRIX[route];
      return hasPageAccess(userRole, pageAccess.accessLevel);
    });
  }, [userRole]);

  const hasFeature = useCallback((feature: Feature): boolean => {
    return hasFeaturePermission(userRole, feature);
  }, [userRole]);

  const needsUpgrade = useCallback((feature: Feature): boolean => {
    return !hasFeaturePermission(userRole, feature);
  }, [userRole]);

  const getUpgradePathForFeature = useCallback((feature: Feature): UserRole | null => {
    const roleHierarchy: UserRole[] = [
      'guest', 'user', 'premium', 'team_lead', 'admin', 'super_admin', 'enterprise'
    ];

    for (const role of roleHierarchy) {
      if (hasFeaturePermission(role, feature)) {
        const currentIndex = roleHierarchy.indexOf(userRole);
        const targetIndex = roleHierarchy.indexOf(role);

        if (targetIndex > currentIndex) {
          // Return the next logical upgrade step
          if (userRole === 'guest' || userRole === 'user') return 'premium';
          if (userRole === 'premium') return 'team_lead';
          return role;
        }
        break;
      }
    }

    return null;
  }, [userRole]);

  return {
    // State
    roleConfig,
    adaptedHubs,
    workspaceTemplate: currentWorkspaceTemplate,
    availableFeatures,
    customizations,
    onboardingSteps,

    // Actions
    switchWorkspaceTemplate,
    checkFeatureAccess,
    getAdaptedQuickActions,
    getAdaptedSubNavigation,
    applyRoleBasedSettings,

    // Enhanced navigation methods
    canAccessPage,
    getFilteredNavItems,
    getAccessibleRoutes,
    hasFeature,
    needsUpgrade,
    getUpgradePath: getUpgradePathForFeature,
  };
}

/**
 * Hook for role-based feature checking
 */
export function useRoleBasedFeatures() {
  const { user } = useAuth();

  const userRole: UserRole = useMemo(() => {
    if (!user) return 'user';
    const role = user.user_metadata?.role || user.app_metadata?.role;
    return ['user', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(role) ? role : 'user';
  }, [user]);

  const checkFeature = useCallback((featureId: string): boolean => {
    return roleBasedNavigationService.isFeatureAvailableForRole(featureId, userRole);
  }, [userRole]);

  const getRoleConfig = useCallback((): RoleConfiguration | null => {
    return roleBasedNavigationService.getRoleConfiguration(userRole);
  }, [userRole]);

  const canAccessHub = useCallback((hubId: NavigationHubId): boolean => {
    const config = roleBasedNavigationService.getRoleConfiguration(userRole);
    return config?.allowedHubs.includes(hubId) ?? false;
  }, [userRole]);

  const getMaxVisibleHubs = useCallback((): number => {
    const customizations = roleBasedNavigationService.getRoleBasedCustomizations(userRole);
    return customizations.maxVisibleHubs;
  }, [userRole]);

  const shouldShowAdvancedFeatures = useCallback((): boolean => {
    const customizations = roleBasedNavigationService.getRoleBasedCustomizations(userRole);
    return customizations.showAdvancedFeatures;
  }, [userRole]);

  return {
    userRole,
    checkFeature,
    getRoleConfig,
    canAccessHub,
    getMaxVisibleHubs,
    shouldShowAdvancedFeatures,
  };
}

/**
 * Hook for workspace template management
 */
export function useWorkspaceTemplates() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const userRole: UserRole = useMemo(() => {
    if (!user) return 'user';
    const role = user.user_metadata?.role || user.app_metadata?.role;
    return ['user', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(role) ? role : 'user';
  }, [user]);

  const availableTemplates = useMemo(() => {
    return roleBasedNavigationService.getAvailableWorkspaceTemplates(userRole);
  }, [userRole]);

  const currentTemplate = useMemo(() => {
    if (selectedTemplate) {
      return availableTemplates.find(t => t.id === selectedTemplate) || null;
    }
    return roleBasedNavigationService.getWorkspaceTemplate(userRole);
  }, [selectedTemplate, availableTemplates, userRole]);

  const switchTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
  }, []);

  const resetToDefault = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  return {
    availableTemplates,
    currentTemplate,
    selectedTemplate,
    switchTemplate,
    resetToDefault,
  };
}

/**
 * Hook for role-based onboarding
 */
export function useRoleBasedOnboarding() {
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);

  const userRole: UserRole = useMemo(() => {
    if (!user) return 'user';
    const role = user.user_metadata?.role || user.app_metadata?.role;
    return ['user', 'team_lead', 'admin', 'super_admin', 'enterprise'].includes(role) ? role : 'user';
  }, [user]);

  const onboardingFlow = useMemo(() => {
    return roleBasedNavigationService.getRoleBasedOnboarding(userRole);
  }, [userRole]);

  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setCompletedSteps([]);
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
  }, []);

  const finishOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    // Save completion status
    localStorage.setItem(`onboarding-completed-${userRole}`, 'true');
  }, [userRole]);

  const isOnboardingCompleted = useMemo(() => {
    return localStorage.getItem(`onboarding-completed-${userRole}`) === 'true';
  }, [userRole]);

  const shouldShowOnboarding = useMemo(() => {
    return !isOnboardingCompleted && user && userRole !== 'user';
  }, [isOnboardingCompleted, user, userRole]);

  return {
    onboardingFlow,
    completedSteps,
    isOnboardingActive,
    isOnboardingCompleted,
    shouldShowOnboarding,
    startOnboarding,
    completeStep,
    finishOnboarding,
  };
}