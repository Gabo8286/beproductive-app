import { CreateGoalInput, UpdateGoalInput, Goal } from "@/types/goals";

export function validateGoalInput(
  input: CreateGoalInput | UpdateGoalInput,
): string[] {
  const errors: string[] = [];

  // Title validation
  if ("title" in input && input.title !== undefined) {
    if (!input.title?.trim()) {
      errors.push("Title is required");
    } else if (input.title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }
  }

  // Description validation
  if (
    "description" in input &&
    input.description &&
    input.description.length > 1000
  ) {
    errors.push("Description must be less than 1000 characters");
  }

  // Date validation
  if (
    "start_date" in input &&
    "target_date" in input &&
    input.start_date &&
    input.target_date
  ) {
    if (input.target_date < input.start_date) {
      errors.push("Target date must be after start date");
    }
  }

  // Priority validation
  if ("priority" in input && input.priority !== undefined) {
    if (input.priority < 1 || input.priority > 5) {
      errors.push("Priority must be between 1 and 5");
    }
  }

  // Progress validation
  if ("progress" in input && input.progress !== undefined) {
    if (input.progress < 0 || input.progress > 100) {
      errors.push("Progress must be between 0 and 100");
    }
  }

  // Value validation
  if (
    "current_value" in input &&
    "target_value" in input &&
    input.current_value !== undefined &&
    input.target_value !== undefined
  ) {
    if (input.current_value > input.target_value) {
      errors.push("Current value cannot exceed target value");
    }
  }

  return errors;
}

export function canDeleteGoal(
  goal: Goal,
  subGoals: Goal[],
): { canDelete: boolean; reason?: string } {
  if (subGoals.length > 0) {
    return {
      canDelete: false,
      reason: `Goal has ${subGoals.length} sub-goal(s). Delete or reassign them first.`,
    };
  }

  return { canDelete: true };
}

export function sanitizeGoalInput<T extends CreateGoalInput | UpdateGoalInput>(
  input: T,
): T {
  const sanitized = { ...input };

  if ("title" in sanitized && sanitized.title) {
    sanitized.title = sanitized.title.trim();
  }

  if ("description" in sanitized && sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }

  if ("unit" in sanitized && sanitized.unit) {
    sanitized.unit = sanitized.unit.trim();
  }

  if ("priority" in sanitized && sanitized.priority !== undefined) {
    sanitized.priority = Math.max(1, Math.min(5, sanitized.priority));
  }

  if ("progress" in sanitized && sanitized.progress !== undefined) {
    sanitized.progress = Math.max(0, Math.min(100, sanitized.progress));
  }

  return sanitized;
}
