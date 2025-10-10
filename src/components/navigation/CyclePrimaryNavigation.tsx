import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Play,
  BookOpen,
  Settings,
  Timer,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { getPhaseInfo } from '@/modules/productivity-cycle/types/cycle';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CyclePrimaryNavigationProps {
  className?: string;
}

export const CyclePrimaryNavigation: React.FC<CyclePrimaryNavigationProps> = ({
  className
}) => {
  const { state, advanceToNextPhase, getCycleProgress } = useProductivityCycle();
  const navigate = useNavigate();
  const location = useLocation();
  const [focusTime, setFocusTime] = useState(25 * 60); // Mock focus timer

  const currentPhaseInfo = getPhaseInfo(state.currentPhase);
  const cycleProgress = getCycleProgress();

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get primary button content based on current phase
  const getPrimaryButtonContent = () => {
    switch (state.currentPhase) {
      case 'capture':
        return {
          icon: Target,
          text: 'Capture & Record',
          subtext: `${state.dailyGoals.length} goals set`,
          color: 'from-blue-500 to-blue-600',
          route: '/plan'
        };
      case 'execute':
        return {
          icon: Play,
          text: 'Organized Execution',
          subtext: formatTime(focusTime),
          color: 'from-green-500 to-green-600',
          route: '/plan',
          showTimer: true
        };
      case 'engage':
        return {
          icon: BookOpen,
          text: 'Engage & Control',
          subtext: 'Reflect & collaborate',
          color: 'from-purple-500 to-purple-600',
          route: '/plan'
        };
      default:
        return {
          icon: Target,
          text: 'Start Capture',
          subtext: 'Begin your day',
          color: 'from-blue-500 to-blue-600',
          route: '/plan'
        };
    }
  };

  const primaryButton = getPrimaryButtonContent();
  const PrimaryIcon = primaryButton.icon;

  // Phase-specific quick actions
  const getPhaseActions = () => {
    switch (state.currentPhase) {
      case 'capture':
        return [
          { label: 'New Goal', action: () => navigate('/goals/new'), icon: Target },
          { label: 'View Tasks', action: () => navigate('/tasks'), icon: CheckCircle },
          { label: 'Calendar View', action: () => navigate('/tasks?view=calendar'), icon: Clock },
        ];
      case 'execute':
        return [
          { label: 'Task List', action: () => navigate('/tasks'), icon: CheckCircle },
          { label: 'Timer Settings', action: () => {}, icon: Timer },
          { label: 'Focus Analytics', action: () => navigate('/analytics'), icon: Target },
        ];
      case 'engage':
        return [
          { label: 'View Analytics', action: () => navigate('/analytics'), icon: CheckCircle },
          { label: 'Daily Notes', action: () => navigate('/notes'), icon: BookOpen },
          { label: 'Team Updates', action: () => navigate('/collaboration'), icon: Target },
        ];
      default:
        return [];
    }
  };

  const phaseActions = getPhaseActions();

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Primary Cycle Button */}
      <div className="relative">
        <Button
          onClick={() => navigate(primaryButton.route)}
          size="lg"
          className={cn(
            'h-12 px-6 bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-200',
            `${primaryButton.color} hover:scale-105`
          )}
        >
          <div className="flex items-center gap-3">
            <PrimaryIcon className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">{primaryButton.text}</div>
              <div className="text-xs opacity-90">{primaryButton.subtext}</div>
            </div>
            {primaryButton.showTimer && (
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Timer className="h-3 w-3" />
              </div>
            )}
          </div>
        </Button>

        {/* Phase Progress Indicator */}
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${state.phaseProgress}%` }}
          />
        </div>
      </div>

      {/* Phase Actions Dropdown */}
      {phaseActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-12 px-3">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              {currentPhaseInfo.title} Actions
            </div>
            <DropdownMenuSeparator />
            {phaseActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Phase Transition */}
      {cycleProgress.canAdvance && cycleProgress.nextPhase && (
        <Button
          onClick={advanceToNextPhase}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <span className="text-xs">Next: {getPhaseInfo(cycleProgress.nextPhase).title}</span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      )}

      {/* Quick Stats */}
      <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          <span>{state.dailyGoals.length} goals</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{Math.round(state.phaseProgress)}%</span>
        </div>
      </div>
    </div>
  );
};