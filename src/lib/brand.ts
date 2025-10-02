/**
 * BeProductive Brand Configuration
 * Central configuration for journey metaphor and brand consistency
 */

export const brandConfig = {
  name: "BeProductive",
  tagline: "Commit to Your Journey",

  // Journey Metaphor Mapping
  journey: {
    goals: {
      metaphor: "Destinations",
      description: "Where you want to go",
      icon: "Target",
    },
    habits: {
      metaphor: "Daily Routines",
      description: "How you travel",
      icon: "Repeat",
    },
    reflections: {
      metaphor: "Route Adjustments",
      description: "Learning from the path",
      icon: "BookOpen",
    },
  },

  // Dashboard content and messaging
  content: {
    welcomeMessages: [
      "Welcome back to your journey",
      "Ready to continue your path?",
      "Let's make progress today",
      "Your journey continues",
    ],
    motivationalPhrases: [
      "Every step counts on your journey",
      "Progress, not perfection",
      "Small steps lead to big destinations",
      "Your journey, your pace",
      "Consistency is key to reaching your destinations",
      "Keep moving forward, one step at a time",
    ],
  },

  // Empty state messages using journey theme
  emptyStates: {
    goals: "Start your journey by setting your first destination",
    habits: "Build your daily routine to power your progress",
    reflections: "Reflect on your path to gain clarity",
  },

  // Success messages using journey theme
  successMessages: {
    goalCompleted: "Destination reached! 🎯",
    habitStreak: "Your routine is powering your journey! 🔥",
    reflectionSaved: "Insight recorded on your path 📝",
  },
} as const;

// Type exports for TypeScript safety
export type JourneyModule = keyof typeof brandConfig.journey;

/**
 * Get a random welcome message
 */
export const getWelcomeMessage = (): string => {
  const messages = brandConfig.content.welcomeMessages;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get a random motivational message
 */
export const getMotivationalMessage = (): string => {
  const messages = brandConfig.content.motivationalPhrases;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get journey metaphor for a module
 */
export const getJourneyMetaphor = (module: JourneyModule) => {
  return brandConfig.journey[module];
};

/**
 * Get empty state message for a module
 */
export const getEmptyStateMessage = (module: JourneyModule): string => {
  return brandConfig.emptyStates[module];
};

/**
 * Get success message for an action
 */
export const getSuccessMessage = (action: keyof typeof brandConfig.successMessages): string => {
  return brandConfig.successMessages[action];
};
