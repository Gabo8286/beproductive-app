import { Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LunaEmptyState } from "@/components/luna/empty-states/LunaEmptyState";

interface HabitEmptyProps {
  onCreateClick: () => void;
}

export function HabitEmpty({ onCreateClick }: HabitEmptyProps) {
  return (
    <LunaEmptyState
      context="engage"
      title="No routines set yet"
      description="Build your daily routines to power your journey. Consistent practices lead to meaningful progress."
      primaryAction={{
        label: "Start Your First Routine",
        onClick: onCreateClick,
        icon: Sparkles
      }}
      lunaMessage="Ready to build some amazing habits? I can help you create routines that stick and track your progress! 🔄"
      suggestions={[
        "Start with just one small habit",
        "Focus on consistency over perfection",
        "I can remind you and celebrate your wins"
      ]}
    />
  );
}
