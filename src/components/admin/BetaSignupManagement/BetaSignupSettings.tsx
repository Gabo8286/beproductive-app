import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Mail,
  Clock,
  Globe,
  Shield,
  Save,
  RefreshCw,
  TestTube,
  AlertTriangle,
} from "lucide-react";

interface BetaSignupConfig {
  autoApprovalEnabled: boolean;
  defaultLanguage: 'en' | 'es';
  invitationExpiryDays: number;
  maxPendingSignups: number;
  emailNotificationsEnabled: boolean;
  reminderEmailEnabled: boolean;
  reminderDelayDays: number;
  welcomeEmailEnabled: boolean;
  customEmailFooter: string;
  testModeEnabled: boolean;
}

export const BetaSignupSettings: React.FC = () => {
  const [settings, setSettings] = useState<BetaSignupConfig>({
    autoApprovalEnabled: false,
    defaultLanguage: 'en',
    invitationExpiryDays: 7,
    maxPendingSignups: 100,
    emailNotificationsEnabled: true,
    reminderEmailEnabled: true,
    reminderDelayDays: 3,
    welcomeEmailEnabled: true,
    customEmailFooter: "Best regards,\nGabo Soto\ngabosoto@be-productive.app\nBeProductive Team",
    testModeEnabled: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof BetaSignupConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // TODO: Implement API call to save settings
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      autoApprovalEnabled: false,
      defaultLanguage: 'en',
      invitationExpiryDays: 7,
      maxPendingSignups: 100,
      emailNotificationsEnabled: true,
      reminderEmailEnabled: true,
      reminderDelayDays: 3,
      welcomeEmailEnabled: true,
      customEmailFooter: "Best regards,\nGabo Soto\ngabosoto@be-productive.app\nBeProductive Team",
      testModeEnabled: false,
    });
    setHasChanges(false);
  };

  const handleTestEmail = () => {
    console.log("Sending test email...");
    // TODO: Implement test email functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Beta Signup Settings
              </CardTitle>
              <CardDescription>
                Configure beta signup approval workflow and email settings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Approval Workflow
            </CardTitle>
            <CardDescription>
              Configure how beta signup requests are processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-approval</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new beta signups
                </p>
              </div>
              <Switch
                checked={settings.autoApprovalEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('autoApprovalEnabled', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPending">Maximum Pending Signups</Label>
              <Input
                id="maxPending"
                type="number"
                value={settings.maxPendingSignups}
                onChange={(e) =>
                  handleSettingChange('maxPendingSignups', parseInt(e.target.value))
                }
                placeholder="100"
              />
              <p className="text-sm text-muted-foreground">
                Limit the number of pending signups to manage workload
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDays">Invitation Expiry (Days)</Label>
              <Input
                id="expiryDays"
                type="number"
                value={settings.invitationExpiryDays}
                onChange={(e) =>
                  handleSettingChange('invitationExpiryDays', parseInt(e.target.value))
                }
                placeholder="7"
              />
              <p className="text-sm text-muted-foreground">
                Number of days before invitation tokens expire
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure email templates and delivery settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select
                value={settings.defaultLanguage}
                onValueChange={(value) =>
                  handleSettingChange('defaultLanguage', value as 'en' | 'es')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Default language for invitation emails
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for new signups
                </p>
              </div>
              <Switch
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('emailNotificationsEnabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Welcome Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Send welcome email after account creation
                </p>
              </div>
              <Switch
                checked={settings.welcomeEmailEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('welcomeEmailEnabled', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reminder Settings
            </CardTitle>
            <CardDescription>
              Configure automatic reminder emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Reminder Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Send reminder emails for unused invitations
                </p>
              </div>
              <Switch
                checked={settings.reminderEmailEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('reminderEmailEnabled', checked)
                }
              />
            </div>

            {settings.reminderEmailEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderDelay">Reminder Delay (Days)</Label>
                <Input
                  id="reminderDelay"
                  type="number"
                  value={settings.reminderDelayDays}
                  onChange={(e) =>
                    handleSettingChange('reminderDelayDays', parseInt(e.target.value))
                  }
                  placeholder="3"
                />
                <p className="text-sm text-muted-foreground">
                  Days to wait before sending reminder emails
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Email Footer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Email Personalization
            </CardTitle>
            <CardDescription>
              Customize email footer and signature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailFooter">Custom Email Footer</Label>
              <Textarea
                id="emailFooter"
                value={settings.customEmailFooter}
                onChange={(e) =>
                  handleSettingChange('customEmailFooter', e.target.value)
                }
                placeholder="Add your personal signature..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                This will be added to all beta invitation emails
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <p className="text-sm text-muted-foreground">
                Send a test invitation to your own email
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Settings */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Development Settings
          </CardTitle>
          <CardDescription>
            Settings for testing and development (use with caution)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable test mode to prevent real emails from being sent
              </p>
            </div>
            <Switch
              checked={settings.testModeEnabled}
              onCheckedChange={(checked) =>
                handleSettingChange('testModeEnabled', checked)
              }
            />
          </div>

          {settings.testModeEnabled && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Test Mode Active</span>
              </div>
              <p className="text-sm text-orange-700">
                Emails will be logged but not actually sent. Perfect for testing the approval workflow.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Warning */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">Unsaved Changes</p>
                <p className="text-blue-700 text-sm">
                  You have unsaved configuration changes. Don't forget to save them.
                </p>
              </div>
              <Button size="sm" onClick={handleSave} className="ml-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};