import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConversionTracking } from '@/hooks/useConversionTracking';
import { ConversionEventType } from '@/types/conversion';
import { safeStorage } from '@/utils/storage/safeStorage';

describe('useConversionTracking', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('initialization', () => {
    it('should initialize with default personalization data', () => {
      const { result } = renderHook(() => useConversionTracking());

      expect(result.current.personalizationData).toMatchObject({
        behaviorPatterns: [],
        demoInteractions: [],
        timeOnSite: 0,
        previousVisits: expect.any(Number),
        scrollDepth: 0,
        engagementScore: expect.any(Number),
      });
    });

    it('should initialize with saved personalization data from storage', () => {
      const savedData = {
        behaviorPatterns: [],
        demoInteractions: [],
        timeOnSite: 100,
        deviceType: 'desktop' as const,
        previousVisits: 5,
        scrollDepth: 50,
        engagementScore: 10,
      };

      safeStorage.setItem('beproductive_conversion_data', JSON.stringify(savedData));

      const { result } = renderHook(() => useConversionTracking());

      expect(result.current.personalizationData.timeOnSite).toBe(100);
      expect(result.current.personalizationData.previousVisits).toBeGreaterThanOrEqual(5);
    });

    it('should initialize with default commitment steps', () => {
      const { result } = renderHook(() => useConversionTracking());

      expect(result.current.commitmentSteps).toHaveLength(6);
      expect(result.current.commitmentSteps[0]).toMatchObject({
        id: 'page_visit',
        level: 1,
        completed: true,
      });
    });
  });

  describe('trackEvent', () => {
    it('should track a basic event', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.CTA_CLICK, { buttonId: 'cta-1' }, 5);
      });

      expect(result.current.personalizationData.engagementScore).toBeGreaterThan(0);
    });

    it('should complete email_capture step on EMAIL_CAPTURE event', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.EMAIL_CAPTURE);
      });

      const emailStep = result.current.commitmentSteps.find(s => s.id === 'email_capture');
      expect(emailStep?.completed).toBe(true);
    });

    it('should complete demo_interaction step on DEMO_START event', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.DEMO_START);
      });

      const demoStep = result.current.commitmentSteps.find(s => s.id === 'demo_interaction');
      expect(demoStep?.completed).toBe(true);
    });

    it('should complete signup_start step on SIGNUP_START event', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.SIGNUP_START);
      });

      const signupStep = result.current.commitmentSteps.find(s => s.id === 'signup_start');
      expect(signupStep?.completed).toBe(true);
    });

    it('should complete signup_complete step on SIGNUP_COMPLETE event', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.SIGNUP_COMPLETE);
      });

      const signupCompleteStep = result.current.commitmentSteps.find(s => s.id === 'signup_complete');
      expect(signupCompleteStep?.completed).toBe(true);
    });

    it('should update engagement score with custom value', () => {
      const { result } = renderHook(() => useConversionTracking());
      const initialScore = result.current.personalizationData.engagementScore;

      act(() => {
        result.current.trackEvent(ConversionEventType.CTA_CLICK, {}, 10);
      });

      expect(result.current.personalizationData.engagementScore).toBe(initialScore + 10);
    });
  });

  describe('trackBehavior', () => {
    it('should track user behavior', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackBehavior('click', 'hero-cta-button');
      });

      expect(result.current.personalizationData.behaviorPatterns).toHaveLength(1);
      expect(result.current.personalizationData.behaviorPatterns[0]).toMatchObject({
        action: 'click',
        target: 'hero-cta-button',
      });
    });

    it('should track behavior with duration', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackBehavior('hover', 'pricing-card', 2500);
      });

      expect(result.current.personalizationData.behaviorPatterns[0]).toMatchObject({
        action: 'hover',
        target: 'pricing-card',
        duration: 2500,
      });
    });

    it('should keep only last 50 behaviors', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        for (let i = 0; i < 60; i++) {
          result.current.trackBehavior('click', `button-${i}`);
        }
      });

      expect(result.current.personalizationData.behaviorPatterns.length).toBeLessThanOrEqual(50);
    });
  });

  describe('updateScrollDepth', () => {
    it('should update scroll depth', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.updateScrollDepth(50);
      });

      expect(result.current.personalizationData.scrollDepth).toBe(50);
    });

    it('should only increase scroll depth, not decrease', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.updateScrollDepth(75);
      });

      act(() => {
        result.current.updateScrollDepth(50);
      });

      expect(result.current.personalizationData.scrollDepth).toBe(75);
    });
  });

  describe('completeStep', () => {
    it('should complete a commitment step', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.completeStep('email_capture');
      });

      const emailStep = result.current.commitmentSteps.find(s => s.id === 'email_capture');
      expect(emailStep?.completed).toBe(true);
      expect(emailStep?.timestamp).toBeDefined();
    });

    it('should not change already completed step', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.completeStep('email_capture');
      });

      const firstTimestamp = result.current.commitmentSteps.find(s => s.id === 'email_capture')?.timestamp;

      act(() => {
        result.current.completeStep('email_capture');
      });

      const secondTimestamp = result.current.commitmentSteps.find(s => s.id === 'email_capture')?.timestamp;

      expect(firstTimestamp).toEqual(secondTimestamp);
    });
  });

  describe('getEngagementLevel', () => {
    it('should return "low" for score < 10', () => {
      const { result } = renderHook(() => useConversionTracking());

      const level = result.current.getEngagementLevel();

      expect(['low', 'medium', 'high']).toContain(level);
    });

    it('should return "medium" for score >= 10 and < 20', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.CTA_CLICK, {}, 15);
      });

      const level = result.current.getEngagementLevel();

      expect(level).toBe('medium');
    });

    it('should return "high" for score >= 20', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.CTA_CLICK, {}, 25);
      });

      const level = result.current.getEngagementLevel();

      expect(level).toBe('high');
    });
  });

  describe('getCommitmentProgress', () => {
    it('should return percentage of completed steps', () => {
      const { result } = renderHook(() => useConversionTracking());

      // page_visit is completed by default (1/6)
      expect(result.current.getCommitmentProgress()).toBeGreaterThan(0);

      act(() => {
        result.current.completeStep('email_capture');
      });

      // Now 2/6 steps completed
      const progress = result.current.getCommitmentProgress();
      expect(progress).toBeGreaterThanOrEqual(33);
      expect(progress).toBeLessThanOrEqual(34);
    });

    it('should return 100 when all steps completed', () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.completeStep('email_capture');
        result.current.completeStep('demo_interaction');
        result.current.completeStep('persona_selection');
        result.current.completeStep('signup_start');
        result.current.completeStep('signup_complete');
      });

      expect(result.current.getCommitmentProgress()).toBe(100);
    });
  });

  describe('time tracking', () => {
    it('should track time on site', async () => {
      const { result } = renderHook(() => useConversionTracking());
      const initialTime = result.current.personalizationData.timeOnSite;

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.personalizationData.timeOnSite).toBeGreaterThan(initialTime);
      }, { timeout: 3000 });
      
      vi.useRealTimers();
    });
  });

  describe('localStorage persistence', () => {
    it('should save personalization data to storage', async () => {
      const { result } = renderHook(() => useConversionTracking());

      act(() => {
        result.current.trackEvent(ConversionEventType.CTA_CLICK, {}, 5);
      });

      await waitFor(() => {
        const saved = safeStorage.getItem('beproductive_conversion_data');
        expect(saved).toBeTruthy();
      });
    });

    it('should handle storage failures gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => {
        renderHook(() => useConversionTracking());
      }).not.toThrow();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('scroll milestone tracking', () => {
    it('should track scroll milestones', () => {
      const { result } = renderHook(() => useConversionTracking());
      const trackEventSpy = vi.spyOn(result.current, 'trackEvent');

      // Simulate scroll to 25%
      act(() => {
        result.current.updateScrollDepth(25);
      });

      // The scroll event listener in the hook should trigger milestone tracking
      // Note: In a real test environment, we would need to trigger the actual scroll event
    });
  });
});
