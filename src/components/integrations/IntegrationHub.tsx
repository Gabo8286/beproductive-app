import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Settings,
  Activity,
  Zap,
  Globe,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Database,
  Webhook,
  Key,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useIntegrations,
  useIntegrationProviders,
  useIntegrationAnalytics,
  useIntegrationTemplates,
  useDeleteIntegration,
  useTestIntegration,
  useSyncIntegration,
  useUpdateIntegration
} from "@/hooks/useIntegrations";
import { Integration, IntegrationProvider, IntegrationType } from "@/types/integrations";
import { SlackIntegration } from "./SlackIntegration";
import { TeamsIntegration } from "./TeamsIntegration";
import { GoogleWorkspaceIntegration } from "./GoogleWorkspaceIntegration";
import { WebhookManager } from "./WebhookManager";
import { RealTimeSyncManager } from "./RealTimeSyncManager";
import { IntegrationMarketplace } from "./IntegrationMarketplace";

const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-gray-600 bg-gray-100",
  error: "text-red-600 bg-red-100",
  pending: "text-yellow-600 bg-yellow-100",
  expired: "text-orange-600 bg-orange-100"
};

const statusIcons = {
  active: CheckCircle,
  inactive: Clock,
  error: AlertTriangle,
  pending: Clock,
  expired: AlertTriangle
};

const categoryIcons = {
  communication: Users,
  productivity: TrendingUp,
  development: Database,
  calendar: Clock,
  storage: Database,
  custom: Settings
};

export function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrationDetailsOpen, setIntegrationDetailsOpen] = useState(false);

  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations();
  const { data: providers = [], isLoading: providersLoading } = useIntegrationProviders();
  const { data: analytics, isLoading: analyticsLoading } = useIntegrationAnalytics();
  const { data: templates = [] } = useIntegrationTemplates();

  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const syncIntegration = useSyncIntegration();
  const updateIntegration = useUpdateIntegration();

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || provider.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleToggleIntegration = async (integration: Integration) => {
    const newStatus = integration.status === 'active' ? 'inactive' : 'active';
    await updateIntegration.mutateAsync({
      id: integration.id,
      updates: { status: newStatus }
    });
  };

  const getStatusIcon = (status: Integration['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const provider = providers.find(p => p.id === integration.provider_id);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[integration.status]}>
                {getStatusIcon(integration.status)}
                {integration.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Success Rate</span>
                  <span>{Math.round((integration.usage_stats.successful_syncs / integration.usage_stats.total_syncs) * 100)}%</span>
                </div>
                <Progress
                  value={(integration.usage_stats.successful_syncs / integration.usage_stats.total_syncs) * 100}
                  className="h-2"
                />
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">API Calls This Month</p>
                <p className="font-semibold">{integration.usage_stats.api_calls_this_month.toLocaleString()}</p>
              </div>
            </div>

            {/* Configuration Summary */}
            <div>
              <h5 className="font-medium text-sm mb-2">Configuration</h5>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {integration.sync_settings.frequency}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {integration.sync_settings.direction}
                </Badge>
                {integration.configuration.enabled_features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {integration.configuration.enabled_features.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.configuration.enabled_features.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Last Sync */}
            {integration.last_sync_at && (
              <div className="text-sm text-muted-foreground">
                Last sync: {new Date(integration.last_sync_at).toLocaleString()}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIntegration(integration);
                  setIntegrationDetailsOpen(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testIntegration.mutate(integration.id)}
                disabled={testIntegration.isPending}
              >
                <Activity className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncIntegration.mutate(integration.id)}
                disabled={syncIntegration.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncIntegration.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleIntegration(integration)}
              >
                {integration.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteIntegration.mutate(integration.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProviderCard = ({ provider }: { provider: IntegrationProvider }) => {
    const CategoryIcon = categoryIcons[provider.category];
    const isConnected = integrations.some(i => i.provider_id === provider.id);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <CategoryIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {provider.name}
                  {isConnected && (
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {provider.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Features */}
            <div>
              <h5 className="font-medium text-sm mb-2">Features</h5>
              <div className="flex flex-wrap gap-1">
                {provider.supported_features.slice(0, 3).map((feature) => (
                  <Badge key={feature.id} variant="outline" className="text-xs">
                    {feature.name}
                  </Badge>
                ))}
                {provider.supported_features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.supported_features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {provider.real_time_sync ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-gray-400" />
                )}
                Real-time sync
              </div>
              <div className="flex items-center gap-2">
                {provider.webhooks_supported ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-gray-400" />
                )}
                Webhooks
              </div>
              <div className="flex items-center gap-2">
                {provider.bi_directional ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-gray-400" />
                )}
                Bi-directional
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {provider.pricing_tier}
                </Badge>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="text-xs text-muted-foreground">
              Rate limit: {provider.rate_limits.requests_per_minute}/min
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Enterprise Integration Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage enterprise integrations, APIs, and workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Hub Settings
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_integrations}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.active_integrations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.overview.success_rate * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.total_syncs_today} syncs today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Volume</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.data_volume_mb.toFixed(1)}MB</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">My Integrations</TabsTrigger>
          <TabsTrigger value="pre-built">Pre-built</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Integrations Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
                <CardDescription>
                  Currently connected services and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integrationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : integrations.length > 0 ? (
                  <div className="space-y-3">
                    {integrations.slice(0, 3).map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">{integration.provider_id}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusColors[integration.status]}>
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                    {integrations.length > 3 && (
                      <p className="text-sm text-center text-muted-foreground">
                        +{integrations.length - 3} more integrations
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No integrations connected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Templates</CardTitle>
                <CardDescription>
                  Quick setup with pre-configured integration templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 3).map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.provider_id}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ~{template.estimated_setup_time_minutes} min setup
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {integrationsLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : integrations.length > 0 ? (
            <div className="grid gap-6">
              {integrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                  Connect your first integration to start automating workflows and syncing data
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pre-built" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pre-built Enterprise Integrations</h2>
              <p className="text-muted-foreground">
                Connect to popular productivity and collaboration platforms with ready-to-use integrations
              </p>
            </div>

            <div className="grid gap-6">
              <SlackIntegration />
              <TeamsIntegration />
              <GoogleWorkspaceIntegration />
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Need a Custom Integration?</h3>
                    <p className="text-muted-foreground">
                      Contact our enterprise team to build custom integrations for your specific needs
                    </p>
                  </div>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <IntegrationMarketplace />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Tabs defaultValue="webhooks" className="space-y-6">
            <TabsList>
              <TabsTrigger value="webhooks">Webhook Management</TabsTrigger>
              <TabsTrigger value="realtime">Real-Time Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks">
              <WebhookManager />
            </TabsContent>

            <TabsContent value="realtime">
              <RealTimeSyncManager integrations={integrations} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and performance metrics for your integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Deep insights into integration performance, usage patterns, and optimization opportunities
                </p>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Details Dialog */}
      <Dialog open={integrationDetailsOpen} onOpenChange={setIntegrationDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Integration Configuration</DialogTitle>
            <DialogDescription>
              Configure settings and options for your integration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedIntegration.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedIntegration.description}</p>
              </div>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Integration configuration interface would be implemented here
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDetailsOpen(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}