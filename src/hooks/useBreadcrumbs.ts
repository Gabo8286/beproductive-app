import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface EntityData {
  id: string;
  title?: string;
  name?: string;
  full_name?: string;
}

// Hook to fetch entity names dynamically for breadcrumbs
const useEntityName = (type: 'task' | 'goal' | 'project' | 'user' | null, id: string | undefined) => {
  return useQuery({
    queryKey: ['entity-name', type, id],
    queryFn: async () => {
      if (!type || !id) return null;

      let table: string;
      let nameField: string;

      switch (type) {
        case 'task':
          table = 'tasks';
          nameField = 'title';
          break;
        case 'goal':
          table = 'goals';
          nameField = 'title';
          break;
        case 'project':
          table = 'projects';
          nameField = 'name';
          break;
        case 'user':
          table = 'profiles';
          nameField = 'full_name';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(table)
        .select(`id, ${nameField}`)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return (data as EntityData)[nameField as keyof EntityData] || `${type} ${id}`;
    },
    enabled: !!(type && id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBreadcrumbs = (customBreadcrumbs?: BreadcrumbItem[]) => {
  const location = useLocation();
  const params = useParams();

  // Extract entity info from current route
  const { entityType, entityId } = useMemo(() => {
    const path = location.pathname;

    if (path.includes('/tasks/') && params.id) {
      return { entityType: 'task' as const, entityId: params.id };
    }
    if (path.includes('/goals/') && params.id) {
      return { entityType: 'goal' as const, entityId: params.id };
    }
    if (path.includes('/projects/') && params.id) {
      return { entityType: 'project' as const, entityId: params.id };
    }
    return { entityType: null, entityId: undefined };
  }, [location.pathname, params.id]);

  // Fetch entity name for dynamic breadcrumbs
  const { data: entityName, isLoading } = useEntityName(entityType, entityId);

  const autoBreadcrumbs = useMemo((): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Skip breadcrumbs for main app tabs (they are top-level)
    if (path === '/app/capture' || path === '/app/plan' || path === '/app/engage' || path === '/app/profile') {
      return [];
    }

    // Auto-generate breadcrumbs based on common patterns
    if (path.startsWith('/tasks')) {
      breadcrumbs.push({ label: 'Plan', href: '/app/plan' });

      if (!path.includes('/tasks/')) {
        // Tasks list page
        breadcrumbs.push({ label: 'Tasks', isCurrentPage: true });
      } else if (params.id) {
        // Task detail page
        breadcrumbs.push({ label: 'Tasks', href: '/tasks' });
        breadcrumbs.push({
          label: entityName || `Task ${params.id}`,
          isCurrentPage: true
        });
      }
    }

    else if (path.startsWith('/goals')) {
      breadcrumbs.push({ label: 'Plan', href: '/app/plan' });

      if (path === '/goals/new') {
        breadcrumbs.push({ label: 'Goals', href: '/goals' });
        breadcrumbs.push({ label: 'New Goal', isCurrentPage: true });
      } else if (!path.includes('/goals/')) {
        // Goals list page
        breadcrumbs.push({ label: 'Goals', isCurrentPage: true });
      } else if (params.id) {
        // Goal detail page
        breadcrumbs.push({ label: 'Goals', href: '/goals' });
        breadcrumbs.push({
          label: entityName || `Goal ${params.id}`,
          isCurrentPage: true
        });
      }
    }

    else if (path.startsWith('/projects')) {
      breadcrumbs.push({ label: 'Plan', href: '/app/plan' });

      if (!path.includes('/projects/')) {
        // Projects list page
        breadcrumbs.push({ label: 'Projects', isCurrentPage: true });
      } else if (params.id) {
        // Project detail page
        breadcrumbs.push({ label: 'Projects', href: '/projects' });
        breadcrumbs.push({
          label: entityName || `Project ${params.id}`,
          isCurrentPage: true
        });
      }
    }

    else if (path.startsWith('/habits')) {
      breadcrumbs.push({ label: 'Engage', href: '/app/engage' });

      if (!path.includes('/habits/')) {
        breadcrumbs.push({ label: 'Habits', isCurrentPage: true });
      } else if (params.id) {
        breadcrumbs.push({ label: 'Habits', href: '/habits' });
        breadcrumbs.push({
          label: entityName || `Habit ${params.id}`,
          isCurrentPage: true
        });
      }
    }

    else if (path.startsWith('/settings') || path.startsWith('/account-settings') || path.startsWith('/billing')) {
      breadcrumbs.push({ label: 'Profile', href: '/app/profile' });

      if (path.startsWith('/settings')) {
        if (path === '/settings') {
          breadcrumbs.push({ label: 'Settings', isCurrentPage: true });
        } else {
          breadcrumbs.push({ label: 'Settings', href: '/settings' });
          // Add specific settings section
          if (path.includes('/accessibility')) {
            breadcrumbs.push({ label: 'Accessibility', isCurrentPage: true });
          }
        }
      } else if (path.startsWith('/account-settings')) {
        breadcrumbs.push({ label: 'Account Settings', isCurrentPage: true });
      } else if (path.startsWith('/billing')) {
        breadcrumbs.push({ label: 'Billing', isCurrentPage: true });
      }
    }

    else if (path.startsWith('/profile-assessment')) {
      breadcrumbs.push({ label: 'Profile', href: '/app/profile' });
      breadcrumbs.push({ label: 'Productivity Assessment', isCurrentPage: true });
    }

    else if (path.startsWith('/analytics')) {
      breadcrumbs.push({ label: 'Analytics', isCurrentPage: true });
    }

    else if (path.startsWith('/calendar')) {
      breadcrumbs.push({ label: 'Calendar', isCurrentPage: true });
    }

    else if (path.startsWith('/notes')) {
      breadcrumbs.push({ label: 'Luna', href: '/app/capture' });
      breadcrumbs.push({ label: 'Notes', isCurrentPage: true });
    }

    else if (path.startsWith('/reflections')) {
      breadcrumbs.push({ label: 'Luna', href: '/app/capture' });
      breadcrumbs.push({ label: 'Reflections', isCurrentPage: true });
    }

    else if (path.startsWith('/quick-todos')) {
      breadcrumbs.push({ label: 'Luna', href: '/app/capture' });
      breadcrumbs.push({ label: 'Quick To-dos', isCurrentPage: true });
    }

    return breadcrumbs;
  }, [location.pathname, params.id, entityName]);

  // Return custom breadcrumbs if provided, otherwise auto-generated ones
  return {
    breadcrumbs: customBreadcrumbs || autoBreadcrumbs,
    isLoading,
    shouldShow: (customBreadcrumbs || autoBreadcrumbs).length > 0
  };
};

// Helper function to determine if breadcrumbs should be shown above bottom nav (AppShell)
export const useShouldShowBreadcrumbsAboveBottomNav = () => {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;

    // Show for deep navigation from main tabs
    return path.includes('/tasks/') ||
           path.includes('/goals/') ||
           path.includes('/projects/') ||
           path.includes('/habits/') ||
           (path.startsWith('/notes') && path !== '/notes') ||
           (path.startsWith('/reflections') && path !== '/reflections') ||
           path.startsWith('/quick-todos') ||
           path.startsWith('/settings') ||
           path.startsWith('/account-settings') ||
           path.startsWith('/billing') ||
           path.startsWith('/profile-assessment');
  }, [location.pathname]);
};

// Helper function to determine layout context
export const useLayoutContext = () => {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;

    // AppShell layout for main app tabs
    if (path.startsWith('/app/')) {
      return 'app-shell';
    }

    // AppLayout for everything else
    return 'app-layout';
  }, [location.pathname]);
};