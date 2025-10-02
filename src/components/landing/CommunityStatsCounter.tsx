import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Flame, BookOpen, TrendingUp, Award } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const stats: Stat[] = [
  {
    id: "users",
    label: "Active Users",
    value: 10247,
    suffix: "+",
    icon: <Users className="h-6 w-6" />,
    color: "from-primary to-primary-hover",
    description: "Ambitious professionals worldwide",
  },
  {
    id: "goals",
    label: "Goals Completed",
    value: 523891,
    suffix: "+",
    icon: <Target className="h-6 w-6" />,
    color: "from-success to-success/80",
    description: "Destinations reached",
  },
  {
    id: "streaks",
    label: "Active Streaks",
    value: 8942,
    icon: <Flame className="h-6 w-6" />,
    color: "from-orange-500 to-orange-600",
    description: "Consistent habits building",
  },
  {
    id: "reflections",
    label: "Reflections",
    value: 756234,
    suffix: "+",
    icon: <BookOpen className="h-6 w-6" />,
    color: "from-secondary to-secondary-hover",
    description: "Insights captured",
  },
  {
    id: "improvement",
    label: "Avg Productivity",
    value: 47,
    suffix: "%",
    prefix: "+",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-success to-success/80",
    description: "Productivity improvement",
  },
  {
    id: "milestones",
    label: "Milestones Hit",
    value: 291456,
    suffix: "+",
    icon: <Award className="h-6 w-6" />,
    color: "from-yellow-500 to-yellow-600",
    description: "Journey markers achieved",
  },
];

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-heading font-bold">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

export function CommunityStatsCounter() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h3 className="text-3xl md:text-4xl font-heading font-bold">
          Trusted by Thousands
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join a thriving community of ambitious professionals achieving their goals every day
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card elevated-card group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  {stat.icon}
                </div>

                <div>
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                  <div className="text-sm font-heading font-bold text-muted-foreground mt-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
