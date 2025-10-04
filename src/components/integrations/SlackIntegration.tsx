import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  MessageSquare,
  Hash,
  Users,
  Bell,
  Settings,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Zap,
  Target,
  Clock
} from "lucide-react";

interface SlackIntegrationProps {
  onConnect?: () => void;
  isConnected?: boolean;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  member_count: number;
}

interface SlackNotificationConfig {
  task_completed: boolean;
  task_overdue: boolean;
  goal_achieved: boolean;
  habit_milestone: boolean;
  daily_summary: boolean;
  team_updates: boolean;
}

export function SlackIntegration({ onConnect, isConnected = false }: SlackIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, string>>({});
  const [notificationConfig, setNotificationConfig] = useState<SlackNotificationConfig>({
    task_completed: true,
    task_overdue: true,
    goal_achieved: true,
    habit_milestone: false,
    daily_summary: true,
    team_updates: false
  });
  const [customMessage, setCustomMessage] = useState("");

  // Mock Slack channels
  const mockChannels: SlackChannel[] = [
    { id: "C1234567", name: "general", is_private: false, member_count: 42 },
    { id: "C2345678", name: "productivity", is_private: false, member_count: 15 },
    { id: "C3456789", name: "goals", is_private: false, member_count: 8 },
    { id: "C4567890", name: "team-updates", is_private: false, member_count: 25 },
    { id: "C5678901", name: "notifications", is_private: false, member_count: 12 }
  ];

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsConnecting(false);
    setSetupDialogOpen(true);
    onConnect?.();
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    // Save configuration logic would go here
  };

  const handleNotificationToggle = (key: keyof SlackNotificationConfig) => {
    setNotificationConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getChannelDisplay = (channelId: string) => {
    const channel = mockChannels.find(c => c.id === channelId);
    return channel ? `#${channel.name}` : 'Select channel';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Slack Integration</CardTitle>
              <CardDescription>
                Connect your Slack workspace to receive productivity notifications and updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Features List */}
            <div>
              <h4 className="font-medium mb-3">What you'll get:</h4>
              <div className="space-y-2">
                {[
                  { icon: Bell, text: "Real-time task and goal notifications" },
                  { icon: Target, text: "Goal achievement celebrations" },
                  { icon: Clock, text: "Daily productivity summaries" },
                  { icon: Users, text: "Team collaboration updates" },
                  { icon: Zap, text: "Custom automation triggers" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Secure Integration</span>
              </div>
              <p className="text-sm text-blue-700">
                We only request the minimum permissions needed and never store your Slack credentials.
              </p>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting to Slack...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Connect Slack Workspace
                </>
              )}
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View Slack App Details
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>

        {/* Setup Dialog */}
        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Configure Slack Integration
              </DialogTitle>
              <DialogDescription>
                Set up notification preferences and channel mappings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Workspace Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Connected Successfully</span>
                </div>
                <p className="text-sm text-green-700">
                  Connected to <strong>My Company Workspace</strong> as <strong>john@company.com</strong>
                </p>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="font-medium mb-3">Notification Types</h4>
                <div className="space-y-3">
                  {Object.entries(notificationConfig).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {getNotificationDescription(key as keyof SlackNotificationConfig)}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleNotificationToggle(key as keyof SlackNotificationConfig)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Mappings */}
              <div>
                <h4 className="font-medium mb-3">Channel Mappings</h4>
                <div className="space-y-3">
                  {[
                    { key: 'task_notifications', label: 'Task Notifications', description: 'Where to send task updates' },
                    { key: 'goal_updates', label: 'Goal Updates', description: 'Where to send goal achievements' },
                    { key: 'daily_summaries', label: 'Daily Summaries', description: 'Where to send daily reports' }
                  ].map((mapping) => (
                    <div key={mapping.key} className="space-y-2">
                      <Label>{mapping.label}</Label>
                      <Select value={selectedChannels[mapping.key]} onValueChange={(value) =>
                        setSelectedChannels(prev => ({ ...prev, [mapping.key]: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockChannels.map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                {channel.name}
                                <Badge variant="secondary" className="text-xs">
                                  {channel.member_count} members
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{mapping.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Message Template */}
              <div>
                <Label htmlFor="custom-message">Custom Message Template (Optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="🎯 Task completed: {task_title} by {user_name}"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like {'{task_title}'}, {'{user_name}'}, {'{goal_name}'} to customize messages
                </p>
              </div>

              {/* Test Integration */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Test Integration</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Send a test message to verify your configuration is working correctly.
                </p>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Send Test Message
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetupComplete}>
                Complete Setup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Connected state - show management interface
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Slack Integration
                <Badge variant="secondary" className="text-green-600">Connected</Badge>
              </CardTitle>
              <CardDescription>My Company Workspace • john@company.com</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Active Notifications */}
          <div>
            <h5 className="font-medium text-sm mb-2">Active Notifications</h5>
            <div className="flex flex-wrap gap-2">
              {Object.entries(notificationConfig)
                .filter(([_, enabled]) => enabled)
                .map(([key, _]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Channel Mappings */}
          <div>
            <h5 className="font-medium text-sm mb-2">Channel Mappings</h5>
            <div className="space-y-2">
              {Object.entries(selectedChannels).map(([type, channelId]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className="font-medium">{getChannelDisplay(channelId)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
              <p className="font-semibold">247</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Message</p>
              <p className="font-semibold">2 hours ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getNotificationDescription(type: keyof SlackNotificationConfig): string {
  const descriptions = {
    task_completed: "Notify when tasks are marked as complete",
    task_overdue: "Alert when tasks become overdue",
    goal_achieved: "Celebrate when goals are achieved",
    habit_milestone: "Share habit milestones and streaks",
    daily_summary: "Send daily productivity summaries",
    team_updates: "Share updates with team members"
  };

  return descriptions[type];
}