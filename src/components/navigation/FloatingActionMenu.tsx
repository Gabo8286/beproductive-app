import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Target,
  CheckSquare,
  Clock,
  BookOpen,
  Settings,
  Zap,
  Calendar,
  FileText,
  Timer,
  Coffee,
  Lightbulb,
  Repeat,
  X
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/z-index';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  description: string;
}

interface FloatingActionMenuProps {
  className?: string;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useProductivityCycle();
  const navigate = useNavigate();

  // Get phase-specific actions
  const getPhaseActions = (): FloatingAction[] => {
    switch (state.currentPhase) {
      case 'capture':
        return [
          {
            id: 'new-goal',
            label: 'New Goal',
            icon: Target,
            action: () => {
              navigate('/goals/new');
              setIsOpen(false);
            },
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Create a new goal to work towards'
          },
          {
            id: 'quick-task',
            label: 'Quick Task',
            icon: CheckSquare,
            action: () => {
              navigate('/quick-todos');
              setIsOpen(false);
            },
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Add a task to your plan'
          },
          {
            id: 'template',
            label: 'From Template',
            icon: FileText,
            action: () => {
              navigate('/templates');
              setIsOpen(false);
            },
            color: 'bg-purple-500 hover:bg-purple-600',
            description: 'Use a saved template'
          },
          {
            id: 'schedule',
            label: 'Schedule Time',
            icon: Calendar,
            action: () => {
              navigate('/tasks?view=calendar');
              setIsOpen(false);
            },
            color: 'bg-orange-500 hover:bg-orange-600',
            description: 'Block time for focused work'
          }
        ];

      case 'execute':
        return [
          {
            id: 'start-timer',
            label: 'Start Timer',
            icon: Timer,
            action: () => {
              // Trigger timer start
              setIsOpen(false);
            },
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Begin a focus session'
          },
          {
            id: 'quick-task',
            label: 'Mark Done',
            icon: CheckSquare,
            action: () => {
              navigate('/tasks');
              setIsOpen(false);
            },
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Complete a task quickly'
          },
          {
            id: 'take-break',
            label: 'Take Break',
            icon: Coffee,
            action: () => {
              // Trigger break mode
              setIsOpen(false);
            },
            color: 'bg-orange-500 hover:bg-orange-600',
            description: 'Start a scheduled break'
          },
          {
            id: 'capture-note',
            label: 'Quick Note',
            icon: BookOpen,
            action: () => {
              navigate('/notes');
              setIsOpen(false);
            },
            color: 'bg-purple-500 hover:bg-purple-600',
            description: 'Capture a quick thought'
          }
        ];

      case 'engage':
        return [
          {
            id: 'add-reflection',
            label: 'Add Insight',
            icon: Lightbulb,
            action: () => {
              navigate('/reflections');
              setIsOpen(false);
            },
            color: 'bg-yellow-500 hover:bg-yellow-600',
            description: 'Record a learning or insight'
          },
          {
            id: 'view-analytics',
            label: 'View Stats',
            icon: BookOpen,
            action: () => {
              navigate('/analytics');
              setIsOpen(false);
            },
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Check your progress data'
          },
          {
            id: 'capture-note',
            label: 'Save Note',
            icon: FileText,
            action: () => {
              navigate('/notes');
              setIsOpen(false);
            },
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Save important information'
          }
        ];

      default:
        return [];
    }
  };

  const actions = getPhaseActions();

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        'fixed',
        // Position offset from main Apple FAB to avoid overlap
        'bottom-6 right-40 md:bottom-6 md:right-40',
        className
      )}
      style={{ zIndex: Z_INDEX.FLOATING_BUTTON - 2 }}
    >
      {/* Action Buttons */}
      <div
        className={cn(
          'flex flex-col items-end gap-3 mb-4 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-3 transition-all duration-200',
                isOpen ? '' : 'translate-y-4'
              )}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              {/* Action Label */}
              <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border text-sm font-medium whitespace-nowrap">
                <div className="text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>

              {/* Action Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
                size="lg"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110',
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110',
          'bg-gradient-to-r from-primary to-blue-600 text-white',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.BACKDROP - 1 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};