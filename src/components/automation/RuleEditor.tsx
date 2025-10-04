import { useState, useEffect } from "react";
import {
  useCreateAutomationRule,
  useUpdateAutomationRule,
  type AutomationRule,
} from "@/hooks/useAutomation";
import { useDefaultWorkspace } from "@/hooks/useTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface RuleEditorProps {
  trigger: React.ReactNode;
  rule?: AutomationRule;
}

export function RuleEditor({ trigger, rule }: RuleEditorProps) {
  const [open, setOpen] = useState(false);
  const { data: workspace } = useDefaultWorkspace();
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rule_type: "auto_tag",
    titleContains: "",
    priority: "",
    addTags: "",
    setStatus: "",
    setPriority: "",
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description || "",
        rule_type: rule.rule_type,
        titleContains: (rule.trigger_conditions.task_title_contains || []).join(
          ", ",
        ),
        priority: rule.trigger_conditions.task_priority?.[0] || "",
        addTags: (rule.actions.add_tags || []).join(", "),
        setStatus: rule.actions.set_status || "",
        setPriority: rule.actions.set_priority || "",
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspace) {
      return;
    }

    const trigger_conditions: Record<string, any> = {};
    const actions: Record<string, any> = {};

    // Build conditions
    if (formData.titleContains) {
      trigger_conditions.task_title_contains = formData.titleContains
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (formData.priority) {
      trigger_conditions.task_priority = [formData.priority];
    }

    // Build actions
    if (formData.addTags) {
      actions.add_tags = formData.addTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (formData.setStatus) {
      actions.set_status = formData.setStatus;
    }
    if (formData.setPriority) {
      actions.set_priority = formData.setPriority;
    }

    const ruleData = {
      name: formData.name,
      description: formData.description || null,
      rule_type: formData.rule_type,
      workspace_id: workspace.id,
      trigger_conditions,
      actions,
    };

    if (rule) {
      await updateRule.mutateAsync({ id: rule.id, ...ruleData });
    } else {
      await createRule.mutateAsync(ruleData);
    }

    setOpen(false);
    // Reset form
    setFormData({
      name: "",
      description: "",
      rule_type: "auto_tag",
      titleContains: "",
      priority: "",
      addTags: "",
      setStatus: "",
      setPriority: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Edit Automation Rule" : "Create Automation Rule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Auto-tag urgent meetings"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What does this rule do?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, rule_type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_tag">Auto Tag</SelectItem>
                  <SelectItem value="auto_status">Auto Status</SelectItem>
                  <SelectItem value="auto_assign">Auto Assign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Trigger Conditions</h3>
            <p className="text-sm text-muted-foreground">
              When should this rule activate?
            </p>

            <div>
              <Label htmlFor="titleContains">
                Title Contains (comma-separated)
              </Label>
              <Input
                id="titleContains"
                value={formData.titleContains}
                onChange={(e) =>
                  setFormData({ ...formData, titleContains: e.target.value })
                }
                placeholder="meeting, review, urgent"
              />
            </div>

            <div>
              <Label htmlFor="priority">Task Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Any priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Actions</h3>
            <p className="text-sm text-muted-foreground">
              What should happen when conditions are met?
            </p>

            <div>
              <Label htmlFor="addTags">Add Tags (comma-separated)</Label>
              <Input
                id="addTags"
                value={formData.addTags}
                onChange={(e) =>
                  setFormData({ ...formData, addTags: e.target.value })
                }
                placeholder="automated, important"
              />
            </div>

            <div>
              <Label htmlFor="setStatus">Set Status</Label>
              <Select
                value={formData.setStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, setStatus: value })
                }
              >
                <SelectTrigger id="setStatus">
                  <SelectValue placeholder="Don't change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Don't change status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="setPriority">Set Priority</Label>
              <Select
                value={formData.setPriority}
                onValueChange={(value) =>
                  setFormData({ ...formData, setPriority: value })
                }
              >
                <SelectTrigger id="setPriority">
                  <SelectValue placeholder="Don't change priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Don't change priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRule.isPending || updateRule.isPending}
            >
              {rule ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
