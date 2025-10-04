import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Target,
  UserPlus,
  MessageSquare,
  GitBranch,
  Calendar,
  Activity,
  Filter,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface TeamActivity {
  id: string;
  workspace_id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description?: string;
  related_task_id?: string;
  related_goal_id?: string;
  metadata: any;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface TeamActivityFeedProps {
  workspaceId: string;
  limit?: number;
  showFilters?: boolean;
}

export function TeamActivityFeed({ workspaceId, limit = 50, showFilters = true }: TeamActivityFeedProps) {
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('7d');

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['team-activities', workspaceId, activityFilter, timeFilter, limit],
    queryFn: async () => {
      let query = supabase
        .from('team_activities')
        .select(`
          *,
          user:profiles(id, email, full_name, avatar_url)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply time filter
      if (timeFilter !== 'all') {
        const days = parseInt(timeFilter.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply activity type filter
      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TeamActivity[];
    },
    enabled: !!workspaceId
  });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'task_created':
      case 'task_updated':
      case 'task_assigned':
        return <GitBranch className="h-4 w-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'goal_created':
      case 'goal_updated':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'goal_completed':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'member_joined':
      case 'member_invited':
        return <UserPlus className="h-4 w-4 text-indigo-600" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'task_completed':
      case 'goal_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'task_created':
      case 'goal_created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'member_joined':
      case 'member_invited':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'comment_added':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatActivityType = (activityType: string) => {
    return activityType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActivityDetails = (activity: TeamActivity) => {
    const { metadata } = activity;
    const details = [];

    if (metadata?.task_title) {
      details.push(`Task: ${metadata.task_title}`);
    }
    if (metadata?.goal_title) {
      details.push(`Goal: ${metadata.goal_title}`);
    }
    if (metadata?.assigned_to) {
      details.push(`Assigned to: ${metadata.assigned_to_name || metadata.assigned_to}`);
    }
    if (metadata?.status) {
      details.push(`Status: ${metadata.status}`);
    }

    return details.join(' • ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load activity feed</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Team Activity Feed
              </CardTitle>
              <CardDescription>
                Recent team activities and updates
              </CardDescription>
            </div>
            {showFilters && (
              <div className="flex gap-2">
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="task_created">Tasks Created</SelectItem>
                    <SelectItem value="task_completed">Tasks Completed</SelectItem>
                    <SelectItem value="goal_created">Goals Created</SelectItem>
                    <SelectItem value="goal_completed">Goals Completed</SelectItem>
                    <SelectItem value="member_joined">Members Joined</SelectItem>
                    <SelectItem value="comment_added">Comments Added</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last Day</SelectItem>
                    <SelectItem value="7d">Last Week</SelectItem>
                    <SelectItem value="30d">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="feed" className="w-full">
            <TabsList>
              <TabsTrigger value="feed">Activity Feed</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4 mt-6">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No activities found</p>
                  <p className="text-sm">Activities will appear here as your team works</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {activity.user?.full_name?.charAt(0) ||
                           activity.user?.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityIcon(activity.activity_type)}
                          <span className="font-medium text-sm">
                            {activity.user?.full_name || activity.user?.email || 'Unknown User'}
                          </span>
                          <Badge className={getActivityColor(activity.activity_type)}>
                            {formatActivityType(activity.activity_type)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-1">
                          {activity.title}
                        </p>

                        {activity.description && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {activity.description}
                          </p>
                        )}

                        {getActivityDetails(activity) && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {getActivityDetails(activity)}
                          </p>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span title={format(new Date(activity.created_at), 'PPpp')}>
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(activityCounts).map(([type, count]) => (
                  <Card key={type}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(type)}
                          <span className="text-sm font-medium">
                            {formatActivityType(type)}
                          </span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {Object.keys(activityCounts).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No activity summary available</p>
                  <p className="text-sm">Activity data will appear as your team works</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}