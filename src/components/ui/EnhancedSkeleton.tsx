import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAccessibilityPreferences } from "@/contexts/AccessibilityContext";

export type SkeletonVariant = "pulse" | "wave" | "shimmer" | "fade" | "static";
export type SkeletonShape = "rect" | "circle" | "pill" | "text" | "avatar";
export type SkeletonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  shape?: SkeletonShape;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  delay?: number; // Animation delay in ms
  duration?: number; // Animation duration in ms
  lines?: number; // For text skeletons
  aspectRatio?: number; // For responsive skeletons
  children?: ReactNode; // For skeleton with content
  isLoading?: boolean; // Show skeleton or content
  showProgress?: boolean; // Show loading progress
  progress?: number; // Progress percentage (0-100)
  accessibleLabel?: string; // Screen reader label
}

const sizeClasses = {
  xs: "h-3",
  sm: "h-4",
  md: "h-5",
  lg: "h-6",
  xl: "h-8"
};

const shapeClasses = {
  rect: "rounded-md",
  circle: "rounded-full aspect-square",
  pill: "rounded-full",
  text: "rounded-sm",
  avatar: "rounded-full aspect-square"
};

/**
 * Enhanced Skeleton Component with advanced loading states and accessibility
 * Supports multiple animation variants, shapes, and progressive loading
 */
export function EnhancedSkeleton({
  variant = "pulse",
  shape = "rect",
  size = "md",
  width,
  height,
  delay = 0,
  duration = 1500,
  lines = 1,
  aspectRatio,
  children,
  isLoading = true,
  showProgress = false,
  progress = 0,
  accessibleLabel,
  className,
  ...props
}: EnhancedSkeletonProps) {
  const { preferences } = useAccessibilityPreferences();
  const [hasStarted, setHasStarted] = useState(false);

  // Handle reduced motion preferences
  const shouldAnimate = !preferences.reduceMotion && !preferences.skipAnimations;
  const effectiveVariant = shouldAnimate ? variant : "static";

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setHasStarted(true), delay);
      return () => clearTimeout(timer);
    } else {
      setHasStarted(true);
    }
  }, [delay]);

  // If not loading and has children, show content
  if (!isLoading && children) {
    return <>{children}</>;
  }

  // If not started due to delay, show nothing
  if (!hasStarted) {
    return <div className="invisible" />;
  }

  const getVariantClasses = () => {
    switch (effectiveVariant) {
      case "pulse":
        return "animate-pulse bg-muted";
      case "wave":
        return "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]";
      case "shimmer":
        return "relative bg-muted overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";
      case "fade":
        return "bg-muted animate-[fade_1s_ease-in-out_infinite_alternate]";
      case "static":
        return "bg-muted";
      default:
        return "animate-pulse bg-muted";
    }
  };

  const getSkeletonStyle = () => {
    const style: React.CSSProperties = {
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
    };

    if (width) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }

    if (height) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }

    if (aspectRatio) {
      style.aspectRatio = aspectRatio.toString();
    }

    return style;
  };

  // Render text skeleton with multiple lines
  if (shape === "text" && lines > 1) {
    return (
      <div
        className={cn("space-y-2", className)}
        role="status"
        aria-label={accessibleLabel || "Loading content"}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              getVariantClasses(),
              shapeClasses[shape],
              sizeClasses[size],
              index === lines - 1 && lines > 1 ? "w-3/4" : "w-full", // Last line shorter
            )}
            style={getSkeletonStyle()}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Main skeleton element
  return (
    <div
      className={cn(
        getVariantClasses(),
        shapeClasses[shape],
        sizeClasses[size],
        showProgress && "relative",
        className
      )}
      style={getSkeletonStyle()}
      role="status"
      aria-label={accessibleLabel || "Loading content"}
      {...props}
    >
      {/* Progress indicator */}
      {showProgress && (
        <div
          className="absolute inset-0 bg-primary/20 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      )}

      {/* Screen reader content */}
      <span className="sr-only">
        {showProgress ? `Loading ${progress}% complete` : "Loading..."}
      </span>
    </div>
  );
}

// Preset skeleton components for common use cases
export const SkeletonAvatar = ({ size = "md", ...props }: Partial<EnhancedSkeletonProps>) => (
  <EnhancedSkeleton
    shape="avatar"
    size={size}
    accessibleLabel="Loading avatar"
    {...props}
  />
);

export const SkeletonText = ({
  lines = 1,
  size = "md",
  ...props
}: Partial<EnhancedSkeletonProps>) => (
  <EnhancedSkeleton
    shape="text"
    lines={lines}
    size={size}
    accessibleLabel={`Loading text content (${lines} lines)`}
    {...props}
  />
);

export const SkeletonButton = ({ size = "md", ...props }: Partial<EnhancedSkeletonProps>) => (
  <EnhancedSkeleton
    shape="pill"
    size={size}
    width="auto"
    className="px-4 py-2"
    accessibleLabel="Loading button"
    {...props}
  />
);

export const SkeletonCard = ({ ...props }: Partial<EnhancedSkeletonProps>) => (
  <div className="space-y-3 p-4 border rounded-lg">
    <div className="flex items-center space-x-3">
      <SkeletonAvatar size="sm" />
      <SkeletonText lines={1} className="flex-1" />
    </div>
    <SkeletonText lines={2} />
    <div className="flex justify-between items-center">
      <SkeletonButton size="sm" />
      <EnhancedSkeleton shape="rect" size="sm" width={60} />
    </div>
  </div>
);

// Progressive skeleton that shows different stages
interface ProgressiveSkeletonProps {
  stages: {
    component: ReactNode;
    duration: number;
    label?: string;
  }[];
  className?: string;
}

export function ProgressiveSkeleton({ stages, className }: ProgressiveSkeletonProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, stages[currentStage].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStage, stages]);

  const currentStageData = stages[currentStage];

  return (
    <div className={className} role="status" aria-live="polite">
      {currentStageData.component}
      <span className="sr-only">
        {currentStageData.label || `Loading stage ${currentStage + 1} of ${stages.length}`}
      </span>
    </div>
  );
}