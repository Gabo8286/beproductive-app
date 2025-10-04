import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plug,
  Globe,
  Webhook,
  RefreshCw as Sync,
  Store,
  Settings,
  Plus,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { IntegrationHub } from "@/components/integrations/IntegrationHub";
import { SlackIntegration } from "@/components/integrations/SlackIntegration";
import { TeamsIntegration } from "@/components/integrations/TeamsIntegration";
import { GoogleWorkspaceIntegration } from "@/components/integrations/GoogleWorkspaceIntegration";
import { WebhookManager } from "@/components/integrations/WebhookManager";
import { RealTimeSyncManager } from "@/components/integrations/RealTimeSyncManager";
import { IntegrationMarketplace } from "@/components/integrations/IntegrationMarketplace";

interface IntegrationModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  component: React.ComponentType<any>;
  features: string[];
  connectionCount?: number;
  status: 'active' | 'available' | 'coming_soon';
}

const integrationModules: IntegrationModule[] = [
  {
    id: 'hub',
    name: 'Integration Hub',
    description: 'Central management for all your integrations and connections',
    icon: Plug,
    color: 'blue',
    component: IntegrationHub,
    features: ['Connection management', 'Status monitoring', 'Configuration', 'Analytics'],
    connectionCount: 12,
    status: 'active'
  },
  {
    id: 'slack',
    name: 'Slack Integration',
    description: 'Connect with Slack for team communication and notifications',
    icon: () => <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">#</div>,
    color: 'purple',
    component: SlackIntegration,
    features: ['Channel sync', 'Notifications', 'Bot commands', 'File sharing'],
    connectionCount: 3,
    status: 'active'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Microsoft Teams and Office 365 suite',
    icon: () => <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">T</div>,
    color: 'blue',
    component: TeamsIntegration,
    features: ['Teams sync', 'Calendar integration', 'Meeting insights', 'Office 365'],
    connectionCount: 2,
    status: 'active'
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect with Gmail, Calendar, Drive, and Google apps',
    icon: () => <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">G</div>,
    color: 'red',
    component: GoogleWorkspaceIntegration,
    features: ['Gmail sync', 'Calendar events', 'Drive integration', 'Docs collaboration'],
    connectionCount: 4,
    status: 'active'
  },
  {
    id: 'webhooks',
    name: 'Webhook Manager',
    description: 'Configure and manage webhooks for real-time data sync',
    icon: Webhook,
    color: 'green',
    component: WebhookManager,
    features: ['Event subscriptions', 'Security headers', 'Testing tools', 'Monitoring'],
    connectionCount: 8,
    status: 'active'
  },
  {
    id: 'sync',
    name: 'Real-Time Sync',
    description: 'Real-time data synchronization across all platforms',
    icon: Sync,
    color: 'orange',
    component: RealTimeSyncManager,
    features: ['Live sync', 'Conflict resolution', 'Retry logic', 'Performance monitoring'],
    connectionCount: 15,
    status: 'active'
  },
  {
    id: 'marketplace',
    name: 'Integration Marketplace',
    description: 'Discover and install new integrations from our marketplace',
    icon: Store,
    color: 'indigo',
    component: IntegrationMarketplace,
    features: ['App discovery', 'One-click install', 'Reviews', 'Certification'],
    status: 'available'
  }
];

export default function Integrations() {
  const [activeModule, setActiveModule] = useState<string>('hub');
  const [searchTerm, setSearchTerm] = useState('');

  const currentModule = integrationModules.find(module => module.id === activeModule);
  const ActiveComponent = currentModule?.component || IntegrationHub;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'coming_soon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalConnections = () => {
    return integrationModules.reduce((total, module) => total + (module.connectionCount || 0), 0);
  };

  const getActiveIntegrations = () => {
    return integrationModules.filter(module => module.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Integrations & Connections
          </h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate workflows with our comprehensive integration platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Browse All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
              <p className="text-2xl font-bold">{getTotalConnections()}</p>
            </div>
            <Plug className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
              <p className="text-2xl font-bold">{getActiveIntegrations()}</p>
            </div>
            <Settings className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sync Events/Day</p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
            <Sync className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Webhook Deliveries</p>
              <p className="text-2xl font-bold">1,294</p>
            </div>
            <Webhook className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
      </div>

      {/* Integration Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationModules.map((module) => (
          <Card
            key={module.id}
            className={`cursor-pointer transition-all duration-200 ${
              activeModule === module.id
                ? `ring-2 ring-${module.color}-500 bg-${module.color}-50`
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveModule(module.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${module.color}-100 rounded-lg`}>
                    <module.icon className={`h-5 w-5 text-${module.color}-600`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(module.status)}>
                  {module.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.connectionCount !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-semibold">{module.connectionCount}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {module.status === 'active' && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Configure
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Module Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentModule && (
                <>
                  <div className={`p-2 bg-${currentModule.color}-100 rounded-lg`}>
                    <currentModule.icon className={`h-5 w-5 text-${currentModule.color}-600`} />
                  </div>
                  <div>
                    <CardTitle>{currentModule.name}</CardTitle>
                    <CardDescription>{currentModule.description}</CardDescription>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Active Module</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActiveComponent />
        </CardContent>
      </Card>
    </div>
  );
}