// UI configurations, colors, and visual constants

export interface ColorOption {
  name: string;
  value: string;
  className?: string;
}

export interface IconOption {
  name: string;
  icon: string;
}

// Priority colors
export const priorityColors = {
  high: 'text-[#ff3b30]',
  medium: 'text-[#ff9500]',
  low: 'text-[#86868b]',
  default: 'text-[#86868b]'
} as const;

export const priorityLabels = {
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
  default: ''
} as const;

// Common color palette for tags, categories, etc.
export const colorOptions: ColorOption[] = [
  { name: 'Blue', value: '#007aff', className: 'bg-blue-500' },
  { name: 'Green', value: '#34c759', className: 'bg-green-500' },
  { name: 'Orange', value: '#ff9500', className: 'bg-orange-500' },
  { name: 'Red', value: '#ff3b30', className: 'bg-red-500' },
  { name: 'Purple', value: '#af52de', className: 'bg-purple-500' },
  { name: 'Pink', value: '#ff2d92', className: 'bg-pink-500' },
  { name: 'Yellow', value: '#ffcc02', className: 'bg-yellow-500' },
  { name: 'Indigo', value: '#5856d6', className: 'bg-indigo-500' }
];

// Common icon options for projects, tags, etc.
export const iconOptions: IconOption[] = [
  { name: 'Work', icon: '💼' },
  { name: 'Personal', icon: '🏠' },
  { name: 'Health', icon: '🏃' },
  { name: 'Learning', icon: '📚' },
  { name: 'Creative', icon: '🎨' },
  { name: 'Finance', icon: '💰' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { name: 'Hobby', icon: '🎯' },
  { name: 'Tech', icon: '💻' }
];

// Theme configurations
export const themes = {
  light: 'light',
  dark: 'dark',
  auto: 'auto'
} as const;

export type Theme = keyof typeof themes;