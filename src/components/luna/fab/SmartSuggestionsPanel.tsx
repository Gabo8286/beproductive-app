/**
 * Smart Suggestions Panel
 * Displays AI-powered navigation suggestions with contextual reasoning
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Clock,
  TrendingUp,
  X,
  ChevronRight,
  Lightbulb,
  Target,
  Calendar,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartNavigationSuggestions } from '@/hooks/useSmartNavigationSuggestions';
import { NavigationSuggestion } from '@/services/SmartNavigationSuggestionsService';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface SmartSuggestionsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  isVisible,
  onClose,
  className
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const {
    suggestions,
    isLoading,
    lastUpdated,
    refreshSuggestions,
    executeSuggestion,
    dismissSuggestion,
    getBehaviorAnalytics
  } = useSmartNavigationSuggestions();

  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get category icon
  const getCategoryIcon = (category: NavigationSuggestion['category']) => {
    switch (category) {
      case 'temporal': return <Clock size={16} className="text-blue-400" />;
      case 'behavioral': return <TrendingUp size={16} className="text-green-400" />;
      case 'contextual': return <Target size={16} className="text-purple-400" />;
      case 'workflow': return <BarChart3 size={16} className="text-orange-400" />;
      case 'predictive': return <Brain size={16} className="text-pink-400" />;
      default: return <Lightbulb size={16} className="text-yellow-400" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NavigationSuggestion['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-400 bg-red-500/10';
      case 'high': return 'border-orange-400 bg-orange-500/10';
      case 'medium': return 'border-blue-400 bg-blue-500/10';
      case 'low': return 'border-gray-400 bg-gray-500/10';
      default: return 'border-gray-400 bg-gray-500/10';
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: NavigationSuggestion) => {
    triggerHaptic('medium');
    executeSuggestion(suggestion);
    onClose();
  };

  // Handle dismiss
  const handleDismiss = (suggestionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    dismissSuggestion(suggestionId);
  };

  // Handle refresh
  const handleRefresh = () => {
    triggerHaptic('medium');
    refreshSuggestions();
  };

  // Render suggestion item
  const renderSuggestion = (suggestion: NavigationSuggestion, index: number) => (
    <motion.div
      key={suggestion.id}
      className={cn(
        'relative p-4 rounded-lg border cursor-pointer',
        'hover:shadow-md transition-all duration-200',
        'group overflow-hidden',
        getPriorityColor(suggestion.priority)
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={() => handleSuggestionClick(suggestion)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Dismiss button */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
        onClick={(e) => handleDismiss(suggestion.id, e)}
        aria-label="Dismiss suggestion"
      >
        <X size={14} className="text-gray-400" />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getCategoryIcon(suggestion.category)}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {suggestion.category}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">
            {Math.round(suggestion.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="text-white font-semibold mb-1 flex items-center">
          {suggestion.title}
          <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-white transition-colors" />
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {suggestion.description}
        </p>
      </div>

      {/* Reasoning */}
      <div className="text-xs text-gray-400 italic border-t border-white/10 pt-2">
        💡 {suggestion.reasoning}
      </div>

      {/* Priority indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-50" />
    </motion.div>
  );

  // Render analytics view
  const renderAnalytics = () => {
    const analytics = getBehaviorAnalytics();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
            <div className="text-2xl font-bold text-blue-400">
              {analytics.totalPatterns}
            </div>
            <div className="text-sm text-gray-300">Behavior Patterns</div>
          </div>

          <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30">
            <div className="text-lg font-bold text-green-400">
              {analytics.mostUsedHub ? analytics.mostUsedHub.split('-')[0] : 'N/A'}
            </div>
            <div className="text-sm text-gray-300">Most Used Hub</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
          <div className="text-sm text-gray-300 mb-2">Peak Hours</div>
          <div className="flex space-x-2">
            {analytics.peakHours.map(hour => (
              <span key={hour} className="px-2 py-1 bg-purple-400/30 rounded text-purple-300 text-xs">
                {hour}:00
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30">
          <div className="text-lg font-bold text-orange-400">
            {Math.round(analytics.averageSessionDuration / 1000 / 60)}m
          </div>
          <div className="text-sm text-gray-300">Avg. Session</div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed right-4 top-20 bottom-20 w-96 max-w-[90vw]',
              'bg-gray-900/95 backdrop-blur-md border border-white/20',
              'rounded-xl shadow-2xl z-[75] overflow-hidden',
              className
            )}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="text-purple-400" size={20} />
                  <h2 className="text-white font-semibold">Smart Suggestions</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Toggle Analytics"
                  >
                    <BarChart3 size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className={cn(
                      'p-1 hover:bg-white/10 rounded transition-all',
                      isLoading && 'animate-spin'
                    )}
                    disabled={isLoading}
                    title="Refresh Suggestions"
                  >
                    <RefreshCw size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                  )} />
                  <span>{isLoading ? 'Analyzing...' : 'Ready'}</span>
                </div>
                {lastUpdated && (
                  <span>
                    • Updated {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {showAnalytics ? (
                renderAnalytics()
              ) : (
                <div className="space-y-3">
                  {isLoading && suggestions.length === 0 ? (
                    <div className="flex items-center justify-center py-8 space-x-2">
                      <Brain className="animate-pulse text-purple-400" size={24} />
                      <span className="text-gray-400">Analyzing your context...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map(renderSuggestion)
                  ) : (
                    <div className="text-center py-8">
                      <Lightbulb className="mx-auto text-gray-500 mb-2" size={32} />
                      <p className="text-gray-400">No suggestions available right now.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Keep using the app to improve recommendations.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-xs text-gray-500 text-center">
              AI-powered contextual navigation • Privacy-first learning
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};