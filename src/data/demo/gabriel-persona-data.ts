// Minimal demo data stub - all demo data has been removed for production

export const gabrielPersona = {
  user: {
    id: "",
    email: "",
    full_name: "",
    avatar_url: "",
  },
  goals: [],
  tasks: [],
  habits: [],
  recentCaptures: [],
  todayFocus: [],
  todayStats: [],
  weeklyOverview: {
    tasksCompleted: { current: 0, total: 0 },
    habitStreak: 0,
    goalsProgress: "0%",
    aiInteractions: 0,
    automationWorkflows: 0,
  },
  projects: [],
  analytics: {
    goals: { total: 0, completed: 0, in_progress: 0, overdue: 0 },
    tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
    habits: { total: 0, active: 0, completed_today: 0, average_streak: 0 },
    productivity: { score: 0, trend: "neutral", weekly_average: 0 },
    ai_usage: { daily_interactions: 0, weekly_interactions: 0, automations_created: 0, prompts_optimized: 0 },
  },
};

export default gabrielPersona;