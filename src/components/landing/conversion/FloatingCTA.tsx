import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface FloatingCTAProps {
  scrollThreshold?: number;
  engagementLevel: 'low' | 'medium' | 'high';
}

export function FloatingCTA({ scrollThreshold = 50, engagementLevel }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const ctaMessages = {
    low: {
      text: "Start Your Journey Free",
      badge: "Free Forever Plan",
    },
    medium: {
      text: "Ready to Transform?",
      badge: "Join 10K+ Users",
    },
    high: {
      text: "Create Your Account Now",
      badge: "You're Almost There!",
    },
  };

  const message = ctaMessages[engagementLevel];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="glass-card px-6 py-4 flex items-center gap-4 shadow-2xl">
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {message.badge}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required
              </p>
            </div>
            <Button
              className="apple-button shadow-lg hover:shadow-xl"
              size="lg"
              asChild
            >
              <Link to="/signup">
                {message.text}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
