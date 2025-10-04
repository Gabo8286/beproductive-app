import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  Play,
  Pause,
  Square,
  Target,
  TrendingUp,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Timer,
  Activity,
  Lightbulb,
  Settings
} from 'lucide-react';

// Types and Interfaces
export interface TimeEntry {
  id: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in milliseconds
  tags: string[];
  category: 'deep_work' | 'meetings' | 'admin' | 'break' | 'planning' | 'communication';
  productivity_score: number; // 1-10
  focus_rating: number; // 1-10
  energy_level: number; // 1-10
  interruptions: number;
  mood: 'energetic' | 'focused' | 'neutral' | 'tired' | 'stressed';
  notes?: string;
  ai_insights?: string[];
}

export interface TimeEstimate {
  id: string;
  taskId: string;
  estimated_duration: number; // in milliseconds
  confidence_level: number; // 0-1
  factors: EstimationFactor[];
  historical_accuracy: number; // 0-1
  created_at: Date;
  updated_at: Date;
  ai_reasoning: string;
}

export interface EstimationFactor {
  name: string;
  impact: 'increase' | 'decrease' | 'neutral';
  weight: number; // 0-1
  description: string;
}

export interface ProductivityPattern {
  time_of_day: string;
  avg_productivity: number;
  avg_focus: number;
  avg_energy: number;
  optimal_task_types: string[];
  suggested_duration: number;
}

export interface TimeTrackingAnalytics {
  total_tracked: number;
  avg_productivity: number;
  peak_hours: string[];
  productivity_trends: { date: string; score: number }[];
  category_breakdown: { category: string; duration: number; productivity: number }[];
  estimation_accuracy: number;
  improvement_suggestions: string[];
}

interface IntelligentTimeTrackerProps {
  userId: string;
  onTimeEntryCreated?: (entry: TimeEntry) => void;
  onEstimateGenerated?: (estimate: TimeEstimate) => void;
}

export const IntelligentTimeTracker: React.FC<IntelligentTimeTrackerProps> = ({
  userId,
  onTimeEntryCreated,
  onEstimateGenerated
}) => {
  // State Management
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry> | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TimeEntry['category']>('deep_work');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimates, setEstimates] = useState<TimeEstimate[]>([]);
  const [analytics, setAnalytics] = useState<TimeTrackingAnalytics | null>(null);
  const [patterns, setPatterns] = useState<ProductivityPattern[]>([]);
  const [estimationMode, setEstimationMode] = useState<'simple' | 'detailed'>('simple');
  const [taskToEstimate, setTaskToEstimate] = useState('');
  const [estimationFactors, setEstimationFactors] = useState<EstimationFactor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    entries: false,
    estimates: false,
    analytics: false,
    patterns: false
  });

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentEntry) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - new Date(currentEntry.startTime!).getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentEntry]);

  // Load Data Effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([
          loadTimeEntries(),
          loadEstimates(),
          loadAnalytics(),
          loadProductivityPatterns()
        ]);
      } catch (err) {
        setError('Failed to load time tracking data. Please try again.');
        console.error('Error loading time tracking data:', err);
      }
    };

    loadData();
  }, [userId]);

  // Data Loading Functions
  const loadTimeEntries = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockEntries: TimeEntry[] = [
      {
        id: 'entry_1',
        taskId: 'task_1',
        description: 'Frontend development - User authentication',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 1800000),
        duration: 1800000,
        tags: ['coding', 'frontend', 'auth'],
        category: 'deep_work',
        productivity_score: 8,
        focus_rating: 9,
        energy_level: 7,
        interruptions: 1,
        mood: 'focused',
        notes: 'Good flow state, minimal interruptions',
        ai_insights: ['Peak productivity detected', 'Optimal focus period']
      },
      {
        id: 'entry_2',
        description: 'Team standup meeting',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 6900000),
        duration: 300000,
        tags: ['meeting', 'standup'],
        category: 'meetings',
        productivity_score: 6,
        focus_rating: 7,
        energy_level: 8,
        interruptions: 0,
        mood: 'neutral'
      }
    ];
    setTimeEntries(mockEntries);
  }, []);

  const loadEstimates = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockEstimates: TimeEstimate[] = [
      {
        id: 'est_1',
        taskId: 'task_1',
        estimated_duration: 7200000, // 2 hours
        confidence_level: 0.85,
        factors: [
          { name: 'Task Complexity', impact: 'increase', weight: 0.3, description: 'High complexity backend integration' },
          { name: 'Similar Experience', impact: 'decrease', weight: 0.2, description: 'Previous auth implementations' },
          { name: 'Current Energy', impact: 'neutral', weight: 0.1, description: 'Moderate energy level' }
        ],
        historical_accuracy: 0.78,
        created_at: new Date(),
        updated_at: new Date(),
        ai_reasoning: 'Based on similar tasks and current productivity patterns, estimated 2 hours with high confidence.'
      }
    ];
    setEstimates(mockEstimates);
  }, []);

  const loadAnalytics = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockAnalytics: TimeTrackingAnalytics = {
      total_tracked: 28800000, // 8 hours
      avg_productivity: 7.2,
      peak_hours: ['09:00-11:00', '14:00-16:00'],
      productivity_trends: [
        { date: '2024-01-01', score: 7.5 },
        { date: '2024-01-02', score: 8.2 },
        { date: '2024-01-03', score: 6.8 }
      ],
      category_breakdown: [
        { category: 'deep_work', duration: 18000000, productivity: 8.1 },
        { category: 'meetings', duration: 7200000, productivity: 6.5 },
        { category: 'admin', duration: 3600000, productivity: 5.8 }
      ],
      estimation_accuracy: 0.82,
      improvement_suggestions: [
        'Schedule deep work during peak hours (9-11 AM)',
        'Limit meetings to 30 minutes when possible',
        'Take breaks every 90 minutes for sustained focus'
      ]
    };
    setAnalytics(mockAnalytics);
  }, []);

  const loadProductivityPatterns = useCallback(async () => {
    // Mock data - replace with actual API call
    const mockPatterns: ProductivityPattern[] = [
      {
        time_of_day: '09:00-11:00',
        avg_productivity: 8.5,
        avg_focus: 9.0,
        avg_energy: 8.2,
        optimal_task_types: ['deep_work', 'complex_analysis'],
        suggested_duration: 5400000 // 90 minutes
      },
      {
        time_of_day: '14:00-16:00',
        avg_productivity: 7.8,
        avg_focus: 7.5,
        avg_energy: 7.0,
        optimal_task_types: ['meetings', 'communication'],
        suggested_duration: 3600000 // 60 minutes
      }
    ];
    setPatterns(mockPatterns);
  }, []);

  // Time Tracking Functions
  const startTracking = () => {
    if (!currentTask.trim()) return;

    const entry: Partial<TimeEntry> = {
      id: `entry_${Date.now()}`,
      description: currentTask,
      startTime: new Date(),
      tags: currentTags,
      category: selectedCategory,
      interruptions: 0
    };

    setCurrentEntry(entry);
    setIsTracking(true);
    setElapsedTime(0);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const resumeTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (!currentEntry) return;

    const completedEntry: TimeEntry = {
      ...currentEntry,
      id: currentEntry.id!,
      description: currentEntry.description!,
      startTime: currentEntry.startTime!,
      endTime: new Date(),
      duration: elapsedTime,
      tags: currentEntry.tags!,
      category: currentEntry.category!,
      productivity_score: 7, // This would be collected via UI
      focus_rating: 8,
      energy_level: 7,
      interruptions: currentEntry.interruptions!,
      mood: 'focused'
    };

    setTimeEntries(prev => [completedEntry, ...prev]);
    setCurrentEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setCurrentTask('');
    setCurrentTags([]);

    onTimeEntryCreated?.(completedEntry);
  };

  // Estimation Functions
  const generateEstimate = async () => {
    if (!taskToEstimate.trim()) return;

    // AI-powered estimation logic
    const baseEstimate = 3600000; // 1 hour base
    const complexityFactor = Math.random() * 0.5 + 0.75; // 0.75-1.25
    const experienceFactor = Math.random() * 0.3 + 0.85; // 0.85-1.15

    const estimatedDuration = baseEstimate * complexityFactor * experienceFactor;
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0

    const factors: EstimationFactor[] = [
      {
        name: 'Task Complexity',
        impact: complexityFactor > 1 ? 'increase' : 'decrease',
        weight: 0.4,
        description: 'Analyzed based on task description and requirements'
      },
      {
        name: 'Historical Performance',
        impact: experienceFactor < 1 ? 'decrease' : 'increase',
        weight: 0.3,
        description: 'Based on similar tasks completed previously'
      },
      {
        name: 'Current Productivity',
        impact: 'neutral',
        weight: 0.2,
        description: 'Current energy and focus levels'
      }
    ];

    const estimate: TimeEstimate = {
      id: `est_${Date.now()}`,
      taskId: `task_${Date.now()}`,
      estimated_duration: estimatedDuration,
      confidence_level: confidence,
      factors,
      historical_accuracy: 0.82,
      created_at: new Date(),
      updated_at: new Date(),
      ai_reasoning: `Estimated ${Math.round(estimatedDuration / 60000)} minutes based on task complexity analysis and historical performance patterns.`
    };

    setEstimates(prev => [estimate, ...prev]);
    onEstimateGenerated?.(estimate);
    setTaskToEstimate('');
  };

  // Utility Functions
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setCurrentTags(prev => prev.filter(t => t !== tag));
  };

  const getCurrentProductivityTip = (): string => {
    const currentHour = new Date().getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00-${(currentHour + 1).toString().padStart(2, '0')}:00`;

    const pattern = patterns.find(p => p.time_of_day.includes(currentHour.toString()));
    if (pattern) {
      return `Optimal time for ${pattern.optimal_task_types.join(', ')}. Average productivity: ${pattern.avg_productivity}/10`;
    }
    return 'Track your time to discover your productivity patterns!';
  };

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Intelligent Time Tracker</h2>
            <p className="text-muted-foreground">
              AI-powered time tracking with smart estimations and productivity insights
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intelligent Time Tracker</h2>
          <p className="text-muted-foreground">
            AI-powered time tracking with smart estimations and productivity insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Brain className="h-3 w-3" />
            <span>AI Enhanced</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tracker" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracker" className="flex items-center space-x-2">
            <Timer className="h-4 w-4" />
            <span>Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="estimates" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Estimates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Patterns</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-6">
          {/* Active Timer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Active Timer</span>
              </CardTitle>
              <CardDescription>
                {getCurrentProductivityTip()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-mono font-bold">
                  {formatDuration(elapsedTime)}
                </div>
                {isTracking && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-3 w-3 bg-red-500 rounded-full"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  disabled={isTracking}
                />

                <div className="flex flex-wrap gap-2">
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TimeEntry['category'])}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deep_work">Deep Work</SelectItem>
                      <SelectItem value="meetings">Meetings</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="w-32"
                    />
                    <Button size="sm" onClick={addTag}>Add</Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {currentTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  {!isTracking ? (
                    <Button onClick={startTracking} disabled={!currentTask.trim()}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={pauseTracking}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button variant="destructive" onClick={stopTracking}>
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.slice(0, 5).map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.startTime.toLocaleTimeString()} - {entry.endTime?.toLocaleTimeString()}
                      </div>
                      <div className="flex space-x-1 mt-1">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{formatDuration(entry.duration)}</div>
                      <div className="flex items-center space-x-1 text-sm">
                        <div className="flex space-x-1">
                          <span className="text-green-600">P: {entry.productivity_score}/10</span>
                          <span className="text-blue-600">F: {entry.focus_rating}/10</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimates" className="space-y-6">
          {/* Estimation Tool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>AI Time Estimation</span>
              </CardTitle>
              <CardDescription>
                Get intelligent time estimates based on task analysis and historical data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Describe the task you want to estimate"
                  value={taskToEstimate}
                  onChange={(e) => setTaskToEstimate(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={generateEstimate} disabled={!taskToEstimate.trim()}>
                  <Brain className="h-4 w-4 mr-2" />
                  Estimate
                </Button>
              </div>

              <Select value={estimationMode} onValueChange={(value) => setEstimationMode(value as 'simple' | 'detailed')}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Estimation</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Recent Estimates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estimates.map(estimate => (
                  <motion.div
                    key={estimate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Task Estimation</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {Math.round(estimate.confidence_level * 100)}% confidence
                        </Badge>
                        <div className="text-2xl font-mono">
                          {formatDuration(estimate.estimated_duration)}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {estimate.ai_reasoning}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Estimation Factors:</div>
                      {estimate.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{factor.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              factor.impact === 'increase' ? 'destructive' :
                              factor.impact === 'decrease' ? 'default' : 'secondary'
                            }>
                              {factor.impact}
                            </Badge>
                            <span className="text-muted-foreground">
                              Weight: {Math.round(factor.weight * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Historical Accuracy: {Math.round(estimate.historical_accuracy * 100)}%</span>
                      <span>Created: {estimate.created_at.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(analytics.total_tracked)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.avg_productivity.toFixed(1)}/10</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estimation Accuracy</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(analytics.estimation_accuracy * 100)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{analytics.peak_hours.join(', ')}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.category_breakdown.map(category => {
                      const percentage = (category.duration / analytics.total_tracked) * 100;
                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="capitalize">{category.category.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(category.duration)}
                              </span>
                              <Badge variant="outline">
                                {category.productivity.toFixed(1)}/10
                              </Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>AI Improvement Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.improvement_suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{suggestion}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Productivity Patterns</span>
              </CardTitle>
              <CardDescription>
                Discover when you're most productive and optimize your schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-medium">{pattern.time_of_day}</div>
                      <Badge variant="outline">
                        {formatDuration(pattern.suggested_duration)} optimal
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {pattern.avg_productivity.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Productivity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {pattern.avg_focus.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Focus</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {pattern.avg_energy.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Energy</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Optimal for:</div>
                      <div className="flex flex-wrap gap-1">
                        {pattern.optimal_task_types.map(type => (
                          <Badge key={type} variant="secondary">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentTimeTracker;