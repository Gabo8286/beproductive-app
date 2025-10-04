import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Smartphone,
  Vibrate,
  Settings,
  TestTube,
  ChevronDown,
  Volume2,
  VolumeX,
  Accessibility,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useHapticFeedback, HapticFeedbackType } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HapticFeedbackSettingsProps {
  className?: string;
}

export function HapticFeedbackSettings({ className }: HapticFeedbackSettingsProps) {
  const {
    isSupported,
    isEnabled,
    canVibrate,
    userPreferences,
    updatePreferences,
    requestPermission,
    testHaptic,
  } = useHapticFeedback();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [testingType, setTestingType] = useState<HapticFeedbackType | null>(null);

  // Test haptic feedback
  const handleTestHaptic = useCallback(async (type: HapticFeedbackType) => {
    setTestingType(type);

    try {
      const success = testHaptic(type);
      if (success) {
        toast.success(`${type.replace("-", " ")} haptic feedback triggered!`);
      } else {
        toast.error("Haptic feedback not available on this device");
      }
    } catch (error) {
      toast.error("Failed to test haptic feedback");
    } finally {
      setTimeout(() => setTestingType(null), 500);
    }
  }, [testHaptic]);

  // Request permission for iOS devices
  const handleRequestPermission = useCallback(async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success("Haptic feedback permission granted!");
      } else {
        toast.error("Haptic feedback permission denied");
      }
    } catch (error) {
      toast.error("Failed to request haptic feedback permission");
    }
  }, [requestPermission]);

  // Update intensity
  const handleIntensityChange = useCallback((value: number[]) => {
    updatePreferences({ intensity: value[0] / 100 });
  }, [updatePreferences]);

  // Device capability info
  const getDeviceInfo = () => {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return { type: "iOS", icon: Smartphone, color: "text-blue-600" };
    } else if (/Android/.test(userAgent)) {
      return { type: "Android", icon: Smartphone, color: "text-green-600" };
    } else {
      return { type: "Desktop", icon: Settings, color: "text-gray-600" };
    }
  };

  const deviceInfo = getDeviceInfo();
  const DeviceIcon = deviceInfo.icon;

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Haptic Feedback</CardTitle>
            <Badge variant="secondary">Not Supported</Badge>
          </div>
          <CardDescription>
            Haptic feedback is not available on this device or browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Info className="h-5 w-5 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium">To enable haptic feedback:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Use a mobile device (iOS/Android)</li>
                <li>• Use Safari on iOS or Chrome on Android</li>
                <li>• Ensure device vibration is enabled</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Vibrate className="h-5 w-5" />
          <CardTitle>Haptic Feedback</CardTitle>
          <Badge
            variant={isEnabled ? "default" : "secondary"}
            className={cn(
              isEnabled && "bg-green-100 text-green-800 hover:bg-green-100"
            )}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
          <div className="flex items-center gap-1">
            <DeviceIcon className={cn("h-4 w-4", deviceInfo.color)} />
            <span className="text-xs text-muted-foreground">{deviceInfo.type}</span>
          </div>
        </div>
        <CardDescription>
          Configure haptic feedback for touch interactions and notifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Master Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="haptic-enabled" className="text-base font-medium">
              Enable Haptic Feedback
            </Label>
            <p className="text-sm text-muted-foreground">
              Provide tactile feedback for interactions
            </p>
          </div>
          <Switch
            id="haptic-enabled"
            checked={userPreferences.enabled}
            onCheckedChange={(enabled) => updatePreferences({ enabled })}
          />
        </div>

        {userPreferences.enabled && (
          <>
            <Separator />

            {/* Intensity Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Intensity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((userPreferences.intensity || 0.7) * 100)}%
                </span>
              </div>
              <Slider
                value={[(userPreferences.intensity || 0.7) * 100]}
                onValueChange={handleIntensityChange}
                max={100}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>

            <Separator />

            {/* Accessibility Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                <Label className="text-base font-medium">Accessibility</Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="respect-reduced-motion" className="text-sm">
                      Respect Reduced Motion
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Disable haptics when system reduced motion is enabled
                    </p>
                  </div>
                  <Switch
                    id="respect-reduced-motion"
                    checked={userPreferences.respectReducedMotion}
                    onCheckedChange={(respectReducedMotion) =>
                      updatePreferences({ respectReducedMotion })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="respect-system-settings" className="text-sm">
                      Respect System Settings
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Follow device haptic preferences
                    </p>
                  </div>
                  <Switch
                    id="respect-system-settings"
                    checked={userPreferences.respectSystemSettings}
                    onCheckedChange={(respectSystemSettings) =>
                      updatePreferences({ respectSystemSettings })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Haptic Feedback */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <Label className="text-base font-medium">Test Haptic Feedback</Label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { type: "impact-light", label: "Light" },
                    { type: "impact-medium", label: "Medium" },
                    { type: "impact-heavy", label: "Strong" },
                    { type: "notification-success", label: "Success" },
                    { type: "notification-warning", label: "Warning" },
                    { type: "notification-error", label: "Error" },
                  ] as const
                ).map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestHaptic(type)}
                    disabled={testingType === type}
                    className={cn(
                      "transition-all",
                      testingType === type && "scale-95 bg-primary/10"
                    )}
                  >
                    {testingType === type ? (
                      <Zap className="h-3 w-3 mr-1 animate-pulse" />
                    ) : type === "notification-success" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : type === "notification-error" ? (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    ) : (
                      <Vibrate className="h-3 w-3 mr-1" />
                    )}
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* iOS Permission Request */}
            {deviceInfo.type === "iOS" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label className="text-base font-medium">iOS Permissions</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    iOS requires explicit permission for haptic feedback in web apps.
                  </p>
                  <Button onClick={handleRequestPermission} size="sm">
                    Request Haptic Permission
                  </Button>
                </div>
              </>
            )}

            {/* Advanced Settings */}
            <Separator />
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-base font-medium">Advanced Settings</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isAdvancedOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="debug-mode" className="text-sm">
                        Debug Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Show console logs for haptic feedback events
                      </p>
                    </div>
                    <Switch
                      id="debug-mode"
                      checked={userPreferences.debugMode}
                      onCheckedChange={(debugMode) =>
                        updatePreferences({ debugMode })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Device Capabilities</Label>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Haptic Support:</span>
                        <Badge variant={isSupported ? "default" : "secondary"} className="text-xs">
                          {isSupported ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Vibration API:</span>
                        <Badge variant={canVibrate ? "default" : "secondary"} className="text-xs">
                          {canVibrate ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Reduced Motion:</span>
                        <Badge
                          variant={
                            window.matchMedia('(prefers-reduced-motion: reduce)').matches
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}