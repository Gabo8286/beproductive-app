import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps, LunaAction } from '@/components/luna/actionsheets/types';

interface MenuLevel {
  id: string;
  title: string;
  actions: LunaAction[];
  parentId?: string;
}

export const MultiLevelActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const [currentLevelId, setCurrentLevelId] = useState<string>('root');
  const [levelHistory, setLevelHistory] = useState<string[]>(['root']);

  // Create hierarchical structure based on action categories and priority
  const createMenuLevels = (): Record<string, MenuLevel> => {
    const levels: Record<string, MenuLevel> = {
      root: {
        id: 'root',
        title: 'Quick Actions',
        actions: []
      }
    };

    // Group actions by category
    const categorizedActions = actions.reduce((acc, action) => {
      const category = action.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {} as Record<string, LunaAction[]>);

    // Create category levels
    Object.entries(categorizedActions).forEach(([category, categoryActions]) => {
      const categoryConfig = {
        capture: { label: 'Capture & Create', icon: '📝' },
        communication: { label: 'Communication', icon: '💬' },
        productivity: { label: 'Productivity', icon: '⚡' },
        insights: { label: 'Insights & Analytics', icon: '📊' },
        general: { label: 'General Actions', icon: '🚀' }
      };

      const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general;

      // Create main category action
      levels.root.actions.push({
        id: `nav-${category}`,
        label: config.label,
        icon: () => <span className="text-lg">{config.icon}</span>,
        description: `${categoryActions.length} actions available`,
        action: () => navigateToLevel(category),
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        category: 'navigation'
      });

      // Create sub-level for category
      levels[category] = {
        id: category,
        title: config.label,
        actions: categoryActions,
        parentId: 'root'
      };

      // Create sub-levels for high-priority actions
      const highPriorityActions = categoryActions.filter(action => action.priority === 'high');
      if (highPriorityActions.length > 0) {
        const quickId = `${category}-quick`;
        levels.root.actions.push({
          id: `nav-${quickId}`,
          label: `Quick ${config.label}`,
          icon: () => <span className="text-lg">⚡</span>,
          description: 'Most used actions',
          action: () => navigateToLevel(quickId),
          color: 'bg-gradient-to-r from-blue-500 to-blue-600',
          category: 'navigation'
        });

        levels[quickId] = {
          id: quickId,
          title: `Quick ${config.label}`,
          actions: highPriorityActions,
          parentId: 'root'
        };
      }
    });

    return levels;
  };

  const menuLevels = createMenuLevels();
  const currentLevel = menuLevels[currentLevelId] || menuLevels.root;

  const navigateToLevel = (levelId: string) => {
    buttonPress();
    setCurrentLevelId(levelId);
    setLevelHistory(prev => [...prev, levelId]);
  };

  const navigateBack = () => {
    buttonPress();
    if (levelHistory.length > 1) {
      const newHistory = levelHistory.slice(0, -1);
      setLevelHistory(newHistory);
      setCurrentLevelId(newHistory[newHistory.length - 1]);
    }
  };

  const handleActionClick = (action: LunaAction) => {
    buttonPress();
    if (action.category === 'navigation') {
      action.action();
    } else {
      action.action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Multi-Level Panel */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-24 left-4 right-4 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border z-50 max-w-md mx-auto max-h-[70vh] overflow-hidden',
          className
        )}
      >
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between p-4 border-b bg-background/50">
          <div className="flex items-center gap-3 flex-1">
            <LunaAvatar size="medium" expression="happy" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {levelHistory.length > 1 && (
                  <button
                    onClick={navigateBack}
                    className="p-1 rounded hover:bg-accent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {currentLevel.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {levelHistory.map((levelId, index) => (
                      <React.Fragment key={levelId}>
                        {index > 0 && <ChevronRight className="w-3 h-3" />}
                        <span>
                          {menuLevels[levelId]?.title || 'Unknown'}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevelId}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <div className="space-y-2">
                {currentLevel.actions.map((action, index) => {
                  const Icon = action.icon;
                  const isNavigation = action.category === 'navigation';

                  return (
                    <motion.button
                      key={action.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        'w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200',
                        isNavigation
                          ? 'hover:bg-gradient-to-r hover:from-accent to-accent/50 border border-accent/20'
                          : 'hover:bg-accent'
                      )}
                    >
                      <div className={cn('p-3 rounded-xl flex-shrink-0', action.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground flex items-center gap-2">
                          {action.label}
                          {isNavigation && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </p>
                        {action.description && (
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-accent/10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Level {levelHistory.length} of {Object.keys(menuLevels).length}</span>
            <span>💡 Navigate through organized action hierarchies</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};