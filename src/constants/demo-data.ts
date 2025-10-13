// Demo data and sample configurations for components
import { FileText, Target, CheckSquare, MessageCircle, Zap, FolderOpen, RotateCcw, Tag, Lightbulb } from 'lucide-react';

export interface QuickAddItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

export const quickAddItems: QuickAddItem[] = [
  {
    id: 'notes',
    label: 'Note',
    icon: FileText,
    href: '/notes',
    description: 'Capture thoughts quickly',
  },
  {
    id: 'goals',
    label: 'Goal',
    icon: Target,
    href: '/goals/new',
    description: 'Set a new objective',
  },
  {
    id: 'tasks',
    label: 'Task',
    icon: CheckSquare,
    href: '/tasks',
    description: 'Add to your todo list',
  },
  {
    id: 'reflections',
    label: 'Journal',
    icon: MessageCircle,
    href: '/reflections',
    description: 'Daily journaling & insights',
  },
  {
    id: 'quick-todos',
    label: 'Quick Idea',
    icon: Zap,
    href: '/quick-todos',
    description: 'Rapid idea capture',
  },
  {
    id: 'projects',
    label: 'Project',
    icon: FolderOpen,
    href: '/projects',
    description: 'Start something new',
  },
  {
    id: 'habits',
    label: 'Habit',
    icon: RotateCcw,
    href: '/habits',
    description: 'Build a routine',
  },
  {
    id: 'tags',
    label: 'Tag',
    icon: Tag,
    href: '/tags',
    description: 'Create organization',
  },
  {
    id: 'ideas',
    label: 'Idea',
    icon: Lightbulb,
    href: '/notes',
    description: 'Brainstorm & innovate',
  },
];

export interface RecentCapture {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  content: string;
}

export const sampleRecentCaptures: RecentCapture[] = [
  { id: '1', type: 'idea', title: 'Implement dark mode', timestamp: '2 minutes ago', content: 'Users have been requesting a dark theme option' },
  { id: '2', type: 'task', title: 'Update documentation', timestamp: '15 minutes ago', content: 'Add new API endpoints to developer docs' },
  { id: '3', type: 'note', title: 'Meeting notes', timestamp: '1 hour ago', content: 'Discussed project timeline and milestones' },
  { id: '4', type: 'goal', title: 'Increase performance', timestamp: '3 hours ago', content: 'Optimize loading times by 50%' }
];

export interface MockProject {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  icon: string;
  progress: number;
  tasks: number;
  dueDate: string;
}

export const sampleProjects: MockProject[] = [
  {
    id: 'project-1',
    title: 'Website Redesign',
    description: 'Modernize the company website',
    status: 'in_progress',
    priority: 'high',
    icon: '🌐',
    progress: 65,
    tasks: 12,
    dueDate: 'Feb 15'
  },
  {
    id: 'project-2',
    title: 'Mobile App Development',
    description: 'Build a mobile companion app',
    status: 'planning',
    priority: 'medium',
    icon: '📱',
    progress: 25,
    tasks: 8,
    dueDate: 'Mar 30'
  }
];

export interface MockTask {
  id: string;
  title: string;
  project: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

export const sampleTasks: MockTask[] = [
  { id: 'task-1', title: 'Design homepage mockup', project: 'Design', priority: 'high', dueDate: 'Jan 15', completed: false },
  { id: 'task-2', title: 'Set up development environment', project: 'Development', priority: 'medium', dueDate: 'Jan 10', completed: true },
  { id: 'task-3', title: 'Write project requirements', project: 'Planning', priority: 'high', dueDate: 'Jan 20', completed: false },
  { id: 'task-4', title: 'Review user feedback', project: 'Research', priority: 'low', dueDate: 'Jan 25', completed: false },
  { id: 'task-5', title: 'Create wireframes', project: 'Design', priority: 'medium', dueDate: 'Jan 18', completed: false },
  { id: 'task-6', title: 'Database setup', project: 'Development', priority: 'high', dueDate: 'Jan 12', completed: true }
];

export interface TodayStats {
  completedTasks: number;
  focusTime: number;
  totalGoals: number;
  completedGoals: number;
}

export const sampleTodayStats: TodayStats = {
  completedTasks: 8,
  focusTime: 4.5,
  totalGoals: 3,
  completedGoals: 1
};

export interface TodayFocusItem {
  title: string;
  duration: string;
  status: string;
  type: string;
  completed?: boolean;
  current?: boolean;
  priority?: string;
  time?: string;
}

export const sampleTodayFocus: TodayFocusItem[] = [
  { title: 'Complete website design', duration: '2h', status: 'completed', type: 'task', completed: true },
  { title: 'Review project proposals', duration: '1h', status: 'in_progress', type: 'task', completed: false, current: true },
  { title: 'Team standup meeting', duration: '30m', status: 'pending', type: 'event', completed: false }
];

export interface WeeklyOverview {
  totalTasks: number;
  completedTasks: number;
  focusHours: number;
  streakDays: number;
}

export const sampleWeeklyOverview: WeeklyOverview = {
  totalTasks: 45,
  completedTasks: 38,
  focusHours: 28,
  streakDays: 5
};