import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  X,
  Calendar,
  Target,
  TrendingUp,
  Heart,
  Zap,
} from 'lucide-react';
import { useLunaFramework, useFrameworkInsights } from '../context/LunaFrameworkContext';
import { useLuna } from '../context/LunaContext';
import { RECOVERY_LEVELS } from '../framework/LunaFrameworkDocumentation';

interface ProactiveGuidanceProps {
  className?: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'suggestion':
      return Lightbulb;
    case 'warning':
      return AlertTriangle;
    case 'celebration':
      return CheckCircle;
    case 'guidance':
      return Brain;
    default:
      return Brain;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'suggestion':
      return 'text-blue-600 bg-blue-50';
    case 'warning':
      return 'text-orange-600 bg-orange-50';
    case 'celebration':
      return 'text-green-600 bg-green-50';
    case 'guidance':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const LunaProactiveGuidance: React.FC<ProactiveGuidanceProps> = ({ className }) => {
  const { productivityProfile, isProactiveMode, checkForProactiveGuidance } = useLunaFramework();
  const { activeInsights, dismissInsight } = useFrameworkInsights();
  const { openChat, sendMessage } = useLuna();
  const [isExpanded, setIsExpanded] = useState(false);

  // Automatically check for guidance periodically
  useEffect(() => {
    if (isProactiveMode) {
      const interval = setInterval(() => {
        checkForProactiveGuidance();
      }, 15 * 60 * 1000); // Check every 15 minutes

      return () => clearInterval(interval);
    }
  }, [isProactiveMode, checkForProactiveGuidance]);

  // Show wellness check if score is low
  const needsWellnessCheck = productivityProfile.wellBeingScore < 6;
  const needsSystemHealth = productivityProfile.systemHealthScore < 5;

  const handleInsightAction = (insight: any, actionIndex: number) => {
    if (insight.actionItems && insight.actionItems[actionIndex]) {
      const action = insight.actionItems[actionIndex];

      // Open chat and send the action as a message
      openChat();
      sendMessage(`Help me with: ${action}`);

      // Dismiss the insight after taking action
      dismissInsight(insight.id);
    }
  };

  const handleRecoveryStart = (level: number) => {
    const recoveryLevel = RECOVERY_LEVELS.find(r => r.level === level);
    if (recoveryLevel) {
      openChat();
      sendMessage(recoveryLevel.lunaCommand);
    }
  };

  const handleQuickCheck = () => {
    openChat();
    sendMessage("How am I doing? Give me a quick productivity and well-being assessment.");
  };

  const handleGoalReview = () => {
    openChat();
    sendMessage("Let's review my goals and make sure I'm on track.");
  };

  if (!isProactiveMode || (!activeInsights.length && !needsWellnessCheck && !needsSystemHealth)) {
    return null;
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            Luna's Guidance
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Health Check */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-xs">Well-being: {productivityProfile.wellBeingScore}/10</span>
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-xs">System: {productivityProfile.systemHealthScore}/10</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleQuickCheck} className="text-xs py-1 px-2">
            Quick Check
          </Button>
        </div>

        {/* Emergency Recovery Options */}
        {(needsWellnessCheck || needsSystemHealth) && (
          <Alert className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {needsWellnessCheck && (
                <div className="mb-2">
                  <span className="font-medium">Low well-being detected.</span>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryStart(1)}
                      className="text-xs py-1 px-2"
                    >
                      Quick Brain Dump
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryStart(3)}
                      className="text-xs py-1 px-2"
                    >
                      Reorganize Tasks
                    </Button>
                  </div>
                </div>
              )}
              {needsSystemHealth && (
                <div>
                  <span className="font-medium">System needs attention.</span>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryStart(2)}
                      className="text-xs py-1 px-2"
                    >
                      Process Inbox
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryStart(4)}
                      className="text-xs py-1 px-2"
                    >
                      Review Projects
                    </Button>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Active Insights */}
        {activeInsights.length > 0 && (
          <div className="space-y-2">
            {activeInsights.slice(0, isExpanded ? 5 : 2).map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              const colorClasses = getInsightColor(insight.type);

              return (
                <div key={insight.id} className={`p-3 rounded-lg border ${colorClasses}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge className={getPriorityBadgeColor(insight.priority)} variant="secondary">
                        {insight.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissInsight(insight.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-700 mb-2">{insight.description}</p>

                  {insight.actionItems && insight.actionItems.length > 0 && (
                    <div className="space-y-1">
                      {insight.actionItems.slice(0, isExpanded ? 3 : 2).map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsightAction(insight, index)}
                          className="text-xs py-1 px-2 w-full justify-start"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{insight.principle.replace('principle-', 'Principle ')}</span>
                    <span>{new Date(insight.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}

            {activeInsights.length > 2 && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full text-xs"
              >
                Show {activeInsights.length - 2} more insights
              </Button>
            )}
          </div>
        )}

        {/* Stage Progress */}
        <div className="bg-blue-50 p-2 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-800">
              {productivityProfile.currentStage.charAt(0).toUpperCase() + productivityProfile.currentStage.slice(1)} Stage
            </span>
            <Badge variant="outline" className="text-xs">
              Week {productivityProfile.weekInStage}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-600">
              {productivityProfile.completedPrinciples.length}/5 principles mastered
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoalReview}
              className="text-xs py-1 px-2"
            >
              <Target className="h-3 w-3 mr-1" />
              Review Goals
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              openChat();
              sendMessage("What should I work on next based on my current context and energy?");
            }}
            className="text-xs py-1"
          >
            <Clock className="h-3 w-3 mr-1" />
            What's Next?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              openChat();
              sendMessage("Let's do my weekly review");
            }}
            className="text-xs py-1"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Weekly Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LunaProactiveGuidance;