import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Brain,
  Settings,
  Shield,
  DollarSign,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAISettings } from '@/hooks/useAISettings';
import { useAIUsageStats } from '@/hooks/useAIUsageStats';
import { INSIGHT_TYPE_LABELS, PROVIDER_LABELS } from '@/types/ai-insights';

export function AISettingsDashboard() {
  const { user } = useAuth();
  const {
    settings,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    isLoading,
    error
  } = useAISettings();

  const {
    usageStats,
    monthlyUsage,
    isLoading: statsLoading
  } = useAIUsageStats();

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setUnsavedChanges(true);
  };

  const handleNestedSettingChange = (parentKey: string, childKey: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    await updateSettings(localSettings);
    setUnsavedChanges(false);
  };

  const handleResetToDefaults = async () => {
    await resetToDefaults();
    setUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Settings & Privacy
          </h2>
          <p className="text-muted-foreground">
            Customize your AI experience and manage privacy preferences
          </p>
        </div>
        <div className="flex gap-2">
          {unsavedChanges && (
            <Button onClick={saveSettings} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Save Changes
            </Button>
          )}
          <Button variant="outline" onClick={exportSettings} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="usage">Usage & Costs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* AI Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provider Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Provider Settings
                </CardTitle>
                <CardDescription>
                  Configure which AI provider to use for different features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Provider</Label>
                  <Select
                    value={localSettings?.preferred_provider}
                    onValueChange={(value) => handleSettingChange('preferred_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Insight Generation Frequency</Label>
                  <Select
                    value={localSettings?.insight_frequency}
                    onValueChange={(value) => handleSettingChange('insight_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-insights">Auto-generate Insights</Label>
                  <Switch
                    id="auto-insights"
                    checked={localSettings?.auto_generate_insights}
                    onCheckedChange={(checked) => handleSettingChange('auto_generate_insights', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Insight Types */}
            <Card>
              <CardHeader>
                <CardTitle>Enabled Insight Types</CardTitle>
                <CardDescription>
                  Choose which types of insights AI should generate for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(INSIGHT_TYPE_LABELS).map(([type, label]) => (
                    <div key={type} className="flex items-center justify-between">
                      <Label htmlFor={type} className="text-sm">{label}</Label>
                      <Switch
                        id={type}
                        checked={localSettings?.enabled_insight_types?.includes(type)}
                        onCheckedChange={(checked) => {
                          const currentTypes = localSettings?.enabled_insight_types || [];
                          const newTypes = checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          handleSettingChange('enabled_insight_types', newTypes);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Control when and how you receive AI-generated notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>New Insights</Label>
                  <Switch
                    checked={localSettings?.notification_preferences?.new_insights !== false}
                    onCheckedChange={(checked) =>
                      handleNestedSettingChange('notification_preferences', 'new_insights', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Weekly Summary</Label>
                  <Switch
                    checked={localSettings?.notification_preferences?.weekly_summary !== false}
                    onCheckedChange={(checked) =>
                      handleNestedSettingChange('notification_preferences', 'weekly_summary', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Task Recommendations</Label>
                  <Switch
                    checked={localSettings?.notification_preferences?.task_recommendations !== false}
                    onCheckedChange={(checked) =>
                      handleNestedSettingChange('notification_preferences', 'task_recommendations', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Burnout Alerts</Label>
                  <Switch
                    checked={localSettings?.notification_preferences?.burnout_alerts !== false}
                    onCheckedChange={(checked) =>
                      handleNestedSettingChange('notification_preferences', 'burnout_alerts', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coaching Settings */}
            <Card>
              <CardHeader>
                <CardTitle>AI Coach Preferences</CardTitle>
                <CardDescription>
                  Customize your AI productivity coach experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Coaching Style</Label>
                  <Select
                    value={localSettings?.coaching_style || 'balanced'}
                    onValueChange={(value) => handleSettingChange('coaching_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                      <SelectItem value="balanced">Balanced Approach</SelectItem>
                      <SelectItem value="direct">Direct & Goal-Focused</SelectItem>
                      <SelectItem value="analytical">Analytical & Data-Driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <Select
                    value={localSettings?.response_length || 'medium'}
                    onValueChange={(value) => handleSettingChange('response_length', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief & Concise</SelectItem>
                      <SelectItem value="medium">Medium Detail</SelectItem>
                      <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Proactive Suggestions</Label>
                  <Switch
                    checked={localSettings?.proactive_suggestions !== false}
                    onCheckedChange={(checked) => handleSettingChange('proactive_suggestions', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Privacy & Security
              </CardTitle>
              <CardDescription>
                Control how your data is used and stored for AI processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Data Usage</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Share Anonymous Analytics</Label>
                      <p className="text-xs text-muted-foreground">
                        Help improve AI features with anonymized usage data
                      </p>
                    </div>
                    <Switch
                      checked={localSettings?.privacy_settings?.share_anonymous_data}
                      onCheckedChange={(checked) =>
                        handleNestedSettingChange('privacy_settings', 'share_anonymous_data', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Improve AI Models</Label>
                      <p className="text-xs text-muted-foreground">
                        Use your interactions to improve AI responses
                      </p>
                    </div>
                    <Switch
                      checked={localSettings?.privacy_settings?.improve_models !== false}
                      onCheckedChange={(checked) =>
                        handleNestedSettingChange('privacy_settings', 'improve_models', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Store Conversation History</Label>
                      <p className="text-xs text-muted-foreground">
                        Keep chat history for better context
                      </p>
                    </div>
                    <Switch
                      checked={localSettings?.privacy_settings?.store_conversations !== false}
                      onCheckedChange={(checked) =>
                        handleNestedSettingChange('privacy_settings', 'store_conversations', checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Data Retention</h4>

                  <div className="space-y-2">
                    <Label>Insight Retention Period</Label>
                    <Select
                      value={localSettings?.privacy_settings?.insight_retention || '90d'}
                      onValueChange={(value) =>
                        handleNestedSettingChange('privacy_settings', 'insight_retention', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="forever">Keep Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chat History Retention</Label>
                    <Select
                      value={localSettings?.privacy_settings?.chat_retention || '30d'}
                      onValueChange={(value) =>
                        handleNestedSettingChange('privacy_settings', 'chat_retention', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                        <SelectItem value="never">Never Store</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-600">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Irreversible actions that affect your AI data
                    </p>
                  </div>
                  <div className="space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear AI Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear All AI Data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all your AI insights, recommendations,
                            and chat history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete All Data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage & Costs */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${monthlyUsage?.totalCost?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Requests</span>
                    <span>{monthlyUsage?.requestCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tokens Used</span>
                    <span>{monthlyUsage?.totalTokens?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage by Provider */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageStats?.byProvider && Object.entries(usageStats.byProvider).map(([provider, stats]) => (
                    <div key={provider} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{provider}</span>
                        <span>${stats.cost.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={(stats.cost / (usageStats.totalCost || 1)) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Usage Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Monthly Spending Limit</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Slider
                      value={[localSettings?.spending_limit || 10]}
                      onValueChange={([value]) => handleSettingChange('spending_limit', value)}
                      max={100}
                      min={5}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm w-8">{localSettings?.spending_limit || 10}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alert at 80% of limit</Label>
                  <Switch
                    checked={localSettings?.usage_alerts !== false}
                    onCheckedChange={(checked) => handleSettingChange('usage_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto-pause at limit</Label>
                  <Switch
                    checked={localSettings?.auto_pause_at_limit}
                    onCheckedChange={(checked) => handleSettingChange('auto_pause_at_limit', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
                <CardDescription>
                  Fine-tune AI model parameters for your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Response Creativity</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Conservative</span>
                    <Slider
                      value={[localSettings?.temperature || 0.7]}
                      onValueChange={([value]) => handleSettingChange('temperature', value)}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm">Creative</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher values make responses more creative but less predictable
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Response Length Limit</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[localSettings?.max_tokens || 500]}
                      onValueChange={([value]) => handleSettingChange('max_tokens', value)}
                      max={1000}
                      min={100}
                      step={50}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{localSettings?.max_tokens || 500}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export & Import</CardTitle>
                <CardDescription>
                  Backup and restore your AI settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportSettings} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export Settings
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="import-file">Import Settings</Label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const settings = JSON.parse(event.target?.result as string);
                            importSettings(settings);
                          } catch (error) {
                            console.error('Failed to import settings:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/80"
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Reset to Defaults
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset AI Settings?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset all your AI preferences to default values.
                        Your data and insights will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetToDefaults}>
                        Reset Settings
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}