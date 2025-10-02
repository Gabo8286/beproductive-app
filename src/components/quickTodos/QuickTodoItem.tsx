import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit3, Trash2 } from "lucide-react";
import { QuickTodo } from "@/types/quickTodos";
import { useUpdateQuickTodo, useDeleteQuickTodo, useToggleQuickTodoCompletion } from "@/hooks/quickTodos";
import { cn } from "@/lib/utils";

interface QuickTodoItemProps {
  todo: QuickTodo;
  className?: string;
}

export function QuickTodoItem({ todo, className }: QuickTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateQuickTodo = useUpdateQuickTodo();
  const deleteQuickTodo = useDeleteQuickTodo();
  const toggleCompletion = useToggleQuickTodoCompletion();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditContent(todo.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;

    try {
      await updateQuickTodo.mutateAsync({
        id: todo.id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update quick todo:", error);
    }
  };

  const handleCancel = () => {
    setEditContent(todo.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleToggleCompletion = () => {
    toggleCompletion.mutate(todo.id);
  };

  const handleDelete = () => {
    deleteQuickTodo.mutate(todo.id);
  };

  return (
    <Card className={cn(
      "journey-progress apple-hover group transition-all duration-200",
      todo.completed_at && "bg-muted/50",
      className
    )}>
      <div className="flex items-center gap-3 p-4">
        {/* Completion Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCompletion}
          disabled={toggleCompletion.isPending}
          className={cn(
            "apple-button shrink-0 h-8 w-8 p-0 rounded-full",
            todo.completed_at 
              ? "bg-success text-success-foreground" 
              : "border-2 border-muted-foreground/30 hover:border-success"
          )}
        >
          {todo.completed_at && <Check className="h-4 w-4" />}
        </Button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="focus-brand -my-1"
              maxLength={500}
            />
          ) : (
            <div
              className={cn(
                "cursor-pointer transition-all duration-200",
                todo.completed_at && "line-through text-muted-foreground",
                "hover:text-foreground"
              )}
              onClick={handleEdit}
            >
              {todo.content}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={!editContent.trim() || updateQuickTodo.isPending}
                className="apple-button h-8 w-8 p-0 text-success"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="apple-button h-8 w-8 p-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="apple-button h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteQuickTodo.isPending}
                className="apple-button h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
