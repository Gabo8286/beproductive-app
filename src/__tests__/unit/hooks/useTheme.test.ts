import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';
import * as usePersonalizationModule from '@/hooks/usePersonalization';

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should apply dark theme when preference is dark', () => {
    vi.spyOn(usePersonalizationModule, 'usePersonalization').mockReturnValue({
      userPreferences: { theme: 'dark' },
    } as any);

    renderHook(() => useTheme());

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should apply light theme when preference is light', () => {
    vi.spyOn(usePersonalizationModule, 'usePersonalization').mockReturnValue({
      userPreferences: { theme: 'light' },
    } as any);

    renderHook(() => useTheme());

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should respect system preference when theme is auto', () => {
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    window.matchMedia = mockMatchMedia as any;

    vi.spyOn(usePersonalizationModule, 'usePersonalization').mockReturnValue({
      userPreferences: { theme: 'auto' },
    } as any);

    renderHook(() => useTheme());

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
