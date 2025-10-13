// Templates and categories for tasks, projects, and other entities

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority?: string;
  estimatedTime?: number;
}

// Quick task template interface (for useQuickTask hook)
export interface QuickTaskTemplate {
  name: string;
  title: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// Default categories for tasks, projects, etc.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#007aff', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#34c759', icon: '🏠' },
  { id: 'health', name: 'Health', color: '#ff3b30', icon: '🏃' },
  { id: 'learning', name: 'Learning', color: '#af52de', icon: '📚' },
  { id: 'creative', name: 'Creative', color: '#ff9500', icon: '🎨' },
  { id: 'finance', name: 'Finance', color: '#ffcc02', icon: '💰' },
  { id: 'social', name: 'Social', color: '#ff2d92', icon: '👥' },
  { id: 'hobby', name: 'Hobby', color: '#5856d6', icon: '🎯' }
];

// Common task templates for quick creation
export const commonTaskTemplates: TaskTemplate[] = [
  {
    id: 'meeting',
    title: 'Team Meeting',
    description: 'Schedule and attend team meeting',
    category: 'work',
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'review',
    title: 'Code Review',
    description: 'Review pull requests and provide feedback',
    category: 'work',
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'exercise',
    title: 'Daily Exercise',
    description: 'Complete daily workout routine',
    category: 'health',
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'reading',
    title: 'Read Book Chapter',
    description: 'Read one chapter of current book',
    category: 'learning',
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'planning',
    title: 'Weekly Planning',
    description: 'Plan and organize upcoming week',
    category: 'personal',
    priority: 'high',
    estimatedTime: 20
  }
];

// Project templates
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultTasks: string[];
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'website',
    name: 'Website Project',
    description: 'Create a new website from scratch',
    category: 'work',
    defaultTasks: ['Design wireframes', 'Set up development environment', 'Create homepage', 'Test and deploy']
  },
  {
    id: 'learning',
    name: 'Learning Goal',
    description: 'Master a new skill or technology',
    category: 'learning',
    defaultTasks: ['Research resources', 'Create study schedule', 'Practice daily', 'Build project']
  },
  {
    id: 'fitness',
    name: 'Fitness Challenge',
    description: 'Achieve a specific fitness goal',
    category: 'health',
    defaultTasks: ['Set target goal', 'Create workout plan', 'Track progress', 'Celebrate achievement']
  }
];

// Common quick task templates
export const commonQuickTaskTemplates: QuickTaskTemplate[] = [
  {
    name: "Meeting",
    title: "Meeting: ",
    priority: "medium",
    tags: ["work", "meeting"],
  },
  {
    name: "Bug Fix",
    title: "Fix: ",
    priority: "high",
    tags: ["bug"],
  },
  {
    name: "Research",
    title: "Research: ",
    priority: "low",
    tags: ["learning"],
  },
  {
    name: "Review",
    title: "Review: ",
    priority: "medium",
    tags: ["review"],
  },
  {
    name: "Planning",
    title: "Plan: ",
    priority: "medium",
    tags: ["planning"],
  },
];