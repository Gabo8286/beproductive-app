import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  Calendar,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Brain,
  SkipForward
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProductivityProfileWidget } from '@/components/widgets/ProductivityProfileWidget';
import { LunaProvider } from '@/components/luna/context/LunaContext';
import { LunaIntroStep } from '@/components/luna/onboarding/LunaIntroStep';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ onNext: () => void; onBack: () => void }>;
}

// User type options for personalization
const userTypes = [
  {
    id: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Building and scaling businesses',
    icon: Briefcase,
    color: 'bg-blue-500',
    demo: 'Gabriel\'s AI startup journey'
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Managing work and career goals',
    icon: User,
    color: 'bg-green-500',
    demo: 'Executive productivity workflow'
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Learning and academic success',
    icon: GraduationCap,
    color: 'bg-purple-500',
    demo: 'Student study planning'
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Life goals and wellness',
    icon: Heart,
    color: 'bg-pink-500',
    demo: 'Personal development focus'
  }
];

// Welcome Step Component
const WelcomeStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎯</div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to BeProductive
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered productivity platform for goals, tasks, habits, and insights.
          Let's get you set up in just a few minutes.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <div className="text-center p-4">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Smart Goals</p>
        </div>
        <div className="text-center p-4">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Time Tracking</p>
        </div>
        <div className="text-center p-4">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Analytics</p>
        </div>
        <div className="text-center p-4">
          <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-sm font-medium">AI Insights</p>
        </div>
      </div>
      <Button
        onClick={onNext}
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
      >
        Get Started <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

// User Type Selection Step
const UserTypeStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleNext = () => {
    if (!selectedType) {
      toast.error('Please select your user type to continue');
      return;
    }
    localStorage.setItem('beproductive_user_type', selectedType);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          What best describes you?
        </h2>
        <p className="text-gray-600">
          We'll customize your experience based on your goals and workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {userTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedType === type.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${type.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{type.label}</h3>
                <p className="text-gray-600 mb-3">{type.description}</p>
                <p className="text-sm text-blue-600 font-medium">{type.demo}</p>
                {selectedType === type.id && (
                  <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Quick Setup Step
const QuickSetupStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [preferences, setPreferences] = useState({
    notifications: true,
    aiInsights: true,
    weeklyReports: true,
    darkMode: false
  });

  const handleNext = () => {
    localStorage.setItem('beproductive_preferences', JSON.stringify(preferences));
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Quick Setup
        </h2>
        <p className="text-gray-600">
          Configure your preferences to get the most out of BeProductive.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {[
          { key: 'notifications', label: 'Task reminders and notifications', description: 'Get notified about deadlines and important updates' },
          { key: 'aiInsights', label: 'AI-powered insights and suggestions', description: 'Receive personalized productivity recommendations' },
          { key: 'weeklyReports', label: 'Weekly progress reports', description: 'Get summaries of your accomplishments and goals' },
          { key: 'darkMode', label: 'Dark mode interface', description: 'Use a darker theme for better focus' }
        ].map((item) => (
          <Card key={item.key} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof typeof preferences]}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    [item.key]: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Productivity Assessment Step (Optional)
const ProductivityAssessmentStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Discover Your Productivity Style
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take our optional 8-question assessment to understand your unique productivity profile
          and get personalized recommendations tailored to your working style.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <ProductivityProfileWidget />
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Why take the assessment?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Personalized productivity strategies</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Better task and goal recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Optimized workflow suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Understanding of your strengths</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between max-w-3xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          className="text-gray-600"
        >
          Skip for now <SkipForward className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Completion Step
const CompletionStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext }) => {
  const navigate = useNavigate();

  const handleFinish = () => {
    localStorage.setItem('beproductive_onboarding_completed', 'true');
    toast.success('Welcome to BeProductive! 🎉');
    navigate('/app/capture');
  };

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          You're All Set!
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          BeProductive is now configured for your workflow.
          Let's start building your most productive self.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Explore the demo data to see BeProductive in action</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Create your first goal or task</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Start a focus session with the built-in timer</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleFinish}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
      >
        Enter BeProductive <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

// Main OnboardingFlow Component
export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      subtitle: 'Get started with BeProductive',
      icon: Sparkles,
      component: WelcomeStep
    },
    {
      id: 'user-type',
      title: 'User Type',
      subtitle: 'Personalize your experience',
      icon: User,
      component: UserTypeStep
    },
    {
      id: 'luna-intro',
      title: 'Meet Luna',
      subtitle: 'Your AI productivity assistant',
      icon: Heart,
      component: LunaIntroStep
    },
    {
      id: 'setup',
      title: 'Setup',
      subtitle: 'Configure preferences',
      icon: Target,
      component: QuickSetupStep
    },
    {
      id: 'assessment',
      title: 'Assessment',
      subtitle: 'Discover your productivity style',
      icon: Brain,
      component: ProductivityAssessmentStep
    },
    {
      id: 'completion',
      title: 'Complete',
      subtitle: 'Ready to be productive',
      icon: CheckCircle,
      component: CompletionStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <LunaProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">BeProductive</h1>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-gray-500">
            BeProductive • Your AI-powered productivity companion
          </div>
        </div>
      </div>
    </LunaProvider>
  );
}