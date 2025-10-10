export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  action: string;
  value?: any;
}

export interface Category {
  id: string;
  icon: string;
  label: string;
  items: MenuItem[];
}

export const FAB_CATEGORIES = {
  capture: [
    {
      id: 'templates',
      icon: '📋',
      label: 'Templates',
      items: [
        { id: 'note', icon: '📝', label: 'Note Template', action: 'USE_TEMPLATE', value: 'note' },
        { id: 'task', icon: '✅', label: 'Task Template', action: 'USE_TEMPLATE', value: 'task' },
        { id: 'project', icon: '🚀', label: 'Project Template', action: 'USE_TEMPLATE', value: 'project' },
        { id: 'goal', icon: '🎯', label: 'Goal Template', action: 'USE_TEMPLATE', value: 'goal' },
        { id: 'habit', icon: '🔄', label: 'Habit Template', action: 'USE_TEMPLATE', value: 'habit' },
      ],
    },
    {
      id: 'quick-capture',
      icon: '⚡',
      label: 'Quick Capture',
      items: [
        { id: 'voice', icon: '🎤', label: 'Voice Note', action: 'CAPTURE', value: 'voice' },
        { id: 'photo', icon: '📸', label: 'From Photo', action: 'CAPTURE', value: 'photo' },
        { id: 'quick', icon: '⚡', label: 'Quick Add', action: 'CAPTURE', value: 'quick' },
      ],
    },
    {
      id: 'import',
      icon: '📎',
      label: 'Import',
      items: [
        { id: 'file', icon: '📁', label: 'From File', action: 'IMPORT', value: 'file' },
        { id: 'photo', icon: '📸', label: 'From Photo', action: 'IMPORT', value: 'photo' },
        { id: 'clipboard', icon: '📋', label: 'From Clipboard', action: 'IMPORT', value: 'clipboard' },
      ],
    },
    {
      id: 'ask-luna',
      icon: '🦊',
      label: 'Ask Luna',
      items: [
        { id: 'chat', icon: '💬', label: 'Open Chat', action: 'OPEN_LUNA', value: null },
        { id: 'help', icon: '❓', label: 'Capture Help', action: 'LUNA_HELP', value: 'capture' },
        { id: 'suggest', icon: '💡', label: 'Smart Capture', action: 'LUNA_SUGGEST', value: 'capture' },
      ],
    },
  ],

  plan: [
    {
      id: 'view-options',
      icon: '👁️',
      label: 'View Options',
      items: [
        { id: 'list', icon: '📋', label: 'List View', action: 'SET_VIEW', value: 'list' },
        { id: 'board', icon: '📊', label: 'Board View', action: 'SET_VIEW', value: 'board' },
        { id: 'calendar', icon: '📅', label: 'Calendar View', action: 'SET_VIEW', value: 'calendar' },
        { id: 'timeline', icon: '⏱️', label: 'Timeline View', action: 'SET_VIEW', value: 'timeline' },
      ],
    },
    {
      id: 'filters',
      icon: '🔍',
      label: 'Filters',
      items: [
        { id: 'all', icon: '📋', label: 'All Items', action: 'SET_FILTER', value: 'all' },
        { id: 'tasks', icon: '✅', label: 'Tasks Only', action: 'SET_FILTER', value: 'tasks' },
        { id: 'projects', icon: '🚀', label: 'Projects Only', action: 'SET_FILTER', value: 'projects' },
        { id: 'goals', icon: '🎯', label: 'Goals Only', action: 'SET_FILTER', value: 'goals' },
        { id: 'tags', icon: '🏷️', label: 'By Tags', action: 'OPEN_TAG_FILTER', value: null },
      ],
    },
    {
      id: 'quick-actions',
      icon: '⚡',
      label: 'Quick Actions',
      items: [
        { id: 'new-project', icon: '🚀', label: 'New Project', action: 'CREATE', value: 'project' },
        { id: 'new-task', icon: '✅', label: 'New Task', action: 'CREATE', value: 'task' },
        { id: 'sort', icon: '🔽', label: 'Sort', action: 'OPEN_SORT', value: null },
        { id: 'group', icon: '📁', label: 'Group By', action: 'OPEN_GROUP', value: null },
      ],
    },
    {
      id: 'ask-luna',
      icon: '🦊',
      label: 'Ask Luna',
      items: [
        { id: 'chat', icon: '💬', label: 'Open Chat', action: 'OPEN_LUNA', value: null },
        { id: 'help', icon: '❓', label: 'Planning Help', action: 'LUNA_HELP', value: 'plan' },
        { id: 'suggest', icon: '💡', label: 'Smart Planning', action: 'LUNA_SUGGEST', value: 'plan' },
      ],
    },
  ],

  engage: [
    {
      id: 'quick-actions',
      icon: '⚡',
      label: 'Quick Actions',
      items: [
        { id: 'add-today', icon: '➕', label: 'Add to Today', action: 'ADD_TO_TODAY', value: null },
        { id: 'timer', icon: '⏱️', label: 'Start Timer', action: 'START_TIMER', value: null },
        { id: 'complete', icon: '✅', label: 'Mark Complete', action: 'COMPLETE', value: null },
      ],
    },
    {
      id: 'time-tracking',
      icon: '⏱️',
      label: 'Time Tracking',
      items: [
        { id: 'start', icon: '▶️', label: 'Start Timer', action: 'START_TIMER', value: null },
        { id: 'report', icon: '📊', label: 'Time Report', action: 'NAVIGATE', value: '/pomodoro' },
        { id: 'edit', icon: '✏️', label: 'Edit Time', action: 'EDIT_TIME', value: null },
      ],
    },
    {
      id: 'focus-mode',
      icon: '🎯',
      label: 'Focus Mode',
      items: [
        { id: 'pomodoro', icon: '🍅', label: 'Start Pomodoro', action: 'NAVIGATE', value: '/pomodoro' },
        { id: 'dnd', icon: '🔕', label: 'Do Not Disturb', action: 'TOGGLE_DND', value: null },
        { id: 'goal', icon: '🎯', label: 'Set Focus Goal', action: 'SET_FOCUS_GOAL', value: null },
      ],
    },
    {
      id: 'ask-luna',
      icon: '🦊',
      label: 'Ask Luna',
      items: [
        { id: 'chat', icon: '💬', label: 'Open Chat', action: 'OPEN_LUNA', value: null },
        { id: 'help', icon: '❓', label: 'Focus Help', action: 'LUNA_HELP', value: 'engage' },
        { id: 'suggest', icon: '💡', label: 'Focus Coach', action: 'LUNA_SUGGEST', value: 'engage' },
      ],
    },
  ],
};

export function getCategoriesForTab(tab: 'capture' | 'plan' | 'engage'): Category[] {
  return FAB_CATEGORIES[tab] || [];
}