import { motion } from "framer-motion";
import { Users, TrendingUp, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function SocialProofBanner() {
  const [stats, setStats] = useState({
    activeUsers: 10247,
    goalsCompleted: 45382,
    growthRate: 315,
  });

  useEffect(() => {
    // Simulate live counter updates
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        goalsCompleted: prev.goalsCompleted + Math.floor(Math.random() * 5),
        growthRate: prev.growthRate + (Math.random() > 0.5 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const proofItems = [
    {
      icon: Users,
      value: stats.activeUsers.toLocaleString(),
      label: "Active Users",
      color: "text-primary",
    },
    {
      icon: Target,
      value: stats.goalsCompleted.toLocaleString(),
      label: "Goals Achieved",
      color: "text-success",
    },
    {
      icon: TrendingUp,
      value: `${stats.growthRate}%`,
      label: "User Growth",
      color: "text-warning",
    },
    {
      icon: Zap,
      value: "4.9/5",
      label: "User Rating",
      color: "text-secondary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 rounded-2xl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {proofItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background/50 mb-3 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-heading font-bold mb-1">
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
