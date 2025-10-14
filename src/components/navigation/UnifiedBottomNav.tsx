import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Target, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { getPhaseInfo } from '@/modules/productivity-cycle/types/cycle';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useTranslation } from 'react-i18next';

interface NavTab {
  id: string;
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const UnifiedBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { buttonPress } = useHapticFeedback();
  const { state } = useProductivityCycle();
  const { data: tasks } = useTasks();
  const { goals } = useGoals();
  const { t } = useTranslation('navigation');

  const mainTabs: NavTab[] = [
    {
      id: 'luna',
      labelKey: 'luna',
      href: '/app/capture', // Keep href for fallback, but will be overridden
      icon: Bot,
    },
    {
      id: 'plan',
      labelKey: 'plan',
      href: '/app/plan',
      icon: CheckSquare,
    },
    {
      id: 'execute',
      labelKey: 'engage',
      href: '/app/engage',
      icon: Target,
    },
    {
      id: 'profile',
      labelKey: 'profile',
      href: '/app/profile',
      icon: User,
    },
  ];

  const currentPhaseInfo = getPhaseInfo(state.currentPhase);
  
  const activeTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const activeGoals = goals.filter(g => g.status === 'active').length || 0;

  const getPhaseColor = () => {
    switch (state.currentPhase) {
      case 'capture':
        return 'from-blue-500 to-blue-600';
      case 'execute':
        return 'from-green-500 to-green-600';
      case 'engage':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-primary to-primary';
    }
  };

  const handleQuickAction = () => {
    buttonPress();
    // Navigate to appropriate page based on current phase
    if (state.currentPhase === 'capture') {
      navigate('/tasks');
    } else if (state.currentPhase === 'execute') {
      navigate('/tasks');
    } else {
      navigate('/goals/new');
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cycle Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div
              className={cn('h-full transition-all duration-300 bg-gradient-to-r', getPhaseColor())}
              style={{ width: `${state.phaseProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between h-16 md:h-14">
            {/* Cycle Phase Button (Left) */}
            <button
              onClick={() => {
                buttonPress();
                navigate('/app/plan');
              }}
              className={cn(
                'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full',
                'bg-gradient-to-r text-white text-xs font-medium',
                'hover:scale-105 active:scale-95 transition-transform',
                getPhaseColor()
              )}
            >
              <span className="text-base">{currentPhaseInfo.icon}</span>
              <span>{currentPhaseInfo.title}</span>
              <span className="opacity-75">{Math.round(state.phaseProgress)}%</span>
            </button>

            {/* Main Navigation Tabs (Center) */}
            <nav className="flex items-center justify-center flex-1 gap-1 md:gap-2">
              {mainTabs.map((tab) => {
                const isActive = location.pathname === tab.href || location.pathname.startsWith(tab.href + '/');
                const Icon = tab.icon;

                // Special handling for Luna tab
                if (tab.id === 'luna') {
                  return (
                    <button
                      key={tab.id}
                      onClick={(e) => {
                        e.preventDefault();
                        buttonPress();
                        // Emit event to open Luna unified menu
                        window.dispatchEvent(new CustomEvent('open-luna-unified-menu', {
                          detail: { fromBottomNav: true }
                        }));
                      }}
                      className={cn(
                        'flex flex-col md:flex-row items-center gap-0.5 md:gap-2',
                        'px-3 md:px-4 py-2 rounded-lg transition-all duration-200',
                        'min-w-[64px] md:min-w-0',
                        'active:scale-95 touch-manipulation',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs md:text-sm font-medium">
                        {t(tab.labelKey)}
                      </span>
                      {isActive && (
                        <div className="w-1 h-1 md:hidden bg-primary rounded-full" />
                      )}
                    </button>
                  );
                }

                // Regular NavLink for other tabs
                return (
                  <NavLink
                    key={tab.id}
                    to={tab.href}
                    onClick={buttonPress}
                    className={cn(
                      'flex flex-col md:flex-row items-center gap-0.5 md:gap-2',
                      'px-3 md:px-4 py-2 rounded-lg transition-all duration-200',
                      'min-w-[64px] md:min-w-0',
                      'active:scale-95 touch-manipulation',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs md:text-sm font-medium">
                      {t(tab.labelKey)}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 md:hidden bg-primary rounded-full" />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Stats (Right - Desktop Only) */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>{activeTasks} {t('tasks')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                <span>{activeGoals} {t('goals')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for content */}
      <div className="h-16 md:h-14" aria-hidden="true" />
    </>
  );
};
