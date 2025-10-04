import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    type: 'click' | 'input' | 'navigate';
    target?: string;
    value?: string;
    waitForElement?: string;
  };
  tips?: string[];
  estimatedTime?: number;
}

export interface FeatureTourData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps: TourStep[];
  learningObjectives: string[];
  prerequisites?: string[];
}

interface FeatureTourProps {
  tourData: FeatureTourData;
  onComplete?: (tourId: string) => void;
  onClose?: () => void;
  autoPlay?: boolean;
  showProgress?: boolean;
}

const SAMPLE_TOURS: Record<string, FeatureTourData> = {
  'task-management': {
    id: 'task-management',
    title: 'Smart Task Management',
    description: 'Learn how to organize and prioritize your tasks effectively',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedTime: 10,
    learningObjectives: [
      'Create and organize tasks',
      'Set priorities and deadlines',
      'Use smart filters and views',
      'Track task completion'
    ],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Task Management',
        description: 'Let\'s explore how to master your task organization',
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Smart Task Management</h3>
              <p className="text-gray-600">
                Transform how you organize and complete your work with intelligent task management
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Smart Prioritization</div>
                <div className="text-blue-700">AI-powered task ranking</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Deadline Tracking</div>
                <div className="text-green-700">Never miss important dates</div>
              </div>
            </div>
          </div>
        ),
        estimatedTime: 1
      },
      {
        id: 'create-task',
        title: 'Creating Your First Task',
        description: 'Learn how to add and configure new tasks',
        content: (
          <div className="space-y-3">
            <p>Start by clicking the "Add Task" button to create a new task.</p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2">Pro Tips:</div>
              <ul className="text-sm space-y-1">
                <li>• Use descriptive titles for better organization</li>
                <li>• Set realistic deadlines to maintain momentum</li>
                <li>• Add context in the description for future reference</li>
              </ul>
            </div>
          </div>
        ),
        targetSelector: '[data-testid="add-task-button"]',
        placement: 'bottom',
        action: { type: 'click', target: '[data-testid="add-task-button"]' },
        estimatedTime: 2
      },
      {
        id: 'set-priority',
        title: 'Setting Task Priority',
        description: 'Organize tasks by importance and urgency',
        content: (
          <div className="space-y-3">
            <p>Priority levels help you focus on what matters most:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">High</Badge>
                <span className="text-sm">Urgent and important tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                <span className="text-sm">Important but not urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Low</Badge>
                <span className="text-sm">Nice to have tasks</span>
              </div>
            </div>
          </div>
        ),
        targetSelector: '[data-testid="priority-selector"]',
        placement: 'right',
        estimatedTime: 2
      },
      {
        id: 'organize-view',
        title: 'Organizing Your View',
        description: 'Use filters and sorting to manage your task list',
        content: (
          <div className="space-y-3">
            <p>Customize your task view for maximum productivity:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-medium text-blue-900">Filter by Status</div>
                <div className="text-xs text-blue-700">Focus on specific task states</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="font-medium text-purple-900">Sort by Priority</div>
                <div className="text-xs text-purple-700">Work on important tasks first</div>
              </div>
            </div>
          </div>
        ),
        targetSelector: '[data-testid="task-filters"]',
        placement: 'bottom',
        estimatedTime: 2
      },
      {
        id: 'completion',
        title: 'Completing Tasks',
        description: 'Mark tasks as done and track your progress',
        content: (
          <div className="space-y-3">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold">Great Progress!</h4>
              <p className="text-sm text-gray-600">
                Click the checkbox next to any task to mark it complete
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900 mb-1">Completion Benefits:</div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Visual progress tracking</li>
                <li>• Productivity insights</li>
                <li>• Achievement badges</li>
              </ul>
            </div>
          </div>
        ),
        estimatedTime: 3
      }
    ]
  },
  'habit-tracking': {
    id: 'habit-tracking',
    title: 'Habit Tracking Mastery',
    description: 'Build lasting habits with smart tracking and analytics',
    category: 'habits',
    difficulty: 'beginner',
    estimatedTime: 15,
    learningObjectives: [
      'Create habit tracking routines',
      'Understand habit analytics',
      'Set up habit reminders',
      'Track streak progress'
    ],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Habit Tracking',
        description: 'Learn to build and maintain positive habits',
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <Zap className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Habit Tracking</h3>
              <p className="text-gray-600">
                Build lasting positive changes through consistent habit tracking
              </p>
            </div>
          </div>
        ),
        estimatedTime: 1
      }
      // Additional steps would be defined here
    ]
  }
};

export const FeatureTour: React.FC<FeatureTourProps> = ({
  tourData,
  onComplete,
  onClose,
  autoPlay = false,
  showProgress = true
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tourStartTime, setTourStartTime] = useState<Date>(new Date());
  const [stepStartTime, setStepStartTime] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  const currentStep = tourData.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tourData.steps.length) * 100;
  const isLastStep = currentStepIndex === tourData.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (isPlaying && !isLastStep) {
      const stepTime = currentStep.estimatedTime || 3;
      intervalRef.current = setTimeout(() => {
        handleNext();
      }, stepTime * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentStepIndex, isPlaying]);

  useEffect(() => {
    setStepStartTime(new Date());
  }, [currentStepIndex]);

  const handleNext = () => {
    if (!isLastStep) {
      markStepCompleted(currentStep.id);
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    markStepCompleted(currentStep.id);
    const tourDuration = (new Date().getTime() - tourStartTime.getTime()) / 1000;
    onComplete?.(tourData.id);
  };

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => [...prev.filter(id => id !== stepId), stepId]);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setTourStartTime(new Date());
    setIsPlaying(autoPlay);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tourData.title}</h2>
              <p className="text-gray-600">{tourData.description}</p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showProgress && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Step {currentStepIndex + 1} of {tourData.steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />

              {/* Step Navigation */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                {tourData.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(index)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : completedSteps.includes(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-gray-600 mb-4">{currentStep.description}</p>
              </div>

              <Card>
                <CardContent className="p-4">
                  {currentStep.content}
                </CardContent>
              </Card>

              {currentStep.tips && currentStep.tips.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">Pro Tips:</div>
                      <ul className="text-sm text-amber-800 space-y-1">
                        {currentStep.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="flex items-center gap-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { SAMPLE_TOURS };