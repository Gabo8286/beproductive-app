import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useAriaAnnounce } from "@/hooks/useAriaAnnounce";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface DraggableTaskProps {
  task: Task;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DraggableTask({
  task,
  children,
  disabled = false,
}: DraggableTaskProps) {
  const { announce } = useAriaAnnounce();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      announce(
        `Task ${task.title} ready to move. Use arrow keys to reorder.`,
        "assertive",
      );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "z-50" : ""}`}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          onKeyDown={handleKeyDown}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded touch-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Drag to reorder task: ${task.title}. Press Space or Enter to activate.`}
          disabled={disabled}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className={isDragging ? "opacity-50" : ""}>{children}</div>
    </div>
  );
}
