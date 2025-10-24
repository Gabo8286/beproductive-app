import React, { useState, useEffect } from 'react';
import { useUserMode } from '../contexts/UserModeContext';
import { analyticsService } from '../services/analytics-service';
import { licensingService } from '../services/licensing-service';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ onNext: () => void; onSkip?: () => void }>;
  skippable?: boolean;
  icon: string;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { updatePreferences, switchMode } = useUserMode();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BeProductive!',
      description: 'Your AI-powered development environment',
      component: WelcomeStep,
      icon: '🚀'
    },
    {
      id: 'experience',
      title: 'What\'s your experience level?',
      description: 'Help us customize the interface for you',
      component: ExperienceStep,
      icon: '🎯'
    },
    {
      id: 'features',
      title: 'Key Features Tour',
      description: 'Let\'s explore what makes BeProductive special',
      component: FeaturesStep,
      icon: '✨'
    },
    {
      id: 'demo',
      title: 'Try it yourself!',
      description: 'Create your first project with AI assistance',
      component: DemoStep,
      icon: '🛠️'
    },
    {
      id: 'pricing',
      title: 'Choose your plan',
      description: 'Start your free trial or go Pro',
      component: PricingStep,
      skippable: true,
      icon: '💎'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      analyticsService.track('onboarding_started', {
        stepCount: steps.length
      }, 'app');
    }
  }, [isOpen]);

  const handleNext = () => {
    const step = steps[currentStep];
    analyticsService.track('onboarding_step_completed', {
      stepId: step.id,
      stepIndex: currentStep,
      stepTitle: step.title
    }, 'feature');

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    const step = steps[currentStep];
    analyticsService.track('onboarding_step_skipped', {
      stepId: step.id,
      stepIndex: currentStep
    }, 'feature');

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    analyticsService.track('onboarding_completed', {
      completedSteps: currentStep + 1,
      totalSteps: steps.length
    }, 'app');

    // Set onboarding completion flag
    localStorage.setItem('beproductive_onboarding_completed', 'true');

    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (!isOpen) return null;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You're all set!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Welcome to BeProductive Coding Framework. Let's build something amazing together!
          </p>
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-t-2xl">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-tl-2xl transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{currentStepData.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStepData.skippable && (
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Skip this step
              </button>
            )}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          <StepComponent onNext={handleNext} onSkip={currentStepData.skippable ? handleSkip : undefined} />
        </div>
      </div>
    </div>
  );
};

// Individual step components
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🚀</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Welcome to the future of development!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        BeProductive Coding Framework eliminates the frustrations of online tools like Lovable.dev and Cursor.
        Everything runs locally on your M4 Mac, with AI assistance that actually understands your workflow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: '🔒', title: 'Fully Offline', desc: 'Your code never leaves your machine' },
          { icon: '⚡', title: 'M4 Optimized', desc: 'Lightning fast with Neural Engine' },
          { icon: '🤖', title: 'Smart AI', desc: 'Local AI that learns your style' }
        ].map((feature, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        Let's get started! →
      </button>
    </div>
  );
};

const ExperienceStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const { updatePreferences, switchMode } = useUserMode();

  const experiences = [
    { id: 'beginner', label: 'New to coding', desc: 'Just getting started with development' },
    { id: 'intermediate', label: 'Some experience', desc: 'Familiar with basic concepts and tools' },
    { id: 'advanced', label: 'Experienced developer', desc: 'Comfortable with complex projects' },
    { id: 'expert', label: 'Senior/Lead developer', desc: 'Years of experience across technologies' }
  ];

  const modes = [
    { id: 'creator', label: 'Creator Mode', desc: 'Visual workflows, guided assistance, perfect for learning' },
    { id: 'pro', label: 'Pro Mode', desc: 'Full control, advanced features, minimal hand-holding' },
    { id: 'adaptive', label: 'Adaptive Mode', desc: 'Starts simple, evolves as you grow' }
  ];

  const handleNext = () => {
    if (selectedExperience && selectedMode) {
      updatePreferences({
        experience: selectedExperience as any,
        interfaceComplexity: selectedExperience === 'beginner' ? 'minimal' :
                           selectedExperience === 'intermediate' ? 'standard' : 'full'
      });

      switchMode(selectedMode as any);

      analyticsService.track('user_experience_selected', {
        experience: selectedExperience,
        mode: selectedMode
      }, 'feature');

      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What's your coding experience?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {experiences.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExperience(exp.id)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                selectedExperience === exp.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{exp.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedExperience && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose your interface style
          </h3>
          <div className="space-y-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedMode === mode.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">{mode.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedExperience || !selectedMode}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

const FeaturesStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'command-palette',
      title: 'Universal Command Palette (⌘K)',
      description: 'Lightning-fast access to every feature',
      demo: 'Try pressing ⌘K anywhere in the app',
      icon: '⌘'
    },
    {
      id: 'ai-assistant',
      title: 'Conversational AI (⌘⇧A)',
      description: 'Natural language project creation and assistance',
      demo: 'Ask: \"Create a React component for user authentication\"',
      icon: '🤖'
    },
    {
      id: 'offline-ai',
      title: 'Local AI Models',
      description: 'AI that runs entirely on your M4 Mac',
      demo: 'No internet required, your code stays private',
      icon: '🔒'
    },
    {
      id: 'asset-studio',
      title: 'AI Asset Creation',
      description: 'Generate CSS, HTML, and animations with AI',
      demo: 'Generate beautiful components in seconds',
      icon: '🎨'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                activeFeature === idx
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveFeature(idx)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                  {activeFeature === idx && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      💡 {feature.demo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400">BeProductive Terminal</span>
          </div>
          <div className="space-y-2">
            <div>$ beproductive --version</div>
            <div className="text-gray-400">BeProductive Coding Framework v1.0.0</div>
            <div>$ beproductive create-project \"AI Dashboard\"</div>
            <div className="text-gray-400">🤖 Analyzing requirements...</div>
            <div className="text-gray-400">📁 Setting up React + TypeScript...</div>
            <div className="text-gray-400">🎨 Generating components...</div>
            <div className="text-green-400">✅ Project created successfully!</div>
            <div className="animate-pulse">█</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
          Try it out! →
        </button>
      </div>
    </div>
  );
};

const DemoStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [step, setStep] = useState<'choose' | 'creating' | 'done'>('choose');
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  const demos = [
    {
      id: 'react-component',
      title: 'Create React Component',
      description: 'Generate a beautiful login form with validation',
      icon: '⚛️',
      time: '30 seconds'
    },
    {
      id: 'full-project',
      title: 'Full Project Setup',
      description: 'Complete React + TypeScript project with routing',
      icon: '📁',
      time: '2 minutes'
    },
    {
      id: 'ai-animation',
      title: 'AI-Generated Animation',
      description: 'Create smooth CSS animations with natural language',
      icon: '✨',
      time: '45 seconds'
    }
  ];

  const handleCreateDemo = () => {
    if (!selectedDemo) return;

    setStep('creating');
    analyticsService.track('demo_started', { demoType: selectedDemo }, 'feature');

    // Simulate demo creation
    setTimeout(() => {
      setStep('done');
      analyticsService.track('demo_completed', { demoType: selectedDemo }, 'feature');
    }, 3000);
  };

  if (step === 'creating') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🛠️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Creating your demo project...
        </h3>
        <div className="space-y-3 text-left max-w-md mx-auto">
          {[
            '🔍 Analyzing requirements...',
            '📁 Setting up project structure...',
            '🤖 Generating code with AI...',
            '🎨 Applying modern styling...',
            '✅ Demo ready!'
          ].map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-2 ${idx < 4 ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400 font-semibold'}`}
            >
              <span>{msg}</span>
            </div>
          ))}
        </div>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Demo project created!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your demo project is ready. In the real app, this would open in your default editor
          with a fully functional project structure.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left max-w-md mx-auto">
          <div className="text-sm font-mono space-y-1">
            <div>📁 demo-project/</div>
            <div className="ml-4">📁 src/</div>
            <div className="ml-8">📄 App.tsx</div>
            <div className="ml-8">📄 LoginForm.tsx</div>
            <div className="ml-8">📄 index.css</div>
            <div className="ml-4">📄 package.json</div>
            <div className="ml-4">📄 README.md</div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
          Amazing! Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
        Choose a demo to try
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => setSelectedDemo(demo.id)}
            className={`p-6 text-center rounded-lg border-2 transition-all ${
              selectedDemo === demo.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-3">{demo.icon}</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {demo.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {demo.description}
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              ⏱️ {demo.time}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCreateDemo}
          disabled={!selectedDemo}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all">
          Create Demo Project 🚀
        </button>
      </div>
    </div>
  );
};

const PricingStep: React.FC<{ onNext: () => void; onSkip?: () => void }> = ({ onNext, onSkip }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const plans = licensingService.getPricingPlans();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    analyticsService.track('pricing_plan_selected', { planId }, 'feature');

    if (planId === 'free') {
      onNext();
    } else if (planId === 'pro') {
      const success = licensingService.startProTrial();
      if (success) {
        analyticsService.track('trial_started', { type: 'pro' }, 'app');
      }
      onNext();
    } else {
      // For paid plans, would integrate with payment processor
      const result = await licensingService.initiatePurchase(planId);
      if (result.success && result.url) {
        // In real app, would open payment URL
        console.log('Would open payment URL:', result.url);
      }
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Choose your plan
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start free, upgrade anytime. No lock-in, cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
              plan.highlighted
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="text-center">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h4>

              <div className="mb-4">
                {plan.type === 'free' ? (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Free</span>
                ) : plan.type === 'lifetime' ? (
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price.lifetime}</span>
                    <div className="text-sm text-gray-600 dark:text-gray-400">one-time</div>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price.monthly}</span>
                    <div className="text-sm text-gray-600 dark:text-gray-400">/month</div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {plan.cta}
              </button>

              <div className="mt-4 text-left space-y-1">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{plan.features.length - 4} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            I'll decide later
          </button>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          🔒 All plans include end-to-end encryption and local-first privacy
        </div>
      </div>
    </div>
  );
};

// Helper to check if onboarding should be shown
export const shouldShowOnboarding = (): boolean => {
  return localStorage.getItem('beproductive_onboarding_completed') !== 'true';
};