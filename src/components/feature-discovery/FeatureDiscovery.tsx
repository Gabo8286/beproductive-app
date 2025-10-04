import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  PlayCircle,
  CheckCircle,
  Clock,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Filter,
  X,
  ChevronRight,
  Lightbulb,
  Trophy,
  TrendingUp
} from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  benefits: string[];
  prerequisites?: string[];
  demoUrl?: string;
  videoUrl?: string;
  isNew?: boolean;
  isPremium?: boolean;
  completionRate?: number;
}

export type FeatureCategory =
  | 'productivity'
  | 'habits'
  | 'analytics'
  | 'collaboration'
  | 'automation'
  | 'customization';

export interface UserProgress {
  discoveredFeatures: string[];
  completedFeatures: string[];
  bookmarkedFeatures: string[];
  lastAccessedCategory?: FeatureCategory;
}

interface FeatureDiscoveryProps {
  onFeatureSelect?: (feature: Feature) => void;
  onClose?: () => void;
  userProgress?: UserProgress;
}

const FEATURE_DATA: Feature[] = [
  {
    id: 'task-management',
    title: 'Smart Task Management',
    description: 'Organize tasks with AI-powered prioritization and deadline tracking',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedTime: 10,
    benefits: ['Increased productivity', 'Better time management', 'Reduced stress'],
    demoUrl: '/demo/tasks',
    completionRate: 85
  },
  {
    id: 'habit-tracking',
    title: 'Habit Tracking & Analytics',
    description: 'Build lasting habits with visual progress tracking and insights',
    category: 'habits',
    difficulty: 'beginner',
    estimatedTime: 15,
    benefits: ['Consistent habit formation', 'Visual progress tracking', 'Behavioral insights'],
    demoUrl: '/demo/habits',
    completionRate: 92
  },
  {
    id: 'pomodoro-timer',
    title: 'Focus Sessions (Pomodoro)',
    description: 'Maximize focus with customizable work/break intervals',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedTime: 5,
    benefits: ['Enhanced focus', 'Improved time management', 'Reduced burnout'],
    demoUrl: '/demo/pomodoro',
    completionRate: 78
  },
  {
    id: 'goal-setting',
    title: 'SMART Goal Setting',
    description: 'Set and track meaningful goals with milestone breakdowns',
    category: 'productivity',
    difficulty: 'intermediate',
    estimatedTime: 20,
    benefits: ['Clear direction', 'Measurable progress', 'Achievement tracking'],
    prerequisites: ['task-management'],
    demoUrl: '/demo/goals',
    completionRate: 73
  },
  {
    id: 'analytics-dashboard',
    title: 'Productivity Analytics',
    description: 'Gain insights into your productivity patterns and trends',
    category: 'analytics',
    difficulty: 'intermediate',
    estimatedTime: 25,
    benefits: ['Data-driven insights', 'Performance optimization', 'Trend analysis'],
    prerequisites: ['task-management', 'habit-tracking'],
    demoUrl: '/demo/analytics',
    isPremium: true,
    completionRate: 67
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'Share goals and track team progress with real-time updates',
    category: 'collaboration',
    difficulty: 'advanced',
    estimatedTime: 30,
    benefits: ['Team alignment', 'Shared accountability', 'Collaborative planning'],
    prerequisites: ['goal-setting'],
    isPremium: true,
    completionRate: 45
  },
  {
    id: 'automation-workflows',
    title: 'Smart Automation',
    description: 'Automate routine tasks and trigger actions based on conditions',
    category: 'automation',
    difficulty: 'advanced',
    estimatedTime: 45,
    benefits: ['Time savings', 'Reduced manual work', 'Consistent execution'],
    prerequisites: ['task-management', 'goal-setting'],
    isPremium: true,
    isNew: true,
    completionRate: 38
  },
  {
    id: 'custom-themes',
    title: 'Custom Themes & Layouts',
    description: 'Personalize your workspace with custom themes and layouts',
    category: 'customization',
    difficulty: 'beginner',
    estimatedTime: 10,
    benefits: ['Personalized experience', 'Visual appeal', 'Improved focus'],
    demoUrl: '/demo/themes',
    completionRate: 89
  }
];

const CATEGORY_INFO = {
  productivity: {
    icon: Target,
    color: 'bg-blue-500',
    description: 'Core features to boost your daily productivity'
  },
  habits: {
    icon: TrendingUp,
    color: 'bg-green-500',
    description: 'Build and maintain positive habits'
  },
  analytics: {
    icon: BarChart3,
    color: 'bg-purple-500',
    description: 'Insights and data visualization tools'
  },
  collaboration: {
    icon: Trophy,
    color: 'bg-orange-500',
    description: 'Work together and share progress'
  },
  automation: {
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Automate workflows and save time'
  },
  customization: {
    icon: Lightbulb,
    color: 'bg-pink-500',
    description: 'Personalize your experience'
  }
};

export const FeatureDiscovery: React.FC<FeatureDiscoveryProps> = ({
  onFeatureSelect,
  onClose,
  userProgress = {
    discoveredFeatures: [],
    completedFeatures: [],
    bookmarkedFeatures: []
  }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedFeatures, setBookmarkedFeatures] = useState<string[]>(
    userProgress.bookmarkedFeatures
  );

  const filteredFeatures = FEATURE_DATA.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || feature.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleBookmark = (featureId: string) => {
    setBookmarkedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const getFeatureStatus = (feature: Feature) => {
    if (userProgress.completedFeatures.includes(feature.id)) return 'completed';
    if (userProgress.discoveredFeatures.includes(feature.id)) return 'discovered';
    return 'new';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Object.keys(CATEGORY_INFO) as FeatureCategory[];
  const completionStats = {
    total: FEATURE_DATA.length,
    completed: userProgress.completedFeatures.length,
    discovered: userProgress.discoveredFeatures.length
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Feature Discovery</h2>
              <p className="text-gray-600">Explore and learn about all available features</p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completionStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completionStats.discovered}</div>
              <div className="text-sm text-gray-600">Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{completionStats.total}</div>
              <div className="text-sm text-gray-600">Total Features</div>
            </div>
          </div>

          <Progress
            value={(completionStats.completed / completionStats.total) * 100}
            className="h-2"
          />
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Badge>
            {categories.map(category => {
              const info = CATEGORY_INFO[category];
              const Icon = info.icon;
              return (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'secondary'}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setSelectedCategory(category)}
                >
                  <Icon className="h-3 w-3" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              );
            })}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4"
              >
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="border rounded-md px-3 py-2"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map(feature => {
              const status = getFeatureStatus(feature);
              const isBookmarked = bookmarkedFeatures.includes(feature.id);
              const categoryInfo = CATEGORY_INFO[feature.category];
              const CategoryIcon = categoryInfo.icon;

              return (
                <motion.div
                  key={feature.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer relative">
                    {feature.isNew && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        New
                      </Badge>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${categoryInfo.color} text-white`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-lg leading-tight">
                              {feature.title}
                              {feature.isPremium && (
                                <Star className="inline-block h-4 w-4 text-yellow-500 ml-1" />
                              )}
                            </CardTitle>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(feature.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star
                            className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                          />
                        </Button>
                      </div>

                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className={getDifficultyColor(feature.difficulty)}
                        >
                          {feature.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {feature.estimatedTime}m
                        </Badge>
                        {status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>

                      {feature.completionRate && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Completion Rate</span>
                            <span>{feature.completionRate}%</span>
                          </div>
                          <Progress value={feature.completionRate} className="h-1" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Benefits:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {feature.benefits.slice(0, 2).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-green-500 rounded-full" />
                              {benefit}
                            </li>
                          ))}
                          {feature.benefits.length > 2 && (
                            <li className="text-gray-400">+{feature.benefits.length - 2} more</li>
                          )}
                        </ul>
                      </div>

                      {feature.prerequisites && feature.prerequisites.length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                          <div className="text-xs font-medium text-yellow-800">Prerequisites:</div>
                          <div className="text-xs text-yellow-700">
                            {feature.prerequisites.map(prereq =>
                              FEATURE_DATA.find(f => f.id === prereq)?.title
                            ).join(', ')}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {feature.demoUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => onFeatureSelect?.(feature)}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Try Demo
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onFeatureSelect?.(feature)}
                        >
                          Learn More
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};