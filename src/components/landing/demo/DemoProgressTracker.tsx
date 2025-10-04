import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DemoProgressTrackerProps {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  progress: number;
}

export function DemoProgressTracker({
  currentStep,
  completedSteps,
  totalSteps,
  progress,
}: DemoProgressTrackerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 min-w-[300px]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {completedSteps.length} of {totalSteps}
          </span>
        </div>
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm font-semibold text-primary">{progress}%</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Interactive Demo Tour
      </p>
    </motion.div>
  );
}
