export type DemoInteractionType = 'click' | 'input' | 'drag' | 'wait';
export type PersonaType = 'professional' | 'student' | 'entrepreneur' | 'personal' | 'custom';

export interface DemoInteraction {
  type: DemoInteractionType;
  target: string;
  action: string;
  expected?: any;
  feedback: string;
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  highlightTarget?: string;
  interactions: DemoInteraction[];
  nextStep?: string;
  skipToOptions?: string[];
}

export interface DemoUserData {
  goals: DemoGoal[];
  habits: DemoHabit[];
  tasks: DemoTask[];
  quickTodos: DemoQuickTodo[];
}

export interface DemoGoal {
  id: string;
  title: string;
  progress: number;
  milestones: string[];
  category: string;
  completed?: boolean;
}

export interface DemoHabit {
  id: string;
  name: string;
  streak: number;
  target: number;
  completed?: boolean;
}

export interface DemoTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
}

export interface DemoQuickTodo {
  id: string;
  title: string;
  completed: boolean;
}

export interface DemoState {
  currentStep: string;
  completedSteps: string[];
  userData: DemoUserData;
  progress: number;
  persona: PersonaType;
  isActive: boolean;
}
