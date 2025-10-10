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
  UserPlus,
  Mail,
  Settings,
  Crown,
  Shield,
  MessageCircle,
  Calendar,
  Activity,
  CheckCircle,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatar?: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  completedTasks: number;
  activeProjects: number;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Gabriel Soto",
    email: "gabriel@beproductive.com",
    role: "admin",
    status: "active",
    lastActive: "Just now",
    completedTasks: 24,
    activeProjects: 3,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@beproductive.com",
    role: "member",
    status: "active",
    lastActive: "2 hours ago",
    completedTasks: 18,
    activeProjects: 2,
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@beproductive.com",
    role: "member",
    status: "inactive",
    lastActive: "Yesterday",
    completedTasks: 12,
    activeProjects: 1,
  },
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return Crown;
    case "member":
      return Users;
    case "viewer":
      return Shield;
    default:
      return Users;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "member":
      return "bg-blue-100 text-blue-800";
    case "viewer":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Team() {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Journey</h1>
          <p className="text-muted-foreground">
            Collaborate with your team members and manage workspace access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Members
              </p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Members
              </p>
              <p className="text-2xl font-bold">
                {teamMembers.filter((m) => m.status === "active").length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Tasks Completed
              </p>
              <p className="text-2xl font-bold">
                {teamMembers.reduce((sum, m) => sum + m.completedTasks, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Projects
              </p>
              <p className="text-2xl font-bold">
                {Math.max(...teamMembers.map((m) => m.activeProjects))}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="settings">Team Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4">
            {teamMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-muted-foreground">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {member.role}
                            </Badge>
                            <Badge className={getStatusBadgeColor(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-2">
                          Last active: {member.lastActive}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">
                              {member.completedTasks}
                            </div>
                            <div className="text-muted-foreground">Tasks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">
                              {member.activeProjects}
                            </div>
                            <div className="text-muted-foreground">Projects</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Permissions</CardTitle>
              <CardDescription>
                Manage what team members can see and do in your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Permission Management</h3>
                  <p className="text-muted-foreground">
                    Configure role-based access control and permissions for your team members
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Real-time collaboration features and shared workspaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Collaboration Tools</h3>
                  <p className="text-muted-foreground">
                    Share projects, collaborate on tasks, and communicate with your team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                Configure team-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Team Configuration</h3>
                  <p className="text-muted-foreground">
                    Manage team settings, workspace preferences, and collaboration rules
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}