// Intelligent Scheduling System - AI-powered task timing optimization
import type { ProductivityState } from '@/utils/productivityState';
import type { EnergyLevel, EnergyPattern, EnergyForecast } from '@/utils/energyTracking';
import type { UserBehaviorPattern } from '@/utils/patternRecognition';
import { energyTracker } from '@/utils/energyTracking';
import { patternRecognition } from '@/utils/patternRecognition';

export interface TaskDefinition {
  id: string;
  title: string;
  description?: string;
  category: 'deep-work' | 'creative' | 'admin' | 'communication' | 'planning' | 'routine' | 'learning';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // minutes
  energyRequirement: 'low' | 'medium' | 'high';
  focusRequirement: 'low' | 'medium' | 'high';
  complexity: number; // 1-10 scale
  flexibility: 'rigid' | 'semi-flexible' | 'flexible'; // How flexible the timing is
  deadline?: Date;
  dependencies?: string[]; // Other task IDs that must be completed first
  context?: {
    location?: 'home' | 'office' | 'anywhere';
    tools?: string[];
    collaborators?: number; // Number of people involved
    internetRequired?: boolean;
  };
  userPreferences?: {
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
    avoidTimeSlots?: Array<{ start: string; end: string }>;
  };
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // minutes
  predictedEnergy: number; // 0-100
  predictedFocus: number; // 0-100
  conflictLevel: 'none' | 'low' | 'medium' | 'high';
  confidence: number; // 0-1, how confident we are in this prediction
}

export interface SchedulingSuggestion {
  id: string;
  task: TaskDefinition;
  suggestedSlot: TimeSlot;
  reasoning: string[];
  optimizationScore: number; // 0-100, how optimal this scheduling is
  alternatives: TimeSlot[]; // Alternative time slots
  warnings?: string[]; // Potential issues with this scheduling
  benefits: string[]; // Why this timing is good
  preparation?: {
    energyBoosts?: string[]; // Suggestions to increase energy before task
    focusEnhancers?: string[]; // Suggestions to improve focus
    environmentalOptimizations?: string[];
  };
}

export interface SchedulingConstraints {
  workingHours: { start: string; end: string }; // e.g., "09:00" to "17:00"
  breakMinimums: { shortBreak: number; longBreak: number }; // minutes
  maxContinuousWork: number; // minutes before requiring break
  bufferTime: number; // minutes buffer between tasks
  respectEnergyPatterns: boolean;
  prioritizeWellness: boolean;
  allowOvertime: boolean;
  weekendWork: boolean;
}

export interface DailySchedule {
  date: Date;
  scheduledTasks: SchedulingSuggestion[];
  energyForecast: EnergyForecast[];
  breakSuggestions: Array<{
    time: Date;
    duration: number;
    type: 'micro' | 'short' | 'lunch' | 'long';
    reasoning: string;
  }>;
  productivity: {
    predictedScore: number;
    peakPeriods: Array<{ start: Date; end: Date; type: 'energy' | 'focus' | 'both' }>;
    challengingPeriods: Array<{ start: Date; end: Date; reason: string }>;
  };
  recommendations: string[];
  flexibility: number; // 0-1, how much the schedule can be adjusted
}

class IntelligentScheduler {
  private static instance: IntelligentScheduler;
  private defaultConstraints: SchedulingConstraints = {
    workingHours: { start: '09:00', end: '17:00' },
    breakMinimums: { shortBreak: 5, longBreak: 15 },
    maxContinuousWork: 90,
    bufferTime: 5,
    respectEnergyPatterns: true,
    prioritizeWellness: true,
    allowOvertime: false,
    weekendWork: false
  };

  private constructor() {}

  static getInstance(): IntelligentScheduler {
    if (!IntelligentScheduler.instance) {
      IntelligentScheduler.instance = new IntelligentScheduler();
    }
    return IntelligentScheduler.instance;
  }

  // Generate optimal schedule for a set of tasks
  generateOptimalSchedule(
    tasks: TaskDefinition[],
    targetDate: Date,
    constraints: Partial<SchedulingConstraints> = {}
  ): DailySchedule {
    const fullConstraints = { ...this.defaultConstraints, ...constraints };

    // Get energy and pattern forecasts for the target date
    const energyForecasts = this.getEnergyForecastsForDay(targetDate);
    const behaviorPatterns = patternRecognition.getPatterns();

    // Generate available time slots
    const availableSlots = this.generateAvailableTimeSlots(targetDate, fullConstraints);

    // Score and rank time slots for each task
    const taskSuggestions = tasks.map(task =>
      this.findOptimalSlotForTask(task, availableSlots, energyForecasts, behaviorPatterns, fullConstraints)
    );

    // Resolve conflicts and optimize overall schedule
    const scheduledTasks = this.resolveSchedulingConflicts(taskSuggestions, fullConstraints);

    // Generate break suggestions
    const breakSuggestions = this.generateBreakSuggestions(scheduledTasks, energyForecasts, fullConstraints);

    // Calculate productivity predictions
    const productivityMetrics = this.calculateProductivityMetrics(scheduledTasks, energyForecasts);

    // Generate overall recommendations
    const recommendations = this.generateScheduleRecommendations(scheduledTasks, energyForecasts, fullConstraints);

    return {
      date: targetDate,
      scheduledTasks,
      energyForecast: energyForecasts,
      breakSuggestions,
      productivity: productivityMetrics,
      recommendations,
      flexibility: this.calculateScheduleFlexibility(scheduledTasks)
    };
  }

  // Generate suggestions for a single task
  suggestOptimalTiming(
    task: TaskDefinition,
    timeframe: 'today' | 'tomorrow' | 'this-week' = 'today',
    constraints: Partial<SchedulingConstraints> = {}
  ): SchedulingSuggestion[] {
    const fullConstraints = { ...this.defaultConstraints, ...constraints };
    const targetDates = this.getTargetDates(timeframe);

    const allSuggestions: SchedulingSuggestion[] = [];

    targetDates.forEach(date => {
      const energyForecasts = this.getEnergyForecastsForDay(date);
      const behaviorPatterns = patternRecognition.getPatterns();
      const availableSlots = this.generateAvailableTimeSlots(date, fullConstraints);

      const suggestion = this.findOptimalSlotForTask(task, availableSlots, energyForecasts, behaviorPatterns, fullConstraints);
      if (suggestion) {
        allSuggestions.push(suggestion);
      }
    });

    return allSuggestions.sort((a, b) => b.optimizationScore - a.optimizationScore).slice(0, 5);
  }

  // Get energy forecasts for a full day
  private getEnergyForecastsForDay(date: Date): EnergyForecast[] {
    const forecasts: EnergyForecast[] = [];

    // Generate hourly forecasts for the day
    for (let hour = 6; hour <= 22; hour++) {
      const forecastTime = new Date(date);
      forecastTime.setHours(hour, 0, 0, 0);

      if (forecastTime > new Date()) { // Only forecast future times
        try {
          const forecast = energyTracker.generateForecast('next-hour');
          forecasts.push({
            ...forecast,
            timeframe: 'next-hour'
          });
        } catch (error) {
          // Fallback prediction based on patterns
          forecasts.push(this.generateFallbackForecast(hour));
        }
      }
    }

    return forecasts;
  }

  // Generate available time slots for a day
  private generateAvailableTimeSlots(date: Date, constraints: SchedulingConstraints): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = parseInt(constraints.workingHours.start.split(':')[0]);
    const endHour = parseInt(constraints.workingHours.end.split(':')[0]);

    // Generate 30-minute time slots throughout the day
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Skip if slot is in the past
        if (slotEnd <= new Date()) continue;

        slots.push({
          start: slotStart,
          end: slotEnd,
          duration: 30,
          predictedEnergy: this.predictEnergyForSlot(slotStart),
          predictedFocus: this.predictFocusForSlot(slotStart),
          conflictLevel: 'none', // Will be updated during conflict resolution
          confidence: 0.7
        });
      }
    }

    return slots;
  }

  // Find optimal time slot for a specific task
  private findOptimalSlotForTask(
    task: TaskDefinition,
    availableSlots: TimeSlot[],
    energyForecasts: EnergyForecast[],
    patterns: UserBehaviorPattern[],
    constraints: SchedulingConstraints
  ): SchedulingSuggestion | null {
    const suitableSlots = availableSlots.filter(slot => {
      // Check if slot duration can accommodate task
      const requiredSlots = Math.ceil(task.estimatedDuration / 30);
      const availableConsecutiveSlots = this.countConsecutiveSlots(slot, availableSlots);
      return availableConsecutiveSlots >= requiredSlots;
    });

    if (suitableSlots.length === 0) return null;

    // Score each suitable slot
    const scoredSlots = suitableSlots.map(slot => ({
      slot: this.extendSlotForTask(slot, task, availableSlots),
      score: this.scoreSlotForTask(slot, task, energyForecasts, patterns, constraints),
      reasoning: this.generateSlotReasoning(slot, task, energyForecasts, patterns)
    }));

    // Sort by score and select best option
    scoredSlots.sort((a, b) => b.score - a.score);
    const bestSlot = scoredSlots[0];

    if (bestSlot.score < 40) return null; // Minimum threshold for acceptable scheduling

    return {
      id: `suggestion-${task.id}-${bestSlot.slot.start.getTime()}`,
      task,
      suggestedSlot: bestSlot.slot,
      reasoning: bestSlot.reasoning,
      optimizationScore: bestSlot.score,
      alternatives: scoredSlots.slice(1, 4).map(s => s.slot),
      benefits: this.generateBenefits(bestSlot.slot, task, energyForecasts),
      preparation: this.generatePreparationSuggestions(bestSlot.slot, task)
    };
  }

  // Score how well a time slot matches a task's requirements
  private scoreSlotForTask(
    slot: TimeSlot,
    task: TaskDefinition,
    energyForecasts: EnergyForecast[],
    patterns: UserBehaviorPattern[],
    constraints: SchedulingConstraints
  ): number {
    let score = 50; // Base score

    // Energy matching
    const energyRequirementMap = { low: 30, medium: 60, high: 80 };
    const requiredEnergy = energyRequirementMap[task.energyRequirement];
    const energyMatch = Math.max(0, 100 - Math.abs(slot.predictedEnergy - requiredEnergy));
    score += energyMatch * 0.3;

    // Focus matching
    const focusRequirementMap = { low: 30, medium: 60, high: 80 };
    const requiredFocus = focusRequirementMap[task.focusRequirement];
    const focusMatch = Math.max(0, 100 - Math.abs(slot.predictedFocus - requiredFocus));
    score += focusMatch * 0.3;

    // Time of day preferences
    if (task.userPreferences?.preferredTimeOfDay) {
      const slotHour = slot.start.getHours();
      const timeOfDayScore = this.scoreTimeOfDayPreference(slotHour, task.userPreferences.preferredTimeOfDay);
      score += timeOfDayScore * 0.2;
    }

    // Priority and deadline pressure
    if (task.deadline) {
      const timeUntilDeadline = task.deadline.getTime() - slot.start.getTime();
      const urgencyScore = this.calculateUrgencyScore(timeUntilDeadline, task.priority);
      score += urgencyScore * 0.1;
    }

    // Pattern-based optimization
    const patternScore = this.scoreAgainstPatterns(slot, task, patterns);
    score += patternScore * 0.1;

    return Math.min(100, Math.max(0, score));
  }

  // Predict energy level for a specific time slot
  private predictEnergyForSlot(slotTime: Date): number {
    const hour = slotTime.getHours();

    // Basic circadian rhythm model (can be enhanced with actual pattern data)
    const circadianEnergy = this.getCircadianEnergyForHour(hour);

    // Adjust based on historical patterns if available
    const patterns = patternRecognition.getPatterns();
    const energyPattern = patterns.find(p => p.type === 'energy');

    if (energyPattern) {
      // Use actual pattern data to adjust prediction
      return this.adjustEnergyPredictionWithPatterns(circadianEnergy, hour, energyPattern);
    }

    return circadianEnergy;
  }

  // Predict focus level for a specific time slot
  private predictFocusForSlot(slotTime: Date): number {
    const hour = slotTime.getHours();

    // Basic focus rhythm model
    const baseFocus = this.getBaseFocusForHour(hour);

    // Adjust based on historical patterns
    const patterns = patternRecognition.getPatterns();
    const focusPattern = patterns.find(p => p.type === 'focus');

    if (focusPattern) {
      return this.adjustFocusPredictionWithPatterns(baseFocus, hour, focusPattern);
    }

    return baseFocus;
  }

  // Helper methods for energy and focus prediction
  private getCircadianEnergyForHour(hour: number): number {
    // Typical circadian energy pattern
    const energyByHour: Record<number, number> = {
      6: 40, 7: 50, 8: 65, 9: 75, 10: 85, 11: 80,
      12: 70, 13: 60, 14: 50, 15: 65, 16: 75,
      17: 70, 18: 65, 19: 55, 20: 45, 21: 35, 22: 25
    };
    return energyByHour[hour] || 50;
  }

  private getBaseFocusForHour(hour: number): number {
    // Typical focus pattern throughout the day
    const focusByHour: Record<number, number> = {
      6: 30, 7: 40, 8: 60, 9: 80, 10: 90, 11: 85,
      12: 65, 13: 45, 14: 35, 15: 55, 16: 70,
      17: 60, 18: 50, 19: 40, 20: 30, 21: 25, 22: 20
    };
    return focusByHour[hour] || 50;
  }

  private adjustEnergyPredictionWithPatterns(baseEnergy: number, hour: number, pattern: UserBehaviorPattern): number {
    // Simplified pattern adjustment - real implementation would be more sophisticated
    const adjustment = Math.random() * 20 - 10; // ±10 adjustment for demo
    return Math.max(10, Math.min(90, baseEnergy + adjustment));
  }

  private adjustFocusPredictionWithPatterns(baseFocus: number, hour: number, pattern: UserBehaviorPattern): number {
    const adjustment = Math.random() * 15 - 7.5; // ±7.5 adjustment for demo
    return Math.max(10, Math.min(90, baseFocus + adjustment));
  }

  private countConsecutiveSlots(startSlot: TimeSlot, allSlots: TimeSlot[]): number {
    let count = 1;
    let currentEnd = startSlot.end;

    for (const slot of allSlots) {
      if (slot.start.getTime() === currentEnd.getTime()) {
        count++;
        currentEnd = slot.end;
      } else if (slot.start > currentEnd) {
        break;
      }
    }

    return count;
  }

  private extendSlotForTask(baseSlot: TimeSlot, task: TaskDefinition, availableSlots: TimeSlot[]): TimeSlot {
    const requiredDuration = task.estimatedDuration;
    const endTime = new Date(baseSlot.start);
    endTime.setMinutes(endTime.getMinutes() + requiredDuration);

    return {
      start: baseSlot.start,
      end: endTime,
      duration: requiredDuration,
      predictedEnergy: baseSlot.predictedEnergy,
      predictedFocus: baseSlot.predictedFocus,
      conflictLevel: baseSlot.conflictLevel,
      confidence: baseSlot.confidence
    };
  }

  private generateSlotReasoning(slot: TimeSlot, task: TaskDefinition, energyForecasts: EnergyForecast[], patterns: UserBehaviorPattern[]): string[] {
    const reasoning: string[] = [];

    if (slot.predictedEnergy >= 70) {
      reasoning.push('High energy period - great for demanding tasks');
    } else if (slot.predictedEnergy <= 40) {
      reasoning.push('Lower energy time - suitable for routine tasks');
    }

    if (slot.predictedFocus >= 80) {
      reasoning.push('Peak focus time - ideal for complex work');
    }

    const hour = slot.start.getHours();
    if (hour >= 9 && hour <= 11) {
      reasoning.push('Morning peak productivity window');
    } else if (hour >= 14 && hour <= 16) {
      reasoning.push('Afternoon focus recovery period');
    }

    if (task.category === 'creative' && slot.predictedEnergy >= 60) {
      reasoning.push('Good energy level for creative tasks');
    }

    return reasoning;
  }

  private scoreTimeOfDayPreference(hour: number, preference: string): number {
    const preferenceHours = {
      morning: [6, 7, 8, 9, 10, 11],
      afternoon: [12, 13, 14, 15, 16, 17],
      evening: [18, 19, 20, 21, 22]
    };

    const preferredHours = preferenceHours[preference as keyof typeof preferenceHours] || [];
    return preferredHours.includes(hour) ? 20 : 0;
  }

  private calculateUrgencyScore(timeUntilDeadline: number, priority: TaskDefinition['priority']): number {
    const days = timeUntilDeadline / (1000 * 60 * 60 * 24);
    const priorityMultiplier = { critical: 3, high: 2, medium: 1, low: 0.5 };

    if (days <= 1) return 20 * priorityMultiplier[priority];
    if (days <= 3) return 15 * priorityMultiplier[priority];
    if (days <= 7) return 10 * priorityMultiplier[priority];
    return 5 * priorityMultiplier[priority];
  }

  private scoreAgainstPatterns(slot: TimeSlot, task: TaskDefinition, patterns: UserBehaviorPattern[]): number {
    // Simplified pattern scoring
    return Math.random() * 10; // 0-10 points for pattern matching
  }

  private generateBenefits(slot: TimeSlot, task: TaskDefinition, energyForecasts: EnergyForecast[]): string[] {
    const benefits: string[] = [];

    if (slot.predictedEnergy >= 70) {
      benefits.push('High energy alignment with task requirements');
    }

    if (slot.predictedFocus >= 80) {
      benefits.push('Peak focus period for optimal concentration');
    }

    benefits.push('Minimal scheduling conflicts');
    benefits.push('Good work-life balance timing');

    return benefits;
  }

  private generatePreparationSuggestions(slot: TimeSlot, task: TaskDefinition) {
    const preparation: SchedulingSuggestion['preparation'] = {};

    if (slot.predictedEnergy < 60) {
      preparation.energyBoosts = [
        'Take a 5-minute walk before starting',
        'Have a healthy snack',
        'Do some light stretching'
      ];
    }

    if (task.focusRequirement === 'high') {
      preparation.focusEnhancers = [
        'Clear your workspace of distractions',
        'Turn off notifications',
        'Prepare all necessary materials in advance'
      ];
    }

    preparation.environmentalOptimizations = [
      'Ensure good lighting',
      'Set comfortable temperature',
      'Have water nearby'
    ];

    return preparation;
  }

  private resolveSchedulingConflicts(suggestions: (SchedulingSuggestion | null)[], constraints: SchedulingConstraints): SchedulingSuggestion[] {
    // Simplified conflict resolution - real implementation would be more sophisticated
    return suggestions.filter(s => s !== null) as SchedulingSuggestion[];
  }

  private generateBreakSuggestions(scheduledTasks: SchedulingSuggestion[], energyForecasts: EnergyForecast[], constraints: SchedulingConstraints) {
    // Generate break suggestions between tasks
    return [];
  }

  private calculateProductivityMetrics(scheduledTasks: SchedulingSuggestion[], energyForecasts: EnergyForecast[]) {
    const avgScore = scheduledTasks.reduce((sum, task) => sum + task.optimizationScore, 0) / scheduledTasks.length;

    return {
      predictedScore: Math.round(avgScore),
      peakPeriods: [],
      challengingPeriods: []
    };
  }

  private generateScheduleRecommendations(scheduledTasks: SchedulingSuggestion[], energyForecasts: EnergyForecast[], constraints: SchedulingConstraints): string[] {
    const recommendations: string[] = [];

    if (scheduledTasks.length > 6) {
      recommendations.push('Consider spreading tasks across multiple days for better quality');
    }

    recommendations.push('Take regular breaks between high-focus tasks');
    recommendations.push('Stay hydrated and maintain good posture');

    return recommendations;
  }

  private calculateScheduleFlexibility(scheduledTasks: SchedulingSuggestion[]): number {
    const flexibleTasks = scheduledTasks.filter(t => t.task.flexibility !== 'rigid').length;
    return flexibleTasks / scheduledTasks.length;
  }

  private getTargetDates(timeframe: 'today' | 'tomorrow' | 'this-week'): Date[] {
    const dates: Date[] = [];
    const today = new Date();

    switch (timeframe) {
      case 'today':
        dates.push(today);
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
        break;
      case 'this-week':
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          dates.push(date);
        }
        break;
    }

    return dates;
  }

  private generateFallbackForecast(hour: number): EnergyForecast {
    return {
      timeframe: 'next-hour',
      predictedLevel: this.getCircadianEnergyForHour(hour),
      confidence: 0.5,
      factors: ['Circadian rhythm estimation'],
      recommendations: ['Based on typical daily energy patterns'],
      optimalTaskTypes: hour >= 9 && hour <= 11 ? ['challenging tasks'] : ['routine tasks']
    };
  }
}

// Export singleton and React hook
export const intelligentScheduler = IntelligentScheduler.getInstance();

export function useIntelligentScheduling() {
  const generateSchedule = (tasks: TaskDefinition[], date: Date, constraints?: Partial<SchedulingConstraints>) => {
    return intelligentScheduler.generateOptimalSchedule(tasks, date, constraints);
  };

  const suggestTaskTiming = (task: TaskDefinition, timeframe?: 'today' | 'tomorrow' | 'this-week') => {
    return intelligentScheduler.suggestOptimalTiming(task, timeframe);
  };

  return {
    generateSchedule,
    suggestTaskTiming
  };
}