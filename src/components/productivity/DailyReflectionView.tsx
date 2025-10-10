import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  Heart,
  Zap,
  MessageCircle,
  BookOpen,
  Star
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { cn } from '@/lib/utils';

interface ReflectionMetrics {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  timeSpent: number;
  energyLevel: number;
  focusQuality: number;
}

interface ReflectionQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'choice';
  icon: React.ComponentType<any>;
  category: 'achievement' | 'learning' | 'wellbeing' | 'improvement';
  choices?: string[];
}

export const DailyReflectionView: React.FC = () => {
  const { state, addReflection, advanceToNextPhase, updatePhaseProgress } = useProductivityCycle();
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState<'overview' | 'questions' | 'insights'>('overview');

  // Mock metrics - in real app, this would come from actual task data
  const metrics: ReflectionMetrics = {
    completedTasks: 8,
    totalTasks: 12,
    completionRate: 67,
    timeSpent: 6.5,
    energyLevel: 7,
    focusQuality: 8,
  };

  const reflectionQuestions: ReflectionQuestion[] = [
    {
      id: 'biggest_win',
      question: 'What was your biggest win today?',
      type: 'text',
      icon: Award,
      category: 'achievement',
    },
    {
      id: 'challenge_faced',
      question: 'What challenge did you face and how did you handle it?',
      type: 'text',
      icon: Target,
      category: 'learning',
    },
    {
      id: 'energy_level',
      question: 'How would you rate your overall energy today?',
      type: 'rating',
      icon: Zap,
      category: 'wellbeing',
    },
    {
      id: 'focus_quality',
      question: 'How was your focus and concentration?',
      type: 'rating',
      icon: Target,
      category: 'wellbeing',
    },
    {
      id: 'time_management',
      question: 'How well did you manage your time today?',
      type: 'choice',
      icon: Clock,
      category: 'improvement',
      choices: ['Poor - constant distractions', 'Fair - some focus periods', 'Good - mostly on track', 'Excellent - fully focused'],
    },
    {
      id: 'key_learning',
      question: 'What is one key thing you learned today?',
      type: 'text',
      icon: Lightbulb,
      category: 'learning',
    },
    {
      id: 'gratitude',
      question: 'What are you grateful for today?',
      type: 'text',
      icon: Heart,
      category: 'wellbeing',
    },
    {
      id: 'tomorrow_focus',
      question: 'What should be your main focus tomorrow?',
      type: 'text',
      icon: TrendingUp,
      category: 'improvement',
    },
  ];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleCompleteReflection = () => {
    const reflection: any = {
      id: `reflection-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completedTasks: metrics.completedTasks,
      plannedTasks: metrics.totalTasks,
      timeAccuracy: 85, // Default value
      energyLevel: 'medium' as const,
      whatWentWell: reflectionAnswers['went-well'] || '',
      whatCouldImprove: reflectionAnswers['improve'] || '',
      insights: reflectionAnswers['key-learning'] || '',
      tomorrowPriorities: [],
      created_at: new Date().toISOString(),
    };

    addReflection(reflection);
    updatePhaseProgress(100);
    advanceToNextPhase();
  };

  const getCompletionScore = () => {
    const answeredQuestions = Object.keys(reflectionAnswers).length;
    const totalQuestions = reflectionQuestions.length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const renderRatingInput = (questionId: string, currentValue?: string) => (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <button
          key={rating}
          onClick={() => handleAnswerChange(questionId, rating.toString())}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all',
            currentValue === rating.toString()
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-gray-300 hover:border-primary text-gray-600 hover:text-primary'
          )}
        >
          {rating}
        </button>
      ))}
    </div>
  );

  const renderChoiceInput = (questionId: string, choices: string[], currentValue?: string) => (
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => handleAnswerChange(questionId, choice)}
          className={cn(
            'w-full p-3 text-left rounded-lg border transition-all',
            currentValue === choice
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          {choice}
        </button>
      ))}
    </div>
  );

  const categoryColors = {
    achievement: 'text-yellow-600 bg-yellow-100',
    learning: 'text-blue-600 bg-blue-100',
    wellbeing: 'text-green-600 bg-green-100',
    improvement: 'text-purple-600 bg-purple-100',
  };

  const categoryIcons = {
    achievement: Award,
    learning: BookOpen,
    wellbeing: Heart,
    improvement: TrendingUp,
  };

  if (currentSection === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Daily Reflection</h1>
          <p className="text-muted-foreground">
            Take a moment to reflect on your day and capture insights for tomorrow
          </p>
        </div>

        {/* Daily Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Today's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Task Completion */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Task Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.completedTasks}/{metrics.totalTasks}
                  </span>
                </div>
                <Progress value={metrics.completionRate} className="h-2" />
                <p className="text-2xl font-bold text-green-600">{metrics.completionRate}%</p>
              </div>

              {/* Time Spent */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Time Focused</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{metrics.timeSpent}h</p>
                <p className="text-sm text-muted-foreground">Deep work sessions</p>
              </div>

              {/* Energy & Focus */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Energy & Focus</span>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{metrics.energyLevel}/10</p>
                    <p className="text-xs text-muted-foreground">Energy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{metrics.focusQuality}/10</p>
                    <p className="text-xs text-muted-foreground">Focus</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Productivity Trend</p>
                  <p className="text-sm text-muted-foreground">15% improvement this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Streak Maintained</p>
                  <p className="text-sm text-muted-foreground">7 days of completing planning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setCurrentSection('questions')}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Start Reflection Questions
          </Button>
        </div>
      </div>
    );
  }

  if (currentSection === 'questions') {
    const completionScore = getCompletionScore();

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Reflection Questions</h2>
              <Badge variant="secondary">{completionScore}% Complete</Badge>
            </div>
            <Progress value={completionScore} className="h-2" />
          </CardContent>
        </Card>

        {/* Questions by Category */}
        <div className="space-y-6">
          {Object.entries(
            reflectionQuestions.reduce((acc, question) => {
              if (!acc[question.category]) acc[question.category] = [];
              acc[question.category].push(question);
              return acc;
            }, {} as Record<string, ReflectionQuestion[]>)
          ).map(([category, questions]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <CategoryIcon className="h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question) => {
                    const Icon = question.icon;
                    const currentAnswer = reflectionAnswers[question.id];

                    return (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            categoryColors[question.category]
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-3">{question.question}</h4>

                            {question.type === 'text' && (
                              <Textarea
                                placeholder="Share your thoughts..."
                                value={currentAnswer || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="min-h-[80px]"
                              />
                            )}

                            {question.type === 'rating' && renderRatingInput(question.id, currentAnswer)}

                            {question.type === 'choice' && question.choices &&
                              renderChoiceInput(question.id, question.choices, currentAnswer)}
                          </div>
                        </div>
                        {question !== questions[questions.length - 1] && <Separator />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('overview')}>
            Back to Overview
          </Button>
          <Button
            onClick={() => setCurrentSection('insights')}
            disabled={completionScore < 50}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            View Insights & Complete
          </Button>
        </div>
      </div>
    );
  }

  // Insights section
  return (
    <div className="space-y-6">
      {/* Completion Celebration */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Reflection Complete!</h2>
          <p className="text-muted-foreground">
            You've successfully reflected on your day. Here are your key insights.
          </p>
        </CardContent>
      </Card>

      {/* Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Productivity Pattern</h4>
            <p className="text-blue-800 text-sm">
              You tend to be most productive in the morning hours. Consider scheduling your most important tasks between 9-11 AM.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Strength Identified</h4>
            <p className="text-green-800 text-sm">
              Your focus quality is consistently high. This is a key strength that's driving your success.
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Growth Opportunity</h4>
            <p className="text-orange-800 text-sm">
              Consider implementing more breaks to maintain your energy levels throughout the day.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items for Tomorrow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Action Items for Tomorrow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Schedule most important tasks for morning hours</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Add 2 short breaks between focus sessions</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Continue building on your focus strength</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Reflection */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('questions')}>
          Back to Questions
        </Button>
        <Button onClick={handleCompleteReflection} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Complete Reflection & Move to Adjust
        </Button>
      </div>
    </div>
  );
};