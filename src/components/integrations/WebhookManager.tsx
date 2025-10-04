import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Webhook,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Key,
  RefreshCw,
  Zap,
  Globe,
  Shield
} from "lucide-react";
import { WebhookEndpoint } from "@/types/integrations";

interface WebhookManagerProps {
  integrationId?: string;
}

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_1",
    integration_id: "int_slack",
    url: "https://api.myapp.com/webhooks/slack",
    secret: "whsec_8b5c7d9e8f2a1b3c4d5e6f7g8h9i0j1k",
    events: ["task.completed", "goal.achieved", "user.updated"],
    status: "active",
    last_triggered_at: "2024-10-02T10:30:00Z",
    success_count: 1247,
    failure_count: 23,
    created_at: "2024-09-15T09:00:00Z",
    updated_at: "2024-10-02T10:30:00Z"
  },
  {
    id: "wh_2",
    integration_id: "int_teams",
    url: "https://api.myapp.com/webhooks/teams",
    secret: "whsec_2c4d6e8f0a1b3c5d7e9f1g3h5i7j9k1m",
    events: ["meeting.started", "meeting.ended", "document.shared"],
    status: "active",
    last_triggered_at: "2024-10-02T09:15:00Z",
    success_count: 892,
    failure_count: 8,
    created_at: "2024-09-20T14:30:00Z",
    updated_at: "2024-10-02T09:15:00Z"
  },
  {
    id: "wh_3",
    integration_id: "int_google",
    url: "https://api.myapp.com/webhooks/google",
    secret: "whsec_4f6g8h0i2j4k6l8m0n2o4p6q8r0s2t4u",
    events: ["calendar.event.created", "drive.file.updated"],
    status: "failed",
    last_triggered_at: "2024-10-01T16:45:00Z",
    success_count: 567,
    failure_count: 45,
    created_at: "2024-09-25T11:15:00Z",
    updated_at: "2024-10-01T16:45:00Z"
  }
];

const statusColors = {
  active: "text-green-600 bg-green-100",
  inactive: "text-gray-600 bg-gray-100",
  failed: "text-red-600 bg-red-100"
};

const statusIcons = {
  active: CheckCircle,
  inactive: Clock,
  failed: AlertTriangle
};

export function WebhookManager({ integrationId }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    events: [] as string[],
    description: ""
  });

  const availableEvents = [
    "task.created",
    "task.updated",
    "task.completed",
    "task.deleted",
    "goal.created",
    "goal.achieved",
    "goal.updated",
    "user.updated",
    "integration.connected",
    "integration.disconnected",
    "sync.completed",
    "sync.failed",
    "meeting.started",
    "meeting.ended",
    "document.shared",
    "calendar.event.created",
    "calendar.event.updated",
    "drive.file.updated"
  ];

  const filteredWebhooks = integrationId
    ? webhooks.filter(w => w.integration_id === integrationId)
    : webhooks;

  const handleCreateWebhook = () => {
    const webhook: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      integration_id: integrationId || "general",
      url: newWebhook.url,
      secret: `whsec_${Math.random().toString(36).substring(2, 34)}`,
      events: newWebhook.events,
      status: "active",
      success_count: 0,
      failure_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ url: "", events: [], description: "" });
    setCreateDialogOpen(false);
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskSecret = (secret: string) => {
    return secret.slice(0, 8) + "..." + secret.slice(-4);
  };

  const getStatusIcon = (status: WebhookEndpoint['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const getSuccessRate = (webhook: WebhookEndpoint) => {
    const total = webhook.success_count + webhook.failure_count;
    return total > 0 ? Math.round((webhook.success_count / total) * 100) : 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6 text-blue-600" />
            Webhook Management
          </h2>
          <p className="text-muted-foreground">
            Configure real-time webhooks for instant data synchronization
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Webhook Security Info */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Webhook Security</h3>
              <p className="text-sm text-blue-700">
                All webhooks are secured with HMAC-SHA256 signatures. Verify the signature using your webhook secret.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      {filteredWebhooks.length > 0 ? (
        <div className="space-y-4">
          {filteredWebhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Webhook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {webhook.url.split('/').pop()}
                        <Badge variant="outline" className={statusColors[webhook.status]}>
                          {getStatusIcon(webhook.status)}
                          {webhook.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {webhook.url}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                          className="h-auto p-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingWebhook(webhook)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleWebhook(webhook.id)}>
                        {webhook.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteWebhook(webhook.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Webhook Secret */}
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      Webhook Secret
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                        {showSecrets[webhook.id] ? webhook.secret : maskSecret(webhook.secret)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSecretVisibility(webhook.id)}
                      >
                        {showSecrets[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <Label className="text-sm font-medium mb-2">Subscribed Events</Label>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="font-semibold text-green-600">{getSuccessRate(webhook)}%</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-muted-foreground">Successful</span>
                      </div>
                      <p className="font-semibold">{webhook.success_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-muted-foreground">Failed</span>
                      </div>
                      <p className="font-semibold text-red-600">{webhook.failure_count}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-muted-foreground">Last Triggered</span>
                      </div>
                      <p className="font-semibold text-xs">
                        {webhook.last_triggered_at ? new Date(webhook.last_triggered_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Test Webhook */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Test Webhook
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate Secret
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              Set up webhooks to receive real-time notifications when events occur in your integrations
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint to receive real-time events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhooks/endpoint"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The URL where webhook events will be sent via HTTP POST
              </p>
            </div>

            <div>
              <Label>Events to Subscribe</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                {availableEvents.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`event-${event}`}
                      checked={newWebhook.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook(prev => ({
                            ...prev,
                            events: [...prev.events, event]
                          }));
                        } else {
                          setNewWebhook(prev => ({
                            ...prev,
                            events: prev.events.filter(e => e !== event)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`event-${event}`} className="text-sm">
                      {event}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select which events should trigger this webhook
              </p>
            </div>

            <div>
              <Label htmlFor="webhook-description">Description (Optional)</Label>
              <Textarea
                id="webhook-description"
                placeholder="Describe what this webhook is used for..."
                value={newWebhook.description}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={!newWebhook.url || newWebhook.events.length === 0}
            >
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}