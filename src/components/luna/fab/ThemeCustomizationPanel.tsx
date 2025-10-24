/**
 * Theme Customization Panel
 * Advanced theme selection and appearance customization interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Eye,
  Sliders,
  RotateCcw,
  Save,
  Brush,
  Droplet,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useScreenReader } from '@/hooks/useScreenReader';
import {
  themeCustomizationService,
  NavigationTheme,
  HubCustomization,
  CustomizationPreferences
} from '@/services/ThemeCustomizationService';
import { NavigationHubId } from '@/types/navigation';

interface ThemeCustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export const ThemeCustomizationPanel: React.FC<ThemeCustomizationPanelProps> = ({
  isVisible,
  onClose,
  className
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { announce } = useScreenReader();

  // State
  const [activeTab, setActiveTab] = useState<'themes' | 'customize' | 'advanced'>('themes');
  const [availableThemes, setAvailableThemes] = useState<NavigationTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<NavigationTheme | null>(null);
  const [preferences, setPreferences] = useState<CustomizationPreferences | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load themes and preferences
  useEffect(() => {
    if (isVisible) {
      const themes = themeCustomizationService.getAllThemes();
      const currentTheme = themeCustomizationService.getActiveTheme();
      const prefs = themeCustomizationService.getPreferences();

      setAvailableThemes(themes);
      setActiveTheme(currentTheme);
      setPreferences(prefs);
      setSelectedThemeId(currentTheme.id);
    }
  }, [isVisible]);

  // Handle theme selection
  const handleThemeSelect = useCallback((themeId: string) => {
    setSelectedThemeId(themeId);
    themeCustomizationService.applyTheme(themeId);

    const theme = themeCustomizationService.getTheme(themeId);
    setActiveTheme(theme);

    triggerHaptic('medium');
    announce(`Applied ${theme?.name} theme`, { priority: 'polite' });
  }, [triggerHaptic, announce]);

  // Handle hub color customization
  const handleHubColorChange = useCallback((hubId: NavigationHubId, color: string) => {
    themeCustomizationService.updateHubCustomization(hubId, { color });
    triggerHaptic('light');
  }, [triggerHaptic]);

  // Copy theme configuration
  const handleCopyTheme = useCallback(async (themeId: string) => {
    try {
      const themeJson = themeCustomizationService.exportTheme(themeId);
      await navigator.clipboard.writeText(themeJson);
      setCopiedText(themeId);
      setTimeout(() => setCopiedText(null), 2000);
      triggerHaptic('medium');
      announce('Theme configuration copied to clipboard', { priority: 'polite' });
    } catch (error) {
      console.error('Failed to copy theme:', error);
    }
  }, [triggerHaptic, announce]);

  // Import theme from clipboard
  const handleImportTheme = useCallback(async () => {
    try {
      const themeJson = await navigator.clipboard.readText();
      const importedTheme = themeCustomizationService.importTheme(themeJson);

      // Refresh themes list
      setAvailableThemes(themeCustomizationService.getAllThemes());

      triggerHaptic('medium');
      announce(`Imported theme: ${importedTheme.name}`, { priority: 'polite' });
    } catch (error) {
      console.error('Failed to import theme:', error);
      announce('Failed to import theme from clipboard', { priority: 'assertive' });
    }
  }, [triggerHaptic, announce]);

  // Create custom theme
  const handleCreateCustomTheme = useCallback(() => {
    if (!customThemeName.trim() || !activeTheme) return;

    try {
      const customTheme = themeCustomizationService.createCustomTheme(activeTheme.id, {
        name: customThemeName.trim(),
        description: `Custom theme based on ${activeTheme.name}`,
      });

      setAvailableThemes(themeCustomizationService.getAllThemes());
      setSelectedThemeId(customTheme.id);
      setIsCreatingCustom(false);
      setCustomThemeName('');

      triggerHaptic('medium');
      announce(`Created custom theme: ${customTheme.name}`, { priority: 'polite' });
    } catch (error) {
      console.error('Failed to create custom theme:', error);
    }
  }, [customThemeName, activeTheme, triggerHaptic, announce]);

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    themeCustomizationService.resetToDefaults();
    setActiveTheme(themeCustomizationService.getActiveTheme());
    setPreferences(themeCustomizationService.getPreferences());
    setSelectedThemeId('luna-default');

    triggerHaptic('medium');
    announce('Reset to default theme settings', { priority: 'polite' });
  }, [triggerHaptic, announce]);

  // Render theme card
  const renderThemeCard = useCallback((theme: NavigationTheme) => {
    const isSelected = selectedThemeId === theme.id;
    const preview = theme.preview || themeCustomizationService.generateThemePreview(theme);

    return (
      <motion.div
        key={theme.id}
        className={cn(
          'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
          isSelected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'
        )}
        onClick={() => handleThemeSelect(theme.id)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Preview */}
        <div className="w-full h-20 rounded-lg mb-3 overflow-hidden bg-gray-700">
          {preview && (
            <img
              src={preview}
              alt={`${theme.name} preview`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Theme Info */}
        <div className="mb-2">
          <h4 className="text-white font-medium flex items-center">
            {theme.name}
            {theme.category === 'custom' && (
              <Brush size={12} className="ml-1 text-purple-400" />
            )}
            {theme.category === 'system' && (
              <Monitor size={12} className="ml-1 text-blue-400" />
            )}
          </h4>
          <p className="text-xs text-gray-400 mt-1">{theme.description}</p>
        </div>

        {/* Color Preview */}
        <div className="flex space-x-1 mb-3">
          {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {theme.accessibility.highContrast && (
              <Eye size={12} className="text-yellow-400" title="High Contrast" />
            )}
            {theme.accessibility.colorBlindFriendly && (
              <Circle size={12} className="text-green-400" title="Color Blind Friendly" />
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyTheme(theme.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Copy theme configuration"
          >
            {copiedText === theme.id ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Check size={14} className="text-white" />
          </motion.div>
        )}
      </motion.div>
    );
  }, [selectedThemeId, handleThemeSelect, handleCopyTheme, copiedText]);

  // Render themes tab
  const renderThemesTab = () => (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleImportTheme}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Upload size={14} />
          <span>Import</span>
        </button>

        <button
          onClick={() => setIsCreatingCustom(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Brush size={14} />
          <span>Create Custom</span>
        </button>
      </div>

      {/* Create Custom Theme Modal */}
      <AnimatePresence>
        {isCreatingCustom && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-96"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-white font-semibold mb-4">Create Custom Theme</h3>
              <input
                type="text"
                placeholder="Theme name"
                value={customThemeName}
                onChange={(e) => setCustomThemeName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                autoFocus
              />
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCreateCustomTheme}
                  disabled={!customThemeName.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setCustomThemeName('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Categories */}
      {['system', 'custom', 'community'].map((category) => {
        const categoryThemes = availableThemes.filter(t => t.category === category);
        if (categoryThemes.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-white font-medium capitalize">
              {category} Themes ({categoryThemes.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categoryThemes.map(renderThemeCard)}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render customization tab
  const renderCustomizeTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-3">Hub Colors</h3>
        <div className="space-y-3">
          {['capture-productivity', 'planning-time', 'engage-collaboration', 'profile-user', 'insights-growth', 'advanced-admin', 'search-assistant'].map((hubId) => {
            const customization = themeCustomizationService.getHubCustomization(hubId as NavigationHubId);

            return (
              <div key={hubId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-white capitalize">{hubId.replace('-', ' ')}</span>
                <div className="flex items-center space-x-2">
                  {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleHubColorChange(hubId as NavigationHubId, `${color} hover:${color.replace('500', '600')}`)}
                      className={cn('w-6 h-6 rounded-full border-2', color,
                        customization?.color.includes(color.split('-')[1]) ? 'border-white' : 'border-gray-600'
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTheme && (
        <div>
          <h3 className="text-white font-medium mb-3">Appearance Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white">Glassmorphism Effect</label>
                <p className="text-xs text-gray-400">Transparent blur effects</p>
              </div>
              <button
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  activeTheme.appearance.glassmorphism ? 'bg-blue-600' : 'bg-gray-600'
                )}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                  animate={{ x: activeTheme.appearance.glassmorphism ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white">Gradient Effects</label>
                <p className="text-xs text-gray-400">Color gradients and blends</p>
              </div>
              <button
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  activeTheme.appearance.gradients ? 'bg-blue-600' : 'bg-gray-600'
                )}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                  animate={{ x: activeTheme.appearance.gradients ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render advanced tab
  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {preferences && (
        <>
          <div>
            <h3 className="text-white font-medium mb-3">Global Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Auto Switch Theme</label>
                  <p className="text-xs text-gray-400">Switch based on time of day</p>
                </div>
                <button
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    preferences.globalSettings.autoSwitchTheme ? 'bg-blue-600' : 'bg-gray-600'
                  )}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                    animate={{ x: preferences.globalSettings.autoSwitchTheme ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Use System Colors</label>
                  <p className="text-xs text-gray-400">Follow system accent color</p>
                </div>
                <button
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    preferences.globalSettings.useSystemColors ? 'bg-blue-600' : 'bg-gray-600'
                  )}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                    animate={{ x: preferences.globalSettings.useSystemColors ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Import/Export</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCopyTheme(selectedThemeId)}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Export Current Theme</span>
              </button>

              <button
                onClick={handleImportTheme}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>Import Theme from Clipboard</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Reset</h3>
            <button
              onClick={handleResetToDefaults}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const tabs = [
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'customize', label: 'Customize', icon: Sliders },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2',
              'w-[800px] max-w-[90vw] h-[600px] max-h-[90vh]',
              'bg-gray-900/95 backdrop-blur-md border border-white/20',
              'rounded-xl shadow-2xl z-[85] overflow-hidden flex flex-col',
              className
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="text-purple-400" size={20} />
                  <h2 className="text-white font-semibold">Theme Customization</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      )}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'themes' && renderThemesTab()}
              {activeTab === 'customize' && renderCustomizeTab()}
              {activeTab === 'advanced' && renderAdvancedTab()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};