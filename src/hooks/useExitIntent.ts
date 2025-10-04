import { useEffect, useState } from "react";

export function useExitIntent(delay: number = 1000) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport (common exit behavior)
      if (e.clientY <= 0 && !hasShown) {
        timeoutId = setTimeout(() => {
          setShowExitIntent(true);
          setHasShown(true);
        }, delay);
      }
    };

    const handleMouseEnter = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [delay, hasShown]);

  const resetExitIntent = () => {
    setShowExitIntent(false);
  };

  return { showExitIntent, resetExitIntent };
}
