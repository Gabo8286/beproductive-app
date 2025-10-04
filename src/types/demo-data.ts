// Demo Data Types
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
  };
  avatar: string;
  joinDate: string;
  lastActive: string;
}

export interface DemoTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  category: string;
  estimatedTime?: number;
  actualTime?: number;
  tags: string[];
}

export interface DemoGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  category: string;
  milestones: Array<{
    title: string;
    completed: boolean;
    date?: string;
  }>;
}

export interface DemoHabit {
  id: string;
  title: string;
  description: string;
  completions: string[];
  target: number;
  frequency: "daily" | "weekly" | "weekdays";
  streak: number;
}

export interface DemoTimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  description: string;
}

export interface DemoNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoActivityData {
  tasks: DemoTask[];
  goals: DemoGoal[];
  habits: DemoHabit[];
  timeEntries: DemoTimeEntry[];
  notes: DemoNote[];
}

export interface DemoStatistics {
  totalTasks: number;
  completedTasks: number;
  totalGoals: number;
  avgGoalProgress: number;
  totalHabits: number;
  habitStreak: number;
  totalTimeTracked: number;
}

export interface PersonaDemoData {
  user: DemoUser;
  activityData: DemoActivityData;
  statistics: DemoStatistics;
}

export interface AllDemoData {
  sarah: PersonaDemoData;
  marcus: PersonaDemoData;
  elena: PersonaDemoData;
  james: PersonaDemoData;
  aisha: PersonaDemoData;
}

export type PersonaKey = keyof AllDemoData;

export default PersonaDemoData;
