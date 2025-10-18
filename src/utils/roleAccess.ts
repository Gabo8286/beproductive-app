import { User } from "@supabase/supabase-js";
import { ProfileWithRole } from "@/types/database";
import { ModuleConfig } from "@/types/modules";
import { isGuestUser, guestHasRole } from "@/utils/auth/guestMode";

/**
 * Check if a user has the required role to access a module
 * @param user - The authenticated user
 * @param profile - The user's profile with role information
 * @param moduleConfig - The module configuration with role requirements
 * @returns boolean indicating if the user has access
 */
export const hasModuleAccess = (
  user: User | null,
  profile: ProfileWithRole | null,
  moduleConfig: ModuleConfig
): boolean => {
  // If no role requirements, module is accessible to all authenticated users
  if (!moduleConfig.requiredRole || moduleConfig.requiredRole.length === 0) {
    return true;
  }

  // No user means no access
  if (!user || !profile) {
    return false;
  }

  // Handle guest mode users
  if (isGuestUser(user)) {
    return moduleConfig.requiredRole.some(requiredRole =>
      guestHasRole(user, requiredRole)
    );
  }

  // Handle regular authenticated users
  const userRole = profile.role;
  const subscriptionTier = profile.subscription_tier;

  // Super admin can access everything
  if (userRole === 'super_admin') {
    return true;
  }

  // Separate actual roles from subscription-based requirements
  const validUserRoles = ['user', 'team_lead', 'admin', 'super_admin'];
  const roleRequirements = moduleConfig.requiredRole.filter(role => validUserRoles.includes(role));
  const hasEnterpriseRequirement = moduleConfig.requiredRole.includes('enterprise');

  // Check direct role match
  if (roleRequirements.includes(userRole)) {
    return true;
  }

  // Handle role hierarchy - admin can access team_lead features
  if (userRole === 'admin' && roleRequirements.includes('team_lead')) {
    return true;
  }

  // Handle enterprise subscription requirement
  if (hasEnterpriseRequirement) {
    // Enterprise access can be granted by having enterprise subscription tier
    if (subscriptionTier === 'enterprise') {
      return true;
    }
  }

  return false;
};

/**
 * Get filtered modules based on user's role and access
 * @param user - The authenticated user
 * @param profile - The user's profile with role information
 * @param modules - Object containing all module configurations
 * @returns Object with only accessible modules
 */
export const getAccessibleModules = (
  user: User | null,
  profile: ProfileWithRole | null,
  modules: Record<string, ModuleConfig>
): Record<string, ModuleConfig> => {
  const accessibleModules: Record<string, ModuleConfig> = {};

  Object.entries(modules).forEach(([moduleId, moduleConfig]) => {
    if (hasModuleAccess(user, profile, moduleConfig)) {
      accessibleModules[moduleId] = moduleConfig;
    }
  });

  return accessibleModules;
};

/**
 * Check if a user can access a specific module by ID
 * @param user - The authenticated user
 * @param profile - The user's profile with role information
 * @param moduleId - The module ID to check
 * @param modules - Object containing all module configurations
 * @returns boolean indicating if the user can access the module
 */
export const canAccessModule = (
  user: User | null,
  profile: ProfileWithRole | null,
  moduleId: string,
  modules: Record<string, ModuleConfig>
): boolean => {
  const moduleConfig = modules[moduleId];
  if (!moduleConfig) {
    return false;
  }

  return hasModuleAccess(user, profile, moduleConfig);
};