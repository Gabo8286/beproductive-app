import { useAccessibilityPreferences } from '@/contexts/AccessibilityContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Accessibility Settings Panel
 * Allows users to customize accessibility preferences:
 * - Reduce motion
 * - High contrast mode
 * - Font size adjustment
 * - Screen reader optimization
 */
export function AccessibilitySettings() {
  const { preferences, updatePreferences } = useAccessibilityPreferences();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Accessibility Settings</h2>
        <p className="text-muted-foreground">
          Customize your experience to meet your accessibility needs
        </p>
      </div>

      <Separator />

      {/* Motion Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Motion & Animation</CardTitle>
          <CardDescription>
            Control animations and transitions throughout the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions for a calmer experience
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={preferences.reduceMotion}
              onCheckedChange={(checked) => updatePreferences({ reduceMotion: checked })}
              aria-label="Reduce motion and animations"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Preferences</CardTitle>
          <CardDescription>
            Adjust colors and contrast for better visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase color contrast for improved readability (WCAG AAA)
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreferences({ highContrast: checked })}
              aria-label="Enable high contrast mode"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">Font Size</Label>
              <span className="text-sm text-muted-foreground" aria-live="polite">
                {preferences.fontSize}px
              </span>
            </div>
            <Slider
              id="font-size"
              value={[preferences.fontSize]}
              onValueChange={([value]) => updatePreferences({ fontSize: value })}
              min={12}
              max={24}
              step={1}
              aria-label="Adjust font size"
              aria-valuemin={12}
              aria-valuemax={24}
              aria-valuenow={preferences.fontSize}
              aria-valuetext={`${preferences.fontSize} pixels`}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (12px)</span>
              <span>Default (16px)</span>
              <span>Large (24px)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Reader</CardTitle>
          <CardDescription>
            Optimize the interface for screen reader users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="screen-reader-mode">Screen Reader Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced announcements and optimized navigation for screen readers
              </p>
            </div>
            <Switch
              id="screen-reader-mode"
              checked={preferences.screenReaderMode}
              onCheckedChange={(checked) => updatePreferences({ screenReaderMode: checked })}
              aria-label="Enable screen reader optimization"
            />
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-accent/50 border-accent">
        <CardHeader>
          <CardTitle className="text-base">About Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            BeProductive is committed to making our platform accessible to everyone.
            These settings help customize your experience based on your needs.
          </p>
          <p className="text-muted-foreground">
            We strive to meet WCAG 2.1 Level AA standards. If you encounter any
            accessibility barriers, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
