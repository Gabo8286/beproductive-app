import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RecurrencePattern,
  useUpcomingInstances,
} from "@/hooks/useRecurringTasks";

interface RecurrencePreviewProps {
  templateId?: string;
  pattern: RecurrencePattern;
}

export function RecurrencePreview({
  templateId,
  pattern,
}: RecurrencePreviewProps) {
  const { data: upcomingDates } = useUpcomingInstances(
    templateId || "preview",
    pattern,
  );

  if (!upcomingDates || upcomingDates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Next 5 Occurrences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {upcomingDates.map((date, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
