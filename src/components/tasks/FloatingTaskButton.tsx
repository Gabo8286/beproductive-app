import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/z-index";

interface FloatingTaskButtonProps {
  className?: string;
}

export function FloatingTaskButton({ className }: FloatingTaskButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className={cn(
          "fixed h-14 w-14 rounded-full shadow-xl",
          "hover:scale-110 active:scale-95",
          "transition-all duration-200",
          "md:hidden", // Only show on mobile/tablet
          // Staggered positioning to avoid overlap with main FAB
          "bottom-6 right-24",
          className,
        )}
        style={{ zIndex: Z_INDEX.FLOATING_BUTTON - 1 }}
        onClick={() => setIsModalOpen(true)}
        aria-label="Quick create task"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <QuickTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
