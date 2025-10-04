import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  metric?: {
    label: string;
    value: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Product Manager",
    company: "Tech Startup",
    content:
      "BeProductive transformed how I manage my goals. The journey framework helped me launch two products this quarter while maintaining work-life balance.",
    rating: 5,
    avatar: "SC",
    metric: {
      label: "Goals Completed",
      value: "12/15",
    },
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    company: "Fortune 500",
    content:
      "The habit tracking and reflection features helped me build a consistent learning routine. I've completed 5 certifications in 6 months!",
    rating: 5,
    avatar: "MR",
    metric: {
      label: "Study Streak",
      value: "127 days",
    },
  },
  {
    id: "3",
    name: "Emily Watson",
    role: "Graduate Student",
    company: "Stanford University",
    content:
      "As a PhD student, staying organized is crucial. BeProductive's milestone tracking keeps my research on schedule and my advisor impressed.",
    rating: 5,
    avatar: "EW",
    metric: {
      label: "Thesis Progress",
      value: "85%",
    },
  },
  {
    id: "4",
    name: "David Kim",
    role: "Entrepreneur",
    company: "SaaS Founder",
    content:
      "From idea to launch in 90 days! The visual progress tracking and celebration features kept me motivated through the challenging early stages.",
    rating: 5,
    avatar: "DK",
    metric: {
      label: "Launch Timeline",
      value: "On Track",
    },
  },
  {
    id: "5",
    name: "Priya Sharma",
    role: "Team Lead",
    company: "Design Agency",
    content:
      "My team's productivity increased by 40% after we started using BeProductive. The collaboration features are game-changing.",
    rating: 5,
    avatar: "PS",
    metric: {
      label: "Team Efficiency",
      value: "+40%",
    },
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const current = testimonials[currentIndex];

  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <Card className="glass-card">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-[auto,1fr] gap-8 items-start">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {current.avatar}
                    </div>
                    {current.metric && (
                      <div className="text-center">
                        <div className="text-2xl font-heading font-bold text-primary">
                          {current.metric.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {current.metric.label}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="space-y-4">
                    <Quote className="h-8 w-8 text-primary/20" />

                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: current.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <p className="text-lg md:text-xl leading-relaxed">
                      "{current.content}"
                    </p>

                    <div>
                      <div className="font-heading font-bold text-lg">
                        {current.name}
                      </div>
                      <div className="text-muted-foreground">
                        {current.role} at {current.company}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          onMouseEnter={() => setIsAutoPlaying(false)}
          className="apple-button glass-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          onMouseEnter={() => setIsAutoPlaying(false)}
          className="apple-button glass-card"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center glass-card p-4 rounded-xl">
          <div className="text-3xl font-heading font-bold text-primary">
            10K+
          </div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </div>
        <div className="text-center glass-card p-4 rounded-xl">
          <div className="text-3xl font-heading font-bold text-success">
            500K+
          </div>
          <div className="text-sm text-muted-foreground">Goals Completed</div>
        </div>
        <div className="text-center glass-card p-4 rounded-xl">
          <div className="text-3xl font-heading font-bold text-secondary">
            4.9★
          </div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </div>
      </div>
    </div>
  );
}
