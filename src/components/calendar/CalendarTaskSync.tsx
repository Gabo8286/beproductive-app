import React, { useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Calendar, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'task' | 'reminder' | 'focus' | 'break';
  priority: 'high' | 'medium' | 'low';
  taskId?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  color?: string;
}

interface CalendarTaskSyncProps {
  onEventsUpdate?: (events: CalendarEvent[]) => void;
  selectedDate?: Date;
  syncEnabled?: boolean;
}

export function CalendarTaskSync({
  onEventsUpdate,
  selectedDate = new Date(),
  syncEnabled = true
}: CalendarTaskSyncProps) {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const queryClient = useQueryClient();
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load calendar settings
  const getCalendarSettings = () => {
    const savedSettings = localStorage.getItem('calendar_settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      integrations: {
        taskSync: {
          enabled: true,
          createEventsForTasks: true,
          syncCompletedTasks: false,
        },
      },
    };
  };

  // Convert tasks to calendar events
  const convertTasksToEvents = (taskList: any[]): CalendarEvent[] => {
    const settings = getCalendarSettings();
    const events: CalendarEvent[] = [];

    if (!settings.integrations.taskSync.enabled || !syncEnabled) {
      return events;
    }

    taskList.forEach(task => {
      // Skip completed tasks if setting is disabled
      if (task.status === 'completed' && !settings.integrations.taskSync.syncCompletedTasks) {
        return;
      }

      // Only create events for tasks with due dates
      if (!task.due_date) {
        return;
      }

      const dueDate = typeof task.due_date === 'string' ? parseISO(task.due_date) : task.due_date;

      // Estimate duration based on priority
      let duration = 60; // default 60 minutes
      if (task.priority === 'high') duration = 90;
      else if (task.priority === 'low') duration = 30;

      // Set start time based on task priority (morning for high priority)
      let startHour = 9; // default 9 AM
      if (task.priority === 'high') startHour = 9;
      else if (task.priority === 'medium') startHour = 14;
      else startHour = 16;

      const startTime = new Date(dueDate);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      const event: CalendarEvent = {
        id: `task-${task.id}`,
        title: task.title,
        description: task.description || '',
        date: dueDate,
        startTime,
        endTime,
        type: 'task',
        priority: task.priority || 'medium',
        taskId: task.id,
        status: task.status === 'completed' ? 'completed' :
                task.status === 'in_progress' ? 'in-progress' : 'planned',
        color: task.priority === 'high' ? 'bg-red-500' :
               task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500',
      };

      events.push(event);
    });

    return events;
  };

  // Sync tasks with calendar
  const syncTasksWithCalendar = async () => {
    if (!syncEnabled) return;

    setIsSyncing(true);
    try {
      const settings = getCalendarSettings();

      if (!settings.integrations.taskSync.enabled) {
        setIsSyncing(false);
        return;
      }

      // Get existing calendar events from localStorage
      const savedEvents = localStorage.getItem('calendar_events');
      const existingEvents = savedEvents ? JSON.parse(savedEvents) : [];

      // Filter out task-based events to avoid duplicates
      const nonTaskEvents = existingEvents.filter((e: CalendarEvent) => !e.taskId);

      // Convert current tasks to events
      const taskEvents = convertTasksToEvents(tasks || []);

      // Combine non-task events with new task events
      const allEvents = [...nonTaskEvents, ...taskEvents];

      // Save to localStorage
      localStorage.setItem('calendar_events', JSON.stringify(allEvents));

      // Update local state
      setLocalEvents(allEvents);

      // Notify parent component
      if (onEventsUpdate) {
        onEventsUpdate(allEvents);
      }

      toast.success(`Synced ${taskEvents.length} tasks to calendar`);
    } catch (error) {
      console.error('Error syncing tasks:', error);
      toast.error('Failed to sync tasks with calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when tasks change
  useEffect(() => {
    if (!tasksLoading && tasks && syncEnabled) {
      const settings = getCalendarSettings();
      if (settings.integrations.taskSync.enabled) {
        syncTasksWithCalendar();
      }
    }
  }, [tasks, tasksLoading, syncEnabled]);

  // Create task from calendar event
  const createTaskFromEvent = async (event: CalendarEvent) => {
    try {
      const newTask = {
        title: event.title,
        description: event.description || '',
        priority: event.priority,
        due_date: format(event.date, 'yyyy-MM-dd'),
        status: 'pending',
        tags: ['calendar-created'],
      };

      // Here you would typically call your task creation API
      // For now, we'll simulate it
      toast.success(`Task "${event.title}" created from calendar event`);

      // Refresh tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error creating task from event:', error);
      toast.error('Failed to create task from event');
    }
  };

  // Update task status from calendar
  const updateTaskFromEvent = async (event: CalendarEvent) => {
    if (!event.taskId) return;

    try {
      let newStatus = 'pending';
      if (event.status === 'completed') newStatus = 'completed';
      else if (event.status === 'in-progress') newStatus = 'in_progress';
      else if (event.status === 'cancelled') newStatus = 'cancelled';

      // Here you would typically call your task update API
      // For now, we'll simulate it
      toast.success(`Task status updated to ${newStatus}`);

      // Refresh tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return localEvents.filter(event => {
      const eventDate = event.date;
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };

  // Public API for parent components
  const calendarTaskSync = {
    syncNow: syncTasksWithCalendar,
    createTaskFromEvent,
    updateTaskFromEvent,
    getEventsForDate,
    isSyncing,
    events: localEvents,
  };

  // Export sync utilities
  return calendarTaskSync;
}

// Hook for using calendar-task sync functionality
export function useCalendarTaskSync(options?: {
  autoSync?: boolean;
  selectedDate?: Date;
}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const sync = CalendarTaskSync({
    onEventsUpdate: setEvents,
    selectedDate: options?.selectedDate,
    syncEnabled: options?.autoSync !== false,
  });

  return {
    ...sync,
    events,
  };
}

// Utility functions for calendar-task integration
export const calendarTaskUtils = {
  // Check if a task should be shown in calendar
  shouldShowInCalendar: (task: any): boolean => {
    const settings = JSON.parse(localStorage.getItem('calendar_settings') || '{}');

    if (!settings.integrations?.taskSync?.enabled) {
      return false;
    }

    // Must have a due date
    if (!task.due_date) {
      return false;
    }

    // Check if completed tasks should be shown
    if (task.status === 'completed' && !settings.integrations?.taskSync?.syncCompletedTasks) {
      return false;
    }

    return true;
  },

  // Get suggested time slot for a task
  getSuggestedTimeSlot: (task: any, existingEvents: CalendarEvent[]): { start: Date; end: Date } | null => {
    if (!task.due_date) return null;

    const dueDate = typeof task.due_date === 'string' ? parseISO(task.due_date) : task.due_date;

    // Priority-based scheduling
    const startHours = {
      high: 9,    // Morning for high priority
      medium: 14, // Afternoon for medium
      low: 16,    // Late afternoon for low
    };

    const durations = {
      high: 90,   // 1.5 hours for high priority
      medium: 60, // 1 hour for medium
      low: 30,    // 30 minutes for low
    };

    const priority = task.priority || 'medium';
    const startHour = startHours[priority as keyof typeof startHours];
    const duration = durations[priority as keyof typeof durations];

    const suggestedStart = new Date(dueDate);
    suggestedStart.setHours(startHour, 0, 0, 0);

    const suggestedEnd = new Date(suggestedStart);
    suggestedEnd.setMinutes(suggestedEnd.getMinutes() + duration);

    // Check for conflicts
    const hasConflict = existingEvents.some(event => {
      const eventStart = event.startTime;
      const eventEnd = event.endTime;

      return (
        (suggestedStart >= eventStart && suggestedStart < eventEnd) ||
        (suggestedEnd > eventStart && suggestedEnd <= eventEnd) ||
        (suggestedStart <= eventStart && suggestedEnd >= eventEnd)
      );
    });

    if (hasConflict) {
      // Find next available slot
      let nextStart = new Date(suggestedStart);
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        nextStart.setHours(nextStart.getHours() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setMinutes(nextEnd.getMinutes() + duration);

        const stillHasConflict = existingEvents.some(event => {
          const eventStart = event.startTime;
          const eventEnd = event.endTime;

          return (
            (nextStart >= eventStart && nextStart < eventEnd) ||
            (nextEnd > eventStart && nextEnd <= eventEnd) ||
            (nextStart <= eventStart && nextEnd >= eventEnd)
          );
        });

        if (!stillHasConflict && nextStart.getHours() < 18) {
          return { start: nextStart, end: nextEnd };
        }

        attempts++;
      }

      // If no slot found, return original suggestion anyway
    }

    return { start: suggestedStart, end: suggestedEnd };
  },

  // Get task statistics for calendar view
  getTaskStatistics: (tasks: any[], date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = typeof task.due_date === 'string' ? parseISO(task.due_date) : task.due_date;
      return taskDate >= dayStart && taskDate <= dayEnd;
    });

    return {
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'completed').length,
      pending: dayTasks.filter(t => t.status === 'pending').length,
      inProgress: dayTasks.filter(t => t.status === 'in_progress').length,
      highPriority: dayTasks.filter(t => t.priority === 'high').length,
      estimatedHours: dayTasks.reduce((total, task) => {
        const duration = task.priority === 'high' ? 1.5 :
                        task.priority === 'medium' ? 1 : 0.5;
        return total + duration;
      }, 0),
    };
  },

  // Format task for calendar display
  formatTaskForCalendar: (task: any): string => {
    const priority = task.priority === 'high' ? '🔴' :
                    task.priority === 'medium' ? '🟡' : '🟢';
    const status = task.status === 'completed' ? '✅' :
                   task.status === 'in_progress' ? '⏳' : '📋';

    return `${priority} ${status} ${task.title}`;
  },
};