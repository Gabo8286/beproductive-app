import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Calendar,
  Clock,
  Bell,
  Palette,
  Globe,
  Link2,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Zap,
  Users,
  Mail,
  Smartphone,
  AlertCircle,
  Check,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CalendarSettings {
  general: {
    defaultView: 'month' | 'week' | 'day';
    weekStartsOn: number; // 0 = Sunday, 1 = Monday
    timeFormat: '12h' | '24h';
    dateFormat: string;
    defaultEventDuration: number; // in minutes
    workingHours: {
      start: string;
      end: string;
    };
    weekendDays: number[];
    timezone: string;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    eventColors: Record<string, string>;
    showWeekNumbers: boolean;
    showDeclinedEvents: boolean;
    showCompletedTasks: boolean;
    compactMode: boolean;
    showEventTimes: boolean;
    showEventDescriptions: boolean;
  };
  notifications: {
    enabled: boolean;
    defaultReminder: number; // minutes before
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    reminderTypes: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    eventTypes: {
      meetings: boolean;
      tasks: boolean;
      reminders: boolean;
      focusTime: boolean;
    };
  };
  integrations: {
    googleCalendar: {
      enabled: boolean;
      syncInterval: number; // minutes
      calendars: string[];
    };
    outlook: {
      enabled: boolean;
      syncInterval: number;
      calendars: string[];
    };
    ical: {
      enabled: boolean;
      url: string;
    };
    taskSync: {
      enabled: boolean;
      createEventsForTasks: boolean;
      syncCompletedTasks: boolean;
    };
  };
  privacy: {
    shareCalendar: boolean;
    publicProfile: boolean;
    showBusyStatus: boolean;
    allowInvites: boolean;
    blockList: string[];
  };
  productivity: {
    pomodoroIntegration: boolean;
    timeBlockingEnabled: boolean;
    autoScheduleTasks: boolean;
    bufferTime: number; // minutes between events
    focusTimeProtection: boolean;
    meetingLimits: {
      enabled: boolean;
      maxPerDay: number;
      maxDuration: number; // minutes
    };
  };
}

const DEFAULT_SETTINGS: CalendarSettings = {
  general: {
    defaultView: 'month',
    weekStartsOn: 1,
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    defaultEventDuration: 60,
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    weekendDays: [0, 6], // Sunday and Saturday
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  display: {
    theme: 'system',
    eventColors: {
      meeting: '#3B82F6',
      task: '#10B981',
      reminder: '#F59E0B',
      focus: '#8B5CF6',
      break: '#6B7280',
    },
    showWeekNumbers: false,
    showDeclinedEvents: false,
    showCompletedTasks: true,
    compactMode: false,
    showEventTimes: true,
    showEventDescriptions: true,
  },
  notifications: {
    enabled: true,
    defaultReminder: 15,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    reminderTypes: {
      email: false,
      push: true,
      inApp: true,
    },
    eventTypes: {
      meetings: true,
      tasks: true,
      reminders: true,
      focusTime: true,
    },
  },
  integrations: {
    googleCalendar: {
      enabled: false,
      syncInterval: 30,
      calendars: [],
    },
    outlook: {
      enabled: false,
      syncInterval: 30,
      calendars: [],
    },
    ical: {
      enabled: false,
      url: '',
    },
    taskSync: {
      enabled: true,
      createEventsForTasks: true,
      syncCompletedTasks: false,
    },
  },
  privacy: {
    shareCalendar: false,
    publicProfile: false,
    showBusyStatus: true,
    allowInvites: true,
    blockList: [],
  },
  productivity: {
    pomodoroIntegration: true,
    timeBlockingEnabled: true,
    autoScheduleTasks: false,
    bufferTime: 15,
    focusTimeProtection: true,
    meetingLimits: {
      enabled: false,
      maxPerDay: 5,
      maxDuration: 60,
    },
  },
};

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const EVENT_TYPES = [
  { id: 'meeting', label: 'Meetings', icon: Users, color: '#3B82F6' },
  { id: 'task', label: 'Tasks', icon: Check, color: '#10B981' },
  { id: 'reminder', label: 'Reminders', icon: Bell, color: '#F59E0B' },
  { id: 'focus', label: 'Focus Time', icon: Zap, color: '#8B5CF6' },
  { id: 'break', label: 'Breaks', icon: Clock, color: '#6B7280' },
];

export default function CalendarSettings() {
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('calendar_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load calendar settings:', error);
      }
    }
  }, []);

  // Track changes
  useEffect(() => {
    const savedSettings = localStorage.getItem('calendar_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(parsed));
    } else {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS));
    }
  }, [settings]);

  const updateSettings = (category: keyof CalendarSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('calendar_settings', JSON.stringify(settings));

      // Apply theme immediately
      if (settings.display.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.display.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Request notification permissions if enabled
      if (settings.notifications.enabled && settings.notifications.pushNotifications) {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      toast.success('Calendar settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success('Settings reset to defaults');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `calendar-settings-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Settings exported successfully');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings({ ...DEFAULT_SETTINGS, ...imported });
        toast.success('Settings imported successfully');
        setIsImportDialogOpen(false);
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar Settings</h1>
            <p className="text-muted-foreground">
              Customize your calendar experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved changes
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic calendar preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select
                    value={settings.general.defaultView}
                    onValueChange={(value: 'month' | 'week' | 'day') =>
                      updateSettings('general', { defaultView: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month View</SelectItem>
                      <SelectItem value="week">Week View</SelectItem>
                      <SelectItem value="day">Day View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekStartsOn">Week Starts On</Label>
                  <Select
                    value={settings.general.weekStartsOn.toString()}
                    onValueChange={(value) =>
                      updateSettings('general', { weekStartsOn: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={settings.general.timeFormat}
                    onValueChange={(value: '12h' | '24h') =>
                      updateSettings('general', { timeFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) =>
                      updateSettings('general', { dateFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultEventDuration">Default Event Duration (minutes)</Label>
                  <Input
                    id="defaultEventDuration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={settings.general.defaultEventDuration}
                    onChange={(e) =>
                      updateSettings('general', { defaultEventDuration: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      updateSettings('general', { timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Working Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workStart">Start Time</Label>
                    <Input
                      id="workStart"
                      type="time"
                      value={settings.general.workingHours.start}
                      onChange={(e) =>
                        updateSettings('general', {
                          workingHours: {
                            ...settings.general.workingHours,
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workEnd">End Time</Label>
                    <Input
                      id="workEnd"
                      type="time"
                      value={settings.general.workingHours.end}
                      onChange={(e) =>
                        updateSettings('general', {
                          workingHours: {
                            ...settings.general.workingHours,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Weekend Days</h4>
                <div className="flex gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Button
                      key={day}
                      variant={settings.general.weekendDays.includes(index) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const weekendDays = settings.general.weekendDays.includes(index)
                          ? settings.general.weekendDays.filter(d => d !== index)
                          : [...settings.general.weekendDays, index];
                        updateSettings('general', { weekendDays });
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how your calendar looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Theme</h4>
                <div className="flex gap-2">
                  <Button
                    variant={settings.display.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings('display', { theme: 'light' })}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={settings.display.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings('display', { theme: 'dark' })}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={settings.display.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings('display', { theme: 'system' })}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Event Colors</h4>
                <div className="space-y-3">
                  {EVENT_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <div key={type.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border cursor-pointer"
                            style={{ backgroundColor: settings.display.eventColors[type.id] }}
                          />
                          <Input
                            type="color"
                            value={settings.display.eventColors[type.id]}
                            onChange={(e) =>
                              updateSettings('display', {
                                eventColors: {
                                  ...settings.display.eventColors,
                                  [type.id]: e.target.value,
                                },
                              })
                            }
                            className="w-20"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Display Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showWeekNumbers">Show Week Numbers</Label>
                    <Switch
                      id="showWeekNumbers"
                      checked={settings.display.showWeekNumbers}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { showWeekNumbers: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDeclinedEvents">Show Declined Events</Label>
                    <Switch
                      id="showDeclinedEvents"
                      checked={settings.display.showDeclinedEvents}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { showDeclinedEvents: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
                    <Switch
                      id="showCompletedTasks"
                      checked={settings.display.showCompletedTasks}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { showCompletedTasks: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <Switch
                      id="compactMode"
                      checked={settings.display.compactMode}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { compactMode: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showEventTimes">Show Event Times</Label>
                    <Switch
                      id="showEventTimes"
                      checked={settings.display.showEventTimes}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { showEventTimes: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showEventDescriptions">Show Event Descriptions</Label>
                    <Switch
                      id="showEventDescriptions"
                      checked={settings.display.showEventDescriptions}
                      onCheckedChange={(checked) =>
                        updateSettings('display', { showEventDescriptions: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive calendar alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for upcoming events
                  </p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings('notifications', { enabled: checked })
                  }
                />
              </div>

              {settings.notifications.enabled && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultReminder">Default Reminder (minutes before)</Label>
                      <Select
                        value={settings.notifications.defaultReminder.toString()}
                        onValueChange={(value) =>
                          updateSettings('notifications', { defaultReminder: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">1 day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Channels</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) =>
                            updateSettings('notifications', { emailNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) =>
                            updateSettings('notifications', { pushNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          <Label htmlFor="soundEnabled">Sound Alerts</Label>
                        </div>
                        <Switch
                          id="soundEnabled"
                          checked={settings.notifications.soundEnabled}
                          onCheckedChange={(checked) =>
                            updateSettings('notifications', { soundEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Event Type Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.notifications.eventTypes).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Label htmlFor={`notify-${type}`} className="capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={`notify-${type}`}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              updateSettings('notifications', {
                                eventTypes: {
                                  ...settings.notifications.eventTypes,
                                  [type]: checked,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integrations</CardTitle>
              <CardDescription>
                Connect with external calendars and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Calendar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Google Calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with your Google calendars
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.integrations.googleCalendar.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings('integrations', {
                        googleCalendar: {
                          ...settings.integrations.googleCalendar,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>
                {settings.integrations.googleCalendar.enabled && (
                  <Button variant="outline" className="w-full">
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect Google Account
                  </Button>
                )}
              </div>

              <Separator />

              {/* Outlook */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Outlook Calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with Microsoft Outlook
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.integrations.outlook.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings('integrations', {
                        outlook: {
                          ...settings.integrations.outlook,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>
                {settings.integrations.outlook.enabled && (
                  <Button variant="outline" className="w-full">
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect Outlook Account
                  </Button>
                )}
              </div>

              <Separator />

              {/* Task Sync */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Task Integration</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taskSyncEnabled">Enable Task Sync</Label>
                    <Switch
                      id="taskSyncEnabled"
                      checked={settings.integrations.taskSync.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('integrations', {
                          taskSync: {
                            ...settings.integrations.taskSync,
                            enabled: checked,
                          },
                        })
                      }
                    />
                  </div>
                  {settings.integrations.taskSync.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="createEventsForTasks">Create Calendar Events for Tasks</Label>
                        <Switch
                          id="createEventsForTasks"
                          checked={settings.integrations.taskSync.createEventsForTasks}
                          onCheckedChange={(checked) =>
                            updateSettings('integrations', {
                              taskSync: {
                                ...settings.integrations.taskSync,
                                createEventsForTasks: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="syncCompletedTasks">Sync Completed Tasks</Label>
                        <Switch
                          id="syncCompletedTasks"
                          checked={settings.integrations.taskSync.syncCompletedTasks}
                          onCheckedChange={(checked) =>
                            updateSettings('integrations', {
                              taskSync: {
                                ...settings.integrations.taskSync,
                                syncCompletedTasks: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see and interact with your calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="shareCalendar">Share Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your calendar
                    </p>
                  </div>
                  <Switch
                    id="shareCalendar"
                    checked={settings.privacy.shareCalendar}
                    onCheckedChange={(checked) =>
                      updateSettings('privacy', { shareCalendar: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="publicProfile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={settings.privacy.publicProfile}
                    onCheckedChange={(checked) =>
                      updateSettings('privacy', { publicProfile: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="showBusyStatus">Show Busy Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're busy
                    </p>
                  </div>
                  <Switch
                    id="showBusyStatus"
                    checked={settings.privacy.showBusyStatus}
                    onCheckedChange={(checked) =>
                      updateSettings('privacy', { showBusyStatus: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="allowInvites">Allow Event Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive calendar invitations from others
                    </p>
                  </div>
                  <Switch
                    id="allowInvites"
                    checked={settings.privacy.allowInvites}
                    onCheckedChange={(checked) =>
                      updateSettings('privacy', { allowInvites: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productivity Settings */}
        <TabsContent value="productivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Settings</CardTitle>
              <CardDescription>
                Optimize your calendar for maximum productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="pomodoroIntegration">Pomodoro Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Show Pomodoro sessions in calendar
                    </p>
                  </div>
                  <Switch
                    id="pomodoroIntegration"
                    checked={settings.productivity.pomodoroIntegration}
                    onCheckedChange={(checked) =>
                      updateSettings('productivity', { pomodoroIntegration: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="timeBlockingEnabled">Time Blocking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable time blocking features
                    </p>
                  </div>
                  <Switch
                    id="timeBlockingEnabled"
                    checked={settings.productivity.timeBlockingEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings('productivity', { timeBlockingEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoScheduleTasks">Auto-Schedule Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically find time for tasks
                    </p>
                  </div>
                  <Switch
                    id="autoScheduleTasks"
                    checked={settings.productivity.autoScheduleTasks}
                    onCheckedChange={(checked) =>
                      updateSettings('productivity', { autoScheduleTasks: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="focusTimeProtection">Focus Time Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Block meetings during focus time
                    </p>
                  </div>
                  <Switch
                    id="focusTimeProtection"
                    checked={settings.productivity.focusTimeProtection}
                    onCheckedChange={(checked) =>
                      updateSettings('productivity', { focusTimeProtection: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Buffer Time Between Events (minutes)</Label>
                  <Select
                    value={settings.productivity.bufferTime.toString()}
                    onValueChange={(value) =>
                      updateSettings('productivity', { bufferTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="meetingLimitsEnabled">Meeting Limits</Label>
                    <p className="text-sm text-muted-foreground">
                      Set daily limits for meetings
                    </p>
                  </div>
                  <Switch
                    id="meetingLimitsEnabled"
                    checked={settings.productivity.meetingLimits.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings('productivity', {
                        meetingLimits: {
                          ...settings.productivity.meetingLimits,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                {settings.productivity.meetingLimits.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxMeetingsPerDay">Max Meetings Per Day</Label>
                      <Input
                        id="maxMeetingsPerDay"
                        type="number"
                        min="1"
                        max="20"
                        value={settings.productivity.meetingLimits.maxPerDay}
                        onChange={(e) =>
                          updateSettings('productivity', {
                            meetingLimits: {
                              ...settings.productivity.meetingLimits,
                              maxPerDay: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxMeetingDuration">Max Duration (minutes)</Label>
                      <Input
                        id="maxMeetingDuration"
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        value={settings.productivity.meetingLimits.maxDuration}
                        onChange={(e) =>
                          updateSettings('productivity', {
                            meetingLimits: {
                              ...settings.productivity.meetingLimits,
                              maxDuration: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Import / Export Settings</CardTitle>
          <CardDescription>
            Backup or transfer your calendar settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Settings</DialogTitle>
                  <DialogDescription>
                    Select a settings file to import
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                  />
                  <div className="text-sm text-muted-foreground">
                    Select a JSON file exported from Calendar Settings
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}