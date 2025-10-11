import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdaptiveInterface } from '@/hooks/useAdaptiveInterface';
import { useClientAnalytics } from '@/utils/clientAnalytics';
import {
  TrendingUp,
  Target,
  Clock,
  Lightbulb,
  Calendar,
  BarChart3,
  ChevronRight,
  Star,
  Zap,
  Coffee,
  Brain,
  CheckCircle
} from 'lucide-react';

interface AdaptiveInsightsPanelProps {
  className?: string;
}

interface ContextualInsight {
  id: string;
  type: 'tip' | 'achievement' | 'recommendation' | 'pattern';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  icon: React.ReactNode;
  priority: number;
  relevanceScore: number;
}

export const AdaptiveInsightsPanel: React.FC<AdaptiveInsightsPanelProps> = ({
  className = ''
}) => {
  const { productivityState, adaptiveUI, shouldShowWidget } = useAdaptiveInterface();
  const { getRecentInsights, getTodayStats, generateInsight } = useClientAnalytics();

  const [insights, setInsights] = useState<ContextualInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate contextual insights based on productivity state
  useEffect(() => {
    const generateContextualInsights = async () => {
      if (!productivityState) return;

      setIsLoading(true);

      try {
        const recentInsights = await getRecentInsights(3);
        const todayStats = await getTodayStats();
        const contextualInsights: ContextualInsight[] = [];

        // Add state-specific insights
        const stateInsights = getStateSpecificInsights(productivityState.currentState, todayStats);
        contextualInsights.push(...stateInsights);

        // Add recent analytical insights
        recentInsights.forEach(insight => {
          if ((insight.type === 'focus' || insight.type === 'energy') && productivityState.focusLevel < 60) {
            contextualInsights.push({
              id: `insight-${insight.id}`,
              type: 'tip',
              title: insight.title,
              description: insight.description,
              action: insight.actionable ? 'Learn more' : undefined,
              icon: <Lightbulb className="h-4 w-4" />,
              priority: insight.importance === 'high' ? 3 : insight.importance === 'medium' ? 2 : 1,
              relevanceScore: insight.confidence
            });
          }
        });

        // Add time-based insights
        const timeInsights = getTimeBasedInsights(productivityState.timeOfDay, todayStats);
        contextualInsights.push(...timeInsights);

        // Sort by relevance and priority
        const sortedInsights = contextualInsights
          .sort((a, b) => (b.priority * b.relevanceScore) - (a.priority * a.relevanceScore))
          .slice(0, 3);

        setInsights(sortedInsights);
      } catch (error) {
        console.warn('Failed to generate contextual insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateContextualInsights();
  }, [productivityState, getRecentInsights, getTodayStats]);

  const getStateSpecificInsights = (state: string, todayStats: any): ContextualInsight[] => {
    const insights: ContextualInsight[] = [];

    switch (state) {
      case 'focused':
      case 'deep-work':
        insights.push({
          id: 'focus-boost',
          type: 'tip',
          title: 'You\'re in the zone!',
          description: 'Consider tackling your most challenging task while you\'re focused.',
          action: 'View difficult tasks',
          actionUrl: '/tasks?filter=high-effort',
          icon: <Target className="h-4 w-4" />,
          priority: 3,
          relevanceScore: 0.9
        });
        break;

      case 'distracted':
        insights.push({
          id: 'distraction-help',
          type: 'recommendation',
          title: 'Need to refocus?',
          description: 'Try a 5-minute breathing exercise or switch to a simpler task.',
          action: 'Start breathing exercise',
          icon: <Brain className="h-4 w-4" />,
          priority: 3,
          relevanceScore: 0.8
        });
        break;

      case 'tired':
        insights.push({
          id: 'energy-boost',
          type: 'tip',
          title: 'Low energy detected',
          description: 'Perfect time for admin tasks or consider taking a short break.',
          action: 'View easy tasks',
          actionUrl: '/tasks?filter=low-effort',
          icon: <Coffee className="h-4 w-4" />,
          priority: 2,
          relevanceScore: 0.8
        });
        break;

      case 'energized':
        insights.push({
          id: 'high-energy',
          type: 'recommendation',
          title: 'High energy time!',
          description: 'Great opportunity for creative work or starting new projects.',
          action: 'View creative tasks',
          actionUrl: '/tasks?category=creative',
          icon: <Zap className="h-4 w-4" />,
          priority: 3,
          relevanceScore: 0.9
        });
        break;

      case 'planning':
        insights.push({
          id: 'planning-mode',
          type: 'tip',
          title: 'Planning mindset active',
          description: 'Use this time to organize your week or set new goals.',
          action: 'Open calendar',
          actionUrl: '/calendar',
          icon: <Calendar className="h-4 w-4" />,
          priority: 2,
          relevanceScore: 0.8
        });
        break;

      case 'overwhelmed':
        insights.push({
          id: 'overwhelm-help',
          type: 'recommendation',
          title: 'Feeling overwhelmed?',
          description: 'Break down tasks into smaller steps or focus on just one priority.',
          action: 'View priority tasks',
          actionUrl: '/tasks?filter=priority',
          icon: <CheckCircle className="h-4 w-4" />,
          priority: 3,
          relevanceScore: 0.9
        });
        break;
    }

    return insights;
  };

  const getTimeBasedInsights = (timeOfDay: string, todayStats: any): ContextualInsight[] => {
    const insights: ContextualInsight[] = [];

    if (timeOfDay === 'morning' && todayStats?.tasksCompleted === 0) {
      insights.push({
        id: 'morning-start',
        type: 'tip',
        title: 'Start strong!',
        description: 'Completing your first task sets a positive tone for the day.',
        action: 'View today\'s tasks',
        actionUrl: '/tasks?filter=today',
        icon: <TrendingUp className="h-4 w-4" />,
        priority: 2,
        relevanceScore: 0.7
      });
    }

    if (timeOfDay === 'afternoon' && todayStats?.breaksTaken === 0) {
      insights.push({
        id: 'afternoon-break',
        type: 'recommendation',
        title: 'Break time?',
        description: 'You haven\'t taken a break today. A short pause can boost afternoon productivity.',
        action: 'Schedule break',
        icon: <Clock className="h-4 w-4" />,
        priority: 2,
        relevanceScore: 0.6
      });
    }

    return insights;
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Star className="h-4 w-4" />;
      case 'pattern':
        return <BarChart3 className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'pattern':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'recommendation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    }
  };

  // Hide widget if adaptive UI suggests it
  if (!shouldShowWidget('insights-panel')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-card-foreground">Smart Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted/50 h-4 rounded animate-pulse" />
                <div className="bg-muted/30 h-3 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-card-foreground">Smart Insights</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No insights available right now. Keep working and we'll learn your patterns!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium text-card-foreground">Smart Insights</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {adaptiveUI.layout === 'focused' ? 'Focus Mode' : 'Active'}
        </Badge>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start space-x-3 p-3 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
          >
            <div className="p-1.5 bg-muted rounded-md flex-shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-card-foreground">
                  {insight.title}
                </h4>
                <Badge
                  variant="secondary"
                  className={`${getInsightTypeColor(insight.type)} text-xs px-2 py-0.5`}
                >
                  {insight.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {insight.description}
              </p>
              {insight.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                  onClick={() => {
                    if (insight.actionUrl) {
                      // In a real app, this would use router navigation
                      console.log('Navigate to:', insight.actionUrl);
                    }
                  }}
                >
                  {insight.action}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Powered by local AI</span>
          <span>Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};