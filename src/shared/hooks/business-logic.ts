/**
 * Business Logic Hooks Module
 * Consolidated hooks for core business functionality: tasks, habits, goals, projects, and time tracking
 * Optimizes business logic operations and reduces state management complexity
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { UUID, Timestamp, Score } from '../types/core';

// MARK: - Types

interface Task {
  id: UUID;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  projectId?: UUID;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface Habit {
  id: UUID;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // target occurrences per period
  category: string;
  isActive: boolean;
  streak: number;
  longestStreak: number;
  completions: Date[];
  createdAt: Date;
}

interface Goal {
  id: UUID;
  title: string;
  description?: string;
  type: 'outcome' | 'process' | 'habit';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  milestones: Milestone[];
  createdAt: Date;
}

interface Milestone {
  id: UUID;
  title: string;
  target: number;
  completed: boolean;
  completedAt?: Date;
}

interface Project {
  id: UUID;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  progress: number; // 0-100
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  taskIds: UUID[];
  tags: string[];
  createdAt: Date;
}

interface TimeEntry {
  id: UUID;
  taskId?: UUID;
  projectId?: UUID;
  category: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  isTracking: boolean;
}

// MARK: - Task Management Hook

/**
 * Comprehensive task management with filtering, sorting, and analytics
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<{
    status?: Task['status'][];
    priority?: Task['priority'][];
    projectId?: UUID;
    tags?: string[];
    dueSoon?: boolean;
  }>({});
  const [sortBy, setSortBy] = useState<{
    field: keyof Task;
    direction: 'asc' | 'desc';
  }>({ field: 'createdAt', direction: 'desc' });

  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  }, []);

  const updateTask = useCallback((id: UUID, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  }, []);

  const deleteTask = useCallback((id: UUID) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const completeTask = useCallback((id: UUID) => {
    const completedAt = new Date();
    updateTask(id, {
      status: 'completed',
      completedAt
    });
  }, [updateTask]);

  const startTask = useCallback((id: UUID) => {
    updateTask(id, { status: 'in_progress' });
  }, [updateTask]);

  const duplicateTask = useCallback((id: UUID) => {
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) return;

    const { id: _, createdAt, updatedAt, completedAt, ...taskData } = originalTask;
    return createTask({
      ...taskData,
      title: `${taskData.title} (Copy)`,
      status: 'todo'
    });
  }, [tasks, createTask]);

  const addTimeToTask = useCallback((id: UUID, minutes: number) => {
    updateTask(id, {
      actualDuration: (tasks.find(t => t.id === id)?.actualDuration || 0) + minutes
    });
  }, [tasks, updateTask]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filter.status?.length) {
      filtered = filtered.filter(task => filter.status!.includes(task.status));
    }

    if (filter.priority?.length) {
      filtered = filtered.filter(task => filter.priority!.includes(task.priority));
    }

    if (filter.projectId) {
      filtered = filtered.filter(task => task.projectId === filter.projectId);
    }

    if (filter.tags?.length) {
      filtered = filtered.filter(task =>
        filter.tags!.some(tag => task.tags.includes(tag))
      );
    }

    if (filter.dueSoon) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(task =>
        task.dueDate && task.dueDate <= tomorrow && task.status !== 'completed'
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];

      if (aValue === bValue) return 0;

      const comparison = aValue! < bValue! ? -1 : 1;
      return sortBy.direction === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filter, sortBy]);

  // Analytics
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t =>
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    ).length;

    const avgCompletionTime = tasks
      .filter(t => t.actualDuration)
      .reduce((sum, t) => sum + t.actualDuration!, 0) / tasks.filter(t => t.actualDuration).length || 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? completed / total : 0,
      avgCompletionTime
    };
  }, [tasks]);

  const getTasksByProject = useCallback((projectId: UUID) => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const getTasksByTag = useCallback((tag: string) => {
    return tasks.filter(task => task.tags.includes(tag));
  }, [tasks]);

  const getUpcomingTasks = useCallback((days = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return tasks.filter(task =>
      task.dueDate &&
      task.dueDate >= new Date() &&
      task.dueDate <= futureDate &&
      task.status !== 'completed'
    );
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    startTask,
    duplicateTask,
    addTimeToTask,
    getTasksByProject,
    getTasksByTag,
    getUpcomingTasks,
    analytics
  };
}

// MARK: - Habit Tracking Hook

/**
 * Habit tracking with streaks, analytics, and smart reminders
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  const createHabit = useCallback((habitData: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'completions' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      streak: 0,
      longestStreak: 0,
      completions: [],
      createdAt: new Date()
    };

    setHabits(prev => [...prev, newHabit]);
    return newHabit.id;
  }, []);

  const updateHabit = useCallback((id: UUID, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setHabits(prev => prev.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  }, []);

  const deleteHabit = useCallback((id: UUID) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  }, []);

  const recordCompletion = useCallback((id: UUID, date = new Date()) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;

      // Check if already completed today
      const today = new Date(date).toDateString();
      const alreadyCompleted = habit.completions.some(
        completion => new Date(completion).toDateString() === today
      );

      if (alreadyCompleted) return habit;

      const newCompletions = [...habit.completions, date].sort((a, b) => b.getTime() - a.getTime());

      // Calculate streak
      let streak = 0;
      const sortedDates = newCompletions.map(d => new Date(d).toDateString());
      const todayStr = new Date().toDateString();

      for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toDateString();

        if (sortedDates.includes(checkDateStr)) {
          streak++;
        } else {
          break;
        }
      }

      return {
        ...habit,
        completions: newCompletions,
        streak,
        longestStreak: Math.max(habit.longestStreak, streak)
      };
    }));
  }, []);

  const removeCompletion = useCallback((id: UUID, date: Date) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;

      const targetDate = new Date(date).toDateString();
      const newCompletions = habit.completions.filter(
        completion => new Date(completion).toDateString() !== targetDate
      );

      // Recalculate streak
      let streak = 0;
      const sortedDates = newCompletions.map(d => new Date(d).toDateString());

      for (let i = 0; i < 365; i++) { // Check last year
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toDateString();

        if (sortedDates.includes(checkDateStr)) {
          streak++;
        } else {
          break;
        }
      }

      return {
        ...habit,
        completions: newCompletions,
        streak
      };
    }));
  }, []);

  const getHabitProgress = useCallback((id: UUID, period: 'week' | 'month' | 'year' = 'week') => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return null;

    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const completionsInPeriod = habit.completions.filter(
      completion => new Date(completion) >= periodStart
    ).length;

    const daysInPeriod = Math.ceil((now.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    let expectedCompletions = 0;

    if (habit.frequency === 'daily') {
      expectedCompletions = daysInPeriod;
    } else if (habit.frequency === 'weekly') {
      expectedCompletions = Math.ceil(daysInPeriod / 7) * habit.target;
    }

    return {
      completed: completionsInPeriod,
      expected: expectedCompletions,
      rate: expectedCompletions > 0 ? completionsInPeriod / expectedCompletions : 0
    };
  }, [habits]);

  const isCompletedToday = useCallback((id: UUID) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return false;

    const today = new Date().toDateString();
    return habit.completions.some(
      completion => new Date(completion).toDateString() === today
    );
  }, [habits]);

  const getActiveHabits = useCallback(() => {
    return habits.filter(habit => habit.isActive);
  }, [habits]);

  const getHabitsByCategory = useCallback((category: string) => {
    return habits.filter(habit => habit.category === category);
  }, [habits]);

  // Analytics
  const analytics = useMemo(() => {
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const completedToday = habits.filter(h => isCompletedToday(h.id)).length;
    const avgStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
      : 0;

    return {
      totalHabits,
      activeHabits,
      completedToday,
      completionRate: activeHabits > 0 ? completedToday / activeHabits : 0,
      avgStreak
    };
  }, [habits, isCompletedToday]);

  return {
    habits,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCompletion,
    removeCompletion,
    getHabitProgress,
    isCompletedToday,
    getActiveHabits,
    getHabitsByCategory,
    analytics
  };
}

// MARK: - Goal Management Hook

/**
 * Goal tracking with milestones, progress analytics, and smart insights
 */
export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const createGoal = useCallback((goalData: Omit<Goal, 'id' | 'progress' | 'current' | 'milestones' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      progress: 0,
      current: 0,
      milestones: [],
      createdAt: new Date()
    };

    setGoals(prev => [...prev, newGoal]);
    return newGoal.id;
  }, []);

  const updateGoal = useCallback((id: UUID, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== id) return goal;

      const updatedGoal = { ...goal, ...updates };

      // Recalculate progress if current or target changed
      if ('current' in updates || 'target' in updates) {
        updatedGoal.progress = Math.min(100, (updatedGoal.current / updatedGoal.target) * 100);

        // Check if goal is completed
        if (updatedGoal.progress >= 100 && updatedGoal.status === 'active') {
          updatedGoal.status = 'completed';
        }
      }

      return updatedGoal;
    }));
  }, []);

  const deleteGoal = useCallback((id: UUID) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  const updateProgress = useCallback((id: UUID, newCurrent: number) => {
    updateGoal(id, { current: newCurrent });
  }, [updateGoal]);

  const incrementProgress = useCallback((id: UUID, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateProgress(id, goal.current + amount);
    }
  }, [goals, updateProgress]);

  const addMilestone = useCallback((goalId: UUID, milestone: Omit<Milestone, 'id' | 'completed'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      completed: false
    };

    updateGoal(goalId, {
      milestones: [...(goals.find(g => g.id === goalId)?.milestones || []), newMilestone]
    });

    return newMilestone.id;
  }, [goals, updateGoal]);

  const completeMilestone = useCallback((goalId: UUID, milestoneId: UUID) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, completed: true, completedAt: new Date() }
        : milestone
    );

    updateGoal(goalId, { milestones: updatedMilestones });
  }, [goals, updateGoal]);

  const getGoalsByStatus = useCallback((status: Goal['status']) => {
    return goals.filter(goal => goal.status === status);
  }, [goals]);

  const getGoalsByType = useCallback((type: Goal['type']) => {
    return goals.filter(goal => goal.type === type);
  }, [goals]);

  const getOverdueGoals = useCallback(() => {
    const now = new Date();
    return goals.filter(goal =>
      goal.deadline &&
      goal.deadline < now &&
      goal.status === 'active' &&
      goal.progress < 100
    );
  }, [goals]);

  const getUpcomingDeadlines = useCallback((days = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return goals.filter(goal =>
      goal.deadline &&
      goal.deadline >= new Date() &&
      goal.deadline <= futureDate &&
      goal.status === 'active'
    );
  }, [goals]);

  // Analytics
  const analytics = useMemo(() => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const avgProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
      : 0;

    const completedMilestones = goals.reduce(
      (sum, goal) => sum + goal.milestones.filter(m => m.completed).length,
      0
    );
    const totalMilestones = goals.reduce((sum, goal) => sum + goal.milestones.length, 0);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      completionRate: totalGoals > 0 ? completedGoals / totalGoals : 0,
      avgProgress,
      milestoneCompletionRate: totalMilestones > 0 ? completedMilestones / totalMilestones : 0
    };
  }, [goals]);

  return {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    incrementProgress,
    addMilestone,
    completeMilestone,
    getGoalsByStatus,
    getGoalsByType,
    getOverdueGoals,
    getUpcomingDeadlines,
    analytics
  };
}

// MARK: - Project Management Hook

/**
 * Project management with task integration and progress tracking
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'progress' | 'taskIds' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      progress: 0,
      taskIds: [],
      createdAt: new Date()
    };

    setProjects(prev => [...prev, newProject]);
    return newProject.id;
  }, []);

  const updateProject = useCallback((id: UUID, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects(prev => prev.map(project =>
      project.id === id ? { ...project, ...updates } : project
    ));
  }, []);

  const deleteProject = useCallback((id: UUID) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, []);

  const addTaskToProject = useCallback((projectId: UUID, taskId: UUID) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, taskIds: [...project.taskIds, taskId] }
        : project
    ));
  }, []);

  const removeTaskFromProject = useCallback((projectId: UUID, taskId: UUID) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, taskIds: project.taskIds.filter(id => id !== taskId) }
        : project
    ));
  }, []);

  const calculateProgress = useCallback((projectId: UUID, allTasks: Task[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.taskIds.length === 0) return 0;

    const projectTasks = allTasks.filter(task => project.taskIds.includes(task.id));
    if (projectTasks.length === 0) return 0;

    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, [projects]);

  const updateProjectProgress = useCallback((projectId: UUID, allTasks: Task[]) => {
    const progress = calculateProgress(projectId, allTasks);
    updateProject(projectId, { progress });
  }, [calculateProgress, updateProject]);

  const getProjectsByStatus = useCallback((status: Project['status']) => {
    return projects.filter(project => project.status === status);
  }, [projects]);

  const getActiveProjects = useCallback(() => {
    return projects.filter(project => project.status === 'active');
  }, [projects]);

  const getOverdueProjects = useCallback(() => {
    const now = new Date();
    return projects.filter(project =>
      project.deadline &&
      project.deadline < now &&
      project.status === 'active' &&
      project.progress < 100
    );
  }, [projects]);

  // Analytics
  const analytics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const avgProgress = projects.length > 0
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      completionRate: totalProjects > 0 ? completedProjects / totalProjects : 0,
      avgProgress
    };
  }, [projects]);

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    removeTaskFromProject,
    calculateProgress,
    updateProjectProgress,
    getProjectsByStatus,
    getActiveProjects,
    getOverdueProjects,
    analytics
  };
}

// MARK: - Time Tracking Hook

/**
 * Time tracking with automatic task association and analytics
 */
export function useTimeTracking() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = useCallback((
    category: string,
    description?: string,
    taskId?: UUID,
    projectId?: UUID
  ) => {
    // Stop any existing tracking
    if (activeEntry) {
      stopTracking();
    }

    const newEntry: TimeEntry = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      taskId,
      projectId,
      category,
      description,
      startTime: new Date(),
      isTracking: true
    };

    setActiveEntry(newEntry);
    setTimeEntries(prev => [...prev, newEntry]);

    // Start interval to update duration
    intervalRef.current = setInterval(() => {
      setActiveEntry(prev => prev ? {
        ...prev,
        duration: Math.floor((Date.now() - prev.startTime.getTime()) / 60000) // minutes
      } : null);
    }, 1000);

    return newEntry.id;
  }, [activeEntry]);

  const stopTracking = useCallback(() => {
    if (!activeEntry) return null;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 60000);

    const completedEntry: TimeEntry = {
      ...activeEntry,
      endTime,
      duration,
      isTracking: false
    };

    setTimeEntries(prev => prev.map(entry =>
      entry.id === activeEntry.id ? completedEntry : entry
    ));

    setActiveEntry(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return completedEntry;
  }, [activeEntry]);

  const updateTimeEntry = useCallback((id: UUID, updates: Partial<Omit<TimeEntry, 'id'>>) => {
    setTimeEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ));

    if (activeEntry?.id === id) {
      setActiveEntry(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeEntry]);

  const deleteTimeEntry = useCallback((id: UUID) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));

    if (activeEntry?.id === id) {
      setActiveEntry(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [activeEntry]);

  const getTimeByTask = useCallback((taskId: UUID) => {
    return timeEntries
      .filter(entry => entry.taskId === taskId && entry.duration)
      .reduce((total, entry) => total + entry.duration!, 0);
  }, [timeEntries]);

  const getTimeByProject = useCallback((projectId: UUID) => {
    return timeEntries
      .filter(entry => entry.projectId === projectId && entry.duration)
      .reduce((total, entry) => total + entry.duration!, 0);
  }, [timeEntries]);

  const getTimeByCategory = useCallback((category: string) => {
    return timeEntries
      .filter(entry => entry.category === category && entry.duration)
      .reduce((total, entry) => total + entry.duration!, 0);
  }, [timeEntries]);

  const getTimeInRange = useCallback((start: Date, end: Date) => {
    return timeEntries.filter(entry =>
      entry.startTime >= start && entry.startTime <= end
    );
  }, [timeEntries]);

  // Analytics
  const analytics = useMemo(() => {
    const totalEntries = timeEntries.length;
    const totalTime = timeEntries
      .filter(entry => entry.duration)
      .reduce((sum, entry) => sum + entry.duration!, 0);

    const avgSessionLength = totalEntries > 0 ? totalTime / totalEntries : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntries = timeEntries.filter(entry => entry.startTime >= today);
    const todayTime = todayEntries
      .filter(entry => entry.duration)
      .reduce((sum, entry) => sum + entry.duration!, 0);

    return {
      totalEntries,
      totalTime,
      avgSessionLength,
      todayTime,
      isTracking: activeEntry !== null,
      currentSessionDuration: activeEntry?.duration || 0
    };
  }, [timeEntries, activeEntry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeEntries,
    activeEntry,
    startTracking,
    stopTracking,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeByTask,
    getTimeByProject,
    getTimeByCategory,
    getTimeInRange,
    analytics,
    isTracking: activeEntry !== null
  };
}

// MARK: - Export All Hooks

export const BusinessLogicHooks = {
  useTasks,
  useHabits,
  useGoals,
  useProjects,
  useTimeTracking
};

export default BusinessLogicHooks;