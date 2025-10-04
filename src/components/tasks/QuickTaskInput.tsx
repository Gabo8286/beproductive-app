import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import {
  useQuickCreateTask,
  useBatchCreateTasks,
  QuickTaskDefaults,
  parseMultilineInput,
} from "@/hooks/useQuickTask";
import { Textarea } from "@/components/ui/textarea";

interface QuickTaskInputProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  defaults?: QuickTaskDefaults;
  autoFocus?: boolean;
  placeholder?: string;
  batchMode?: boolean;
  className?: string;
}

export function QuickTaskInput({
  onCancel,
  onSuccess,
  defaults,
  autoFocus = true,
  placeholder = "Task title...",
  batchMode = false,
  className = "",
}: QuickTaskInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickCreate = useQuickCreateTask();
  const batchCreate = useBatchCreateTasks();

  useEffect(() => {
    if (autoFocus) {
      if (batchMode) {
        textareaRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [autoFocus, batchMode]);

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    if (batchMode) {
      const titles = parseMultilineInput(trimmedValue);
      if (titles.length === 0) return;

      await batchCreate.mutateAsync({ titles, defaults });
    } else {
      await quickCreate.mutateAsync({ title: trimmedValue, defaults });
    }

    setValue("");
    onSuccess?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !batchMode) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && batchMode) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      onCancel?.();
    }
  };

  const isLoading = quickCreate.isPending || batchCreate.isPending;

  return (
    <div
      className={`flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
    >
      {batchMode ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${placeholder}\nPress Ctrl+Enter to save, Esc to cancel`}
          className="min-h-[100px] resize-y"
          disabled={isLoading}
        />
      ) : (
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={isLoading}
        />
      )}

      <div className="flex gap-1 flex-shrink-0">
        <Button
          size="icon"
          variant="default"
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          className="h-10 w-10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setValue("");
            onCancel?.();
          }}
          disabled={isLoading}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
