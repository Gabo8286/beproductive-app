import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Sparkles,
  PlayCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Star,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

export interface SpotlightFeature {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  category: string;
  icon: React.ElementType;
  benefits: string[];
  usageStats?: {
    userCount?: number;
    averageTimeSpent?: number;
    satisfactionScore?: number;
    completionRate?: number;
  };
  demoUrl?: string;
  tutorialUrl?: string;
  isNew?: boolean;
  isPremium?: boolean;
  estimatedLearningTime?: number;
  relatedFeatures?: string[];
}

interface FeatureSpotlightProps {
  feature: SpotlightFeature;
  onClose?: () => void;
  onStartDemo?: (featureId: string) => void;
  onStartTutorial?: (featureId: string) => void;
  onExploreRelated?: (featureId: string) => void;
  showUsageStats?: boolean;
  position?: 'center' | 'top-right' | 'bottom-right';
}

const FEATURE_SPOTLIGHTS: Record<string, SpotlightFeature> = {
  'smart-scheduling': {
    id: 'smart-scheduling',
    title: 'Smart Scheduling',
    description: 'AI-powered time blocking that adapts to your productivity patterns',
    detailedDescription: 'Our intelligent scheduling system learns your peak productivity hours, energy levels, and task completion patterns to automatically suggest optimal time slots for different types of work.',
    category: 'productivity',
    icon: Zap,
    benefits: [
      'Automatic time blocking based on your energy levels',
      'Smart conflict detection and resolution',
      'Productivity pattern analysis and optimization',
      'Seamless calendar integration'
    ],
    usageStats: {
      userCount: 15420,
      averageTimeSpent: 25,
      satisfactionScore: 4.8,
      completionRate: 89
    },
    demoUrl: '/demo/smart-scheduling',
    tutorialUrl: '/tutorial/smart-scheduling',
    isNew: true,
    isPremium: true,
    estimatedLearningTime: 15,
    relatedFeatures: ['task-management', 'calendar-integration', 'analytics-dashboard']
  },
  'habit-streaks': {
    id: 'habit-streaks',
    title: 'Habit Streak Tracking',
    description: 'Gamified habit building with streak counters and achievement badges',
    detailedDescription: 'Build lasting habits through positive reinforcement with visual streak counters, achievement badges, and social sharing features that keep you motivated.',
    category: 'habits',
    icon: TrendingUp,
    benefits: [
      'Visual streak counters for motivation',
      'Achievement badges and milestones',
      'Social sharing and accountability',
      'Habit analytics and insights'
    ],
    usageStats: {
      userCount: 28650,
      averageTimeSpent: 8,
      satisfactionScore: 4.6,
      completionRate: 92
    },
    demoUrl: '/demo/habit-streaks',
    tutorialUrl: '/tutorial/habit-streaks',
    estimatedLearningTime: 10,
    relatedFeatures: ['habit-tracking', 'analytics-dashboard', 'social-features']
  },
  'team-collaboration': {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'Share goals, track progress, and collaborate with team members',
    detailedDescription: 'Work together more effectively with shared goal tracking, real-time progress updates, team dashboards, and collaborative planning features.',
    category: 'collaboration',
    icon: Users,
    benefits: [
      'Shared goal tracking and progress updates',
      'Real-time team dashboards',
      'Collaborative planning and brainstorming',
      'Team productivity analytics'
    ],
    usageStats: {
      userCount: 8940,
      averageTimeSpent: 45,
      satisfactionScore: 4.7,
      completionRate: 76
    },
    demoUrl: '/demo/team-collaboration',
    tutorialUrl: '/tutorial/team-collaboration',
    isPremium: true,
    estimatedLearningTime: 25,
    relatedFeatures: ['goal-setting', 'analytics-dashboard', 'notifications']
  }
};

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  feature,
  onClose,
  onStartDemo,
  onStartTutorial,
  onExploreRelated,
  showUsageStats = true,
  position = 'center'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const FeatureIcon = feature.icon;

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 max-w-sm';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 max-w-sm';
      case 'center':
      default:
        return 'fixed inset-0 flex items-center justify-center p-4 bg-black/50';
    }
  };

  const cardClasses = position === 'center'
    ? 'max-w-2xl w-full'
    : 'w-full';

  if (!isVisible) return null;

  return (
    <div className={`z-50 ${getPositionClasses()}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: position === 'center' ? 0 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: position === 'center' ? 0 : 20 }}
        className={cardClasses}
      >
        <Card className="shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          {/* Header */}
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 text-white rounded-lg">
                  <FeatureIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    {feature.isNew && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {feature.isPremium && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detailed Description */}
            {feature.detailedDescription && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {feature.detailedDescription}
                </p>
              </div>
            )}

            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Key Benefits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {feature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Stats */}
            {showUsageStats && feature.usageStats && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {feature.usageStats.userCount && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {formatNumber(feature.usageStats.userCount)}
                      </div>
                      <div className="text-xs text-gray-600">Active Users</div>
                    </div>
                  )}
                  {feature.usageStats.satisfactionScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {feature.usageStats.satisfactionScore}/5
                      </div>
                      <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                  )}
                  {feature.usageStats.averageTimeSpent && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {feature.usageStats.averageTimeSpent}m
                      </div>
                      <div className="text-xs text-gray-600">Avg. Session</div>
                    </div>
                  )}
                  {feature.usageStats.completionRate && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {feature.usageStats.completionRate}%
                      </div>
                      <div className="text-xs text-gray-600">Completion</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Learning Time */}
            {feature.estimatedLearningTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated learning time: {feature.estimatedLearningTime} minutes</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {feature.demoUrl && (
                <Button
                  onClick={() => onStartDemo?.(feature.id)}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Try Demo
                </Button>
              )}
              {feature.tutorialUrl && (
                <Button
                  variant="outline"
                  onClick={() => onStartTutorial?.(feature.id)}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Start Tutorial
                </Button>
              )}
              {feature.relatedFeatures && feature.relatedFeatures.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onExploreRelated?.(feature.id)}
                  className="flex items-center gap-2"
                >
                  Explore Related
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Related Features */}
            {feature.relatedFeatures && feature.relatedFeatures.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Related Features</h4>
                <div className="flex flex-wrap gap-2">
                  {feature.relatedFeatures.slice(0, 3).map((relatedId) => (
                    <Badge key={relatedId} variant="secondary" className="text-xs">
                      {relatedId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                  {feature.relatedFeatures.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{feature.relatedFeatures.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Hook for managing feature spotlights
export const useFeatureSpotlight = () => {
  const [currentSpotlight, setCurrentSpotlight] = useState<SpotlightFeature | null>(null);
  const [spotlightQueue, setSpotlightQueue] = useState<string[]>([]);

  const showSpotlight = (featureId: string) => {
    const feature = FEATURE_SPOTLIGHTS[featureId];
    if (feature) {
      setCurrentSpotlight(feature);
    }
  };

  const hideSpotlight = () => {
    setCurrentSpotlight(null);
  };

  const queueSpotlight = (featureId: string) => {
    setSpotlightQueue(prev => [...prev, featureId]);
  };

  const showNextInQueue = () => {
    if (spotlightQueue.length > 0) {
      const [next, ...rest] = spotlightQueue;
      setSpotlightQueue(rest);
      showSpotlight(next);
    }
  };

  const clearQueue = () => {
    setSpotlightQueue([]);
  };

  return {
    currentSpotlight,
    spotlightQueue,
    showSpotlight,
    hideSpotlight,
    queueSpotlight,
    showNextInQueue,
    clearQueue
  };
};

export { FEATURE_SPOTLIGHTS };