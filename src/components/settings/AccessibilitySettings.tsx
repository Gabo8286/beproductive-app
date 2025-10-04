import { useAccessibilityPreferences } from "@/contexts/AccessibilityContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Settings, Eye, Brain, Monitor } from "lucide-react";

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
        <h2 className="text-2xl font-heading font-bold mb-2">
          Accessibility Settings
        </h2>
        <p className="text-muted-foreground">
          Customize your experience to meet your accessibility needs
        </p>
      </div>

      <Separator />

      {/* Essential Settings - Always Visible */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle>Essential Visual Settings</CardTitle>
            <Badge variant="secondary">Recommended</Badge>
          </div>
          <CardDescription>
            The most commonly needed accessibility adjustments
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
              onCheckedChange={(checked) =>
                updatePreferences({ highContrast: checked })
              }
              aria-label="Enable high contrast mode"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">Font Size</Label>
              <span
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                {preferences.fontSize}px
              </span>
            </div>
            <Slider
              id="font-size"
              value={[preferences.fontSize]}
              onValueChange={([value]) =>
                updatePreferences({ fontSize: value })
              }
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

      {/* Motion Sensitivity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <CardTitle>Motion Sensitivity</CardTitle>
          </div>
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
              onCheckedChange={(checked) =>
                updatePreferences({ reduceMotion: checked })
              }
              aria-label="Reduce motion and animations"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings - Progressive Disclosure */}
      <Card>
        <CardContent className="pt-6">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full py-2">
                <div className="flex items-center gap-2 text-left">
                  <Settings className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Advanced Accessibility Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Additional settings for specialized needs
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-6 pt-4">
                <Separator />

                {/* Cognitive Accessibility */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <h4 className="font-medium">Cognitive Support</h4>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label htmlFor="focus-mode">Focus Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Distraction-free interface with minimal UI elements
                        </p>
                      </div>
                      <Switch
                        id="focus-mode"
                        checked={preferences.focusMode}
                        onCheckedChange={(checked) =>
                          updatePreferences({ focusMode: checked })
                        }
                        aria-label="Enable focus mode for distraction-free interface"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label htmlFor="simplified-language">Simplified Language</Label>
                        <p className="text-sm text-muted-foreground">
                          Use simpler, clearer language throughout the app
                        </p>
                      </div>
                      <Switch
                        id="simplified-language"
                        checked={preferences.simplifiedLanguage}
                        onCheckedChange={(checked) =>
                          updatePreferences({ simplifiedLanguage: checked })
                        }
                        aria-label="Enable simplified language mode"
                      />
                    </div>
                  </div>
                </div>

                {/* Keyboard Navigation Enhancement */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <h4 className="font-medium">Navigation Enhancement</h4>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label htmlFor="enhanced-focus">Enhanced Focus Indicators</Label>
                        <p className="text-sm text-muted-foreground">
                          More prominent visual focus indicators for keyboard navigation
                        </p>
                      </div>
                      <Switch
                        id="enhanced-focus"
                        checked={preferences.enhancedFocus || false}
                        onCheckedChange={(checked) =>
                          updatePreferences({ enhancedFocus: checked })
                        }
                        aria-label="Enable enhanced focus indicators"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label htmlFor="skip-animations">Skip Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Completely disable all transitions and animations
                        </p>
                      </div>
                      <Switch
                        id="skip-animations"
                        checked={preferences.skipAnimations || false}
                        onCheckedChange={(checked) =>
                          updatePreferences({ skipAnimations: checked })
                        }
                        aria-label="Skip all animations"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-accent/50 border-accent">
        <CardHeader>
          <CardTitle className="text-base">About Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            BeProductive is committed to making our platform accessible to
            everyone. These settings help customize your experience based on
            your needs.
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
