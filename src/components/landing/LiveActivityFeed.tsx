import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Flame,
  BookOpen,
  CheckCircle,
  Trophy,
  Zap,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "goal" | "habit" | "reflection" | "streak" | "milestone";
  message: string;
  location?: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const sampleActivities: Omit<Activity, "id" | "timestamp">[] = [
  {
    type: "goal",
    message: "Someone just completed their career advancement goal",
    location: "San Francisco, CA",
    icon: <Target className="h-4 w-4" />,
    color: "text-primary",
  },
  {
    type: "habit",
    message: "A user reached a 100-day meditation streak",
    location: "London, UK",
    icon: <Flame className="h-4 w-4" />,
    color: "text-orange-500",
  },
  {
    type: "reflection",
    message: "Someone shared a powerful reflection on personal growth",
    location: "Tokyo, Japan",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-success",
  },
  {
    type: "milestone",
    message: "A developer just shipped their side project milestone",
    location: "Berlin, Germany",
    icon: <Trophy className="h-4 w-4" />,
    color: "text-secondary",
  },
  {
    type: "streak",
    message: "Someone maintained a 30-day productivity streak",
    location: "Toronto, Canada",
    icon: <Zap className="h-4 w-4" />,
    color: "text-yellow-500",
  },
  {
    type: "goal",
    message: "A student completed their learning roadmap goal",
    location: "Sydney, Australia",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-success",
  },
  {
    type: "habit",
    message: "Someone built a daily writing habit (45 days strong)",
    location: "Mumbai, India",
    icon: <Flame className="h-4 w-4" />,
    color: "text-orange-500",
  },
  {
    type: "milestone",
    message: "An entrepreneur hit their revenue milestone",
    location: "Austin, TX",
    icon: <Trophy className="h-4 w-4" />,
    color: "text-secondary",
  },
];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Initialize with first few activities
    const initial = sampleActivities.slice(0, 3).map((activity, index) => ({
      ...activity,
      id: `activity-${Date.now()}-${index}`,
      timestamp: new Date(Date.now() - index * 10000),
    }));
    setActivities(initial);

    // Add new activities periodically
    const interval = setInterval(() => {
      if (!isPaused) {
        const randomActivity =
          sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
        const newActivity: Activity = {
          ...randomActivity,
          id: `activity-${Date.now()}`,
          timestamp: new Date(),
        };

        setActivities((prev) => {
          const updated = [newActivity, ...prev];
          return updated.slice(0, 5); // Keep only 5 most recent
        });
      }
    }, 5000); // New activity every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card
      className="glass-card elevated-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-success rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Live Activity</h3>
              <p className="text-xs text-muted-foreground">
                Real-time community achievements
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2">
            <Globe2 className="h-3 w-3" />
            Worldwide
          </Badge>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="glass-card p-4 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      activity.type === "goal" &&
                        "from-primary/20 to-primary/10",
                      activity.type === "habit" &&
                        "from-orange-500/20 to-orange-500/10",
                      activity.type === "reflection" &&
                        "from-success/20 to-success/10",
                      activity.type === "milestone" &&
                        "from-secondary/20 to-secondary/10",
                      activity.type === "streak" &&
                        "from-yellow-500/20 to-yellow-500/10",
                    )}
                  >
                    <span className={activity.color}>{activity.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.location && (
                        <span className="text-xs text-muted-foreground">
                          {activity.location}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        • {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Join thousands making progress every day
        </p>
      </CardContent>
    </Card>
  );
}
