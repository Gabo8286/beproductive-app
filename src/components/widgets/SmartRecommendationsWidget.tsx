import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Lightbulb,
  CheckCircle,
  X,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'productivity' | 'wellness' | 'learning' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  timeToImplement: number; // in minutes
  potentialImpact: string;
  reasoning: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SmartRecommendationsWidget: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock recommendations with rotation
    const mockRecommendations: SmartRecommendation[] = [
      {
        id: 'rec_1',
        title: 'Schedule deep work block',
        description: 'Block 2 hours for focused work during your peak productivity time (9-11 AM)',
        type: 'productivity',
        priority: 'high',
        confidence: 0.89,
        timeToImplement: 2,
        potentialImpact: '+25% productivity',
        reasoning: 'Analysis shows you complete 73% more tasks during morning hours',
        icon: Target
      },
      {
        id: 'rec_2',
        title: 'Take a 15-minute break',
        description: 'You\'ve been working for 90 minutes. A short break will boost your focus.',
        type: 'wellness',
        priority: 'medium',
        confidence: 0.92,
        timeToImplement: 15,
        potentialImpact: '+15% focus',
        reasoning: 'Regular breaks improve sustained attention and prevent burnout',
        icon: Clock
      },
      {
        id: 'rec_3',
        title: 'Review weekly goals',
        description: 'Spend 10 minutes reviewing and adjusting your weekly objectives',
        type: 'optimization',
        priority: 'medium',
        confidence: 0.76,
        timeToImplement: 10,
        potentialImpact: '+18% goal completion',
        reasoning: 'Weekly reviews correlate with 40% higher goal achievement rates',
        icon: Calendar
      },
      {
        id: 'rec_4',
        title: 'Learn time estimation',
        description: 'Practice breaking down tasks into smaller, more estimatable chunks',
        type: 'learning',
        priority: 'low',
        confidence: 0.84,
        timeToImplement: 20,
        potentialImpact: '+30% accuracy',
        reasoning: 'Your estimation accuracy could improve by practicing decomposition techniques',
        icon: TrendingUp
      }
    ];

    setRecommendations(mockRecommendations);
    setIsLoading(false);

    // Auto-rotate recommendations every 10 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockRecommendations.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentRec = recommendations[currentIndex];

  const handleImplement = (recId: string) => {
    console.log('Implementing recommendation:', recId);
    // Here you would implement the recommendation logic
    setRecommendations(prev => prev.filter(r => r.id !== recId));
    if (currentIndex >= recommendations.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleDismiss = (recId: string) => {
    console.log('Dismissing recommendation:', recId);
    setRecommendations(prev => prev.filter(r => r.id !== recId));
    if (currentIndex >= recommendations.length - 1) {
      setCurrentIndex(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity': return Target;
      case 'wellness': return Clock;
      case 'learning': return Lightbulb;
      case 'optimization': return TrendingUp;
      default: return Sparkles;
    }
  };

  if (isLoading || recommendations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          {isLoading ? (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Analyzing your patterns...</p>
            </div>
          ) : (
            <div className="text-center">
              <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recommendations available</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">AI Recommendations</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1}/{recommendations.length}
          </Badge>
          <Link to="/ai-insights">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {currentRec && (
            <motion.div
              key={currentRec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Recommendation Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <currentRec.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{currentRec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentRec.description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getPriorityColor(currentRec.priority)}`}
                >
                  {currentRec.priority}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-medium">{Math.round(currentRec.confidence * 100)}%</div>
                  <div className="text-muted-foreground">Confidence</div>
                </div>
                <div>
                  <div className="font-medium">{currentRec.timeToImplement}m</div>
                  <div className="text-muted-foreground">Time</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{currentRec.potentialImpact}</div>
                  <div className="text-muted-foreground">Impact</div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {currentRec.reasoning}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleImplement(currentRec.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Implement
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismiss(currentRec.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center space-x-1">
                {recommendations.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};