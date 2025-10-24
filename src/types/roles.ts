/**
 * User Roles and Permissions System
 * Defines the role hierarchy and permission types for Spark Bloom Flow
 */

// User role hierarchy (from lowest to highest privileges)
export type UserRole =
  | 'guest'        // Unauthenticated or demo users
  | 'user'         // Basic authenticated users
  | 'premium'      // Premium subscription users
  | 'team_lead'    // Team leaders with management features
  | 'admin'        // System administrators
  | 'super_admin'  // Super administrators with full access
  | 'enterprise';  // Enterprise users with custom features

// Feature permission levels
export type FeaturePermission =
  | 'none'         // No access
  | 'read'         // Read-only access
  | 'write'        // Read and write access
  | 'admin'        // Administrative access
  | 'super_admin'; // Super administrative access

// Guest user personas for demo mode
export type GuestUserType =
  | 'executive'
  | 'developer'
  | 'pm'
  | 'freelancer'
  | 'student';

// Subscription tiers
export type SubscriptionTier =
  | 'free'
  | 'professional'
  | 'teams'
  | 'enterprise';

// Feature categories for permission management
export type FeatureCategory =
  | 'core'              // Basic app functionality
  | 'ai'                // AI-powered features
  | 'analytics'         // Analytics and reporting
  | 'collaboration'     // Team collaboration features
  | 'automation'        // Automation and workflows
  | 'integration'       // Third-party integrations
  | 'admin'             // Administrative functions
  | 'customization'     // UI/UX customization
  | 'api'               // API access
  | 'export'            // Data export capabilities
  | 'bulk'              // Bulk operations
  | 'white_label';      // White-label customization

// Specific features that can be gated by permissions
export type Feature =
  // Core features
  | 'basic_tasks'
  | 'basic_goals'
  | 'basic_notes'
  | 'basic_habits'

  // AI features
  | 'ai_insights'
  | 'ai_task_suggestions'
  | 'ai_goal_optimization'
  | 'smart_scheduling'
  | 'productivity_analysis'

  // Analytics features
  | 'advanced_analytics'
  | 'custom_reports'
  | 'productivity_metrics'
  | 'team_analytics'
  | 'performance_tracking'

  // Collaboration features
  | 'team_management'
  | 'shared_projects'
  | 'team_collaboration'
  | 'user_management'
  | 'role_assignment'

  // Automation features
  | 'advanced_automation'
  | 'custom_workflows'
  | 'smart_reminders'
  | 'automated_reporting'

  // Integration features
  | 'calendar_integration'
  | 'email_integration'
  | 'api_access'
  | 'webhook_support'
  | 'third_party_apps'

  // Admin features
  | 'system_configuration'
  | 'user_administration'
  | 'security_settings'
  | 'audit_logs'
  | 'beta_management'

  // Premium features
  | 'unlimited_projects'
  | 'priority_support'
  | 'advanced_customization'
  | 'white_label_settings'
  | 'bulk_operations'
  | 'data_export'
  | 'backup_restore';

// Permission matrix interface
export interface PermissionMatrix {
  [role in UserRole]: {
    [feature in Feature]?: FeaturePermission;
  };
}

// User profile with role information
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  team_id?: string;
  is_team_lead?: boolean;
  guest_type?: GuestUserType;
  created_at: string;
  updated_at: string;
}

// Role capabilities interface
export interface RoleCapabilities {
  role: UserRole;
  description: string;
  features: Feature[];
  maxProjects?: number;
  maxTeamMembers?: number;
  maxStorageGB?: number;
  prioritySupport: boolean;
  customBranding: boolean;
}

// Page access levels
export type PageAccessLevel =
  | 'public'          // Accessible to everyone
  | 'authenticated'   // Requires authentication
  | 'user'           // Requires user role or higher
  | 'premium'        // Requires premium subscription
  | 'team_lead'      // Requires team lead role or higher
  | 'admin'          // Requires admin role or higher
  | 'super_admin';   // Requires super admin role

// Route protection configuration
export interface RouteProtection {
  path: string;
  accessLevel: PageAccessLevel;
  requiredFeatures?: Feature[];
  fallbackPath?: string;
  allowGuest?: boolean;
}