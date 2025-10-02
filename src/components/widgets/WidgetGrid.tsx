import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WidgetGridProps {
  children: ReactNode;
  className?: string;
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
  return (
    <div className={cn(
      "widget-grid",
      className
    )}>
      {children}
    </div>
  );
}
