import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useCreateReflection } from "@/hooks/useReflections";
import MoodTracker from "./MoodTracker";
import type { CreateReflectionInput, MoodLevel } from "@/types/reflections";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(10000),
  reflection_date: z.date(),
  mood: z.enum(['amazing', 'great', 'good', 'neutral', 'bad', 'terrible']).optional(),
  energy_level: z.number().min(1).max(10).optional(),
  stress_level: z.number().min(1).max(10).optional(),
  satisfaction_level: z.number().min(1).max(10).optional(),
  is_private: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface DailyReflectionFormProps {
  workspaceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DailyReflectionForm({
  workspaceId,
  onSuccess,
  onCancel,
}: DailyReflectionFormProps) {
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [wins, setWins] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [learnings, setLearnings] = useState<string[]>([]);
  const [tomorrowFocus, setTomorrowFocus] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const { mutate: createReflection, isPending } = useCreateReflection();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reflection_date: new Date(),
      is_private: true,
    },
  });

  const selectedDate = watch("reflection_date");
  const mood = watch("mood");
  const energyLevel = watch("energy_level");
  const stressLevel = watch("stress_level");
  const satisfactionLevel = watch("satisfaction_level");
  const isPrivate = watch("is_private");

  const handleAddItem = (items: string[], setItems: (items: string[]) => void, value: string) => {
    if (value.trim()) {
      setItems([...items, value.trim()]);
    }
  };

  const handleRemoveItem = (items: string[], setItems: (items: string[]) => void, index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const onSubmit = (data: FormData) => {
    const input: CreateReflectionInput = {
      workspace_id: workspaceId,
      title: data.title,
      content: data.content,
      reflection_type: 'daily',
      reflection_date: format(data.reflection_date, 'yyyy-MM-dd'),
      mood: data.mood,
      energy_level: data.energy_level,
      stress_level: data.stress_level,
      satisfaction_level: data.satisfaction_level,
      gratitude_items: gratitudeItems,
      wins,
      challenges,
      learnings,
      tomorrow_focus: tomorrowFocus,
      tags,
      is_private: data.is_private,
    };

    createReflection(input, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="title">Reflection Title</Label>
            <Input
              id="title"
              placeholder="What's on your mind today?"
              {...register("title")}
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue("reflection_date", date)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={isPrivate}
            onCheckedChange={(checked) => setValue("is_private", checked)}
          />
          <Label>Keep this reflection private</Label>
        </div>
      </div>

      <Separator />

      {/* Mood Tracker */}
      <MoodTracker
        mood={mood}
        onMoodChange={(newMood) => setValue("mood", newMood as MoodLevel)}
        energyLevel={energyLevel}
        onEnergyChange={(level) => setValue("energy_level", level)}
        stressLevel={stressLevel}
        onStressChange={(level) => setValue("stress_level", level)}
        satisfactionLevel={satisfactionLevel}
        onSatisfactionChange={(level) => setValue("satisfaction_level", level)}
      />

      <Separator />

      {/* Main Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Your Reflection</Label>
        <Textarea
          id="content"
          placeholder="Write your thoughts, feelings, and reflections for today..."
          {...register("content")}
          rows={6}
          className="resize-none"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* Structured Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gratitude */}
        <div className="space-y-2">
          <Label>💝 Gratitude - What are you grateful for?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add something you're grateful for..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem(gratitudeItems, setGratitudeItems, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <div className="space-y-1">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(gratitudeItems, setGratitudeItems, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Wins */}
        <div className="space-y-2">
          <Label>🎯 Wins - What went well today?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a win or accomplishment..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem(wins, setWins, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <div className="space-y-1">
            {wins.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(wins, setWins, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-2">
          <Label>💪 Challenges - What was difficult?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a challenge or obstacle..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem(challenges, setChallenges, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <div className="space-y-1">
            {challenges.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(challenges, setChallenges, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Learnings */}
        <div className="space-y-2">
          <Label>💡 Learnings - What did you learn?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a key learning or insight..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem(learnings, setLearnings, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <div className="space-y-1">
            {learnings.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(learnings, setLearnings, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tomorrow's Focus */}
      <div className="space-y-2">
        <Label>🌟 Tomorrow's Focus - What are your priorities?</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a priority for tomorrow..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(tomorrowFocus, setTomorrowFocus, e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
        <div className="space-y-1">
          {tomorrowFocus.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
              <span className="flex-1 text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveItem(tomorrowFocus, setTomorrowFocus, index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tags..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Reflection"}
        </Button>
      </div>
    </form>
  );
}
