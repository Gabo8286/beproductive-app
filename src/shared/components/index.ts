/**
 * Shared Component Library Index
 * Centralized exports for all reusable components across the application
 */

// MARK: - Core UI Components (Design System)

// Base UI Components (shadcn/ui based)
export { Button } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Textarea } from '@/components/ui/textarea';
export { Label } from '@/components/ui/label';
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
export { Badge } from '@/components/ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export { Separator } from '@/components/ui/separator';
export { Skeleton } from '@/components/ui/skeleton';
export { Progress } from '@/components/ui/progress';
export { Slider } from '@/components/ui/slider';
export { Switch } from '@/components/ui/switch';
export { Checkbox } from '@/components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Navigation Components
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Overlay Components
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
export { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

// Form Components
export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from '@/components/ui/form';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '@/components/ui/command';

// Data Display Components
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table';
export { Calendar } from '@/components/ui/calendar';
export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Feedback Components
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { toast, useToast } from '@/components/ui/toast';
export { Toaster } from '@/components/ui/toaster';

// Utility Components
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
export { Toggle } from '@/components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from '@/components/ui/dropdown-menu';

// MARK: - Enhanced UI Components

// Application-specific UI enhancements
export { EnhancedSkeleton } from '@/components/ui/EnhancedSkeleton';
export { ThemeToggle } from '@/components/ui/ThemeToggle';
export { LanguageSwitcher } from '@/components/ui/language-switcher';

// MARK: - Business Components

// Task Management
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

// Goal Management
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

// Reflection System
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

// AI & Insights
export { AIInsightCard } from '@/components/ai-insights/AIInsightCard';
export { AIRecommendationCard } from '@/components/ai-insights/AIRecommendationCard';
export { AIUsageWidget } from '@/components/ai-insights/AIUsageWidget';

// Settings
export { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
export { HapticFeedbackSettings } from '@/components/settings/HapticFeedbackSettings';

// MARK: - Widget Components

// Re-export widget components for easy access
export type { WidgetComponentProps } from '@/components/widgets/types';

// MARK: - Landing Page Components

export { PersonaSelector } from '@/components/landing/PersonaSelector';
export { LiveActivityFeed } from '@/components/landing/LiveActivityFeed';
export { SuccessStoriesGrid } from '@/components/landing/SuccessStoriesGrid';
export { InteractiveJourneyBuilder } from '@/components/landing/InteractiveJourneyBuilder';
export { BuildStory } from '@/components/landing/BuildStory';
export { TrustBadges } from '@/components/landing/TrustBadges';
export { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
export { CommunityStatsCounter } from '@/components/landing/CommunityStatsCounter';

// Conversion Components
export { SocialProofBanner } from '@/components/landing/conversion/SocialProofBanner';
export { EmailCaptureModal } from '@/components/landing/conversion/EmailCaptureModal';
export { FloatingCTA } from '@/components/landing/conversion/FloatingCTA';
export { TrustSignals } from '@/components/landing/conversion/TrustSignals';

// MARK: - Component Categories for Documentation

/**
 * UI Components Categories
 *
 * 1. **Primitive Components** - Basic building blocks
 *    - Button, Input, Card, Badge, etc.
 *    - Directly from shadcn/ui with design system styling
 *
 * 2. **Composite Components** - Complex UI patterns
 *    - Forms, Data tables, Navigation structures
 *    - Built using primitive components
 *
 * 3. **Business Components** - Domain-specific functionality
 *    - Task management, Goal tracking, Reflections
 *    - Encapsulate business logic and data flow
 *
 * 4. **Layout Components** - Page and section structure
 *    - Widgets, Dashboards, Page templates
 *    - Handle responsive design and accessibility
 *
 * 5. **Integration Components** - External service integration
 *    - AI insights, Analytics, Third-party APIs
 *    - Manage external dependencies
 */

// MARK: - Component Library Standards

/**
 * Component Development Standards
 *
 * 1. **TypeScript First**
 *    - All components must have proper TypeScript definitions
 *    - Use generic types where appropriate for reusability
 *
 * 2. **Accessibility**
 *    - Follow WCAG AAA guidelines
 *    - Proper ARIA labels and keyboard navigation
 *    - Screen reader support
 *
 * 3. **Responsive Design**
 *    - Mobile-first approach
 *    - Use shared design tokens for consistency
 *    - Test across different screen sizes
 *
 * 4. **Performance**
 *    - Lazy loading for heavy components
 *    - Memoization where appropriate
 *    - Minimal bundle impact
 *
 * 5. **Testing**
 *    - Unit tests for logic
 *    - Visual regression tests for UI
 *    - Accessibility tests
 *
 * 6. **Documentation**
 *    - Storybook stories for visual components
 *    - JSDoc comments for props and usage
 *    - Migration guides for breaking changes
 */

// MARK: - Export Information

export const COMPONENT_LIBRARY_INFO = {
  version: '1.0.0',
  totalComponents: 100, // Estimated based on current structure
  categories: {
    primitive: 25,
    composite: 15,
    business: 35,
    layout: 15,
    integration: 10
  },
  standards: [
    'TypeScript first with strict typing',
    'WCAG AAA accessibility compliance',
    'Mobile-first responsive design',
    'Performance optimized with lazy loading',
    'Comprehensive testing coverage',
    'Storybook documentation'
  ],
  migrationBenefits: [
    'Centralized component management',
    'Consistent design system implementation',
    'Improved developer experience',
    'Better tree-shaking and bundle optimization',
    'Enhanced testing and quality assurance'
  ]
};

/**
 * Get component library statistics
 */
export function getComponentLibraryInfo() {
  return COMPONENT_LIBRARY_INFO;
}