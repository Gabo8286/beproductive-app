import { motion } from "framer-motion";
import { SkipForward, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DemoStep } from "@/types/demo";

interface DemoNavigationProps {
  currentStep: string;
  demoSteps: DemoStep[];
  onSkipTo: (stepId: string) => void;
  onReset: () => void;
  onExit: () => void;
}

export function DemoNavigation({
  currentStep,
  demoSteps,
  onSkipTo,
  onReset,
  onExit
}: DemoNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-4 z-50 flex gap-2"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="glass-card">
            <SkipForward className="w-4 h-4 mr-2" />
            Skip To
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card">
          {demoSteps.map((step) => (
            <DropdownMenuItem
              key={step.id}
              onClick={() => onSkipTo(step.id)}
              disabled={step.id === currentStep}
              className="cursor-pointer"
            >
              {step.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="glass-card"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExit}
        className="glass-card"
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
