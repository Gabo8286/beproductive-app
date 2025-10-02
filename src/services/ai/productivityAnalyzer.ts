import { supabase } from "@/integrations/supabase/client";
import { AIInsightType } from "@/types/ai-insights";

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
    effort_level: 'low' | 'medium' | 'high';
    priority: number;
  }[];
}

export class ProductivityAnalyzer {
  async fetchUserData(userId: string): Promise<ProductivityData> {
    const [goalsRes, tasksRes, habitsRes, reflectionsRes, projectsRes] = await Promise.all([
      supabase.from('goals').select('*').eq('created_by', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('tasks').select('*').eq('created_by', userId).order('created_at', { ascending: false }).limit(100),
      supabase.from('habits').select('*, habit_entries(*)').eq('created_by', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('reflections').select('*').eq('created_by', userId).order('reflection_date', { ascending: false }).limit(30),
      supabase.from('projects').select('*').eq('created_by', userId).order('created_at', { ascending: false }).limit(20),
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

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
    const avgProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length;
    const completionRate = (completedGoals / goals.length) * 100;

    const isStrong = completionRate > 60 || avgProgress > 70;
    
    return {
      type: 'goal_progress',
      title: isStrong ? 'Strong Goal Progress' : 'Goals Need Attention',
      content: `You have ${goals.length} goals with an average progress of ${avgProgress.toFixed(1)}%. ${completedGoals} are completed and ${inProgressGoals} are in progress. ${isStrong ? 'You\'re making excellent progress!' : 'Consider breaking down larger goals into smaller milestones.'}`,
      summary: `${completionRate.toFixed(0)}% completion rate across ${goals.length} goals`,
      confidence_score: 0.85,
      data_sources: ['goals'],
      recommendations: isStrong ? [
        {
          title: 'Set Stretch Goals',
          description: 'You\'re doing great! Consider adding more challenging goals to maintain momentum.',
          implementation_steps: [
            'Review completed goals for patterns',
            'Identify areas for growth',
            'Set 2-3 ambitious new goals'
          ],
          expected_impact: 'Continued growth and achievement',
          effort_level: 'medium',
          priority: 3
        }
      ] : [
        {
          title: 'Break Down Large Goals',
          description: 'Large goals can be overwhelming. Break them into smaller, achievable milestones.',
          implementation_steps: [
            'Identify 1-2 goals with low progress',
            'Create 3-5 milestones for each',
            'Set weekly targets'
          ],
          expected_impact: 'Improved goal completion rate',
          effort_level: 'low',
          priority: 4
        }
      ]
    };
  }

  analyzeHabitConsistency(habits: any[]): AnalysisResult | null {
    if (habits.length === 0) return null;

    const totalStreaks = habits.reduce((sum, h) => sum + (h.current_streak || 0), 0);
    const avgStreak = totalStreaks / habits.length;
    const strongHabits = habits.filter(h => (h.current_streak || 0) >= 7).length;
    
    const isConsistent = avgStreak >= 7;

    return {
      type: 'habit_analysis',
      title: isConsistent ? 'Excellent Habit Consistency' : 'Habit Consistency Needs Work',
      content: `You're tracking ${habits.length} habits with an average streak of ${avgStreak.toFixed(1)} days. ${strongHabits} habits have a 7+ day streak. ${isConsistent ? 'Your consistency is impressive!' : 'Focus on building stronger streaks.'}`,
      summary: `${strongHabits}/${habits.length} habits with strong streaks`,
      confidence_score: 0.9,
      data_sources: ['habits', 'habit_entries'],
      recommendations: isConsistent ? [
        {
          title: 'Add Habit Stacking',
          description: 'Leverage your consistency by stacking new habits onto existing ones.',
          implementation_steps: [
            'Choose your strongest habit',
            'Add a small habit immediately after',
            'Track both together'
          ],
          expected_impact: 'Build more positive habits effortlessly',
          effort_level: 'low',
          priority: 3
        }
      ] : [
        {
          title: 'Focus on One Keystone Habit',
          description: 'Choose one habit to build a strong streak, then expand from there.',
          implementation_steps: [
            'Pick your most important habit',
            'Set daily reminders',
            'Track progress for 30 days',
            'Celebrate small wins'
          ],
          expected_impact: 'Build momentum and consistency',
          effort_level: 'low',
          priority: 5
        }
      ]
    };
  }

  analyzeTaskPatterns(tasks: any[]): AnalysisResult | null {
    if (tasks.length === 0) return null;

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const completionRate = (completedTasks / tasks.length) * 100;

    return {
      type: 'task_prioritization',
      title: overdueTasks > 5 ? 'Task Backlog Alert' : 'Task Management Insights',
      content: `You have ${tasks.length} tasks with a ${completionRate.toFixed(0)}% completion rate. ${overdueTasks} tasks are overdue and ${highPriorityTasks} high-priority tasks need attention.`,
      summary: `${overdueTasks} overdue, ${highPriorityTasks} high-priority pending`,
      confidence_score: 0.88,
      data_sources: ['tasks'],
      recommendations: overdueTasks > 5 ? [
        {
          title: 'Clear Overdue Tasks',
          description: 'A large backlog creates stress. Tackle overdue tasks to regain control.',
          implementation_steps: [
            'List all overdue tasks',
            'Archive or delete obsolete ones',
            'Reschedule remaining tasks',
            'Block 2 hours for focused work'
          ],
          expected_impact: 'Reduced stress and improved focus',
          effort_level: 'medium',
          priority: 5
        }
      ] : [
        {
          title: 'Time Block High-Priority Tasks',
          description: 'Schedule dedicated time for your most important work.',
          implementation_steps: [
            'Identify top 3 high-priority tasks',
            'Block 90-minute focus sessions',
            'Eliminate distractions during blocks'
          ],
          expected_impact: 'Faster completion of important work',
          effort_level: 'low',
          priority: 4
        }
      ]
    };
  }

  analyzeReflectionSentiment(reflections: any[]): AnalysisResult | null {
    if (reflections.length === 0) return null;

    const moodValues = {
      'amazing': 5,
      'great': 4,
      'good': 3,
      'neutral': 2,
      'bad': 1,
      'terrible': 0
    };

    const moods = reflections.map(r => moodValues[r.mood as keyof typeof moodValues] || 2);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    const positiveReflections = moods.filter(m => m >= 3).length;
    const recentTrend = moods.slice(0, 7);
    const trendAvg = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;

    const isPositive = avgMood >= 3;

    return {
      type: 'reflection_sentiment',
      title: isPositive ? 'Positive Mindset Detected' : 'Well-being Check-In',
      content: `Your ${reflections.length} recent reflections show an average mood score of ${avgMood.toFixed(1)}/5. ${positiveReflections} reflections were positive. Recent trend: ${trendAvg >= avgMood ? 'improving' : 'declining slightly'}.`,
      summary: `${((positiveReflections / reflections.length) * 100).toFixed(0)}% positive reflections`,
      confidence_score: 0.75,
      data_sources: ['reflections'],
      recommendations: isPositive ? [
        {
          title: 'Maintain Positive Momentum',
          description: 'Your reflections show a healthy mindset. Keep it up!',
          implementation_steps: [
            'Continue daily reflections',
            'Share gratitude regularly',
            'Note what\'s working well'
          ],
          expected_impact: 'Sustained well-being',
          effort_level: 'low',
          priority: 2
        }
      ] : [
        {
          title: 'Focus on Self-Care',
          description: 'Your reflections suggest increased stress. Prioritize well-being.',
          implementation_steps: [
            'Schedule 30 min daily for relaxation',
            'Identify stress sources',
            'Reach out to friends or counselor',
            'Add enjoyable activities to your week'
          ],
          expected_impact: 'Improved mood and energy',
          effort_level: 'medium',
          priority: 5
        }
      ]
    };
  }

  async generateInsights(userId: string, types?: AIInsightType[]): Promise<AnalysisResult[]> {
    const data = await this.fetchUserData(userId);
    const insights: AnalysisResult[] = [];

    const analyzers: Record<AIInsightType, () => AnalysisResult | null> = {
      goal_progress: () => this.analyzeGoalProgress(data.goals),
      habit_analysis: () => this.analyzeHabitConsistency(data.habits),
      task_prioritization: () => this.analyzeTaskPatterns(data.tasks),
      reflection_sentiment: () => this.analyzeReflectionSentiment(data.reflections),
      productivity_pattern: () => null, // TODO: Implement
      time_optimization: () => null, // TODO: Implement
      project_health: () => null, // TODO: Implement
      burnout_risk: () => null, // TODO: Implement
      achievement_opportunity: () => null, // TODO: Implement
    };

    const typesToAnalyze = types || Object.keys(analyzers) as AIInsightType[];

    for (const type of typesToAnalyze) {
      const analyzer = analyzers[type];
      if (analyzer) {
        const result = analyzer();
        if (result) insights.push(result);
      }
    }

    return insights;
  }
}
