import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Breadcrumb {
  icon: string;
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  onNavigate: (path: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  className
}) => {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        'fixed left-5 right-20 flex items-center gap-2',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg',
        'overflow-x-auto scrollbar-none',
        'z-30',
        className
      )}
      style={{ bottom: 'calc(4rem + 1.25rem)' }} // Above bottom nav
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200',
              'text-sm whitespace-nowrap font-medium',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              index === items.length - 1
                ? 'text-gray-900 font-semibold cursor-default' // Active/current item
                : 'text-gray-500 hover:text-primary hover:bg-gray-50 cursor-pointer' // Clickable items
            )}
            onClick={() => onNavigate(item.path)}
            disabled={index === items.length - 1}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            <span className="text-base">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>

          {index < items.length - 1 && (
            <ChevronRight
              className="h-4 w-4 text-gray-300 flex-shrink-0"
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};