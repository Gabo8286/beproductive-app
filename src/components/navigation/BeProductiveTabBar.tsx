import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Calendar,
  Target,
  User,
  Bot,
  Shield,
  Palette,
  Smartphone,
  Layers,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { useLuna } from '@/components/luna/context/LunaContext';
import { LunaActionSheetSettingsModal } from '@/components/luna/settings/LunaActionSheetSettingsModal';
import { ActionSheetType } from '@/components/luna/actionsheets/types';
import { useLunaFAB } from '@/components/luna/providers/useLunaFAB';
import { useSuperAdminAccess } from '@/hooks/useSupeRadminAccess';

interface TabItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface BeProductiveTabBarProps {
  className?: string;
}

export const BeProductiveTabBar: React.FC<BeProductiveTabBarProps> = ({
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { buttonPress } = useHapticFeedback();
  const { actionSheetType, setActionSheetType, openChat, openUnifiedMenu } = useLuna();
  const { isSuperAdmin } = useSuperAdminAccess();

  const [enableActionSheetSwitcher, setEnableActionSheetSwitcher] = useState(false);
  const [isLunaSettingsOpen, setIsLunaSettingsOpen] = useState(false);

  const baseTabs: TabItem[] = [
    {
      id: 'capture',
      path: '/app/capture',
      icon: PlusCircle,
      label: 'Capture'
    },
    {
      id: 'plan',
      path: '/app/plan',
      icon: Calendar,
      label: 'Plan'
    },
    {
      id: 'luna',
      path: '#luna', // Special path for Luna action
      icon: Bot,
      label: 'Luna'
    },
    {
      id: 'engage',
      path: '/app/engage',
      icon: Target,
      label: 'Engage'
    },
    {
      id: 'profile',
      path: '/app/profile',
      icon: User,
      label: 'Profile'
    }
  ];

  // Add super admin tab conditionally
  const tabs: TabItem[] = isSuperAdmin ? [
    ...baseTabs,
    {
      id: 'admin',
      path: '/app/admin',
      icon: Shield,
      label: 'Admin'
    }
  ] : baseTabs;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/app/capture')) return 'capture';
    if (path.startsWith('/app/plan')) return 'plan';
    if (path.startsWith('/app/engage')) return 'engage';
    if (path.startsWith('/app/profile')) return 'profile';
    if (path.startsWith('/app/admin')) return 'admin';
    return null;
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabItem) => {
    buttonPress();

    if (tab.id === 'luna') {
      // Always open unified menu for navigation and shortcuts
      openUnifiedMenu();
    } else {
      navigate(tab.path);
    }
  };

  const quickAccessStyles: { type: ActionSheetType; icon: React.ComponentType<{ className?: string }>; label: string; description: string }[] = [
    {
      type: 'classic-ios',
      icon: Smartphone,
      label: 'Classic iOS',
      description: 'Traditional iOS action sheet'
    },
    {
      type: 'floating-panel',
      icon: Layers,
      label: 'Floating Panel',
      description: 'Modern floating panel'
    },
    {
      type: 'expandable-tab',
      icon: Menu,
      label: 'Expandable Tab',
      description: 'Tab that expands to reveal actions'
    }
  ];

  const handleStyleChange = (type: ActionSheetType) => {
    buttonPress();
    setActionSheetType(type);
    setEnableActionSheetSwitcher(false);
  };

  const handleMoreStyles = () => {
    buttonPress();
    setEnableActionSheetSwitcher(false);
    setIsLunaSettingsOpen(true);
  };


  return (
    <>
      {/* Quick Access Styles Floating Dropdown */}
      <AnimatePresence>
        {enableActionSheetSwitcher && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
              onClick={() => setEnableActionSheetSwitcher(false)}
            />

            {/* Quick Access Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50',
                'bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20',
                'w-80 p-4'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Quick Access Styles</h3>
                    <p className="text-xs text-gray-500">Choose Luna interaction style</p>
                  </div>
                </div>
              </div>

              {/* Quick Access Options */}
              <div className="space-y-2 mb-4">
                {quickAccessStyles.map((style) => {
                  const Icon = style.icon;
                  const isSelected = actionSheetType === style.type;

                  return (
                    <motion.button
                      key={style.type}
                      onClick={() => handleStyleChange(style.type)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        isSelected
                          ? 'bg-primary/10 border-2 border-primary/30'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-primary' : 'text-gray-900'
                        )}>
                          {style.label}
                        </div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* More Styles Button */}
              <motion.button
                onClick={handleMoreStyles}
                className={cn(
                  'w-full flex items-center justify-center gap-2 p-3 rounded-xl',
                  'bg-gradient-to-r from-primary/10 to-primary/5',
                  'border border-primary/20 hover:border-primary/40',
                  'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
                )}
                whileTap={{ scale: 0.98 }}
              >
                <MoreHorizontal className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">More Styles</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* iOS Tab Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'bg-background/95 backdrop-blur-xl border-t border-border',
          'supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]',
          'transition-colors duration-200',
          className
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200',
                  'min-w-0 flex-1 max-w-[80px]',
                  'active:scale-95 touch-manipulation',
                  isActive ? 'bg-primary/10' : 'hover:bg-accent/50',
                  // Special styling for Luna button
                  tab.id === 'luna' && 'bg-gradient-to-b from-primary/20 to-primary/10 border border-primary/30',
                  // Special styling for Admin button
                  tab.id === 'admin' && 'bg-gradient-to-b from-orange-100 to-orange-50 border border-orange-200'
                )}
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon Container */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -1 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative"
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground',
                      // Special styling for Luna icon
                      tab.id === 'luna' && 'text-primary',
                      // Special styling for Admin icon
                      tab.id === 'admin' && 'text-orange-600'
                    )}
                  />

                  {/* Badge for notifications */}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-bold">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                    fontWeight: isActive ? 600 : 400,
                    scale: isActive ? 1.05 : 1
                  }}
                  className="text-xs truncate transition-all duration-200"
                >
                  {tab.label}
                </motion.span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Home Indicator (iOS style) */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </nav>

      {/* Content Spacer */}
      <div className="h-20" aria-hidden="true" />

      {/* Luna Action Sheet Settings Modal */}
      <LunaActionSheetSettingsModal
        isOpen={isLunaSettingsOpen}
        onClose={() => setIsLunaSettingsOpen(false)}
      />
    </>
  );
};