/**
 * Role-Based Navigation Service
 * Adapts navigation interface and content based on user roles and permissions
 */

import {
  NavigationHub,
  NavigationHubId,
  UserRole,
  EnhancedNavigationContext,
  SubNavigationItem,
  QuickAction,
} from '@/types/navigation';

interface RoleConfiguration {
  role: UserRole;
  displayName: string;
  description: string;
  hubPriorities: Record<NavigationHubId, number>; // Higher numbers = higher priority
  allowedHubs: NavigationHubId[];
  restrictedFeatures: string[];
  defaultWorkflow: string;
  customizations: {
    showAdvancedFeatures: boolean;
    maxVisibleHubs: number;
    enablePredictiveNavigation: boolean;
    allowCustomization: boolean;
    showAnalytics: boolean;
    enableBulkActions: boolean;
  };
}

interface RoleBasedFeature {
  id: string;
  name: string;
  description: string;
  requiredRoles: UserRole[];
  hubId?: NavigationHubId;
  isAdvanced: boolean;
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  targetRole: UserRole[];
  hubLayout: NavigationHubId[];
  quickActions: string[];
  automations: string[];
  defaultSettings: Record<string, any>;
}

class RoleBasedNavigationService {
  private roleConfigurations: Map<UserRole, RoleConfiguration> = new Map();
  private roleBasedFeatures: RoleBasedFeature[] = [];
  private workspaceTemplates: WorkspaceTemplate[] = [];

  constructor() {
    this.initializeRoleConfigurations();
    this.initializeRoleBasedFeatures();
    this.initializeWorkspaceTemplates();
  }

  /**
   * Initialize role configurations for different user types
   */
  private initializeRoleConfigurations(): void {
    // User role - Standard productivity user
    this.roleConfigurations.set('user', {
      role: 'user',
      displayName: 'Standard User',
      description: 'Individual productivity and personal management',
      hubPriorities: {
        'capture-productivity': 10,
        'planning-time': 9,
        'insights-growth': 8,
        'profile-user': 7,
        'engage-collaboration': 6,
        'search-assistant': 5,
        'advanced-admin': 0, // Not accessible
      },
      allowedHubs: [
        'capture-productivity',
        'planning-time',
        'insights-growth',
        'profile-user',
        'engage-collaboration',
        'search-assistant'
      ],
      restrictedFeatures: ['bulk-operations', 'user-management', 'system-settings', 'api-access'],
      defaultWorkflow: 'personal-productivity',
      customizations: {
        showAdvancedFeatures: false,
        maxVisibleHubs: 5,
        enablePredictiveNavigation: true,
        allowCustomization: true,
        showAnalytics: false,
        enableBulkActions: false,
      }
    });

    // Team Lead role - Manages team and projects
    this.roleConfigurations.set('team_lead', {
      role: 'team_lead',
      displayName: 'Team Lead',
      description: 'Team management and collaboration leadership',
      hubPriorities: {
        'engage-collaboration': 10,
        'capture-productivity': 9,
        'planning-time': 8,
        'insights-growth': 8,
        'profile-user': 6,
        'search-assistant': 7,
        'advanced-admin': 3,
      },
      allowedHubs: [
        'engage-collaboration',
        'capture-productivity',
        'planning-time',
        'insights-growth',
        'profile-user',
        'search-assistant',
        'advanced-admin'
      ],
      restrictedFeatures: ['user-management', 'system-settings'],
      defaultWorkflow: 'team-collaboration',
      customizations: {
        showAdvancedFeatures: true,
        maxVisibleHubs: 6,
        enablePredictiveNavigation: true,
        allowCustomization: true,
        showAnalytics: true,
        enableBulkActions: true,
      }
    });

    // Admin role - System administration
    this.roleConfigurations.set('admin', {
      role: 'admin',
      displayName: 'Administrator',
      description: 'System administration and user management',
      hubPriorities: {
        'advanced-admin': 10,
        'engage-collaboration': 9,
        'insights-growth': 8,
        'capture-productivity': 7,
        'planning-time': 6,
        'profile-user': 5,
        'search-assistant': 8,
      },
      allowedHubs: [
        'advanced-admin',
        'engage-collaboration',
        'insights-growth',
        'capture-productivity',
        'planning-time',
        'profile-user',
        'search-assistant'
      ],
      restrictedFeatures: [],
      defaultWorkflow: 'administration',
      customizations: {
        showAdvancedFeatures: true,
        maxVisibleHubs: 7,
        enablePredictiveNavigation: true,
        allowCustomization: true,
        showAnalytics: true,
        enableBulkActions: true,
      }
    });

    // Super Admin role - Full system access
    this.roleConfigurations.set('super_admin', {
      role: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Complete system control and configuration',
      hubPriorities: {
        'advanced-admin': 10,
        'insights-growth': 9,
        'engage-collaboration': 8,
        'search-assistant': 8,
        'capture-productivity': 7,
        'planning-time': 6,
        'profile-user': 5,
      },
      allowedHubs: [
        'advanced-admin',
        'insights-growth',
        'engage-collaboration',
        'search-assistant',
        'capture-productivity',
        'planning-time',
        'profile-user'
      ],
      restrictedFeatures: [],
      defaultWorkflow: 'system-management',
      customizations: {
        showAdvancedFeatures: true,
        maxVisibleHubs: 8,
        enablePredictiveNavigation: true,
        allowCustomization: true,
        showAnalytics: true,
        enableBulkActions: true,
      }
    });

    // Enterprise role - Enterprise features
    this.roleConfigurations.set('enterprise', {
      role: 'enterprise',
      displayName: 'Enterprise User',
      description: 'Advanced enterprise productivity features',
      hubPriorities: {
        'capture-productivity': 10,
        'planning-time': 9,
        'engage-collaboration': 9,
        'insights-growth': 8,
        'search-assistant': 7,
        'profile-user': 6,
        'advanced-admin': 4,
      },
      allowedHubs: [
        'capture-productivity',
        'planning-time',
        'engage-collaboration',
        'insights-growth',
        'search-assistant',
        'profile-user',
        'advanced-admin'
      ],
      restrictedFeatures: ['user-management'],
      defaultWorkflow: 'enterprise-productivity',
      customizations: {
        showAdvancedFeatures: true,
        maxVisibleHubs: 6,
        enablePredictiveNavigation: true,
        allowCustomization: true,
        showAnalytics: true,
        enableBulkActions: true,
      }
    });
  }

  /**
   * Initialize role-based features
   */
  private initializeRoleBasedFeatures(): void {
    this.roleBasedFeatures = [
      {
        id: 'bulk-task-operations',
        name: 'Bulk Task Operations',
        description: 'Create, edit, and manage multiple tasks simultaneously',
        requiredRoles: ['team_lead', 'admin', 'super_admin', 'enterprise'],
        hubId: 'capture-productivity',
        isAdvanced: true,
      },
      {
        id: 'team-analytics',
        name: 'Team Analytics Dashboard',
        description: 'View team productivity metrics and insights',
        requiredRoles: ['team_lead', 'admin', 'super_admin'],
        hubId: 'insights-growth',
        isAdvanced: true,
      },
      {
        id: 'user-management',
        name: 'User Management',
        description: 'Add, remove, and manage user accounts',
        requiredRoles: ['admin', 'super_admin'],
        hubId: 'advanced-admin',
        isAdvanced: true,
      },
      {
        id: 'system-configuration',
        name: 'System Configuration',
        description: 'Configure system-wide settings and preferences',
        requiredRoles: ['super_admin'],
        hubId: 'advanced-admin',
        isAdvanced: true,
      },
      {
        id: 'api-access',
        name: 'API Access & Webhooks',
        description: 'Configure integrations and API endpoints',
        requiredRoles: ['admin', 'super_admin', 'enterprise'],
        hubId: 'advanced-admin',
        isAdvanced: true,
      },
      {
        id: 'advanced-automation',
        name: 'Advanced Automation',
        description: 'Create complex workflow automations',
        requiredRoles: ['team_lead', 'admin', 'super_admin', 'enterprise'],
        hubId: 'capture-productivity',
        isAdvanced: true,
      },
      {
        id: 'custom-reporting',
        name: 'Custom Reporting',
        description: 'Build custom reports and dashboards',
        requiredRoles: ['team_lead', 'admin', 'super_admin', 'enterprise'],
        hubId: 'insights-growth',
        isAdvanced: true,
      },
      {
        id: 'white-label-settings',
        name: 'White Label Configuration',
        description: 'Customize branding and appearance',
        requiredRoles: ['super_admin'],
        hubId: 'advanced-admin',
        isAdvanced: true,
      },
    ];
  }

  /**
   * Initialize workspace templates
   */
  private initializeWorkspaceTemplates(): void {
    this.workspaceTemplates = [
      {
        id: 'personal-productivity',
        name: 'Personal Productivity',
        description: 'Optimized for individual task management and personal growth',
        targetRole: ['user'],
        hubLayout: ['capture-productivity', 'planning-time', 'insights-growth', 'profile-user'],
        quickActions: ['New Task', 'Quick Note', 'Daily Review', 'Time Block'],
        automations: ['daily-planning-reminder', 'evening-reflection'],
        defaultSettings: {
          showNotifications: true,
          enableFocusMode: true,
          trackingLevel: 'basic',
        }
      },
      {
        id: 'team-collaboration',
        name: 'Team Leadership',
        description: 'Designed for team leads managing people and projects',
        targetRole: ['team_lead'],
        hubLayout: ['engage-collaboration', 'capture-productivity', 'planning-time', 'insights-growth', 'advanced-admin'],
        quickActions: ['Team Check-in', 'Project Update', 'Schedule Meeting', 'Assign Task', 'Team Analytics'],
        automations: ['weekly-team-summary', 'project-status-updates'],
        defaultSettings: {
          showTeamMetrics: true,
          enableMentoring: true,
          trackingLevel: 'detailed',
        }
      },
      {
        id: 'administration',
        name: 'System Administration',
        description: 'Full administrative control and system management',
        targetRole: ['admin', 'super_admin'],
        hubLayout: ['advanced-admin', 'insights-growth', 'engage-collaboration', 'search-assistant'],
        quickActions: ['User Management', 'System Health', 'Security Audit', 'Backup Status', 'Performance Monitor'],
        automations: ['system-health-checks', 'security-monitoring', 'automated-backups'],
        defaultSettings: {
          showSystemMetrics: true,
          enableAdvancedLogging: true,
          trackingLevel: 'comprehensive',
        }
      },
      {
        id: 'enterprise-productivity',
        name: 'Enterprise Workflow',
        description: 'Advanced features for enterprise-level productivity',
        targetRole: ['enterprise'],
        hubLayout: ['capture-productivity', 'planning-time', 'engage-collaboration', 'insights-growth', 'search-assistant'],
        quickActions: ['Bulk Operations', 'Custom Report', 'Integration Setup', 'Workflow Automation', 'Advanced Analytics'],
        automations: ['enterprise-reporting', 'compliance-tracking', 'advanced-integrations'],
        defaultSettings: {
          showAdvancedFeatures: true,
          enableEnterpriseIntegrations: true,
          trackingLevel: 'enterprise',
        }
      },
    ];
  }

  /**
   * Get role configuration for a specific user role
   */
  public getRoleConfiguration(role: UserRole): RoleConfiguration | null {
    return this.roleConfigurations.get(role) || null;
  }

  /**
   * Get adapted navigation hubs for a user role
   */
  public getAdaptedHubs(userRole: UserRole, allHubs: NavigationHub[]): NavigationHub[] {
    const roleConfig = this.getRoleConfiguration(userRole);
    if (!roleConfig) return allHubs;

    // Filter hubs based on role permissions
    const allowedHubs = allHubs.filter(hub =>
      roleConfig.allowedHubs.includes(hub.id)
    );

    // Sort by role-specific priorities
    const sortedHubs = allowedHubs.sort((a, b) => {
      const priorityA = roleConfig.hubPriorities[a.id] || 0;
      const priorityB = roleConfig.hubPriorities[b.id] || 0;
      return priorityB - priorityA;
    });

    // Limit to max visible hubs for role
    return sortedHubs.slice(0, roleConfig.customizations.maxVisibleHubs);
  }

  /**
   * Get role-specific quick actions for a hub
   */
  public getRoleBasedQuickActions(
    hubId: NavigationHubId,
    userRole: UserRole,
    baseActions: QuickAction[]
  ): QuickAction[] {
    const roleConfig = this.getRoleConfiguration(userRole);
    if (!roleConfig) return baseActions;

    // Filter actions based on role restrictions
    const allowedActions = baseActions.filter(action => {
      return !roleConfig.restrictedFeatures.some(restricted =>
        action.id.includes(restricted) || action.label.toLowerCase().includes(restricted)
      );
    });

    // Add role-specific features
    const roleFeatures = this.roleBasedFeatures.filter(feature =>
      feature.hubId === hubId &&
      feature.requiredRoles.includes(userRole)
    );

    const additionalActions: QuickAction[] = roleFeatures.map(feature => ({
      id: feature.id,
      label: feature.name,
      description: feature.description,
      icon: 'Settings', // Default icon
      action: () => {
        console.log(`Executing role-based action: ${feature.name}`);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
      contextRules: [],
    }));

    return [...allowedActions, ...additionalActions];
  }

  /**
   * Get role-based sub-navigation items
   */
  public getRoleBasedSubNavigation(
    hubId: NavigationHubId,
    userRole: UserRole,
    baseSubNav: SubNavigationItem[]
  ): SubNavigationItem[] {
    const roleConfig = this.getRoleConfiguration(userRole);
    if (!roleConfig) return baseSubNav;

    // Filter sub-navigation based on role permissions
    return baseSubNav.filter(item => {
      // Check if user role is allowed for this sub-nav item
      if (item.requiredRole && !item.requiredRole.includes(userRole)) {
        return false;
      }

      // Check against restricted features
      return !roleConfig.restrictedFeatures.some(restricted =>
        item.label.toLowerCase().includes(restricted) ||
        item.path.includes(restricted)
      );
    });
  }

  /**
   * Check if a feature is available for a user role
   */
  public isFeatureAvailableForRole(featureId: string, userRole: UserRole): boolean {
    const feature = this.roleBasedFeatures.find(f => f.id === featureId);
    if (!feature) return false;

    return feature.requiredRoles.includes(userRole);
  }

  /**
   * Get workspace template for a user role
   */
  public getWorkspaceTemplate(userRole: UserRole): WorkspaceTemplate | null {
    return this.workspaceTemplates.find(template =>
      template.targetRole.includes(userRole)
    ) || null;
  }

  /**
   * Get all available workspace templates for a role
   */
  public getAvailableWorkspaceTemplates(userRole: UserRole): WorkspaceTemplate[] {
    return this.workspaceTemplates.filter(template =>
      template.targetRole.includes(userRole)
    );
  }

  /**
   * Get role-based customization settings
   */
  public getRoleBasedCustomizations(userRole: UserRole): RoleConfiguration['customizations'] {
    const roleConfig = this.getRoleConfiguration(userRole);
    return roleConfig?.customizations || {
      showAdvancedFeatures: false,
      maxVisibleHubs: 5,
      enablePredictiveNavigation: false,
      allowCustomization: false,
      showAnalytics: false,
      enableBulkActions: false,
    };
  }

  /**
   * Get role-appropriate onboarding flow
   */
  public getRoleBasedOnboarding(userRole: UserRole): {
    steps: Array<{
      id: string;
      title: string;
      description: string;
      hubId?: NavigationHubId;
      action?: string;
    }>;
    estimatedDuration: number;
  } {
    const baseSteps = [
      {
        id: 'welcome',
        title: 'Welcome to Luna Navigation',
        description: 'Your intelligent navigation companion',
      }
    ];

    switch (userRole) {
      case 'user':
        return {
          steps: [
            ...baseSteps,
            {
              id: 'capture-intro',
              title: 'Capture Your Tasks',
              description: 'Learn to quickly capture tasks and ideas',
              hubId: 'capture-productivity',
              action: 'Create your first task'
            },
            {
              id: 'planning-intro',
              title: 'Plan Your Day',
              description: 'Organize your time with smart planning tools',
              hubId: 'planning-time',
              action: 'Set up time blocking'
            }
          ],
          estimatedDuration: 5
        };

      case 'team_lead':
        return {
          steps: [
            ...baseSteps,
            {
              id: 'team-setup',
              title: 'Set Up Your Team',
              description: 'Configure team collaboration tools',
              hubId: 'engage-collaboration',
              action: 'Invite team members'
            },
            {
              id: 'analytics-intro',
              title: 'Monitor Team Performance',
              description: 'Access team analytics and insights',
              hubId: 'insights-growth',
              action: 'View team dashboard'
            }
          ],
          estimatedDuration: 10
        };

      case 'admin':
      case 'super_admin':
        return {
          steps: [
            ...baseSteps,
            {
              id: 'system-overview',
              title: 'System Administration',
              description: 'Access administrative tools and settings',
              hubId: 'advanced-admin',
              action: 'Review system status'
            },
            {
              id: 'user-management',
              title: 'Manage Users',
              description: 'Add and configure user accounts',
              hubId: 'advanced-admin',
              action: 'Add a new user'
            }
          ],
          estimatedDuration: 15
        };

      default:
        return {
          steps: baseSteps,
          estimatedDuration: 3
        };
    }
  }

  /**
   * Get role hierarchy information
   */
  public getRoleHierarchy(): Array<{
    role: UserRole;
    level: number;
    permissions: string[];
  }> {
    return [
      {
        role: 'user',
        level: 1,
        permissions: ['basic-navigation', 'personal-productivity', 'basic-analytics']
      },
      {
        role: 'enterprise',
        level: 2,
        permissions: ['advanced-features', 'integrations', 'custom-reporting', 'bulk-operations']
      },
      {
        role: 'team_lead',
        level: 3,
        permissions: ['team-management', 'team-analytics', 'project-oversight', 'mentoring-tools']
      },
      {
        role: 'admin',
        level: 4,
        permissions: ['user-management', 'system-configuration', 'security-settings', 'backup-management']
      },
      {
        role: 'super_admin',
        level: 5,
        permissions: ['full-system-access', 'white-label-config', 'enterprise-settings', 'billing-management']
      }
    ];
  }
}

// Export singleton instance
export const roleBasedNavigationService = new RoleBasedNavigationService();
export type { RoleConfiguration, RoleBasedFeature, WorkspaceTemplate };