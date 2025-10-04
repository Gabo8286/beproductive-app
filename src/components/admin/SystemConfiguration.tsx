import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Database,
  Mail,
  Shield,
  Globe,
  Bell,
  Key,
  Server,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export interface SystemConfig {
  general: {
    appName: string;
    description: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxUsersPerOrg: number;
  };
  security: {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
    allowedDomains: string[];
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableNotifications: boolean;
  };
  storage: {
    provider: string;
    bucketName: string;
    region: string;
    accessKey: string;
    secretKey: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  api: {
    rateLimit: {
      free: number;
      pro: number;
      enterprise: number;
    };
    enableWebhooks: boolean;
    webhookRetries: number;
    apiVersion: string;
  };
  features: {
    enableAnalytics: boolean;
    enableTeamFeatures: boolean;
    enableIntegrations: boolean;
    enableAI: boolean;
    enableMobileApp: boolean;
  };
}

export const SystemConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      appName: 'Spark Bloom Flow',
      description: 'Enterprise productivity and habit tracking platform',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerOrg: 1000
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      twoFactorRequired: false,
      allowedDomains: ['@company.com', '@partner.com']
    },
    email: {
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@sparkbloomflow.com',
      smtpPassword: '••••••••••••',
      fromEmail: 'noreply@sparkbloomflow.com',
      fromName: 'Spark Bloom Flow',
      enableNotifications: true
    },
    storage: {
      provider: 'aws-s3',
      bucketName: 'sparkbloom-storage',
      region: 'us-east-1',
      accessKey: 'AKIA••••••••••••',
      secretKey: '••••••••••••••••••••••••••••••••••••••••',
      maxFileSize: 10,
      allowedFileTypes: ['.jpg', '.png', '.pdf', '.doc', '.docx']
    },
    api: {
      rateLimit: {
        free: 1000,
        pro: 10000,
        enterprise: 100000
      },
      enableWebhooks: true,
      webhookRetries: 3,
      apiVersion: 'v1'
    },
    features: {
      enableAnalytics: true,
      enableTeamFeatures: true,
      enableIntegrations: true,
      enableAI: false,
      enableMobileApp: true
    }
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateNestedConfig = (section: keyof SystemConfig, nestedKey: string, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...(prev[section] as any)[nestedKey],
          [key]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveConfig = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasUnsavedChanges(false);
    setSaving(false);
  };

  const resetConfig = () => {
    // Reset to default values
    setHasUnsavedChanges(false);
  };

  const exportConfig = () => {
    const configExport = { ...config };
    // Mask sensitive data
    configExport.email.smtpPassword = '••••••••••••';
    configExport.storage.accessKey = 'AKIA••••••••••••';
    configExport.storage.secretKey = '••••••••••••••••••••••••••••••••••••••••';

    const blob = new Blob([JSON.stringify(configExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveConfig} disabled={saving || !hasUnsavedChanges}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic application configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={config.general.appName}
                    onChange={(e) => updateConfig('general', 'appName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={config.general.timezone}
                    onValueChange={(value) => updateConfig('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Application Description</Label>
                <Textarea
                  id="description"
                  value={config.general.description}
                  onChange={(e) => updateConfig('general', 'description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={config.general.language}
                    onValueChange={(value) => updateConfig('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users per Organization</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={config.general.maxUsersPerOrg}
                    onChange={(e) => updateConfig('general', 'maxUsersPerOrg', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Temporarily disable access for maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">User Registration</Label>
                    <p className="text-sm text-gray-500">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={config.general.registrationEnabled}
                    onCheckedChange={(checked) => updateConfig('general', 'registrationEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <p className="text-sm text-gray-500">
                      Passwords must contain special characters
                    </p>
                  </div>
                  <Switch
                    id="requireSpecialChars"
                    checked={config.security.requireSpecialChars}
                    onCheckedChange={(checked) => updateConfig('security', 'requireSpecialChars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Mandate 2FA for all user accounts
                    </p>
                  </div>
                  <Switch
                    id="twoFactorRequired"
                    checked={config.security.twoFactorRequired}
                    onCheckedChange={(checked) => updateConfig('security', 'twoFactorRequired', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedDomains">Allowed Email Domains</Label>
                <Textarea
                  id="allowedDomains"
                  value={config.security.allowedDomains.join('\n')}
                  onChange={(e) => updateConfig('security', 'allowedDomains', e.target.value.split('\n').filter(d => d.trim()))}
                  placeholder="@company.com&#10;@partner.com"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  One domain per line. Leave empty to allow all domains.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email delivery and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <Select
                    value={config.email.provider}
                    onValueChange={(value) => updateConfig('email', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={config.email.smtpHost}
                    onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.email.smtpPort}
                    onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={config.email.smtpUser}
                    onChange={(e) => updateConfig('email', 'smtpUser', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <div className="relative">
                  <Input
                    id="smtpPassword"
                    type={showPasswords.smtp ? 'text' : 'password'}
                    value={config.email.smtpPassword}
                    onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1"
                    onClick={() => togglePasswordVisibility('smtp')}
                  >
                    {showPasswords.smtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config.email.fromEmail}
                    onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={config.email.fromName}
                    onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableNotifications">Enable Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send automated email notifications to users
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={config.email.enableNotifications}
                  onCheckedChange={(checked) => updateConfig('email', 'enableNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Configuration
              </CardTitle>
              <CardDescription>
                Configure file storage and upload settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select
                    value={config.storage.provider}
                    onValueChange={(value) => updateConfig('storage', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws-s3">Amazon S3</SelectItem>
                      <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="local">Local Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bucketName">Bucket/Container Name</Label>
                  <Input
                    id="bucketName"
                    value={config.storage.bucketName}
                    onChange={(e) => updateConfig('storage', 'bucketName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={config.storage.region}
                    onChange={(e) => updateConfig('storage', 'region', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.storage.maxFileSize}
                    onChange={(e) => updateConfig('storage', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessKey">Access Key</Label>
                <div className="relative">
                  <Input
                    id="accessKey"
                    type={showPasswords.accessKey ? 'text' : 'password'}
                    value={config.storage.accessKey}
                    onChange={(e) => updateConfig('storage', 'accessKey', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1"
                    onClick={() => togglePasswordVisibility('accessKey')}
                  >
                    {showPasswords.accessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showPasswords.secretKey ? 'text' : 'password'}
                    value={config.storage.secretKey}
                    onChange={(e) => updateConfig('storage', 'secretKey', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1"
                    onClick={() => togglePasswordVisibility('secretKey')}
                  >
                    {showPasswords.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Textarea
                  id="allowedFileTypes"
                  value={config.storage.allowedFileTypes.join(', ')}
                  onChange={(e) => updateConfig('storage', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                  placeholder=".jpg, .png, .pdf, .doc, .docx"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure API rate limits and webhook settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Rate Limits (requests per hour)</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitFree">Free Tier</Label>
                    <Input
                      id="rateLimitFree"
                      type="number"
                      value={config.api.rateLimit.free}
                      onChange={(e) => updateNestedConfig('api', 'rateLimit', 'free', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitPro">Pro Tier</Label>
                    <Input
                      id="rateLimitPro"
                      type="number"
                      value={config.api.rateLimit.pro}
                      onChange={(e) => updateNestedConfig('api', 'rateLimit', 'pro', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitEnterprise">Enterprise</Label>
                    <Input
                      id="rateLimitEnterprise"
                      type="number"
                      value={config.api.rateLimit.enterprise}
                      onChange={(e) => updateNestedConfig('api', 'rateLimit', 'enterprise', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiVersion">API Version</Label>
                  <Select
                    value={config.api.apiVersion}
                    onValueChange={(value) => updateConfig('api', 'apiVersion', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1</SelectItem>
                      <SelectItem value="v2">v2 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookRetries">Webhook Retries</Label>
                  <Input
                    id="webhookRetries"
                    type="number"
                    value={config.api.webhookRetries}
                    onChange={(e) => updateConfig('api', 'webhookRetries', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                  <p className="text-sm text-gray-500">
                    Allow webhook subscriptions for real-time events
                  </p>
                </div>
                <Switch
                  id="enableWebhooks"
                  checked={config.api.enableWebhooks}
                  onCheckedChange={(checked) => updateConfig('api', 'enableWebhooks', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable application features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAnalytics">Analytics Dashboard</Label>
                    <p className="text-sm text-gray-500">
                      Enable advanced analytics and reporting features
                    </p>
                  </div>
                  <Switch
                    id="enableAnalytics"
                    checked={config.features.enableAnalytics}
                    onCheckedChange={(checked) => updateConfig('features', 'enableAnalytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTeamFeatures">Team Features</Label>
                    <p className="text-sm text-gray-500">
                      Enable team collaboration and management features
                    </p>
                  </div>
                  <Switch
                    id="enableTeamFeatures"
                    checked={config.features.enableTeamFeatures}
                    onCheckedChange={(checked) => updateConfig('features', 'enableTeamFeatures', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableIntegrations">Third-party Integrations</Label>
                    <p className="text-sm text-gray-500">
                      Enable integrations with external services
                    </p>
                  </div>
                  <Switch
                    id="enableIntegrations"
                    checked={config.features.enableIntegrations}
                    onCheckedChange={(checked) => updateConfig('features', 'enableIntegrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAI">AI Features</Label>
                    <p className="text-sm text-gray-500">
                      Enable AI-powered recommendations and insights
                    </p>
                  </div>
                  <Switch
                    id="enableAI"
                    checked={config.features.enableAI}
                    onCheckedChange={(checked) => updateConfig('features', 'enableAI', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableMobileApp">Mobile App Support</Label>
                    <p className="text-sm text-gray-500">
                      Enable mobile app API endpoints and features
                    </p>
                  </div>
                  <Switch
                    id="enableMobileApp"
                    checked={config.features.enableMobileApp}
                    onCheckedChange={(checked) => updateConfig('features', 'enableMobileApp', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Configuration Dialog */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="shadow-lg border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">You have unsaved changes</p>
                  <p className="text-sm text-yellow-700">Don't forget to save your configuration</p>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will discard all unsaved changes and reset to the last saved configuration.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={resetConfig}>
                          Reset Changes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button size="sm" onClick={saveConfig} disabled={saving}>
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};