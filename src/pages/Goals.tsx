import { useState, useMemo } from "react";
import { Plus, Search, Folder, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { Goal } from "@/types/goals";
import { useNavigate } from "react-router-dom";
import { GoalCard } from "@/components/goals/GoalCard";

type SortOption = 'newest' | 'oldest' | 'priority' | 'progress' | 'due_date' | 'title';
type ViewMode = 'all' | 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export default function Goals() {
  const navigate = useNavigate();
  const { goals, isLoading } = useGoals();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showHierarchy, setShowHierarchy] = useState(false);

  // Filter and sort goals
  const processedGoals = useMemo(() => {
    let filtered = goals;

    // Filter by status
    if (viewMode !== 'all') {
      filtered = filtered.filter(goal => goal.status === viewMode);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(query) ||
        goal.description?.toLowerCase().includes(query) ||
        goal.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort goals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'due_date':
          if (!a.target_date && !b.target_date) return 0;
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [goals, searchQuery, sortBy, viewMode]);

  // Group goals by status for stats
  const goalStats = useMemo(() => {
    const stats = {
      total: goals.length,
      draft: 0,
      active: 0,
      paused: 0,
      completed: 0,
      archived: 0,
    };

    goals.forEach(goal => {
      stats[goal.status]++;
    });

    return stats;
  }, [goals]);

  // Organize goals hierarchically
  const hierarchicalGoals = useMemo(() => {
    if (!showHierarchy) return processedGoals;

    const parentGoals = processedGoals.filter(goal => !goal.parent_goal_id);
    const childGoals = processedGoals.filter(goal => goal.parent_goal_id);

    return parentGoals.map(parent => ({
      ...parent,
      children: childGoals.filter(child => child.parent_goal_id === parent.id)
    }));
  }, [processedGoals, showHierarchy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Manage and track your personal and professional objectives
          </p>
        </div>
        <Button onClick={() => navigate('/goals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Badge variant="secondary" className="bg-gray-500 text-white">
              {goalStats.draft}
            </Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="default">
              {goalStats.active}
            </Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Badge className="bg-yellow-500 text-white">
              {goalStats.paused}
            </Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge className="bg-green-500 text-white">
              {goalStats.completed}
            </Badge>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Badge variant="outline">
              {goalStats.archived}
            </Badge>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goals by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* View Options */}
        <div className="flex gap-2">
          <Button
            variant={showHierarchy ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHierarchy(!showHierarchy)}
          >
            <Folder className="h-4 w-4 mr-2" />
            Hierarchy
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({goalStats.total})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({goalStats.draft})</TabsTrigger>
          <TabsTrigger value="active">Active ({goalStats.active})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({goalStats.paused})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({goalStats.completed})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({goalStats.archived})</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="mt-6">
          {processedGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No goals found' : viewMode === 'all' ? 'No goals yet' : `No ${viewMode} goals`}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : viewMode === 'all'
                      ? 'Create your first goal to get started tracking your objectives'
                      : `You don't have any ${viewMode} goals yet`
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/goals/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(showHierarchy ? hierarchicalGoals : processedGoals).map((goal: any) => (
                <div key={goal.id}>
                  <GoalCard goal={goal} />
                  {showHierarchy && goal.children && goal.children.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2">
                      {goal.children.map((child: Goal) => (
                        <div key={child.id} className="border-l-2 border-muted pl-4">
                          <GoalCard goal={child} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
