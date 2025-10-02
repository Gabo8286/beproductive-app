import { HabitEntry, HabitTrend } from "@/types/habits";
import { differenceInDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

/**
 * Calculate completion rate for a set of entries
 */
export function calculateCompletionRate(
  entries: HabitEntry[],
  totalDays: number
): number {
  const completedDays = entries.filter(e => e.status === 'completed').length;
  return totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
}

/**
 * Calculate streak from entries
 */
export function calculateStreak(entries: HabitEntry[]): number {
  if (!entries || entries.length === 0) return 0;

  const sortedEntries = [...entries]
    .filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(currentDate, entryDate);

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from entries
 */
export function calculateLongestStreak(entries: HabitEntry[]): number {
  if (!entries || entries.length === 0) return 0;

  const sortedEntries = [...entries]
    .filter(e => e.status === 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);

    if (!lastDate || differenceInDays(entryDate, lastDate) === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }

    lastDate = entryDate;
  }

  return Math.max(maxStreak, currentStreak);
}

/**
 * Calculate consistency score (0-100)
 */
export function calculateConsistencyScore(entries: HabitEntry[], days: number): number {
  if (days === 0) return 0;

  const completionRate = calculateCompletionRate(entries, days);
  const streak = calculateStreak(entries);
  const streakBonus = Math.min(streak / days, 0.3) * 100;

  return Math.min(100, completionRate * 0.7 + streakBonus);
}

/**
 * Calculate weekly performance
 */
export function calculateWeeklyPerformance(entries: HabitEntry[]): {
  week: string;
  rate: number;
  completions: number;
}[] {
  const weeks: Record<string, { completions: number; total: number }> = {};

  entries.forEach(entry => {
    const weekStart = startOfWeek(new Date(entry.date));
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weeks[weekKey]) {
      weeks[weekKey] = { completions: 0, total: 0 };
    }

    weeks[weekKey].total++;
    if (entry.status === 'completed') {
      weeks[weekKey].completions++;
    }
  });

  return Object.entries(weeks).map(([weekKey, stats]) => ({
    week: format(new Date(weekKey), 'MMM dd'),
    rate: (stats.completions / stats.total) * 100,
    completions: stats.completions,
  }));
}

/**
 * Identify best performing day of week
 */
export function identifyBestDay(entries: HabitEntry[]): {
  day: number;
  dayName: string;
  rate: number;
} | null {
  const dayStats: Record<number, { completed: number; total: number }> = {};

  entries.forEach(entry => {
    const day = new Date(entry.date).getDay();
    if (!dayStats[day]) {
      dayStats[day] = { completed: 0, total: 0 };
    }

    dayStats[day].total++;
    if (entry.status === 'completed') {
      dayStats[day].completed++;
    }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const bestDay = Object.entries(dayStats)
    .map(([day, stats]) => ({
      day: parseInt(day),
      dayName: dayNames[parseInt(day)],
      rate: (stats.completed / stats.total) * 100,
    }))
    .sort((a, b) => b.rate - a.rate)[0];

  return bestDay || null;
}

/**
 * Calculate momentum score
 */
export function calculateMomentum(entries: HabitEntry[], days: number = 7): number {
  const recentEntries = entries
    .filter(e => {
      const entryDate = new Date(e.date);
      const daysAgo = differenceInDays(new Date(), entryDate);
      return daysAgo <= days;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (recentEntries.length === 0) return 0;

  let momentumScore = 0;
  let weight = 1;

  recentEntries.forEach((entry, index) => {
    if (entry.status === 'completed') {
      momentumScore += weight;
    }
    weight *= 0.9; // Decay factor
  });

  return Math.min(100, (momentumScore / days) * 100);
}

/**
 * Predict streak continuation probability
 */
export function predictStreakContinuation(entries: HabitEntry[]): number {
  const recentDays = 14;
  const recentEntries = entries
    .filter(e => {
      const daysAgo = differenceInDays(new Date(), new Date(e.date));
      return daysAgo <= recentDays;
    });

  const completionRate = calculateCompletionRate(recentEntries, recentDays);
  const currentStreak = calculateStreak(entries);
  const momentum = calculateMomentum(entries);

  // Weighted average
  return (
    completionRate * 0.4 +
    Math.min(100, (currentStreak / 30) * 100) * 0.3 +
    momentum * 0.3
  );
}

/**
 * Calculate optimal streak target
 */
export function calculateOptimalTarget(entries: HabitEntry[]): number {
  const longestStreak = calculateLongestStreak(entries);
  const avgCompletion = calculateCompletionRate(entries, entries.length);

  if (longestStreak === 0) return 7;
  if (longestStreak < 7) return 7;
  if (longestStreak < 21) return 21;
  if (longestStreak < 30) return 30;
  if (longestStreak < 66) return 66;
  if (longestStreak < 100) return 100;

  return Math.min(365, Math.ceil(longestStreak * 1.2));
}

/**
 * Generate trend data for charts
 */
export function generateTrendData(
  entries: HabitEntry[],
  days: number
): HabitTrend[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === dateStr);

    const entriesUpToDate = entries.filter(
      e => new Date(e.date) <= date
    );

    return {
      date: dateStr,
      completions: entry?.status === 'completed' ? 1 : 0,
      completion_rate: entry ? 100 : 0,
      streak: calculateStreak(entriesUpToDate),
      mood: entry?.mood ? ['terrible', 'bad', 'neutral', 'good', 'amazing'].indexOf(entry.mood) + 1 : undefined,
      energy: entry?.energy_level,
    };
  });
}
