import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import type { SystemTemplate } from "@/utils/systemTemplates";
import type { TemplatePrompt } from "@/types/reflections";

interface GuidedReflectionFlowProps {
  template: SystemTemplate;
  onComplete: (responses: Record<string, string>) => void;
  onCancel: () => void;
}

export default function GuidedReflectionFlow({
  template,
  onComplete,
  onCancel,
}: GuidedReflectionFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const prompts = template.prompts;
  const currentPrompt = prompts[currentStep];
  const progress = ((currentStep + 1) / prompts.length) * 100;

  const handleNext = () => {
    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(responses);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentPrompt && !currentPrompt.required) {
      handleNext();
    }
  };

  const canProceed = () => {
    if (!currentPrompt) return false;
    if (currentPrompt.required) {
      return responses[currentPrompt.id]?.trim().length > 0;
    }
    return true;
  };

  const isLastStep = currentStep === prompts.length - 1;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {prompts.length}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Section */}
      {template.structure.sections.map((section) => {
        const sectionPrompts = section.prompts
          .map((pid) => prompts.find((p) => p.id === pid))
          .filter(Boolean);

        const currentPromptInSection = sectionPrompts.find(
          (p) => p?.id === currentPrompt?.id,
        );

        if (!currentPromptInSection) return null;

        return (
          <Card key={section.id} className="p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{section.title}</h3>
              </div>
              {currentPrompt && (
                <>
                  <p className="text-foreground mb-1">{currentPrompt.text}</p>
                  {currentPrompt.required && (
                    <p className="text-xs text-muted-foreground">* Required</p>
                  )}
                </>
              )}
            </div>

            <Textarea
              value={responses[currentPrompt?.id || ""] || ""}
              onChange={(e) =>
                setResponses({
                  ...responses,
                  [currentPrompt?.id || ""]: e.target.value,
                })
              }
              placeholder="Share your thoughts..."
              className="min-h-[200px] resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-2">
                {!currentPrompt?.required && (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                <Button onClick={handleNext} disabled={!canProceed()}>
                  {isLastStep ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Helper text */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Take your time, there's no rush</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Save & Exit
        </Button>
      </div>
    </div>
  );
}
