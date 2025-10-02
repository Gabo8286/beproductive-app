import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface SortableWidgetProps {
  id: string;
  children: ReactNode;
  widget: any;
  isActive: boolean;
}

export function SortableWidget({ 
  id, 
  children, 
  widget,
  isActive 
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-300",
        widget.size === 'large' && 'md:col-span-2 md:row-span-2',
        widget.size === 'medium' && 'md:col-span-2',
        widget.size === 'small' && 'col-span-1',
        isDragging && "z-50 rotate-3 scale-105",
        isActive && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100",
          "w-6 h-6 bg-background/90 backdrop-blur-sm rounded cursor-grab",
          "flex items-center justify-center transition-all duration-200",
          "hover:bg-primary hover:text-primary-foreground active:cursor-grabbing"
        )}
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Widget Content */}
      <div className={cn(
        "h-full",
        isDragging && "pointer-events-none"
      )}>
        {children}
      </div>

      {/* Drop Zone Indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg pointer-events-none" />
      )}
    </div>
  );
}
