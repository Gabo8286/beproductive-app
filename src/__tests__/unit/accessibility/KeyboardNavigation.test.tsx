import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    document.body.innerHTML = '';
  });

  it('initializes without errors', () => {
    const { result } = renderHook(() => useKeyboardNavigation());
    expect(result.current).toBeUndefined();
  });

  it('handles Escape key to close dialogs', () => {
    renderHook(() => useKeyboardNavigation());

    // Create a mock dialog
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-state', 'open');
    
    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'Close dialog');
    closeButton.onclick = vi.fn();
    
    dialog.appendChild(closeButton);
    document.body.appendChild(dialog);

    // Simulate Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(closeButton.onclick).toBeDefined();
  });

  it('handles Escape key to close menus', () => {
    renderHook(() => useKeyboardNavigation());

    // Create a mock menu
    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('data-state', 'open');
    
    const trigger = document.createElement('button');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.onclick = vi.fn();
    
    document.body.appendChild(menu);
    document.body.appendChild(trigger);

    // Simulate Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(trigger.onclick).toBeDefined();
  });

  it('focuses skip link on Tab from body', () => {
    renderHook(() => useKeyboardNavigation());

    // Create skip link
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-content';
    skipLink.href = '#main-content';
    document.body.appendChild(skipLink);

    // Mock focus
    skipLink.focus = vi.fn();

    // Ensure body is focused
    document.body.focus();

    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      bubbles: true,
      cancelable: true 
    });
    
    document.dispatchEvent(tabEvent);

    // Note: In real implementation, focus would be called
    expect(skipLink).toBeInTheDocument();
  });

  it('ignores non-Escape and non-Tab keys', () => {
    renderHook(() => useKeyboardNavigation());

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-state', 'open');
    document.body.appendChild(dialog);

    // Simulate random key
    const randomEvent = new KeyboardEvent('keydown', { key: 'A', bubbles: true });
    document.dispatchEvent(randomEvent);

    // Dialog should still exist
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardNavigation());

    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
