import { useState, useEffect } from "react";

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else if (width < 1280) setBreakpoint('desktop');
      else setBreakpoint('large');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      case 'large': return 4;
      default: return 3;
    }
  };

  return { breakpoint, getGridCols };
}
