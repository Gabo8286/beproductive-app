import { Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HabitEmptyProps {
  onCreateClick: () => void;
}

export function HabitEmpty({ onCreateClick }: HabitEmptyProps) {
  return (
    <Card className="border-dashed journey-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Target className="h-12 w-12 text-primary journey-float" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No routines set yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Build your daily routines to power your journey. Consistent practices lead to meaningful progress.
        </p>
        <div className="flex gap-3">
          <Button onClick={onCreateClick} className="apple-button">
            <Sparkles className="h-4 w-4 mr-2" />
            Start Your First Routine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
