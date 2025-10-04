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
  Mail,
  Calendar,
  HardDrive as Drive,
  Bell,
  Settings,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Zap,
  Target,
  Clock,
  FileText,
  Users,
  Video,
  BarChart3
} from "lucide-react";

interface GoogleWorkspaceIntegrationProps {
  onConnect?: () => void;
  isConnected?: boolean;
}

interface GoogleService {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  permissions: string[];
}

interface GoogleNotificationConfig {
  email_notifications: boolean;
  calendar_reminders: boolean;
  drive_sharing: boolean;
  task_sync: boolean;
  goal_tracking: boolean;
  document_collaboration: boolean;
  meeting_insights: boolean;
  productivity_reports: boolean;
}

export function GoogleWorkspaceIntegration({ onConnect, isConnected = false }: GoogleWorkspaceIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [notificationConfig, setNotificationConfig] = useState<GoogleNotificationConfig>({
    email_notifications: true,
    calendar_reminders: true,
    drive_sharing: false,
    task_sync: true,
    goal_tracking: true,
    document_collaboration: false,
    meeting_insights: true,
    productivity_reports: true
  });
  const [customMessage, setCustomMessage] = useState("");

  // Google Workspace services
  const googleServices: GoogleService[] = [
    {
      id: "gmail",
      name: "Gmail",
      description: "Email integration and notifications",
      icon: Mail,
      enabled: true,
      permissions: ["read", "compose", "send"]
    },
    {
      id: "calendar",
      name: "Google Calendar",
      description: "Calendar sync and meeting insights",
      icon: Calendar,
      enabled: true,
      permissions: ["read", "write", "events"]
    },
    {
      id: "drive",
      name: "Google Drive",
      description: "Document collaboration tracking",
      icon: Drive,
      enabled: true,
      permissions: ["read", "metadata"]
    },
    {
      id: "docs",
      name: "Google Docs",
      description: "Document productivity insights",
      icon: FileText,
      enabled: false,
      permissions: ["read", "comments"]
    },
    {
      id: "sheets",
      name: "Google Sheets",
      description: "Spreadsheet collaboration tracking",
      icon: BarChart3,
      enabled: false,
      permissions: ["read", "write"]
    },
    {
      id: "meet",
      name: "Google Meet",
      description: "Video meeting analytics",
      icon: Video,
      enabled: true,
      permissions: ["read", "metadata"]
    }
  ];

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsConnecting(false);
    setSetupDialogOpen(true);
    onConnect?.();
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    // Save configuration logic would go here
  };

  const handleNotificationToggle = (key: keyof GoogleNotificationConfig) => {
    setNotificationConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">G</div>
            </div>
            <div>
              <CardTitle>Google Workspace Integration</CardTitle>
              <CardDescription>
                Connect your Google Workspace for comprehensive productivity insights and automation
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
                  { icon: Mail, text: "Smart email productivity insights" },
                  { icon: Calendar, text: "Calendar optimization and meeting analytics" },
                  { icon: Drive, text: "Document collaboration tracking" },
                  { icon: Video, text: "Google Meet integration and insights" },
                  { icon: Target, text: "Goal tracking across Google services" },
                  { icon: Clock, text: "Time management optimization" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Services Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">Google Workspace</div>
                <span className="font-medium text-gray-700">Full Suite Integration</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {googleServices.slice(0, 6).map((service) => (
                  <div key={service.id} className="flex items-center gap-2 text-xs">
                    <service.icon className="h-3 w-3 text-gray-600" />
                    <span>{service.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Google-Grade Security</span>
              </div>
              <p className="text-sm text-green-700">
                Built with Google's OAuth 2.0 standards. We only access the minimum required data and never store your credentials.
              </p>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting to Google Workspace...
                </>
              ) : (
                <>
                  <div className="text-sm font-bold mr-2">G</div>
                  Connect Google Workspace
                </>
              )}
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View Google Workspace App Details
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>

        {/* Setup Dialog */}
        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">G</div>
                Configure Google Workspace Integration
              </DialogTitle>
              <DialogDescription>
                Set up service access, notification preferences, and productivity tracking options
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
                  Connected to <strong>example.com</strong> as <strong>john.doe@example.com</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Access to 6 Google services • Premium workspace features enabled
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <h4 className="font-medium mb-3">Google Services</h4>
                <div className="space-y-3">
                  {googleServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <service.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="font-medium">{service.name}</Label>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex gap-1 mt-1">
                            {service.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={selectedServices[service.id] ?? service.enabled}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="font-medium mb-3">Notification & Tracking Settings</h4>
                <div className="space-y-3">
                  {Object.entries(notificationConfig).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {getGoogleNotificationDescription(key as keyof GoogleNotificationConfig)}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleNotificationToggle(key as keyof GoogleNotificationConfig)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sync Options */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">Data Sync Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-900">Real-time Sync</Label>
                      <p className="text-xs text-blue-700">Sync data as it changes in Google services</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-900">Historical Data Import</Label>
                      <p className="text-xs text-blue-700">Import the last 30 days of productivity data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-900">Smart Insights</Label>
                      <p className="text-xs text-blue-700">Enable AI-powered productivity insights</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Privacy & Data Handling</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email content is never stored, only metadata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Document content analysis is opt-in only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>All data is encrypted and GDPR compliant</span>
                  </div>
                </div>
              </div>

              {/* Test Integration */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Test Integration</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Verify your Google Workspace connection and data access permissions.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Gmail
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Test Calendar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Drive className="h-4 w-4 mr-2" />
                    Test Drive
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetupComplete} className="bg-gradient-to-r from-blue-600 to-green-600">
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">G</div>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Google Workspace Integration
                <Badge variant="secondary" className="text-green-600">Connected</Badge>
              </CardTitle>
              <CardDescription>example.com • john.doe@example.com</CardDescription>
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
          {/* Connected Services */}
          <div>
            <h5 className="font-medium text-sm mb-2">Connected Services</h5>
            <div className="flex flex-wrap gap-2">
              {googleServices
                .filter(service => selectedServices[service.id] ?? service.enabled)
                .map((service) => (
                  <Badge key={service.id} variant="secondary" className="text-xs">
                    <service.icon className="h-3 w-3 mr-1" />
                    {service.name}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Active Notifications */}
          <div>
            <h5 className="font-medium text-sm mb-2">Active Tracking</h5>
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

          {/* Productivity Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg">
            <h5 className="font-medium text-sm mb-2">This Week's Insights</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Emails Processed</p>
                <p className="font-semibold">142</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meeting Time</p>
                <p className="font-semibold">8.5 hours</p>
              </div>
              <div>
                <p className="text-muted-foreground">Docs Collaborated</p>
                <p className="font-semibold">12</p>
              </div>
              <div>
                <p className="text-muted-foreground">Productivity Score</p>
                <p className="font-semibold text-green-600">87%</p>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Data Points</p>
              <p className="font-semibold">1,247</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="font-semibold">5 min ago</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Services Active</p>
              <p className="font-semibold">{googleServices.filter(s => selectedServices[s.id] ?? s.enabled).length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getGoogleNotificationDescription(type: keyof GoogleNotificationConfig): string {
  const descriptions = {
    email_notifications: "Track email productivity and send insights",
    calendar_reminders: "Calendar optimization and meeting reminders",
    drive_sharing: "Notify about document sharing and collaboration",
    task_sync: "Sync tasks with Google services",
    goal_tracking: "Track goal progress across Google Workspace",
    document_collaboration: "Monitor document collaboration patterns",
    meeting_insights: "Generate insights from Google Meet sessions",
    productivity_reports: "Send productivity reports based on Google data"
  };

  return descriptions[type];
}