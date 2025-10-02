import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateGoalInput } from "@/types/goals";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  start_date: z.date().optional(),
  target_date: z.date().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.target_date) {
      return data.target_date >= data.start_date;
    }
    return true;
  },
  {
    message: "Target date must be after start date",
    path: ["target_date"],
  }
);

interface GoalFormProps {
  onSubmit: (data: CreateGoalInput) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CreateGoalInput>;
}

export function GoalForm({ onSubmit, isSubmitting, defaultValues }: GoalFormProps) {
  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      start_date: defaultValues?.start_date,
      target_date: defaultValues?.target_date,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="What destination would you like to reach?" 
                  className="focus-brand transition-all duration-200 hover:border-primary/50"
                  {...field}
                  aria-label="Destination name"
                />
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
              <FormLabel>Why This Destination Matters (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe why this destination is important to your journey..."
                  className="min-h-[100px] focus-brand scrollbar-brand resize-none"
                  {...field}
                  aria-label="Destination description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Journey Start (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal focus-brand transition-all duration-200 hover:border-primary/50",
                          !field.value && "text-muted-foreground"
                        )}
                        aria-label="Select start date"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>When will you begin?</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Arrival (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal focus-brand transition-all duration-200 hover:border-primary/50",
                          !field.value && "text-muted-foreground"
                        )}
                        aria-label="Select target date"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>When do you want to arrive?</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full apple-button focus-brand" disabled={isSubmitting}>
          {isSubmitting ? "Planning Route..." : "Set Destination"}
        </Button>
      </form>
    </Form>
  );
}
