import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuickTaskModal } from "./QuickTaskModal";
import { cn } from "@/lib/utils";

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
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50",
          "hover:scale-110 active:scale-95",
          "transition-all duration-200",
          "md:hidden", // Only show on mobile/tablet
          className,
        )}
        onClick={() => setIsModalOpen(true)}
        aria-label="Quick create task"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <QuickTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
