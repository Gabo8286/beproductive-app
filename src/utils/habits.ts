import { format, startOfDay, endOfDay, isToday, isFuture, parseISO, differenceInDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Habit, HabitEntry, HabitFrequency, CustomFrequency, HabitCategory, EntryStatus, HabitCalendarData, HabitHeatmapData } from '@/types/habits';

// =====================================================
// HABIT CALCULATIONS
// =====================================================

/**
 * Calculate completion rate for a habit over a date range
 */
export function calculateCompletionRate(
  entries: HabitEntry[],
  startDate: Date,
  endDate: Date
): number {
  const totalDays = differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1;
  const completedDays = entries.filter(e => e.status === 'completed').length;
  
  if (totalDays === 0) return 0;
  return Math.round((completedDays / totalDays) * 100);
}

/**
 * Get next due date for a habit based on frequency
 */
export function getNextDueDate(habit: Habit, lastEntry?: HabitEntry): Date | null {
  if (habit.archived_at) return null;
  
  const today = startOfDay(new Date());
  const lastCompletedDate = lastEntry?.date ? parseISO(lastEntry.date) : null;
  
  switch (habit.frequency) {
    case 'daily':
      return today;
      
    case 'weekly':
      if (!lastCompletedDate) return today;
      const weeksSinceCompletion = Math.floor(differenceInDays(today, lastCompletedDate) / 7);
      return addDays(lastCompletedDate, (weeksSinceCompletion + 1) * 7);
      
    case 'monthly':
      if (!lastCompletedDate) return today;
      const monthsSinceCompletion = Math.floor(differenceInDays(today, lastCompletedDate) / 30);
      return addDays(lastCompletedDate, (monthsSinceCompletion + 1) * 30);
      
    case 'custom':
      if (!habit.custom_frequency) return today;
      return calculateCustomNextDue(habit.custom_frequency, lastCompletedDate);
      
    default:
      return today;
  }
}

function calculateCustomNextDue(frequency: CustomFrequency, lastCompleted: Date | null): Date {
  const today = startOfDay(new Date());
  
  if (frequency.type === 'interval' && frequency.interval) {
    if (!lastCompleted) return today;
    return addDays(lastCompleted, frequency.interval);
  }
  
  if (frequency.type === 'specific_days' && frequency.days && frequency.days.length > 0) {
    // Find next matching day of week
    const currentDay = today.getDay();
    const sortedDays = [...frequency.days].sort((a, b) => a - b);
    
    // Find next day in the cycle
    const nextDay = sortedDays.find(d => d > currentDay) ?? sortedDays[0];
    const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
    
    return addDays(today, daysToAdd);
  }
  
  return today;
}

/**
 * Check if habit is due today
 */
export function isDueToday(habit: Habit, lastEntry?: HabitEntry): boolean {
  if (habit.archived_at) return false;
  
  const today = startOfDay(new Date());
  
  // If there's an entry for today, not due anymore
  if (lastEntry && isToday(parseISO(lastEntry.date))) {
    return false;
  }
  
  const nextDue = getNextDueDate(habit, lastEntry);
  if (!nextDue) return false;
  
  return isToday(nextDue) || nextDue < today;
}

/**
 * Format streak with fire emoji
 */
export function formatStreak(days: number): string {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day 🔥';
  
  const emoji = days >= 30 ? '🔥💪' : days >= 7 ? '🔥' : '';
  return `${days} days ${emoji}`;
}

/**
 * Calculate habit score for gamification
 */
export function calculateHabitScore(habit: Habit, entries: HabitEntry[]): number {
  let score = 0;
  
  // Base points for streak
  score += habit.current_streak * 10;
  
  // Bonus for long streaks
  if (habit.current_streak >= 30) score += 500;
  else if (habit.current_streak >= 7) score += 100;
  
  // Points for difficulty
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    extreme: 3
  };
  score *= difficultyMultiplier[habit.difficulty];
  
  // Recent completion rate (last 30 days)
  const thirtyDaysAgo = addDays(new Date(), -30);
  const recentEntries = entries.filter(e => 
    parseISO(e.date) >= thirtyDaysAgo && e.status === 'completed'
  );
  score += recentEntries.length * 5;
  
  return Math.round(score);
}

// =====================================================
// HABIT APPEARANCE
// =====================================================

/**
 * Get default color for habit category
 */
export function getHabitColor(category: HabitCategory): string {
  const colors: Record<HabitCategory, string> = {
    health: '#10b981',      // green
    productivity: '#3b82f6', // blue
    learning: '#8b5cf6',    // purple
    mindfulness: '#ec4899', // pink
    social: '#f59e0b',      // amber
    financial: '#14b8a6',   // teal
    creative: '#f97316',    // orange
    other: '#6b7280'        // gray
  };
  
  return colors[category];
}

/**
 * Get default icon for habit category
 */
export function getHabitIcon(category: HabitCategory): string {
  const icons: Record<HabitCategory, string> = {
    health: '💪',
    productivity: '⚡',
    learning: '📚',
    mindfulness: '🧘',
    social: '👥',
    financial: '💰',
    creative: '🎨',
    other: '⭐'
  };
  
  return icons[category];
}

// =====================================================
// CALENDAR AND HEATMAP
// =====================================================

/**
 * Generate calendar data for a month
 */
export function generateHabitCalendar(
  habit: Habit,
  entries: HabitEntry[],
  month: Date
): HabitCalendarData[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  const entryMap = new Map(
    entries.map(e => [format(parseISO(e.date), 'yyyy-MM-dd'), e])
  );
  
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entryMap.get(dateStr);
    
    return {
      date: dateStr,
      entry,
      is_due: isDueToday(habit, entry),
      is_today: isToday(date),
      is_future: isFuture(date)
    };
  });
}

/**
 * Generate heatmap data (GitHub-style)
 */
export function generateHeatmapData(
  entries: HabitEntry[],
  year: number
): HabitHeatmapData[] {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days = eachDayOfInterval({ start, end });
  
  const entryMap = new Map(
    entries.map(e => [format(parseISO(e.date), 'yyyy-MM-dd'), e])
  );
  
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entryMap.get(dateStr);
    
    let count = 0;
    if (entry?.status === 'completed') count = 1;
    
    // Calculate intensity level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      level = 4; // Completed
    } else if (entry?.status === 'partial') {
      level = 2; // Partial
    } else if (entry?.status === 'skipped') {
      level = 1; // Skipped
    }
    
    return {
      date: dateStr,
      count,
      level
    };
  });
}

// =====================================================
// VALIDATION
// =====================================================

/**
 * Validate habit input
 */
export function validateHabitInput(input: {
  title: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  custom_frequency?: CustomFrequency;
  target_streak?: number;
  duration_minutes?: number;
  start_date?: string;
  end_date?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Title validation
  if (!input.title?.trim()) {
    errors.push('Title is required');
  } else if (input.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  // Custom frequency validation
  if (input.frequency === 'custom' && !input.custom_frequency) {
    errors.push('Custom frequency configuration is required');
  }
  
  if (input.custom_frequency) {
    const freq = input.custom_frequency;
    
    if (freq.type === 'times_per_period') {
      if (!freq.times || freq.times < 1) {
        errors.push('Times per period must be at least 1');
      }
      if (!freq.period) {
        errors.push('Period is required for times_per_period');
      }
    }
    
    if (freq.type === 'specific_days') {
      if (!freq.days || freq.days.length === 0) {
        errors.push('At least one day must be selected');
      }
      if (freq.days?.some(d => d < 0 || d > 6)) {
        errors.push('Days must be between 0 (Sunday) and 6 (Saturday)');
      }
    }
    
    if (freq.type === 'interval') {
      if (!freq.interval || freq.interval < 1) {
        errors.push('Interval must be at least 1 day');
      }
    }
  }
  
  // Target streak validation
  if (input.target_streak !== undefined && input.target_streak < 1) {
    errors.push('Target streak must be at least 1 day');
  }
  
  // Duration validation
  if (input.duration_minutes !== undefined && input.duration_minutes < 1) {
    errors.push('Duration must be at least 1 minute');
  }
  
  // Date range validation
  if (input.start_date && input.end_date) {
    const start = parseISO(input.start_date);
    const end = parseISO(input.end_date);
    
    if (end < start) {
      errors.push('End date must be after start date');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate habit entry input
 */
export function validateEntryInput(input: {
  date: string;
  energy_level?: number;
  difficulty_felt?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Energy level validation
  if (input.energy_level !== undefined && (input.energy_level < 1 || input.energy_level > 10)) {
    errors.push('Energy level must be between 1 and 10');
  }
  
  // Difficulty validation
  if (input.difficulty_felt !== undefined && (input.difficulty_felt < 1 || input.difficulty_felt > 10)) {
    errors.push('Difficulty must be between 1 and 10');
  }
  
  // Date validation
  const entryDate = parseISO(input.date);
  const today = startOfDay(new Date());
  
  if (isFuture(entryDate)) {
    errors.push('Cannot create entries for future dates');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// =====================================================
// DATE RANGE HELPERS
// =====================================================

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  };
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

export function getLast30Days(): { start: Date; end: Date } {
  const end = new Date();
  const start = addDays(end, -30);
  return { start, end };
}
