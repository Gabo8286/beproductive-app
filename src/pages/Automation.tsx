import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/components/automation/NotificationSettings';
import { AutomationRules } from '@/components/automation/AutomationRules';
import { Bell, Zap } from 'lucide-react';

export default function Automation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automation & Notifications</h1>
        <p className="text-muted-foreground">
          Configure automation rules and notification preferences
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <AutomationRules />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
