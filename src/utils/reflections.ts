import type {
  MoodLevel,
  Reflection,
  ReflectionInsight,
} from "@/types/reflections";

/**
 * Convert mood level to numeric score
 */
export function calculateMoodScore(mood: MoodLevel): number {
  const moodScores: Record<MoodLevel, number> = {
    amazing: 6,
    great: 5,
    good: 4,
    neutral: 3,
    bad: 2,
    terrible: 1,
  };
  return moodScores[mood];
}

/**
 * Convert numeric score back to mood level
 */
export function getMoodFromScore(score: number): MoodLevel {
  if (score >= 5.5) return "amazing";
  if (score >= 4.5) return "great";
  if (score >= 3.5) return "good";
  if (score >= 2.5) return "neutral";
  if (score >= 1.5) return "bad";
  return "terrible";
}

/**
 * Generate auto-summary from reflection content
 */
export function generateReflectionSummary(
  reflection: Reflection,
  maxLength: number = 150,
): string {
  // Start with the title
  let summary = reflection.title;

  // Add mood if present
  if (reflection.mood) {
    summary += ` - Mood: ${reflection.mood}`;
  }

  // Add top win if present
  if (reflection.wins.length > 0) {
    summary += `. Win: ${reflection.wins[0]}`;
  }

  // Truncate if too long
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + "...";
  }

  return summary;
}

/**
 * Extract key themes from reflection content
 */
export function extractThemes(content: string): string[] {
  const themes: string[] = [];
  const lowerContent = content.toLowerCase();

  // Common themes to look for
  const themeKeywords: Record<string, string[]> = {
    work: ["work", "job", "career", "project", "meeting", "deadline"],
    health: ["health", "exercise", "workout", "fitness", "diet", "sleep"],
    relationships: ["family", "friend", "relationship", "social", "partner"],
    learning: ["learn", "study", "course", "reading", "skill", "knowledge"],
    creativity: ["creative", "art", "music", "writing", "design", "project"],
    finance: ["money", "finance", "budget", "savings", "investment"],
    mindfulness: ["meditation", "mindful", "peace", "calm", "present"],
    growth: ["growth", "improve", "develop", "progress", "achievement"],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      themes.push(theme);
    }
  }

  return themes;
}

/**
 * Suggest tags based on content analysis
 */
export function suggestTags(reflection: Reflection): string[] {
  const tags: Set<string> = new Set();

  // Add themes as tags
  extractThemes(reflection.content).forEach((theme) => tags.add(theme));

  // Add mood-based tags
  if (reflection.mood) {
    if (["amazing", "great"].includes(reflection.mood)) {
      tags.add("positive");
    } else if (["bad", "terrible"].includes(reflection.mood)) {
      tags.add("challenging");
    }
  }

  // Add energy-based tags
  if (reflection.energy_level) {
    if (reflection.energy_level >= 8) {
      tags.add("high-energy");
    } else if (reflection.energy_level <= 3) {
      tags.add("low-energy");
    }
  }

  // Add stress-based tags
  if (reflection.stress_level && reflection.stress_level >= 7) {
    tags.add("high-stress");
  }

  // Add content-based tags
  if (reflection.wins.length > 0) {
    tags.add("wins");
  }
  if (reflection.challenges.length > 0) {
    tags.add("challenges");
  }
  if (reflection.gratitude_items.length > 0) {
    tags.add("gratitude");
  }
  if (reflection.learnings.length > 0) {
    tags.add("learning");
  }

  return Array.from(tags);
}

/**
 * Format reflection date consistently
 */
export function formatReflectionDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Calculate gamification score for reflection
 */
export function calculateReflectionScore(reflection: Reflection): number {
  let score = 0;

  // Base points for completing reflection
  score += 10;

  // Content length bonus
  if (reflection.content.length > 100) score += 5;
  if (reflection.content.length > 500) score += 10;

  // Completeness bonuses
  if (reflection.mood) score += 5;
  if (reflection.energy_level) score += 3;
  if (reflection.stress_level) score += 3;
  if (reflection.satisfaction_level) score += 3;
  if (reflection.gratitude_items.length > 0) score += 5;
  if (reflection.wins.length > 0) score += 5;
  if (reflection.learnings.length > 0) score += 5;
  if (reflection.tomorrow_focus.length > 0) score += 5;
  if (reflection.challenges.length > 0) score += 3;

  // Tag bonus
  score += Math.min(reflection.tags.length * 2, 10);

  return score;
}

/**
 * Detect primary emotions from content
 */
export function detectEmotions(content: string): string[] {
  const emotions: string[] = [];
  const lowerContent = content.toLowerCase();

  const emotionKeywords: Record<string, string[]> = {
    joy: ["happy", "joy", "excited", "delighted", "pleased", "thrilled"],
    gratitude: ["grateful", "thankful", "appreciate", "blessed"],
    pride: ["proud", "accomplished", "achieved", "success"],
    anxiety: ["anxious", "worried", "nervous", "stress", "concerned"],
    frustration: ["frustrated", "annoyed", "irritated", "upset"],
    sadness: ["sad", "down", "disappointed", "unhappy"],
    hope: ["hope", "optimistic", "looking forward", "excited for"],
    calm: ["calm", "peaceful", "relaxed", "serene"],
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      emotions.push(emotion);
    }
  }

  return emotions;
}

/**
 * Generate insights from multiple reflections
 */
export function generateInsights(
  reflections: Reflection[],
): ReflectionInsight[] {
  const insights: ReflectionInsight[] = [];

  if (reflections.length === 0) return insights;

  // Mood trend analysis
  const moodScores = reflections
    .filter((r) => r.mood)
    .map((r) => calculateMoodScore(r.mood!));

  if (moodScores.length >= 3) {
    const recentMood = moodScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const overallMood =
      moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

    if (recentMood > overallMood + 0.5) {
      insights.push({
        type: "mood_trend",
        title: "Improving Mood Trend",
        description:
          "Your recent mood has been improving compared to your average. Keep up the positive momentum!",
        priority: "medium",
      });
    } else if (recentMood < overallMood - 0.5) {
      insights.push({
        type: "mood_trend",
        title: "Mood Decline Detected",
        description:
          "Your recent mood has been lower than usual. Consider reviewing what might be contributing to this.",
        action: "Review recent challenges and stressors",
        priority: "high",
      });
    }
  }

  // Energy pattern analysis
  const energyLevels = reflections
    .filter((r) => r.energy_level)
    .map((r) => r.energy_level!);

  if (energyLevels.length >= 5) {
    const avgEnergy =
      energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

    if (avgEnergy < 4) {
      insights.push({
        type: "energy_pattern",
        title: "Low Energy Levels",
        description:
          "Your energy levels have been consistently low. Consider reviewing your sleep, nutrition, and exercise habits.",
        action: "Schedule a habit review",
        priority: "high",
      });
    }
  }

  // Stress alert
  const stressLevels = reflections
    .filter((r) => r.stress_level)
    .map((r) => r.stress_level!);

  if (stressLevels.length >= 3) {
    const recentStress = stressLevels.slice(-3);
    const highStressDays = recentStress.filter((s) => s >= 7).length;

    if (highStressDays >= 2) {
      insights.push({
        type: "stress_alert",
        title: "High Stress Detected",
        description:
          "You've experienced high stress levels recently. Consider stress management techniques or seeking support.",
        action: "Practice mindfulness or reach out for support",
        priority: "high",
      });
    }
  }

  // Consistency achievement
  if (reflections.length >= 7) {
    insights.push({
      type: "consistency_achievement",
      title: "Reflection Consistency",
      description: `You've completed ${reflections.length} reflections! Consistent reflection is a powerful tool for growth.`,
      priority: "low",
    });
  }

  // Growth opportunity
  const hasGratitude = reflections.some((r) => r.gratitude_items.length > 0);
  const hasLearnings = reflections.some((r) => r.learnings.length > 0);

  if (!hasGratitude && reflections.length >= 3) {
    insights.push({
      type: "growth_opportunity",
      title: "Try Gratitude Practice",
      description:
        "Adding gratitude items to your reflections can improve mood and perspective. Give it a try!",
      action: "Add gratitude items to your next reflection",
      priority: "low",
    });
  }

  if (!hasLearnings && reflections.length >= 3) {
    insights.push({
      type: "growth_opportunity",
      title: "Capture Your Learnings",
      description:
        "Recording key learnings helps reinforce growth and development. Try adding learnings to your reflections.",
      action: "Document learnings in your next reflection",
      priority: "low",
    });
  }

  return insights;
}

/**
 * Validate reflection input
 */
export function validateReflectionInput(input: {
  title?: string;
  content?: string;
  energy_level?: number;
  stress_level?: number;
  satisfaction_level?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (input.title !== undefined && input.title.trim().length === 0) {
    errors.push("Title cannot be empty");
  }

  if (input.title !== undefined && input.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (input.content !== undefined && input.content.trim().length === 0) {
    errors.push("Content cannot be empty");
  }

  if (input.content !== undefined && input.content.length > 10000) {
    errors.push("Content must be less than 10,000 characters");
  }

  if (
    input.energy_level !== undefined &&
    (input.energy_level < 1 || input.energy_level > 10)
  ) {
    errors.push("Energy level must be between 1 and 10");
  }

  if (
    input.stress_level !== undefined &&
    (input.stress_level < 1 || input.stress_level > 10)
  ) {
    errors.push("Stress level must be between 1 and 10");
  }

  if (
    input.satisfaction_level !== undefined &&
    (input.satisfaction_level < 1 || input.satisfaction_level > 10)
  ) {
    errors.push("Satisfaction level must be between 1 and 10");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
