/**
 * Theme Customizer Component
 * Interactive UI for customizing themes, fonts, and visual preferences
 */

import React, { useState } from 'react';
import { useTheme, useThemeAware } from '@/contexts/ThemeContext';
import {
  THEME_PRESETS,
  FONT_FAMILIES,
  SIZE_SCALES,
  MOTION_PREFERENCES,
  getThemePresetsByCategory
} from '@/config/theme-presets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Palette, Type, Settings, Download, Upload, RotateCcw } from 'lucide-react';

interface ThemeCustomizerProps {
  trigger?: React.ReactNode;
}

export function ThemeCustomizer({ trigger }: ThemeCustomizerProps) {
  const {
    config,
    currentPreset,
    setPreset,
    setFontFamily,
    setFontSize,
    setSizeScale,
    setMotionPreference,
    resetToDefaults,
    exportTheme,
    importTheme,
  } = useTheme();

  const { isDark, isLight, isHighContrast } = useThemeAware();
  const [activeTab, setActiveTab] = useState('presets');

  const lightThemes = getThemePresetsByCategory('light');
  const darkThemes = getThemePresetsByCategory('dark');
  const customThemes = getThemePresetsByCategory('custom');

  const handleExportTheme = () => {
    const themeData = exportTheme();
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beproductive-theme-${currentPreset?.id || 'custom'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importTheme(content)) {
            // Theme imported successfully
          } else {
            alert('Failed to import theme. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const ThemePresetCard = ({ preset }: { preset: any }) => (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        config.preset === preset.id
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={() => setPreset(preset.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: preset.colors.primary }}
            />
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: preset.colors.secondary }}
            />
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: preset.colors.accent }}
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{preset.name}</h4>
            <p className="text-xs text-gray-500">{preset.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Palette className="w-4 h-4 mr-2" />
            Customize Theme
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme Customizer</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Themes</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Typography</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Light Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lightThemes.map((preset) => (
                    <ThemePresetCard key={preset.id} preset={preset} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Dark Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {darkThemes.map((preset) => (
                    <ThemePresetCard key={preset.id} preset={preset} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Creative Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customThemes.map((preset) => (
                    <ThemePresetCard key={preset.id} preset={preset} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Font Family</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {FONT_FAMILIES.map((font) => (
                    <div
                      key={font.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        config.fontFamily === font.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setFontFamily(font.id)}
                      style={{ fontFamily: font.family }}
                    >
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-gray-500">
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Font Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label className="w-20">Size:</Label>
                      <Slider
                        value={[config.fontSize]}
                        onValueChange={([value]) => setFontSize(value)}
                        min={12}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm text-gray-500">
                        {config.fontSize}px
                      </span>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div style={{ fontSize: `${config.fontSize}px` }}>
                        Sample text at current font size
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Size Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {SIZE_SCALES.map((scale) => (
                    <div
                      key={scale.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        config.sizeScale === scale.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSizeScale(scale.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{scale.name}</div>
                          <div className="text-sm text-gray-500">{scale.description}</div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {scale.scale}x
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Motion & Animations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MOTION_PREFERENCES.map((motion) => (
                    <div
                      key={motion.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        config.motionPreference === motion.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setMotionPreference(motion.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{motion.name}</div>
                        <div className="text-sm text-gray-400">
                          {motion.speedMultiplier}x
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theme Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button onClick={handleExportTheme} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Theme
                    </Button>
                    <Button onClick={handleImportTheme} variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Theme
                    </Button>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Theme Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Preset:</span>
                      <span>{currentPreset?.name || 'Custom'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Font Family:</span>
                      <span>{FONT_FAMILIES.find(f => f.id === config.fontFamily)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Font Size:</span>
                      <span>{config.fontSize}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size Scale:</span>
                      <span>{SIZE_SCALES.find(s => s.id === config.sizeScale)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Motion:</span>
                      <span>{MOTION_PREFERENCES.find(m => m.id === config.motionPreference)?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}