import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface TimeBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number; // minutes
  type: 'work' | 'break' | 'personal' | 'meeting' | 'focus' | 'admin';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  energy_required: 'low' | 'medium' | 'high';
  flexibility: 'fixed' | 'flexible' | 'preferred';
  task_ids?: string[];
  goal_id?: string;
  metadata?: any;
}

export interface UserScheduleContext {
  userId: string;
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  timeZone: string;
  energyPatterns: {
    morning: number;    // 1-10 energy level
    afternoon: number;
    evening: number;
  };
  preferences: {
    preferredFocusBlocks: number; // minutes
    maxMeetingsPerDay: number;
    breakFrequency: number; // minutes between breaks
    deepWorkPreference: 'morning' | 'afternoon' | 'evening';
    interruption_tolerance: 'low' | 'medium' | 'high';
  };
  existingCommitments: TimeBlock[];
  unavailableSlots: Array<{
    start: string;
    end: string;
    reason: string;
  }>;
}

export interface TimeBlockingRequest {
  userId: string;
  targetDate: string;
  tasks: Array<{
    id: string;
    title: string;
    estimated_duration: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    energy_required: 'low' | 'medium' | 'high';
    deadline?: string;
    dependencies?: string[];
    preferred_time?: 'morning' | 'afternoon' | 'evening';
    category: string;
  }>;
  goals?: Array<{
    id: string;
    title: string;
    priority: number;
    deadline?: string;
  }>;
  userContext: UserScheduleContext;
  preferredProvider?: AIProvider;
  optimization_focus: 'productivity' | 'energy' | 'balance' | 'deadlines';
}

export interface TimeBlockRecommendation {
  timeBlock: TimeBlock;
  confidence: number;
  reasoning: string;
  alternatives: TimeBlock[];
  dependencies: string[];
  energyAlignment: number; // 0-1 how well it matches energy levels
  productivityScore: number; // 0-1 expected productivity
  bufferTime: number; // minutes of buffer added
  conflicts: Array<{
    type: 'overlap' | 'energy_mismatch' | 'preference_violation';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface ScheduleOptimization {
  targetDate: string;
  totalBlocksRecommended: number;
  scheduledTasks: number;
  unscheduledTasks: number;
  overallProductivityScore: number;
  energyOptimizationScore: number;
  timeUtilization: number; // percentage of available time used
  recommendations: TimeBlockRecommendation[];
  insights: Array<{
    type: 'optimization' | 'warning' | 'suggestion';
    title: string;
    description: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
  }>;
  alternatives: Array<{
    name: string;
    description: string;
    tradeoffs: string[];
    schedule: TimeBlockRecommendation[];
  }>;
}

export class IntelligentTimeBlocker {
  private static instance: IntelligentTimeBlocker;

  public static getInstance(): IntelligentTimeBlocker {
    if (!IntelligentTimeBlocker.instance) {
      IntelligentTimeBlocker.instance = new IntelligentTimeBlocker();
    }
    return IntelligentTimeBlocker.instance;
  }

  public async generateTimeBlocks(request: TimeBlockingRequest): Promise<ScheduleOptimization> {
    const { tasks, userContext, targetDate, preferredProvider = 'lovable' } = request;

    // Analyze user's schedule context and constraints
    const availableSlots = this.findAvailableTimeSlots(userContext, targetDate);

    // Generate AI-powered schedule optimization
    const aiRecommendations = await this.generateAIRecommendations(request, availableSlots);

    // Apply optimization algorithms
    const optimizedSchedule = this.optimizeSchedule(aiRecommendations, userContext);

    // Generate alternative schedules
    const alternatives = await this.generateAlternativeSchedules(request, availableSlots);

    // Calculate metrics and insights
    const insights = this.generateScheduleInsights(optimizedSchedule, userContext, tasks);

    return {
      targetDate,
      totalBlocksRecommended: optimizedSchedule.length,
      scheduledTasks: optimizedSchedule.filter(r => r.timeBlock.task_ids?.length).length,
      unscheduledTasks: tasks.length - optimizedSchedule.filter(r => r.timeBlock.task_ids?.length).length,
      overallProductivityScore: this.calculateProductivityScore(optimizedSchedule),
      energyOptimizationScore: this.calculateEnergyScore(optimizedSchedule, userContext),
      timeUtilization: this.calculateTimeUtilization(optimizedSchedule, userContext),
      recommendations: optimizedSchedule,
      insights,
      alternatives
    };
  }

  private findAvailableTimeSlots(userContext: UserScheduleContext, targetDate: string): Array<{
    start: string;
    end: string;
    duration: number;
  }> {
    const slots: Array<{ start: string; end: string; duration: number }> = [];

    // Start with the full working day
    const workStart = this.parseTime(userContext.workingHours.start);
    const workEnd = this.parseTime(userContext.workingHours.end);

    let currentTime = workStart;

    // Find gaps between existing commitments
    const sortedCommitments = [...userContext.existingCommitments].sort((a, b) =>
      this.parseTime(a.start_time) - this.parseTime(b.start_time)
    );

    for (const commitment of sortedCommitments) {
      const commitmentStart = this.parseTime(commitment.start_time);

      // Add slot before this commitment if there's a gap
      if (currentTime < commitmentStart) {
        const duration = commitmentStart - currentTime;
        if (duration >= 30) { // Minimum 30-minute slots
          slots.push({
            start: this.formatTime(currentTime),
            end: this.formatTime(commitmentStart),
            duration
          });
        }
      }

      currentTime = Math.max(currentTime, this.parseTime(commitment.end_time));
    }

    // Add final slot after last commitment
    if (currentTime < workEnd) {
      const duration = workEnd - currentTime;
      if (duration >= 30) {
        slots.push({
          start: this.formatTime(currentTime),
          end: this.formatTime(workEnd),
          duration
        });
      }
    }

    return slots;
  }

  private async generateAIRecommendations(
    request: TimeBlockingRequest,
    availableSlots: Array<{ start: string; end: string; duration: number }>
  ): Promise<TimeBlockRecommendation[]> {
    const prompt = this.buildTimeBlockingPrompt(request, availableSlots);

    const aiRequest: AIServiceRequest = {
      provider: request.preferredProvider || 'lovable',
      prompt,
      userId: request.userId,
      requestType: 'time_blocking',
      maxTokens: 800,
      temperature: 0.4, // Lower temperature for more consistent scheduling
      metadata: { targetDate: request.targetDate }
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      return this.parseTimeBlockingResponse(response.content, request);
    }

    // Fallback to rule-based scheduling
    return this.generateRuleBasedSchedule(request, availableSlots);
  }

  private buildTimeBlockingPrompt(
    request: TimeBlockingRequest,
    availableSlots: Array<{ start: string; end: string; duration: number }>
  ): string {
    const { tasks, userContext, targetDate, optimization_focus } = request;

    return `You are an expert productivity coach creating an optimal time blocking schedule for ${targetDate}.

USER CONTEXT:
- Working Hours: ${userContext.workingHours.start} - ${userContext.workingHours.end}
- Energy Patterns: Morning ${userContext.energyPatterns.morning}/10, Afternoon ${userContext.energyPatterns.afternoon}/10, Evening ${userContext.energyPatterns.evening}/10
- Preferred Focus Blocks: ${userContext.preferences.preferredFocusBlocks} minutes
- Deep Work Preference: ${userContext.preferences.deepWorkPreference}
- Break Frequency: Every ${userContext.preferences.breakFrequency} minutes
- Max Meetings: ${userContext.preferences.maxMeetingsPerDay} per day

AVAILABLE TIME SLOTS:
${availableSlots.map(slot => `${slot.start}-${slot.end} (${slot.duration}min)`).join('\n')}

TASKS TO SCHEDULE:
${tasks.map(task => `- ${task.title}: ${task.estimated_duration}min, ${task.priority} priority, ${task.energy_required} energy, preferred: ${task.preferred_time || 'any'}`).join('\n')}

OPTIMIZATION FOCUS: ${optimization_focus}

SCHEDULING PRINCIPLES:
1. Match high-energy tasks with user's peak energy times
2. Respect task priorities and deadlines
3. Include appropriate breaks between intense work
4. Group similar tasks for efficiency
5. Leave buffer time for unexpected delays
6. Consider task dependencies

Create an optimal schedule with the following format for each time block:
{
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "title": "Task/Activity name",
  "type": "work|break|focus|meeting|admin",
  "task_ids": ["task_id1", "task_id2"],
  "reasoning": "Why this time slot works well",
  "energy_alignment": 0.9,
  "confidence": 0.8,
  "buffer_minutes": 15
}

Respond with a JSON array of time blocks.`;
  }

  private parseTimeBlockingResponse(content: string, request: TimeBlockingRequest): TimeBlockRecommendation[] {
    try {
      const blocks = JSON.parse(content);
      return blocks.map((block: any, index: number) => ({
        timeBlock: {
          id: `ai_block_${index}`,
          title: block.title,
          start_time: block.start_time,
          end_time: block.end_time,
          duration: this.calculateDuration(block.start_time, block.end_time),
          type: block.type || 'work',
          priority: this.inferPriority(block.task_ids, request.tasks),
          energy_required: this.inferEnergyRequired(block.task_ids, request.tasks),
          flexibility: 'flexible',
          task_ids: block.task_ids || [],
          metadata: {
            ai_generated: true,
            buffer_time: block.buffer_minutes || 0
          }
        },
        confidence: block.confidence || 0.7,
        reasoning: block.reasoning || 'AI-generated time block',
        alternatives: [],
        dependencies: [],
        energyAlignment: block.energy_alignment || 0.5,
        productivityScore: this.calculateBlockProductivityScore(block, request.userContext),
        bufferTime: block.buffer_minutes || 0,
        conflicts: []
      }));
    } catch (error) {
      console.error('Failed to parse AI time blocking response:', error);
      return [];
    }
  }

  private generateRuleBasedSchedule(
    request: TimeBlockingRequest,
    availableSlots: Array<{ start: string; end: string; duration: number }>
  ): TimeBlockRecommendation[] {
    const { tasks, userContext } = request;
    const recommendations: TimeBlockRecommendation[] = [];

    // Sort tasks by priority and deadline
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;

      // Consider deadlines
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      return 0;
    });

    let slotIndex = 0;
    let currentSlot = availableSlots[slotIndex];

    for (const task of sortedTasks) {
      if (!currentSlot || currentSlot.duration < task.estimated_duration + 15) {
        // Find next suitable slot
        slotIndex++;
        currentSlot = availableSlots[slotIndex];
        if (!currentSlot) break;
      }

      // Create time block for this task
      const endTime = this.addMinutes(currentSlot.start, task.estimated_duration);

      recommendations.push({
        timeBlock: {
          id: `rule_block_${task.id}`,
          title: task.title,
          start_time: currentSlot.start,
          end_time: endTime,
          duration: task.estimated_duration,
          type: 'work',
          priority: task.priority,
          energy_required: task.energy_required,
          flexibility: 'flexible',
          task_ids: [task.id],
        },
        confidence: 0.6,
        reasoning: 'Rule-based scheduling by priority and availability',
        alternatives: [],
        dependencies: task.dependencies || [],
        energyAlignment: this.calculateEnergyAlignment(currentSlot.start, task, userContext),
        productivityScore: 0.7,
        bufferTime: 15,
        conflicts: []
      });

      // Update current slot
      currentSlot = {
        start: this.addMinutes(endTime, 15), // 15-minute buffer
        end: currentSlot.end,
        duration: currentSlot.duration - task.estimated_duration - 15
      };
    }

    return recommendations;
  }

  private optimizeSchedule(
    recommendations: TimeBlockRecommendation[],
    userContext: UserScheduleContext
  ): TimeBlockRecommendation[] {
    // Apply optimization algorithms like:
    // 1. Energy alignment optimization
    // 2. Task batching
    // 3. Buffer time optimization
    // 4. Conflict resolution

    return recommendations.map(rec => ({
      ...rec,
      conflicts: this.detectConflicts(rec, recommendations, userContext)
    }));
  }

  private async generateAlternativeSchedules(
    request: TimeBlockingRequest,
    availableSlots: Array<{ start: string; end: string; duration: number }>
  ): Promise<Array<{
    name: string;
    description: string;
    tradeoffs: string[];
    schedule: TimeBlockRecommendation[];
  }>> {
    // Generate alternative optimization approaches
    const alternatives = [];

    // Energy-optimized schedule
    if (request.optimization_focus !== 'energy') {
      const energyOptimized = await this.generateAIRecommendations({
        ...request,
        optimization_focus: 'energy'
      }, availableSlots);

      alternatives.push({
        name: 'Energy-Optimized',
        description: 'Prioritizes matching tasks to your natural energy rhythms',
        tradeoffs: ['May not prioritize urgent tasks', 'Could delay deadlines'],
        schedule: energyOptimized
      });
    }

    // Deadline-focused schedule
    if (request.optimization_focus !== 'deadlines') {
      const deadlineOptimized = await this.generateAIRecommendations({
        ...request,
        optimization_focus: 'deadlines'
      }, availableSlots);

      alternatives.push({
        name: 'Deadline-Focused',
        description: 'Prioritizes urgent tasks and approaching deadlines',
        tradeoffs: ['May ignore energy levels', 'Could lead to burnout'],
        schedule: deadlineOptimized
      });
    }

    return alternatives;
  }

  private generateScheduleInsights(
    recommendations: TimeBlockRecommendation[],
    userContext: UserScheduleContext,
    tasks: any[]
  ): Array<{
    type: 'optimization' | 'warning' | 'suggestion';
    title: string;
    description: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
  }> {
    const insights = [];

    // Check for energy misalignment
    const energyMisaligned = recommendations.filter(r => r.energyAlignment < 0.5).length;
    if (energyMisaligned > 0) {
      insights.push({
        type: 'warning' as const,
        title: 'Energy Misalignment Detected',
        description: `${energyMisaligned} tasks are scheduled during suboptimal energy periods`,
        actionable: true,
        priority: 'medium' as const
      });
    }

    // Check for overloaded schedule
    const totalDuration = recommendations.reduce((sum, r) => sum + r.timeBlock.duration, 0);
    const availableTime = this.parseTime(userContext.workingHours.end) - this.parseTime(userContext.workingHours.start);

    if (totalDuration > availableTime * 0.9) {
      insights.push({
        type: 'warning' as const,
        title: 'Schedule Overload',
        description: 'Your schedule is packed with little room for flexibility',
        actionable: true,
        priority: 'high' as const
      });
    }

    // Check for lack of breaks
    const hasAdequateBreaks = this.checkBreakFrequency(recommendations, userContext);
    if (!hasAdequateBreaks) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Add More Breaks',
        description: 'Consider adding short breaks between intensive tasks',
        actionable: true,
        priority: 'medium' as const
      });
    }

    return insights;
  }

  // Helper methods

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private addMinutes(time: string, minutes: number): string {
    const totalMinutes = this.parseTime(time) + minutes;
    return this.formatTime(totalMinutes);
  }

  private calculateDuration(startTime: string, endTime: string): number {
    return this.parseTime(endTime) - this.parseTime(startTime);
  }

  private inferPriority(taskIds: string[], tasks: any[]): 'low' | 'medium' | 'high' | 'urgent' {
    if (!taskIds || taskIds.length === 0) return 'medium';
    const task = tasks.find(t => taskIds.includes(t.id));
    return task?.priority || 'medium';
  }

  private inferEnergyRequired(taskIds: string[], tasks: any[]): 'low' | 'medium' | 'high' {
    if (!taskIds || taskIds.length === 0) return 'medium';
    const task = tasks.find(t => taskIds.includes(t.id));
    return task?.energy_required || 'medium';
  }

  private calculateEnergyAlignment(time: string, task: any, userContext: UserScheduleContext): number {
    const hour = Math.floor(this.parseTime(time) / 60);
    let userEnergyLevel: number;

    if (hour < 12) {
      userEnergyLevel = userContext.energyPatterns.morning;
    } else if (hour < 17) {
      userEnergyLevel = userContext.energyPatterns.afternoon;
    } else {
      userEnergyLevel = userContext.energyPatterns.evening;
    }

    const taskEnergyNeeds = { low: 3, medium: 6, high: 9 }[task.energy_required];

    // Calculate alignment (0-1 scale)
    const difference = Math.abs(userEnergyLevel - taskEnergyNeeds);
    return Math.max(0, 1 - (difference / 9));
  }

  private calculateBlockProductivityScore(block: any, userContext: UserScheduleContext): number {
    // Simplified productivity score calculation
    const energyAlignment = this.calculateEnergyAlignment(block.start_time,
      { energy_required: block.energy_required || 'medium' }, userContext);

    const timeOfDayBonus = this.getTimeOfDayBonus(block.start_time, userContext);

    return (energyAlignment + timeOfDayBonus) / 2;
  }

  private getTimeOfDayBonus(time: string, userContext: UserScheduleContext): number {
    const hour = Math.floor(this.parseTime(time) / 60);

    // Peak productivity hours get higher scores
    if (userContext.preferences.deepWorkPreference === 'morning' && hour >= 9 && hour < 12) {
      return 1.0;
    } else if (userContext.preferences.deepWorkPreference === 'afternoon' && hour >= 13 && hour < 16) {
      return 1.0;
    } else if (userContext.preferences.deepWorkPreference === 'evening' && hour >= 16) {
      return 1.0;
    }

    return 0.7;
  }

  private calculateProductivityScore(recommendations: TimeBlockRecommendation[]): number {
    if (recommendations.length === 0) return 0;

    const totalScore = recommendations.reduce((sum, rec) => sum + rec.productivityScore, 0);
    return totalScore / recommendations.length;
  }

  private calculateEnergyScore(recommendations: TimeBlockRecommendation[], userContext: UserScheduleContext): number {
    if (recommendations.length === 0) return 0;

    const totalScore = recommendations.reduce((sum, rec) => sum + rec.energyAlignment, 0);
    return totalScore / recommendations.length;
  }

  private calculateTimeUtilization(recommendations: TimeBlockRecommendation[], userContext: UserScheduleContext): number {
    const totalScheduledTime = recommendations.reduce((sum, rec) => sum + rec.timeBlock.duration, 0);
    const availableTime = this.parseTime(userContext.workingHours.end) - this.parseTime(userContext.workingHours.start);

    return (totalScheduledTime / availableTime) * 100;
  }

  private detectConflicts(
    recommendation: TimeBlockRecommendation,
    allRecommendations: TimeBlockRecommendation[],
    userContext: UserScheduleContext
  ): Array<{
    type: 'overlap' | 'energy_mismatch' | 'preference_violation';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const conflicts = [];

    // Check for time overlaps
    const overlaps = allRecommendations.filter(other =>
      other !== recommendation &&
      this.timeBlocksOverlap(recommendation.timeBlock, other.timeBlock)
    );

    if (overlaps.length > 0) {
      conflicts.push({
        type: 'overlap' as const,
        description: `Overlaps with ${overlaps.length} other time block(s)`,
        severity: 'high' as const
      });
    }

    // Check energy misalignment
    if (recommendation.energyAlignment < 0.3) {
      conflicts.push({
        type: 'energy_mismatch' as const,
        description: 'Task energy requirements don\'t match your energy levels at this time',
        severity: 'medium' as const
      });
    }

    return conflicts;
  }

  private timeBlocksOverlap(block1: TimeBlock, block2: TimeBlock): boolean {
    const start1 = this.parseTime(block1.start_time);
    const end1 = this.parseTime(block1.end_time);
    const start2 = this.parseTime(block2.start_time);
    const end2 = this.parseTime(block2.end_time);

    return start1 < end2 && start2 < end1;
  }

  private checkBreakFrequency(recommendations: TimeBlockRecommendation[], userContext: UserScheduleContext): boolean {
    // Check if there are adequate breaks based on user preferences
    const workBlocks = recommendations.filter(r => r.timeBlock.type === 'work' || r.timeBlock.type === 'focus');
    const preferredBreakFreq = userContext.preferences.breakFrequency;

    for (let i = 0; i < workBlocks.length - 1; i++) {
      const currentBlock = workBlocks[i];
      const nextBlock = workBlocks[i + 1];

      const gap = this.parseTime(nextBlock.timeBlock.start_time) - this.parseTime(currentBlock.timeBlock.end_time);
      const totalWorkTime = currentBlock.timeBlock.duration + nextBlock.timeBlock.duration;

      if (totalWorkTime > preferredBreakFreq && gap < 15) {
        return false;
      }
    }

    return true;
  }

  public async saveTimeBlockingRecommendations(
    optimization: ScheduleOptimization,
    userId: string
  ): Promise<void> {
    // Save the schedule recommendations to the database
    for (const recommendation of optimization.recommendations) {
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          title: `Time Block: ${recommendation.timeBlock.title}`,
          description: recommendation.reasoning,
          implementation_steps: [
            `Block time from ${recommendation.timeBlock.start_time} to ${recommendation.timeBlock.end_time}`,
            `Set up the environment for ${recommendation.timeBlock.type} work`,
            `Prepare materials and eliminate distractions`
          ],
          expected_impact: `Improved productivity and ${recommendation.timeBlock.type} work efficiency`,
          effort_level: 'low',
          priority: this.mapTimeBlockPriorityToNumber(recommendation.timeBlock.priority),
          metadata: {
            type: 'time_blocking',
            timeBlock: recommendation.timeBlock,
            confidence: recommendation.confidence,
            energyAlignment: recommendation.energyAlignment,
            productivityScore: recommendation.productivityScore,
            targetDate: optimization.targetDate
          }
        });
    }

    // Save insights
    for (const insight of optimization.insights) {
      await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          insight_type: 'time_optimization',
          title: insight.title,
          content: insight.description,
          confidence: 0.8,
          metadata: {
            type: insight.type,
            actionable: insight.actionable,
            priority: insight.priority,
            targetDate: optimization.targetDate
          }
        });
    }
  }

  private mapTimeBlockPriorityToNumber(priority: string): number {
    switch (priority) {
      case 'urgent': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 3;
    }
  }
}

export const intelligentTimeBlocker = IntelligentTimeBlocker.getInstance();