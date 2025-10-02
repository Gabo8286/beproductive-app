import { useState } from "react";
import { Link2, Plus, X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/contexts/AuthContext";
import {
  useHabitGoalLinks,
  useCreateHabitGoalLink,
  useUpdateHabitGoalLink,
  useDeleteHabitGoalLink,
} from "@/hooks/useHabitGoalLinks";

interface HabitGoalLinkerProps {
  habitId: string;
}

export function HabitGoalLinker({ habitId }: HabitGoalLinkerProps) {
  const { user } = useAuth();
  const workspaceId = user?.id || "";

  const [showDialog, setShowDialog] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [contributionWeight, setContributionWeight] = useState([1.0]);
  const [searchQuery, setSearchQuery] = useState("");

  const { goals } = useGoals();
  const { data: links } = useHabitGoalLinks(habitId);
  const createLink = useCreateHabitGoalLink();
  const updateLink = useUpdateHabitGoalLink();
  const deleteLink = useDeleteHabitGoalLink();

  const activeGoals = goals?.filter((g) => g.status === "active") || [];
  const linkedGoalIds = new Set(links?.map((l) => l.goal_id) || []);
  const availableGoals = activeGoals.filter((g) => !linkedGoalIds.has(g.id));

  const filteredGoals = availableGoals.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLink = () => {
    if (!selectedGoalId) return;

    createLink.mutate(
      {
        habitId,
        goalId: selectedGoalId,
        contributionWeight: contributionWeight[0],
      },
      {
        onSuccess: () => {
          setShowDialog(false);
          setSelectedGoalId("");
          setContributionWeight([1.0]);
          setSearchQuery("");
        },
      }
    );
  };

  const handleUpdateWeight = (linkId: string, weight: number) => {
    updateLink.mutate({ linkId, contributionWeight: weight });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Linked Goals
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Link Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Habit to Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Search Goals</Label>
                  <Input
                    placeholder="Search for a goal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Select Goal</Label>
                  <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div className="flex items-center gap-2">
                            <span>{goal.title}</span>
                            <Badge variant="outline">{goal.category}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Contribution Weight: {contributionWeight[0].toFixed(1)}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    How much does this habit contribute to the goal?
                  </p>
                  <Slider
                    value={contributionWeight}
                    onValueChange={setContributionWeight}
                    min={0.1}
                    max={2.0}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minor (0.1)</span>
                    <span>Normal (1.0)</span>
                    <span>Major (2.0)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateLink}
                    disabled={!selectedGoalId || createLink.isPending}
                    className="flex-1"
                  >
                    Link Goal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links && links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="p-3 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{link.goals?.title}</span>
                      <Badge variant="outline">{link.goals?.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Progress: {link.goals?.progress.toFixed(0)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLink.mutate(link.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs">
                    Contribution Weight: {link.contribution_weight.toFixed(1)}
                  </Label>
                  <Slider
                    value={[link.contribution_weight]}
                    onValueChange={(value) =>
                      handleUpdateWeight(link.id, value[0])
                    }
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No linked goals yet</p>
            <p className="text-sm">Link this habit to goals to track contribution</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
