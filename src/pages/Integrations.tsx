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
  Globe,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  Database,
  Cloud,
  Link,
  Key,
  Shield,
  Activity,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "development" | "communication" | "analytics" | "storage";
  status: "connected" | "available" | "error";
  icon: string;
  features: string[];
  lastSync?: string;
  syncCount?: number;
}

const integrations: Integration[] = [
  {
    id: "1",
    name: "GitHub",
    description: "Sync issues, pull requests, and project milestones",
    category: "development",
    status: "connected",
    icon: "🐙",
    features: ["Issue tracking", "PR management", "Milestone sync", "Commit tracking"],
    lastSync: "2 minutes ago",
    syncCount: 1247,
  },
  {
    id: "2",
    name: "Slack",
    description: "Get notifications and create tasks from Slack messages",
    category: "communication",
    status: "connected",
    icon: "💬",
    features: ["Message notifications", "Task creation", "Status updates", "Bot commands"],
    lastSync: "5 minutes ago",
    syncCount: 892,
  },
  {
    id: "3",
    name: "Google Calendar",
    description: "Sync events, meetings, and time blocks",
    category: "productivity",
    status: "connected",
    icon: "📅",
    features: ["Calendar sync", "Event creation", "Meeting notifications", "Time blocking"],
    lastSync: "1 hour ago",
    syncCount: 456,
  },
  {
    id: "4",
    name: "Jira",
    description: "Import tickets and track progress across platforms",
    category: "development",
    status: "available",
    icon: "🎯",
    features: ["Ticket import", "Status sync", "Sprint planning", "Epic tracking"],
  },
  {
    id: "5",
    name: "Notion",
    description: "Sync databases and pages with your productivity workflow",
    category: "productivity",
    status: "available",
    icon: "📝",
    features: ["Database sync", "Page import", "Template sharing", "Content backup"],
  },
  {
    id: "6",
    name: "Zapier",
    description: "Connect with 5000+ apps through automation workflows",
    category: "productivity",
    status: "error",
    icon: "⚡",
    features: ["Workflow automation", "Custom triggers", "Multi-app sync", "Data transformation"],
    lastSync: "Failed",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "productivity":
      return "bg-blue-100 text-blue-800";
    case "development":
      return "bg-green-100 text-green-800";
    case "communication":
      return "bg-purple-100 text-purple-800";
    case "analytics":
      return "bg-orange-100 text-orange-800";
    case "storage":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "connected":
      return "bg-green-100 text-green-800";
    case "available":
      return "bg-gray-100 text-gray-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
      return CheckCircle;
    case "error":
      return AlertCircle;
    default:
      return Link;
  }
};

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("integrations");

  const connectedIntegrations = integrations.filter((i) => i.status === "connected");
  const availableIntegrations = integrations.filter((i) => i.status === "available");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations & Connections</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and streamline your workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Connected Apps
              </p>
              <p className="text-2xl font-bold">{connectedIntegrations.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available Apps
              </p>
              <p className="text-2xl font-bold">{availableIntegrations.length}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Syncs
              </p>
              <p className="text-2xl font-bold">
                {connectedIntegrations.reduce((sum, i) => sum + (i.syncCount || 0), 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-2xl font-bold">98.5%</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">All Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="api">API & Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status);
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{integration.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{integration.name}</h3>
                            <Badge className={getCategoryColor(integration.category)}>
                              {integration.category}
                            </Badge>
                            <Badge className={getStatusColor(integration.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {integration.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">
                            {integration.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {integration.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          {integration.lastSync && (
                            <div className="text-sm text-muted-foreground">
                              Last sync: {integration.lastSync} • {integration.syncCount} total syncs
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {integration.status === "connected" && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={integration.status === "connected" ? "secondary" : "default"}
                        >
                          {integration.status === "connected" ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connected
                            </>
                          ) : integration.status === "error" ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reconnect
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <div className="grid gap-4">
            {connectedIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <p className="text-muted-foreground">{integration.description}</p>
                        <div className="text-sm text-muted-foreground mt-1">
                          Last sync: {integration.lastSync} • {integration.syncCount} total syncs
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Marketplace</CardTitle>
              <CardDescription>
                Discover new integrations to enhance your productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Browse our marketplace of integrations and connect with your favorite tools
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Explore Marketplace
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhooks</CardTitle>
              <CardDescription>
                Manage API keys, webhooks, and custom integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">API Management</h3>
                  <p className="text-muted-foreground">
                    Configure API keys, manage webhooks, and build custom integrations
                  </p>
                  <Button className="mt-4">
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
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