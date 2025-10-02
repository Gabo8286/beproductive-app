import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Save, X, Plus, Calendar, Target, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGoal, useUpdateGoal, useDeleteGoal, useUpdateGoalProgress } from "@/hooks/useGoals";
import { useGoalMilestones } from "@/hooks/useGoalMilestones";
import { Goal } from "@/types/goals";
import { getStatusColor, getStatusLabel, getAvailableStatusTransitions } from "@/utils/goalStatus";
import { MilestoneCard } from "@/components/goals/MilestoneCard";
import { SubGoalsList } from "@/components/goals/SubGoalsList";
import { GoalTimeline } from "@/components/goals/GoalTimeline";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goal, isLoading, error } = useGoal(id!);
  const { data: milestones, isLoading: milestonesLoading } = useGoalMilestones(id!);
  const updateGoalMutation = useUpdateGoal(id!);
  const deleteGoalMutation = useDeleteGoal();
  const updateProgressMutation = useUpdateGoalProgress();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Partial<Goal>>({});
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (goal) {
      setEditedGoal({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        target_value: goal.target_value,
        current_value: goal.current_value,
        unit: goal.unit,
        start_date: goal.start_date,
        target_date: goal.target_date,
        tags: goal.tags || [],
      });
    }
  }, [goal]);

  const handleSave = async () => {
    try {
      const updateData: any = {};
      if (editedGoal.title !== undefined) updateData.title = editedGoal.title;
      if (editedGoal.description !== undefined) updateData.description = editedGoal.description;
      if (editedGoal.category !== undefined) updateData.category = editedGoal.category;
      if (editedGoal.priority !== undefined) updateData.priority = editedGoal.priority;
      if (editedGoal.target_value !== undefined) updateData.target_value = editedGoal.target_value;
      if (editedGoal.current_value !== undefined) updateData.current_value = editedGoal.current_value;
      if (editedGoal.unit !== undefined) updateData.unit = editedGoal.unit;
      if (editedGoal.start_date !== undefined) {
        updateData.start_date = editedGoal.start_date ? new Date(editedGoal.start_date) : undefined;
      }
      if (editedGoal.target_date !== undefined) {
        updateData.target_date = editedGoal.target_date ? new Date(editedGoal.target_date) : undefined;
      }
      if (editedGoal.tags !== undefined) updateData.tags = editedGoal.tags;

      await updateGoalMutation.mutateAsync(updateData);
      setIsEditing(false);
      toast.success("Goal updated successfully!");
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleCancel = () => {
    if (goal) {
      setEditedGoal({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        target_value: goal.target_value,
        current_value: goal.current_value,
        unit: goal.unit,
        start_date: goal.start_date,
        target_date: goal.target_date,
        tags: goal.tags || [],
      });
    }
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: Goal['status']) => {
    try {
      await updateGoalMutation.mutateAsync({ status: newStatus });
      toast.success(`Goal ${newStatus === 'completed' ? 'completed' : 'updated'}!`);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    try {
      await updateProgressMutation.mutateAsync({ goalId: id!, progress });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoalMutation.mutateAsync(id!);
      navigate('/goals');
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && editedGoal.tags && !editedGoal.tags.includes(newTag.trim())) {
      setEditedGoal({
        ...editedGoal,
        tags: [...editedGoal.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedGoal({
      ...editedGoal,
      tags: editedGoal.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const getTimeRemaining = () => {
    if (!goal?.target_date) return null;
    const days = differenceInDays(new Date(goal.target_date), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days remaining`;
  };

  const getProgressColor = () => {
    const progress = goal?.progress || 0;
    if (progress >= 100) return "text-green-500";
    if (progress >= 75) return "text-blue-500";
    if (progress >= 50) return "text-yellow-500";
    if (progress >= 25) return "text-orange-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold">Goal not found</h2>
        <Button onClick={() => navigate('/goals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    );
  }

  const availableTransitions = getAvailableStatusTransitions(goal.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <p className="text-muted-foreground">
              Created {format(new Date(goal.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateGoalMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Goal Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={editedGoal.title || ""}
                    onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
                    placeholder="Goal title"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{goal.title}</h2>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedGoal.description || ""}
                    onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                    placeholder="Goal description"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {goal.description || "No description provided"}
                  </p>
                )}
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  {isEditing ? (
                    <Select 
                      value={editedGoal.category} 
                      onValueChange={(value) => setEditedGoal({ ...editedGoal, category: value as Goal['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="relationship">Relationship</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">{goal.category}</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  {isEditing ? (
                    <Select 
                      value={editedGoal.priority?.toString()} 
                      onValueChange={(value) => setEditedGoal({ ...editedGoal, priority: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lowest</SelectItem>
                        <SelectItem value="2">Low</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">High</SelectItem>
                        <SelectItem value="5">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">
                      Priority {goal.priority || 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Target Value */}
              {(isEditing || goal.target_value) && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedGoal.target_value || ""}
                        onChange={(e) => setEditedGoal({
                          ...editedGoal,
                          target_value: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        placeholder="Target"
                      />
                    ) : (
                      <p>{goal.target_value || "Not set"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Current Value</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedGoal.current_value || ""}
                        onChange={(e) => setEditedGoal({
                          ...editedGoal,
                          current_value: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                        placeholder="Current"
                      />
                    ) : (
                      <p>{goal.current_value || 0}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    {isEditing ? (
                      <Input
                        value={editedGoal.unit || ""}
                        onChange={(e) => setEditedGoal({ ...editedGoal, unit: e.target.value })}
                        placeholder="Unit"
                      />
                    ) : (
                      <p>{goal.unit || "No unit"}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedGoal.start_date ? new Date(editedGoal.start_date).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditedGoal({
                        ...editedGoal,
                        start_date: e.target.value || undefined
                      })}
                    />
                  ) : (
                    <p>{goal.start_date ? format(new Date(goal.start_date), 'MMMM d, yyyy') : "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedGoal.target_date ? new Date(editedGoal.target_date).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditedGoal({
                        ...editedGoal,
                        target_date: e.target.value || undefined
                      })}
                    />
                  ) : (
                    <div className="space-y-1">
                      <p>{goal.target_date ? format(new Date(goal.target_date), 'MMMM d, yyyy') : "Not set"}</p>
                      {goal.target_date && (
                        <p className="text-sm text-muted-foreground">{getTimeRemaining()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {(editedGoal.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      {isEditing && (
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="w-24"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button size="sm" onClick={addTag}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Tabs defaultValue="milestones" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="subgoals">Sub-Goals</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="milestones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>
                    Track progress with specific milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {milestonesLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : milestones && milestones.length > 0 ? (
                    <div className="space-y-3">
                      {milestones.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No milestones yet</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Milestone
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subgoals">
              <SubGoalsList parentGoalId={goal.id} />
            </TabsContent>

            <TabsContent value="timeline">
              <GoalTimeline goal={goal} milestones={milestones || []} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={getStatusColor(goal.status)}>
                {getStatusLabel(goal.status)}
              </Badge>

              {availableTransitions.length > 0 && (
                <div className="space-y-2">
                  <Label>Change Status</Label>
                  <Select onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTransitions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getProgressColor()}`}>
                  {Math.round(goal.progress || 0)}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>

              <Progress 
                value={goal.progress || 0} 
                className="h-3 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const width = rect.width;
                  const newProgress = Math.round((x / width) * 100);
                  handleProgressUpdate(newProgress);
                }}
              />

              <p className="text-xs text-muted-foreground text-center">
                Click to update progress
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Milestones</span>
                <span className="font-medium">
                  {milestones?.filter(m => m.completed_at).length || 0}/{milestones?.length || 0}
                </span>
              </div>

              {goal.target_value && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target Progress</span>
                  <span className="font-medium">
                    {goal.current_value || 0}/{goal.target_value} {goal.unit}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days Active</span>
                <span className="font-medium">
                  {differenceInDays(new Date(), new Date(goal.created_at))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{goal.title}"? This action cannot be undone and will also delete all associated milestones and sub-goals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
