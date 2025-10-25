/**
 * Comprehensive test datasets for intent recognition system
 * Used to validate accuracy and identify misclassification patterns
 */

// Simple string-based intent type for testing
export type TestIntent =
  | 'task_creation'
  | 'task_query'
  | 'task_update'
  | 'goal_setting'
  | 'goal_tracking'
  | 'note_taking'
  | 'note_search'
  | 'schedule_management'
  | 'schedule_query'
  | 'habit_tracking'
  | 'habit_query'
  | 'analytics_request'
  | 'workflow_optimization'
  | 'general_assistance';

export interface IntentTestCase {
  input: string;
  expectedIntent: TestIntent;
  expectedConfidence?: number; // Minimum expected confidence (0-1)
  description: string;
  category: 'basic' | 'edge_case' | 'ambiguous' | 'multilingual' | 'typos' | 'slang';
  language?: string;
}

// Basic intent recognition test cases
export const basicIntentTests: IntentTestCase[] = [
  // Task Management
  {
    input: "I need to create a new task",
    expectedIntent: "task_creation",
    expectedConfidence: 0.9,
    description: "Direct task creation request",
    category: "basic"
  },
  {
    input: "Add a todo item",
    expectedIntent: "task_creation",
    expectedConfidence: 0.8,
    description: "Alternative task creation phrasing",
    category: "basic"
  },
  {
    input: "What are my tasks for today?",
    expectedIntent: "task_query",
    expectedConfidence: 0.85,
    description: "Task listing request",
    category: "basic"
  },
  {
    input: "Mark this task as complete",
    expectedIntent: "task_update",
    expectedConfidence: 0.9,
    description: "Task completion request",
    category: "basic"
  },

  // Goal Setting
  {
    input: "I want to set a new goal",
    expectedIntent: "goal_setting",
    expectedConfidence: 0.9,
    description: "Direct goal creation",
    category: "basic"
  },
  {
    input: "Help me plan my objectives",
    expectedIntent: "goal_setting",
    expectedConfidence: 0.8,
    description: "Goal planning request",
    category: "basic"
  },
  {
    input: "Show me my progress on goals",
    expectedIntent: "goal_tracking",
    expectedConfidence: 0.85,
    description: "Goal progress inquiry",
    category: "basic"
  },

  // Note Taking
  {
    input: "I need to write a quick note",
    expectedIntent: "note_taking",
    expectedConfidence: 0.9,
    description: "Note creation request",
    category: "basic"
  },
  {
    input: "Capture this thought",
    expectedIntent: "note_taking",
    expectedConfidence: 0.8,
    description: "Thought capture request",
    category: "basic"
  },
  {
    input: "Find my notes about the meeting",
    expectedIntent: "note_search",
    expectedConfidence: 0.85,
    description: "Note search request",
    category: "basic"
  },

  // Schedule Management
  {
    input: "Schedule a meeting for tomorrow",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.9,
    description: "Meeting scheduling",
    category: "basic"
  },
  {
    input: "What's on my calendar today?",
    expectedIntent: "schedule_query",
    expectedConfidence: 0.85,
    description: "Calendar inquiry",
    category: "basic"
  },
  {
    input: "Block time for deep work",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.8,
    description: "Time blocking request",
    category: "basic"
  },

  // Habit Tracking
  {
    input: "Track my morning routine",
    expectedIntent: "habit_tracking",
    expectedConfidence: 0.9,
    description: "Habit tracking request",
    category: "basic"
  },
  {
    input: "Did I complete my habits today?",
    expectedIntent: "habit_query",
    expectedConfidence: 0.85,
    description: "Habit completion check",
    category: "basic"
  },

  // Analytics & Insights
  {
    input: "Show me my productivity trends",
    expectedIntent: "analytics_request",
    expectedConfidence: 0.9,
    description: "Analytics request",
    category: "basic"
  },
  {
    input: "How productive was I last week?",
    expectedIntent: "analytics_request",
    expectedConfidence: 0.85,
    description: "Productivity analysis",
    category: "basic"
  },

  // Workflow Optimization
  {
    input: "Help me optimize my workflow",
    expectedIntent: "workflow_optimization",
    expectedConfidence: 0.8,
    description: "Workflow improvement request",
    category: "basic"
  },
  {
    input: "Suggest improvements to my process",
    expectedIntent: "workflow_optimization",
    expectedConfidence: 0.75,
    description: "Process improvement suggestion",
    category: "basic"
  }
];

// Edge cases and ambiguous inputs
export const edgeCaseTests: IntentTestCase[] = [
  {
    input: "task",
    expectedIntent: "task_creation",
    expectedConfidence: 0.5,
    description: "Single word input",
    category: "edge_case"
  },
  {
    input: "",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.3,
    description: "Empty input",
    category: "edge_case"
  },
  {
    input: "12345",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.3,
    description: "Numeric input",
    category: "edge_case"
  },
  {
    input: "!!!???",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.3,
    description: "Special characters only",
    category: "edge_case"
  },
  {
    input: "I want to create a task goal note schedule habit",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.4,
    description: "Multiple conflicting intents",
    category: "ambiguous"
  },
  {
    input: "Can you help me with something?",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.7,
    description: "Vague assistance request",
    category: "ambiguous"
  },
  {
    input: "I need to do stuff",
    expectedIntent: "general_assistance",
    expectedConfidence: 0.5,
    description: "Vague action request",
    category: "ambiguous"
  }
];

// Typos and misspellings
export const typoTests: IntentTestCase[] = [
  {
    input: "creat a new taks",
    expectedIntent: "task_creation",
    expectedConfidence: 0.7,
    description: "Typos in task creation",
    category: "typos"
  },
  {
    input: "shedule a meting",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.7,
    description: "Typos in scheduling",
    category: "typos"
  },
  {
    input: "wright a note",
    expectedIntent: "note_taking",
    expectedConfidence: 0.7,
    description: "Typos in note taking",
    category: "typos"
  },
  {
    input: "set a gole",
    expectedIntent: "goal_setting",
    expectedConfidence: 0.7,
    description: "Typos in goal setting",
    category: "typos"
  },
  {
    input: "trak my habbit",
    expectedIntent: "habit_tracking",
    expectedConfidence: 0.7,
    description: "Typos in habit tracking",
    category: "typos"
  }
];

// Slang and informal language
export const slangTests: IntentTestCase[] = [
  {
    input: "lemme add a todo",
    expectedIntent: "task_creation",
    expectedConfidence: 0.7,
    description: "Informal task creation",
    category: "slang"
  },
  {
    input: "gotta jot down this idea",
    expectedIntent: "note_taking",
    expectedConfidence: 0.7,
    description: "Informal note taking",
    category: "slang"
  },
  {
    input: "wanna check my schedule",
    expectedIntent: "schedule_query",
    expectedConfidence: 0.7,
    description: "Informal schedule check",
    category: "slang"
  },
  {
    input: "need to crush some goals",
    expectedIntent: "goal_setting",
    expectedConfidence: 0.6,
    description: "Slang goal setting",
    category: "slang"
  },
  {
    input: "how's my productivity game?",
    expectedIntent: "analytics_request",
    expectedConfidence: 0.6,
    description: "Slang analytics request",
    category: "slang"
  }
];

// Multilingual tests (basic examples)
export const multilingualTests: IntentTestCase[] = [
  // Spanish
  {
    input: "crear una nueva tarea",
    expectedIntent: "task_creation",
    expectedConfidence: 0.8,
    description: "Task creation in Spanish",
    category: "multilingual",
    language: "es"
  },
  {
    input: "programar una reunión",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.8,
    description: "Schedule management in Spanish",
    category: "multilingual",
    language: "es"
  },

  // French
  {
    input: "créer une nouvelle tâche",
    expectedIntent: "task_creation",
    expectedConfidence: 0.8,
    description: "Task creation in French",
    category: "multilingual",
    language: "fr"
  },
  {
    input: "planifier une réunion",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.8,
    description: "Schedule management in French",
    category: "multilingual",
    language: "fr"
  },

  // German
  {
    input: "eine neue Aufgabe erstellen",
    expectedIntent: "task_creation",
    expectedConfidence: 0.8,
    description: "Task creation in German",
    category: "multilingual",
    language: "de"
  },
  {
    input: "einen Termin planen",
    expectedIntent: "schedule_management",
    expectedConfidence: 0.8,
    description: "Schedule management in German",
    category: "multilingual",
    language: "de"
  }
];

// Context-dependent tests
export const contextualTests: IntentTestCase[] = [
  {
    input: "add it to my list",
    expectedIntent: "task_creation",
    expectedConfidence: 0.6,
    description: "Context-dependent task creation",
    category: "ambiguous"
  },
  {
    input: "when is it scheduled?",
    expectedIntent: "schedule_query",
    expectedConfidence: 0.6,
    description: "Context-dependent schedule query",
    category: "ambiguous"
  },
  {
    input: "how am I doing?",
    expectedIntent: "analytics_request",
    expectedConfidence: 0.5,
    description: "Context-dependent progress check",
    category: "ambiguous"
  },
  {
    input: "remind me about this",
    expectedIntent: "task_creation",
    expectedConfidence: 0.6,
    description: "Context-dependent reminder creation",
    category: "ambiguous"
  }
];

// Complex multi-intent inputs
export const complexTests: IntentTestCase[] = [
  {
    input: "I need to create a task and schedule time to work on it",
    expectedIntent: "task_creation", // Primary intent
    expectedConfidence: 0.7,
    description: "Multiple related intents - task creation primary",
    category: "ambiguous"
  },
  {
    input: "Set a goal to exercise daily and track it as a habit",
    expectedIntent: "goal_setting", // Primary intent
    expectedConfidence: 0.7,
    description: "Multiple related intents - goal setting primary",
    category: "ambiguous"
  },
  {
    input: "Write a note about the meeting and add follow-up tasks",
    expectedIntent: "note_taking", // Primary intent
    expectedConfidence: 0.7,
    description: "Multiple related intents - note taking primary",
    category: "ambiguous"
  }
];

// All test datasets combined
export const allTestDatasets = {
  basic: basicIntentTests,
  edgeCases: edgeCaseTests,
  typos: typoTests,
  slang: slangTests,
  multilingual: multilingualTests,
  contextual: contextualTests,
  complex: complexTests
};

// Utility function to get all test cases
export const getAllTestCases = (): IntentTestCase[] => {
  return Object.values(allTestDatasets).flat();
};

// Utility function to get test cases by category
export const getTestCasesByCategory = (category: IntentTestCase['category']): IntentTestCase[] => {
  return getAllTestCases().filter(testCase => testCase.category === category);
};

// Utility function to get test cases by intent
export const getTestCasesByIntent = (intent: TestIntent): IntentTestCase[] => {
  return getAllTestCases().filter(testCase => testCase.expectedIntent === intent);
};

// Test dataset statistics
export const getDatasetStats = () => {
  const allCases = getAllTestCases();
  const byCategory = Object.groupBy(allCases, (testCase) => testCase.category);
  const byIntent = Object.groupBy(allCases, (testCase) => testCase.expectedIntent);

  return {
    totalTests: allCases.length,
    byCategory: Object.fromEntries(
      Object.entries(byCategory).map(([category, cases]) => [category, cases?.length || 0])
    ),
    byIntent: Object.fromEntries(
      Object.entries(byIntent).map(([intent, cases]) => [intent, cases?.length || 0])
    ),
    languages: [...new Set(allCases.map(tc => tc.language).filter(Boolean))],
    avgExpectedConfidence: allCases
      .filter(tc => tc.expectedConfidence)
      .reduce((sum, tc) => sum + (tc.expectedConfidence || 0), 0) /
      allCases.filter(tc => tc.expectedConfidence).length
  };
};