import { useState, useEffect } from 'react';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/hooks/useAutomation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Webhook, Save } from 'lucide-react';

export function NotificationSettings() {
  const { data: settings } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  const [formData, setFormData] = useState({
    in_app_notifications: true,
    push_notifications: true,
    email_notifications: false,
    webhook_url: '',
    due_date_reminders: true,
    overdue_alerts: true,
    completion_celebrations: true,
    time_tracking_reminders: true,
    weekly_summaries: false,
    due_date_reminder_hours: [24, 1],
    overdue_escalation_hours: [1, 24, 72],
    weekly_summary_day: 1,
    weekly_summary_time: '09:00:00',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        in_app_notifications: settings.in_app_notifications,
        push_notifications: settings.push_notifications,
        email_notifications: settings.email_notifications,
        webhook_url: settings.webhook_url || '',
        due_date_reminders: settings.due_date_reminders,
        overdue_alerts: settings.overdue_alerts,
        completion_celebrations: settings.completion_celebrations,
        time_tracking_reminders: settings.time_tracking_reminders,
        weekly_summaries: settings.weekly_summaries,
        due_date_reminder_hours: settings.due_date_reminder_hours,
        overdue_escalation_hours: settings.overdue_escalation_hours,
        weekly_summary_day: settings.weekly_summary_day,
        weekly_summary_time: settings.weekly_summary_time,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              id="in-app"
              checked={formData.in_app_notifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, in_app_notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push">Browser Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when app is closed
              </p>
            </div>
            <Switch
              id="push"
              checked={formData.push_notifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, push_notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get daily or weekly email summaries
              </p>
            </div>
            <Switch
              id="email"
              checked={formData.email_notifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, email_notifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Integration
          </CardTitle>
          <CardDescription>
            Connect external systems via webhook URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL (optional)</Label>
            <Input
              id="webhook"
              type="url"
              placeholder="https://your-webhook-url.com/notifications"
              value={formData.webhook_url}
              onChange={(e) =>
                setFormData({ ...formData, webhook_url: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Notifications will be sent as POST requests to this URL
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="due-date">Due Date Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before tasks are due
              </p>
            </div>
            <Switch
              id="due-date"
              checked={formData.due_date_reminders}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, due_date_reminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="overdue">Overdue Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts for overdue tasks with escalation
              </p>
            </div>
            <Switch
              id="overdue"
              checked={formData.overdue_alerts}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, overdue_alerts: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="completion">Completion Celebrations</Label>
              <p className="text-sm text-muted-foreground">
                Celebrate when you complete tasks
              </p>
            </div>
            <Switch
              id="completion"
              checked={formData.completion_celebrations}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, completion_celebrations: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="time-tracking">Time Tracking Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind you to track time on tasks
              </p>
            </div>
            <Switch
              id="time-tracking"
              checked={formData.time_tracking_reminders}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, time_tracking_reminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly">Weekly Progress Summaries</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly reports of your progress
              </p>
            </div>
            <Switch
              id="weekly"
              checked={formData.weekly_summaries}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, weekly_summaries: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}
