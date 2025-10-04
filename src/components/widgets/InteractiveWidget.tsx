import { useState, useRef } from "react";
import { BaseWidget, BaseWidgetProps } from "./BaseWidget";
import { cn } from "@/lib/utils";

interface InteractiveWidgetProps extends BaseWidgetProps {
  onExpand?: () => void;
  expandable?: boolean;
  onQuickAction?: () => void;
  quickActionIcon?: React.ReactNode;
  quickActionLabel?: string;
}

export function InteractiveWidget({
  children,
  onExpand,
  expandable = false,
  onQuickAction,
  quickActionIcon,
  quickActionLabel,
  className,
  ...props
}: InteractiveWidgetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };
  const handleMouseEnter = () => setIsHovered(true);

  // Double-click to expand
  const handleDoubleClick = () => {
    if (expandable && onExpand) {
      onExpand();
    }
  };

  // Long press for quick action (mobile)
  const handleTouchStart = () => {
    if (onQuickAction) {
      const timer = setTimeout(() => {
        onQuickAction();
        // Haptic feedback simulation
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      }, 500);

      const cleanup = () => {
        clearTimeout(timer);
        document.removeEventListener("touchend", cleanup);
        document.removeEventListener("touchcancel", cleanup);
      };

      document.addEventListener("touchend", cleanup);
      document.addEventListener("touchcancel", cleanup);
    }
  };

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      className={cn(
        "transition-all duration-200 ease-out",
        "transform-gpu", // Use GPU acceleration
        isPressed && "scale-[0.98]",
        isHovered && "shadow-xl shadow-primary/5",
        expandable && "cursor-pointer",
        className,
      )}
      style={{
        transform: `translateZ(${isHovered ? "8px" : "0px"}) scale(${isPressed ? "0.98" : "1"})`,
        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      <BaseWidget {...props} className="relative overflow-hidden">
        {children}

        {/* Hover Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5",
            "opacity-0 transition-opacity duration-300 pointer-events-none",
            isHovered && "opacity-100",
          )}
        />

        {/* Expandable Indicator */}
        {expandable && isHovered && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center spring-enter">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        )}

        {/* Quick Action Floating Button */}
        {onQuickAction && isHovered && (
          <div className="absolute bottom-4 right-4 spring-enter">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction();
              }}
              className="w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 apple-button flex items-center justify-center"
              title={quickActionLabel}
            >
              {quickActionIcon}
            </button>
          </div>
        )}
      </BaseWidget>
    </div>
  );
}
