import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Target, BarChart3, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { getPhaseInfo } from '@/modules/productivity-cycle/types/cycle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';

interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainTabs: NavTab[] = [
  {
    id: 'capture',
    label: 'Capture',
    href: '/app/capture',
    icon: Home,
  },
  {
    id: 'plan',
    label: 'Plan',
    href: '/app/plan',
    icon: CheckSquare,
  },
  {
    id: 'execute',
    label: 'Execute',
    href: '/app/engage',
    icon: Target,
  },
];

export const UnifiedBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { buttonPress } = useHapticFeedback();
  const { state } = useProductivityCycle();
  const { data: tasks } = useTasks();
  const { goals } = useGoals();

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
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 md:hidden bg-primary rounded-full" />
                    )}
                  </NavLink>
                );
              })}

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 min-w-[64px] md:min-w-0 px-3 md:px-4 py-2"
                    onClick={buttonPress}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="text-xs md:text-sm font-medium">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    🏠 Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/tasks')}>
                    ✓ Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/goals')}>
                    🎯 Goals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/analytics')}>
                    📊 Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/notes')}>
                    📝 Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/habits')}>
                    🔄 Habits
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/projects')}>
                    🚀 Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pomodoro')}>
                    🍅 Pomodoro
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings/accessibility')}>
                    ⚙️ Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    👤 Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Quick Stats (Right - Desktop Only) */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>{activeTasks} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                <span>{activeGoals} goals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action FAB (Positioned above bottom nav) */}
      <button
        onClick={handleQuickAction}
        className={cn(
          'fixed right-5 w-14 h-14 rounded-full shadow-xl',
          'bg-gradient-to-r text-white',
          'hover:scale-110 active:scale-95 transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-primary/30',
          'flex items-center justify-center',
          'z-50',
          getPhaseColor()
        )}
        style={{ bottom: 'calc(4rem + 1.25rem)' }} // 64px (nav height) + 20px spacing
        aria-label="Quick action"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Spacer for content */}
      <div className="h-16 md:h-14" aria-hidden="true" />
    </>
  );
};
