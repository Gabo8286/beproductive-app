import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { useProductivityCycle } from '../hooks/useProductivityCycle';
import { getPhaseInfo, ProductivityPhase } from '../types/cycle';
import { cn } from '@/lib/utils';

interface CycleNavigationProps {
  className?: string;
  showProgress?: boolean;
  showAdvanceButton?: boolean;
  compact?: boolean;
}

export const CycleNavigation: React.FC<CycleNavigationProps> = ({
  className,
  showProgress = true,
  showAdvanceButton = true,
  compact = false,
}) => {
  const { state, setCurrentPhase, advanceToNextPhase, getCycleProgress } = useProductivityCycle();
  const cycleProgress = getCycleProgress();

  const phases: ProductivityPhase[] = ['capture', 'execute', 'engage'];

  const getPhaseStatus = (phase: ProductivityPhase) => {
    if (phase === state.currentPhase) {
      return 'current';
    }

    const phaseIndex = phases.indexOf(phase);
    const currentIndex = phases.indexOf(state.currentPhase);

    if (phaseIndex < currentIndex) {
      return 'completed';
    }

    return 'upcoming';
  };

  const getPhaseStatusClass = (phase: ProductivityPhase) => {
    const status = getPhaseStatus(phase);
    switch (status) {
      case 'current':
        return 'bg-primary text-primary-foreground border-primary';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300';
      case 'upcoming':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const currentPhaseInfo = getPhaseInfo(state.currentPhase);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{currentPhaseInfo.icon}</div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {currentPhaseInfo.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentPhaseInfo.description}
            </p>
          </div>
        </div>

        {showAdvanceButton && cycleProgress.canAdvance && cycleProgress.nextPhase && (
          <Button
            onClick={advanceToNextPhase}
            className="flex items-center space-x-2"
            size="sm"
          >
            <span>Next: {getPhaseInfo(cycleProgress.nextPhase).title}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Phase Progress</span>
            <span className="text-sm font-medium">{Math.round(state.phaseProgress)}%</span>
          </div>
          <Progress value={state.phaseProgress} className="h-2" />
        </div>
      )}

      {/* Phase Navigation Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {phases.map((phase, index) => {
          const phaseInfo = getPhaseInfo(phase);
          const status = getPhaseStatus(phase);
          const isClickable = status === 'completed' || phase === state.currentPhase;

          return (
            <div key={phase} className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => isClickable && setCurrentPhase(phase)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200',
                  getPhaseStatusClass(phase),
                  isClickable ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-60'
                )}
              >
                <span className="text-sm">{phaseInfo.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {phaseInfo.title}
                </span>
                {status === 'completed' && (
                  <CheckCircle className="h-4 w-4" />
                )}
              </button>

              {index < phases.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase Stats - Hidden in compact mode */}
      {!compact && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Daily Goals</div>
            <div className="text-lg font-semibold">{state.dailyGoals.length}</div>
          </div>

          <div className="bg-card rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Capture Done</div>
            <div className="flex items-center space-x-1">
              {state.captureCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {state.captureCompleted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Engagement</div>
            <div className="flex items-center space-x-1">
              {state.engageCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {state.engageCompleted ? 'Done' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};