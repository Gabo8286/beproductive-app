import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateHabit } from "@/hooks/useHabits";
import { CreateHabitInput } from "@/types/habits";
import { HabitTemplates } from "@/components/habits/HabitTemplates";

const habitSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    "health",
    "productivity",
    "learning",
    "mindfulness",
    "social",
    "financial",
    "creative",
    "other",
  ]),
  type: z.enum(["build", "break", "maintain"]),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  difficulty: z.enum(["easy", "medium", "hard", "extreme"]),
  time_of_day: z
    .enum(["morning", "afternoon", "evening", "anytime"])
    .optional(),
  duration_minutes: z.coerce.number().min(1).optional(),
  target_streak: z.coerce.number().min(1).optional(),
  reminder_enabled: z.boolean().default(false),
  reminder_time: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitCreateFormProps {
  workspaceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HabitCreateForm({
  workspaceId,
  onSuccess,
  onCancel,
}: HabitCreateFormProps) {
  const [useTemplate, setUseTemplate] = useState(false);
  const createHabit = useCreateHabit();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "health",
      type: "build",
      frequency: "daily",
      difficulty: "medium",
      time_of_day: "anytime",
      reminder_enabled: false,
    },
  });

  const onSubmit = (data: HabitFormData) => {
    const input: CreateHabitInput = {
      workspace_id: workspaceId,
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      frequency: data.frequency,
      difficulty: data.difficulty,
      time_of_day: data.time_of_day,
      duration_minutes: data.duration_minutes,
      target_streak: data.target_streak,
      reminder_enabled: data.reminder_enabled,
      reminder_time: data.reminder_time,
      color: data.color,
      icon: data.icon,
    };

    createHabit.mutate(input, {
      onSuccess,
    });
  };

  const handleTemplateSelect = (template: any) => {
    form.reset({
      title: template.title,
      description: template.description,
      category: template.category,
      type: "build",
      frequency: template.frequency,
      difficulty: template.difficulty,
      time_of_day: template.time_of_day,
      duration_minutes: template.duration_minutes,
      icon: template.icon,
      color: template.color,
      reminder_enabled: false,
    });
    setUseTemplate(false);
  };

  return (
    <Tabs
      value={useTemplate ? "templates" : "custom"}
      onValueChange={(v) => setUseTemplate(v === "templates")}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="custom">Custom</TabsTrigger>
        <TabsTrigger value="templates">From Template</TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <HabitTemplates onSelect={handleTemplateSelect} />
      </TabsContent>

      <TabsContent value="custom">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning meditation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this habit about?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="productivity">
                          Productivity
                        </SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="build">Build</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="maintain">Maintain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Frequency and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Settings */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_of_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_streak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Streak (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="21" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createHabit.isPending}>
                {createHabit.isPending ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
