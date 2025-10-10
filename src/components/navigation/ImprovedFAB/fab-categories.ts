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
      id: 'navigation',
      icon: '🧭',
      label: 'Navigation',
      items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', action: 'NAVIGATE', value: '/dashboard' },
        { id: 'tasks', icon: '✓', label: 'Tasks', action: 'NAVIGATE', value: '/tasks' },
        { id: 'goals', icon: '🎯', label: 'Goals', action: 'NAVIGATE', value: '/goals' },
        { id: 'analytics', icon: '📊', label: 'Analytics', action: 'NAVIGATE', value: '/analytics' },
        { id: 'notes', icon: '📝', label: 'Notes', action: 'NAVIGATE', value: '/notes' },
        { id: 'projects', icon: '🚀', label: 'Projects', action: 'NAVIGATE', value: '/projects' },
        { id: 'habits', icon: '🔄', label: 'Habits', action: 'NAVIGATE', value: '/habits' },
      ],
    },
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
      id: 'navigation',
      icon: '🧭',
      label: 'Navigation',
      items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', action: 'NAVIGATE', value: '/dashboard' },
        { id: 'tasks', icon: '✓', label: 'Tasks', action: 'NAVIGATE', value: '/tasks' },
        { id: 'goals', icon: '🎯', label: 'Goals', action: 'NAVIGATE', value: '/goals' },
        { id: 'analytics', icon: '📊', label: 'Analytics', action: 'NAVIGATE', value: '/analytics' },
        { id: 'notes', icon: '📝', label: 'Notes', action: 'NAVIGATE', value: '/notes' },
        { id: 'projects', icon: '🚀', label: 'Projects', action: 'NAVIGATE', value: '/projects' },
        { id: 'habits', icon: '🔄', label: 'Habits', action: 'NAVIGATE', value: '/habits' },
      ],
    },
    {
      id: 'view-options',
      icon: '👁️',
      label: 'View Mode',
      items: [
        { id: 'grid', icon: '⊞', label: 'Grid View', action: 'SET_VIEW', value: 'grid' },
        { id: 'list', icon: '☰', label: 'List View', action: 'SET_VIEW', value: 'list' },
        { id: 'board', icon: '📊', label: 'Board View', action: 'SET_VIEW', value: 'board' },
        { id: 'calendar', icon: '📅', label: 'Calendar View', action: 'SET_VIEW', value: 'calendar' },
        { id: 'projects', icon: '🚀', label: 'Projects View', action: 'SET_VIEW', value: 'projects' },
        { id: 'status', icon: '✓', label: 'Status View', action: 'SET_VIEW', value: 'status' },
      ],
    },
    {
      id: 'filters',
      icon: '🔍',
      label: 'Filters',
      items: [
        { id: 'all', icon: '📋', label: 'Show All', action: 'SET_FILTER', value: { type: 'all' } },
        { id: 'high-priority', icon: '🔴', label: 'High Priority', action: 'SET_FILTER', value: { type: 'priority', value: 'high' } },
        { id: 'urgent', icon: '⚠️', label: 'Urgent', action: 'SET_FILTER', value: { type: 'priority', value: 'urgent' } },
        { id: 'due-today', icon: '📅', label: 'Due Today', action: 'SET_FILTER', value: { type: 'dueDate', value: 'today' } },
        { id: 'overdue', icon: '⏰', label: 'Overdue', action: 'SET_FILTER', value: { type: 'dueDate', value: 'overdue' } },
        { id: 'in-progress', icon: '⚡', label: 'In Progress', action: 'SET_FILTER', value: { type: 'status', value: 'in_progress' } },
        { id: 'blocked', icon: '🚫', label: 'Blocked', action: 'SET_FILTER', value: { type: 'status', value: 'blocked' } },
        { id: 'tags', icon: '🏷️', label: 'Filter by Tags', action: 'OPEN_TAG_FILTER', value: null },
        { id: 'clear-filters', icon: '✕', label: 'Clear All Filters', action: 'CLEAR_FILTERS', value: null },
      ],
    },
    {
      id: 'sort-group',
      icon: '⚙️',
      label: 'Sort & Group',
      items: [
        { id: 'sort-date', icon: '📅', label: 'Sort by Date', action: 'SET_SORT', value: { by: 'created_at', order: 'desc' } },
        { id: 'sort-priority', icon: '⭐', label: 'Sort by Priority', action: 'SET_SORT', value: { by: 'priority', order: 'desc' } },
        { id: 'sort-status', icon: '✓', label: 'Sort by Status', action: 'SET_SORT', value: { by: 'status', order: 'asc' } },
        { id: 'sort-title', icon: '🔤', label: 'Sort by Title', action: 'SET_SORT', value: { by: 'title', order: 'asc' } },
        { id: 'toggle-order', icon: '⇅', label: 'Toggle Order', action: 'TOGGLE_SORT_ORDER', value: null },
        { id: 'group-status', icon: '📁', label: 'Group by Status', action: 'SET_GROUP', value: 'status' },
        { id: 'group-priority', icon: '⭐', label: 'Group by Priority', action: 'SET_GROUP', value: 'priority' },
        { id: 'group-due-date', icon: '📅', label: 'Group by Due Date', action: 'SET_GROUP', value: 'due_date' },
        { id: 'group-none', icon: '━', label: 'No Grouping', action: 'SET_GROUP', value: 'none' },
      ],
    },
    {
      id: 'category-filters',
      icon: '🏷️',
      label: 'Categories',
      items: [
        { id: 'ai-claude', icon: '🤖', label: 'AI & Claude', action: 'SET_CATEGORY_FILTER', value: 'ai' },
        { id: 'product', icon: '📦', label: 'Product', action: 'SET_CATEGORY_FILTER', value: 'product' },
        { id: 'marketing', icon: '📢', label: 'Marketing', action: 'SET_CATEGORY_FILTER', value: 'marketing' },
        { id: 'design', icon: '🎨', label: 'Design', action: 'SET_CATEGORY_FILTER', value: 'design' },
        { id: 'engineering', icon: '⚙️', label: 'Engineering', action: 'SET_CATEGORY_FILTER', value: 'engineering' },
      ],
    },
    {
      id: 'quick-actions',
      icon: '⚡',
      label: 'Quick Actions',
      items: [
        { id: 'new-project', icon: '🚀', label: 'New Project', action: 'CREATE', value: 'project' },
        { id: 'new-task', icon: '✅', label: 'New Task', action: 'CREATE', value: 'task' },
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
      id: 'navigation',
      icon: '🧭',
      label: 'Navigation',
      items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', action: 'NAVIGATE', value: '/dashboard' },
        { id: 'tasks', icon: '✓', label: 'Tasks', action: 'NAVIGATE', value: '/tasks' },
        { id: 'goals', icon: '🎯', label: 'Goals', action: 'NAVIGATE', value: '/goals' },
        { id: 'analytics', icon: '📊', label: 'Analytics', action: 'NAVIGATE', value: '/analytics' },
        { id: 'notes', icon: '📝', label: 'Notes', action: 'NAVIGATE', value: '/notes' },
        { id: 'projects', icon: '🚀', label: 'Projects', action: 'NAVIGATE', value: '/projects' },
        { id: 'habits', icon: '🔄', label: 'Habits', action: 'NAVIGATE', value: '/habits' },
      ],
    },
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