/**
 * Focus Manager Component
 * Manages focus states and provides focus trapping for modals/dialogs
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export function FocusManager({
  children,
  trapFocus = false,
  autoFocus = false,
  restoreFocus = true,
  className,
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { settings, announceToScreenReader } = useAccessibility();

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  // Handle keyboard navigation within focus trap
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !settings.keyboardNavigation) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: Move backwards
        if (activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: Move forwards
        if (activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Escape key to exit focus trap (if applicable)
    if (event.key === 'Escape' && trapFocus) {
      // This should be handled by parent component
      // Just announce the action
      announceToScreenReader('Pressed escape to exit focus area');
    }
  }, [trapFocus, settings.keyboardNavigation, getFocusableElements, announceToScreenReader]);

  // Set up focus management
  useEffect(() => {
    if (!containerRef.current) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Auto focus the first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Add keyboard event listener for focus trapping
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Remove event listener
      if (trapFocus) {
        document.removeEventListener('keydown', handleKeyDown);
      }

      // Restore focus to previously focused element
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, trapFocus, restoreFocus, handleKeyDown, getFocusableElements]);

  // Focus visible indicator styles
  useEffect(() => {
    if (!settings.focusVisible) return;

    const style = document.createElement('style');
    style.textContent = `
      .focus-manager *:focus-visible {
        outline: 2px solid var(--color-primary, #3b82f6) !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }

      .focus-manager button:focus-visible,
      .focus-manager [role="button"]:focus-visible {
        box-shadow: 0 0 0 2px var(--color-background, #ffffff), 0 0 0 4px var(--color-primary, #3b82f6) !important;
      }

      .focus-manager input:focus-visible,
      .focus-manager textarea:focus-visible,
      .focus-manager select:focus-visible {
        border-color: var(--color-primary, #3b82f6) !important;
        box-shadow: 0 0 0 1px var(--color-primary, #3b82f6) !important;
      }

      .focus-manager a:focus-visible {
        text-decoration: underline !important;
        text-decoration-thickness: 2px !important;
        text-underline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [settings.focusVisible]);

  return (
    <div
      ref={containerRef}
      className={`focus-manager ${className || ''}`}
      data-focus-trap={trapFocus}
      data-auto-focus={autoFocus}
      data-restore-focus={restoreFocus}
    >
      {children}
    </div>
  );
}

// Hook for focus management utilities
export function useFocusManagement() {
  const { settings, announceToScreenReader } = useAccessibility();

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (!element || !settings.keyboardNavigation) return;

    element.focus();
    announceToScreenReader(`Focused on ${element.getAttribute('aria-label') || element.tagName.toLowerCase()}`);
  }, [settings.keyboardNavigation, announceToScreenReader]);

  const moveFocusToNext = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;

    focusElement(focusableElements[nextIndex]);
  }, [focusElement]);

  const moveFocusToPrevious = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(activeElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;

    focusElement(focusableElements[prevIndex]);
  }, [focusElement]);

  const focusFirstElement = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const firstFocusable = root.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    focusElement(firstFocusable);
  }, [focusElement]);

  const focusLastElement = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = Array.from(
      root.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1]);
    }
  }, [focusElement]);

  return {
    focusElement,
    moveFocusToNext,
    moveFocusToPrevious,
    focusFirstElement,
    focusLastElement,
  };
}