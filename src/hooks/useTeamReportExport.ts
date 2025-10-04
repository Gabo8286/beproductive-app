import { useMutation } from '@tanstack/react-query';
import { useTeamAnalytics } from './useTeamAnalytics';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  sections: {
    overview: boolean;
    memberPerformance: boolean;
    goalAnalytics: boolean;
    taskAnalytics: boolean;
    productivityTrends: boolean;
    activityHeatmap: boolean;
  };
  periodDays: number;
}

export const useTeamReportExport = (workspaceId: string) => {
  const exportReport = useMutation({
    mutationFn: async (options: ExportOptions) => {
      const { analytics, isLoading, error } = useTeamAnalytics(workspaceId, options.periodDays);

      if (isLoading || error || !analytics) {
        throw new Error('Analytics data not available for export');
      }

      const reportData = {
        metadata: {
          workspaceId,
          exportDate: new Date().toISOString(),
          periodDays: options.periodDays,
          periodStart: format(new Date(Date.now() - options.periodDays * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          periodEnd: format(new Date(), 'yyyy-MM-dd'),
          exportFormat: options.format
        },
        sections: {} as any
      };

      // Include requested sections
      if (options.sections.overview) {
        reportData.sections.overview = analytics.overview;
      }

      if (options.sections.memberPerformance) {
        reportData.sections.memberPerformance = analytics.member_performance;
      }

      if (options.sections.goalAnalytics) {
        reportData.sections.goalAnalytics = analytics.goal_analytics;
      }

      if (options.sections.taskAnalytics) {
        reportData.sections.taskAnalytics = analytics.task_analytics;
      }

      if (options.sections.productivityTrends) {
        reportData.sections.productivityTrends = analytics.productivity_trends;
      }

      if (options.sections.activityHeatmap) {
        reportData.sections.activityHeatmap = analytics.activity_heatmap;
      }

      return exportToFormat(reportData, options.format);
    },
    onSuccess: (data, options) => {
      downloadFile(data, `team-report-${format(new Date(), 'yyyy-MM-dd')}.${options.format}`);
      toast.success('Report exported successfully');
    },
    onError: (error) => {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  });

  return { exportReport };
};

function exportToFormat(data: any, format: 'csv' | 'json' | 'pdf'): { blob: Blob; filename: string } {
  switch (format) {
    case 'json':
      return {
        blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        filename: `team-report-${format(new Date(), 'yyyy-MM-dd')}.json`
      };

    case 'csv':
      return {
        blob: new Blob([convertToCSV(data)], { type: 'text/csv' }),
        filename: `team-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
      };

    case 'pdf':
      // For PDF export, we'd need a library like jsPDF or pdfkit
      // For now, return JSON format as fallback
      return {
        blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        filename: `team-report-${format(new Date(), 'yyyy-MM-dd')}.json`
      };

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function convertToCSV(data: any): string {
  const lines: string[] = [];

  // Add metadata
  lines.push('Team Analytics Report');
  lines.push(`Export Date,${data.metadata.exportDate}`);
  lines.push(`Period,${data.metadata.periodStart} to ${data.metadata.periodEnd}`);
  lines.push('');

  // Overview section
  if (data.sections.overview) {
    lines.push('OVERVIEW');
    lines.push('Metric,Value');
    Object.entries(data.sections.overview).forEach(([key, value]) => {
      lines.push(`${key.replace(/_/g, ' ')},${value}`);
    });
    lines.push('');
  }

  // Member Performance section
  if (data.sections.memberPerformance) {
    lines.push('MEMBER PERFORMANCE');
    lines.push('Name,Email,Tasks Assigned,Tasks Completed,Completion Rate,Avg Task Time,Last Activity');
    data.sections.memberPerformance.forEach((member: any) => {
      lines.push([
        member.user_name,
        member.user_email,
        member.tasks_assigned,
        member.tasks_completed,
        member.completion_rate.toFixed(1) + '%',
        member.avg_task_time.toFixed(1) + 'h',
        member.last_activity
      ].join(','));
    });
    lines.push('');
  }

  // Goal Analytics section
  if (data.sections.goalAnalytics) {
    lines.push('GOAL ANALYTICS');
    lines.push('Goal Title,Progress,Status,Tasks Count,Completed Tasks,Assigned Members,Completion Velocity');
    data.sections.goalAnalytics.forEach((goal: any) => {
      lines.push([
        `"${goal.goal_title}"`,
        goal.progress + '%',
        goal.status,
        goal.tasks_count,
        goal.completed_tasks,
        goal.assigned_members,
        goal.completion_velocity.toFixed(1) + '%/day'
      ].join(','));
    });
    lines.push('');
  }

  // Task Analytics section
  if (data.sections.taskAnalytics) {
    lines.push('TASK ANALYTICS');
    lines.push('');

    lines.push('Status Distribution');
    lines.push('Status,Count,Percentage');
    data.sections.taskAnalytics.status_distribution.forEach((status: any) => {
      lines.push([status.status, status.count, status.percentage.toFixed(1) + '%'].join(','));
    });
    lines.push('');

    lines.push('Priority Distribution');
    lines.push('Priority,Count,Percentage');
    data.sections.taskAnalytics.priority_distribution.forEach((priority: any) => {
      lines.push([priority.priority, priority.count, priority.percentage.toFixed(1) + '%'].join(','));
    });
    lines.push('');

    lines.push('Top Performers');
    lines.push('Name,Completed Tasks');
    data.sections.taskAnalytics.top_performers.forEach((performer: any) => {
      lines.push([performer.user_name, performer.completed_count].join(','));
    });
    lines.push('');
  }

  // Productivity Trends section
  if (data.sections.productivityTrends) {
    lines.push('PRODUCTIVITY TRENDS');
    lines.push('Date,Tasks Completed,Goals Completed,Member Activity');
    data.sections.productivityTrends.forEach((trend: any) => {
      lines.push([
        trend.date,
        trend.tasks_completed,
        trend.goals_completed,
        trend.member_activity
      ].join(','));
    });
    lines.push('');
  }

  return lines.join('\n');
}

function downloadFile(data: { blob: Blob; filename: string }, filename: string): void {
  const url = URL.createObjectURL(data.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}