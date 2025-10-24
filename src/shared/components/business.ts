/**
 * Business Components Module
 * Domain-specific components with business logic
 */

// MARK: - Task Management Components

export { TaskForm } from '@/components/tasks/TaskForm';
export { TaskListView } from '@/components/tasks/TaskListView';
export { TaskBoardView } from '@/components/tasks/TaskBoardView';
export { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
export { QuickTaskInput } from '@/components/tasks/QuickTaskInput';
export { QuickTaskModal } from '@/components/tasks/QuickTaskModal';
export { ProgressIndicator } from '@/components/tasks/ProgressIndicator';
export { TaskHierarchy } from '@/components/tasks/TaskHierarchy';
export { SubtaskList } from '@/components/tasks/SubtaskList';
export { SubtaskCreator } from '@/components/tasks/SubtaskCreator';
export { TaskTemplateSelector } from '@/components/tasks/TaskTemplateSelector';

// Recurring Tasks
export { RecurringInstancesList } from '@/components/tasks/recurring/RecurringInstancesList';
export { RecurrenceIndicator } from '@/components/tasks/recurring/RecurrenceIndicator';
export { RecurrencePreview } from '@/components/tasks/recurring/RecurrencePreview';
export { RecurrencePatternEditor } from '@/components/tasks/recurring/RecurrencePatternEditor';

// MARK: - Goal Management Components

export { GoalCard } from '@/components/goals/GoalCard';
export { ProgressChart } from '@/components/goals/ProgressChart';
export { ProgressVisualization } from '@/components/goals/ProgressVisualization';
export { ProgressEditor } from '@/components/goals/ProgressEditor';
export { ProgressHistory } from '@/components/goals/ProgressHistory';
export { MilestoneTimeline } from '@/components/goals/MilestoneTimeline';
export { MilestoneCreator } from '@/components/goals/MilestoneCreator';
export { MilestoneCompletion } from '@/components/goals/MilestoneCompletion';
export { SubGoalsList } from '@/components/goals/SubGoalsList';
export { GoalQuickActions } from '@/components/goals/GoalQuickActions';
export { GoalReflectionsTab } from '@/components/goals/GoalReflectionsTab';

// MARK: - Reflection System Components

export { ReflectionCard } from '@/components/reflections/ReflectionCard';
export { DailyReflectionForm } from '@/components/reflections/DailyReflectionForm';
export { GuidedReflectionFlow } from '@/components/reflections/GuidedReflectionFlow';
export { ReflectionCalendar } from '@/components/reflections/ReflectionCalendar';
export { ReflectionTimeline } from '@/components/reflections/ReflectionTimeline';
export { ReflectionFilters } from '@/components/reflections/ReflectionFilters';
export { MoodTracker } from '@/components/reflections/MoodTracker';
export { MoodHeatmap } from '@/components/reflections/MoodHeatmap';
export { MoodAnalytics } from '@/components/reflections/MoodAnalytics';
export { ReflectionAnalyticsDashboard } from '@/components/reflections/ReflectionAnalyticsDashboard';
export { PersonalGrowthMetrics } from '@/components/reflections/PersonalGrowthMetrics';
export { ContentAnalytics } from '@/components/reflections/ContentAnalytics';
export { StreakAnalytics } from '@/components/reflections/StreakAnalytics';
export { ImpactAnalysis } from '@/components/reflections/ImpactAnalysis';
export { GoalReflectionLinker } from '@/components/reflections/GoalReflectionLinker';

// MARK: - AI & Analytics Components

export { AIInsightCard } from '@/components/ai-insights/AIInsightCard';
export { AIRecommendationCard } from '@/components/ai-insights/AIRecommendationCard';
export { AIUsageWidget } from '@/components/ai-insights/AIUsageWidget';

// MARK: - Settings Components

export { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
export { HapticFeedbackSettings } from '@/components/settings/HapticFeedbackSettings';

// MARK: - Business Component Types

export interface BusinessComponentProps {
  className?: string;
  'data-testid'?: string;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface TaskComponentProps extends BusinessComponentProps {
  taskId?: string;
  tasks?: any[];
  onTaskCreate?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
}

export interface GoalComponentProps extends BusinessComponentProps {
  goalId?: string;
  goals?: any[];
  onGoalCreate?: (goal: any) => void;
  onGoalUpdate?: (goalId: string, updates: any) => void;
  onGoalDelete?: (goalId: string) => void;
  onProgressUpdate?: (goalId: string, progress: number) => void;
}

export interface ReflectionComponentProps extends BusinessComponentProps {
  reflectionId?: string;
  reflections?: any[];
  onReflectionCreate?: (reflection: any) => void;
  onReflectionUpdate?: (reflectionId: string, updates: any) => void;
  onReflectionDelete?: (reflectionId: string) => void;
  onMoodUpdate?: (mood: any) => void;
}

export interface AIComponentProps extends BusinessComponentProps {
  insights?: any[];
  recommendations?: any[];
  onInsightDismiss?: (insightId: string) => void;
  onRecommendationAccept?: (recommendationId: string) => void;
  onFeedback?: (feedback: any) => void;
}

// MARK: - Business Logic Patterns

/**
 * Business components encapsulate domain-specific functionality:
 *
 * 1. **Data Management** - Handle CRUD operations
 *    - Create, read, update, delete operations
 *    - Local state management with optimistic updates
 *    - Integration with backend APIs
 *
 * 2. **Business Rules** - Implement domain constraints
 *    - Validation rules specific to business logic
 *    - Status transitions and workflows
 *    - Permission and access control
 *
 * 3. **User Workflows** - Guide user interactions
 *    - Multi-step forms and wizards
 *    - Contextual actions and suggestions
 *    - Progressive disclosure of features
 *
 * 4. **Integration Points** - Connect external services
 *    - AI service integration
 *    - Analytics and tracking
 *    - Third-party API connections
 */

export const BUSINESS_DOMAINS = {
  taskManagement: {
    components: [
      'TaskForm', 'TaskListView', 'TaskBoardView', 'TaskCalendarView',
      'QuickTaskInput', 'QuickTaskModal', 'ProgressIndicator',
      'TaskHierarchy', 'SubtaskList', 'SubtaskCreator', 'TaskTemplateSelector'
    ],
    features: ['CRUD operations', 'Recurring tasks', 'Task hierarchy', 'Progress tracking'],
    integrations: ['Calendar sync', 'AI suggestions', 'Analytics tracking']
  },
  goalManagement: {
    components: [
      'GoalCard', 'ProgressChart', 'ProgressVisualization', 'ProgressEditor',
      'ProgressHistory', 'MilestoneTimeline', 'MilestoneCreator',
      'MilestoneCompletion', 'SubGoalsList', 'GoalQuickActions', 'GoalReflectionsTab'
    ],
    features: ['Goal tracking', 'Milestone management', 'Progress visualization', 'Sub-goals'],
    integrations: ['Reflection linking', 'Analytics dashboard', 'AI insights']
  },
  reflectionSystem: {
    components: [
      'ReflectionCard', 'DailyReflectionForm', 'GuidedReflectionFlow',
      'ReflectionCalendar', 'ReflectionTimeline', 'ReflectionFilters',
      'MoodTracker', 'MoodHeatmap', 'MoodAnalytics',
      'ReflectionAnalyticsDashboard', 'PersonalGrowthMetrics',
      'ContentAnalytics', 'StreakAnalytics', 'ImpactAnalysis', 'GoalReflectionLinker'
    ],
    features: ['Daily reflections', 'Mood tracking', 'Growth analytics', 'Impact analysis'],
    integrations: ['Goal linking', 'AI analysis', 'Export capabilities']
  },
  aiAnalytics: {
    components: ['AIInsightCard', 'AIRecommendationCard', 'AIUsageWidget'],
    features: ['Insight generation', 'Recommendations', 'Usage analytics'],
    integrations: ['Multiple AI providers', 'Usage tracking', 'Feedback collection']
  },
  settings: {
    components: ['AccessibilitySettings', 'HapticFeedbackSettings'],
    features: ['Accessibility options', 'User preferences', 'System configuration'],
    integrations: ['Theme system', 'Device capabilities', 'User profiles']
  }
} as const;

/**
 * Business component quality standards
 */
export const BUSINESS_QUALITY_STANDARDS = {
  dataIntegrity: [
    'Proper form validation',
    'Optimistic updates with rollback',
    'Conflict resolution strategies',
    'Data consistency checks'
  ],
  userExperience: [
    'Loading and error states',
    'Progressive enhancement',
    'Contextual help and guidance',
    'Keyboard shortcuts and accessibility'
  ],
  performance: [
    'Lazy loading of heavy components',
    'Debounced user inputs',
    'Efficient re-rendering strategies',
    'Memory leak prevention'
  ],
  testing: [
    'Unit tests for business logic',
    'Integration tests for workflows',
    'E2E tests for critical paths',
    'Accessibility testing'
  ]
} as const;

/**
 * Get business component information
 */
export function getBusinessComponentInfo() {
  return {
    domains: BUSINESS_DOMAINS,
    qualityStandards: BUSINESS_QUALITY_STANDARDS,
    totalComponents: Object.values(BUSINESS_DOMAINS).reduce(
      (sum, domain) => sum + domain.components.length, 0
    ),
    totalFeatures: Object.values(BUSINESS_DOMAINS).reduce(
      (sum, domain) => sum + domain.features.length, 0
    )
  };
}

/**
 * Validate business component implementation
 */
export function validateBusinessComponent(
  componentName: string,
  implementation: any
): { isValid: boolean; issues: string[]; suggestions: string[] } {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for required props
  if (!implementation.props) {
    issues.push('Missing props definition');
  }

  // Check for error handling
  if (!implementation.errorBoundary && !implementation.onError) {
    issues.push('Missing error handling');
    suggestions.push('Add error boundary or onError prop');
  }

  // Check for loading states
  if (!implementation.loading && !implementation.isLoading) {
    suggestions.push('Consider adding loading states for better UX');
  }

  // Check for accessibility
  if (!implementation.ariaLabel && !implementation['aria-label']) {
    suggestions.push('Add ARIA labels for accessibility');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}