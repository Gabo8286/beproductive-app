import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Plus, ClipboardList, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabItems: TabItem[] = [
  {
    id: 'capture',
    label: 'Capture',
    href: '/app/capture',
    icon: Plus,
    description: 'Quick capture interface',
  },
  {
    id: 'plan',
    label: 'Plan',
    href: '/app/plan',
    icon: ClipboardList,
    description: 'Organize and filter',
  },
  {
    id: 'engage',
    label: 'Engage',
    href: '/app/engage',
    icon: Target,
    description: 'Today\'s focus',
  },
];

interface TabNavigationBarProps {
  className?: string;
}

export const TabNavigationBar: React.FC<TabNavigationBarProps> = ({
  className,
}) => {
  const location = useLocation();
  const { tabSwitch } = useHapticFeedback();

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'apple-tab-bar safe-area-inset-bottom',
          className
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  'apple-tab-item p-3 rounded-lg min-w-[80px] haptic-light',
                  isActive ? 'active' : ''
                )}
                aria-label={`${item.label} - ${item.description}`}
                onClick={tabSwitch}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-[#007aff] rounded-full mt-1 mx-auto" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-40',
          'bg-[#f5f5f7] border-r border-black/10',
          'flex-col',
          className
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#007aff] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✨</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1d1d1f]">BeProductive</h1>
              <p className="text-xs text-[#86868b]">Redesigned</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-apple-button transition-all duration-200 haptic-light',
                    'hover:bg-white/80 active:scale-[0.98]',
                    isActive
                      ? 'bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]'
                      : 'text-[#1d1d1f] hover:text-[#007aff]'
                  )}
                  onClick={tabSwitch}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-white' : 'text-[#86868b]'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className={cn(
                      'text-xs',
                      isActive ? 'text-white/80' : 'text-[#86868b]'
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-black/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-apple-button hover:bg-white/80 transition-colors">
            <div className="w-8 h-8 bg-[#86868b] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-[#1d1d1f]">User</div>
              <div className="text-xs text-[#86868b]">Tap to open profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Safe area spacing for mobile content */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      {/* Desktop content offset */}
      <div className="hidden md:block w-64" aria-hidden="true" />
    </>
  );
};

// Hook to check if current route is a main tab
export const useActiveTab = () => {
  const location = useLocation();

  const activeTab = tabItems.find(tab => location.pathname === tab.href);

  return {
    activeTab,
    isMainTab: !!activeTab,
  };
};

// Main app shell component for tab navigation
interface TabAppShellProps {
  children: React.ReactNode;
}

export const TabAppShell: React.FC<TabAppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TabNavigationBar />

      {/* Main content area */}
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};