import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Target,
  Users,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle2,
  Clock,
  Activity,
  MessageSquare
} from 'lucide-react';
import { useSharedGoals, type SharedGoal } from '@/hooks/useSharedGoals';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { format } from 'date-fns';

interface SharedGoalDetailProps {
  goal: SharedGoal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SharedGoalDetail({ goal, onEdit, onDelete }: SharedGoalDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    updateSharedGoalProgress,
    updateSharedGoalStatus,
    assignMemberToGoal,
    removeMemberFromGoal,
    deleteSharedGoal
  } = useSharedGoals();

  const { members } = useWorkspace(goal.workspace_id);

  const handleProgressUpdate = (increment: number) => {
    const newProgress = Math.min(Math.max(goal.progress + increment, 0), 100);
    updateSharedGoalProgress.mutate({ id: goal.id, progress: newProgress });
  };

  const handleStatusChange = (status: 'active' | 'completed' | 'archived') => {
    updateSharedGoalStatus.mutate({ id: goal.id, status });
  };

  const handleDeleteGoal = () => {
    deleteSharedGoal.mutate(goal.id);
    onDelete?.();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{goal.title}</h1>
          </div>
          {goal.description && (
            <p className="text-muted-foreground">{goal.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <Badge className={getPriorityColor(goal.priority)}>
              {goal.priority}
            </Badge>
            <Badge className={getStatusColor(goal.status)}>
              {goal.status}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {goal.assigned_members.length} collaborators
            </span>
            {goal.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due {format(new Date(goal.target_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Goal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleStatusChange('completed')}
              disabled={goal.status === 'completed'}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange('archived')}
              disabled={goal.status === 'archived'}
            >
              <Clock className="h-4 w-4 mr-2" />
              Archive Goal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Goal
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{goal.title}"? This action cannot be undone
                    and will remove all associated data including tasks and comments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGoal}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Goal
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progress</span>
            <span className="text-2xl font-bold">{goal.progress}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={goal.progress} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProgressUpdate(-10)}
                disabled={goal.progress <= 0}
              >
                -10%
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProgressUpdate(10)}
                disabled={goal.progress >= 100}
              >
                +10%
              </Button>
            </div>
            <div className="text-muted-foreground">
              {goal.total_tasks && (
                <span>
                  {goal.completed_tasks || 0} of {goal.total_tasks} tasks completed
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collaborators">
            Collaborators ({goal.assigned_members.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="capitalize">{goal.category}</p>
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>
                    <p className="capitalize">{goal.priority}</p>
                  </div>
                  {goal.timeline_start && (
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p>{format(new Date(goal.timeline_start), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  {goal.timeline_end && (
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p>{format(new Date(goal.timeline_end), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{format(new Date(goal.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>
                    <p>{format(new Date(goal.updated_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold">{goal.progress}%</p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold">{goal.assigned_members.length}</p>
                    <p className="text-sm text-muted-foreground">Collaborators</p>
                  </div>
                  {goal.total_tasks !== undefined && (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold">{goal.completed_tasks || 0}</p>
                        <p className="text-sm text-muted-foreground">Tasks Done</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                        <p className="text-2xl font-bold">{goal.total_tasks - (goal.completed_tasks || 0)}</p>
                        <p className="text-sm text-muted-foreground">Tasks Left</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Goal Collaborators</h3>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Collaborator
            </Button>
          </div>

          <div className="grid gap-4">
            {/* Goal Owner */}
            {goal.owner && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={goal.owner.avatar_url} />
                        <AvatarFallback>
                          {goal.owner.full_name?.charAt(0) || goal.owner.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {goal.owner.full_name || goal.owner.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {goal.owner.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Owner</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collaborators */}
            {goal.assigned_members.map((collaborator) => (
              <Card key={collaborator.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={collaborator.user?.avatar_url} />
                        <AvatarFallback>
                          {collaborator.user?.full_name?.charAt(0) || collaborator.user?.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {collaborator.user?.full_name || collaborator.user?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {collaborator.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {format(new Date(collaborator.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {collaborator.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => removeMemberFromGoal.mutate({
                              goalId: goal.id,
                              userId: collaborator.user_id
                            })}
                            className="text-destructive focus:text-destructive"
                          >
                            Remove from Goal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Track progress and updates on this goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Activity feed coming soon</p>
                <p className="text-sm">View updates, comments, and progress changes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}