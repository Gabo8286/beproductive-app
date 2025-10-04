import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Target,
  Calendar,
  Brain,
  Zap,
  Users,
  Trophy,
  Sparkles,
  Clock,
  Star
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  onNext: (data?: any) => void;
  onPrev: () => void;
  stepData: any;
  updateStepData: (data: any) => void;
}

interface OnboardingData {
  welcome: {};
  profile: {
    full_name: string;
    role: string;
    goals: string[];
  };
  preferences: {
    work_style: string;
    notification_frequency: string;
    preferred_features: string[];
  };
  goals: {
    primary_focus: string;
    goal_categories: string[];
    time_commitment: string;
  };
  habits: {
    current_habits: string[];
    tracking_preferences: string[];
  };
  features: {
    enabled_modules: string[];
    dashboard_layout: string;
  };
  completion: {};
}

// Welcome Step Component
const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-white" />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to Spark Bloom Flow! 🌟
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your journey to productivity mastery starts here. Let's set up your personalized
          productivity workspace in just a few simple steps.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {[
          { icon: Target, label: 'Set Goals', color: 'bg-blue-100 text-blue-600' },
          { icon: Calendar, label: 'Track Habits', color: 'bg-green-100 text-green-600' },
          { icon: Brain, label: 'AI Insights', color: 'bg-purple-100 text-purple-600' },
          { icon: Trophy, label: 'Achievements', color: 'bg-orange-100 text-orange-600' }
        ].map((feature, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      <Button onClick={() => onNext()} size="lg" className="mt-8">
        Let's Get Started <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>
  );
};

// Profile Setup Step
const ProfileStep: React.FC<OnboardingStepProps> = ({ onNext, onPrev, stepData, updateStepData }) => {
  const [formData, setFormData] = useState({
    full_name: stepData.full_name || '',
    role: stepData.role || '',
    goals: stepData.goals || []
  });

  const roles = [
    { value: 'student', label: 'Student', description: 'Learning and academic goals' },
    { value: 'professional', label: 'Professional', description: 'Career and work objectives' },
    { value: 'entrepreneur', label: 'Entrepreneur', description: 'Building and growing ventures' },
    { value: 'creative', label: 'Creative', description: 'Artistic and creative pursuits' },
    { value: 'parent', label: 'Parent', description: 'Family and life balance' },
    { value: 'other', label: 'Other', description: 'Custom productivity needs' }
  ];

  const goalTypes = [
    'Career Growth', 'Health & Fitness', 'Learning & Education',
    'Financial Goals', 'Relationships', 'Creative Projects',
    'Travel & Adventure', 'Personal Development', 'Community Impact'
  ];

  const handleSubmit = () => {
    if (!formData.full_name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.role) {
      toast.error('Please select your role');
      return;
    }
    updateStepData(formData);
    onNext(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">What should we call you?</Label>
          <Input
            id="full_name"
            placeholder="Enter your name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Which best describes you?</Label>
          <RadioGroup
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
            className="mt-2 space-y-3"
          >
            {roles.map((role) => (
              <div key={role.value} className="flex items-center space-x-3">
                <RadioGroupItem value={role.value} id={role.value} />
                <div className="flex-1">
                  <Label htmlFor={role.value} className="font-medium">
                    {role.label}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>What areas do you want to focus on? (Select all that apply)</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
            {goalTypes.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        goals: [...formData.goals, goal]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        goals: formData.goals.filter(g => g !== goal)
                      });
                    }
                  }}
                />
                <Label htmlFor={goal} className="text-sm">
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleSubmit}>
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// Preferences Step
const PreferencesStep: React.FC<OnboardingStepProps> = ({ onNext, onPrev, stepData, updateStepData }) => {
  const [preferences, setPreferences] = useState({
    work_style: stepData.work_style || '',
    notification_frequency: stepData.notification_frequency || '',
    preferred_features: stepData.preferred_features || []
  });

  const workStyles = [
    { value: 'focused', label: 'Deep Focus', description: 'Long, uninterrupted work sessions' },
    { value: 'flexible', label: 'Flexible', description: 'Adapt to changing priorities' },
    { value: 'structured', label: 'Structured', description: 'Detailed planning and schedules' },
    { value: 'collaborative', label: 'Collaborative', description: 'Team-based productivity' }
  ];

  const features = [
    { id: 'ai_insights', label: 'AI Insights', description: 'Personalized productivity recommendations' },
    { id: 'goal_tracking', label: 'Goal Tracking', description: 'Set and monitor progress toward objectives' },
    { id: 'habit_building', label: 'Habit Building', description: 'Build and maintain positive habits' },
    { id: 'time_tracking', label: 'Time Tracking', description: 'Monitor how you spend your time' },
    { id: 'team_collaboration', label: 'Team Features', description: 'Collaborate with others' },
    { id: 'gamification', label: 'Achievements', description: 'Earn rewards for productivity milestones' }
  ];

  const handleSubmit = () => {
    updateStepData(preferences);
    onNext(preferences);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Customize your experience</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let's tailor the app to match your work style
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>What's your work style?</Label>
          <RadioGroup
            value={preferences.work_style}
            onValueChange={(value) => setPreferences({ ...preferences, work_style: value })}
            className="mt-2 space-y-3"
          >
            {workStyles.map((style) => (
              <div key={style.value} className="flex items-center space-x-3">
                <RadioGroupItem value={style.value} id={style.value} />
                <div className="flex-1">
                  <Label htmlFor={style.value} className="font-medium">
                    {style.label}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>How often would you like notifications?</Label>
          <RadioGroup
            value={preferences.notification_frequency}
            onValueChange={(value) => setPreferences({ ...preferences, notification_frequency: value })}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal">Minimal - Only important updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate">Moderate - Daily summaries and reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="frequent" id="frequent" />
              <Label htmlFor="frequent">Frequent - Real-time updates and tips</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Which features interest you most?</Label>
          <div className="mt-2 space-y-3">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-start space-x-3">
                <Checkbox
                  id={feature.id}
                  checked={preferences.preferred_features.includes(feature.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPreferences({
                        ...preferences,
                        preferred_features: [...preferences.preferred_features, feature.id]
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        preferred_features: preferences.preferred_features.filter(f => f !== feature.id)
                      });
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={feature.id} className="font-medium">
                    {feature.label}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleSubmit}>
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// Completion Step
const CompletionStep: React.FC<OnboardingStepProps> = ({ stepData }) => {
  const { updateProfile } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Update profile with onboarding data
      await updateProfile({
        full_name: stepData.profile?.full_name,
        onboarding_completed: true,
        preferences: {
          role: stepData.profile?.role,
          goals: stepData.profile?.goals,
          work_style: stepData.preferences?.work_style,
          notification_frequency: stepData.preferences?.notification_frequency,
          preferred_features: stepData.preferences?.preferred_features,
          onboarding_completed_at: new Date().toISOString()
        }
      });

      toast.success('Welcome to Spark Bloom Flow! Your workspace is ready.');

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
      console.error('Onboarding completion error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          You're all set! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your personalized productivity workspace is ready. Let's start building amazing habits
          and achieving your goals together!
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Your Setup Summary:
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="font-medium capitalize">{stepData.profile?.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Focus Areas:</span>
            <span className="font-medium">{stepData.profile?.goals?.length || 0} selected</span>
          </div>
          <div className="flex justify-between">
            <span>Work Style:</span>
            <span className="font-medium capitalize">{stepData.preferences?.work_style}</span>
          </div>
          <div className="flex justify-between">
            <span>Features:</span>
            <span className="font-medium">{stepData.preferences?.preferred_features?.length || 0} enabled</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleComplete}
        size="lg"
        disabled={isCompleting}
        className="mt-8"
      >
        {isCompleting ? (
          <>
            <Clock className="mr-2 w-4 h-4 animate-spin" />
            Setting up your workspace...
          </>
        ) : (
          <>
            Enter Your Dashboard <Star className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

// Main Onboarding Flow Component
export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with Spark Bloom Flow',
      icon: <Sparkles className="w-5 h-5" />,
      component: WelcomeStep
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Tell us about yourself',
      icon: <Users className="w-5 h-5" />,
      component: ProfileStep
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: <Zap className="w-5 h-5" />,
      component: PreferencesStep
    },
    {
      id: 'completion',
      title: 'Complete',
      description: 'You\'re ready to go!',
      icon: <CheckCircle className="w-5 h-5" />,
      component: CompletionStep
    }
  ];

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setOnboardingData(prev => ({
        ...prev,
        [steps[currentStep].id]: stepData
      }));
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const updateStepData = (data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [steps[currentStep].id]: data
    }));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Spark Bloom Flow
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Setup & Onboarding
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    index <= currentStep
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-20">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <CurrentStepComponent
                key={currentStep}
                onNext={handleNext}
                onPrev={handlePrev}
                stepData={onboardingData[steps[currentStep].id] || {}}
                updateStepData={updateStepData}
              />
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;