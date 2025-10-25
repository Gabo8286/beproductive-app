/**
 * Accessibility Toolbar Component
 * Quick access toolbar for accessibility settings
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Zap,
  ZapOff,
  Settings,
  X,
  Accessibility,
  MousePointer,
  Keyboard,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface AccessibilityToolbarProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  alwaysVisible?: boolean;
  className?: string;
}

export function AccessibilityToolbar({
  position = 'top',
  alwaysVisible = false,
  className,
}: AccessibilityToolbarProps) {
  const {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader,
    skipToContent,
  } = useAccessibility();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(alwaysVisible);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    announceToScreenReader(
      isExpanded ? 'Accessibility toolbar collapsed' : 'Accessibility toolbar expanded'
    );
  };

  const handleToggleVisible = () => {
    setIsVisible(!isVisible);
    announceToScreenReader(
      isVisible ? 'Accessibility toolbar hidden' : 'Accessibility toolbar shown'
    );
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean, label: string) => {
    updateSetting(key, value);
    announceToScreenReader(`${label} ${value ? 'enabled' : 'disabled'}`);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'left':
        return 'top-1/2 left-4 -translate-y-1/2';
      case 'right':
        return 'top-1/2 right-4 -translate-y-1/2';
      default:
        return 'top-4 left-1/2 -translate-x-1/2';
    }
  };

  const toolbarVariants = {
    collapsed: {
      width: 'auto',
      height: 'auto',
    },
    expanded: {
      width: 'auto',
      height: 'auto',
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Always show accessibility button for keyboard users
  if (!isVisible && !alwaysVisible) {
    return (
      <motion.div
        className={cn(
          'fixed z-50',
          getPositionClasses(),
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleVisible}
          className="bg-background/90 backdrop-blur-sm shadow-lg"
          aria-label="Show accessibility toolbar"
        >
          <Accessibility className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'fixed z-50',
        getPositionClasses(),
        className
      )}
      variants={toolbarVariants}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
    >
      <Card className="bg-background/95 backdrop-blur-sm shadow-lg border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Accessibility className="w-4 h-4" />
              <span>Accessibility</span>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Settings className="w-3 h-3" />
                )}
              </Button>
              {!alwaysVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleVisible}
                  aria-label="Hide accessibility toolbar"
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CardContent className="pt-0 space-y-4">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Quick Actions
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipToContent}
                      className="text-xs"
                    >
                      <MousePointer className="w-3 h-3 mr-1" />
                      Skip to Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetSettings}
                      className="text-xs"
                    >
                      <Monitor className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Visual Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Visual
                  </h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast" className="text-sm flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>High Contrast</span>
                    </Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) =>
                        handleSettingChange('highContrast', checked, 'High contrast mode')
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text" className="text-sm flex items-center space-x-2">
                      <Maximize2 className="w-4 h-4" />
                      <span>Large Text</span>
                    </Label>
                    <Switch
                      id="large-text"
                      checked={settings.largeText}
                      onCheckedChange={(checked) =>
                        handleSettingChange('largeText', checked, 'Large text mode')
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Motion Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Motion
                  </h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion" className="text-sm flex items-center space-x-2">
                      <ZapOff className="w-4 h-4" />
                      <span>Reduce Motion</span>
                    </Label>
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) =>
                        handleSettingChange('reducedMotion', checked, 'Reduced motion')
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations" className="text-sm flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Animations</span>
                    </Label>
                    <Switch
                      id="animations"
                      checked={settings.animations}
                      onCheckedChange={(checked) =>
                        handleSettingChange('animations', checked, 'Animations')
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Interaction Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Interaction
                  </h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-nav" className="text-sm flex items-center space-x-2">
                      <Keyboard className="w-4 h-4" />
                      <span>Keyboard Navigation</span>
                    </Label>
                    <Switch
                      id="keyboard-nav"
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) =>
                        handleSettingChange('keyboardNavigation', checked, 'Keyboard navigation')
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="announcements" className="text-sm flex items-center space-x-2">
                      {settings.announcements ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                      <span>Announcements</span>
                    </Label>
                    <Switch
                      id="announcements"
                      checked={settings.announcements}
                      onCheckedChange={(checked) =>
                        handleSettingChange('announcements', checked, 'Screen reader announcements')
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader" className="text-sm flex items-center space-x-2">
                      <EyeOff className="w-4 h-4" />
                      <span>Screen Reader Mode</span>
                    </Label>
                    <Switch
                      id="screen-reader"
                      checked={settings.screenReaderMode}
                      onCheckedChange={(checked) =>
                        handleSettingChange('screenReaderMode', checked, 'Screen reader mode')
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}