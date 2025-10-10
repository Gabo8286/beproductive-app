import React, { useState } from "react";
import { BaseWidget } from "./BaseWidget";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  type: "meeting" | "task" | "reminder";
}

export const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample events - in a real app, this would come from props or API
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Standup",
      time: "09:00",
      date: new Date().toISOString().split('T')[0],
      type: "meeting"
    },
    {
      id: "2",
      title: "Review Project Proposal",
      time: "14:30",
      date: new Date().toISOString().split('T')[0],
      type: "task"
    },
    {
      id: "3",
      title: "Doctor Appointment",
      time: "16:00",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "reminder"
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(event => event.date === today);
  const upcomingEvents = events.filter(event => event.date > today).slice(0, 3);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'task':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'reminder':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <BaseWidget
      title="Calendar"
      icon={<Calendar className="h-4 w-4" />}
    >
      <div className="space-y-4">
        {/* Mini Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{monthName}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Today's Events */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Today's Events
          </h4>
          {todayEvents.length > 0 ? (
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <Card key={event.id} className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(event.time)}</p>
                    </div>
                    <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No events today</p>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Upcoming
            </h4>
            <div className="space-y-1">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{event.title}</span>
                  <span className="text-muted-foreground ml-2">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Button */}
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add Event
        </Button>
      </div>
    </BaseWidget>
  );
};