import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHabitEntries } from "@/hooks/useHabitEntries";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HabitHeatmapProps {
  habitId: string;
  habitTitle: string;
}

export function HabitHeatmap({ habitId, habitTitle }: HabitHeatmapProps) {
  const [year, setYear] = useState(new Date().getFullYear());

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));

  const { data: entries } = useHabitEntries(
    habitId,
    format(yearStart, "yyyy-MM-dd"),
    format(yearEnd, "yyyy-MM-dd"),
  );

  const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries?.find((e) => e.date === dateStr);
  };

  const getIntensityLevel = (status?: string): 0 | 1 | 2 | 3 | 4 => {
    switch (status) {
      case "completed":
        return 4;
      case "partial":
        return 2;
      case "skipped":
        return 1;
      case "missed":
        return 1;
      default:
        return 0;
    }
  };

  const getIntensityColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-orange-200 dark:bg-orange-900";
      case 2:
        return "bg-orange-300 dark:bg-orange-700";
      case 3:
        return "bg-orange-400 dark:bg-orange-600";
      case 4:
        return "bg-orange-500 dark:bg-orange-500";
    }
  };

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Pad beginning of year to start on Sunday
  const firstDayOfWeek = getDay(days[0]);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)); // Placeholder
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (getDay(day) === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const stats = {
    totalDays: days.length,
    completed: entries?.filter((e) => e.status === "completed").length || 0,
    rate: entries?.length
      ? (
          (entries.filter((e) => e.status === "completed").length /
            days.length) *
          100
        ).toFixed(1)
      : "0.0",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Heatmap</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setYear(year - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">{year}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setYear(year + 1)}
              disabled={year >= new Date().getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{stats.completed} completions</span>
          <span>{stats.rate}% completion rate</span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex mb-2">
              <div className="w-6" />
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month, i) => (
                <div
                  key={month}
                  className="flex-1 text-xs text-muted-foreground text-center"
                >
                  {i % 2 === 0 ? month : ""}
                </div>
              ))}
            </div>

            {/* Day labels */}
            <div className="flex">
              <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
                <div className="h-3">Sun</div>
                <div className="h-3"></div>
                <div className="h-3">Tue</div>
                <div className="h-3"></div>
                <div className="h-3">Thu</div>
                <div className="h-3"></div>
                <div className="h-3">Sat</div>
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      if (day.getTime() === 0) {
                        return <div key={dayIndex} className="w-3 h-3" />;
                      }

                      const entry = getEntryForDate(day);
                      const level = getIntensityLevel(entry?.status);
                      const isToday =
                        format(day, "yyyy-MM-dd") ===
                        format(new Date(), "yyyy-MM-dd");

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125",
                                getIntensityColor(level),
                                isToday && "ring-2 ring-primary",
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold">
                                {format(day, "MMM dd, yyyy")}
                              </div>
                              {entry ? (
                                <div className="mt-1">
                                  Status: {entry.status}
                                  {entry.notes && (
                                    <div className="text-muted-foreground">
                                      {entry.notes}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  No entry
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    getIntensityColor(level as 0 | 1 | 2 | 3 | 4),
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
