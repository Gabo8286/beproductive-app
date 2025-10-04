import { useTimeEntries, useDeleteTimeEntry } from "@/hooks/useTimeTracking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { format } from "date-fns";

interface TimeEntriesListProps {
  taskId: string;
}

export function TimeEntriesList({ taskId }: TimeEntriesListProps) {
  const { data: entries, isLoading } = useTimeEntries(taskId);
  const deleteEntry = useDeleteTimeEntry();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading time entries...
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No time entries yet</p>
      </div>
    );
  }

  const totalDuration = entries.reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Time Entries</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-mono font-bold">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold">
                    {entry.duration ? formatTime(entry.duration) : "—"}
                  </span>
                  {entry.is_manual && (
                    <Badge variant="secondary" className="text-xs">
                      Manual
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {format(new Date(entry.start_time), "MMM d, yyyy • h:mm a")}
                    {entry.end_time &&
                      ` - ${format(new Date(entry.end_time), "h:mm a")}`}
                  </p>
                  {entry.description && (
                    <p className="text-foreground">{entry.description}</p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry.mutate(entry.id)}
                disabled={deleteEntry.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
