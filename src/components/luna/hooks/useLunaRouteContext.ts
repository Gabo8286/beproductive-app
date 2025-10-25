import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLuna } from '@/components/luna/context/LunaContext';

/**
 * Hook that automatically sets Luna's context based on the current route
 * Maps URL paths to appropriate Luna contexts (capture, plan, engage, general)
 */
export const useLunaRouteContext = () => {
  const location = useLocation();
  const { setContext } = useLuna();

  useEffect(() => {
    const path = location.pathname;
    
    // Map routes to Luna contexts
    if (path.includes('/capture') || path === '/dashboard' || path === '/') {
      setContext('capture');
    } else if (
      path.includes('/plan') || 
      path.includes('/goals') || 
      path.includes('/tasks') || 
      path.includes('/projects') ||
      path.includes('/notes')
    ) {
      setContext('plan');
    } else if (
      path.includes('/engage') ||
      path.includes('/habits') ||
      path.includes('/reflections') ||
      path.includes('/calendar') ||
      path.includes('/pomodoro')
    ) {
      setContext('engage');
    } else {
      setContext('general');
    }
  }, [location.pathname, setContext]);
};
