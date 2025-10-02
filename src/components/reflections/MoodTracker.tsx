import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MoodLevel } from "@/types/reflections";

const moodOptions: { value: MoodLevel; emoji: string; label: string; color: string }[] = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'bg-purple-500' },
  { value: 'great', emoji: '😊', label: 'Great', color: 'bg-green-500' },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'bg-blue-500' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-500' },
  { value: 'bad', emoji: '😔', label: 'Bad', color: 'bg-orange-500' },
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'bg-red-500' },
];

interface MoodTrackerProps {
  mood?: MoodLevel;
  onMoodChange: (mood: MoodLevel) => void;
  energyLevel?: number;
  onEnergyChange: (level: number) => void;
  stressLevel?: number;
  onStressChange: (level: number) => void;
  satisfactionLevel?: number;
  onSatisfactionChange: (level: number) => void;
}

export default function MoodTracker({
  mood,
  onMoodChange,
  energyLevel,
  onEnergyChange,
  stressLevel,
  onStressChange,
  satisfactionLevel,
  onSatisfactionChange,
}: MoodTrackerProps) {
  return (
    <div className="space-y-6">
      {/* Mood Selector */}
      <div className="space-y-3">
        <Label>How are you feeling today?</Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {moodOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={mood === option.value ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center gap-2 h-auto py-3",
                mood === option.value && option.color
              )}
              onClick={() => onMoodChange(option.value)}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>⚡ Energy Level</Label>
          {energyLevel && (
            <span className="text-sm text-muted-foreground">{energyLevel}/10</span>
          )}
        </div>
        <Slider
          value={energyLevel ? [energyLevel] : [5]}
          onValueChange={([value]) => onEnergyChange(value)}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>😰 Stress Level</Label>
          {stressLevel && (
            <span className="text-sm text-muted-foreground">{stressLevel}/10</span>
          )}
        </div>
        <Slider
          value={stressLevel ? [stressLevel] : [5]}
          onValueChange={([value]) => onStressChange(value)}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Satisfaction Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>😊 Satisfaction Level</Label>
          {satisfactionLevel && (
            <span className="text-sm text-muted-foreground">{satisfactionLevel}/10</span>
          )}
        </div>
        <Slider
          value={satisfactionLevel ? [satisfactionLevel] : [5]}
          onValueChange={([value]) => onSatisfactionChange(value)}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
