import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface InteractiveOverlayProps {
  title: string;
  description: string;
  highlightTarget?: string;
  onNext: () => void;
  onPrevious?: () => void;
  onSkip: () => void;
  showPrevious: boolean;
}

export function InteractiveOverlay({
  title,
  description,
  highlightTarget,
  onNext,
  onPrevious,
  onSkip,
  showPrevious
}: InteractiveOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (highlightTarget) {
      const element = document.querySelector(highlightTarget);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [highlightTarget]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Backdrop with cutout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
          onClick={onNext}
        />

        {/* Highlight area */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 4px hsl(var(--primary) / 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
          </motion.div>
        )}

        {/* Instruction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-card p-6 max-w-md pointer-events-auto"
        >
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-xl font-heading font-bold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {description}
          </p>

          <div className="flex gap-2">
            {showPrevious && onPrevious && (
              <Button
                variant="outline"
                onClick={onPrevious}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={onNext}
              className="flex-1 apple-button"
            >
              {highlightTarget ? 'Got it' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Click anywhere or press Enter to continue
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
