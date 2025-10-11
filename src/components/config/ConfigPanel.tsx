import React, { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { useAppConfig } from '@/hooks/useAppConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from './ColorPicker';
import { X, Download, Upload, RotateCcw, Palette, Settings, Zap } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { saveConfig, exportConfig, importConfig, resetConfig } = useConfig();
  const {
    theme,
    currentTheme,
    setTheme,
    updateColors,
    components,
    updateComponentConfig,
    features,
    updateFeatureConfig,
    isDirty,
    isLoading
  } = useAppConfig();

  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await saveConfig();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spark-bloom-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      importConfig(importText);
      setImportText('');
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Configuration Panel</CardTitle>
          <div className="flex items-center space-x-2">
            {isDirty && (
              <Button onClick={handleSave} size="sm" disabled={isLoading}>
                Save Changes
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Theme</span>
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Components</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Features</span>
              </TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Theme Mode</Label>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant={currentTheme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </Button>
                    <Button
                      variant={currentTheme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Primary Colors</Label>
                    <div className="space-y-2 mt-2">
                      <ColorPicker
                        label="Primary"
                        value={theme.colors.primary}
                        onChange={(color) => updateColors({ primary: color })}
                      />
                      <ColorPicker
                        label="Secondary"
                        value={theme.colors.secondary}
                        onChange={(color) => updateColors({ secondary: color })}
                      />
                      <ColorPicker
                        label="Accent"
                        value={theme.colors.accent}
                        onChange={(color) => updateColors({ accent: color })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status Colors</Label>
                    <div className="space-y-2 mt-2">
                      <ColorPicker
                        label="Success"
                        value={theme.colors.success}
                        onChange={(color) => updateColors({ success: color })}
                      />
                      <ColorPicker
                        label="Warning"
                        value={theme.colors.warning}
                        onChange={(color) => updateColors({ warning: color })}
                      />
                      <ColorPicker
                        label="Error"
                        value={theme.colors.error}
                        onChange={(color) => updateColors({ error: color })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Background Colors</Label>
                    <div className="space-y-2 mt-2">
                      <ColorPicker
                        label="Background"
                        value={theme.colors.background}
                        onChange={(color) => updateColors({ background: color })}
                      />
                      <ColorPicker
                        label="Surface"
                        value={theme.colors.surface}
                        onChange={(color) => updateColors({ surface: color })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Text Colors</Label>
                    <div className="space-y-2 mt-2">
                      <ColorPicker
                        label="Primary Text"
                        value={theme.colors.text.primary}
                        onChange={(color) => updateColors({
                          text: { ...theme.colors.text, primary: color }
                        })}
                      />
                      <ColorPicker
                        label="Secondary Text"
                        value={theme.colors.text.secondary}
                        onChange={(color) => updateColors({
                          text: { ...theme.colors.text, secondary: color }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="components" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Button Configuration</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-sm">Small Height</Label>
                      <Input
                        value={components.button.height.sm}
                        onChange={(e) => updateComponentConfig('button', {
                          height: { ...components.button.height, sm: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Medium Height</Label>
                      <Input
                        value={components.button.height.md}
                        onChange={(e) => updateComponentConfig('button', {
                          height: { ...components.button.height, md: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Large Height</Label>
                      <Input
                        value={components.button.height.lg}
                        onChange={(e) => updateComponentConfig('button', {
                          height: { ...components.button.height, lg: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Card Configuration</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-sm">Padding</Label>
                      <Input
                        value={components.card.padding}
                        onChange={(e) => updateComponentConfig('card', {
                          ...components.card,
                          padding: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Border Radius</Label>
                      <Input
                        value={components.card.borderRadius}
                        onChange={(e) => updateComponentConfig('card', {
                          ...components.card,
                          borderRadius: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Shadow</Label>
                      <Input
                        value={components.card.shadow}
                        onChange={(e) => updateComponentConfig('card', {
                          ...components.card,
                          shadow: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Luna AI Features</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable Luna AI</Label>
                      <Switch
                        checked={features.luna.enabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('luna', { enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Local Processing</Label>
                      <Switch
                        checked={features.luna.localProcessingEnabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('luna', { localProcessingEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Insights</Label>
                      <Switch
                        checked={features.luna.insightsEnabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('luna', { insightsEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Metrics Tracking</Label>
                      <Switch
                        checked={features.luna.metricsEnabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('luna', { metricsEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Performance Features</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Performance Monitoring</Label>
                      <Switch
                        checked={features.performance.monitoringEnabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('performance', { monitoringEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Supabase Monitoring</Label>
                      <Switch
                        checked={features.performance.supabaseMonitoringEnabled}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('performance', { supabaseMonitoringEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Dashboard Settings</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Refresh</Label>
                      <Switch
                        checked={features.dashboard.autoRefresh}
                        onCheckedChange={(checked) =>
                          updateFeatureConfig('dashboard', { autoRefresh: checked })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Max Tasks Shown</Label>
                      <Input
                        type="number"
                        value={features.dashboard.maxTasksShown}
                        onChange={(e) =>
                          updateFeatureConfig('dashboard', {
                            maxTasksShown: parseInt(e.target.value) || 10
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="management" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Configuration Management</Label>
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={handleExport} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Config
                    </Button>
                    <Button onClick={resetConfig} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Default
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Import Configuration</Label>
                  <div className="space-y-2 mt-2">
                    <textarea
                      className="w-full h-32 p-2 border rounded-md resize-none"
                      placeholder="Paste configuration JSON here..."
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                    <Button
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Config
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}