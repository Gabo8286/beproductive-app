import {
  useActiveTimer,
  useStartTimer,
  useStopTimer,
} from "@/hooks/useTimeTracking";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface TimerButtonProps {
  taskId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TimerButton({
  taskId,
  variant = "ghost",
  size = "icon",
}: TimerButtonProps) {
  const { data: activeTimer } = useActiveTimer();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  const isThisTaskActive = activeTimer?.task_id === taskId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task card click event

    if (isThisTaskActive) {
      stopTimer.mutate();
    } else {
      startTimer.mutate(taskId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={startTimer.isPending || stopTimer.isPending}
      className={isThisTaskActive ? "text-primary" : ""}
    >
      {isThisTaskActive ? (
        <Square className="h-4 w-4" fill="currentColor" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
