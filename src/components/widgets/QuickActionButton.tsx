import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuickActionButton({
  icon,
  label,
  onClick,
  variant = "primary",
  size = "md",
  className,
}: QuickActionButtonProps) {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic("medium");
    onClick();
  };

  const variantClasses = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    success: "bg-success hover:bg-success/90 text-success-foreground",
    warning: "bg-warning hover:bg-warning/90 text-warning-foreground",
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "rounded-full shadow-lg hover:shadow-xl apple-press",
        "transition-all duration-200 backdrop-blur-sm",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      size="icon"
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
}
