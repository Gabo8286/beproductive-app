import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useReflections } from "@/hooks/useReflections";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateMoodScore } from "@/utils/reflections";
import { format, eachDayOfInterval, startOfYear, endOfYear } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MoodHeatmapProps {
  workspaceId: string;
  year?: number;
}

export default function MoodHeatmap({ workspaceId, year = new Date().getFullYear() }: MoodHeatmapProps) {
  const startDate = useMemo(() => format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd'), [year]);
  const endDate = useMemo(() => format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd'), [year]);
  
  const { data: reflections, isLoading } = useReflections(workspaceId, {
    date_from: startDate,
    date_to: endDate,
  });

  const heatmapData = useMemo(() => {
    if (!reflections) return [];

    const reflectionMap = new Map(
      reflections.map(r => [r.reflection_date, r])
    );

    const days = eachDayOfInterval({
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const reflection = reflectionMap.get(dateStr);
      
      return {
        date: dateStr,
        mood: reflection?.mood ? calculateMoodScore(reflection.mood) : null,
        hasReflection: !!reflection,
      };
    });
  }, [reflections, year]);

  const getMoodColor = (mood: number | null) => {
    if (mood === null) return 'bg-muted';
    if (mood >= 5.5) return 'bg-green-600';
    if (mood >= 4.5) return 'bg-green-400';
    if (mood >= 3.5) return 'bg-yellow-400';
    if (mood >= 2.5) return 'bg-orange-400';
    if (mood >= 1.5) return 'bg-red-400';
    return 'bg-red-600';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  // Group by weeks
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Mood Heatmap {year}</h3>
          <p className="text-sm text-muted-foreground">
            Your emotional journey throughout the year
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <TooltipProvider key={day.date}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm ${getMoodColor(day.mood)} ${
                            !day.hasReflection && 'opacity-30'
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{format(new Date(day.date), 'MMM dd, yyyy')}</p>
                          {day.hasReflection ? (
                            <p>Mood: {day.mood?.toFixed(1)}/6</p>
                          ) : (
                            <p>No reflection</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </div>
    </Card>
  );
}
