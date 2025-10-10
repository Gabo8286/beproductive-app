import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  BarChart3,
  Target,
  RotateCcw,
  FolderOpen,
  Tag,
  Zap,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/z-index';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface FABMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

const fabMenuItems: FABMenuItem[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    description: 'View detailed progress analytics',
  },
  {
    id: 'goals-detail',
    label: 'Goals Detail',
    icon: Target,
    href: '/goals',
    description: 'Manage goals and milestones',
  },
  {
    id: 'habits-detail',
    label: 'Habits Detail',
    icon: RotateCcw,
    href: '/habits',
    description: 'Track habits and routines',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/projects',
    description: 'Manage complex projects',
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: Tag,
    href: '/tags',
    description: 'Organize with tags',
  },
  {
    id: 'automations',
    label: 'Automations',
    icon: Zap,
    href: '/automation',
    description: 'Workflow automation rules',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: FileText,
    href: '/templates',
    description: 'Reusable templates library',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/profile',
    description: 'App settings and preferences',
  },
];

interface AppleFloatingActionButtonProps {
  className?: string;
}

export const AppleFloatingActionButton: React.FC<AppleFloatingActionButtonProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { buttonPress, modalOpen, modalClose } = useHapticFeedback();

  // Close menu on route change or outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOpen && !target.closest('[data-fab-menu]')) {
        setIsOpen(false);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen]);

  const handleMenuItemClick = (href: string) => {
    buttonPress();
    setIsOpen(false);
    navigate(href);
  };

  const handleFABToggle = () => {
    if (isOpen) {
      modalClose();
      setIsOpen(false);
    } else {
      modalOpen();
      setIsOpen(true);
    }
  };

  return (
    <div
      className={cn(
        'fixed',
        // Mobile: bottom right, above tab bar, staggered positioning
        'bottom-24 right-6 md:bottom-6 md:right-6',
        className
      )}
      style={{ zIndex: Z_INDEX.FLOATING_BUTTON }}
      data-fab-menu
    >
      {/* Menu Items */}
      <div
        className={cn(
          'absolute bottom-16 right-0 space-y-3 transition-all duration-300 ease-out',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {fabMenuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 transition-all duration-200',
                isOpen ? 'translate-y-0' : 'translate-y-4'
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              {/* Menu Label */}
              <div className="apple-card px-4 py-3 text-right min-w-[200px] shadow-lg">
                <div className="font-semibold text-sm text-[#1d1d1f]">
                  {item.label}
                </div>
                <div className="text-xs text-[#86868b]">
                  {item.description}
                </div>
              </div>

              {/* Menu Button */}
              <button
                onClick={() => handleMenuItemClick(item.href)}
                className={cn(
                  'apple-fab w-12 h-12 flex items-center justify-center haptic-medium',
                  'transition-all duration-200 hover:scale-110 active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-[#007aff]/30'
                )}
                aria-label={`${item.label} - ${item.description}`}
              >
                <Icon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={handleFABToggle}
        className={cn(
          'apple-fab w-14 h-14 flex items-center justify-center haptic-medium',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-[#007aff]/30',
          isOpen && 'animate-fab-rotate'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <Menu className="w-6 h-6 transition-transform duration-200" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
          style={{ zIndex: Z_INDEX.BACKDROP }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Helper hook for managing FAB state
export const useFABState = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    isOpen,
    toggle,
    close,
    open,
  };
};