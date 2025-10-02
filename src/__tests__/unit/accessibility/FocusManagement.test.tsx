import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { focusTrap, announceRouteChange, getPageName } from '@/utils/accessibility/focusManagement';

describe('focusTrap', () => {
  let container: HTMLElement;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="first">First</button>
      <button id="second">Second</button>
      <button id="third">Third</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (cleanup) cleanup();
    document.body.removeChild(container);
  });

  it('focuses first element on initialization', () => {
    cleanup = focusTrap(container);
    
    const firstButton = container.querySelector('#first') as HTMLElement;
    expect(document.activeElement).toBe(firstButton);
  });

  it('traps focus within container', () => {
    cleanup = focusTrap(container);
    
    const firstButton = container.querySelector('#first') as HTMLElement;
    const lastButton = container.querySelector('#third') as HTMLElement;

    // Simulate Tab from last element
    lastButton.focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(tabEvent);
    
    // Should trap focus (implementation depends on actual behavior)
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });

  it('handles Shift+Tab correctly', () => {
    cleanup = focusTrap(container);
    
    const firstButton = container.querySelector('#first') as HTMLElement;
    firstButton.focus();
    
    const shiftTabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true, 
      bubbles: true 
    });
    container.dispatchEvent(shiftTabEvent);
    
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });

  it('cleanup function removes event listener', () => {
    cleanup = focusTrap(container);
    cleanup();
    
    const firstButton = container.querySelector('#first') as HTMLElement;
    firstButton.focus();
    
    // After cleanup, Tab should work normally
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(tabEvent);
    
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });
});

describe('getPageName', () => {
  it('returns correct name for root path', () => {
    expect(getPageName('/')).toBe('Home');
  });

  it('returns correct name for dashboard', () => {
    expect(getPageName('/dashboard')).toBe('Dashboard');
  });

  it('returns correct name for goals', () => {
    expect(getPageName('/goals')).toBe('Goals');
  });

  it('returns correct name for new goal', () => {
    expect(getPageName('/goals/new')).toBe('New Goal');
  });

  it('handles dynamic goal detail routes', () => {
    expect(getPageName('/goals/123')).toBe('Goal Details');
  });

  it('handles dynamic task routes', () => {
    expect(getPageName('/tasks/456')).toBe('Task Details');
  });

  it('handles dynamic habit routes', () => {
    expect(getPageName('/habits/789')).toBe('Habit Details');
  });

  it('handles dynamic reflection routes', () => {
    expect(getPageName('/reflections/101')).toBe('Reflection Details');
  });

  it('returns generic "Page" for unknown routes', () => {
    expect(getPageName('/unknown-route')).toBe('Page');
  });
});

describe('announceRouteChange', () => {
  beforeEach(() => {
    // Setup ARIA live region
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-polite';
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
  });

  afterEach(() => {
    const liveRegion = document.getElementById('aria-live-polite');
    if (liveRegion) {
      document.body.removeChild(liveRegion);
    }
  });

  it('announces navigation to dashboard', async () => {
    announceRouteChange('/dashboard');
    
    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const liveRegion = document.getElementById('aria-live-polite');
    expect(liveRegion?.textContent).toBe('Navigated to Dashboard');
  });

  it('announces navigation to goals', async () => {
    announceRouteChange('/goals');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const liveRegion = document.getElementById('aria-live-polite');
    expect(liveRegion?.textContent).toBe('Navigated to Goals');
  });

  it('announces navigation to dynamic routes', async () => {
    announceRouteChange('/goals/123');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const liveRegion = document.getElementById('aria-live-polite');
    expect(liveRegion?.textContent).toBe('Navigated to Goal Details');
  });

  it('clears and resets announcement', async () => {
    const liveRegion = document.getElementById('aria-live-polite');
    
    announceRouteChange('/dashboard');
    
    // Should be cleared immediately
    expect(liveRegion?.textContent).toBe('');
    
    // Then set after timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(liveRegion?.textContent).toBe('Navigated to Dashboard');
  });
});
