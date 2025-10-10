import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface SimpleBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
}

export const SimpleBreadcrumbs: React.FC<SimpleBreadcrumbsProps> = ({
  items,
  className,
  showBackButton = true,
  backButtonLabel = 'Back',
  onBackClick,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn('flex items-center gap-2 mb-4', className)}
    >
      {/* Back Button */}
      {showBackButton && (
        <>
          <button
            onClick={handleBackClick}
            className={cn(
              'flex items-center gap-2 text-[#007aff] text-sm font-medium',
              'hover:text-[#007aff]/80 transition-colors duration-200',
              'apple-button px-3 py-2'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{backButtonLabel}</span>
          </button>
          <ChevronRight className="w-4 h-4 text-[#86868b]" />
        </>
      )}

      {/* Breadcrumb Items */}
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.isCurrentPage || isLast;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isCurrent ? (
                <Link
                  to={item.href}
                  className={cn(
                    'text-sm font-medium text-[#007aff]',
                    'hover:text-[#007aff]/80 transition-colors duration-200',
                    'apple-button px-2 py-1 rounded-apple-small'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-[#1d1d1f]' : 'text-[#86868b]'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-4 h-4 text-[#86868b]" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper hook to generate breadcrumbs from route
export const useBreadcrumbs = () => {
  // This can be extended to automatically generate breadcrumbs from the current route
  // For now, it's a simple utility to help construct breadcrumb items

  const createBreadcrumb = (
    label: string,
    href?: string,
    isCurrentPage?: boolean
  ): BreadcrumbItem => ({
    label,
    href,
    isCurrentPage,
  });

  const createBreadcrumbs = (...items: Array<[string, string?] | [string, string, boolean]>): BreadcrumbItem[] => {
    return items.map((item, index) => {
      if (Array.isArray(item)) {
        const [label, href, isCurrentPage] = item;
        return createBreadcrumb(label, href, isCurrentPage);
      }
      return createBreadcrumb(item);
    });
  };

  return {
    createBreadcrumb,
    createBreadcrumbs,
  };
};

// Common breadcrumb patterns
export const commonBreadcrumbs = {
  // For detail views from main tabs
  goalDetail: (goalTitle: string): BreadcrumbItem[] => [
    { label: 'Plan', href: '/app/plan' },
    { label: 'Goals', href: '/goals' },
    { label: goalTitle, isCurrentPage: true },
  ],

  habitDetail: (habitTitle: string): BreadcrumbItem[] => [
    { label: 'Engage', href: '/app/engage' },
    { label: 'Habits Detail', href: '/habits' },
    { label: habitTitle, isCurrentPage: true },
  ],

  projectDetail: (projectTitle: string): BreadcrumbItem[] => [
    { label: 'Plan', href: '/app/plan' },
    { label: 'Projects', href: '/projects' },
    { label: projectTitle, isCurrentPage: true },
  ],

  analytics: (): BreadcrumbItem[] => [
    { label: 'Analytics', isCurrentPage: true },
  ],

  settings: (settingSection?: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Settings', href: '/profile' },
    ];

    if (settingSection) {
      items.push({ label: settingSection, isCurrentPage: true });
    } else {
      items[0].isCurrentPage = true;
    }

    return items;
  },
};