import { useCallback } from "react";

interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

export function useSpringAnimation(config: SpringConfig = {}) {
  const { tension = 170, friction = 26, mass = 1 } = config;

  const animate = useCallback(
    (
      element: HTMLElement,
      properties: Record<string, number>,
      duration = 300,
    ) => {
      const startTime = Date.now();
      const startValues: Record<string, number> = {};

      // Get initial values
      Object.keys(properties).forEach((prop) => {
        const computedStyle = window.getComputedStyle(element);
        const currentValue = parseFloat(
          computedStyle.getPropertyValue(`--${prop}`) || "0",
        );
        startValues[prop] = currentValue;
      });

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Spring easing function
        const springProgress =
          1 -
          Math.pow(1 - progress, 3) *
            Math.cos((progress * Math.PI * tension) / 100);

        Object.keys(properties).forEach((prop) => {
          const start = startValues[prop];
          const end = properties[prop];
          const current = start + (end - start) * springProgress;
          element.style.setProperty(`--${prop}`, current.toString());
        });

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    },
    [tension, friction, mass],
  );

  return { animate };
}
