import { Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HabitEmptyProps {
  onCreateClick: () => void;
}

export function HabitEmpty({ onCreateClick }: HabitEmptyProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Target className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No habits yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start building better habits today. Choose from our templates or create your own custom habit.
        </p>
        <div className="flex gap-3">
          <Button onClick={onCreateClick}>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Your First Habit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
