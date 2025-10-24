/**
 * Screen Reader Announcements Hook
 * Provides polite and assertive announcements for assistive technologies
 */

import { useCallback, useRef } from 'react';

interface ScreenReaderOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create announcement element if it doesn't exist
  const ensureAnnouncementElement = useCallback(() => {
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.setAttribute('class', 'sr-only');
      element.style.position = 'absolute';
      element.style.left = '-10000px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      document.body.appendChild(element);
      announcementRef.current = element;
    }
    return announcementRef.current;
  }, []);

  // Announce message to screen readers
  const announce = useCallback((
    message: string,
    options: ScreenReaderOptions = {}
  ) => {
    const { priority = 'polite', delay = 100 } = options;

    const element = ensureAnnouncementElement();
    element.setAttribute('aria-live', priority);

    // Clear previous content
    element.textContent = '';

    // Add new content after a brief delay to ensure it's announced
    setTimeout(() => {
      element.textContent = message;
    }, delay);

    // Clear content after announcement to avoid repeated reading
    setTimeout(() => {
      element.textContent = '';
    }, delay + 3000);
  }, [ensureAnnouncementElement]);

  // Announce navigation changes
  const announceNavigation = useCallback((hubName: string, action: string) => {
    const message = `${action} ${hubName}`;
    announce(message, { priority: 'polite' });
  }, [announce]);

  // Announce expansion states
  const announceExpansion = useCallback((hubName: string, isExpanded: boolean) => {
    const message = isExpanded
      ? `${hubName} expanded. Sub-navigation available.`
      : `${hubName} collapsed.`;
    announce(message, { priority: 'polite' });
  }, [announce]);

  // Announce gesture feedback
  const announceGesture = useCallback((gesture: string, result: string) => {
    const message = `${gesture} gesture: ${result}`;
    announce(message, { priority: 'polite' });
  }, [announce]);

  // Announce keyboard shortcuts
  const announceShortcut = useCallback((shortcut: string, action: string) => {
    const message = `Keyboard shortcut ${shortcut}: ${action}`;
    announce(message, { priority: 'polite' });
  }, [announce]);

  return {
    announce,
    announceNavigation,
    announceExpansion,
    announceGesture,
    announceShortcut,
  };
}