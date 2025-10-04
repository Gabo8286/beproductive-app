import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type WidgetSize = "small" | "medium" | "large";
export type WidgetVariant = "default" | "glass" | "elevated";

export interface BaseWidgetProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: WidgetSize;
  variant?: WidgetVariant;
  className?: string;
  onRefresh?: () => void;
  onConfigure?: () => void;
  isLoading?: boolean;
  actions?: ReactNode;
}

export function BaseWidget({
  children,
  title,
  subtitle,
  icon,
  size = "medium",
  variant = "glass",
  className,
  onRefresh,
  onConfigure,
  isLoading = false,
  actions,
}: BaseWidgetProps) {
  const sizeClasses = {
    small: "col-span-1 row-span-1 min-h-[200px]",
    medium: "col-span-2 row-span-1 min-h-[200px]",
    large: "col-span-2 row-span-2 min-h-[400px]",
  };

  const variantClasses = {
    default: "bg-card border-border shadow-sm",
    glass: "bg-card/60 backdrop-blur-md border-border/50 shadow-lg",
    elevated: "bg-card shadow-xl border-0",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02] apple-hover",
        sizeClasses[size],
        variantClasses[variant],
        isLoading && "animate-pulse",
        className,
      )}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-sm text-foreground">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Widget Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}
