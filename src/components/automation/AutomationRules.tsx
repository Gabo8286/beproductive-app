import { useState } from "react";
import {
  useAutomationRules,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
} from "@/hooks/useAutomation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RuleEditor } from "@/components/automation/RuleEditor";
import { Plus, Trash2, Edit, Zap } from "lucide-react";
import { format } from "date-fns";

export function AutomationRules() {
  const { data: rules = [] } = useAutomationRules();
  const updateRule = useUpdateAutomationRule();
  const deleteRule = useDeleteAutomationRule();
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case "auto_assign":
        return "Auto Assign";
      case "auto_tag":
        return "Auto Tag";
      case "auto_status":
        return "Auto Status";
      case "auto_archive":
        return "Auto Archive";
      case "dependency":
        return "Dependency";
      default:
        return type;
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updateRule.mutate({ id, is_enabled: enabled });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this automation rule?")) {
      deleteRule.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Rules</h2>
          <p className="text-muted-foreground">
            Automate routine tasks and workflows
          </p>
        </div>
        <RuleEditor
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          }
        />
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No automation rules yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              Create your first automation rule to save time on repetitive tasks
            </p>
            <RuleEditor
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{rule.name}</CardTitle>
                      <Badge variant="secondary">
                        {getRuleTypeLabel(rule.rule_type)}
                      </Badge>
                      {!rule.is_enabled && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    {rule.description && (
                      <CardDescription>{rule.description}</CardDescription>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(rule.id, checked)
                      }
                    />
                    <RuleEditor
                      rule={rule}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Conditions: </span>
                    <span className="text-muted-foreground">
                      {Object.keys(rule.trigger_conditions).length} condition(s)
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Actions: </span>
                    <span className="text-muted-foreground">
                      {Object.keys(rule.actions).length} action(s)
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Executed: </span>
                    <span className="text-muted-foreground">
                      {rule.execution_count} times
                    </span>
                    {rule.last_executed_at && (
                      <span className="text-muted-foreground ml-2">
                        • Last run{" "}
                        {format(new Date(rule.last_executed_at), "PPp")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
