import { StickyNote, Plus } from "lucide-react";
import { BaseWidget } from "./BaseWidget";
import { WidgetActions } from "./WidgetActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuickTodos } from "@/hooks/useQuickTodos";
import { useCreateQuickTodo } from "@/hooks/useCreateQuickTodo";
import { useState } from "react";

export function NewQuickTodosWidget() {
  const [newNote, setNewNote] = useState("");
  const { data: quickTodos = [], isLoading, refetch } = useQuickTodos();
  const createQuickTodo = useCreateQuickTodo();

  const activeNotes = quickTodos.filter((todo) => !todo.completed_at);
  const recentNotes = activeNotes.slice(0, 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await createQuickTodo.mutateAsync({ content: newNote.trim() });
      setNewNote("");
    } catch (error) {
      console.error("Failed to create quick todo:", error);
    }
  };

  return (
    <BaseWidget
      title="Travel Notes"
      subtitle="Quick thoughts & reminders"
      icon={<StickyNote className="h-4 w-4" />}
      size="small"
      variant="glass"
      isLoading={isLoading}
      actions={
        <WidgetActions onRefresh={() => refetch()} isRefreshing={isLoading} />
      }
    >
      <div className="space-y-4">
        {/* Quick Add */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Quick note..."
            className="flex-1 h-8 text-sm focus-brand"
            maxLength={100}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newNote.trim() || createQuickTodo.isPending}
            className="h-8 w-8 p-0 apple-button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Active Notes Count */}
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {activeNotes.length}
          </div>
          <div className="text-xs text-muted-foreground">Active notes</div>
        </div>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="text-xs p-2 rounded bg-warning/10 border border-warning/20 text-foreground"
              >
                {note.content}
              </div>
            ))}
          </div>
        )}

        {activeNotes.length === 0 && (
          <div className="text-center py-4">
            <div className="text-xs text-muted-foreground">No notes yet</div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
