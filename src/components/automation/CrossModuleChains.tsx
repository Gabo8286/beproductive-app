import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Plus,
  Link,
  Target,
  CheckSquare,
  Repeat,
  BookOpen,
  Trophy,
  Workflow,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { WorkflowChain, WorkflowStep } from "@/types/ai-automation";

interface CrossModuleChainsProps {
  onCreateChain?: (chain: Partial<WorkflowChain>) => void;
}

const moduleIcons = {
  tasks: CheckSquare,
  goals: Target,
  habits: Repeat,
  notes: BookOpen,
  gamification: Trophy,
  projects: Workflow,
  team: Users,
  processes: BarChart3
};

const moduleColors = {
  tasks: "text-blue-600 bg-blue-100",
  goals: "text-green-600 bg-green-100",
  habits: "text-purple-600 bg-purple-100",
  notes: "text-yellow-600 bg-yellow-100",
  gamification: "text-orange-600 bg-orange-100",
  projects: "text-indigo-600 bg-indigo-100",
  team: "text-pink-600 bg-pink-100",
  processes: "text-gray-600 bg-gray-100"
};

export function CrossModuleChains({ onCreateChain }: CrossModuleChainsProps) {
  const [createChainOpen, setCreateChainOpen] = useState(false);
  const [chainName, setChainName] = useState("");
  const [chainDescription, setChainDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Mock workflow chains data
  const mockChains: WorkflowChain[] = [
    {
      id: '1',
      name: 'Goal-to-Task Automation',
      description: 'Automatically create tasks when new goals are set and update goal progress when tasks are completed',
      modules: ['goals', 'tasks'],
      steps: [
        {
          id: 'step1',
          order: 1,
          module: 'goals',
          action: {
            type: 'create_goal',
            parameters: { auto_task_creation: true }
          },
          conditions: { goal_type: 'actionable' },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: true,
            adaptive_timing: false
          }
        },
        {
          id: 'step2',
          order: 2,
          module: 'tasks',
          action: {
            type: 'modify_task',
            parameters: { link_to_goal: true, inherit_priority: true }
          },
          conditions: { task_created_from_goal: true },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: false,
            adaptive_timing: true
          }
        }
      ],
      triggers: [{
        type: 'event_based',
        conditions: { event: 'goal_created', has_actionable_steps: true }
      }],
      success_criteria: { goal_completion_rate: 0.8 },
      performance_metrics: {
        completion_rate: 0.87,
        average_execution_time: 2.3,
        user_satisfaction: 4.5,
        error_rate: 0.02
      },
      ai_optimizations: ['smart_task_breakdown', 'priority_inheritance', 'deadline_estimation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Habit-Goal Integration',
      description: 'Track habit completions towards goals and suggest new habits based on goal requirements',
      modules: ['habits', 'goals', 'gamification'],
      steps: [
        {
          id: 'step1',
          order: 1,
          module: 'habits',
          action: {
            type: 'modify_task',
            parameters: { mark_completed: true, log_streak: true }
          },
          conditions: { habit_completed: true },
          ai_enhancements: {
            dynamic_parameters: false,
            outcome_prediction: true,
            adaptive_timing: false
          }
        },
        {
          id: 'step2',
          order: 2,
          module: 'goals',
          action: {
            type: 'update_habit',
            parameters: { increment_progress: 'calculated', update_metrics: true }
          },
          conditions: { habit_linked_to_goal: true },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: true,
            adaptive_timing: false
          }
        },
        {
          id: 'step3',
          order: 3,
          module: 'gamification',
          action: {
            type: 'ai_suggestion',
            parameters: { award_points: 'variable', check_achievements: true }
          },
          conditions: { significant_progress: true },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: false,
            adaptive_timing: true
          }
        }
      ],
      triggers: [{
        type: 'event_based',
        conditions: { event: 'habit_completed', has_goal_connection: true }
      }],
      success_criteria: { habit_consistency: 0.9, goal_progress_correlation: 0.75 },
      performance_metrics: {
        completion_rate: 0.92,
        average_execution_time: 1.8,
        user_satisfaction: 4.7,
        error_rate: 0.01
      },
      ai_optimizations: ['adaptive_rewards', 'progress_calculation', 'motivation_timing'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Project-Process Workflow',
      description: 'Execute process steps when project milestones are reached and update project status based on process completion',
      modules: ['projects', 'processes', 'tasks', 'team'],
      steps: [
        {
          id: 'step1',
          order: 1,
          module: 'projects',
          action: {
            type: 'modify_task',
            parameters: { trigger_milestone: true, notify_team: true }
          },
          conditions: { milestone_reached: true },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: true,
            adaptive_timing: false
          }
        },
        {
          id: 'step2',
          order: 2,
          module: 'processes',
          action: {
            type: 'execute_process',
            parameters: { auto_start: true, assign_roles: true }
          },
          conditions: { process_defined: true },
          ai_enhancements: {
            dynamic_parameters: true,
            outcome_prediction: true,
            adaptive_timing: true
          }
        },
        {
          id: 'step3',
          order: 3,
          module: 'team',
          action: {
            type: 'send_notification',
            parameters: { notify_stakeholders: true, include_progress: true }
          },
          conditions: { team_involved: true },
          ai_enhancements: {
            dynamic_parameters: false,
            outcome_prediction: false,
            adaptive_timing: true
          }
        }
      ],
      triggers: [{
        type: 'event_based',
        conditions: { event: 'project_milestone', has_linked_process: true }
      }],
      success_criteria: { process_completion_rate: 0.85, team_satisfaction: 0.8 },
      performance_metrics: {
        completion_rate: 0.89,
        average_execution_time: 15.2,
        user_satisfaction: 4.3,
        error_rate: 0.03
      },
      ai_optimizations: ['role_assignment', 'timing_optimization', 'notification_filtering'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const handleCreateChain = () => {
    if (!chainName.trim() || selectedModules.length < 2) return;

    const newChain: Partial<WorkflowChain> = {
      name: chainName,
      description: chainDescription,
      modules: selectedModules,
      steps: [],
      triggers: [],
      success_criteria: {},
      ai_optimizations: []
    };

    onCreateChain?.(newChain);
    setCreateChainOpen(false);
    setChainName("");
    setChainDescription("");
    setSelectedModules([]);
  };

  const toggleModule = (module: string) => {
    setSelectedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const ChainCard = ({ chain }: { chain: WorkflowChain }) => {
    const [isActive, setIsActive] = useState(true);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-600" />
                {chain.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {chain.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsActive(!isActive)}
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Module Flow */}
            <div>
              <h5 className="font-medium text-sm mb-2">Module Flow</h5>
              <div className="flex items-center gap-2 flex-wrap">
                {chain.modules.map((module, index) => {
                  const Icon = moduleIcons[module as keyof typeof moduleIcons];
                  const colorClass = moduleColors[module as keyof typeof moduleColors];

                  return (
                    <div key={module} className="flex items-center gap-1">
                      <Badge variant="outline" className={`${colorClass} border-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {module}
                      </Badge>
                      {index < chain.modules.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Success Rate</span>
                  <span>{Math.round(chain.performance_metrics.completion_rate * 100)}%</span>
                </div>
                <Progress value={chain.performance_metrics.completion_rate * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>User Satisfaction</span>
                  <span>{chain.performance_metrics.user_satisfaction}/5</span>
                </div>
                <Progress value={(chain.performance_metrics.user_satisfaction / 5) * 100} className="h-2" />
              </div>
            </div>

            {/* AI Optimizations */}
            <div>
              <h5 className="font-medium text-sm mb-2">AI Optimizations</h5>
              <div className="flex flex-wrap gap-1">
                {chain.ai_optimizations.map((optimization) => (
                  <Badge key={optimization} variant="secondary" className="text-xs">
                    {optimization.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {chain.performance_metrics.average_execution_time}s avg
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {Math.round((1 - chain.performance_metrics.error_rate) * 100)}% reliability
              </span>
              <span className="flex items-center gap-1">
                <Workflow className="h-3 w-3" />
                {chain.steps.length} steps
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link className="h-6 w-6 text-blue-600" />
            Cross-Module Automation Chains
          </h2>
          <p className="text-muted-foreground mt-1">
            Intelligent workflows that connect multiple modules for seamless automation
          </p>
        </div>
        <Button onClick={() => setCreateChainOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Chain
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Chains</p>
                <p className="text-2xl font-bold">{mockChains.length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((mockChains.reduce((sum, chain) => sum + chain.performance_metrics.completion_rate, 0) / mockChains.length) * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">2.3h</p>
                <p className="text-xs text-muted-foreground">per week</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chains List */}
      <div className="grid gap-6">
        {mockChains.map((chain) => (
          <ChainCard key={chain.id} chain={chain} />
        ))}
      </div>

      {/* Create Chain Dialog */}
      <Dialog open={createChainOpen} onOpenChange={setCreateChainOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Cross-Module Chain</DialogTitle>
            <DialogDescription>
              Design an automation workflow that connects multiple modules
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="chain-name">Chain Name</Label>
                <Input
                  id="chain-name"
                  placeholder="e.g., Goal-Task Integration"
                  value={chainName}
                  onChange={(e) => setChainName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="chain-description">Description</Label>
                <Textarea
                  id="chain-description"
                  placeholder="Describe what this automation chain will do..."
                  value={chainDescription}
                  onChange={(e) => setChainDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Select Modules to Connect</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose at least 2 modules to create a cross-module chain
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(moduleIcons).map(([module, Icon]) => {
                    const isSelected = selectedModules.includes(module);
                    const colorClass = moduleColors[module as keyof typeof moduleColors];

                    return (
                      <button
                        key={module}
                        type="button"
                        onClick={() => toggleModule(module)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium capitalize">{module}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateChainOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChain}
              disabled={!chainName.trim() || selectedModules.length < 2}
            >
              Create Chain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}