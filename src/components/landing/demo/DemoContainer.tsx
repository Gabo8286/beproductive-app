import { motion, AnimatePresence } from "framer-motion";
import { useDemoState } from "@/hooks/useDemoState";
import { DemoProgressTracker } from "./DemoProgressTracker";
import { InteractiveOverlay } from "./InteractiveOverlay";
import { DemoNavigation } from "./DemoNavigation";
import { LiveDashboardDemo } from "./LiveDashboardDemo";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface DemoContainerProps {
  onComplete?: () => void;
  onDemoStart?: () => void;
}

export function DemoContainer({ onComplete, onDemoStart }: DemoContainerProps) {
  const {
    demoState,
    demoSteps,
    startDemo,
    nextStep,
    previousStep,
    skipToStep,
    endDemo,
    resetDemo,
    getCurrentStep
  } = useDemoState();

  const currentStep = getCurrentStep();
  const isFirstStep = demoState.currentStep === 'welcome';
  const isLastStep = demoState.currentStep === 'completion';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isLastStep) {
          nextStep();
        }
      } else if (e.key === 'Escape') {
        endDemo();
      }
    };

    if (demoState.isActive) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [demoState.isActive, isLastStep, nextStep, endDemo]);

  if (!demoState.isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-hero p-12 text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-heading font-bold mb-4">
          Experience BeProductive Live
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Take an interactive tour and see how BeProductive can transform your productivity journey. 
          No signup required.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => {
              startDemo('professional');
              onDemoStart?.();
            }}
            size="lg"
            className="apple-button"
          >
            Start Professional Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={() => {
              startDemo('student');
              onDemoStart?.();
            }}
            size="lg"
            variant="outline"
          >
            Student Demo
          </Button>
          <Button
            onClick={() => {
              startDemo('entrepreneur');
              onDemoStart?.();
            }}
            size="lg"
            variant="outline"
          >
            Entrepreneur Demo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          ⌨️ Use keyboard shortcuts: <kbd className="px-2 py-1 rounded bg-muted">Enter</kbd> to continue, 
          <kbd className="px-2 py-1 rounded bg-muted ml-2">Esc</kbd> to exit
        </p>
      </motion.div>
    );
  }

  if (isFirstStep) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-hero p-12 text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-heading font-bold mb-4">
          {currentStep?.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {currentStep?.description}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={nextStep}
            size="lg"
            className="apple-button"
          >
            Begin Tour
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={endDemo}
            size="lg"
            variant="outline"
          >
            Skip for Now
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          This demo will take approximately 2-3 minutes
        </p>
      </motion.div>
    );
  }

  if (isLastStep) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-hero p-12 text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-primary mb-6"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-4xl font-heading font-bold mb-4">
          {currentStep?.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {currentStep?.description}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              endDemo();
              onComplete?.();
            }}
            size="lg"
            className="apple-button"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={resetDemo}
            size="lg"
            variant="outline"
          >
            Restart Tour
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Join thousands of users already transforming their productivity
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <DemoProgressTracker
        currentStep={demoState.currentStep}
        completedSteps={demoState.completedSteps}
        totalSteps={demoSteps.length}
        progress={demoState.progress}
      />

      <DemoNavigation
        currentStep={demoState.currentStep}
        demoSteps={demoSteps}
        onSkipTo={skipToStep}
        onReset={resetDemo}
        onExit={endDemo}
      />

      <div className="max-w-6xl mx-auto py-8">
        <LiveDashboardDemo
          userData={demoState.userData}
          onInteraction={(type, id) => {
            console.log('Demo interaction:', type, id);
          }}
        />
      </div>

      <AnimatePresence>
        {currentStep && (
          <InteractiveOverlay
            title={currentStep.title}
            description={currentStep.description}
            highlightTarget={currentStep.highlightTarget}
            onNext={nextStep}
            onPrevious={previousStep}
            onSkip={endDemo}
            showPrevious={demoState.completedSteps.length > 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
