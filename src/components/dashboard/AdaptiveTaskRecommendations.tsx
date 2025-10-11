import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdaptiveInterface } from '@/hooks/useAdaptiveInterface';
import {
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Coffee,
  Lightbulb,
  ArrowRight,
  Plus,
  TrendingUp,
  Star
} from 'lucide-react';

interface TaskRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  energyRequired: 'low' | 'medium' | 'high';
  focusRequired: 'low' | 'medium' | 'high';
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  matchReason: string;
  confidence: number;
}

interface AdaptiveTaskRecommendationsProps {
  className?: string;
}

export const AdaptiveTaskRecommendations: React.FC<AdaptiveTaskRecommendationsProps> = ({
  className = ''
}) => {
  const { productivityState, adaptiveUI, shouldShowWidget, getWidgetPriority } = useAdaptiveInterface();
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate task recommendations based on productivity state
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!productivityState) return;

      setIsLoading(true);

      try {
        // In a real app, this would fetch from your task database and apply AI filtering
        const mockTasks: TaskRecommendation[] = [
          {
            id: 'task-1',
            title: 'Review weekly goals',
            description: 'Quick check on progress and adjust priorities',
            estimatedDuration: 15,
            energyRequired: 'low',
            focusRequired: 'medium',
            category: 'Planning',
            priority: 'medium',
            tags: ['review', 'goals', 'planning'],
            matchReason: 'Good for current state',
            confidence: 0.8
          },
          {
            id: 'task-2',
            title: 'Write project proposal',
            description: 'Draft the technical requirements for the new feature',
            estimatedDuration: 45,
            energyRequired: 'high',
            focusRequired: 'high',
            category: 'Creative',
            priority: 'high',
            tags: ['writing', 'creative', 'important'],
            matchReason: 'Requires deep focus',
            confidence: 0.9
          },
          {
            id: 'task-3',
            title: 'Organize desktop files',
            description: 'Clean up downloads folder and organize documents',
            estimatedDuration: 20,
            energyRequired: 'low',
            focusRequired: 'low',
            category: 'Admin',
            priority: 'low',
            tags: ['organization', 'maintenance', 'simple'],
            matchReason: 'Low energy task',
            confidence: 0.7
          },
          {
            id: 'task-4',
            title: 'Brainstorm marketing ideas',
            description: 'Generate creative concepts for the upcoming campaign',
            estimatedDuration: 30,
            energyRequired: 'high',
            focusRequired: 'medium',
            category: 'Creative',
            priority: 'medium',
            tags: ['brainstorm', 'creative', 'marketing'],
            matchReason: 'Great for high energy',
            confidence: 0.8
          },
          {
            id: 'task-5',
            title: 'Email responses',
            description: 'Reply to pending emails and clear inbox',
            estimatedDuration: 25,
            energyRequired: 'low',
            focusRequired: 'low',
            category: 'Communication',
            priority: 'medium',
            tags: ['email', 'communication', 'routine'],
            matchReason: 'Good filler task',
            confidence: 0.6
          },
          {
            id: 'task-6',
            title: 'Research competitive analysis',
            description: 'Deep dive into competitor features and strategies',
            estimatedDuration: 60,
            energyRequired: 'medium',
            focusRequired: 'high',
            category: 'Research',
            priority: 'high',
            tags: ['research', 'analysis', 'strategic'],
            matchReason: 'Requires sustained focus',
            confidence: 0.9
          }
        ];

        const filteredRecommendations = filterTasksByProductivityState(
          mockTasks,
          productivityState
        );

        setRecommendations(filteredRecommendations);
      } catch (error) {
        console.warn('Failed to generate task recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, [productivityState]);

  const filterTasksByProductivityState = (
    tasks: TaskRecommendation[],
    state: any
  ): TaskRecommendation[] => {
    const { currentState, energyLevel, focusLevel, workloadLevel } = state;

    const energyThreshold = energyLevel > 70 ? 'high' : energyLevel > 40 ? 'medium' : 'low';
    const focusThreshold = focusLevel > 70 ? 'high' : focusLevel > 40 ? 'medium' : 'low';

    return tasks
      .filter(task => {
        // Filter by energy requirements
        if (energyThreshold === 'low' && task.energyRequired === 'high') return false;
        if (energyThreshold === 'medium' && task.energyRequired === 'high' && currentState === 'tired') return false;

        // Filter by focus requirements
        if (focusThreshold === 'low' && task.focusRequired === 'high') return false;
        if (currentState === 'distracted' && task.focusRequired !== 'low') return false;

        // State-specific filtering
        switch (currentState) {
          case 'focused':
          case 'deep-work':
            return task.focusRequired === 'high' || task.priority === 'high';
          case 'energized':
            return task.energyRequired === 'high' || task.category === 'Creative';
          case 'tired':
            return task.energyRequired === 'low' && task.estimatedDuration <= 30;
          case 'overwhelmed':
            return task.priority !== 'low' && task.estimatedDuration <= 20;
          case 'planning':
            return task.category === 'Planning' || task.tags.includes('goals');
          case 'distracted':
            return task.focusRequired === 'low' && task.estimatedDuration <= 25;
          default:
            return true;
        }
      })
      .map(task => ({
        ...task,
        matchReason: getMatchReason(task, currentState, energyLevel, focusLevel),
        confidence: calculateConfidence(task, state)
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  const getMatchReason = (
    task: TaskRecommendation,
    state: string,
    energy: number,
    focus: number
  ): string => {
    if (state === 'focused' && task.focusRequired === 'high') {
      return 'Perfect for your current focus level';
    }
    if (state === 'energized' && task.energyRequired === 'high') {
      return 'Great match for your high energy';
    }
    if (state === 'tired' && task.energyRequired === 'low') {
      return 'Light task for your current energy';
    }
    if (state === 'planning' && task.category === 'Planning') {
      return 'Aligns with your planning mindset';
    }
    if (state === 'distracted' && task.focusRequired === 'low') {
      return 'Easy task while you refocus';
    }
    return 'Good fit for current state';
  };

  const calculateConfidence = (task: TaskRecommendation, state: any): number => {
    let confidence = 0.5;

    // Boost confidence based on state alignment
    if (state.currentState === 'focused' && task.focusRequired === 'high') confidence += 0.3;
    if (state.currentState === 'energized' && task.energyRequired === 'high') confidence += 0.3;
    if (state.currentState === 'tired' && task.energyRequired === 'low') confidence += 0.4;

    // Boost for priority alignment
    if (task.priority === 'high' && state.focusLevel > 60) confidence += 0.2;

    // Boost for duration alignment
    if (state.currentState === 'overwhelmed' && task.estimatedDuration <= 20) confidence += 0.2;

    return Math.min(confidence, 1.0);
  };

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'high': return <Zap className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      default: return <Coffee className="h-3 w-3" />;
    }
  };

  const getFocusIcon = (level: string) => {
    switch (level) {
      case 'high': return <Brain className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  // Hide widget if adaptive UI suggests it
  if (!shouldShowWidget('task-recommendations')) {
    return null;
  }

  const widgetPriority = getWidgetPriority('task-recommendations');

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-card-foreground">Recommended Tasks</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-muted/50 h-4 rounded animate-pulse w-1/2" />
                <div className="bg-muted/30 h-3 rounded animate-pulse w-16" />
              </div>
              <div className="bg-muted/30 h-3 rounded animate-pulse mb-2" />
              <div className="flex items-center space-x-2">
                <div className="bg-muted/30 h-5 rounded animate-pulse w-12" />
                <div className="bg-muted/30 h-5 rounded animate-pulse w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}
      style={{
        opacity: widgetPriority >= 1 ? 1 : 0.7,
        transform: widgetPriority >= 1.5 ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium text-card-foreground">Recommended Tasks</h3>
        </div>
        <div className="flex items-center space-x-2">
          {widgetPriority > 1 && (
            <Star className="h-3 w-3 text-yellow-500" />
          )}
          <Badge variant="secondary" className="text-xs">
            {productivityState?.currentState.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="text-center py-6">
          <div className="p-3 bg-muted/50 rounded-lg w-fit mx-auto mb-3">
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No matching tasks found for your current state
          </p>
          <Button size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-sm"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-card-foreground text-sm leading-tight">
                  {task.title}
                </h4>
                <Badge
                  variant="secondary"
                  className={`${getPriorityColor(task.priority)} text-xs ml-2 flex-shrink-0`}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Task Description */}
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {task.description}
              </p>

              {/* Task Metadata */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedDuration}m</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getEnergyIcon(task.energyRequired)}
                    <span className="capitalize">{task.energyRequired}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getFocusIcon(task.focusRequired)}
                    <span className="capitalize">{task.focusRequired}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(task.confidence * 100)}% match
                </div>
              </div>

              {/* Match Reason */}
              <div className="bg-muted/30 rounded-md p-2 mb-3">
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {task.matchReason}
                </p>
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs h-7"
                onClick={() => {
                  // In a real app, this would start the task or navigate to task details
                  console.log('Starting task:', task.id);
                }}
              >
                Start Task
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>AI-powered recommendations</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            View all tasks
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};