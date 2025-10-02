export enum ConversionEventType {
  PAGE_VIEW = 'page_view',
  EMAIL_CAPTURE = 'email_capture',
  DEMO_START = 'demo_start',
  DEMO_COMPLETE = 'demo_complete',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
  SIGNUP_START = 'signup_start',
  SIGNUP_COMPLETE = 'signup_complete',
  FIRST_LOGIN = 'first_login',
  CTA_CLICK = 'cta_click',
  SCROLL_MILESTONE = 'scroll_milestone',
  EXIT_INTENT = 'exit_intent',
}

export interface ConversionEvent {
  eventType: ConversionEventType;
  timestamp: Date;
  sessionId: string;
  metadata: Record<string, any>;
  value: number;
}

export interface UserBehavior {
  action: 'scroll' | 'click' | 'hover' | 'video_play' | 'demo_start';
  target: string;
  timestamp: Date;
  duration?: number;
}

export interface PersonalizationData {
  referralSource?: string;
  behaviorPatterns: UserBehavior[];
  demoInteractions: string[];
  timeOnSite: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  previousVisits: number;
  scrollDepth: number;
  engagementScore: number;
}

export interface CommitmentStep {
  id: string;
  level: number;
  action: string;
  completed: boolean;
  timestamp?: Date;
}
