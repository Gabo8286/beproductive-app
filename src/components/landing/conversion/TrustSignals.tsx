import { Shield, Lock, Clock, Users, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is encrypted and protected",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "We never sell your information",
    },
    {
      icon: Clock,
      title: "Cancel Anytime",
      description: "No long-term commitment required",
    },
    {
      icon: Users,
      title: "10,000+ Active Users",
      description: "Join our growing community",
    },
    {
      icon: Award,
      title: "30-Day Money Back",
      description: "100% satisfaction guaranteed",
    },
    {
      icon: CheckCircle,
      title: "Free Forever Plan",
      description: "No credit card needed to start",
    },
  ];

  return (
    <section className="py-12 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-heading font-bold mb-2">
            Trusted by Thousands
          </h3>
          <p className="text-muted-foreground">
            Your success and security are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <signal.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold mb-1">{signal.title}</h4>
              <p className="text-xs text-muted-foreground">{signal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
