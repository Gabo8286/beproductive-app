/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
  target?: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content', target: 'main' },
  { href: '#navigation', label: 'Skip to navigation', target: 'nav' },
  { href: '#search', label: 'Skip to search', target: '[role="search"]' },
  { href: '#sidebar', label: 'Skip to sidebar', target: 'aside' },
  { href: '#footer', label: 'Skip to footer', target: 'footer' },
];

export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className }: SkipLinksProps) {
  const handleSkipToElement = (target: string, event: React.MouseEvent) => {
    event.preventDefault();

    // Try to find the target element by ID first, then by selector
    let targetElement = document.getElementById(target.replace('#', ''));

    if (!targetElement && target.startsWith('#')) {
      targetElement = document.querySelector(target);
    }

    if (!targetElement && links.find(link => link.href === target)?.target) {
      const targetSelector = links.find(link => link.href === target)?.target;
      if (targetSelector) {
        targetElement = document.querySelector(targetSelector);
      }
    }

    if (targetElement) {
      // Ensure the element is focusable
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }

      // Focus and scroll to the element
      targetElement.focus();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Announce to screen readers
      const announcement = `Skipped to ${links.find(link => link.href === target)?.label || 'content'}`;
      announceToScreenReader(announcement);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    announcer.textContent = message;
    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  return (
    <div
      className={cn(
        'sr-only focus-within:not-sr-only',
        'fixed top-0 left-0 z-[9999]',
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
        'shadow-lg rounded-br-lg p-2',
        className
      )}
      role="navigation"
      aria-label="Skip links"
    >
      <ul className="flex flex-col space-y-1">
        {links.map((link, index) => (
          <li key={link.href}>
            <motion.a
              href={link.href}
              className={cn(
                'block px-3 py-2 text-sm font-medium',
                'text-blue-600 dark:text-blue-400',
                'hover:text-blue-800 dark:hover:text-blue-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'rounded transition-colors'
              )}
              onClick={(e) => handleSkipToElement(link.href, e)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {link.label}
            </motion.a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Hook for programmatic skip navigation
export function useSkipNavigation() {
  const skipToContent = () => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skipToNavigation = () => {
    const navigation = document.querySelector('nav, [role="navigation"], #navigation');
    if (navigation) {
      (navigation as HTMLElement).focus();
      (navigation as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skipToSearch = () => {
    const search = document.querySelector('[role="search"], #search, input[type="search"]');
    if (search) {
      (search as HTMLElement).focus();
      (search as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skipToElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      (element as HTMLElement).focus();
      (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    skipToContent,
    skipToNavigation,
    skipToSearch,
    skipToElement,
  };
}