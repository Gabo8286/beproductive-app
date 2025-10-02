import { useEffect, useCallback, useState } from 'react';
import { ConversionEventType, ConversionEvent, PersonalizationData, CommitmentStep } from '@/types/conversion';

const STORAGE_KEY = 'beproductive_conversion_data';
const SESSION_KEY = 'beproductive_session_id';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useConversionTracking() {
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default
      }
    }
    return {
      behaviorPatterns: [],
      demoInteractions: [],
      timeOnSite: 0,
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      previousVisits: 0,
      scrollDepth: 0,
      engagementScore: 0,
    };
  });

  const [commitmentSteps, setCommitmentSteps] = useState<CommitmentStep[]>([
    { id: 'page_visit', level: 1, action: 'Visited landing page', completed: true, timestamp: new Date() },
    { id: 'email_capture', level: 2, action: 'Shared email for updates', completed: false },
    { id: 'demo_interaction', level: 3, action: 'Tried interactive demo', completed: false },
    { id: 'persona_selection', level: 4, action: 'Identified with persona', completed: false },
    { id: 'signup_start', level: 5, action: 'Started account creation', completed: false },
    { id: 'signup_complete', level: 6, action: 'Created account', completed: false },
  ]);

  const trackEvent = useCallback((
    eventType: ConversionEventType,
    metadata: Record<string, any> = {},
    value: number = 1
  ) => {
    const event: ConversionEvent = {
      eventType,
      timestamp: new Date(),
      sessionId: getSessionId(),
      metadata,
      value,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Conversion Event:', event);
    }

    // Update engagement score
    setPersonalizationData(prev => ({
      ...prev,
      engagementScore: prev.engagementScore + value,
    }));

    // Update commitment steps
    if (eventType === ConversionEventType.EMAIL_CAPTURE) {
      completeStep('email_capture');
    } else if (eventType === ConversionEventType.DEMO_START) {
      completeStep('demo_interaction');
    } else if (eventType === ConversionEventType.SIGNUP_START) {
      completeStep('signup_start');
    } else if (eventType === ConversionEventType.SIGNUP_COMPLETE) {
      completeStep('signup_complete');
    }

    // In production, send to analytics service
    // analytics.track(event);
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setCommitmentSteps(prev =>
      prev.map(step =>
        step.id === stepId && !step.completed
          ? { ...step, completed: true, timestamp: new Date() }
          : step
      )
    );
  }, []);

  const trackBehavior = useCallback((
    action: 'scroll' | 'click' | 'hover' | 'video_play' | 'demo_start',
    target: string,
    duration?: number
  ) => {
    setPersonalizationData(prev => ({
      ...prev,
      behaviorPatterns: [
        ...prev.behaviorPatterns.slice(-49), // Keep last 50 behaviors
        {
          action,
          target,
          timestamp: new Date(),
          duration,
        },
      ],
    }));
  }, []);

  const updateScrollDepth = useCallback((depth: number) => {
    setPersonalizationData(prev => ({
      ...prev,
      scrollDepth: Math.max(prev.scrollDepth, depth),
    }));
  }, []);

  // Track time on site
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setPersonalizationData(prev => ({
        ...prev,
        timeOnSite: prev.timeOnSite + 5,
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      updateScrollDepth(scrollPercentage);

      // Track scroll milestones
      if (scrollPercentage >= 25 && personalizationData.scrollDepth < 25) {
        trackEvent(ConversionEventType.SCROLL_MILESTONE, { milestone: 25 }, 2);
      } else if (scrollPercentage >= 50 && personalizationData.scrollDepth < 50) {
        trackEvent(ConversionEventType.SCROLL_MILESTONE, { milestone: 50 }, 3);
      } else if (scrollPercentage >= 75 && personalizationData.scrollDepth < 75) {
        trackEvent(ConversionEventType.SCROLL_MILESTONE, { milestone: 75 }, 4);
      } else if (scrollPercentage >= 90 && personalizationData.scrollDepth < 90) {
        trackEvent(ConversionEventType.SCROLL_MILESTONE, { milestone: 90 }, 5);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [personalizationData.scrollDepth, trackEvent, updateScrollDepth]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizationData));
  }, [personalizationData]);

  // Track previous visits
  useEffect(() => {
    setPersonalizationData(prev => ({
      ...prev,
      previousVisits: prev.previousVisits + 1,
    }));
    trackEvent(ConversionEventType.PAGE_VIEW, {}, 1);
  }, []);

  const getEngagementLevel = useCallback((): 'low' | 'medium' | 'high' => {
    const score = personalizationData.engagementScore;
    if (score >= 20) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  }, [personalizationData.engagementScore]);

  const getCommitmentProgress = useCallback((): number => {
    const completed = commitmentSteps.filter(s => s.completed).length;
    return Math.round((completed / commitmentSteps.length) * 100);
  }, [commitmentSteps]);

  return {
    personalizationData,
    commitmentSteps,
    trackEvent,
    trackBehavior,
    updateScrollDepth,
    completeStep,
    getEngagementLevel,
    getCommitmentProgress,
  };
}
