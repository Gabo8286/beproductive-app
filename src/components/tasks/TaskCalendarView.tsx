import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { TaskCard } from './TaskCard';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface TaskCalendarViewProps {
  tasks: Task[];
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task =>
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayTasks = getTasksForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      p-2 min-h-[80px] border rounded cursor-pointer transition-colors
                      ${isCurrentMonth ? 'hover:bg-accent' : 'text-muted-foreground'}
                      ${isToday(day) ? 'bg-primary/10 border-primary' : ''}
                      ${isSelected ? 'bg-accent border-accent-foreground' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className="text-xs p-1 bg-primary/20 rounded truncate"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
            </CardTitle>
            {selectedDate && (
              <Badge variant="secondary">
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map(task => (
                <div key={task.id} className="transform scale-95">
                  <TaskCard task={task} />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {selectedDate ? 'No tasks for this date' : 'Select a date to view tasks'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
