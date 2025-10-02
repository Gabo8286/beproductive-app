import { useEffect } from "react";
import { usePersonalization } from "./usePersonalization";

export function useTheme() {
  const { userPreferences } = usePersonalization();

  useEffect(() => {
    const root = document.documentElement;

    if (userPreferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        root.classList.toggle('dark', mediaQuery.matches);
      };

      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.toggle('dark', userPreferences.theme === 'dark');
    }
  }, [userPreferences.theme]);
}
