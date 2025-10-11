import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdaptiveInterface } from '@/hooks/useAdaptiveInterface';
import {
  Brain,
  Zap,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Coffee,
  Focus,
  Lightbulb
} from 'lucide-react';

interface ProductivityStateIndicatorProps {
  className?: string;
}

const getStateIcon = (state: string) => {
  switch (state) {
    case 'focused':
    case 'deep-work':
      return <Focus className="h-4 w-4" />;
    case 'energized':
      return <Zap className="h-4 w-4" />;
    case 'planning':
      return <Target className="h-4 w-4" />;
    case 'tired':
      return <Coffee className="h-4 w-4" />;
    case 'distracted':
      return <TrendingDown className="h-4 w-4" />;
    case 'overwhelmed':
      return <Brain className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'focused':
    case 'deep-work':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'energized':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'planning':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'tired':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'distracted':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'overwhelmed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getStateDescription = (state: string) => {
  switch (state) {
    case 'focused':
      return 'You\'re in a good flow state. Keep going!';
    case 'deep-work':
      return 'Perfect for complex, concentrated tasks';
    case 'energized':
      return 'Great time for challenging or creative work';
    case 'planning':
      return 'Ideal for organizing and strategizing';
    case 'tired':
      return 'Consider easy tasks or taking a break';
    case 'distracted':
      return 'Try minimizing distractions or taking a short break';
    case 'overwhelmed':
      return 'Focus on one simple task at a time';
    default:
      return 'Analyzing your productivity state...';
  }
};

export const ProductivityStateIndicator: React.FC<ProductivityStateIndicatorProps> = ({
  className = ''
}) => {
  const { productivityState, isAdapting, adaptiveUI } = useAdaptiveInterface();

  if (!productivityState) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">Productivity State</h3>
            <p className="text-sm text-muted-foreground">Analyzing...</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-muted/50 h-2 rounded-full animate-pulse" />
          <div className="bg-muted/30 h-4 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const stateIcon = getStateIcon(productivityState.currentState);
  const stateColor = getStateColor(productivityState.currentState);
  const stateDescription = getStateDescription(productivityState.currentState);

  return (
    <div className={`bg-card rounded-2xl p-6 border border-border/50 relative overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {isAdapting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-sm text-muted-foreground">Adapting interface...</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {stateIcon}
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">Productivity State</h3>
            <Badge className={`${stateColor} border-0 font-medium px-2 py-1 text-xs mt-1`}>
              {productivityState.currentState.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="text-sm font-medium">
            {Math.round(productivityState.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {stateDescription}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground mb-1">
            {Math.round(productivityState.energyLevel)}%
          </div>
          <div className="text-xs text-muted-foreground">Energy</div>
          <Progress
            value={productivityState.energyLevel}
            className="h-1 mt-1"
          />
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground mb-1">
            {Math.round(productivityState.focusLevel)}%
          </div>
          <div className="text-xs text-muted-foreground">Focus</div>
          <Progress
            value={productivityState.focusLevel}
            className="h-1 mt-1"
          />
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground mb-1">
            {Math.round(productivityState.workloadLevel)}%
          </div>
          <div className="text-xs text-muted-foreground">Workload</div>
          <Progress
            value={productivityState.workloadLevel}
            className="h-1 mt-1"
          />
        </div>
      </div>

      {/* Suggested Actions */}
      {productivityState.suggestedActions.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-card-foreground mb-2">
            Suggested Actions
          </h4>
          <div className="space-y-1">
            {productivityState.suggestedActions.slice(0, 2).map((action, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
      </div>
    </div>
  );
};