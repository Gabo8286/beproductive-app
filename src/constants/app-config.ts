// Application configuration constants

export interface TimerConfig {
  id: string;
  name: string;
  duration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

export const timerConfigs: TimerConfig[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  },
  {
    id: 'short',
    name: 'Short Focus',
    duration: 15,
    breakDuration: 3,
    longBreakDuration: 10,
    sessionsUntilLongBreak: 3
  },
  {
    id: 'long',
    name: 'Deep Focus',
    duration: 45,
    breakDuration: 10,
    longBreakDuration: 20,
    sessionsUntilLongBreak: 3
  },
  {
    id: 'custom',
    name: 'Custom',
    duration: 30,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  }
];

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  value: number; // 1-5 scale
}

export const moodOptions: MoodOption[] = [
  { id: 'terrible', label: 'Terrible', emoji: '😞', value: 1 },
  { id: 'bad', label: 'Bad', emoji: '😕', value: 2 },
  { id: 'okay', label: 'Okay', emoji: '😐', value: 3 },
  { id: 'good', label: 'Good', emoji: '😊', value: 4 },
  { id: 'excellent', label: 'Excellent', emoji: '😄', value: 5 }
];

export interface EnergyLevel {
  id: string;
  label: string;
  emoji: string;
  value: number; // 1-5 scale
}

export const energyLevels: EnergyLevel[] = [
  { id: 'exhausted', label: 'Exhausted', emoji: '😴', value: 1 },
  { id: 'tired', label: 'Tired', emoji: '😪', value: 2 },
  { id: 'normal', label: 'Normal', emoji: '😌', value: 3 },
  { id: 'energetic', label: 'Energetic', emoji: '😃', value: 4 },
  { id: 'high-energy', label: 'High Energy', emoji: '🚀', value: 5 }
];

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
}

export const notificationSettings: NotificationSetting[] = [
  {
    id: 'task-reminders',
    label: 'Task Reminders',
    description: 'Get notified about upcoming tasks and deadlines',
    defaultEnabled: true
  },
  {
    id: 'habit-tracking',
    label: 'Habit Tracking',
    description: 'Daily reminders for your habits',
    defaultEnabled: true
  },
  {
    id: 'goal-progress',
    label: 'Goal Progress',
    description: 'Weekly updates on your goal progress',
    defaultEnabled: false
  },
  {
    id: 'break-reminders',
    label: 'Break Reminders',
    description: 'Reminders to take breaks during work sessions',
    defaultEnabled: false
  }
];

export interface IntegrationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isPopular?: boolean;
}

export const integrationOptions: IntegrationOption[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync tasks and events with Google Calendar',
    icon: '📅',
    category: 'Calendar',
    isPopular: true
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get task notifications in Slack channels',
    icon: '💬',
    category: 'Communication',
    isPopular: true
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync tasks with your Notion workspace',
    icon: '📝',
    category: 'Productivity',
    isPopular: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Track issues and pull requests as tasks',
    icon: '🐙',
    category: 'Development'
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Import and sync Trello boards',
    icon: '📋',
    category: 'Project Management'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 1000+ apps via Zapier',
    icon: '⚡',
    category: 'Automation'
  }
];