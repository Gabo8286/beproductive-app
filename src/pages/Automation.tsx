import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/automation/NotificationSettings";
import { AutomationRules } from "@/components/automation/AutomationRules";
import { AIAutomationDashboard } from "@/components/automation/AIAutomationDashboard";
import { CrossModuleChains } from "@/components/automation/CrossModuleChains";
import { NaturalLanguageRuleBuilder } from "@/components/automation/NaturalLanguageRuleBuilder";
import { WorkflowOptimizer } from "@/components/automation/WorkflowOptimizer";
import {
  Bell,
  Zap,
  Brain,
  Link,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export default function Automation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          AI Automation & Intelligent Workflows
        </h1>
        <p className="text-muted-foreground">
          Advanced AI-powered automation, cross-module workflows, and
          intelligent optimization
        </p>
      </div>

      <Tabs defaultValue="ai-automation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger
            value="ai-automation"
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Engine
          </TabsTrigger>
          <TabsTrigger value="chains" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Chains
          </TabsTrigger>
          <TabsTrigger
            value="natural-language"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Natural Language
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-automation">
          <AIAutomationDashboard />
        </TabsContent>

        <TabsContent value="chains">
          <CrossModuleChains />
        </TabsContent>

        <TabsContent value="natural-language">
          <NaturalLanguageRuleBuilder />
        </TabsContent>

        <TabsContent value="optimization">
          <WorkflowOptimizer />
        </TabsContent>

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
