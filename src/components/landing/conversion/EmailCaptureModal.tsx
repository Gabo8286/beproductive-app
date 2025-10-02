import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  trigger: 'exit' | 'scroll' | 'time' | 'engagement';
}

const triggerMessages = {
  exit: {
    title: "Wait! Don't Miss Your Journey",
    subtitle: "Get our free productivity starter guide before you go",
    benefit: "7-day action plan to achieve your first big goal",
  },
  scroll: {
    title: "Love What You See?",
    subtitle: "Join 10,000+ ambitious professionals",
    benefit: "Weekly tips & strategies to maximize productivity",
  },
  time: {
    title: "Ready to Transform Your Productivity?",
    subtitle: "Start with our proven framework",
    benefit: "Free productivity assessment + personalized roadmap",
  },
  engagement: {
    title: "You're Making Great Progress!",
    subtitle: "Save your progress and continue later",
    benefit: "Resume your demo + exclusive early access",
  },
};

export function EmailCaptureModal({ isOpen, onClose, onSuccess, trigger }: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = triggerMessages[trigger];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Welcome! Check your email for your starter guide.");
    onSuccess(email);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 mx-auto">
                <Gift className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-heading font-bold text-center mb-2">
                {message.title}
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                {message.subtitle}
              </p>

              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">What you'll get:</p>
                    <p className="text-sm text-muted-foreground">{message.benefit}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={isSubmitting}
                />
                
                <Button
                  type="submit"
                  className="w-full apple-button h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Get My Free Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
