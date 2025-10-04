import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamAnalytics {
  workspace_id: string;
  period_days: number;
  overview: {
    total_members: number;
    active_members: number;
    total_goals: number;
    completed_goals: number;
    total_tasks: number;
    completed_tasks: number;
    goal_completion_rate: number;
    task_completion_rate: number;
    avg_task_completion_time: number;
  };
  productivity_trends: {
    date: string;
    tasks_completed: number;
    goals_completed: number;
    member_activity: number;
  }[];
  member_performance: {
    user_id: string;
    user_name: string;
    user_email: string;
    avatar_url?: string;
    tasks_assigned: number;
    tasks_completed: number;
    goals_participated: number;
    completion_rate: number;
    avg_task_time: number;
    last_activity: string;
  }[];
  goal_analytics: {
    goal_id: string;
    goal_title: string;
    progress: number;
    status: string;
    tasks_count: number;
    completed_tasks: number;
    assigned_members: number;
    days_remaining?: number;
    completion_velocity: number;
  }[];
  task_analytics: {
    status_distribution: {
      status: string;
      count: number;
      percentage: number;
    }[];
    priority_distribution: {
      priority: string;
      count: number;
      percentage: number;
    }[];
    overdue_tasks: number;
    avg_completion_time: number;
    top_performers: {
      user_id: string;
      user_name: string;
      completed_count: number;
    }[];
  };
  activity_heatmap: {
    date: string;
    activity_count: number;
    activity_types: {
      [key: string]: number;
    };
  }[];
}

export interface WorkspaceInsights {
  workspace_id: string;
  insights: {
    type: 'positive' | 'warning' | 'neutral';
    title: string;
    description: string;
    metric?: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  recommendations: {
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export const useTeamAnalytics = (workspaceId?: string, periodDays: number = 30) => {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['team-analytics', workspaceId, periodDays],
    queryFn: async (): Promise<TeamAnalytics> => {
      if (!workspaceId || !user?.id) {
        throw new Error('Workspace ID and user authentication required');
      }

      // Use the database function to get team analytics
      const { data, error } = await supabase.rpc('get_team_analytics', {
        p_workspace_id: workspaceId,
        p_days: periodDays
      });

      if (error) throw error;

      // If the function doesn't exist yet, build analytics manually
      if (!data) {
        return buildAnalyticsManually(workspaceId, periodDays);
      }

      return data;
    },
    enabled: !!workspaceId && !!user?.id
  });

  return {
    analytics,
    isLoading,
    error
  };
};

// Fallback function to build analytics manually if database function doesn't exist
async function buildAnalyticsManually(workspaceId: string, periodDays: number): Promise<TeamAnalytics> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Get workspace members
  const { data: members } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      user:profiles(id, email, full_name, avatar_url)
    `)
    .eq('workspace_id', workspaceId);

  // Get workspace goals
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      status,
      progress,
      timeline_end,
      created_at,
      assigned_members:goal_collaborators(user_id)
    `)
    .eq('workspace_id', workspaceId);

  // Get workspace tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      completed_at,
      created_at,
      estimated_duration,
      actual_duration
    `)
    .eq('workspace_id', workspaceId);

  // Get team activities for trends
  const { data: activities } = await supabase
    .from('team_activities')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Calculate overview metrics
  const totalMembers = members?.length || 0;
  const activeMembers = activities ?
    new Set(activities.map(a => a.user_id)).size : totalMembers;

  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;

  const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate average task completion time
  const completedTasksWithTime = tasks?.filter(t =>
    t.status === 'done' && t.completed_at && t.actual_duration
  ) || [];
  const avgTaskCompletionTime = completedTasksWithTime.length > 0 ?
    completedTasksWithTime.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasksWithTime.length : 0;

  // Build productivity trends (daily data for the period)
  const productivityTrends = [];
  for (let i = 0; i < periodDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayActivities = activities?.filter(a =>
      a.created_at.startsWith(dateStr)
    ) || [];

    const tasksCompleted = dayActivities.filter(a =>
      a.activity_type === 'task_completed'
    ).length;

    const goalsCompleted = dayActivities.filter(a =>
      a.activity_type === 'goal_completed'
    ).length;

    productivityTrends.unshift({
      date: dateStr,
      tasks_completed: tasksCompleted,
      goals_completed: goalsCompleted,
      member_activity: new Set(dayActivities.map(a => a.user_id)).size
    });
  }

  // Build member performance data
  const memberPerformance = members?.map(member => {
    const memberTasks = tasks?.filter(t => t.assigned_to === member.user_id) || [];
    const completedMemberTasks = memberTasks.filter(t => t.status === 'done');
    const memberGoals = goals?.filter(g =>
      g.assigned_members?.some(am => am.user_id === member.user_id)
    ) || [];

    const memberActivities = activities?.filter(a => a.user_id === member.user_id) || [];
    const lastActivity = memberActivities.length > 0 ?
      memberActivities[memberActivities.length - 1].created_at : member.user?.created_at || '';

    const completionRate = memberTasks.length > 0 ?
      (completedMemberTasks.length / memberTasks.length) * 100 : 0;

    const avgTaskTime = completedMemberTasks.length > 0 ?
      completedMemberTasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedMemberTasks.length : 0;

    return {
      user_id: member.user_id,
      user_name: member.user?.full_name || member.user?.email || 'Unknown',
      user_email: member.user?.email || '',
      avatar_url: member.user?.avatar_url,
      tasks_assigned: memberTasks.length,
      tasks_completed: completedMemberTasks.length,
      goals_participated: memberGoals.length,
      completion_rate: completionRate,
      avg_task_time: avgTaskTime,
      last_activity: lastActivity
    };
  }) || [];

  // Build goal analytics
  const goalAnalytics = goals?.map(goal => {
    const goalTasks = tasks?.filter(t =>
      t.metadata?.goal_id === goal.id
    ) || [];

    const completedGoalTasks = goalTasks.filter(t => t.status === 'done');

    const daysRemaining = goal.timeline_end ?
      Math.ceil((new Date(goal.timeline_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : undefined;

    // Simple velocity calculation (progress per day)
    const goalAge = (new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const completionVelocity = goalAge > 0 ? goal.progress / goalAge : 0;

    return {
      goal_id: goal.id,
      goal_title: goal.title,
      progress: goal.progress,
      status: goal.status,
      tasks_count: goalTasks.length,
      completed_tasks: completedGoalTasks.length,
      assigned_members: goal.assigned_members?.length || 0,
      days_remaining: daysRemaining,
      completion_velocity: completionVelocity
    };
  }) || [];

  // Build task analytics
  const statusCounts = tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const priorityCounts = tasks?.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0
  }));

  const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
    percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0
  }));

  const overdueTasks = tasks?.filter(t =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length || 0;

  const topPerformers = memberPerformance
    .sort((a, b) => b.tasks_completed - a.tasks_completed)
    .slice(0, 5)
    .map(member => ({
      user_id: member.user_id,
      user_name: member.user_name,
      completed_count: member.tasks_completed
    }));

  // Build activity heatmap
  const activityHeatmap = productivityTrends.map(day => {
    const dayActivities = activities?.filter(a =>
      a.created_at.startsWith(day.date)
    ) || [];

    const activityTypes = dayActivities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      date: day.date,
      activity_count: dayActivities.length,
      activity_types: activityTypes
    };
  });

  return {
    workspace_id: workspaceId,
    period_days: periodDays,
    overview: {
      total_members: totalMembers,
      active_members: activeMembers,
      total_goals: totalGoals,
      completed_goals: completedGoals,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      goal_completion_rate: goalCompletionRate,
      task_completion_rate: taskCompletionRate,
      avg_task_completion_time: avgTaskCompletionTime
    },
    productivity_trends: productivityTrends,
    member_performance: memberPerformance,
    goal_analytics: goalAnalytics,
    task_analytics: {
      status_distribution: statusDistribution,
      priority_distribution: priorityDistribution,
      overdue_tasks: overdueTasks,
      avg_completion_time: avgTaskCompletionTime,
      top_performers: topPerformers
    },
    activity_heatmap: activityHeatmap
  };
}

export const useWorkspaceInsights = (workspaceId?: string) => {
  const { user } = useAuth();

  const {
    data: insights,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workspace-insights', workspaceId],
    queryFn: async (): Promise<WorkspaceInsights> => {
      if (!workspaceId || !user?.id) {
        throw new Error('Workspace ID and user authentication required');
      }

      // Generate insights based on analytics data
      const analytics = await buildAnalyticsManually(workspaceId, 30);

      const generatedInsights = [];
      const recommendations = [];

      // Analyze completion rates
      if (analytics.overview.task_completion_rate > 80) {
        generatedInsights.push({
          type: 'positive' as const,
          title: 'Excellent Task Completion',
          description: `Your team has a ${analytics.overview.task_completion_rate.toFixed(1)}% task completion rate`,
          metric: `${analytics.overview.task_completion_rate.toFixed(1)}%`,
          trend: 'up' as const
        });
      } else if (analytics.overview.task_completion_rate < 50) {
        generatedInsights.push({
          type: 'warning' as const,
          title: 'Low Task Completion Rate',
          description: `Task completion rate is ${analytics.overview.task_completion_rate.toFixed(1)}%, consider reviewing workloads`,
          metric: `${analytics.overview.task_completion_rate.toFixed(1)}%`,
          trend: 'down' as const
        });

        recommendations.push({
          title: 'Improve Task Completion',
          description: 'Review current task assignments and deadlines to improve completion rates',
          action: 'Review task workloads and deadlines',
          priority: 'high' as const
        });
      }

      // Analyze member activity
      const activityRate = (analytics.overview.active_members / analytics.overview.total_members) * 100;
      if (activityRate < 70) {
        generatedInsights.push({
          type: 'warning' as const,
          title: 'Low Member Activity',
          description: `Only ${analytics.overview.active_members} of ${analytics.overview.total_members} members have been active recently`,
          metric: `${activityRate.toFixed(1)}%`,
          trend: 'down' as const
        });

        recommendations.push({
          title: 'Increase Team Engagement',
          description: 'Some team members have been inactive. Consider check-ins or task redistribution',
          action: 'Schedule team check-ins',
          priority: 'medium' as const
        });
      }

      // Analyze overdue tasks
      if (analytics.task_analytics.overdue_tasks > 0) {
        generatedInsights.push({
          type: 'warning' as const,
          title: 'Overdue Tasks',
          description: `${analytics.task_analytics.overdue_tasks} tasks are past their due date`,
          metric: `${analytics.task_analytics.overdue_tasks}`,
          trend: 'down' as const
        });

        recommendations.push({
          title: 'Address Overdue Tasks',
          description: 'Review and reschedule overdue tasks to keep projects on track',
          action: 'Review overdue tasks',
          priority: 'high' as const
        });
      }

      // Analyze goal progress
      const goalsOnTrack = analytics.goal_analytics.filter(g =>
        g.completion_velocity > 0 && g.status === 'active'
      ).length;

      if (goalsOnTrack < analytics.overview.total_goals / 2) {
        recommendations.push({
          title: 'Review Goal Progress',
          description: 'Several goals may need attention to stay on track',
          action: 'Review goal timelines and assignments',
          priority: 'medium' as const
        });
      }

      return {
        workspace_id: workspaceId,
        insights: generatedInsights,
        recommendations: recommendations
      };
    },
    enabled: !!workspaceId && !!user?.id
  });

  return {
    insights,
    isLoading,
    error
  };
};