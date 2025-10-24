/**
 * Page Access Control Matrix
 * Defines access levels and required features for all application routes
 */

import {
  PageAccessLevel,
  Feature,
  RouteProtection
} from '@/types/roles';

// Page access configuration for all routes
export const PAGE_ACCESS_MATRIX: Record<string, RouteProtection> = {
  // Public pages
  '/': {
    path: '/',
    accessLevel: 'public'
  },
  '/login': {
    path: '/login',
    accessLevel: 'public'
  },
  '/signup': {
    path: '/signup',
    accessLevel: 'public'
  },
  '/forgot-password': {
    path: '/forgot-password',
    accessLevel: 'public'
  },
  '/invitation-signup': {
    path: '/invitation-signup',
    accessLevel: 'public'
  },
  '/pricing': {
    path: '/pricing',
    accessLevel: 'public'
  },
  '/features': {
    path: '/features',
    accessLevel: 'public'
  },

  // Authenticated user pages
  '/onboarding': {
    path: '/onboarding',
    accessLevel: 'authenticated',
    allowGuest: false
  },
  '/profile': {
    path: '/profile',
    accessLevel: 'user',
    allowGuest: false
  },

  // Core app pages (authenticated users)
  '/app': {
    path: '/app',
    accessLevel: 'user',
    allowGuest: true,
    fallbackPath: '/login'
  },
  '/app/capture': {
    path: '/app/capture',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_tasks']
  },
  '/app/plan': {
    path: '/app/plan',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_goals']
  },
  '/app/engage': {
    path: '/app/engage',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_habits']
  },
  '/app/profile': {
    path: '/app/profile',
    accessLevel: 'user',
    allowGuest: false
  },

  // Dashboard pages
  '/dashboard': {
    path: '/dashboard',
    accessLevel: 'user',
    allowGuest: true
  },
  '/dashboard-minimal': {
    path: '/dashboard-minimal',
    accessLevel: 'user',
    allowGuest: true
  },
  '/dashboard-context-tester': {
    path: '/dashboard-context-tester',
    accessLevel: 'user',
    allowGuest: true
  },
  '/dashboard-performance-comparison': {
    path: '/dashboard-performance-comparison',
    accessLevel: 'user',
    allowGuest: true
  },

  // Goals and planning
  '/goals': {
    path: '/goals',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_goals']
  },
  '/goals/new': {
    path: '/goals/new',
    accessLevel: 'user',
    allowGuest: false,
    requiredFeatures: ['basic_goals']
  },
  '/goals/:id': {
    path: '/goals/:id',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_goals']
  },

  // Tasks and productivity
  '/tasks': {
    path: '/tasks',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_tasks']
  },
  '/tasks/:id': {
    path: '/tasks/:id',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_tasks']
  },
  '/quick-todos': {
    path: '/quick-todos',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_tasks']
  },

  // Habits and routines
  '/habits': {
    path: '/habits',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_habits']
  },
  '/habits/:id': {
    path: '/habits/:id',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_habits']
  },

  // Notes and reflections
  '/notes': {
    path: '/notes',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_notes']
  },
  '/reflections': {
    path: '/reflections',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_notes']
  },
  '/reflections/:id': {
    path: '/reflections/:id',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_notes']
  },

  // Projects and organization
  '/projects': {
    path: '/projects',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['basic_tasks']
  },
  '/templates': {
    path: '/templates',
    accessLevel: 'user',
    allowGuest: false,
    requiredFeatures: ['basic_tasks']
  },
  '/recurring-tasks': {
    path: '/recurring-tasks',
    accessLevel: 'user',
    allowGuest: false,
    requiredFeatures: ['smart_reminders']
  },
  '/tag-management': {
    path: '/tag-management',
    accessLevel: 'user',
    allowGuest: false,
    requiredFeatures: ['basic_tasks']
  },

  // Premium features
  '/ai-insights': {
    path: '/ai-insights',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['ai_insights']
  },
  '/automation': {
    path: '/automation',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['advanced_automation']
  },
  '/gamification': {
    path: '/gamification',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['productivity_analysis']
  },

  // Assessment and analytics
  '/profile-assessment': {
    path: '/profile-assessment',
    accessLevel: 'user',
    allowGuest: true,
    requiredFeatures: ['productivity_metrics']
  },
  '/analytics': {
    path: '/analytics',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['advanced_analytics']
  },

  // Team features
  '/team': {
    path: '/team',
    accessLevel: 'team_lead',
    allowGuest: false,
    requiredFeatures: ['team_management']
  },
  '/team/members': {
    path: '/team/members',
    accessLevel: 'team_lead',
    allowGuest: false,
    requiredFeatures: ['user_management']
  },
  '/team/projects': {
    path: '/team/projects',
    accessLevel: 'team_lead',
    allowGuest: false,
    requiredFeatures: ['shared_projects']
  },
  '/team/analytics': {
    path: '/team/analytics',
    accessLevel: 'team_lead',
    allowGuest: false,
    requiredFeatures: ['team_analytics']
  },

  // Admin pages
  '/admin': {
    path: '/admin',
    accessLevel: 'admin',
    allowGuest: false,
    fallbackPath: '/app/capture'
  },
  '/admin/users': {
    path: '/admin/users',
    accessLevel: 'admin',
    allowGuest: false,
    requiredFeatures: ['user_administration']
  },
  '/admin/system': {
    path: '/admin/system',
    accessLevel: 'admin',
    allowGuest: false,
    requiredFeatures: ['system_configuration']
  },
  '/admin/beta-signups': {
    path: '/admin/beta-signups',
    accessLevel: 'admin',
    allowGuest: false,
    requiredFeatures: ['beta_management']
  },
  '/admin/analytics': {
    path: '/admin/analytics',
    accessLevel: 'admin',
    allowGuest: false,
    requiredFeatures: ['advanced_analytics']
  },

  // Super admin pages
  '/super-admin': {
    path: '/super-admin',
    accessLevel: 'super_admin',
    allowGuest: false,
    fallbackPath: '/app/capture'
  },
  '/super-admin/setup': {
    path: '/super-admin/setup',
    accessLevel: 'super_admin',
    allowGuest: false,
    requiredFeatures: ['system_configuration']
  },
  '/super-admin/security': {
    path: '/super-admin/security',
    accessLevel: 'super_admin',
    allowGuest: false,
    requiredFeatures: ['security_settings']
  },
  '/super-admin/audit': {
    path: '/super-admin/audit',
    accessLevel: 'super_admin',
    allowGuest: false,
    requiredFeatures: ['audit_logs']
  },

  // Settings and configuration
  '/settings': {
    path: '/settings',
    accessLevel: 'user',
    allowGuest: false
  },
  '/settings/accessibility': {
    path: '/settings/accessibility',
    accessLevel: 'user',
    allowGuest: false
  },
  '/settings/notifications': {
    path: '/settings/notifications',
    accessLevel: 'user',
    allowGuest: false,
    requiredFeatures: ['smart_reminders']
  },
  '/settings/integrations': {
    path: '/settings/integrations',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['calendar_integration']
  },
  '/settings/api': {
    path: '/settings/api',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['api_access']
  },
  '/settings/backup': {
    path: '/settings/backup',
    accessLevel: 'premium',
    allowGuest: false,
    requiredFeatures: ['backup_restore']
  }
};

/**
 * Get page access configuration for a route
 */
export function getPageAccess(pathname: string): RouteProtection | null {
  // First try exact match
  if (PAGE_ACCESS_MATRIX[pathname]) {
    return PAGE_ACCESS_MATRIX[pathname];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(PAGE_ACCESS_MATRIX)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(pathname)) {
        return config;
      }
    }
  }

  // Default to authenticated for unknown routes under /app
  if (pathname.startsWith('/app')) {
    return {
      path: pathname,
      accessLevel: 'user',
      allowGuest: true,
      fallbackPath: '/login'
    };
  }

  // Default to public for other routes
  return {
    path: pathname,
    accessLevel: 'public'
  };
}

/**
 * Get all pages accessible to a specific role
 */
export function getAccessiblePages(userRole: string): RouteProtection[] {
  // This would be implemented based on the role hierarchy
  // For now, return all pages (this should be refined)
  return Object.values(PAGE_ACCESS_MATRIX);
}

/**
 * Check if a route pattern matches a pathname
 */
export function matchRoute(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;

  if (pattern.includes(':')) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(pathname);
  }

  return false;
}

/**
 * Get redirect path for unauthorized access
 */
export function getRedirectPath(
  pathname: string,
  userRole: string,
  isAuthenticated: boolean
): string {
  const pageAccess = getPageAccess(pathname);

  if (!pageAccess) return '/';

  if (!isAuthenticated && pageAccess.accessLevel !== 'public') {
    return '/login';
  }

  return pageAccess.fallbackPath || '/app/capture';
}

// Route categories for navigation and organization
export const ROUTE_CATEGORIES = {
  public: ['/', '/login', '/signup', '/pricing', '/features'],

  core: [
    '/app/capture',
    '/app/plan',
    '/app/engage',
    '/app/profile'
  ],

  productivity: [
    '/goals',
    '/tasks',
    '/habits',
    '/notes',
    '/projects',
    '/quick-todos'
  ],

  premium: [
    '/ai-insights',
    '/automation',
    '/analytics',
    '/gamification'
  ],

  team: [
    '/team',
    '/team/members',
    '/team/projects',
    '/team/analytics'
  ],

  admin: [
    '/admin',
    '/admin/users',
    '/admin/system',
    '/admin/beta-signups'
  ],

  settings: [
    '/settings',
    '/settings/accessibility',
    '/settings/notifications',
    '/settings/integrations'
  ]
} as const;