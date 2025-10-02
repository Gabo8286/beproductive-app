import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GreetingHeaderProps {
  name?: string;
  greeting: string;
  insight: string;
}

export function GreetingHeader({ name, greeting, insight }: GreetingHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (hour < 17) return <Sun className="h-5 w-5 text-orange-500" />;
    return <Moon className="h-5 w-5 text-blue-500" />;
  };

  const getTimeGradient = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "from-yellow-500/10 to-orange-500/10";
    if (hour < 17) return "from-orange-500/10 to-red-500/10";
    return "from-blue-500/10 to-purple-500/10";
  };

  return (
    <Card className={cn(
      "p-6 journey-card relative overflow-hidden",
      `bg-gradient-to-br ${getTimeGradient()}`
    )}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTimeIcon()}
            <div>
              <h1 className="text-2xl font-bold text-gradient-brand">
                {greeting}
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {name || "Traveler"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString()}
            </div>
            <div className="text-lg font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary journey-float" />
          <Badge variant="secondary" className="text-sm">
            {insight}
          </Badge>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-xl" />
      </div>
    </Card>
  );
}
