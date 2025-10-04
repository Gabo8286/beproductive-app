import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { usePersonalization } from "@/hooks/usePersonalization";
import { User, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PersonalizationPanel() {
  const { userPreferences, updatePreferences } = usePersonalization();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="apple-button">
          <User className="h-4 w-4 mr-2" />
          Personalize
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme Preference</Label>
            <RadioGroup
              value={userPreferences.theme}
              onValueChange={(value) =>
                updatePreferences({ theme: value as any })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto (System)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Dashboard Features</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="drag-drop" className="text-sm">
                Drag & Drop Reordering
              </Label>
              <Switch
                id="drag-drop"
                checked={userPreferences.enableDragDrop}
                onCheckedChange={(checked) =>
                  updatePreferences({ enableDragDrop: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="motivational" className="text-sm">
                Motivational Messages
              </Label>
              <Switch
                id="motivational"
                checked={userPreferences.showMotivationalMessages}
                onCheckedChange={(checked) =>
                  updatePreferences({ showMotivationalMessages: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compact" className="text-sm">
                Compact Mode
              </Label>
              <Switch
                id="compact"
                checked={userPreferences.compactMode}
                onCheckedChange={(checked) =>
                  updatePreferences({ compactMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="celebrations" className="text-sm">
                Milestone Celebrations
              </Label>
              <Switch
                id="celebrations"
                checked={userPreferences.celebrateMilestones}
                onCheckedChange={(checked) =>
                  updatePreferences({ celebrateMilestones: checked })
                }
              />
            </div>
          </div>

          {/* Refresh Interval */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Refresh Interval:{" "}
              {Math.floor(userPreferences.refreshInterval / 60000)} minutes
            </Label>
            <Slider
              value={[userPreferences.refreshInterval]}
              onValueChange={([value]) =>
                updatePreferences({ refreshInterval: value })
              }
              min={60000} // 1 minute
              max={1800000} // 30 minutes
              step={60000} // 1 minute steps
              className="w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
