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
  Users,
  Bell,
  Settings,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Zap,
  Target,
  Clock,
  Video,
  Calendar,
  FileText
} from "lucide-react";

interface TeamsIntegrationProps {
  onConnect?: () => void;
  isConnected?: boolean;
}

interface TeamsChannel {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'private' | 'shared';
  member_count: number;
  team_name: string;
}

interface TeamsNotificationConfig {
  task_completed: boolean;
  task_overdue: boolean;
  goal_achieved: boolean;
  meeting_reminders: boolean;
  daily_summary: boolean;
  team_updates: boolean;
  file_shares: boolean;
  calendar_sync: boolean;
}

export function TeamsIntegration({ onConnect, isConnected = false }: TeamsIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, string>>({});
  const [notificationConfig, setNotificationConfig] = useState<TeamsNotificationConfig>({
    task_completed: true,
    task_overdue: true,
    goal_achieved: true,
    meeting_reminders: true,
    daily_summary: true,
    team_updates: false,
    file_shares: false,
    calendar_sync: true
  });
  const [customMessage, setCustomMessage] = useState("");

  // Mock Teams channels
  const mockChannels: TeamsChannel[] = [
    { id: "T1234567", name: "General", description: "Company-wide announcements", type: "standard", member_count: 85, team_name: "Company" },
    { id: "T2345678", name: "Productivity Hub", description: "Productivity tools and tips", type: "standard", member_count: 24, team_name: "Operations" },
    { id: "T3456789", name: "Project Alpha", description: "Alpha project coordination", type: "private", member_count: 12, team_name: "Development" },
    { id: "T4567890", name: "Leadership", description: "Leadership team discussions", type: "private", member_count: 8, team_name: "Management" },
    { id: "T5678901", name: "Notifications", description: "Automated notifications channel", type: "standard", member_count: 45, team_name: "Operations" }
  ];

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate Microsoft OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsConnecting(false);
    setSetupDialogOpen(true);
    onConnect?.();
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    // Save configuration logic would go here
  };

  const handleNotificationToggle = (key: keyof TeamsNotificationConfig) => {
    setNotificationConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getChannelDisplay = (channelId: string) => {
    const channel = mockChannels.find(c => c.id === channelId);
    return channel ? `${channel.team_name} > ${channel.name}` : 'Select channel';
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return '🔒';
      case 'shared':
        return '🌐';
      default:
        return '#';
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Microsoft Teams Integration</CardTitle>
              <CardDescription>
                Connect your Microsoft Teams workspace for seamless collaboration and productivity tracking
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
                  { icon: Bell, text: "Real-time notifications in Teams channels" },
                  { icon: Calendar, text: "Calendar sync and meeting reminders" },
                  { icon: Target, text: "Goal tracking and achievement celebrations" },
                  { icon: Video, text: "Meeting integration and productivity insights" },
                  { icon: FileText, text: "Document sharing and collaboration" },
                  { icon: Clock, text: "Daily productivity summaries" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Microsoft 365 Integration */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Full Microsoft 365 Integration</span>
              </div>
              <p className="text-sm text-blue-700">
                Seamlessly integrates with Outlook, OneDrive, SharePoint, and other Microsoft 365 services.
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Enterprise Security</span>
              </div>
              <p className="text-sm text-green-700">
                Built with Microsoft's enterprise security standards. All data is encrypted and complies with your organization's policies.
              </p>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting to Microsoft Teams...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Connect Microsoft Teams
                </>
              )}
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View Microsoft Teams App Details
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>

        {/* Setup Dialog */}
        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Configure Microsoft Teams Integration
              </DialogTitle>
              <DialogDescription>
                Set up notification preferences, channel mappings, and Microsoft 365 sync options
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
                  Connected to <strong>Contoso Corporation</strong> as <strong>john.doe@contoso.com</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Access to 5 teams • 12 channels • Calendar sync enabled
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
                          {getTeamsNotificationDescription(key as keyof TeamsNotificationConfig)}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleNotificationToggle(key as keyof TeamsNotificationConfig)}
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
                    { key: 'task_notifications', label: 'Task Notifications', description: 'Where to send task updates and reminders' },
                    { key: 'goal_updates', label: 'Goal Updates', description: 'Where to celebrate goal achievements' },
                    { key: 'meeting_notifications', label: 'Meeting Notifications', description: 'Where to send meeting-related updates' },
                    { key: 'daily_summaries', label: 'Daily Summaries', description: 'Where to send daily productivity reports' }
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
                                <span>{getChannelIcon(channel.type)}</span>
                                <span className="text-xs text-muted-foreground">{channel.team_name}</span>
                                <span>{'>'}</span>
                                <span>{channel.name}</span>
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

              {/* Microsoft 365 Sync Options */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">Microsoft 365 Sync</h4>
                <div className="space-y-2">
                  {[
                    { key: 'calendar_sync', label: 'Outlook Calendar Sync', description: 'Sync meeting productivity insights' },
                    { key: 'onedrive_sync', label: 'OneDrive Integration', description: 'Track document collaboration' },
                    { key: 'sharepoint_sync', label: 'SharePoint Integration', description: 'Monitor team site activity' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-blue-900">{option.label}</Label>
                        <p className="text-xs text-blue-700">{option.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Message Template */}
              <div>
                <Label htmlFor="custom-message">Custom Message Template (Optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="🎯 {user_name} completed task: {task_title} in Microsoft Teams"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like {'{task_title}'}, {'{user_name}'}, {'{meeting_title}'} to customize messages
                </p>
              </div>

              {/* Test Integration */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Test Integration</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Send a test message to verify your Teams configuration is working correctly.
                </p>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Send Test Message to Teams
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetupComplete} className="bg-blue-600 hover:bg-blue-700">
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Microsoft Teams Integration
                <Badge variant="secondary" className="text-green-600">Connected</Badge>
              </CardTitle>
              <CardDescription>Contoso Corporation • john.doe@contoso.com</CardDescription>
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

          {/* Microsoft 365 Services */}
          <div>
            <h5 className="font-medium text-sm mb-2">Connected Services</h5>
            <div className="flex flex-wrap gap-2">
              {['Teams', 'Outlook', 'OneDrive', 'SharePoint'].map((service) => (
                <Badge key={service} variant="secondary" className="text-xs text-blue-600">
                  {service}
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
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
              <p className="font-semibold">156</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meetings Synced</p>
              <p className="font-semibold">23</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="font-semibold">1 hour ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTeamsNotificationDescription(type: keyof TeamsNotificationConfig): string {
  const descriptions = {
    task_completed: "Notify when tasks are marked as complete",
    task_overdue: "Alert when tasks become overdue",
    goal_achieved: "Celebrate when goals are achieved",
    meeting_reminders: "Send meeting reminders and updates",
    daily_summary: "Send daily productivity summaries",
    team_updates: "Share updates with team members",
    file_shares: "Notify about document sharing",
    calendar_sync: "Sync calendar events and meeting insights"
  };

  return descriptions[type];
}