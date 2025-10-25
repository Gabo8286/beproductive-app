import { useState } from "react";
import { useSubtasks, useSubtaskProgress } from "@/hooks/useSubtasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { SubtaskCreator } from "@/components/tasks/SubtaskCreator";
import { ProgressIndicator } from "@/components/tasks/ProgressIndicator";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubtaskListProps {
  parentId: string;
  defaultExpanded?: boolean;
}

export function SubtaskList({
  parentId,
  defaultExpanded = true,
}: SubtaskListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { data: subtasks, isLoading } = useSubtasks(parentId);
  const { data: progress } = useSubtaskProgress(parentId);

  if (isLoading) {
    return (
      <div className="space-y-2 pl-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!subtasks || subtasks.length === 0) {
    return (
      <div className="pl-6">
        <SubtaskCreator parentId={parentId} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="ml-1 text-sm text-muted-foreground">
            {subtasks.length} {subtasks.length === 1 ? "subtask" : "subtasks"}
          </span>
        </Button>
        {progress && (
          <div className="flex-1 max-w-xs">
            <ProgressIndicator
              total={progress.total}
              completed={progress.completed}
              percentage={progress.percentage}
              size="sm"
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2 pl-6 border-l-2 border-border">
          {subtasks.map((subtask) => (
            <TaskCard key={subtask.id} task={subtask} />
          ))}
          <SubtaskCreator parentId={parentId} />
        </div>
      )}
    </div>
  );
}
