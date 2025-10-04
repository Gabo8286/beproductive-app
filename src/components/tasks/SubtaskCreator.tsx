import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useCreateSubtask } from "@/hooks/useSubtasks";

interface SubtaskCreatorProps {
  parentId: string;
}

export function SubtaskCreator({ parentId }: SubtaskCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const createSubtask = useCreateSubtask();

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createSubtask.mutateAsync({
      parentId,
      taskData: {
        title: title.trim(),
        status: "todo",
        priority: "medium",
        tags: [],
      },
    });

    setTitle("");
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setTitle("");
    }
  };

  if (!isCreating) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCreating(true)}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add subtask
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Subtask title..."
        className="flex-1"
        autoFocus
      />
      <Button
        size="sm"
        onClick={handleCreate}
        disabled={!title.trim() || createSubtask.isPending}
      >
        Add
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setIsCreating(false);
          setTitle("");
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
