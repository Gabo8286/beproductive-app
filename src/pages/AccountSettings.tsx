import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  Download,
  Trash2,
  Key,
  Clock,
  Globe,
  Database,
  UserX,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Wifi,
  Monitor,
  RefreshCw,
  Copy,
  QrCode,
  Phone
} from "lucide-react";
import { format } from "date-fns";

interface SecurityDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: Date;
  current: boolean;
  trusted: boolean;
}

interface LoginActivity {
  id: string;
  timestamp: Date;
  location: string;
  device: string;
  success: boolean;
  ipAddress: string;
}

export default function AccountSettings() {
  const { profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("security");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareActivity: false,
    allowSearchIndexing: false,
    showOnlineStatus: true,
    shareUsageData: false,
    personalizedAds: false,
    emailMarketing: false,
    thirdPartySharing: false,
  });

  // Mock data for demonstration
  const [devices] = useState<SecurityDevice[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 120',
      location: 'San Francisco, CA',
      lastActive: new Date(),
      current: true,
      trusted: true,
    },
    {
      id: '2',
      name: 'iPhone 15',
      type: 'mobile',
      browser: 'Safari',
      location: 'San Francisco, CA',
      lastActive: new Date(Date.now() - 3600000), // 1 hour ago
      current: false,
      trusted: true,
    },
    {
      id: '3',
      name: 'Unknown Device',
      type: 'desktop',
      browser: 'Firefox 119',
      location: 'New York, NY',
      lastActive: new Date(Date.now() - 86400000), // 1 day ago
      current: false,
      trusted: false,
    },
  ]);

  const [loginActivity] = useState<LoginActivity[]>([
    {
      id: '1',
      timestamp: new Date(),
      location: 'San Francisco, CA',
      device: 'MacBook Pro - Chrome',
      success: true,
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000),
      location: 'San Francisco, CA',
      device: 'iPhone 15 - Safari',
      success: true,
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 86400000),
      location: 'New York, NY',
      device: 'Unknown - Firefox',
      success: false,
      ipAddress: '203.0.113.1',
    },
  ]);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Here you would call your password update API
    toast.success("Password updated successfully");
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const enableTwoFactor = async () => {
    // Generate mock backup codes
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    setBackupCodes(codes);
    setTwoFactorEnabled(true);
    setShowBackupCodes(true);
    toast.success("Two-factor authentication enabled");
  };

  const disableTwoFactor = async () => {
    setTwoFactorEnabled(false);
    setBackupCodes([]);
    toast.success("Two-factor authentication disabled");
  };

  const revokeDevice = async (deviceId: string) => {
    toast.success("Device access revoked");
  };

  const downloadData = async () => {
    // Mock data export
    const data = {
      profile: profile,
      settings: privacySettings,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beproductive-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Data export downloaded");
  };

  const deleteAccount = async () => {
    // This would be a very serious action requiring additional confirmation
    toast.error("Account deletion requires email confirmation");
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your security, privacy, and account preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password & Authentication
              </CardTitle>
              <CardDescription>Manage your login credentials and security methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change */}
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange}>Update Password</Button>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorEnabled && <Badge variant="secondary">Enabled</Badge>}
                    <Button
                      variant={twoFactorEnabled ? "destructive" : "default"}
                      onClick={twoFactorEnabled ? disableTwoFactor : enableTwoFactor}
                    >
                      {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </div>

                {twoFactorEnabled && (
                  <div className="space-y-4">
                    <Alert>
                      <QrCode className="h-4 w-4" />
                      <AlertTitle>Backup Codes</AlertTitle>
                      <AlertDescription>
                        Save these backup codes in a safe place. Each code can only be used once.
                        <Button
                          variant="link"
                          className="p-0 ml-2"
                          onClick={() => setShowBackupCodes(!showBackupCodes)}
                        >
                          {showBackupCodes ? 'Hide' : 'Show'} codes
                        </Button>
                      </AlertDescription>
                    </Alert>

                    {showBackupCodes && (
                      <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                            <code className="text-sm">{code}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success("Code copied to clipboard");
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Devices
              </CardTitle>
              <CardDescription>Manage devices that have access to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {device.type === 'desktop' ? (
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                      ) : device.type === 'mobile' ? (
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.name}</p>
                          {device.current && <Badge variant="secondary">Current</Badge>}
                          {device.trusted && <Badge variant="outline">Trusted</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {device.browser} • {device.location} • Last active {format(device.lastActive, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {!device.current && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeDevice(device.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Login Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Login Activity
              </CardTitle>
              <CardDescription>Monitor recent access to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {activity.success ? 'Successful login' : 'Failed login attempt'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(activity.timestamp, 'MMM d, yyyy h:mm a')} • {activity.location} • {activity.device}
                        </p>
                      </div>
                    </div>
                    <code className="text-xs text-muted-foreground">{activity.ipAddress}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Preferences
              </CardTitle>
              <CardDescription>Control your privacy and data sharing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                  </div>
                  <Switch
                    checked={privacySettings.profileVisible}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, profileVisible: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareActivity}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, shareActivity: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Search Engine Indexing</Label>
                    <p className="text-sm text-muted-foreground">Allow search engines to index your public profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowSearchIndexing}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, allowSearchIndexing: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized usage data to improve the product</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareUsageData}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, shareUsageData: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Personalized Advertising</Label>
                    <p className="text-sm text-muted-foreground">Receive ads based on your interests</p>
                  </div>
                  <Switch
                    checked={privacySettings.personalizedAds}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, personalizedAds: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                  </div>
                  <Switch
                    checked={privacySettings.emailMarketing}
                    onCheckedChange={(checked) =>
                      setPrivacySettings(prev => ({ ...prev, emailMarketing: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, and manage your personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={downloadData} variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Download My Data
                  <span className="text-xs text-muted-foreground mt-1">
                    Export all your account data
                  </span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Privacy Report
                  <span className="text-xs text-muted-foreground mt-1">
                    See how your data is used
                  </span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Retention</h4>
                <p className="text-sm text-muted-foreground">
                  Choose how long we keep your data after account deletion
                </p>
                <Select defaultValue="90">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days (Recommended)</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Delete immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  These actions cannot be undone. Please be certain before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <UserX className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" onClick={deleteAccount}>
                          Yes, delete my account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sign Out All Devices</h4>
                    <p className="text-sm text-muted-foreground">
                      Sign out from all devices and revoke all active sessions
                    </p>
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sign Out All
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