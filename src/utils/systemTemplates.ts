import type {
  TemplateCategory,
  PromptCategory,
  TemplatePrompt,
  TemplateStructure,
  TemplateSection,
} from "@/types/reflections";

export interface SystemTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  prompts: TemplatePrompt[];
  structure: TemplateStructure;
  tags: string[];
  isSystem: boolean;
}

// Helper to create prompts
const createPrompt = (
  id: string,
  text: string,
  category: PromptCategory,
  required = true,
  order = 0,
): TemplatePrompt => ({
  id,
  text,
  category,
  required,
  order,
});

// Daily Templates
export const dailyGratitudeTemplate: SystemTemplate = {
  name: "Daily Gratitude & Growth",
  description:
    "Start or end your day with appreciation and reflection on growth",
  category: "daily",
  difficulty: "beginner",
  estimatedMinutes: 5,
  tags: ["gratitude", "growth", "daily", "quick"],
  isSystem: true,
  prompts: [
    createPrompt(
      "gratitude-1",
      "What are three things I'm grateful for today?",
      "gratitude",
      true,
      0,
    ),
    createPrompt(
      "wins-1",
      "What was my biggest win today, no matter how small?",
      "wins",
      true,
      1,
    ),
    createPrompt(
      "challenges-1",
      "What challenge did I face and how did I handle it?",
      "challenges",
      false,
      2,
    ),
    createPrompt(
      "learning-1",
      "What did I learn about myself today?",
      "learning",
      true,
      3,
    ),
    createPrompt(
      "planning-1",
      "What's one thing I want to focus on tomorrow?",
      "planning",
      true,
      4,
    ),
  ],
  structure: {
    sections: [
      {
        id: "gratitude",
        title: "Gratitude Practice",
        prompts: ["gratitude-1"],
        order: 0,
      },
      {
        id: "reflection",
        title: "Daily Reflection",
        prompts: ["wins-1", "challenges-1", "learning-1"],
        order: 1,
      },
      {
        id: "planning",
        title: "Tomorrow's Focus",
        prompts: ["planning-1"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "daily",
      is_private: true,
    },
  },
};

export const energyMoodCheckin: SystemTemplate = {
  name: "Energy & Mood Check-in",
  description: "Track and understand your energy patterns and emotional state",
  category: "daily",
  difficulty: "beginner",
  estimatedMinutes: 7,
  tags: ["mood", "energy", "wellness", "daily"],
  isSystem: true,
  prompts: [
    createPrompt(
      "mood-1",
      "How would I describe my mood today?",
      "mood",
      true,
      0,
    ),
    createPrompt(
      "mood-2",
      "What activities gave me energy today?",
      "mood",
      true,
      1,
    ),
    createPrompt("mood-3", "What drained my energy?", "mood", false, 2),
    createPrompt(
      "mood-4",
      "What emotions did I experience most?",
      "mood",
      true,
      3,
    ),
    createPrompt(
      "planning-2",
      "What can I do differently tomorrow to optimize my energy?",
      "planning",
      true,
      4,
    ),
  ],
  structure: {
    sections: [
      {
        id: "mood-check",
        title: "Mood Assessment",
        prompts: ["mood-1", "mood-4"],
        order: 0,
      },
      {
        id: "energy-audit",
        title: "Energy Audit",
        prompts: ["mood-2", "mood-3"],
        order: 1,
      },
      {
        id: "optimization",
        title: "Energy Optimization",
        prompts: ["planning-2"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "daily",
      is_private: true,
    },
  },
};

export const eveningReflection: SystemTemplate = {
  name: "Evening Wind-Down Reflection",
  description: "Process your day and prepare for restful sleep",
  category: "daily",
  difficulty: "beginner",
  estimatedMinutes: 10,
  tags: ["evening", "daily", "sleep", "review"],
  isSystem: true,
  prompts: [
    createPrompt("wins-2", "What went well today?", "wins", true, 0),
    createPrompt(
      "challenges-2",
      "What was difficult and what did I learn?",
      "challenges",
      true,
      1,
    ),
    createPrompt(
      "gratitude-2",
      "What am I grateful for from today?",
      "gratitude",
      true,
      2,
    ),
    createPrompt(
      "learning-2",
      "What's one insight I gained today?",
      "learning",
      false,
      3,
    ),
    createPrompt(
      "planning-3",
      "What do I want to let go of before sleep?",
      "planning",
      true,
      4,
    ),
  ],
  structure: {
    sections: [
      {
        id: "day-review",
        title: "Today's Review",
        prompts: ["wins-2", "challenges-2"],
        order: 0,
      },
      {
        id: "appreciation",
        title: "Gratitude & Learning",
        prompts: ["gratitude-2", "learning-2"],
        order: 1,
      },
      {
        id: "release",
        title: "Letting Go",
        prompts: ["planning-3"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "daily",
      is_private: true,
    },
  },
};

// Weekly Templates
export const weeklyReview: SystemTemplate = {
  name: "Weekly Goal & Habit Review",
  description: "Comprehensive weekly assessment of progress and patterns",
  category: "weekly",
  difficulty: "intermediate",
  estimatedMinutes: 20,
  tags: ["weekly", "goals", "habits", "comprehensive"],
  isSystem: true,
  prompts: [
    createPrompt(
      "goals-1",
      "Which goals made progress this week?",
      "goals",
      true,
      0,
    ),
    createPrompt(
      "habits-1",
      "What habits served me well this week?",
      "habits",
      true,
      1,
    ),
    createPrompt(
      "challenges-3",
      "Where did I struggle and why?",
      "challenges",
      true,
      2,
    ),
    createPrompt(
      "growth-1",
      "What patterns do I notice in my behavior?",
      "growth",
      true,
      3,
    ),
    createPrompt(
      "planning-4",
      "What adjustments do I want to make next week?",
      "planning",
      true,
      4,
    ),
    createPrompt(
      "wins-3",
      "What am I most proud of from this week?",
      "wins",
      true,
      5,
    ),
  ],
  structure: {
    sections: [
      {
        id: "progress",
        title: "Progress Review",
        prompts: ["goals-1", "habits-1"],
        order: 0,
      },
      {
        id: "challenges",
        title: "Challenges & Patterns",
        prompts: ["challenges-3", "growth-1"],
        order: 1,
      },
      {
        id: "planning",
        title: "Next Week Planning",
        prompts: ["planning-4", "wins-3"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "weekly",
      is_private: true,
    },
  },
};

export const weeklyGrowthAssessment: SystemTemplate = {
  name: "Personal Growth Assessment",
  description: "Deep dive into personal development and self-awareness",
  category: "weekly",
  difficulty: "advanced",
  estimatedMinutes: 25,
  tags: ["growth", "personal-development", "weekly", "deep"],
  isSystem: true,
  prompts: [
    createPrompt(
      "growth-2",
      "What did I learn about myself this week?",
      "growth",
      true,
      0,
    ),
    createPrompt("growth-3", "How have I grown or changed?", "growth", true, 1),
    createPrompt(
      "relationships-1",
      "How were my relationships this week?",
      "relationships",
      true,
      2,
    ),
    createPrompt(
      "challenges-4",
      "What limiting beliefs did I notice?",
      "challenges",
      false,
      3,
    ),
    createPrompt(
      "learning-3",
      "What new skills or knowledge did I gain?",
      "learning",
      true,
      4,
    ),
    createPrompt(
      "planning-5",
      "What do I want to focus on for personal growth?",
      "planning",
      true,
      5,
    ),
  ],
  structure: {
    sections: [
      {
        id: "self-awareness",
        title: "Self-Awareness",
        prompts: ["growth-2", "growth-3"],
        order: 0,
      },
      {
        id: "connections",
        title: "Relationships & Growth",
        prompts: ["relationships-1", "challenges-4"],
        order: 1,
      },
      {
        id: "development",
        title: "Continued Development",
        prompts: ["learning-3", "planning-5"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "weekly",
      is_private: true,
    },
  },
};

// Monthly Templates
export const monthlyVision: SystemTemplate = {
  name: "Monthly Vision & Direction",
  description: "Big picture review of life direction and goal alignment",
  category: "monthly",
  difficulty: "intermediate",
  estimatedMinutes: 30,
  tags: ["monthly", "vision", "goals", "planning"],
  isSystem: true,
  prompts: [
    createPrompt(
      "goals-2",
      "How did I progress toward my major goals this month?",
      "goals",
      true,
      0,
    ),
    createPrompt(
      "growth-4",
      "What significant changes or growth did I experience?",
      "growth",
      true,
      1,
    ),
    createPrompt(
      "challenges-5",
      "What obstacles did I overcome?",
      "challenges",
      true,
      2,
    ),
    createPrompt(
      "learning-4",
      "What are my biggest lessons from this month?",
      "learning",
      true,
      3,
    ),
    createPrompt(
      "planning-6",
      "What are my priorities for next month?",
      "planning",
      true,
      4,
    ),
    createPrompt(
      "gratitude-3",
      "What am I most grateful for from this month?",
      "gratitude",
      true,
      5,
    ),
  ],
  structure: {
    sections: [
      {
        id: "monthly-review",
        title: "Month in Review",
        prompts: ["goals-2", "growth-4"],
        order: 0,
      },
      {
        id: "learnings",
        title: "Challenges & Lessons",
        prompts: ["challenges-5", "learning-4"],
        order: 1,
      },
      {
        id: "forward",
        title: "Looking Forward",
        prompts: ["planning-6", "gratitude-3"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "monthly",
      is_private: true,
    },
  },
};

// Goal-specific Templates
export const goalProgressReview: SystemTemplate = {
  name: "Goal Progress Review",
  description: "In-depth assessment of goal progress and strategy",
  category: "goal_review",
  difficulty: "intermediate",
  estimatedMinutes: 15,
  tags: ["goals", "progress", "strategy", "review"],
  isSystem: true,
  prompts: [
    createPrompt(
      "goals-3",
      "What progress have I made on this goal?",
      "goals",
      true,
      0,
    ),
    createPrompt(
      "goals-4",
      "What's working well in my approach?",
      "goals",
      true,
      1,
    ),
    createPrompt(
      "challenges-6",
      "What obstacles am I facing?",
      "challenges",
      true,
      2,
    ),
    createPrompt(
      "learning-5",
      "What have I learned about achieving this goal?",
      "learning",
      true,
      3,
    ),
    createPrompt(
      "planning-7",
      "What adjustments should I make to my strategy?",
      "planning",
      true,
      4,
    ),
  ],
  structure: {
    sections: [
      {
        id: "progress",
        title: "Progress Assessment",
        prompts: ["goals-3", "goals-4"],
        order: 0,
      },
      {
        id: "obstacles",
        title: "Obstacles & Learning",
        prompts: ["challenges-6", "learning-5"],
        order: 1,
      },
      {
        id: "strategy",
        title: "Strategy Adjustment",
        prompts: ["planning-7"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "goal",
      is_private: false,
    },
  },
};

// Habit-specific Templates
export const habitConsistencyReview: SystemTemplate = {
  name: "Habit Consistency Review",
  description: "Analyze habit patterns and optimize for success",
  category: "habit_review",
  difficulty: "intermediate",
  estimatedMinutes: 12,
  tags: ["habits", "consistency", "optimization", "patterns"],
  isSystem: true,
  prompts: [
    createPrompt(
      "habits-2",
      "How consistent was I with this habit?",
      "habits",
      true,
      0,
    ),
    createPrompt(
      "habits-3",
      "What made it easier or harder to maintain?",
      "habits",
      true,
      1,
    ),
    createPrompt(
      "challenges-7",
      "What triggers or barriers did I notice?",
      "challenges",
      true,
      2,
    ),
    createPrompt(
      "learning-6",
      "What did I learn about my habit formation?",
      "learning",
      false,
      3,
    ),
    createPrompt(
      "planning-8",
      "How can I improve my consistency?",
      "planning",
      true,
      4,
    ),
  ],
  structure: {
    sections: [
      {
        id: "consistency",
        title: "Consistency Analysis",
        prompts: ["habits-2", "habits-3"],
        order: 0,
      },
      {
        id: "patterns",
        title: "Patterns & Barriers",
        prompts: ["challenges-7", "learning-6"],
        order: 1,
      },
      {
        id: "optimization",
        title: "Optimization Plan",
        prompts: ["planning-8"],
        order: 2,
      },
    ],
    default_values: {
      reflection_type: "habit",
      is_private: false,
    },
  },
};

// All system templates
export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  dailyGratitudeTemplate,
  energyMoodCheckin,
  eveningReflection,
  weeklyReview,
  weeklyGrowthAssessment,
  monthlyVision,
  goalProgressReview,
  habitConsistencyReview,
];

// Helper functions
export const getTemplatesByCategory = (
  category: TemplateCategory,
): SystemTemplate[] => {
  return SYSTEM_TEMPLATES.filter((t) => t.category === category);
};

export const getTemplatesByDifficulty = (
  difficulty: "beginner" | "intermediate" | "advanced",
): SystemTemplate[] => {
  return SYSTEM_TEMPLATES.filter((t) => t.difficulty === difficulty);
};

export const getQuickTemplates = (): SystemTemplate[] => {
  return SYSTEM_TEMPLATES.filter((t) => t.estimatedMinutes <= 10);
};

export const searchTemplates = (query: string): SystemTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return SYSTEM_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
};
