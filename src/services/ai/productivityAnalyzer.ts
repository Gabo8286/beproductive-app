import { supabase } from "@/integrations/supabase/client";
import { AIInsightType } from "@/types/ai-insights";
import { aiServiceManager, AIServiceRequest } from "@/services/ai/aiServiceManager";

export interface ProductivityData {
  goals: any[];
  tasks: any[];
  habits: any[];
  reflections: any[];
  projects: any[];
}

export interface AnalysisResult {
  type: AIInsightType;
  title: string;
  content: string;
  summary: string;
  confidence_score: number;
  data_sources: string[];
  recommendations: {
    title: string;
    description: string;
    implementation_steps: string[];
    expected_impact: string;
    effort_level: "low" | "medium" | "high";
    priority: number;
  }[];
}

export class ProductivityAnalyzer {
  async fetchUserData(userId: string): Promise<ProductivityData> {
    const [goalsRes, tasksRes, habitsRes, reflectionsRes, projectsRes] =
      await Promise.all([
        supabase
          .from("goals")
          .select("*")
          .eq("created_by", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("tasks")
          .select("*")
          .eq("created_by", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("habits")
          .select("*, habit_entries(*)")
          .eq("created_by", userId)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("reflections")
          .select("*")
          .eq("created_by", userId)
          .order("reflection_date", { ascending: false })
          .limit(30),
        supabase
          .from("projects")
          .select("*")
          .eq("created_by", userId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    return {
      goals: goalsRes.data || [],
      tasks: tasksRes.data || [],
      habits: habitsRes.data || [],
      reflections: reflectionsRes.data || [],
      projects: projectsRes.data || [],
    };
  }

  analyzeGoalProgress(goals: any[]): AnalysisResult | null {
    if (goals.length === 0) return null;

    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const inProgressGoals = goals.filter(
      (g) => g.status === "in_progress",
    ).length;
    const avgProgress =
      goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length;
    const completionRate = (completedGoals / goals.length) * 100;

    const isStrong = completionRate > 60 || avgProgress > 70;

    return {
      type: "goal_progress",
      title: isStrong ? "Strong Goal Progress" : "Goals Need Attention",
      content: `You have ${goals.length} goals with an average progress of ${avgProgress.toFixed(1)}%. ${completedGoals} are completed and ${inProgressGoals} are in progress. ${isStrong ? "You're making excellent progress!" : "Consider breaking down larger goals into smaller milestones."}`,
      summary: `${completionRate.toFixed(0)}% completion rate across ${goals.length} goals`,
      confidence_score: 0.85,
      data_sources: ["goals"],
      recommendations: isStrong
        ? [
            {
              title: "Set Stretch Goals",
              description:
                "You're doing great! Consider adding more challenging goals to maintain momentum.",
              implementation_steps: [
                "Review completed goals for patterns",
                "Identify areas for growth",
                "Set 2-3 ambitious new goals",
              ],
              expected_impact: "Continued growth and achievement",
              effort_level: "medium",
              priority: 3,
            },
          ]
        : [
            {
              title: "Break Down Large Goals",
              description:
                "Large goals can be overwhelming. Break them into smaller, achievable milestones.",
              implementation_steps: [
                "Identify 1-2 goals with low progress",
                "Create 3-5 milestones for each",
                "Set weekly targets",
              ],
              expected_impact: "Improved goal completion rate",
              effort_level: "low",
              priority: 4,
            },
          ],
    };
  }

  analyzeHabitConsistency(habits: any[]): AnalysisResult | null {
    if (habits.length === 0) return null;

    const totalStreaks = habits.reduce(
      (sum, h) => sum + (h.current_streak || 0),
      0,
    );
    const avgStreak = totalStreaks / habits.length;
    const strongHabits = habits.filter(
      (h) => (h.current_streak || 0) >= 7,
    ).length;

    const isConsistent = avgStreak >= 7;

    return {
      type: "habit_analysis",
      title: isConsistent
        ? "Excellent Habit Consistency"
        : "Habit Consistency Needs Work",
      content: `You're tracking ${habits.length} habits with an average streak of ${avgStreak.toFixed(1)} days. ${strongHabits} habits have a 7+ day streak. ${isConsistent ? "Your consistency is impressive!" : "Focus on building stronger streaks."}`,
      summary: `${strongHabits}/${habits.length} habits with strong streaks`,
      confidence_score: 0.9,
      data_sources: ["habits", "habit_entries"],
      recommendations: isConsistent
        ? [
            {
              title: "Add Habit Stacking",
              description:
                "Leverage your consistency by stacking new habits onto existing ones.",
              implementation_steps: [
                "Choose your strongest habit",
                "Add a small habit immediately after",
                "Track both together",
              ],
              expected_impact: "Build more positive habits effortlessly",
              effort_level: "low",
              priority: 3,
            },
          ]
        : [
            {
              title: "Focus on One Keystone Habit",
              description:
                "Choose one habit to build a strong streak, then expand from there.",
              implementation_steps: [
                "Pick your most important habit",
                "Set daily reminders",
                "Track progress for 30 days",
                "Celebrate small wins",
              ],
              expected_impact: "Build momentum and consistency",
              effort_level: "low",
              priority: 5,
            },
          ],
    };
  }

  analyzeTaskPatterns(tasks: any[]): AnalysisResult | null {
    if (tasks.length === 0) return null;

    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
    ).length;
    const highPriorityTasks = tasks.filter(
      (t) => t.priority === "high" && t.status !== "done",
    ).length;
    const completionRate = (completedTasks / tasks.length) * 100;

    return {
      type: "task_prioritization",
      title:
        overdueTasks > 5 ? "Task Backlog Alert" : "Task Management Insights",
      content: `You have ${tasks.length} tasks with a ${completionRate.toFixed(0)}% completion rate. ${overdueTasks} tasks are overdue and ${highPriorityTasks} high-priority tasks need attention.`,
      summary: `${overdueTasks} overdue, ${highPriorityTasks} high-priority pending`,
      confidence_score: 0.88,
      data_sources: ["tasks"],
      recommendations:
        overdueTasks > 5
          ? [
              {
                title: "Clear Overdue Tasks",
                description:
                  "A large backlog creates stress. Tackle overdue tasks to regain control.",
                implementation_steps: [
                  "List all overdue tasks",
                  "Archive or delete obsolete ones",
                  "Reschedule remaining tasks",
                  "Block 2 hours for focused work",
                ],
                expected_impact: "Reduced stress and improved focus",
                effort_level: "medium",
                priority: 5,
              },
            ]
          : [
              {
                title: "Time Block High-Priority Tasks",
                description:
                  "Schedule dedicated time for your most important work.",
                implementation_steps: [
                  "Identify top 3 high-priority tasks",
                  "Block 90-minute focus sessions",
                  "Eliminate distractions during blocks",
                ],
                expected_impact: "Faster completion of important work",
                effort_level: "low",
                priority: 4,
              },
            ],
    };
  }

  analyzeReflectionSentiment(reflections: any[]): AnalysisResult | null {
    if (reflections.length === 0) return null;

    const moodValues = {
      amazing: 5,
      great: 4,
      good: 3,
      neutral: 2,
      bad: 1,
      terrible: 0,
    };

    const moods = reflections.map(
      (r) => moodValues[r.mood as keyof typeof moodValues] || 2,
    );
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    const positiveReflections = moods.filter((m) => m >= 3).length;
    const recentTrend = moods.slice(0, 7);
    const trendAvg =
      recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;

    const isPositive = avgMood >= 3;

    return {
      type: "reflection_sentiment",
      title: isPositive ? "Positive Mindset Detected" : "Well-being Check-In",
      content: `Your ${reflections.length} recent reflections show an average mood score of ${avgMood.toFixed(1)}/5. ${positiveReflections} reflections were positive. Recent trend: ${trendAvg >= avgMood ? "improving" : "declining slightly"}.`,
      summary: `${((positiveReflections / reflections.length) * 100).toFixed(0)}% positive reflections`,
      confidence_score: 0.75,
      data_sources: ["reflections"],
      recommendations: isPositive
        ? [
            {
              title: "Maintain Positive Momentum",
              description:
                "Your reflections show a healthy mindset. Keep it up!",
              implementation_steps: [
                "Continue daily reflections",
                "Share gratitude regularly",
                "Note what's working well",
              ],
              expected_impact: "Sustained well-being",
              effort_level: "low",
              priority: 2,
            },
          ]
        : [
            {
              title: "Focus on Self-Care",
              description:
                "Your reflections suggest increased stress. Prioritize well-being.",
              implementation_steps: [
                "Schedule 30 min daily for relaxation",
                "Identify stress sources",
                "Reach out to friends or counselor",
                "Add enjoyable activities to your week",
              ],
              expected_impact: "Improved mood and energy",
              effort_level: "medium",
              priority: 5,
            },
          ],
    };
  }

  async analyzeProductivityPattern(
    data: ProductivityData,
    userId: string,
  ): Promise<AnalysisResult | null> {
    if (data.tasks.length === 0 && data.goals.length === 0) return null;

    // Analyze task completion patterns by time/day
    const tasksByHour = data.tasks
      .filter((t) => t.completed_at)
      .reduce(
        (acc, task) => {
          const hour = new Date(task.completed_at).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );

    const peakHour = Object.entries(tasksByHour).sort(
      ([, a], [, b]) => Number(b) - Number(a),
    )[0]?.[0];

    const tasksByDay = data.tasks
      .filter((t) => t.completed_at)
      .reduce(
        (acc, task) => {
          const day = new Date(task.completed_at).getDay();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );

    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const peakDay = Object.entries(tasksByDay).sort(
      ([, a], [, b]) => Number(b) - Number(a),
    )[0]?.[0];

    // Use AI to generate deeper insights
    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Analyze this productivity pattern data:
Peak productivity hour: ${peakHour ? `${peakHour}:00` : "No clear pattern"}
Peak productivity day: ${peakDay ? weekdays[parseInt(peakDay)] : "No clear pattern"}
Total tasks completed: ${data.tasks.filter((t) => t.completed_at).length}
Goals completed: ${data.goals.filter((g) => g.status === "completed").length}

Provide insights about this user's productivity patterns and suggest optimizations.`,
      userId,
      requestType: "productivity_pattern_analysis",
      maxTokens: 300,
    };

    const aiResponse = await aiServiceManager.makeRequest(aiRequest);

    return {
      type: "productivity_pattern",
      title: "Your Productivity Patterns",
      content:
        aiResponse.content ||
        `Your productivity peaks at ${peakHour ? `${peakHour}:00` : "various times"} and you're most productive on ${peakDay ? weekdays[parseInt(peakDay)] : "multiple days"}. Consider scheduling important work during these peak times.`,
      summary: `Peak: ${peakDay ? weekdays[parseInt(peakDay)] : "Varied"} at ${peakHour ? `${peakHour}:00` : "various times"}`,
      confidence_score: peakHour && peakDay ? 0.8 : 0.6,
      data_sources: ["tasks", "goals"],
      recommendations: [
        {
          title: "Optimize Peak Hours",
          description: `Schedule your most important work during ${peakHour ? `${peakHour}:00` : "your identified peak hours"}.`,
          implementation_steps: [
            "Block calendar during peak hours",
            "Save routine tasks for low-energy times",
            "Track energy levels throughout the day",
          ],
          expected_impact: "Increased productivity and better work quality",
          effort_level: "low",
          priority: 4,
        },
      ],
    };
  }

  async analyzeTimeOptimization(
    data: ProductivityData,
    userId: string,
  ): Promise<AnalysisResult | null> {
    if (data.tasks.length === 0) return null;

    const tasksWithTime = data.tasks.filter(
      (t) => t.estimated_duration && t.actual_duration,
    );
    const timeAccuracy =
      tasksWithTime.length > 0
        ? tasksWithTime.reduce((acc, task) => {
            const accuracy =
              1 -
              Math.abs(task.actual_duration - task.estimated_duration) /
                task.estimated_duration;
            return acc + Math.max(0, accuracy);
          }, 0) / tasksWithTime.length
        : 0;

    const avgTaskDuration =
      data.tasks
        .filter((t) => t.actual_duration)
        .reduce((sum, t) => sum + t.actual_duration, 0) /
        data.tasks.filter((t) => t.actual_duration).length || 0;

    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Analyze time management data:
Time estimation accuracy: ${(timeAccuracy * 100).toFixed(1)}%
Average task duration: ${avgTaskDuration} minutes
Tasks with time tracking: ${tasksWithTime.length}/${data.tasks.length}

Suggest time optimization strategies based on this data.`,
      userId,
      requestType: "time_optimization_analysis",
      maxTokens: 300,
    };

    const aiResponse = await aiServiceManager.makeRequest(aiRequest);

    return {
      type: "time_optimization",
      title: "Time Optimization Insights",
      content:
        aiResponse.content ||
        `Your time estimation accuracy is ${(timeAccuracy * 100).toFixed(1)}%. ${timeAccuracy > 0.8 ? "Great job with time estimation!" : "Consider improving time estimation skills."}`,
      summary: `${(timeAccuracy * 100).toFixed(0)}% estimation accuracy`,
      confidence_score: tasksWithTime.length > 5 ? 0.85 : 0.6,
      data_sources: ["tasks"],
      recommendations:
        timeAccuracy < 0.7
          ? [
              {
                title: "Improve Time Estimation",
                description:
                  "Better time estimates lead to better planning and reduced stress.",
                implementation_steps: [
                  "Track actual time for all tasks",
                  "Review estimation vs actual weekly",
                  "Use the Pomodoro technique",
                  "Buffer 25% extra time for estimates",
                ],
                expected_impact: "Better schedule management and less stress",
                effort_level: "medium",
                priority: 4,
              },
            ]
          : [
              {
                title: "Optimize Task Batching",
                description:
                  "Your time estimation is good! Try batching similar tasks.",
                implementation_steps: [
                  "Group similar tasks together",
                  "Batch communication tasks",
                  "Use time blocks for deep work",
                ],
                expected_impact: "Reduced context switching and improved focus",
                effort_level: "low",
                priority: 3,
              },
            ],
    };
  }

  async analyzeProjectHealth(
    data: ProductivityData,
    userId: string,
  ): Promise<AnalysisResult | null> {
    if (data.projects.length === 0) return null;

    const activeProjects = data.projects.filter((p) => p.status === "active");
    const overdueProjects = data.projects.filter(
      (p) =>
        p.target_date &&
        new Date(p.target_date) < new Date() &&
        p.status !== "completed",
    );
    const avgProgress =
      data.projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) /
      data.projects.length;

    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Analyze project portfolio health:
Total projects: ${data.projects.length}
Active projects: ${activeProjects.length}
Overdue projects: ${overdueProjects.length}
Average progress: ${avgProgress.toFixed(1)}%

Assess project health and suggest improvements.`,
      userId,
      requestType: "project_health_analysis",
      maxTokens: 300,
    };

    const aiResponse = await aiServiceManager.makeRequest(aiRequest);

    const isHealthy = overdueProjects.length === 0 && avgProgress > 50;

    return {
      type: "project_health",
      title: isHealthy
        ? "Healthy Project Portfolio"
        : "Project Portfolio Needs Attention",
      content:
        aiResponse.content ||
        `You have ${data.projects.length} projects with ${overdueProjects.length} overdue. Average progress is ${avgProgress.toFixed(1)}%. ${isHealthy ? "Your projects are on track!" : "Some projects need attention."}`,
      summary: `${overdueProjects.length} overdue of ${data.projects.length} total`,
      confidence_score: 0.9,
      data_sources: ["projects"],
      recommendations:
        overdueProjects.length > 0
          ? [
              {
                title: "Address Overdue Projects",
                description:
                  "Overdue projects can cascade delays. Address them immediately.",
                implementation_steps: [
                  "List all overdue projects",
                  "Reassess scope and deadlines",
                  "Break large projects into phases",
                  "Archive or cancel unrealistic projects",
                ],
                expected_impact: "Improved project delivery and reduced stress",
                effort_level: "medium",
                priority: 5,
              },
            ]
          : [
              {
                title: "Maintain Project Momentum",
                description:
                  "Your projects are healthy! Keep the momentum going.",
                implementation_steps: [
                  "Regular project status reviews",
                  "Celebrate project milestones",
                  "Plan next project phases early",
                ],
                expected_impact: "Sustained project success",
                effort_level: "low",
                priority: 2,
              },
            ],
    };
  }

  async analyzeBurnoutRisk(
    data: ProductivityData,
    userId: string,
  ): Promise<AnalysisResult | null> {
    if (data.reflections.length === 0 && data.tasks.length === 0) return null;

    // Calculate stress indicators
    const recentReflections = data.reflections.slice(0, 7);
    const moodValues = {
      amazing: 5,
      great: 4,
      good: 3,
      neutral: 2,
      bad: 1,
      terrible: 0,
    };
    const avgMood =
      recentReflections.length > 0
        ? recentReflections.reduce(
            (sum, r) =>
              sum + (moodValues[r.mood as keyof typeof moodValues] || 2),
            0,
          ) / recentReflections.length
        : 3;

    const overdueTasks = data.tasks.filter(
      (t) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
    ).length;

    const workload = data.tasks.filter(
      (t) =>
        t.created_at &&
        new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length; // Tasks created in last week

    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Assess burnout risk based on:
Average mood (1-5): ${avgMood.toFixed(1)}
Overdue tasks: ${overdueTasks}
New tasks this week: ${workload}
Recent reflections: ${recentReflections.length}

Evaluate burnout risk and suggest prevention strategies.`,
      userId,
      requestType: "burnout_risk_analysis",
      maxTokens: 350,
    };

    const aiResponse = await aiServiceManager.makeRequest(aiRequest);

    const riskLevel =
      avgMood < 2.5 || overdueTasks > 10 || workload > 20
        ? "high"
        : avgMood < 3.5 || overdueTasks > 5 || workload > 15
          ? "medium"
          : "low";

    return {
      type: "burnout_risk",
      title: `Burnout Risk: ${riskLevel.toUpperCase()}`,
      content:
        aiResponse.content ||
        `Based on your recent mood (${avgMood.toFixed(1)}/5), ${overdueTasks} overdue tasks, and ${workload} new tasks this week, your burnout risk is ${riskLevel}.`,
      summary: `${riskLevel} risk based on mood and workload`,
      confidence_score: recentReflections.length > 3 ? 0.8 : 0.6,
      data_sources: ["reflections", "tasks"],
      recommendations:
        riskLevel === "high"
          ? [
              {
                title: "Immediate Stress Relief",
                description:
                  "High burnout risk detected. Take immediate action to reduce stress.",
                implementation_steps: [
                  "Take a mental health day if possible",
                  "Delegate or postpone non-critical tasks",
                  "Reach out to support network",
                  "Schedule regular breaks",
                  "Consider professional help if needed",
                ],
                expected_impact: "Reduced stress and prevented burnout",
                effort_level: "high",
                priority: 5,
              },
            ]
          : [
              {
                title: "Maintain Work-Life Balance",
                description:
                  "Your burnout risk is manageable. Keep healthy habits.",
                implementation_steps: [
                  "Maintain regular exercise",
                  "Set boundaries on work hours",
                  "Practice mindfulness or meditation",
                  "Ensure adequate sleep",
                ],
                expected_impact: "Sustained well-being and productivity",
                effort_level: "low",
                priority: 3,
              },
            ],
    };
  }

  async analyzeAchievementOpportunity(
    data: ProductivityData,
    userId: string,
  ): Promise<AnalysisResult | null> {
    if (data.goals.length === 0 && data.habits.length === 0) return null;

    const nearCompleteGoals = data.goals.filter(
      (g) => g.status === "in_progress" && (g.progress || 0) > 80,
    );

    const strongHabits = data.habits.filter(
      (h) => (h.current_streak || 0) >= 21,
    );
    const emergingHabits = data.habits.filter(
      (h) => (h.current_streak || 0) >= 7 && (h.current_streak || 0) < 21,
    );

    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Identify achievement opportunities:
Goals near completion (>80%): ${nearCompleteGoals.length}
Strong habits (21+ days): ${strongHabits.length}
Emerging habits (7-20 days): ${emergingHabits.length}
Total active goals: ${data.goals.filter((g) => g.status === "in_progress").length}

Suggest achievable wins and momentum-building opportunities.`,
      userId,
      requestType: "achievement_opportunity_analysis",
      maxTokens: 300,
    };

    const aiResponse = await aiServiceManager.makeRequest(aiRequest);

    const hasOpportunities =
      nearCompleteGoals.length > 0 || emergingHabits.length > 0;

    return {
      type: "achievement_opportunity",
      title: hasOpportunities
        ? "Achievement Opportunities Ahead!"
        : "Building Achievement Momentum",
      content:
        aiResponse.content ||
        `You have ${nearCompleteGoals.length} goals near completion and ${emergingHabits.length} habits building momentum. ${hasOpportunities ? "Focus on these quick wins!" : "Keep building consistency to create future opportunities."}`,
      summary: `${nearCompleteGoals.length} goals + ${emergingHabits.length} habits ready`,
      confidence_score: 0.85,
      data_sources: ["goals", "habits"],
      recommendations: hasOpportunities
        ? [
            {
              title: "Capture Quick Wins",
              description:
                "You have achievements within reach. Focus on completing them.",
              implementation_steps: [
                "Prioritize near-complete goals",
                "Dedicate focused time to finishing",
                "Celebrate each completion",
                "Use momentum for next goals",
              ],
              expected_impact: "Increased motivation and confidence",
              effort_level: "low",
              priority: 4,
            },
          ]
        : [
            {
              title: "Build Consistency Foundation",
              description:
                "Focus on building consistent habits that will create future wins.",
              implementation_steps: [
                "Choose 1-2 keystone habits",
                "Track daily progress",
                "Set small, achievable milestones",
                "Build streaks systematically",
              ],
              expected_impact: "Foundation for future achievements",
              effort_level: "medium",
              priority: 3,
            },
          ],
    };
  }

  async generateInsights(
    userId: string,
    types?: AIInsightType[],
  ): Promise<AnalysisResult[]> {
    const data = await this.fetchUserData(userId);
    const insights: AnalysisResult[] = [];

    const analyzers: Record<
      AIInsightType,
      () => Promise<AnalysisResult | null>
    > = {
      goal_progress: async () => this.analyzeGoalProgress(data.goals),
      habit_analysis: async () => this.analyzeHabitConsistency(data.habits),
      task_prioritization: async () => this.analyzeTaskPatterns(data.tasks),
      reflection_sentiment: async () =>
        this.analyzeReflectionSentiment(data.reflections),
      productivity_pattern: async () =>
        this.analyzeProductivityPattern(data, userId),
      time_optimization: async () => this.analyzeTimeOptimization(data, userId),
      project_health: async () => this.analyzeProjectHealth(data, userId),
      burnout_risk: async () => this.analyzeBurnoutRisk(data, userId),
      achievement_opportunity: async () =>
        this.analyzeAchievementOpportunity(data, userId),
    };

    const typesToAnalyze = types || (Object.keys(analyzers) as AIInsightType[]);

    for (const type of typesToAnalyze) {
      const analyzer = analyzers[type];
      if (analyzer) {
        try {
          const result = await analyzer();
          if (result) insights.push(result);
        } catch (error) {
          console.error(`Error analyzing ${type}:`, error);
          // Continue with other analyzers even if one fails
        }
      }
    }

    return insights;
  }
}
