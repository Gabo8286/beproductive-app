import { useState } from "react";
import { Activity, Plus, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Slider } from "@/components/ui/slider";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/contexts/AuthContext";
import {
  useHabitGoalLinks,
  useCreateHabitGoalLink,
  useDeleteHabitGoalLink,
  useGoalProgressFromHabits,
} from "@/hooks/useHabitGoalLinks";

interface GoalHabitManagerProps {
  goalId: string;
}

export function GoalHabitManager({ goalId }: GoalHabitManagerProps) {
  const { user } = useAuth();
  const workspaceId = user?.id || "";

  const [showDialog, setShowDialog] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [contributionWeight, setContributionWeight] = useState([1.0]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: habits } = useHabits(workspaceId);
  const { data: links } = useHabitGoalLinks(undefined, goalId);
  const { data: progressData } = useGoalProgressFromHabits(goalId);
  const createLink = useCreateHabitGoalLink();
  const deleteLink = useDeleteHabitGoalLink();

  const activeHabits = habits?.filter((h) => !h.archived_at) || [];
  const linkedHabitIds = new Set(links?.map((l) => l.habit_id) || []);
  const availableHabits = activeHabits.filter((h) => !linkedHabitIds.has(h.id));

  const filteredHabits = availableHabits.filter((habit) =>
    habit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLink = () => {
    if (!selectedHabitId) return;

    createLink.mutate(
      {
        habitId: selectedHabitId,
        goalId,
        contributionWeight: contributionWeight[0],
      },
      {
        onSuccess: () => {
          setShowDialog(false);
          setSelectedHabitId("");
          setContributionWeight([1.0]);
          setSearchQuery("");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Supporting Habits
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Link Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Habit to Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Search Habits</Label>
                  <Input
                    placeholder="Search for a habit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Select Habit</Label>
                  <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a habit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredHabits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          <div className="flex items-center gap-2">
                            <span>{habit.title}</span>
                            <Badge variant="outline">{habit.category}</Badge>
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
                    disabled={!selectedHabitId || createLink.isPending}
                    className="flex-1"
                  >
                    Link Habit
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
        {progressData && (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Progress from Habits: {progressData.totalProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progressData.totalProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on {progressData.habitContributions.length} linked habit
              {progressData.habitContributions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {links && links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => {
              const contribution = progressData?.habitContributions.find(
                (c) => c.habitId === link.habit_id
              );

              return (
                <div
                  key={link.id}
                  className="p-3 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="font-medium">{link.habits?.title}</span>
                        <Badge variant="outline">{link.habits?.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>🔥 {link.habits?.current_streak} day streak</span>
                        {contribution && (
                          <span>
                            Contribution: {contribution.weightedContribution.toFixed(1)}%
                          </span>
                        )}
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

                  {contribution && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Completion Rate</span>
                        <span>{contribution.completionRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={contribution.completionRate} className="h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No linked habits yet</p>
            <p className="text-sm">Link habits to track their contribution to this goal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
