import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { ReflectionWithRelations } from "@/types/reflections";

interface ReflectionCalendarProps {
  reflections: ReflectionWithRelations[];
  workspaceId: string;
}

export default function ReflectionCalendar({
  reflections,
}: ReflectionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week offset
  const firstDayOfWeek = monthStart.getDay();

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const getReflectionForDate = (date: Date) => {
    return reflections.find((r) =>
      isSameDay(new Date(r.reflection_date), date),
    );
  };

  const getMoodColor = (mood?: string) => {
    const colors = {
      amazing: "bg-purple-500",
      great: "bg-green-500",
      good: "bg-blue-500",
      neutral: "bg-gray-500",
      bad: "bg-orange-500",
      terrible: "bg-red-500",
    };
    return mood ? colors[mood as keyof typeof colors] : "bg-muted";
  };

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days of month */}
        {daysInMonth.map((date) => {
          const reflection = getReflectionForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toString()}
              className={cn(
                "aspect-square p-2 rounded-lg relative transition-all hover:scale-105",
                isCurrentDay && "ring-2 ring-primary",
                reflection ? "cursor-pointer" : "cursor-default",
              )}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, "d")}
              </div>

              {reflection && (
                <div className="space-y-1">
                  <div
                    className={cn(
                      "h-2 w-full rounded-full",
                      getMoodColor(reflection.mood),
                    )}
                  />
                  <div className="text-[10px] text-muted-foreground line-clamp-2">
                    {reflection.title}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium mb-3">Mood Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span>Amazing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Great</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span>Bad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Terrible</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
