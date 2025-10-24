/**
 * Permission System Utilities
 * Comprehensive permission management for Spark Bloom Flow
 */

import {
  UserRole,
  Feature,
  FeaturePermission,
  PermissionMatrix,
  PageAccessLevel,
  SubscriptionTier,
  UserProfile,
  RoleCapabilities
} from '@/types/roles';
import { ProfileWithRole } from '@/types/database';

// Role hierarchy for permission checking (higher index = higher privileges)
const ROLE_HIERARCHY: UserRole[] = [
  'guest',
  'user',
  'premium',
  'team_lead',
  'admin',
  'super_admin',
  'enterprise'
];

// Permission matrix defining what each role can access
const PERMISSION_MATRIX: PermissionMatrix = {
  guest: {
    // Basic read-only access for demo purposes
    basic_tasks: 'read',
    basic_goals: 'read',
    basic_notes: 'read',
    basic_habits: 'read',
  },

  user: {
    // Core features for authenticated users
    basic_tasks: 'write',
    basic_goals: 'write',
    basic_notes: 'write',
    basic_habits: 'write',
    calendar_integration: 'write',
    smart_reminders: 'read',
    productivity_metrics: 'read',
  },

  premium: {
    // All user features plus premium features
    basic_tasks: 'write',
    basic_goals: 'write',
    basic_notes: 'write',
    basic_habits: 'write',
    ai_insights: 'write',
    ai_task_suggestions: 'write',
    smart_scheduling: 'write',
    advanced_analytics: 'write',
    custom_reports: 'write',
    productivity_analysis: 'write',
    calendar_integration: 'write',
    email_integration: 'write',
    smart_reminders: 'write',
    unlimited_projects: 'write',
    priority_support: 'write',
    data_export: 'write',
    advanced_customization: 'write',
    productivity_metrics: 'write',
    performance_tracking: 'write',
  },

  team_lead: {
    // All premium features plus team management
    basic_tasks: 'write',
    basic_goals: 'write',
    basic_notes: 'write',
    basic_habits: 'write',
    ai_insights: 'write',
    ai_task_suggestions: 'write',
    ai_goal_optimization: 'write',
    smart_scheduling: 'write',
    advanced_analytics: 'write',
    custom_reports: 'write',
    productivity_analysis: 'write',
    team_analytics: 'write',
    performance_tracking: 'write',
    team_management: 'write',
    shared_projects: 'write',
    team_collaboration: 'write',
    calendar_integration: 'write',
    email_integration: 'write',
    smart_reminders: 'write',
    automated_reporting: 'write',
    unlimited_projects: 'write',
    priority_support: 'write',
    data_export: 'write',
    bulk_operations: 'write',
    advanced_customization: 'write',
    productivity_metrics: 'write',
  },

  admin: {
    // All team_lead features plus administrative functions
    basic_tasks: 'admin',
    basic_goals: 'admin',
    basic_notes: 'admin',
    basic_habits: 'admin',
    ai_insights: 'admin',
    ai_task_suggestions: 'admin',
    ai_goal_optimization: 'admin',
    smart_scheduling: 'admin',
    productivity_analysis: 'admin',
    advanced_analytics: 'admin',
    custom_reports: 'admin',
    team_analytics: 'admin',
    performance_tracking: 'admin',
    team_management: 'admin',
    shared_projects: 'admin',
    team_collaboration: 'admin',
    user_management: 'admin',
    role_assignment: 'admin',
    system_configuration: 'admin',
    user_administration: 'admin',
    security_settings: 'admin',
    audit_logs: 'admin',
    beta_management: 'admin',
    calendar_integration: 'admin',
    email_integration: 'admin',
    api_access: 'admin',
    webhook_support: 'admin',
    third_party_apps: 'admin',
    advanced_automation: 'admin',
    custom_workflows: 'admin',
    smart_reminders: 'admin',
    automated_reporting: 'admin',
    unlimited_projects: 'admin',
    priority_support: 'admin',
    data_export: 'admin',
    backup_restore: 'admin',
    bulk_operations: 'admin',
    advanced_customization: 'admin',
    white_label_settings: 'admin',
    productivity_metrics: 'admin',
  },

  super_admin: {
    // Full access to all features
    basic_tasks: 'super_admin',
    basic_goals: 'super_admin',
    basic_notes: 'super_admin',
    basic_habits: 'super_admin',
    ai_insights: 'super_admin',
    ai_task_suggestions: 'super_admin',
    ai_goal_optimization: 'super_admin',
    smart_scheduling: 'super_admin',
    productivity_analysis: 'super_admin',
    advanced_analytics: 'super_admin',
    custom_reports: 'super_admin',
    team_analytics: 'super_admin',
    performance_tracking: 'super_admin',
    team_management: 'super_admin',
    shared_projects: 'super_admin',
    team_collaboration: 'super_admin',
    user_management: 'super_admin',
    role_assignment: 'super_admin',
    system_configuration: 'super_admin',
    user_administration: 'super_admin',
    security_settings: 'super_admin',
    audit_logs: 'super_admin',
    beta_management: 'super_admin',
    calendar_integration: 'super_admin',
    email_integration: 'super_admin',
    api_access: 'super_admin',
    webhook_support: 'super_admin',
    third_party_apps: 'super_admin',
    advanced_automation: 'super_admin',
    custom_workflows: 'super_admin',
    smart_reminders: 'super_admin',
    automated_reporting: 'super_admin',
    unlimited_projects: 'super_admin',
    priority_support: 'super_admin',
    data_export: 'super_admin',
    backup_restore: 'super_admin',
    bulk_operations: 'super_admin',
    advanced_customization: 'super_admin',
    white_label_settings: 'super_admin',
    productivity_metrics: 'super_admin',
  },

  enterprise: {
    // Same as super_admin but with enterprise-specific customizations
    basic_tasks: 'super_admin',
    basic_goals: 'super_admin',
    basic_notes: 'super_admin',
    basic_habits: 'super_admin',
    ai_insights: 'super_admin',
    ai_task_suggestions: 'super_admin',
    ai_goal_optimization: 'super_admin',
    smart_scheduling: 'super_admin',
    productivity_analysis: 'super_admin',
    advanced_analytics: 'super_admin',
    custom_reports: 'super_admin',
    team_analytics: 'super_admin',
    performance_tracking: 'super_admin',
    team_management: 'super_admin',
    shared_projects: 'super_admin',
    team_collaboration: 'super_admin',
    user_management: 'super_admin',
    role_assignment: 'super_admin',
    calendar_integration: 'super_admin',
    email_integration: 'super_admin',
    api_access: 'super_admin',
    webhook_support: 'super_admin',
    third_party_apps: 'super_admin',
    advanced_automation: 'super_admin',
    custom_workflows: 'super_admin',
    smart_reminders: 'super_admin',
    automated_reporting: 'super_admin',
    unlimited_projects: 'super_admin',
    priority_support: 'super_admin',
    data_export: 'super_admin',
    backup_restore: 'super_admin',
    bulk_operations: 'super_admin',
    advanced_customization: 'super_admin',
    white_label_settings: 'super_admin',
    productivity_metrics: 'super_admin',
  }
};

// Role capabilities configuration
const ROLE_CAPABILITIES: Record<UserRole, RoleCapabilities> = {
  guest: {
    role: 'guest',
    description: 'Demo access with limited features',
    features: ['basic_tasks', 'basic_goals', 'basic_notes', 'basic_habits'],
    maxProjects: 1,
    maxTeamMembers: 0,
    maxStorageGB: 0,
    prioritySupport: false,
    customBranding: false,
  },
  user: {
    role: 'user',
    description: 'Basic authenticated user',
    features: ['basic_tasks', 'basic_goals', 'basic_notes', 'basic_habits', 'calendar_integration', 'productivity_metrics'],
    maxProjects: 5,
    maxTeamMembers: 0,
    maxStorageGB: 1,
    prioritySupport: false,
    customBranding: false,
  },
  premium: {
    role: 'premium',
    description: 'Premium subscription user',
    features: [
      'basic_tasks', 'basic_goals', 'basic_notes', 'basic_habits',
      'ai_insights', 'ai_task_suggestions', 'smart_scheduling',
      'advanced_analytics', 'custom_reports', 'unlimited_projects',
      'priority_support', 'data_export'
    ],
    maxProjects: -1, // unlimited
    maxTeamMembers: 0,
    maxStorageGB: 10,
    prioritySupport: true,
    customBranding: false,
  },
  team_lead: {
    role: 'team_lead',
    description: 'Team leader with management features',
    features: [
      'basic_tasks', 'basic_goals', 'basic_notes', 'basic_habits',
      'ai_insights', 'ai_task_suggestions', 'ai_goal_optimization',
      'smart_scheduling', 'advanced_analytics', 'custom_reports',
      'team_analytics', 'team_management', 'shared_projects',
      'team_collaboration', 'unlimited_projects', 'priority_support',
      'data_export', 'bulk_operations'
    ],
    maxProjects: -1, // unlimited
    maxTeamMembers: 50,
    maxStorageGB: 50,
    prioritySupport: true,
    customBranding: true,
  },
  admin: {
    role: 'admin',
    description: 'System administrator',
    features: Object.keys(PERMISSION_MATRIX.admin) as Feature[],
    maxProjects: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    maxStorageGB: -1, // unlimited
    prioritySupport: true,
    customBranding: true,
  },
  super_admin: {
    role: 'super_admin',
    description: 'Super administrator with full access',
    features: Object.keys(PERMISSION_MATRIX.super_admin) as Feature[],
    maxProjects: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    maxStorageGB: -1, // unlimited
    prioritySupport: true,
    customBranding: true,
  },
  enterprise: {
    role: 'enterprise',
    description: 'Enterprise user with custom features',
    features: Object.keys(PERMISSION_MATRIX.enterprise) as Feature[],
    maxProjects: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    maxStorageGB: -1, // unlimited
    prioritySupport: true,
    customBranding: true,
  }
};

/**
 * Check if a user role has permission for a specific feature
 */
export function hasFeaturePermission(
  userRole: UserRole,
  feature: Feature,
  requiredPermission: FeaturePermission = 'read'
): boolean {
  const userPermission = PERMISSION_MATRIX[userRole]?.[feature];
  if (!userPermission) return false;

  const permissionLevels: FeaturePermission[] = ['none', 'read', 'write', 'admin', 'super_admin'];
  const userLevel = permissionLevels.indexOf(userPermission);
  const requiredLevel = permissionLevels.indexOf(requiredPermission);

  return userLevel >= requiredLevel;
}

/**
 * Check if a user role has access to a page based on access level
 */
export function hasPageAccess(userRole: UserRole, pageAccessLevel: PageAccessLevel): boolean {
  const roleIndex = ROLE_HIERARCHY.indexOf(userRole);

  switch (pageAccessLevel) {
    case 'public':
      return true;
    case 'authenticated':
      return roleIndex > 0; // Any role except guest
    case 'user':
      return roleIndex >= ROLE_HIERARCHY.indexOf('user');
    case 'premium':
      return roleIndex >= ROLE_HIERARCHY.indexOf('premium');
    case 'team_lead':
      return roleIndex >= ROLE_HIERARCHY.indexOf('team_lead');
    case 'admin':
      return roleIndex >= ROLE_HIERARCHY.indexOf('admin');
    case 'super_admin':
      return roleIndex >= ROLE_HIERARCHY.indexOf('super_admin');
    default:
      return false;
  }
}

/**
 * Get all features accessible to a user role
 */
export function getAccessibleFeatures(userRole: UserRole): Feature[] {
  const rolePermissions = PERMISSION_MATRIX[userRole];
  if (!rolePermissions) return [];

  return Object.keys(rolePermissions) as Feature[];
}

/**
 * Get role capabilities
 */
export function getRoleCapabilities(userRole: UserRole): RoleCapabilities {
  return ROLE_CAPABILITIES[userRole];
}

/**
 * Check if user can access multiple features (all required)
 */
export function hasAllFeatures(userRole: UserRole, features: Feature[]): boolean {
  return features.every(feature => hasFeaturePermission(userRole, feature));
}

/**
 * Check if user can access any of the features (at least one required)
 */
export function hasAnyFeature(userRole: UserRole, features: Feature[]): boolean {
  return features.some(feature => hasFeaturePermission(userRole, feature));
}

/**
 * Get the effective user role from user profile or session
 */
export function getEffectiveUserRole(profile: UserProfile | ProfileWithRole | null): UserRole {
  if (!profile) return 'guest';

  // For guest users, return guest role - check if guest_type exists
  if ('guest_type' in profile && profile.guest_type) return 'guest';

  return profile.role || 'user';
}

/**
 * Check if user needs upgrade for a feature
 */
export function needsUpgradeForFeature(userRole: UserRole, feature: Feature): boolean {
  return !hasFeaturePermission(userRole, feature);
}

/**
 * Get the minimum role required for a feature
 */
export function getMinimumRoleForFeature(feature: Feature): UserRole | null {
  for (const role of ROLE_HIERARCHY) {
    if (hasFeaturePermission(role, feature)) {
      return role;
    }
  }
  return null;
}

/**
 * Get upgrade path for accessing a feature
 */
export function getUpgradePath(currentRole: UserRole, targetFeature: Feature): UserRole | null {
  const minimumRole = getMinimumRoleForFeature(targetFeature);
  if (!minimumRole) return null;

  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole);

  if (currentIndex >= minimumIndex) return null; // Already has access

  // Return the next logical upgrade step
  if (currentRole === 'guest' || currentRole === 'user') return 'premium';
  if (currentRole === 'premium') return 'team_lead';

  return minimumRole;
}

/**
 * Filter features based on user role
 */
export function filterFeaturesByRole<T extends { feature: Feature }>(
  items: T[],
  userRole: UserRole
): T[] {
  return items.filter(item => hasFeaturePermission(userRole, item.feature));
}

/**
 * Check if user is admin level or higher
 */
export function isAdminOrHigher(userRole: UserRole): boolean {
  return hasPageAccess(userRole, 'admin');
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

/**
 * Get subscription tier from user role
 */
export function getSubscriptionTier(userRole: UserRole): SubscriptionTier {
  switch (userRole) {
    case 'guest':
    case 'user':
      return 'free';
    case 'premium':
      return 'professional';
    case 'team_lead':
    case 'admin':
      return 'teams';
    case 'super_admin':
    case 'enterprise':
      return 'enterprise';
    default:
      return 'free';
  }
}