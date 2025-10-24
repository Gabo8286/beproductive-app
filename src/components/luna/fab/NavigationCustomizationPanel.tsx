/**
 * Navigation Customization Panel
 * Advanced user interface for personalizing Luna orbital navigation
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Settings,
  Palette,
  Layout,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MonitorSpeaker,
  Smartphone,
  MousePointer,
  Keyboard,
  AccessibilityIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationPreferences } from '@/hooks/useEnhancedNavigationContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useScreenReader } from '@/hooks/useScreenReader';
import { NavigationHubId, NavigationPreferences } from '@/types/navigation';
import { navigationHubRegistry } from '@/services/NavigationHubRegistry';

interface NavigationCustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface CustomizationSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isExpanded: boolean;
}

export const NavigationCustomizationPanel: React.FC<NavigationCustomizationPanelProps> = ({
  isVisible,
  onClose,
  className
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { announce } = useScreenReader();
  const { preferences, updatePreferences, resetToDefaults } = useNavigationPreferences();

  // State for panel sections
  const [sections, setSections] = useState<CustomizationSection[]>([
    { id: 'layout', title: 'Layout & Ordering', icon: Layout, isExpanded: true },
    { id: 'appearance', title: 'Appearance & Themes', icon: Palette, isExpanded: false },
    { id: 'behavior', title: 'Behavior & Interactions', icon: Zap, isExpanded: false },
    { id: 'accessibility', title: 'Accessibility', icon: AccessibilityIcon, isExpanded: false },
    { id: 'performance', title: 'Performance & Preloading', icon: MonitorSpeaker, isExpanded: false },
  ]);

  const [tempPreferences, setTempPreferences] = useState<NavigationPreferences>(preferences);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get available hubs for ordering
  const availableHubs = navigationHubRegistry.getAllHubs();

  // Handle section toggle
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
    triggerHaptic('light');
  }, [triggerHaptic]);

  // Handle preference updates
  const handlePreferenceChange = useCallback((updates: Partial<NavigationPreferences>) => {
    setTempPreferences(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    triggerHaptic('light');
  }, [triggerHaptic]);

  // Handle hub order change
  const handleHubOrderChange = useCallback((newOrder: NavigationHubId[]) => {
    handlePreferenceChange({ hubOrder: newOrder });
  }, [handlePreferenceChange]);

  // Save preferences
  const handleSave = useCallback(() => {
    updatePreferences(tempPreferences);
    setHasUnsavedChanges(false);
    triggerHaptic('medium');
    announce('Navigation preferences saved successfully', { priority: 'polite' });
  }, [tempPreferences, updatePreferences, triggerHaptic, announce]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    resetToDefaults();
    setTempPreferences(preferences);
    setHasUnsavedChanges(false);
    triggerHaptic('medium');
    announce('Navigation preferences reset to defaults', { priority: 'polite' });
  }, [resetToDefaults, preferences, triggerHaptic, announce]);

  // Render hub ordering section
  const renderHubOrdering = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Drag to reorder navigation hubs. Your most important hubs should be at the top.
      </p>

      <Reorder.Group
        axis="y"
        values={tempPreferences.hubOrder}
        onReorder={handleHubOrderChange}
        className="space-y-2"
      >
        {tempPreferences.hubOrder.map((hubId) => {
          const hub = availableHubs.find(h => h.id === hubId);
          if (!hub) return null;

          const Icon = hub.icon;
          const isHidden = tempPreferences.hiddenHubs.includes(hubId);

          return (
            <Reorder.Item
              key={hubId}
              value={hubId}
              className={cn(
                'flex items-center p-3 rounded-lg border transition-all duration-200',
                'cursor-grab active:cursor-grabbing',
                isHidden
                  ? 'border-gray-600 bg-gray-800/50 opacity-50'
                  : 'border-gray-500 bg-gray-700/50 hover:bg-gray-600/50'
              )}
              whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
            >
              <GripVertical size={16} className="text-gray-400 mr-3" />
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mr-3', hub.color)}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{hub.name}</h4>
                <p className="text-xs text-gray-400">{hub.description}</p>
              </div>

              <button
                onClick={() => {
                  const newHiddenHubs = isHidden
                    ? tempPreferences.hiddenHubs.filter(id => id !== hubId)
                    : [...tempPreferences.hiddenHubs, hubId];
                  handlePreferenceChange({ hiddenHubs: newHiddenHubs });
                }}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isHidden ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-500'
                )}
                title={isHidden ? 'Show hub' : 'Hide hub'}
              >
                <Eye size={14} className={isHidden ? 'text-gray-300' : 'text-white'} />
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );

  // Render appearance settings
  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Animation Level</label>
        <div className="flex space-x-2">
          {(['none', 'reduced', 'full'] as const).map((level) => (
            <button
              key={level}
              onClick={() => handlePreferenceChange({ animationLevel: level })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                tempPreferences.animationLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-white">Haptic Feedback</label>
          <p className="text-xs text-gray-400">Physical feedback on interactions</p>
        </div>
        <button
          onClick={() => handlePreferenceChange({ hapticFeedback: !tempPreferences.hapticFeedback })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            tempPreferences.hapticFeedback ? 'bg-blue-600' : 'bg-gray-600'
          )}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
            animate={{ x: tempPreferences.hapticFeedback ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-white">Voice Commands</label>
          <p className="text-xs text-gray-400">Enable voice navigation</p>
        </div>
        <button
          onClick={() => handlePreferenceChange({ voiceCommands: !tempPreferences.voiceCommands })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            tempPreferences.voiceCommands ? 'bg-blue-600' : 'bg-gray-600'
          )}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
            animate={{ x: tempPreferences.voiceCommands ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );

  // Render behavior settings
  const renderBehaviorSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-white">Auto Context Switching</label>
          <p className="text-xs text-gray-400">Automatically change workflow based on context</p>
        </div>
        <button
          onClick={() => handlePreferenceChange({ autoContextSwitching: !tempPreferences.autoContextSwitching })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            tempPreferences.autoContextSwitching ? 'bg-blue-600' : 'bg-gray-600'
          )}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
            animate={{ x: tempPreferences.autoContextSwitching ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Favorite Quick Actions</label>
        <div className="flex flex-wrap gap-2">
          {['New Task', 'Quick Note', 'Start Focus', 'Schedule Meeting', 'Daily Review'].map((action) => {
            const isSelected = tempPreferences.favoriteQuickActions.includes(action);
            return (
              <button
                key={action}
                onClick={() => {
                  const newFavorites = isSelected
                    ? tempPreferences.favoriteQuickActions.filter(a => a !== action)
                    : [...tempPreferences.favoriteQuickActions, action];
                  handlePreferenceChange({ favoriteQuickActions: newFavorites });
                }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                {action}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Custom Keyboard Shortcuts</label>
        <div className="space-y-2">
          {Object.entries(tempPreferences.customShortcuts).map(([key, action]) => (
            <div key={key} className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-gray-800 rounded text-xs">{key}</code>
              <span className="text-sm text-gray-300">{action}</span>
            </div>
          ))}
          <button className="text-xs text-blue-400 hover:text-blue-300">
            + Add Custom Shortcut
          </button>
        </div>
      </div>
    </div>
  );

  // Render section content
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'layout':
        return renderHubOrdering();
      case 'appearance':
        return renderAppearanceSettings();
      case 'behavior':
        return renderBehaviorSettings();
      case 'accessibility':
        return (
          <div className="text-sm text-gray-400">
            Accessibility settings are automatically optimized based on your system preferences and usage patterns.
          </div>
        );
      case 'performance':
        return (
          <div className="text-sm text-gray-400">
            Performance settings are automatically managed based on your network conditions and device capabilities.
          </div>
        );
      default:
        return null;
    }
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
              'fixed left-4 top-4 bottom-4 w-96 max-w-[90vw]',
              'bg-gray-900/95 backdrop-blur-md border border-white/20',
              'rounded-xl shadow-2xl z-[75] overflow-hidden flex flex-col',
              className
            )}
            initial={{ opacity: 0, x: -300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -300, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="text-blue-400" size={20} />
                  <h2 className="text-white font-semibold">Navigation Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {hasUnsavedChanges && (
                <motion.div
                  className="mt-2 text-xs text-orange-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ You have unsaved changes
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-3 flex items-center justify-between bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon size={16} className="text-gray-400" />
                          <span className="text-white font-medium">{section.title}</span>
                        </div>
                        {section.isExpanded ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {section.isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-gray-700">
                              {renderSectionContent(section.id)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                    'flex items-center justify-center space-x-2',
                    hasUnsavedChanges
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};