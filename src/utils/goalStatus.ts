import { Goal } from "@/types/goals";

export const GOAL_STATUS_WORKFLOW: Record<Goal['status'], Goal['status'][]> = {
  draft: ['active', 'archived'],
  active: ['paused', 'completed', 'archived'],
  paused: ['active', 'archived'],
  completed: ['active', 'archived'],
  archived: ['draft', 'active'],
};

export function getAvailableStatusTransitions(currentStatus: Goal['status']): Goal['status'][] {
  return GOAL_STATUS_WORKFLOW[currentStatus] || [];
}

export function getStatusColor(status: Goal['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-500 text-white';
    case 'active':
      return 'bg-primary text-primary-foreground';
    case 'paused':
      return 'bg-yellow-500 text-white';
    case 'completed':
      return 'bg-green-500 text-white';
    case 'archived':
      return 'bg-muted text-muted-foreground';
  }
}

export function getStatusIcon(status: Goal['status']): string {
  switch (status) {
    case 'draft':
      return 'file-text';
    case 'active':
      return 'play';
    case 'paused':
      return 'pause';
    case 'completed':
      return 'check-circle';
    case 'archived':
      return 'archive';
    default:
      return 'circle';
  }
}

export function getStatusLabel(status: Goal['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function shouldAutoComplete(progress: number, currentStatus: Goal['status']): boolean {
  return progress >= 100 && currentStatus !== 'completed';
}

export function calculateProgressFromValue(currentValue: number, targetValue: number): number {
  if (!targetValue || targetValue <= 0) return 0;
  return Math.min(100, Math.round((currentValue / targetValue) * 100));
}

export function calculateValueFromProgress(progress: number, targetValue: number): number {
  if (!targetValue || targetValue <= 0) return 0;
  return Math.round((progress / 100) * targetValue);
}
