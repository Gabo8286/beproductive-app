// Navigation and menu configurations
import { Briefcase, User, GraduationCap, Heart } from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
}

export interface OnboardingUserType {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  demo: string;
}

export interface SimpleUserType {
  id: string;
  label: string;
  description: string;
  icon: string;
}

// User types for onboarding flow
export const onboardingUserTypes: OnboardingUserType[] = [
  {
    id: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Building and scaling businesses',
    icon: Briefcase,
    color: 'bg-blue-500',
    demo: 'Gabriel\'s AI startup journey'
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Managing work and career goals',
    icon: User,
    color: 'bg-green-500',
    demo: 'Executive productivity workflow'
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Learning and academic success',
    icon: GraduationCap,
    color: 'bg-purple-500',
    demo: 'Student study planning'
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Life goals and wellness',
    icon: Heart,
    color: 'bg-pink-500',
    demo: 'Personal development focus'
  }
];

// Simple user types for other components
export const userTypes: SimpleUserType[] = [
  {
    id: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Building a business or startup',
    icon: '🚀'
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Leading teams and projects',
    icon: '👥'
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    description: 'Working independently on multiple projects',
    icon: '💼'
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Studying and learning',
    icon: '📚'
  },
  {
    id: 'creator',
    label: 'Creator',
    description: 'Content creation and creative work',
    icon: '🎨'
  }
];

export interface SocialProvider {
  id: string;
  name: string;
  icon: string;
}

export const socialProviders: SocialProvider[] = [
  { id: 'google', name: 'Google', icon: '🔍' },
  { id: 'github', name: 'GitHub', icon: '🐙' },
  { id: 'discord', name: 'Discord', icon: '💬' }
];