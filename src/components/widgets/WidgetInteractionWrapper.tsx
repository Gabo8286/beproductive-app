import { ReactNode, useState } from "react";
import { useSpringAnimation } from "@/hooks/useSpringAnimation";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";

interface WidgetInteractionWrapperProps {
  children: ReactNode;
  onRefresh?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function WidgetInteractionWrapper({
  children,
  onRefresh,
  onSuccess,
  className,
}: WidgetInteractionWrapperProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { animate } = useSpringAnimation();
  const { triggerHaptic } = useHapticFeedback();

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    triggerHaptic("light");

    try {
      await onRefresh();
      triggerHaptic("success");

      // Success animation
      const element = document.querySelector(
        "[data-widget-content]",
      ) as HTMLElement;
      if (element) {
        element.classList.add("success-bounce");
        setTimeout(() => {
          element.classList.remove("success-bounce");
        }, 600);
      }
    } catch (error) {
      triggerHaptic("error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      triggerHaptic("success");
    }
  };

  return (
    <div
      className={cn("gpu-accelerated", className)}
      data-widget-interaction-wrapper
    >
      <div
        data-widget-content
        className={cn("smooth-transition", isRefreshing && "update-pulse")}
      >
        {children}
      </div>
    </div>
  );
}
