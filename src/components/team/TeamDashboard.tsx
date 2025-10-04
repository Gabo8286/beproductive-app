import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  Plus,
  Activity,
  Award,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSharedGoals } from "@/hooks/useSharedGoals";
import { CreateSharedGoalDialog } from "@/components/team/CreateSharedGoalDialog";
import { WorkspaceSelector } from "@/components/team/WorkspaceSelector";
import { TeamAnalyticsDashboard } from "@/components/team/TeamAnalyticsDashboard";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";

// Mock data for development - will be replaced with real API calls
const mockTeamData = {
  team: {
    id: "team-1",
    name: "Product Team Alpha",
    description: "Our core product development team",
    memberCount: 6,
    activeProjects: 3,
    completedGoals: 12,
    totalGoals: 18
  },
  members: [
    { id: "1", name: "Alice Johnson", role: "Team Lead", avatar: "A", productivity: 85, goalsCompleted: 8 },
    { id: "2", name: "Bob Smith", role: "Developer", avatar: "B", productivity: 92, goalsCompleted: 12 },
    { id: "3", name: "Carol Davis", role: "Designer", avatar: "C", productivity: 78, goalsCompleted: 6 },
    { id: "4", name: "David Wilson", role: "Developer", avatar: "D", productivity: 88, goalsCompleted: 10 },
    { id: "5", name: "Eve Brown", role: "QA Engineer", avatar: "E", productivity: 91, goalsCompleted: 9 },
    { id: "6", name: "Frank Miller", role: "Product Manager", avatar: "F", productivity: 83, goalsCompleted: 7 }
  ],
  sharedGoals: [
    { id: "1", title: "Launch Beta Version", progress: 75, dueDate: "2025-11-15", assignedTo: 4 },
    { id: "2", title: "User Testing Round 2", progress: 45, dueDate: "2025-10-30", assignedTo: 3 },
    { id: "3", title: "Performance Optimization", progress: 90, dueDate: "2025-10-25", assignedTo: 2 }
  ],
  weeklyProgress: [
    { week: "Week 1", teamProductivity: 82, goalsCompleted: 2 },
    { week: "Week 2", teamProductivity: 85, goalsCompleted: 3 },
    { week: "Week 3", teamProductivity: 88, goalsCompleted: 4 },
    { week: "Week 4", teamProductivity: 87, goalsCompleted: 3 }
  ]
};

export function TeamDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();

  // Get current workspace - in a real implementation, this would come from workspace context
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>("");
  const { sharedGoals, isLoading: goalsLoading, updateSharedGoalProgress } = useSharedGoals(currentWorkspaceId);

  // Check if user has required role for team collaboration
  const hasTeamAccess = profile?.role && ["team_lead", "admin", "enterprise", "super_admin"].includes(profile.role);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to access team collaboration features.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasTeamAccess) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Team Access Required</AlertTitle>
        <AlertDescription>
          Team collaboration features require team lead, admin, or enterprise access.
          Your current role: {profile?.role || 'user'}
        </AlertDescription>
      </Alert>
    );
  }

  const teamProductivityAvg = mockTeamData.members.reduce((sum, member) => sum + member.productivity, 0) / mockTeamData.members.length;
  const goalCompletionRate = (mockTeamData.team.completedGoals / mockTeamData.team.totalGoals) * 100;

  // Calculate real shared goals statistics
  const activeSharedGoals = sharedGoals.filter(goal => goal.status === 'active');
  const completedSharedGoals = sharedGoals.filter(goal => goal.status === 'completed');
  const sharedGoalCompletionRate = sharedGoals.length > 0 ? (completedSharedGoals.length / sharedGoals.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Team Collaboration
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team and track shared goals
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Team Settings
          </Button>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div>
          <h3 className="font-medium">Select Workspace</h3>
          <p className="text-sm text-muted-foreground">
            Choose a workspace to view and manage shared goals
          </p>
        </div>
        <WorkspaceSelector
          value={currentWorkspaceId}
          onValueChange={setCurrentWorkspaceId}
          className="flex-shrink-0"
        />
      </div>

      {!currentWorkspaceId && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertTitle>No Workspace Selected</AlertTitle>
          <AlertDescription>
            Please select a workspace to view team collaboration features and shared goals.
          </AlertDescription>
        </Alert>
      )}

      {/* Team Overview Cards - Only show when workspace is selected */}
      {currentWorkspaceId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamData.team.memberCount}</div>
            <p className="text-xs text-muted-foreground">Active contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedSharedGoals.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(teamProductivityAvg)}%</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(sharedGoalCompletionRate)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Shared Goals</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Team Progress (4 Weeks)</CardTitle>
                <CardDescription>
                  Weekly productivity and goal completion trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTeamData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="teamProductivity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Productivity %"
                    />
                    <Line
                      type="monotone"
                      dataKey="goalsCompleted"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Goals Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Shared Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Active Shared Goals</CardTitle>
                <CardDescription>
                  Current team objectives and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activeSharedGoals.length > 0 ? (
                  activeSharedGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge variant="outline">{goal.progress}%</Badge>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{goal.assigned_members.length} members assigned</span>
                        {goal.target_date && (
                          <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No active shared goals</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setCreateGoalOpen(true)}
                    >
                      Create First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shared Goals</h2>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Shared Goal
            </Button>
          </div>

          {goalsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : sharedGoals.length > 0 ? (
            <div className="grid gap-4">
              {sharedGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {goal.category}
                          </Badge>
                          <Badge
                            variant={goal.progress >= 90 ? "default" : goal.progress >= 50 ? "secondary" : "outline"}
                          >
                            {goal.progress}% Complete
                          </Badge>
                        </div>
                      </div>

                      <Progress
                        value={goal.progress}
                        className="h-3 cursor-pointer"
                        onClick={() => {
                          const newProgress = Math.min(goal.progress + 10, 100);
                          updateSharedGoalProgress.mutate({ id: goal.id, progress: newProgress });
                        }}
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {goal.assigned_members.length} team members
                        </span>
                        {goal.target_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shared goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shared goal to start collaborating with your team.
              </p>
              <Button onClick={() => setCreateGoalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Shared Goal
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Team Members</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockTeamData.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Productivity</span>
                        <span>{member.productivity}%</span>
                      </div>
                      <Progress value={member.productivity} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {member.goalsCompleted} goals completed
                      </span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {currentWorkspaceId ? (
            <div className="space-y-6">
              <TeamAnalyticsDashboard workspaceId={currentWorkspaceId} />
              <TeamActivityFeed workspaceId={currentWorkspaceId} limit={20} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p>Select a workspace to view analytics</p>
                  <p className="text-sm">Choose a workspace from the selector above</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        </>
      )}

      {/* Create Shared Goal Dialog */}
      <CreateSharedGoalDialog
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
        workspaceId={currentWorkspaceId}
        teamMembers={mockTeamData.members.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role
        }))}
      />
    </div>
  );
}