import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Share2,
  Star,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Plus,
  Send
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { cn } from '@/lib/utils';

interface DailyReflectionForm {
  whatWentWell: string;
  whatCouldImprove: string;
  insights: string;
  tomorrowPriorities: string[];
  energyLevel: 'low' | 'medium' | 'high';
  overallSatisfaction: number; // 1-5 rating
}

interface CollaborationActivity {
  id: string;
  type: 'meeting' | 'review' | 'feedback' | 'update';
  title: string;
  participants: string[];
  duration: number;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueTime?: string;
}

export const EngageAndControlView: React.FC = () => {
  const { state, completeEngage, addReflection } = useProductivityCycle();

  const [reflectionForm, setReflectionForm] = useState<DailyReflectionForm>({
    whatWentWell: '',
    whatCouldImprove: '',
    insights: '',
    tomorrowPriorities: [],
    energyLevel: 'medium',
    overallSatisfaction: 4,
  });

  const [newPriority, setNewPriority] = useState('');
  const [currentView, setCurrentView] = useState<'reflection' | 'collaboration' | 'summary'>('reflection');

  // Mock collaboration activities - in real app, this would come from calendar/meeting data
  const [collaborationActivities, setCollaborationActivities] = useState<CollaborationActivity[]>([
    {
      id: '1',
      type: 'meeting',
      title: 'Daily Standup',
      participants: ['Team Lead', 'Designer', 'QA'],
      duration: 15,
      status: 'completed',
      priority: 'medium',
      dueTime: '09:00',
    },
    {
      id: '2',
      type: 'review',
      title: 'Code Review - Feature X',
      participants: ['Senior Dev'],
      duration: 30,
      status: 'pending',
      priority: 'high',
      dueTime: '14:00',
    },
    {
      id: '3',
      type: 'feedback',
      title: 'Weekly One-on-One',
      participants: ['Manager'],
      duration: 30,
      status: 'pending',
      priority: 'medium',
      dueTime: '16:00',
    },
  ]);

  // Calculate today's performance metrics
  const completedTasks = state.dailyGoals.length; // This would track actual completions
  const totalEstimatedTime = state.dailyGoals.reduce((acc, goal) => acc + goal.estimated_time, 0);
  const completedActivities = collaborationActivities.filter(a => a.status === 'completed').length;
  const totalActivities = collaborationActivities.length;

  const performanceScore = Math.round((completedTasks / Math.max(state.dailyGoals.length, 1)) * 100);

  const handleAddPriority = () => {
    if (newPriority.trim()) {
      setReflectionForm(prev => ({
        ...prev,
        tomorrowPriorities: [...prev.tomorrowPriorities, newPriority.trim()]
      }));
      setNewPriority('');
    }
  };

  const handleRemovePriority = (index: number) => {
    setReflectionForm(prev => ({
      ...prev,
      tomorrowPriorities: prev.tomorrowPriorities.filter((_, i) => i !== index)
    }));
  };

  const handleCompleteActivity = (activityId: string) => {
    setCollaborationActivities(prev => prev.map(activity =>
      activity.id === activityId
        ? { ...activity, status: 'completed' as const }
        : activity
    ));
  };

  const handleCompleteEngagement = () => {
    const reflection = {
      id: Date.now().toString(),
      date: state.currentDate,
      completedTasks,
      plannedTasks: state.dailyGoals.length,
      timeAccuracy: 85, // This would be calculated from actual vs estimated times
      energyLevel: reflectionForm.energyLevel,
      whatWentWell: reflectionForm.whatWentWell,
      whatCouldImprove: reflectionForm.whatCouldImprove,
      insights: reflectionForm.insights,
      tomorrowPriorities: reflectionForm.tomorrowPriorities,
      created_at: new Date().toISOString(),
    };

    addReflection(reflection);
    completeEngage(reflection);
  };

  const getViewProgress = () => {
    switch (currentView) {
      case 'reflection':
        return 33;
      case 'collaboration':
        return 66;
      case 'summary':
        return 100;
      default:
        return 0;
    }
  };

  const getActivityIcon = (type: CollaborationActivity['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'review':
        return <CheckCircle className="h-4 w-4" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4" />;
      case 'update':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getActivityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Engage & Control</h1>
        <p className="text-muted-foreground">
          Reflect on progress and collaborate with your team
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Engagement Progress</span>
            <span className="text-sm text-muted-foreground">{getViewProgress()}%</span>
          </div>
          <Progress value={getViewProgress()} className="h-2" />
          <div className="flex justify-between mt-2">
            <Button
              variant={currentView === 'reflection' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('reflection')}
            >
              🤔 Reflect
            </Button>
            <Button
              variant={currentView === 'collaboration' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('collaboration')}
            >
              👥 Collaborate
            </Button>
            <Button
              variant={currentView === 'summary' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('summary')}
            >
              📊 Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks</p>
                <p className="text-2xl font-bold">{completedTasks}/{state.dailyGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Time Planned</p>
                <p className="text-2xl font-bold">{Math.round(totalEstimatedTime / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Collaboration</p>
                <p className="text-2xl font-bold">{completedActivities}/{totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">{performanceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reflection Phase */}
      {currentView === 'reflection' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Reflection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Daily Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What went well today?</label>
                <Textarea
                  placeholder="Celebrate your wins, big and small..."
                  value={reflectionForm.whatWentWell}
                  onChange={(e) => setReflectionForm(prev => ({ ...prev, whatWentWell: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">What could be improved?</label>
                <Textarea
                  placeholder="Identify areas for growth..."
                  value={reflectionForm.whatCouldImprove}
                  onChange={(e) => setReflectionForm(prev => ({ ...prev, whatCouldImprove: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Key insights</label>
                <Textarea
                  placeholder="What did you learn? Any patterns you noticed?"
                  value={reflectionForm.insights}
                  onChange={(e) => setReflectionForm(prev => ({ ...prev, insights: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Energy Level</label>
                  <Select
                    value={reflectionForm.energyLevel}
                    onValueChange={(value: any) => setReflectionForm(prev => ({ ...prev, energyLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔋 Low Energy</SelectItem>
                      <SelectItem value="medium">⚡ Medium Energy</SelectItem>
                      <SelectItem value="high">🚀 High Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Satisfaction (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={reflectionForm.overallSatisfaction >= rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReflectionForm(prev => ({ ...prev, overallSatisfaction: rating }))}
                        className="w-10 h-10 p-0"
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          reflectionForm.overallSatisfaction >= rating ? "fill-current" : ""
                        )} />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tomorrow's Priorities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tomorrow's Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add priority for tomorrow..."
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPriority()}
                />
                <Button onClick={handleAddPriority} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {reflectionForm.tomorrowPriorities.map((priority, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                    <span className="text-sm">{priority}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePriority(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              {reflectionForm.tomorrowPriorities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add priorities for tomorrow to stay focused</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collaboration Phase */}
      {currentView === 'collaboration' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Collaboration Activities</h3>
            <p className="text-muted-foreground">Connect with team members and stakeholders</p>
          </div>

          <div className="grid gap-4">
            {collaborationActivities.map((activity) => (
              <Card key={activity.id} className={cn("transition-all", getActivityColor(activity.priority))}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        activity.status === 'completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{activity.participants.join(', ')}</span>
                          <span>{activity.duration}min</span>
                          {activity.dueTime && <span>{activity.dueTime}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.priority === 'high' ? 'destructive' : 'secondary'}>
                        {activity.priority}
                      </Badge>
                      {activity.status === 'pending' ? (
                        <Button
                          onClick={() => handleCompleteActivity(activity.id)}
                          size="sm"
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ✓ Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {collaborationActivities.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No collaboration activities scheduled for today</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Phase */}
      {currentView === 'summary' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Accomplishments</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tasks Completed</span>
                      <span className="font-medium">{completedTasks}/{state.dailyGoals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collaboration Activities</span>
                      <span className="font-medium">{completedActivities}/{totalActivities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance Score</span>
                      <span className="font-medium">{performanceScore}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Tomorrow's Focus</h4>
                  <div className="space-y-1">
                    {reflectionForm.tomorrowPriorities.slice(0, 3).map((priority, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {index + 1}. {priority}
                      </div>
                    ))}
                    {reflectionForm.tomorrowPriorities.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No priorities set yet</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {reflectionForm.whatWentWell && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">✅ What Went Well</h4>
                    <p className="text-sm text-muted-foreground">{reflectionForm.whatWentWell}</p>
                  </div>
                )}

                {reflectionForm.whatCouldImprove && (
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">🔄 Areas for Improvement</h4>
                    <p className="text-sm text-muted-foreground">{reflectionForm.whatCouldImprove}</p>
                  </div>
                )}

                {reflectionForm.insights && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">💡 Key Insights</h4>
                    <p className="text-sm text-muted-foreground">{reflectionForm.insights}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleCompleteEngagement}
              size="lg"
              className="gap-2"
              disabled={!reflectionForm.whatWentWell || !reflectionForm.whatCouldImprove}
            >
              <CheckCircle className="h-5 w-5" />
              Complete Day & Start Tomorrow
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Complete reflection to proceed to tomorrow's cycle
            </p>
          </div>
        </div>
      )}
    </div>
  );
};