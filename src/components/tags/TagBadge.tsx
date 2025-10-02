import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TagBadge({ name, color = "#6366f1", onRemove, className, size = "sm" }: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-normal transition-colors",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-background/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${name} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}
