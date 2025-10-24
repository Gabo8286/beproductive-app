import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreadcrumbs, useLayoutContext, type BreadcrumbItem } from '@/hooks/useBreadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface UniversalBreadcrumbsProps {
  customBreadcrumbs?: BreadcrumbItem[];
  className?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
}

export const UniversalBreadcrumbs: React.FC<UniversalBreadcrumbsProps> = ({
  customBreadcrumbs,
  className,
  showBackButton = true,
  backButtonLabel = 'Back',
  onBackClick,
}) => {
  const navigate = useNavigate();
  const { buttonPress } = useHapticFeedback();
  const layoutContext = useLayoutContext();
  const { breadcrumbs, isLoading, shouldShow } = useBreadcrumbs(customBreadcrumbs);


  const handleBackClick = () => {
    buttonPress();
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };


  // Don't render if no breadcrumbs to show
  if (!shouldShow && !isLoading) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <nav
        aria-label="Breadcrumb navigation"
        className={cn(
          'flex items-center gap-2 px-4 py-2',
          layoutContext === 'app-shell' && 'bg-background/95 backdrop-blur-sm border-t',
          className
        )}
      >
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-4 w-24" />
      </nav>
    );
  }

  const baseClasses = cn(
    'flex items-center gap-2 px-4 py-4',
    // AppShell styling (now primary navigation at bottom)
    layoutContext === 'app-shell' && [
      'bg-background/95 backdrop-blur-sm border-t',
      'fixed bottom-0 left-0 right-0 z-40', // Primary navigation position
      'min-h-[60px]' // Ensure adequate touch targets
    ],
    // AppLayout styling (below header)
    layoutContext === 'app-layout' && [
      'border-b bg-background/95 backdrop-blur-sm'
    ],
    className
  );

  return (
    <>
      <nav aria-label="Breadcrumb navigation" className={baseClasses}>
        <div className="flex items-center gap-2 w-full max-w-7xl mx-auto overflow-x-auto">
          {/* Back Button */}
          {showBackButton && (
            <>
              <button
                onClick={handleBackClick}
                className={cn(
                  'flex items-center gap-2 text-primary text-base font-medium',
                  'hover:text-primary/80 transition-colors duration-200',
                  'px-4 py-3 rounded-lg hover:bg-accent/50',
                  'flex-shrink-0 min-h-[44px]', // Better touch target
                  'active:scale-95 touch-manipulation' // Mobile-friendly
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{backButtonLabel}</span>
              </button>
              {breadcrumbs.length > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </>
          )}

          {/* Breadcrumb Items */}
          <ol className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isCurrent = item.isCurrentPage || isLast;

              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                  {item.href && !isCurrent ? (
                    <Link
                      to={item.href}
                      onClick={buttonPress}
                      className={cn(
                        'text-base font-medium text-primary',
                        'hover:text-primary/80 transition-colors duration-200',
                        'px-3 py-2 rounded-lg hover:bg-accent/50',
                        'whitespace-nowrap min-h-[44px] flex items-center',
                        'active:scale-95 touch-manipulation'
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'text-base font-semibold whitespace-nowrap px-3 py-2 min-h-[44px] flex items-center',
                        isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}

                  {!isLast && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>

        </div>
      </nav>

    </>
  );
};

// Task hierarchies are now handled automatically by the main breadcrumb system

// Spacer component for AppShell layout to prevent content from being hidden behind fixed breadcrumbs
export const BreadcrumbSpacer: React.FC = () => {
  const layoutContext = useLayoutContext();
  const { shouldShow } = useBreadcrumbs();

  if (layoutContext !== 'app-shell' || !shouldShow) {
    return null;
  }

  return (
    <div className="h-12 md:h-12" aria-hidden="true" />
  );
};

export default UniversalBreadcrumbs;