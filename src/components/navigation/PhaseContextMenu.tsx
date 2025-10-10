import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  CheckSquare,
  Timer,
  Calendar,
  BookOpen,
  Settings,
  Zap,
  FileText,
  Coffee,
  Lightbulb,
  Repeat,
  BarChart3,
  Notebook,
  Users,
  Workflow,
  ChevronRight
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { useNavigate } from 'react-router-dom';
import { getPhaseInfo } from '@/modules/productivity-cycle/types/cycle';

interface PhaseContextMenuProps {
  children: React.ReactNode;
  onAction?: (action: string) => void;
  trigger?: React.ReactNode;
}

interface ContextAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  group: 'primary' | 'quick' | 'advanced';
}

export const PhaseContextMenu: React.FC<PhaseContextMenuProps> = ({
  children,
  onAction,
  trigger
}) => {
  const { state, setCurrentPhase, advanceToNextPhase } = useProductivityCycle();
  const navigate = useNavigate();

  // Get phase-specific context actions
  const getContextActions = (): ContextAction[] => {
    const baseActions: ContextAction[] = [
      {
        id: 'dashboard',
        label: 'Go to Dashboard',
        icon: Target,
        action: () => navigate('/app/capture'),
        shortcut: 'Cmd+D',
        group: 'primary'
      },
      {
        id: 'tasks',
        label: 'View Tasks',
        icon: CheckSquare,
        action: () => navigate('/tasks'),
        shortcut: 'Cmd+T',
        group: 'primary'
      }
    ];

    switch (state.currentPhase) {
      case 'capture':
        return [
          ...baseActions,
          {
            id: 'new-goal',
            label: 'Create New Goal',
            icon: Target,
            action: () => navigate('/goals/new'),
            shortcut: 'Cmd+N',
            group: 'quick'
          },
          {
            id: 'quick-task',
            label: 'Add Quick Task',
            icon: CheckSquare,
            action: () => navigate('/quick-todos'),
            shortcut: 'Cmd+K',
            group: 'quick'
          },
          {
            id: 'priority-matrix',
            label: 'Priority Matrix',
            icon: Target,
            action: () => navigate('/app/plan'),
            group: 'quick'
          },
          {
            id: 'calendar',
            label: 'Calendar View',
            icon: Calendar,
            action: () => navigate('/tasks?view=calendar'),
            group: 'advanced'
          },
          {
            id: 'goals',
            label: 'Manage Goals',
            icon: Target,
            action: () => navigate('/goals'),
            group: 'advanced'
          }
        ];

      case 'execute':
        return [
          ...baseActions,
          {
            id: 'focus-timer',
            label: 'Start Focus Timer',
            icon: Timer,
            action: () => {
              // Trigger focus mode
              onAction?.('start-timer');
            },
            shortcut: 'Space',
            group: 'quick'
          },
          {
            id: 'break-timer',
            label: 'Take Break',
            icon: Coffee,
            action: () => {
              onAction?.('start-break');
            },
            shortcut: 'Cmd+B',
            group: 'quick'
          },
          {
            id: 'mark-done',
            label: 'Mark Task Complete',
            icon: CheckSquare,
            action: () => navigate('/tasks'),
            shortcut: 'Cmd+Enter',
            group: 'quick'
          },
          {
            id: 'capture-note',
            label: 'Quick Note',
            icon: Notebook,
            action: () => navigate('/notes'),
            shortcut: 'Cmd+J',
            group: 'advanced'
          }
        ];

      case 'engage':
        return [
          ...baseActions,
          {
            id: 'add-reflection',
            label: 'Add Reflection',
            icon: Lightbulb,
            action: () => navigate('/reflections'),
            shortcut: 'Cmd+R',
            group: 'quick'
          },
          {
            id: 'view-analytics',
            label: 'View Analytics',
            icon: BarChart3,
            action: () => navigate('/analytics'),
            group: 'quick'
          },
          {
            id: 'collaboration',
            label: 'Team Collaboration',
            icon: Users,
            action: () => navigate('/collaboration'),
            shortcut: 'Cmd+U',
            group: 'quick'
          },
          {
            id: 'ai-insights',
            label: 'AI Insights',
            icon: Zap,
            action: () => navigate('/ai-insights'),
            group: 'advanced'
          },
          {
            id: 'save-note',
            label: 'Save Learning Note',
            icon: BookOpen,
            action: () => navigate('/notes'),
            shortcut: 'Cmd+S',
            group: 'advanced'
          }
        ];

      default:
        return baseActions;
    }
  };

  const actions = getContextActions();
  const phases = ['capture', 'execute', 'engage'] as const;

  // Group actions by type
  const primaryActions = actions.filter(a => a.group === 'primary');
  const quickActions = actions.filter(a => a.group === 'quick');
  const advancedActions = actions.filter(a => a.group === 'advanced');

  const handleAction = (actionId: string, actionFn: () => void) => {
    actionFn();
    onAction?.(actionId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* Phase Navigation */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Switch Phase
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {phases.map((phase) => {
              const phaseInfo = getPhaseInfo(phase);
              const isCurrent = phase === state.currentPhase;
              return (
                <DropdownMenuItem
                  key={phase}
                  onClick={() => setCurrentPhase(phase)}
                  disabled={isCurrent}
                  className="flex items-center gap-2"
                >
                  <span>{phaseInfo.icon}</span>
                  <span>{phaseInfo.title}</span>
                  {isCurrent && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={advanceToNextPhase}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Next Phase
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Primary Actions */}
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action.id, action.action)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {action.shortcut}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}

        {quickActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {/* Quick Actions */}
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleAction(action.id, action.action)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                  {action.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {action.shortcut}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {advancedActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                More Options
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {advancedActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleAction(action.id, action.action)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings & Preferences
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};