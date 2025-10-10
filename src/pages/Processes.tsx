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
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  FileText,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  GitBranch,
  Zap,
} from "lucide-react";

interface Process {
  id: string;
  name: string;
  description: string;
  category: "development" | "marketing" | "operations" | "hr";
  status: "active" | "draft" | "archived";
  steps: number;
  estimatedTime: string;
  usageCount: number;
  lastUsed: string;
  owner: string;
}

const processes: Process[] = [
  {
    id: "1",
    name: "New Employee Onboarding",
    description: "Complete workflow for onboarding new team members",
    category: "hr",
    status: "active",
    steps: 8,
    estimatedTime: "3 days",
    usageCount: 12,
    lastUsed: "2 days ago",
    owner: "HR Team",
  },
  {
    id: "2",
    name: "Feature Development Process",
    description: "End-to-end process for developing new product features",
    category: "development",
    status: "active",
    steps: 12,
    estimatedTime: "2 weeks",
    usageCount: 24,
    lastUsed: "1 day ago",
    owner: "Development Team",
  },
  {
    id: "3",
    name: "Content Creation Workflow",
    description: "Process for creating and publishing marketing content",
    category: "marketing",
    status: "active",
    steps: 6,
    estimatedTime: "1 week",
    usageCount: 18,
    lastUsed: "3 hours ago",
    owner: "Marketing Team",
  },
  {
    id: "4",
    name: "Bug Triage Process",
    description: "Systematic approach to handling bug reports",
    category: "development",
    status: "draft",
    steps: 5,
    estimatedTime: "2 hours",
    usageCount: 0,
    lastUsed: "Never",
    owner: "QA Team",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "development":
      return "bg-blue-100 text-blue-800";
    case "marketing":
      return "bg-green-100 text-green-800";
    case "operations":
      return "bg-purple-100 text-purple-800";
    case "hr":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Processes() {
  const [activeTab, setActiveTab] = useState("processes");

  const activeProcesses = processes.filter((p) => p.status === "active");
  const draftProcesses = processes.filter((p) => p.status === "draft");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Guides</h1>
          <p className="text-muted-foreground">
            Documented workflows and processes to streamline your team's productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Process
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Processes
              </p>
              <p className="text-2xl font-bold">{processes.length}</p>
            </div>
            <Workflow className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Processes
              </p>
              <p className="text-2xl font-bold">{activeProcesses.length}</p>
            </div>
            <Play className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Usage
              </p>
              <p className="text-2xl font-bold">
                {processes.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Draft Processes
              </p>
              <p className="text-2xl font-bold">{draftProcesses.length}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="processes">All Processes</TabsTrigger>
          <TabsTrigger value="templates">Process Templates</TabsTrigger>
          <TabsTrigger value="automation">Process Automation</TabsTrigger>
          <TabsTrigger value="analytics">Process Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-4">
          <div className="grid gap-4">
            {processes.map((process) => (
              <Card key={process.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{process.name}</h3>
                        <Badge className={getCategoryColor(process.category)}>
                          {process.category}
                        </Badge>
                        <Badge className={getStatusColor(process.status)}>
                          {process.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {process.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          {process.steps} steps
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {process.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Used {process.usageCount} times
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {process.owner}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start Process
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Templates</CardTitle>
              <CardDescription>
                Pre-built process templates to get you started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Process Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from our library of proven process templates and customize them for your needs
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Automation</CardTitle>
              <CardDescription>
                Automate repetitive process steps and create smart workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Smart Automation</h3>
                  <p className="text-muted-foreground">
                    Set up triggers, conditions, and actions to automate your processes
                  </p>
                  <Button className="mt-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Analytics</CardTitle>
              <CardDescription>
                Track process performance and identify optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Process Insights</h3>
                  <p className="text-muted-foreground">
                    Analyze completion rates, bottlenecks, and process efficiency
                  </p>
                  <Button className="mt-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}