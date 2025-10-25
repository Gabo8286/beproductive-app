import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Database } from "@/integrations/supabase/types";
import { DragAndDropProvider } from "@/components/dnd/DragAndDropProvider";
import { DroppableArea } from "@/components/dnd/DroppableArea";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import {
  useMoveTaskToStatus,
  useUpdateTaskPositions,
} from "@/hooks/useDragAndDrop";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuickTaskInput } from "@/components/tasks/QuickTaskInput";
import { useSubtaskProgress } from "@/hooks/useSubtasks";
import { ProgressIndicator } from "@/components/tasks/ProgressIndicator";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface TaskBoardViewProps {
  tasks: Task[];
}

const statusColumns = [
  { id: "todo", title: "To Do", icon: "📋" },
  { id: "in_progress", title: "In Progress", icon: "⚡" },
  { id: "blocked", title: "Blocked", icon: "🚫" },
  { id: "done", title: "Done", icon: "✅" },
];

type TaskStatus = Database["public"]["Enums"]["task_status"];

function TaskCardWithProgress({ task }: { task: Task }) {
  return <TaskCard task={task} />;
}

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  const moveTaskToStatus = useMoveTaskToStatus();
  const updatePositions = useUpdateTaskPositions();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [showQuickCreate, setShowQuickCreate] = useState<string | null>(null);

  // Update local tasks when props change
  useState(() => {
    setLocalTasks(tasks);
  });

  const tasksByStatus = statusColumns.reduce(
    (acc, status) => {
      acc[status.id] = localTasks.filter((task) => task.status === status.id);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = localTasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id.toString();
    const overStatus = statusColumns.find((col) => col.id === overId);

    if (overStatus && activeTask.status !== overStatus.id) {
      // Optimistically update UI
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === activeTask.id ? { ...t, status: overStatus.id as any } : t,
        ),
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setLocalTasks(tasks); // Reset on failed drag
      return;
    }

    const activeTask = localTasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id.toString();

    // Check if dropped on a status column
    const overStatus = statusColumns.find((col) => col.id === overId);
    if (overStatus) {
      const tasksInStatus = tasksByStatus[overStatus.id] || [];
      const newPosition = tasksInStatus.length * 100;

      moveTaskToStatus.mutate({
        taskId: activeTask.id,
        newStatus: overStatus.id as any,
        newPosition,
      });
    } else {
      // Reordering within the same column
      const overTask = localTasks.find((t) => t.id === over.id);
      if (overTask && activeTask.status === overTask.status) {
        const statusTasks = tasksByStatus[activeTask.status] || [];
        const oldIndex = statusTasks.findIndex((t) => t.id === active.id);
        const newIndex = statusTasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = [...statusTasks];
          const [moved] = reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, moved);

          const updates = reordered.map((task, index) => ({
            id: task.id,
            position: index * 100,
          }));

          updatePositions.mutate(updates);
        }
      }
    }
  };

  return (
    <DragAndDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      overlay={
        <Card className="opacity-75 shadow-lg rotate-2">
          <CardContent className="p-4">
            <p className="text-sm font-medium">Moving task...</p>
          </CardContent>
        </Card>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => (
          <DroppableArea
            key={column.id}
            id={column.id}
            data={{ status: column.id }}
            className="h-full"
          >
            <Card className="h-fit min-h-[400px]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span>{column.icon}</span>
                  {column.title}
                  <Badge variant="secondary" className="ml-2">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setShowQuickCreate(
                      showQuickCreate === column.id ? null : column.id,
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Quick Create for this column */}
                {showQuickCreate === column.id && (
                  <QuickTaskInput
                    defaults={{ status: column.id as TaskStatus }}
                    onCancel={() => setShowQuickCreate(null)}
                    onSuccess={() => setShowQuickCreate(null)}
                    placeholder={`Quick task in ${column.title}...`}
                  />
                )}

                <SortableContext
                  items={tasksByStatus[column.id]?.map((t) => t.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {tasksByStatus[column.id]?.length > 0 ? (
                    tasksByStatus[column.id].map((task) => (
                      <TaskCardWithProgress key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="text-sm">No tasks</p>
                      <p className="text-xs mt-1">Drag tasks here</p>
                    </div>
                  )}
                </SortableContext>
              </CardContent>
            </Card>
          </DroppableArea>
        ))}
      </div>
    </DragAndDropProvider>
  );
}
