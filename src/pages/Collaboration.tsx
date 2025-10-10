import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageCircle,
  Share2,
  Video,
  FileText,
  Calendar,
  Bell,
  Plus,
  Settings,
  CheckCircle,
  Clock,
  UserPlus,
  Activity,
} from "lucide-react";

interface CollaborationActivity {
  id: string;
  type: "comment" | "share" | "mention" | "task_assigned" | "meeting";
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}

const recentActivity: CollaborationActivity[] = [
  {
    id: "1",
    type: "comment",
    user: "Sarah Johnson",
    action: "commented on",
    target: "Feature Development Task",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "task_assigned",
    user: "Mike Chen",
    action: "assigned you to",
    target: "UI Design Review",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    type: "share",
    user: "Gabriel Soto",
    action: "shared",
    target: "Q4 Planning Document",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "meeting",
    user: "Team",
    action: "scheduled",
    target: "Sprint Planning Meeting",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    type: "mention",
    user: "Alex Rivera",
    action: "mentioned you in",
    target: "Marketing Campaign Project",
    timestamp: "3 hours ago",
  },
];

interface SharedWorkspace {
  id: string;
  name: string;
  description: string;
  members: number;
  lastActivity: string;
  type: "project" | "team" | "document";
  status: "active" | "archived";
}

const sharedWorkspaces: SharedWorkspace[] = [
  {
    id: "1",
    name: "Product Development",
    description: "Main workspace for product feature development",
    members: 12,
    lastActivity: "5 minutes ago",
    type: "project",
    status: "active",
  },
  {
    id: "2",
    name: "Marketing Team",
    description: "Collaborative space for marketing campaigns",
    members: 8,
    lastActivity: "1 hour ago",
    type: "team",
    status: "active",
  },
  {
    id: "3",
    name: "Q4 Strategy",
    description: "Quarterly planning and strategy documents",
    members: 6,
    lastActivity: "2 days ago",
    type: "document",
    status: "active",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "comment":
      return MessageCircle;
    case "share":
      return Share2;
    case "mention":
      return Bell;
    case "task_assigned":
      return CheckCircle;
    case "meeting":
      return Calendar;
    default:
      return Activity;
  }
};

const getWorkspaceTypeColor = (type: string) => {
  switch (type) {
    case "project":
      return "bg-blue-100 text-blue-800";
    case "team":
      return "bg-green-100 text-green-800";
    case "document":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState("activity");

  const activeWorkspaces = sharedWorkspaces.filter((w) => w.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Collaboration</h1>
          <p className="text-muted-foreground">
            Work together, share knowledge, and stay synchronized with your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Video className="h-4 w-4 mr-2" />
            Start Meeting
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      {/* Collaboration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Workspaces
              </p>
              <p className="text-2xl font-bold">{activeWorkspaces.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Team Members
              </p>
              <p className="text-2xl font-bold">
                {sharedWorkspaces.reduce((sum, w) => sum + w.members, 0)}
              </p>
            </div>
            <UserPlus className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recent Comments
              </p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Shared Documents
              </p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="workspaces">Shared Workspaces</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="settings">Collaboration Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Stay updated with the latest team activities and mentions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {activity.user.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-muted-foreground">{activity.action}</span>
                          <span className="font-medium text-blue-600">{activity.target}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <div className="grid gap-4">
            {sharedWorkspaces.map((workspace) => (
              <Card key={workspace.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{workspace.name}</h3>
                        <Badge className={getWorkspaceTypeColor(workspace.type)}>
                          {workspace.type}
                        </Badge>
                        <Badge variant="outline">
                          {workspace.members} members
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {workspace.description}
                      </p>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Last activity: {workspace.lastActivity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Meetings</CardTitle>
              <CardDescription>
                Schedule and manage team meetings and video calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Meeting Management</h3>
                  <p className="text-muted-foreground">
                    Schedule meetings, share agendas, and collaborate in real-time
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button>
                      <Video className="h-4 w-4 mr-2" />
                      Start Instant Meeting
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Settings</CardTitle>
              <CardDescription>
                Configure notifications, permissions, and collaboration preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Real-time Notifications</p>
                        <p className="text-sm text-muted-foreground">Instant updates in the app</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Meeting Reminders</p>
                        <p className="text-sm text-muted-foreground">Get notified before meetings</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Sharing Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Sharing Level</p>
                        <p className="text-sm text-muted-foreground">Set default permissions for shared content</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">External Sharing</p>
                        <p className="text-sm text-muted-foreground">Allow sharing with external users</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}