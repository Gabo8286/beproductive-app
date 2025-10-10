import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Target,
  Calendar,
  Brain,
  TrendingUp,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  target?: string; // CSS selector for the element to highlight
}

const tourSteps: TourStep[] = [
  {
    id: 'capture',
    title: 'Quick Capture',
    description: 'Instantly capture tasks, ideas, and goals from anywhere in the app. This is your productivity inbox.',
    icon: Zap,
    position: { bottom: '100px', right: '20px' },
    target: '[data-tab="capture"]'
  },
  {
    id: 'plan',
    title: 'Smart Planning',
    description: 'Organize your tasks and projects with AI-powered insights. View everything in lists, boards, or calendar.',
    icon: Target,
    position: { bottom: '100px', right: '20px' },
    target: '[data-tab="plan"]'
  },
  {
    id: 'engage',
    title: 'Daily Focus',
    description: 'See today\'s priorities, track progress, and get insights into your productivity patterns.',
    icon: TrendingUp,
    position: { bottom: '100px', right: '20px' },
    target: '[data-tab="engage"]'
  },
  {
    id: 'ai-insights',
    title: 'AI Recommendations',
    description: 'Get personalized suggestions, smart scheduling, and productivity insights powered by AI.',
    icon: Brain,
    position: { top: '100px', right: '20px' }
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    description: 'Built-in timer and time tracking help you understand where your time goes and improve focus.',
    icon: Calendar,
    position: { top: '100px', left: '20px' }
  }
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  startStep?: number;
}

export const FeatureTour: React.FC<FeatureTourProps> = ({
  isOpen,
  onClose,
  startStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [isVisible, setIsVisible] = useState(isOpen);

  React.useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('beproductive_feature_tour_completed', 'true');
    toast.success('Feature tour completed! 🎉');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('beproductive_feature_tour_completed', 'true');
    onClose();
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

      {/* Tour Card */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50"
          style={currentTourStep.position}
        >
          <Card className="w-80 shadow-2xl border-2 border-blue-200">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentTourStep.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentStep + 1} of {tourSteps.length}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentTourStep.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-600"
                >
                  Skip Tour
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        Complete <CheckCircle className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Spotlight effect for target elements */}
      {currentTourStep.target && (
        <style>
          {`
            ${currentTourStep.target} {
              position: relative;
              z-index: 51;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 0 2000px rgba(0, 0, 0, 0.5);
              border-radius: 8px;
            }
          `}
        </style>
      )}
    </>
  );
};

// Hook to manage feature tour
export const useFeatureTour = () => {
  const [isOpen, setIsOpen] = useState(false);

  const startTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const isTourCompleted = () => {
    return localStorage.getItem('beproductive_feature_tour_completed') === 'true';
  };

  const resetTour = () => {
    localStorage.removeItem('beproductive_feature_tour_completed');
  };

  return {
    isOpen,
    startTour,
    closeTour,
    isTourCompleted,
    resetTour
  };
};