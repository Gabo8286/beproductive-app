import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateQuickTodo } from "@/hooks/quickTodos";

interface QuickTodoFormProps {
  autoFocus?: boolean;
  placeholder?: string;
  onSuccess?: () => void;
}

export function QuickTodoForm({
  autoFocus = false,
  placeholder = "What's on your mind?",
  onSuccess,
}: QuickTodoFormProps) {
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createQuickTodo = useCreateQuickTodo();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createQuickTodo.mutateAsync({
        content: content.trim(),
      });
      setContent("");
      setIsAdding(false);
      onSuccess?.();

      // Keep focus for quick multiple entries
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error("Failed to create quick todo:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setContent("");
      setIsAdding(false);
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsAdding(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={createQuickTodo.isPending}
          className="focus-brand transition-all duration-200 hover:border-warning/50"
          maxLength={500}
        />
      </div>
      {(isAdding || content.trim()) && (
        <Button
          type="submit"
          disabled={!content.trim() || createQuickTodo.isPending}
          className="apple-button shrink-0"
          size="default"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
