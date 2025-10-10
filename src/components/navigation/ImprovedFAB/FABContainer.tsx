import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FABButton } from './FABButton';
import { FABMenu } from './FABMenu';
import { Breadcrumbs, Breadcrumb } from './Breadcrumbs';
import { getCategoriesForTab } from './fab-categories';
import { executeAction, setGlobalViewActions } from './fab-actions';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useGlobalView } from '@/contexts/GlobalViewContext';

interface FABContainerProps {
  className?: string;
}

export const FABContainer: React.FC<FABContainerProps> = ({ className }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { buttonPress, success } = useHapticFeedback();

  // Global view integration
  const globalView = useGlobalView();

  // Determine current tab based on route
  const currentTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/app/capture')) return 'capture';
    if (path.includes('/app/plan')) return 'plan';
    if (path.includes('/app/engage')) return 'engage';
    return 'capture'; // default
  }, [location.pathname]);

  // Get categories based on current tab
  const categories = useMemo(() => {
    return getCategoriesForTab(currentTab);
  }, [currentTab]);

  // Generate breadcrumbs based on current location
  const breadcrumbs = useMemo((): Breadcrumb[] => {
    const path = location.pathname;
    const breadcrumbItems: Breadcrumb[] = [];

    // Add tab-level breadcrumb
    if (path.includes('/app/capture')) {
      breadcrumbItems.push({ icon: '➕', label: 'Capture', path: '/app/capture' });
    } else if (path.includes('/app/plan')) {
      breadcrumbItems.push({ icon: '📋', label: 'Plan', path: '/app/plan' });
    } else if (path.includes('/app/engage')) {
      breadcrumbItems.push({ icon: '🎯', label: 'Engage', path: '/app/engage' });
    }

    // Add specific page breadcrumbs for detailed views
    if (path.includes('/goals')) {
      breadcrumbItems.push({ icon: '🎯', label: 'Goals', path: '/goals' });
    } else if (path.includes('/tasks')) {
      breadcrumbItems.push({ icon: '✅', label: 'Tasks', path: '/tasks' });
    } else if (path.includes('/projects')) {
      breadcrumbItems.push({ icon: '🚀', label: 'Projects', path: '/projects' });
    } else if (path.includes('/habits')) {
      breadcrumbItems.push({ icon: '🔄', label: 'Habits', path: '/habits' });
    } else if (path.includes('/notes')) {
      breadcrumbItems.push({ icon: '📝', label: 'Notes', path: '/notes' });
    } else if (path.includes('/analytics')) {
      breadcrumbItems.push({ icon: '📊', label: 'Analytics', path: '/analytics' });
    }

    return breadcrumbItems;
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setExpandedCategory(null);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  // Set up global view actions for the FAB system
  useEffect(() => {
    setGlobalViewActions({
      setViewMode: globalView.setViewMode,
      setFilter: globalView.setFilter,
      clearFilters: globalView.clearFilters,
      setSort: globalView.setSort,
      toggleSortOrder: globalView.toggleSortOrder,
      setGroup: globalView.setGroup,
      setCategoryFilter: globalView.setCategoryFilter,
    });
  }, [globalView]);

  const handleFABClick = () => {
    buttonPress();
    setMenuOpen(!menuOpen);
    if (menuOpen) {
      setExpandedCategory(null);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    buttonPress();
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleItemClick = (action: string, value: any) => {
    success();

    // Execute the action with current tab context
    executeAction(action, value, navigate, currentTab);

    // Close menu
    setMenuOpen(false);
    setExpandedCategory(null);
  };

  const handleBreadcrumbNavigate = (path: string) => {
    buttonPress();
    navigate(path);
  };

  return (
    <div className={className}>
      {/* FAB Menu */}
      {menuOpen && (
        <FABMenu
          ref={menuRef}
          categories={categories}
          expandedCategory={expandedCategory}
          onCategoryClick={handleCategoryClick}
          onItemClick={handleItemClick}
        />
      )}

      {/* Main FAB Button */}
      <FABButton
        open={menuOpen}
        onClick={handleFABClick}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={breadcrumbs}
        onNavigate={handleBreadcrumbNavigate}
      />

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30"
          onClick={() => {
            setMenuOpen(false);
            setExpandedCategory(null);
          }}
        />
      )}
    </div>
  );
};