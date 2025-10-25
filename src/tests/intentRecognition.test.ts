import { IntentRecognitionEngine } from '@/services/intentRecognition';
import { PromptCategory, UserIntent, AppContext } from '@/types/promptLibrary';

// Test datasets for each category
export const TEST_DATASETS = {
  task_management: [
    // Creating tasks
    { input: "Create a task to finish the project report", expected: { category: "task_management", action: "create" } },
    { input: "Add a new task for grocery shopping", expected: { category: "task_management", action: "create" } },
    { input: "I need to add a task to call mom", expected: { category: "task_management", action: "create" } },
    { input: "Make a task for the dentist appointment", expected: { category: "task_management", action: "create" } },
    { input: "Create todo item: review quarterly budget", expected: { category: "task_management", action: "create" } },

    // Organizing tasks
    { input: "Help me organize my daily tasks", expected: { category: "task_management", action: "organize" } },
    { input: "Prioritize my task list for today", expected: { category: "task_management", action: "organize" } },
    { input: "Sort my tasks by importance", expected: { category: "task_management", action: "organize" } },
    { input: "Arrange my todos by deadline", expected: { category: "task_management", action: "organize" } },
    { input: "Help me structure my work tasks", expected: { category: "task_management", action: "organize" } },

    // Completing tasks
    { input: "Mark project planning as done", expected: { category: "task_management", action: "complete" } },
    { input: "Complete the email task", expected: { category: "task_management", action: "complete" } },
    { input: "Finish the presentation task", expected: { category: "task_management", action: "complete" } },
    { input: "Check off buy birthday gift", expected: { category: "task_management", action: "complete" } },

    // Updating tasks
    { input: "Update the deadline for my report", expected: { category: "task_management", action: "update" } },
    { input: "Change the priority of website redesign", expected: { category: "task_management", action: "update" } },
    { input: "Modify the meeting task details", expected: { category: "task_management", action: "update" } },
    { input: "Edit the task description", expected: { category: "task_management", action: "update" } },

    // Reviewing tasks
    { input: "Show me my overdue tasks", expected: { category: "task_management", action: "review" } },
    { input: "What tasks do I have today?", expected: { category: "task_management", action: "review" } },
    { input: "List my upcoming deadlines", expected: { category: "task_management", action: "review" } },
    { input: "Review my task progress", expected: { category: "task_management", action: "review" } }
  ],

  goal_setting: [
    // Creating goals
    { input: "Set a goal to lose 10 pounds", expected: { category: "goal_setting", action: "create" } },
    { input: "Create a goal for learning Spanish", expected: { category: "goal_setting", action: "create" } },
    { input: "I want to set a career advancement goal", expected: { category: "goal_setting", action: "create" } },
    { input: "Make a goal to read 24 books this year", expected: { category: "goal_setting", action: "create" } },
    { input: "Set an objective to save $5000", expected: { category: "goal_setting", action: "create" } },

    // Tracking goals
    { input: "Track my fitness goal progress", expected: { category: "goal_setting", action: "track" } },
    { input: "How am I doing with my reading goal?", expected: { category: "goal_setting", action: "track" } },
    { input: "Monitor my savings progress", expected: { category: "goal_setting", action: "track" } },
    { input: "Check my language learning milestone", expected: { category: "goal_setting", action: "track" } },

    // Updating goals
    { input: "Update my weight loss target", expected: { category: "goal_setting", action: "update" } },
    { input: "Modify my career goal timeline", expected: { category: "goal_setting", action: "update" } },
    { input: "Adjust my reading goal to 30 books", expected: { category: "goal_setting", action: "update" } },
    { input: "Change my savings target amount", expected: { category: "goal_setting", action: "update" } },

    // Planning goals
    { input: "Help me plan my fitness journey", expected: { category: "goal_setting", action: "plan" } },
    { input: "Create a roadmap for my business goal", expected: { category: "goal_setting", action: "plan" } },
    { input: "Plan steps to achieve my certification", expected: { category: "goal_setting", action: "plan" } },
    { input: "Break down my skill development goal", expected: { category: "goal_setting", action: "plan" } }
  ],

  planning: [
    // Daily planning
    { input: "Plan my day tomorrow", expected: { category: "planning", action: "daily" } },
    { input: "Help me schedule today's activities", expected: { category: "planning", action: "daily" } },
    { input: "Organize my schedule for Monday", expected: { category: "planning", action: "daily" } },
    { input: "Plan my morning routine", expected: { category: "planning", action: "daily" } },

    // Weekly planning
    { input: "Plan my week ahead", expected: { category: "planning", action: "weekly" } },
    { input: "Schedule my weekly meetings", expected: { category: "planning", action: "weekly" } },
    { input: "Organize next week's priorities", expected: { category: "planning", action: "weekly" } },
    { input: "Plan my workout schedule for the week", expected: { category: "planning", action: "weekly" } },

    // Monthly planning
    { input: "Plan my monthly goals", expected: { category: "planning", action: "monthly" } },
    { input: "Schedule monthly team meetings", expected: { category: "planning", action: "monthly" } },
    { input: "Plan my budget for next month", expected: { category: "planning", action: "monthly" } },
    { input: "Organize monthly project milestones", expected: { category: "planning", action: "monthly" } },

    // Event planning
    { input: "Plan my vacation itinerary", expected: { category: "planning", action: "event" } },
    { input: "Schedule my birthday party", expected: { category: "planning", action: "event" } },
    { input: "Plan the team retreat agenda", expected: { category: "planning", action: "event" } },
    { input: "Organize the conference schedule", expected: { category: "planning", action: "event" } }
  ],

  analytics: [
    // Performance analysis
    { input: "Analyze my productivity trends", expected: { category: "analytics", action: "analyze" } },
    { input: "Show me my task completion rate", expected: { category: "analytics", action: "analyze" } },
    { input: "Review my goal achievement statistics", expected: { category: "analytics", action: "analyze" } },
    { input: "Analyze my time usage patterns", expected: { category: "analytics", action: "analyze" } },

    // Reports
    { input: "Generate my weekly productivity report", expected: { category: "analytics", action: "report" } },
    { input: "Create a monthly summary of my progress", expected: { category: "analytics", action: "report" } },
    { input: "Show me my habit tracking report", expected: { category: "analytics", action: "report" } },
    { input: "Generate a task completion summary", expected: { category: "analytics", action: "report" } },

    // Insights
    { input: "What insights can you share about my productivity?", expected: { category: "analytics", action: "insights" } },
    { input: "Give me recommendations based on my data", expected: { category: "analytics", action: "insights" } },
    { input: "What patterns do you see in my work habits?", expected: { category: "analytics", action: "insights" } },
    { input: "Provide insights on my goal progress", expected: { category: "analytics", action: "insights" } },

    // Comparisons
    { input: "Compare this month to last month", expected: { category: "analytics", action: "compare" } },
    { input: "Show the difference in my productivity", expected: { category: "analytics", action: "compare" } },
    { input: "Compare my current vs target performance", expected: { category: "analytics", action: "compare" } },
    { input: "Analyze my improvement over time", expected: { category: "analytics", action: "compare" } }
  ],

  habit_formation: [
    // Creating habits
    { input: "Create a habit to drink more water", expected: { category: "habit_formation", action: "create" } },
    { input: "Start a reading habit", expected: { category: "habit_formation", action: "create" } },
    { input: "Begin a meditation routine", expected: { category: "habit_formation", action: "create" } },
    { input: "Establish a morning exercise habit", expected: { category: "habit_formation", action: "create" } },

    // Tracking habits
    { input: "Track my daily water intake", expected: { category: "habit_formation", action: "track" } },
    { input: "Log my meditation session", expected: { category: "habit_formation", action: "track" } },
    { input: "Record my workout completion", expected: { category: "habit_formation", action: "track" } },
    { input: "Mark my reading habit as done", expected: { category: "habit_formation", action: "track" } },

    // Building habits
    { input: "Help me build a consistent sleep schedule", expected: { category: "habit_formation", action: "build" } },
    { input: "Strengthen my journaling habit", expected: { category: "habit_formation", action: "build" } },
    { input: "Develop a study routine", expected: { category: "habit_formation", action: "build" } },
    { input: "Build momentum with my exercise habit", expected: { category: "habit_formation", action: "build" } },

    // Breaking habits
    { input: "Help me quit social media scrolling", expected: { category: "habit_formation", action: "break" } },
    { input: "Stop my late-night snacking habit", expected: { category: "habit_formation", action: "break" } },
    { input: "Break the habit of checking email constantly", expected: { category: "habit_formation", action: "break" } },
    { input: "Eliminate my procrastination pattern", expected: { category: "habit_formation", action: "break" } }
  ],

  workflow: [
    // Process optimization
    { input: "Optimize my morning workflow", expected: { category: "workflow", action: "optimize" } },
    { input: "Streamline my email processing", expected: { category: "workflow", action: "optimize" } },
    { input: "Improve my project management process", expected: { category: "workflow", action: "optimize" } },
    { input: "Enhance my content creation workflow", expected: { category: "workflow", action: "optimize" } },

    // Automation
    { input: "Automate my recurring tasks", expected: { category: "workflow", action: "automate" } },
    { input: "Set up automatic reminders", expected: { category: "workflow", action: "automate" } },
    { input: "Create templates for common processes", expected: { category: "workflow", action: "automate" } },
    { input: "Build shortcuts for frequent actions", expected: { category: "workflow", action: "automate" } },

    // Integration
    { input: "Connect my tools and apps", expected: { category: "workflow", action: "integrate" } },
    { input: "Sync my calendar with task management", expected: { category: "workflow", action: "integrate" } },
    { input: "Link my note-taking to project planning", expected: { category: "workflow", action: "integrate" } },
    { input: "Combine my productivity systems", expected: { category: "workflow", action: "integrate" } },

    // Design
    { input: "Design a better review process", expected: { category: "workflow", action: "design" } },
    { input: "Create a new client onboarding workflow", expected: { category: "workflow", action: "design" } },
    { input: "Build a content publication process", expected: { category: "workflow", action: "design" } },
    { input: "Structure my weekly planning routine", expected: { category: "workflow", action: "design" } }
  ],

  general: [
    // Help requests
    { input: "Help me be more productive", expected: { category: "general", action: "help" } },
    { input: "I need assistance with my work", expected: { category: "general", action: "help" } },
    { input: "Can you help me get organized?", expected: { category: "general", action: "help" } },
    { input: "I'm struggling with time management", expected: { category: "general", action: "help" } },

    // Explanations
    { input: "Explain the BeProductive features", expected: { category: "general", action: "explain" } },
    { input: "What can you do for me?", expected: { category: "general", action: "explain" } },
    { input: "How does this app work?", expected: { category: "general", action: "explain" } },
    { input: "Tell me about productivity methods", expected: { category: "general", action: "explain" } },

    // Guidance
    { input: "Guide me through setting up my workspace", expected: { category: "general", action: "guide" } },
    { input: "Walk me through the planning process", expected: { category: "general", action: "guide" } },
    { input: "Show me how to get started", expected: { category: "general", action: "guide" } },
    { input: "Take me through the features step by step", expected: { category: "general", action: "guide" } }
  ]
};

// Edge cases and ambiguous inputs
export const EDGE_CASE_TESTS = [
  // Ambiguous inputs that could match multiple categories
  { input: "schedule a meeting", expected: { category: "planning", action: "event" } },
  { input: "track my progress", expected: { category: "goal_setting", action: "track" } },
  { input: "organize my workspace", expected: { category: "workflow", action: "optimize" } },
  { input: "review my performance", expected: { category: "analytics", action: "analyze" } },

  // Very short inputs
  { input: "plan", expected: { category: "planning", action: "daily" } },
  { input: "task", expected: { category: "task_management", action: "create" } },
  { input: "goal", expected: { category: "goal_setting", action: "create" } },
  { input: "habit", expected: { category: "habit_formation", action: "create" } },

  // Complex, multi-intent inputs
  { input: "I want to create a task and set a goal to complete it by Friday", expected: { category: "task_management", action: "create" } },
  { input: "Help me plan my week and track my habits", expected: { category: "planning", action: "weekly" } },
  { input: "Analyze my task completion and suggest workflow improvements", expected: { category: "analytics", action: "analyze" } },

  // Informal/casual language
  { input: "wanna add a todo", expected: { category: "task_management", action: "create" } },
  { input: "lemme check my goals", expected: { category: "goal_setting", action: "track" } },
  { input: "gotta plan my day", expected: { category: "planning", action: "daily" } },
  { input: "need to fix my routine", expected: { category: "habit_formation", action: "build" } },

  // Question formats
  { input: "How can I improve my productivity?", expected: { category: "general", action: "help" } },
  { input: "What tasks are due today?", expected: { category: "task_management", action: "review" } },
  { input: "When should I schedule my workout?", expected: { category: "planning", action: "daily" } },
  { input: "Why am I not reaching my goals?", expected: { category: "analytics", action: "insights" } }
];

// Multilingual test cases
export const MULTILINGUAL_TESTS = [
  // Spanish
  { input: "crear una tarea", expected: { category: "task_management", action: "create" } },
  { input: "establecer una meta", expected: { category: "goal_setting", action: "create" } },
  { input: "planificar mi día", expected: { category: "planning", action: "daily" } },

  // French
  { input: "créer une tâche", expected: { category: "task_management", action: "create" } },
  { input: "fixer un objectif", expected: { category: "goal_setting", action: "create" } },
  { input: "planifier ma journée", expected: { category: "planning", action: "daily" } },

  // German
  { input: "Aufgabe erstellen", expected: { category: "task_management", action: "create" } },
  { input: "Ziel setzen", expected: { category: "goal_setting", action: "create" } },
  { input: "Tag planen", expected: { category: "planning", action: "daily" } },

  // Portuguese
  { input: "criar tarefa", expected: { category: "task_management", action: "create" } },
  { input: "definir meta", expected: { category: "goal_setting", action: "create" } },
  { input: "planejar dia", expected: { category: "planning", action: "daily" } }
];

// Context-dependent test cases
export const CONTEXT_DEPENDENT_TESTS = [
  // Same input, different expected results based on context
  {
    input: "add this to my list",
    contexts: [
      { module: "tasks", expected: { category: "task_management", action: "create" } },
      { module: "goals", expected: { category: "goal_setting", action: "create" } },
      { module: "habits", expected: { category: "habit_formation", action: "create" } }
    ]
  },
  {
    input: "track my progress",
    contexts: [
      { module: "goals", expected: { category: "goal_setting", action: "track" } },
      { module: "habits", expected: { category: "habit_formation", action: "track" } },
      { module: "analytics", expected: { category: "analytics", action: "analyze" } }
    ]
  },
  {
    input: "organize better",
    contexts: [
      { module: "tasks", expected: { category: "task_management", action: "organize" } },
      { module: "plan", expected: { category: "planning", action: "daily" } },
      { module: "projects", expected: { category: "workflow", action: "optimize" } }
    ]
  }
];

// Create mock app context for testing
export const createMockAppContext = (overrides: Partial<AppContext> = {}): AppContext => ({
  currentRoute: '/app/tasks',
  currentModule: 'tasks',
  userState: {
    tasks: [],
    goals: [],
    habits: [],
    projects: [],
    recentActivity: []
  },
  timeContext: {
    timeOfDay: 'morning',
    dayOfWeek: 'Monday',
    currentDate: new Date()
  },
  userPreferences: {
    language: 'en',
    timezone: 'America/New_York',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    communicationStyle: 'conversational'
  },
  sessionContext: {
    recentIntents: [],
    conversationHistory: [],
    currentFocus: 'task management'
  },
  ...overrides
});

// Test runner function
export interface TestResult {
  input: string;
  expected: { category: PromptCategory; action: string };
  actual: { category: PromptCategory; action: string };
  confidence: number;
  correct: boolean;
  context?: string;
}

export interface TestSuiteResults {
  totalTests: number;
  correctPredictions: number;
  accuracy: number;
  averageConfidence: number;
  categoryAccuracy: Record<PromptCategory, { correct: number; total: number; accuracy: number }>;
  failedTests: TestResult[];
  lowConfidenceTests: TestResult[];
  results: TestResult[];
}