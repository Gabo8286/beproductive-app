import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  total: number;
  completed: number;
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressIndicator({
  total,
  completed,
  percentage,
  showLabel = true,
  size = "md",
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} text-muted-foreground shrink-0`}
      />
      <div className="flex-1 min-w-0">
        <Progress value={percentage} className={sizeClasses[size]} />
      </div>
      {showLabel && (
        <span
          className={`${textSizes[size]} text-muted-foreground whitespace-nowrap`}
        >
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
