import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface HierarchyBreadcrumbProps {
  taskId: string;
}

interface BreadcrumbTask {
  id: string;
  title: string;
  parent_task_id: string | null;
}

export function HierarchyBreadcrumb({ taskId }: HierarchyBreadcrumbProps) {
  const { data: breadcrumbs, isLoading } = useQuery({
    queryKey: ["task-breadcrumbs", taskId],
    queryFn: async () => {
      const path: BreadcrumbTask[] = [];
      let currentId: string | null = taskId;

      // Traverse up the parent chain
      while (currentId) {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, parent_task_id")
          .eq("id", currentId)
          .single();

        if (error || !data) break;

        path.unshift(data);
        currentId = data.parent_task_id;
      }

      return path;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-24" />
        <ChevronRight className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!breadcrumbs || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
      {breadcrumbs.map((task, index) => (
        <div key={task.id} className="flex items-center gap-2 shrink-0">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{task.title}</span>
          ) : (
            <Link
              to={`/tasks/${task.id}`}
              className="hover:text-foreground transition-colors"
            >
              {task.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
