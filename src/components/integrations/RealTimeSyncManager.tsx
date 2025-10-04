import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Activity,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  TrendingUp,
  Database,
  Wifi,
  WifiOff,
  Signal,
  AlertCircle
} from "lucide-react";
import { SyncLog, Integration } from "@/types/integrations";

interface RealTimeSyncManagerProps {
  integrations?: Integration[];
}

interface SyncStatus {
  integration_id: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  last_sync: string;
  next_sync?: string;
  sync_health: number;
  real_time_enabled: boolean;
  events_processed_today: number;
  avg_latency_ms: number;
}

const mockSyncStatuses: SyncStatus[] = [
  {
    integration_id: "int_slack",
    status: "connected",
    last_sync: "2024-10-02T11:30:45Z",
    sync_health: 98,
    real_time_enabled: true,
    events_processed_today: 247,
    avg_latency_ms: 150
  },
  {
    integration_id: "int_teams",
    status: "syncing",
    last_sync: "2024-10-02T11:29:12Z",
    sync_health: 95,
    real_time_enabled: true,
    events_processed_today: 189,
    avg_latency_ms: 230
  },
  {
    integration_id: "int_google",
    status: "error",
    last_sync: "2024-10-02T10:15:30Z",
    sync_health: 75,
    real_time_enabled: false,
    events_processed_today: 12,
    avg_latency_ms: 850
  }
];

const mockSyncLogs: SyncLog[] = [
  {
    id: "log_1",
    integration_id: "int_slack",
    sync_type: "real_time",
    direction: "inbound",
    status: "success",
    started_at: "2024-10-02T11:30:45Z",
    completed_at: "2024-10-02T11:30:46Z",
    duration_ms: 1200,
    records_processed: 15,
    records_successful: 15,
    records_failed: 0,
    metadata: { event_type: "message.sent", channel: "general" }
  },
  {
    id: "log_2",
    integration_id: "int_teams",
    sync_type: "real_time",
    direction: "inbound",
    status: "success",
    started_at: "2024-10-02T11:29:12Z",
    completed_at: "2024-10-02T11:29:14Z",
    duration_ms: 1800,
    records_processed: 8,
    records_successful: 8,
    records_failed: 0,
    metadata: { event_type: "meeting.ended", participants: 5 }
  },
  {
    id: "log_3",
    integration_id: "int_google",
    sync_type: "scheduled",
    direction: "inbound",
    status: "failed",
    started_at: "2024-10-02T10:15:30Z",
    completed_at: "2024-10-02T10:15:45Z",
    duration_ms: 15000,
    records_processed: 0,
    records_successful: 0,
    records_failed: 0,
    error_message: "Rate limit exceeded. Retry after 300 seconds.",
    metadata: { rate_limit_remaining: 0, reset_time: "2024-10-02T10:20:30Z" }
  }
];

const statusColors = {
  connected: "text-green-600 bg-green-100",
  disconnected: "text-gray-600 bg-gray-100",
  syncing: "text-blue-600 bg-blue-100",
  error: "text-red-600 bg-red-100"
};

const statusIcons = {
  connected: CheckCircle,
  disconnected: WifiOff,
  syncing: RefreshCw,
  error: AlertTriangle
};

export function RealTimeSyncManager({ integrations }: RealTimeSyncManagerProps) {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>(mockSyncStatuses);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(mockSyncLogs);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSyncStatuses(prev => prev.map(status => ({
        ...status,
        events_processed_today: status.events_processed_today + Math.floor(Math.random() * 3),
        avg_latency_ms: status.avg_latency_ms + (Math.random() - 0.5) * 20
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getIntegrationName = (integrationId: string) => {
    const names: Record<string, string> = {
      "int_slack": "Slack",
      "int_teams": "Microsoft Teams",
      "int_google": "Google Workspace"
    };
    return names[integrationId] || integrationId;
  };

  const getStatusIcon = (status: SyncStatus['status']) => {
    const Icon = statusIcons[status];
    return <Icon className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />;
  };

  const handleToggleRealTime = (integrationId: string) => {
    setSyncStatuses(prev => prev.map(status =>
      status.integration_id === integrationId
        ? { ...status, real_time_enabled: !status.real_time_enabled }
        : status
    ));
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return "text-green-600";
    if (health >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredStatuses = selectedIntegration === "all"
    ? syncStatuses
    : syncStatuses.filter(s => s.integration_id === selectedIntegration);

  const filteredLogs = selectedIntegration === "all"
    ? syncLogs
    : syncLogs.filter(l => l.integration_id === selectedIntegration);

  const totalEventsToday = syncStatuses.reduce((sum, status) => sum + status.events_processed_today, 0);
  const avgLatency = Math.round(syncStatuses.reduce((sum, status) => sum + status.avg_latency_ms, 0) / syncStatuses.length);
  const connectedCount = syncStatuses.filter(s => s.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-600" />
            Real-Time Sync Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage real-time data synchronization across integrations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Integrations</SelectItem>
              {syncStatuses.map((status) => (
                <SelectItem key={status.integration_id} value={status.integration_id}>
                  {getIntegrationName(status.integration_id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">
              of {syncStatuses.length} integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEventsToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Real-time events processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {filteredStatuses.map((status) => (
            <Card key={status.integration_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getIntegrationName(status.integration_id)}
                        <Badge variant="outline" className={statusColors[status.status]}>
                          {getStatusIcon(status.status)}
                          {status.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Last sync: {new Date(status.last_sync).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-sm">Real-time</Label>
                      <Switch
                        checked={status.real_time_enabled}
                        onCheckedChange={() => handleToggleRealTime(status.integration_id)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Health Status */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Sync Health</span>
                      <span className={getHealthColor(status.sync_health)}>{status.sync_health}%</span>
                    </div>
                    <Progress value={status.sync_health} className="h-2" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-muted-foreground">Events Today</span>
                      </div>
                      <p className="font-semibold">{status.events_processed_today}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs text-muted-foreground">Avg Latency</span>
                      </div>
                      <p className="font-semibold">{Math.round(status.avg_latency_ms)}ms</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Wifi className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-muted-foreground">Real-time</span>
                      </div>
                      <p className="font-semibold">
                        {status.real_time_enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Force Sync
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    {status.status === 'connected' ? (
                      <Button variant="outline" size="sm">
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                  </div>

                  {/* Error Details */}
                  {status.status === 'error' && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">Sync Error</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Connection issues detected. Real-time sync temporarily disabled.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{getIntegrationName(log.integration_id)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {log.sync_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {log.direction}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.started_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.duration_ms}ms
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span>Records: {log.records_processed}</span>
                    <span className="text-green-600">Success: {log.records_successful}</span>
                    {log.records_failed > 0 && (
                      <span className="text-red-600">Failed: {log.records_failed}</span>
                    )}
                  </div>

                  {log.error_message && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      {log.error_message}
                    </div>
                  )}

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Sync Settings</CardTitle>
              <CardDescription>
                Configure global settings for real-time synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Enable Real-Time Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow integrations to sync data in real-time using webhooks
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto-Retry Failed Syncs</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically retry failed synchronization attempts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">High Frequency Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable for high-volume integrations (may increase costs)
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}