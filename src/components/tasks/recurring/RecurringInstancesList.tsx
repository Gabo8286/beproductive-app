import { useRecurringInstances } from "@/hooks/useRecurringTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface RecurringInstancesListProps {
  templateId: string;
}

export function RecurringInstancesList({
  templateId,
}: RecurringInstancesListProps) {
  const { data: instances, isLoading } = useRecurringInstances(templateId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No instances generated yet</p>
        <p className="text-xs mt-1">Instances will be created automatically</p>
      </div>
    );
  }

  // Group by month
  const groupedInstances = instances.reduce(
    (acc, instance) => {
      if (!instance.instance_date) return acc;

      const monthKey = format(new Date(instance.instance_date), "MMMM yyyy");
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(instance);
      return acc;
    },
    {} as Record<string, typeof instances>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedInstances).map(([month, monthInstances]) => (
        <div key={month} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {month}
          </h3>
          <div className="space-y-2">
            {monthInstances.map((instance) => (
              <div key={instance.id} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                <div className="pl-4">
                  <TaskCard task={instance} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
