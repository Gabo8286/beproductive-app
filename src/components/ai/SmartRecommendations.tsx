import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sparkles,
  Clock,
  Target,
  Calendar,
  Zap,
  TrendingUp,
  Brain,
  ChevronRight,
  Star,
  BookOpen,
  Users,
  Settings,
  Lightbulb,
  CheckCircle,
  X,
  RotateCcw,
  Filter,
  BarChart3
} from 'lucide-react';

interface SmartRecommendation {
  id: string;
  type: 'task' | 'habit' | 'schedule' | 'workflow' | 'learning' | 'collaboration';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  impact: 'productivity' | 'wellbeing' | 'learning' | 'efficiency';
  estimatedBenefit: string;
  implementationTime: number; // minutes
  requiredActions: string[];
  relatedData: {
    tasks?: Array<{ id: string; title: string; status: string }>;
    habits?: Array<{ id: string; name: string; streak: number }>;
    patterns?: Array<{ type: string; description: string }>;
  };
  createdAt: Date;
  validUntil: Date;
  contextualFactors: string[];
}

interface RecommendationFilters {
  type: string;
  impact: string;
  priority: string;
  showImplemented: boolean;
}

interface SmartRecommendationsProps {
  userId: string;
  userContext: {
    currentTasks: Array<{ id: string; title: string; priority: string; category: string }>;
    recentHabits: Array<{ id: string; name: string; streak: number; consistency: number }>;
    productivityPatterns: Array<{ timeOfDay: string; efficiency: number }>;
    goals: Array<{ id: string; title: string; progress: number; deadline: Date }>;
  };
  onRecommendationImplemented?: (recommendationId: string) => void;
  onRecommendationDismissed?: (recommendationId: string) => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  userContext,
  onRecommendationImplemented,
  onRecommendationDismissed
}) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [implementedIds, setImplementedIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<RecommendationFilters>({
    type: 'all',
    impact: 'all',
    priority: 'all',
    showImplemented: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userId, userContext]);

  const generateRecommendations = async () => {
    setIsLoading(true);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const generatedRecommendations: SmartRecommendation[] = [
      {
        id: 'rec_task_optimization_1',
        type: 'task',
        title: 'Optimize High-Priority Task Scheduling',
        description: 'Schedule your most important tasks during your peak performance hours (9-11 AM)',
        reasoning: 'Analysis shows you complete 73% more high-priority tasks when scheduled during morning hours',
        confidence: 0.87,
        priority: 'high',
        impact: 'productivity',
        estimatedBenefit: '23% increase in task completion rate',
        implementationTime: 15,
        requiredActions: [
          'Review your calendar for 9-11 AM availability',
          'Move 3 high-priority tasks to morning slots',
          'Set recurring morning focus blocks'
        ],
        relatedData: {
          tasks: userContext.currentTasks.filter(t => t.priority === 'high').slice(0, 3).map(t => ({
            id: t.id,
            title: t.title,
            status: 'pending'
          })),
          patterns: [
            { type: 'peak_performance', description: 'Highest efficiency at 9-11 AM (78% completion rate)' },
            { type: 'task_completion', description: 'Morning tasks completed 23% faster' }
          ]
        },
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        contextualFactors: ['morning_productivity', 'task_priority_patterns', 'calendar_availability']
      },
      {
        id: 'rec_habit_stack_1',
        type: 'habit',
        title: 'Create a Morning Habit Stack',
        description: 'Link your existing meditation habit with a new exercise routine for better consistency',
        reasoning: 'Users who stack habits achieve 67% higher consistency rates than standalone habits',
        confidence: 0.82,
        priority: 'medium',
        impact: 'wellbeing',
        estimatedBenefit: 'Increase habit consistency by 40%',
        implementationTime: 20,
        requiredActions: [
          'Add 10-minute exercise after meditation',
          'Update habit tracker with the sequence',
          'Set unified reminder for the stack'
        ],
        relatedData: {
          habits: userContext.recentHabits.filter(h => h.name.includes('meditation')),
          patterns: [
            { type: 'habit_timing', description: 'Morning habits have 15% higher completion rate' },
            { type: 'habit_stacking', description: 'Linked habits show improved consistency' }
          ]
        },
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        contextualFactors: ['existing_habits', 'morning_routine', 'consistency_patterns']
      },
      {
        id: 'rec_workflow_automation_1',
        type: 'workflow',
        title: 'Automate Recurring Weekly Reviews',
        description: 'Set up automated weekly review templates to reduce planning overhead by 35%',
        reasoning: 'Your planning sessions take 45% longer when starting from scratch vs. using templates',
        confidence: 0.75,
        priority: 'medium',
        impact: 'efficiency',
        estimatedBenefit: '25 minutes saved per week',
        implementationTime: 30,
        requiredActions: [
          'Create weekly review template',
          'Set up automated reminder system',
          'Define review criteria checklist'
        ],
        relatedData: {
          patterns: [
            { type: 'planning_efficiency', description: 'Template-based reviews are 45% faster' },
            { type: 'review_consistency', description: 'Automated reminders improve review completion by 60%' }
          ]
        },
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contextualFactors: ['planning_patterns', 'time_investment', 'consistency_goals']
      },
      {
        id: 'rec_learning_path_1',
        type: 'learning',
        title: 'Skill Development: Time Management Mastery',
        description: 'Based on your productivity patterns, focus on advanced time-blocking techniques',
        reasoning: 'Users with similar patterns who learned time-blocking improved productivity by 31%',
        confidence: 0.79,
        priority: 'medium',
        impact: 'learning',
        estimatedBenefit: 'Potential 30% productivity increase',
        implementationTime: 45,
        requiredActions: [
          'Complete time-blocking course module',
          'Practice technique for 1 week',
          'Implement advanced scheduling rules'
        ],
        relatedData: {
          patterns: [
            { type: 'learning_readiness', description: 'Optimal learning window detected' },
            { type: 'skill_gap', description: 'Time management identified as high-impact skill' }
          ]
        },
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        contextualFactors: ['skill_assessment', 'learning_capacity', 'productivity_goals']
      },
      {
        id: 'rec_collaboration_1',
        type: 'collaboration',
        title: 'Optimize Team Sync Meetings',
        description: 'Reduce meeting time by 30% using structured agendas and async updates',
        reasoning: 'Analysis shows your meetings run 40% longer than similar productive teams',
        confidence: 0.71,
        priority: 'low',
        impact: 'efficiency',
        estimatedBenefit: '90 minutes saved weekly',
        implementationTime: 25,
        requiredActions: [
          'Create meeting agenda template',
          'Implement async status updates',
          'Set up 25-minute meeting blocks'
        ],
        relatedData: {
          patterns: [
            { type: 'meeting_efficiency', description: 'Current meetings 40% longer than optimal' },
            { type: 'collaboration_style', description: 'High preference for structured communication' }
          ]
        },
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        contextualFactors: ['team_dynamics', 'meeting_patterns', 'communication_preferences']
      }
    ];

    setRecommendations(generatedRecommendations);
    setIsLoading(false);
  };

  const handleImplement = (recommendation: SmartRecommendation) => {
    setImplementedIds(prev => [...prev, recommendation.id]);
    onRecommendationImplemented?.(recommendation.id);
  };

  const handleDismiss = (recommendation: SmartRecommendation) => {
    setDismissedIds(prev => [...prev, recommendation.id]);
    onRecommendationDismissed?.(recommendation.id);
  };

  const getTypeIcon = (type: SmartRecommendation['type']) => {
    switch (type) {
      case 'task': return <Target className="h-5 w-5 text-blue-500" />;
      case 'habit': return <Calendar className="h-5 w-5 text-green-500" />;
      case 'schedule': return <Clock className="h-5 w-5 text-purple-500" />;
      case 'workflow': return <Zap className="h-5 w-5 text-orange-500" />;
      case 'learning': return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'collaboration': return <Users className="h-5 w-5 text-pink-500" />;
      default: return <Sparkles className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: SmartRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getImpactColor = (impact: SmartRecommendation['impact']) => {
    switch (impact) {
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'wellbeing': return 'bg-green-100 text-green-800';
      case 'learning': return 'bg-purple-100 text-purple-800';
      case 'efficiency': return 'bg-orange-100 text-orange-800';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (!filters.showImplemented && implementedIds.includes(rec.id)) return false;
    if (dismissedIds.includes(rec.id)) return false;
    if (filters.type !== 'all' && rec.type !== filters.type) return false;
    if (filters.impact !== 'all' && rec.impact !== filters.impact) return false;
    if (filters.priority !== 'all' && rec.priority !== filters.priority) return false;
    return true;
  });

  const implementedRecommendations = recommendations.filter(rec =>
    implementedIds.includes(rec.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-500" />
            Smart Recommendations
          </h2>
          <p className="text-gray-600">
            AI-powered suggestions personalized for your productivity patterns
          </p>
        </div>
        <Button onClick={generateRecommendations} disabled={isLoading}>
          <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredRecommendations.length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredRecommendations.filter(r => r.priority === 'high').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Implemented</p>
                <p className="text-2xl font-bold text-green-600">
                  {implementedRecommendations.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.length > 0
                    ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="habit">Habits</option>
                <option value="schedule">Schedule</option>
                <option value="workflow">Workflow</option>
                <option value="learning">Learning</option>
                <option value="collaboration">Collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select
                value={filters.impact}
                onChange={(e) => setFilters(prev => ({ ...prev, impact: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Impacts</option>
                <option value="productivity">Productivity</option>
                <option value="wellbeing">Wellbeing</option>
                <option value="learning">Learning</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.showImplemented}
                  onChange={(e) => setFilters(prev => ({ ...prev, showImplemented: e.target.checked }))}
                  className="rounded"
                />
                Show implemented
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-purple-500" />
            <p className="text-gray-600">Analyzing your patterns and generating recommendations...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recommendations available
                </h3>
                <p className="text-gray-600">
                  {filters.type !== 'all' || filters.impact !== 'all' || filters.priority !== 'all'
                    ? 'Try adjusting your filters to see more recommendations.'
                    : 'Continue using the app to generate personalized recommendations.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecommendations.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className={`hover:shadow-md transition-shadow ${
                  implementedIds.includes(recommendation.id) ? 'border-green-200 bg-green-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(recommendation.type)}
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {recommendation.title}
                            {implementedIds.includes(recommendation.id) && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {recommendation.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Reasoning & Confidence */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">AI Reasoning</span>
                          <Badge variant="outline" className="text-xs">
                            {(recommendation.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                      </div>

                      {/* Benefits & Implementation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Expected Benefit
                          </h4>
                          <p className="text-sm text-gray-700">{recommendation.estimatedBenefit}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            Implementation Time
                          </h4>
                          <p className="text-sm text-gray-700">{recommendation.implementationTime} minutes</p>
                        </div>
                      </div>

                      {/* Required Actions */}
                      <div>
                        <h4 className="font-medium mb-2">Required Actions</h4>
                        <div className="space-y-2">
                          {recommendation.requiredActions.map((action, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related Data */}
                      {(recommendation.relatedData.tasks || recommendation.relatedData.habits || recommendation.relatedData.patterns) && (
                        <div>
                          <h4 className="font-medium mb-2">Related Data</h4>
                          <div className="space-y-2">
                            {recommendation.relatedData.tasks?.map((task, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                                <Target className="h-4 w-4 text-blue-500" />
                                <span>{task.title}</span>
                                <Badge variant="outline" className="text-xs">{task.status}</Badge>
                              </div>
                            ))}
                            {recommendation.relatedData.habits?.map((habit, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span>{habit.name}</span>
                                <Badge variant="outline" className="text-xs">{habit.streak} day streak</Badge>
                              </div>
                            ))}
                            {recommendation.relatedData.patterns?.map((pattern, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded">
                                <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                                <div>
                                  <div className="font-medium">{pattern.type.replace('_', ' ')}</div>
                                  <div className="text-gray-600">{pattern.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contextual Factors */}
                      <div>
                        <h4 className="font-medium mb-2">Based On</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.contextualFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-gray-500">
                          Valid until {recommendation.validUntil.toLocaleDateString()}
                        </div>

                        {!implementedIds.includes(recommendation.id) && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismiss(recommendation)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleImplement(recommendation)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Implement
                            </Button>
                          </div>
                        )}

                        {implementedIds.includes(recommendation.id) && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Implemented
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};