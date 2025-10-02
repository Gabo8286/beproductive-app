import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Zap,
  Award,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

const trustIndicators: TrustIndicator[] = [
  {
    id: "security",
    title: "Bank-Level Security",
    description: "256-bit encryption & GDPR compliant",
    icon: <Shield className="h-5 w-5" />,
    badge: "SOC 2 Type II",
    color: "from-blue-500/10 to-blue-600/10",
  },
  {
    id: "privacy",
    title: "Privacy First",
    description: "Your data stays yours, always",
    icon: <Lock className="h-5 w-5" />,
    badge: "ISO 27001",
    color: "from-green-500/10 to-green-600/10",
  },
  {
    id: "uptime",
    title: "99.9% Uptime",
    description: "Reliable when you need it most",
    icon: <Zap className="h-5 w-5" />,
    badge: "24/7 Support",
    color: "from-yellow-500/10 to-yellow-600/10",
  },
  {
    id: "rating",
    title: "4.9/5 Rating",
    description: "Loved by 10,000+ users",
    icon: <Star className="h-5 w-5" />,
    badge: "Highly Rated",
    color: "from-purple-500/10 to-purple-600/10",
  },
];

const achievements = [
  {
    id: "growth",
    metric: "300%",
    label: "User Growth YoY",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: "satisfaction",
    metric: "94%",
    label: "User Satisfaction",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    id: "active",
    metric: "10K+",
    label: "Active Daily Users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "awards",
    metric: "15+",
    label: "Industry Awards",
    icon: <Award className="h-4 w-4" />,
  },
];

export function TrustBadges() {
  return (
    <div className="space-y-8">
      {/* Trust Indicators */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustIndicators.map((indicator, index) => (
          <motion.div
            key={indicator.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card group hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${indicator.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {indicator.icon}
                  </div>
                  {indicator.badge && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium"
                    >
                      {indicator.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-heading font-bold text-sm mb-1">
                    {indicator.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {indicator.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievement Metrics */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {achievement.icon}
                  </div>
                  <div className="text-3xl font-heading font-bold text-primary">
                    {achievement.metric}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {achievement.label}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Press Mentions */}
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
          Featured In
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="text-xl font-bold text-muted-foreground">TechCrunch</div>
          <div className="text-xl font-bold text-muted-foreground">Forbes</div>
          <div className="text-xl font-bold text-muted-foreground">Product Hunt</div>
          <div className="text-xl font-bold text-muted-foreground">The Verge</div>
          <div className="text-xl font-bold text-muted-foreground">Wired</div>
        </div>
      </div>
    </div>
  );
}
