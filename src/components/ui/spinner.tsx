import { cn } from "@/lib/utils";

interface SpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "page" | "inline";
  className?: string;
  color?: "primary" | "white" | "blue" | "purple";
}

export const Spinner: React.FC<SpinnerProps> = ({
  message = "Loading...",
  size = "md",
  variant = "page",
  className,
  color = "primary"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    primary: "border-muted border-t-primary",
    white: "border-gray-300 border-t-white",
    blue: "border-gray-300 border-t-blue-600",
    purple: "border-gray-300 border-t-purple-600",
  };

  const spinnerElement = (
    <div
      className={cn(
        "border-2 rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        variant === "inline" && "mx-auto",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center p-4">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {spinnerElement}
      {message && (
        <p className="text-muted-foreground text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
