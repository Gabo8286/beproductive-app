import { useState } from "react";
import { Search, Plus, X, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGoals } from "@/hooks/useGoals";
import {
  useCreateReflectionGoalLink,
  useDeleteReflectionGoalLink,
  useReflectionGoalLinks,
} from "@/hooks/useReflectionLinks";
import type { GoalReflectionType } from "@/types/reflections";
import { toast } from "sonner";

interface GoalReflectionLinkerProps {
  reflectionId: string;
  reflectionContent?: string;
}

export function GoalReflectionLinker({
  reflectionId,
  reflectionContent = "",
}: GoalReflectionLinkerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [reflectionType, setReflectionType] =
    useState<GoalReflectionType>("progress_review");
  const [insights, setInsights] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [newActionItem, setNewActionItem] = useState("");

  const { goals, isLoading: goalsLoading } = useGoals();
  const { data: linkedGoals, isLoading: linksLoading } =
    useReflectionGoalLinks(reflectionId);
  const createLinkMutation = useCreateReflectionGoalLink();
  const deleteLinkMutation = useDeleteReflectionGoalLink();

  const linkedGoalIds = linkedGoals?.map((link) => link.goal_id) || [];
  const availableGoals =
    goals?.filter(
      (goal) =>
        !linkedGoalIds.includes(goal.id) &&
        (goal.status === "active" || goal.status === "draft") &&
        (searchQuery === "" ||
          goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          goal.category.toLowerCase().includes(searchQuery.toLowerCase())),
    ) || [];

  const handleAddLink = async () => {
    if (!selectedGoalId) {
      toast.error("Please select a goal");
      return;
    }

    try {
      await createLinkMutation.mutateAsync({
        reflection_id: reflectionId,
        goal_id: selectedGoalId,
        reflection_type: reflectionType,
        insights,
        action_items: actionItems,
      });

      setShowLinkDialog(false);
      setSelectedGoalId("");
      setReflectionType("progress_review");
      setInsights("");
      setActionItems([]);
    } catch (error) {
      console.error("Failed to link goal:", error);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    try {
      await deleteLinkMutation.mutateAsync(linkId);
    } catch (error) {
      console.error("Failed to remove link:", error);
    }
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems([...actionItems, newActionItem.trim()]);
      setNewActionItem("");
    }
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const getReflectionTypeLabel = (type: GoalReflectionType) => {
    const labels: Record<GoalReflectionType, string> = {
      progress_review: "Progress Review",
      milestone_achieved: "Milestone Achieved",
      challenge_faced: "Challenge Faced",
      strategy_adjustment: "Strategy Adjustment",
      completion_celebration: "Completion Celebration",
    };
    return labels[type];
  };

  const getReflectionTypeColor = (type: GoalReflectionType) => {
    const colors: Record<GoalReflectionType, string> = {
      progress_review: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      milestone_achieved: "bg-green-500/10 text-green-700 dark:text-green-400",
      challenge_faced: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      strategy_adjustment:
        "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      completion_celebration: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    };
    return colors[type];
  };

  if (linksLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading linked goals...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Linked Goals</Label>
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Link Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Link Goal to Reflection</DialogTitle>
              <DialogDescription>
                Connect this reflection to a goal to track insights and
                progress.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Goal Selection */}
              <div className="space-y-2">
                <Label>Search Goals</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Available Goals */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {goalsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading goals...
                  </div>
                ) : availableGoals.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No matching goals found"
                      : "No available goals to link"}
                  </div>
                ) : (
                  availableGoals.map((goal) => (
                    <Card
                      key={goal.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedGoalId === goal.id
                          ? "border-primary bg-accent"
                          : ""
                      }`}
                      onClick={() => setSelectedGoalId(goal.id)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm">
                              {goal.title}
                            </CardTitle>
                            {goal.description && (
                              <CardDescription className="text-xs mt-1">
                                {goal.description.slice(0, 100)}
                                {goal.description.length > 100 ? "..." : ""}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {goal.category}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>

              {/* Reflection Type */}
              {selectedGoalId && (
                <>
                  <div className="space-y-2">
                    <Label>Reflection Type</Label>
                    <Select
                      value={reflectionType}
                      onValueChange={(value) =>
                        setReflectionType(value as GoalReflectionType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress_review">
                          Progress Review
                        </SelectItem>
                        <SelectItem value="milestone_achieved">
                          Milestone Achieved
                        </SelectItem>
                        <SelectItem value="challenge_faced">
                          Challenge Faced
                        </SelectItem>
                        <SelectItem value="strategy_adjustment">
                          Strategy Adjustment
                        </SelectItem>
                        <SelectItem value="completion_celebration">
                          Completion Celebration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Insights */}
                  <div className="space-y-2">
                    <Label>Insights</Label>
                    <Textarea
                      placeholder="What insights did you gain about this goal from this reflection?"
                      value={insights}
                      onChange={(e) => setInsights(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Items */}
                  <div className="space-y-2">
                    <Label>Action Items</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an action item..."
                        value={newActionItem}
                        onChange={(e) => setNewActionItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addActionItem();
                          }
                        }}
                      />
                      <Button size="sm" onClick={addActionItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {actionItems.length > 0 && (
                      <div className="space-y-1">
                        {actionItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Lightbulb className="h-3 w-3 text-muted-foreground" />
                            <span className="flex-1">{item}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeActionItem(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={!selectedGoalId || createLinkMutation.isPending}
              >
                Link Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Linked Goals Display */}
      {linkedGoals && linkedGoals.length > 0 ? (
        <div className="space-y-2">
          {linkedGoals.map((link) => (
            <Card key={link.id}>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">
                        {link.goal?.title}
                      </CardTitle>
                      <Badge
                        className={getReflectionTypeColor(link.reflection_type)}
                      >
                        {getReflectionTypeLabel(link.reflection_type)}
                      </Badge>
                    </div>
                    {link.insights && (
                      <CardDescription className="text-xs">
                        <strong>Insights:</strong> {link.insights}
                      </CardDescription>
                    )}
                    {link.action_items && link.action_items.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Action Items:</p>
                        {link.action_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Lightbulb className="h-3 w-3" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLink(link.id)}
                    disabled={deleteLinkMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No goals linked yet. Link a goal to track insights and progress.
        </div>
      )}
    </div>
  );
}
