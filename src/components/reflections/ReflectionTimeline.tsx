import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import ReflectionCard from "./ReflectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import type { ReflectionWithRelations } from "@/types/reflections";

interface ReflectionTimelineProps {
  reflections: ReflectionWithRelations[];
  isLoading: boolean;
  workspaceId: string;
}

export default function ReflectionTimeline({
  reflections,
  isLoading,
}: ReflectionTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="text-center py-16 journey-card">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 journey-float" />
        <h3 className="text-xl font-semibold mb-2">No route adjustments yet</h3>
        <p className="text-muted-foreground mb-6">
          Reflect on your journey to gain clarity and adjust your path forward.
        </p>
      </div>
    );
  }

  // Group reflections by date category
  const groupedReflections = reflections.reduce(
    (acc, reflection) => {
      const date = new Date(reflection.reflection_date);
      let category: string;

      if (isToday(date)) {
        category = "Today";
      } else if (isYesterday(date)) {
        category = "Yesterday";
      } else if (isThisWeek(date)) {
        category = "This Week";
      } else {
        category = format(date, "MMMM yyyy");
      }

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(reflection);
      return acc;
    },
    {} as Record<string, ReflectionWithRelations[]>,
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedReflections).map(
        ([category, categoryReflections]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground sticky top-0 bg-background/95 backdrop-blur py-2">
              {category}
            </h2>
            <div className="space-y-4">
              {categoryReflections.map((reflection) => (
                <ReflectionCard key={reflection.id} reflection={reflection} />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
