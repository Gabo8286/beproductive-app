import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  MoreHorizontal,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Trash2,
  Edit3,
  Copy,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addDays,
  isSameWeek,
  startOfDay,
  endOfDay,
  addHours,
  setHours,
  setMinutes,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'task' | 'reminder' | 'focus' | 'break';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  attendees?: string[];
  color?: string;
  isAllDay?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

type CalendarView = 'month' | 'week' | 'day';

const eventTypeColors = {
  meeting: 'bg-blue-500',
  task: 'bg-green-500',
  reminder: 'bg-orange-500',
  focus: 'bg-purple-500',
  break: 'bg-gray-500',
};

const priorityColors = {
  high: 'border-red-500',
  medium: 'border-yellow-500',
  low: 'border-green-500',
};

// Sample events - in a real app, this would come from API/database
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team sync meeting',
    date: new Date(),
    startTime: setHours(setMinutes(new Date(), 0), 9),
    endTime: setHours(setMinutes(new Date(), 30), 9),
    type: 'meeting',
    priority: 'medium',
    location: 'Conference Room A',
    attendees: ['john@example.com', 'jane@example.com'],
    color: eventTypeColors.meeting,
  },
  {
    id: '2',
    title: 'Focus: Code Review',
    description: 'Deep work session for reviewing pull requests',
    date: new Date(),
    startTime: setHours(setMinutes(new Date(), 0), 14),
    endTime: setHours(setMinutes(new Date(), 0), 16),
    type: 'focus',
    priority: 'high',
    color: eventTypeColors.focus,
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    description: 'Annual checkup',
    date: addDays(new Date(), 1),
    startTime: setHours(setMinutes(addDays(new Date(), 1), 0), 16),
    endTime: setHours(setMinutes(addDays(new Date(), 1), 0), 17),
    type: 'reminder',
    priority: 'high',
    location: 'Medical Center',
    color: eventTypeColors.reminder,
  },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  // Filter events based on search and type
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, eventTypeFilter]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 7) : addDays(currentDate, -7));
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const getEventsForWeek = (startDate: Date) => {
    const weekStart = startOfWeek(startDate);
    const weekEnd = endOfWeek(startDate);
    return filteredEvents.filter(event =>
      event.date >= weekStart && event.date <= weekEnd
    );
  };

  const createEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title || 'New Event',
      description: eventData.description || '',
      date: eventData.date || selectedDate || new Date(),
      startTime: eventData.startTime || setHours(new Date(), 9),
      endTime: eventData.endTime || setHours(new Date(), 10),
      type: eventData.type || 'task',
      priority: eventData.priority || 'medium',
      location: eventData.location || '',
      attendees: eventData.attendees || [],
      color: eventTypeColors[eventData.type || 'task'],
      isAllDay: eventData.isAllDay || false,
      recurrence: eventData.recurrence || 'none',
    };

    setEvents([...events, newEvent]);
    toast.success('Event created successfully');
    setIsEventDialogOpen(false);
    setIsCreating(false);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast.success('Event deleted successfully');
    setSelectedEvent(null);
  };

  const duplicateEvent = (event: CalendarEvent) => {
    const duplicatedEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Copy)`,
      date: addDays(event.date, 1),
    };
    setEvents([...events, duplicatedEvent]);
    toast.success('Event duplicated successfully');
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-4">
        {/* Month Calendar Header */}
        <div className="grid grid-cols-7 gap-1">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Month Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  'min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                  isCurrentMonth ? 'bg-background hover:bg-accent/50' : 'bg-muted/30 text-muted-foreground',
                  isToday(day) && 'bg-primary/10 border-primary',
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-sm font-medium',
                    isToday(day) && 'text-primary font-bold'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80',
                        event.color
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setIsEventDialogOpen(true);
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-1">
          <div className="p-3"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-3 text-center">
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className={cn(
                'text-2xl font-bold mt-1',
                isToday(day) && 'text-primary'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-1 max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 text-right text-sm text-muted-foreground border-r">
                {format(setHours(new Date(), hour), 'HH:mm')}
              </div>
              {weekDays.map((day) => {
                const hourEvents = filteredEvents.filter(event =>
                  isSameDay(event.date, day) &&
                  event.startTime.getHours() === hour
                );

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[60px] p-1 border border-border/50 hover:bg-accent/30 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(day);
                      setIsCreating(true);
                      setIsEventDialogOpen(true);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs p-1 rounded text-white mb-1 cursor-pointer hover:opacity-80',
                          event.color
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsEventDialogOpen(true);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        {/* Day Header */}
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">
            {format(currentDate, 'EEEE')}
          </div>
          <div className="text-3xl font-bold mt-1">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>

        {/* Day Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => event.startTime.getHours() === hour);

            return (
              <div key={hour} className="flex border-b border-border/50">
                <div className="w-20 p-3 text-right text-sm text-muted-foreground border-r">
                  {format(setHours(new Date(), hour), 'HH:mm')}
                </div>
                <div
                  className="flex-1 min-h-[80px] p-2 hover:bg-accent/30 cursor-pointer"
                  onClick={() => {
                    setSelectedDate(currentDate);
                    setIsCreating(true);
                    setIsEventDialogOpen(true);
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'p-2 rounded text-white mb-2 cursor-pointer hover:opacity-80',
                        event.color
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setIsEventDialogOpen(true);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your schedule and events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedEvent(null);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <EventDialog
              event={selectedEvent}
              isCreating={isCreating}
              onSave={createEvent}
              onDelete={deleteEvent}
              onDuplicate={duplicateEvent}
              selectedDate={selectedDate}
            />
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-lg font-semibold">
            {view === 'month' && format(currentDate, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
            {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="reminder">Reminders</SelectItem>
              <SelectItem value="focus">Focus</SelectItem>
              <SelectItem value="break">Breaks</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8"
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'day' && renderDayView()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.length - filteredEvents.length} filtered out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsForDate(new Date()).length}</div>
            <p className="text-xs text-muted-foreground">
              scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsForWeek(new Date()).length}</div>
            <p className="text-xs text-muted-foreground">
              events this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.type === 'focus').length}
            </div>
            <p className="text-xs text-muted-foreground">
              focus sessions planned
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface EventDialogProps {
  event: CalendarEvent | null;
  isCreating: boolean;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (event: CalendarEvent) => void;
  selectedDate: Date | null;
}

function EventDialog({ event, isCreating, onSave, onDelete, onDuplicate, selectedDate }: EventDialogProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    location: '',
    isAllDay: false,
    date: selectedDate || new Date(),
    startTime: setHours(new Date(), 9),
    endTime: setHours(new Date(), 10),
  });

  useEffect(() => {
    if (event && !isCreating) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        location: '',
        isAllDay: false,
        date: selectedDate || new Date(),
        startTime: setHours(new Date(), 9),
        endTime: setHours(new Date(), 10),
      });
    }
  }, [event, isCreating, selectedDate]);

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error('Please enter a title for the event');
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isCreating ? 'Create Event' : 'Event Details'}
        </DialogTitle>
        <DialogDescription>
          {isCreating ? 'Add a new event to your calendar' : 'View and edit event details'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Event title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Event description (optional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: CalendarEvent['type']) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="focus">Focus Time</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: CalendarEvent['priority']) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Event location (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={format(formData.startTime || new Date(), 'HH:mm')}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newStartTime = setMinutes(setHours(new Date(), parseInt(hours)), parseInt(minutes));
                setFormData({ ...formData, startTime: newStartTime });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={format(formData.endTime || new Date(), 'HH:mm')}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newEndTime = setMinutes(setHours(new Date(), parseInt(hours)), parseInt(minutes));
                setFormData({ ...formData, endTime: newEndTime });
              }}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {!isCreating && event && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(event)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}