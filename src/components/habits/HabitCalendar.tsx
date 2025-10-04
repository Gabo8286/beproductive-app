import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHabitCalendar } from "@/hooks/useHabitEntries";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";

interface HabitCalendarProps {
  habitId: string;
  month: Date;
  onMonthChange: (date: Date) => void;
}

export function HabitCalendar({
  habitId,
  month,
  onMonthChange,
}: HabitCalendarProps) {
  const { data: entries } = useHabitCalendar(habitId, month);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries?.find((e) => e.date === dateStr);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "skipped":
        return "bg-orange-500";
      case "missed":
        return "bg-red-500";
      case "partial":
        return "bg-yellow-500";
      default:
        return "bg-muted";
    }
  };

  const previousMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const entry = getEntryForDate(day);
            const today = isToday(day);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "aspect-square p-2 text-center rounded-lg border",
                  today && "border-primary",
                  !isSameMonth(day, month) && "opacity-50",
                )}
              >
                <div className="text-sm">{format(day, "d")}</div>
                {entry && (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mx-auto mt-1",
                      getStatusColor(entry.status),
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Skipped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>No entry</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
