import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Target,
  Calendar,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  PlusCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useLuna } from '@/components/luna/context/LunaContext';
import { useNavigate } from 'react-router-dom';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: () => void;
  color: string;
  gradient: string;
}

interface InsightCard {
  id: string;
  type: 'productivity' | 'habit' | 'goal' | 'suggestion';
  title: string;
  content: string;
  action?: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export default function LunaHub() {
  const navigate = useNavigate();
  const { buttonPress } = useHapticFeedback();
  const { openChat, openQuickCapture } = useLuna();
  const [selectedInsight, setSelectedInsight] = useState<InsightCard | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'quick-capture',
      icon: PlusCircle,
      title: 'Quick Capture',
      description: 'Add tasks, notes, or ideas instantly',
      action: openQuickCapture,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'ai-chat',
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Start a conversation with Luna',
      action: openChat,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'plan-day',
      icon: Calendar,
      title: 'Plan Today',
      description: 'Get AI assistance for daily planning',
      action: () => navigate('/app/plan'),
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'review-goals',
      icon: Target,
      title: 'Goal Review',
      description: 'Check progress on your objectives',
      action: () => navigate('/goals'),
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const recentInsights: InsightCard[] = [
    {
      id: '1',
      type: 'productivity',
      title: 'Peak Productivity Hours',
      content: 'You\'re most productive between 9-11 AM. Consider scheduling important tasks during this window.',
      action: 'Optimize Schedule',
      timestamp: '2 hours ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'habit',
      title: 'Habit Streak Alert',
      content: 'Your meditation streak is at 12 days! Keep it going to build a strong habit.',
      action: 'Log Today',
      timestamp: '4 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'goal',
      title: 'Goal Progress Update',
      content: 'You\'re 75% complete with your "Learn React" goal. Great progress!',
      action: 'View Details',
      timestamp: '1 day ago',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'suggestion',
      title: 'Smart Suggestion',
      content: 'Based on your patterns, consider batching similar tasks on Mondays for better efficiency.',
      action: 'Apply Suggestion',
      timestamp: '2 days ago',
      priority: 'low'
    }
  ];

  const stats = [
    { label: 'Tasks Completed', value: '24', change: '+12%', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Goals Active', value: '8', change: '+2', icon: Target, color: 'text-blue-600' },
    { label: 'Productivity Score', value: '87%', change: '+5%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Focus Time', value: '4.2h', change: '+30m', icon: Clock, color: 'text-orange-600' }
  ];

  const handleActionClick = (action: QuickAction) => {
    buttonPress();
    action.action();
  };

  const handleInsightClick = (insight: InsightCard) => {
    buttonPress();
    setSelectedInsight(insight);
  };

  const getInsightIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'productivity': return BarChart3;
      case 'habit': return Zap;
      case 'goal': return Target;
      case 'suggestion': return Lightbulb;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: InsightCard['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'low': return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-lg"
        >
          <LunaAvatar size="large" expression="happy" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Luna Hub</h1>
          <p className="text-muted-foreground">Your AI-powered productivity companion</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleActionClick(action)}
                className="group relative overflow-hidden rounded-xl bg-card p-4 shadow-sm border hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn('p-3 rounded-xl bg-gradient-to-br', action.gradient)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 border"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn('w-5 h-5', stat.color)} />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* AI Insights */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentInsights.slice(0, 3).map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleInsightClick(insight)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
                  getPriorityColor(insight.priority)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{insight.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                      {insight.action && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <span>{insight.action}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedInsight(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 bg-card rounded-2xl p-6 shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {React.createElement(getInsightIcon(selectedInsight.type), {
                    className: 'w-6 h-6 text-primary'
                  })}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedInsight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{selectedInsight.content}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="flex-1 px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors"
                  >
                    Dismiss
                  </button>
                  {selectedInsight.action && (
                    <button
                      onClick={() => {
                        setSelectedInsight(null);
                        // Handle action here
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {selectedInsight.action}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}