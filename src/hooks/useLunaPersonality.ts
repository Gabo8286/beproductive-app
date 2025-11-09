/**
 * useLunaPersonality Hook
 * Manages Luna AI personality state and interactions
 */

import { useState, useCallback, useEffect } from 'react';
import {
  LunaPersonalityType,
  LunaPersonalityResponse,
  PersonalityEngine,
  getPersonalityProfile
} from '@/shared/luna/personalities';

interface UseLunaPersonalityProps {
  defaultPersonality?: LunaPersonalityType;
  persistToStorage?: boolean;
}

interface UseLunaPersonalityReturn {
  // State
  currentPersonality: LunaPersonalityType;
  personalityEngine: PersonalityEngine;
  isLoading: boolean;

  // Actions
  switchPersonality: (personality: LunaPersonalityType) => void;
  generateTaskResponse: (
    action: 'created' | 'completed' | 'overdue' | 'reminder' | 'started',
    taskData: {
      title: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueDate?: Date;
      isRecurring?: boolean;
    }
  ) => LunaPersonalityResponse;
  generateHabitResponse: (
    action: 'streak_started' | 'streak_continued' | 'streak_broken' | 'milestone_reached',
    habitData: {
      name: string;
      currentStreak: number;
      longestStreak: number;
      category: string;
    }
  ) => LunaPersonalityResponse;
  generateGoalResponse: (
    action: 'created' | 'milestone_reached' | 'completed' | 'deadline_approaching' | 'stalled',
    goalData: {
      title: string;
      progress: number;
      targetDate?: Date;
      category: string;
    }
  ) => LunaPersonalityResponse;
  generateCheckIn: (timeOfDay: 'morning' | 'afternoon' | 'evening') => LunaPersonalityResponse;

  // Utilities
  getPersonalityProfile: () => any;
  getPersonalityName: () => string;
  getPersonalityDescription: () => string;
}

const STORAGE_KEY = 'luna-personality-preference';

export const useLunaPersonality = ({
  defaultPersonality = 'harmony',
  persistToStorage = true
}: UseLunaPersonalityProps = {}): UseLunaPersonalityReturn => {
  const [currentPersonality, setCurrentPersonality] = useState<LunaPersonalityType>(defaultPersonality);
  const [personalityEngine, setPersonalityEngine] = useState<PersonalityEngine>(() =>
    new PersonalityEngine(defaultPersonality)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load personality from storage on mount
  useEffect(() => {
    if (persistToStorage) {
      const storedPersonality = localStorage.getItem(STORAGE_KEY) as LunaPersonalityType;
      if (storedPersonality && storedPersonality !== currentPersonality) {
        setCurrentPersonality(storedPersonality);
        setPersonalityEngine(new PersonalityEngine(storedPersonality));
      }
    }
  }, []);

  // Save personality to storage when it changes
  useEffect(() => {
    if (persistToStorage) {
      localStorage.setItem(STORAGE_KEY, currentPersonality);
    }
  }, [currentPersonality, persistToStorage]);

  const switchPersonality = useCallback((personality: LunaPersonalityType) => {
    setIsLoading(true);

    try {
      setCurrentPersonality(personality);
      personalityEngine.switchPersonality(personality);

      // Analytics: Track personality switch
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'personality_switch', {
          event_category: 'luna_interaction',
          event_label: personality,
          value: 1
        });
      }
    } catch (error) {
      console.error('Error switching personality:', error);
    } finally {
      setIsLoading(false);
    }
  }, [personalityEngine]);

  const generateTaskResponse = useCallback((
    action: 'created' | 'completed' | 'overdue' | 'reminder' | 'started',
    taskData: {
      title: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueDate?: Date;
      isRecurring?: boolean;
    }
  ) => {
    return personalityEngine.generateTaskResponse(action, taskData);
  }, [personalityEngine]);

  const generateHabitResponse = useCallback((
    action: 'streak_started' | 'streak_continued' | 'streak_broken' | 'milestone_reached',
    habitData: {
      name: string;
      currentStreak: number;
      longestStreak: number;
      category: string;
    }
  ) => {
    return personalityEngine.generateHabitResponse(action, habitData);
  }, [personalityEngine]);

  const generateGoalResponse = useCallback((
    action: 'created' | 'milestone_reached' | 'completed' | 'deadline_approaching' | 'stalled',
    goalData: {
      title: string;
      progress: number;
      targetDate?: Date;
      category: string;
    }
  ) => {
    return personalityEngine.generateGoalResponse(action, goalData);
  }, [personalityEngine]);

  const generateCheckIn = useCallback((timeOfDay: 'morning' | 'afternoon' | 'evening') => {
    return personalityEngine.generateCheckInResponse(timeOfDay);
  }, [personalityEngine]);

  const getPersonalityProfileData = useCallback(() => {
    return getPersonalityProfile(currentPersonality);
  }, [currentPersonality]);

  const getPersonalityName = useCallback(() => {
    const profile = getPersonalityProfile(currentPersonality);
    return profile.name;
  }, [currentPersonality]);

  const getPersonalityDescription = useCallback(() => {
    const profile = getPersonalityProfile(currentPersonality);
    return profile.description;
  }, [currentPersonality]);

  return {
    // State
    currentPersonality,
    personalityEngine,
    isLoading,

    // Actions
    switchPersonality,
    generateTaskResponse,
    generateHabitResponse,
    generateGoalResponse,
    generateCheckIn,

    // Utilities
    getPersonalityProfile: getPersonalityProfileData,
    getPersonalityName,
    getPersonalityDescription
  };
};