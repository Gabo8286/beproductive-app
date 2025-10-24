/**
 * Layout Components Module
 * Components for page structure, responsive design, and widget systems
 */

// MARK: - Widget System Components

// Note: Widget components are already modularized in the widgets directory
// Re-export for centralized access
export type { WidgetComponentProps, WidgetConfig, WidgetData } from '@/components/widgets/types';

// Widget Grid and Management
export { WidgetGrid } from '@/components/widgets/WidgetGrid';
export { DraggableWidget } from '@/components/widgets/DraggableWidget';

// Core Widgets
export { TaskSummaryWidget } from '@/components/widgets/TaskSummaryWidget';
export { GoalProgressWidget } from '@/components/widgets/GoalProgressWidget';
export { MoodTrackerWidget } from '@/components/widgets/MoodTrackerWidget';
export { HabitStreakWidget } from '@/components/widgets/HabitStreakWidget';
export { QuickActionsWidget } from '@/components/widgets/QuickActionsWidget';
export { InsightsWidget } from '@/components/widgets/InsightsWidget';
export { TimeTrackingWidget } from '@/components/widgets/TimeTrackingWidget';
export { WeatherWidget } from '@/components/widgets/WeatherWidget';
export { CalendarWidget } from '@/components/widgets/CalendarWidget';
export { NotificationWidget } from '@/components/widgets/NotificationWidget';

// MARK: - Navigation Layout Components

export { Sidebar } from '@/components/ui/sidebar';

// Tab System
export { TabNavigation } from '@/components/tabs/TabNavigation';
export { TabContent } from '@/components/tabs/TabContent';

// MARK: - Page Layout Components

// Landing Page Layouts
export { PersonaSelector } from '@/components/landing/PersonaSelector';
export { LiveActivityFeed } from '@/components/landing/LiveActivityFeed';
export { SuccessStoriesGrid } from '@/components/landing/SuccessStoriesGrid';
export { InteractiveJourneyBuilder } from '@/components/landing/InteractiveJourneyBuilder';
export { BuildStory } from '@/components/landing/BuildStory';
export { TrustBadges } from '@/components/landing/TrustBadges';
export { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
export { CommunityStatsCounter } from '@/components/landing/CommunityStatsCounter';

// Conversion Layout Components
export { SocialProofBanner } from '@/components/landing/conversion/SocialProofBanner';
export { EmailCaptureModal } from '@/components/landing/conversion/EmailCaptureModal';
export { FloatingCTA } from '@/components/landing/conversion/FloatingCTA';
export { TrustSignals } from '@/components/landing/conversion/TrustSignals';

// MARK: - Luna Layout Components

// Luna Framework Layout
export { LunaFramework } from '@/components/luna/framework/LunaFramework';
export { LunaChat } from '@/components/luna/chat/LunaChat';
export { LunaFAB } from '@/components/luna/fab/LunaFAB';

// Luna Core Components
export { LunaProvider } from '@/components/luna/providers/LunaProvider';
export { LunaContextMenu } from '@/components/luna/context/LunaContextMenu';

// MARK: - Responsive Layout Utilities

export interface LayoutProps {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

export interface ResponsiveLayoutProps extends LayoutProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface GridLayoutProps extends LayoutProps {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  autoFit?: boolean;
  minColumnWidth?: string;
}

export interface FlexLayoutProps extends LayoutProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number | string;
}

// MARK: - Layout Patterns

/**
 * Layout components handle structural organization:
 *
 * 1. **Widget System** - Modular dashboard components
 *    - Drag-and-drop layout management
 *    - Responsive widget sizing
 *    - Customizable widget configurations
 *
 * 2. **Navigation Structure** - App navigation patterns
 *    - Sidebar navigation for desktop
 *    - Tab navigation for mobile
 *    - Breadcrumb navigation for deep pages
 *
 * 3. **Page Templates** - Common page layouts
 *    - Landing page sections
 *    - Dashboard grid layouts
 *    - Form page structures
 *
 * 4. **Responsive Containers** - Adaptive layouts
 *    - Mobile-first responsive design
 *    - Breakpoint-specific layouts
 *    - Container query support
 */

export const LAYOUT_CATEGORIES = {
  widgets: {
    components: [
      'WidgetGrid', 'DraggableWidget', 'TaskSummaryWidget', 'GoalProgressWidget',
      'MoodTrackerWidget', 'HabitStreakWidget', 'QuickActionsWidget',
      'InsightsWidget', 'TimeTrackingWidget', 'WeatherWidget',
      'CalendarWidget', 'NotificationWidget'
    ],
    features: ['Drag and drop', 'Responsive sizing', 'Custom configurations', 'Real-time updates'],
    patterns: ['Dashboard grids', 'Modular layouts', 'User customization']
  },
  navigation: {
    components: ['Sidebar', 'TabNavigation', 'TabContent'],
    features: ['Responsive behavior', 'Active state management', 'Keyboard navigation'],
    patterns: ['Sidebar for desktop', 'Tabs for mobile', 'Progressive disclosure']
  },
  pages: {
    components: [
      'PersonaSelector', 'LiveActivityFeed', 'SuccessStoriesGrid',
      'InteractiveJourneyBuilder', 'BuildStory', 'TrustBadges',
      'TestimonialCarousel', 'CommunityStatsCounter'
    ],
    features: ['Landing page sections', 'Conversion optimization', 'Social proof'],
    patterns: ['Hero sections', 'Feature grids', 'Testimonial carousels']
  },
  luna: {
    components: ['LunaFramework', 'LunaChat', 'LunaFAB', 'LunaProvider', 'LunaContextMenu'],
    features: ['AI integration', 'Chat interface', 'Context awareness'],
    patterns: ['Floating action button', 'Contextual menus', 'AI assistance']
  },
  conversion: {
    components: ['SocialProofBanner', 'EmailCaptureModal', 'FloatingCTA', 'TrustSignals'],
    features: ['Lead capture', 'Social proof', 'Call-to-action optimization'],
    patterns: ['Modal forms', 'Floating CTAs', 'Trust indicators']
  }
} as const;

/**
 * Responsive design breakpoints
 */
export const LAYOUT_BREAKPOINTS = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (small laptops)
  xl: '1280px',  // Extra large devices (large laptops/desktops)
  '2xl': '1536px' // 2X large devices (larger desktops)
} as const;

/**
 * Grid system specifications
 */
export const GRID_SYSTEM = {
  columns: 12,
  gutter: '1rem',
  maxWidth: '1200px',
  breakpoints: LAYOUT_BREAKPOINTS,
  containerPadding: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2rem',
    '2xl': '2rem'
  }
} as const;

/**
 * Layout accessibility requirements
 */
export const LAYOUT_A11Y_REQUIREMENTS = {
  widgets: [
    'Keyboard navigation between widgets',
    'Screen reader announcements for widget changes',
    'Focus management during drag and drop',
    'Alternative layouts for screen readers'
  ],
  navigation: [
    'Skip links for main content',
    'ARIA navigation landmarks',
    'Keyboard shortcuts for navigation',
    'Current page indication'
  ],
  pages: [
    'Logical heading hierarchy',
    'Landmark roles for page sections',
    'Focus management for modal dialogs',
    'Alternative text for images'
  ],
  responsive: [
    'Touch target sizing (min 44px)',
    'Readable text at all zoom levels',
    'Horizontal scrolling avoidance',
    'Portrait/landscape orientation support'
  ]
} as const;

/**
 * Get layout component information
 */
export function getLayoutComponentInfo() {
  return {
    categories: LAYOUT_CATEGORIES,
    breakpoints: LAYOUT_BREAKPOINTS,
    gridSystem: GRID_SYSTEM,
    accessibilityRequirements: LAYOUT_A11Y_REQUIREMENTS,
    totalComponents: Object.values(LAYOUT_CATEGORIES).reduce(
      (sum, category) => sum + category.components.length, 0
    )
  };
}

/**
 * Validate responsive layout implementation
 */
export function validateResponsiveLayout(
  layoutConfig: any
): { isValid: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for mobile-first approach
  if (layoutConfig.desktop && !layoutConfig.mobile) {
    issues.push('Missing mobile layout configuration');
  }

  // Check for touch targets
  if (layoutConfig.touchTargets && layoutConfig.touchTargets.some((size: number) => size < 44)) {
    issues.push('Touch targets smaller than 44px detected');
  }

  // Check for keyboard navigation
  if (!layoutConfig.keyboardNavigation) {
    recommendations.push('Add keyboard navigation support');
  }

  // Check for focus management
  if (!layoutConfig.focusManagement) {
    recommendations.push('Implement focus management for interactive elements');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate responsive grid CSS
 */
export function generateGridCSS(config: GridLayoutProps): string {
  const { columns = 12, gap = '1rem', autoFit = false, minColumnWidth = '200px' } = config;

  if (autoFit) {
    return `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(${minColumnWidth}, 1fr));
      gap: ${gap};
    `;
  }

  return `
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap};
  `;
}

/**
 * Generate responsive flex CSS
 */
export function generateFlexCSS(config: FlexLayoutProps): string {
  const {
    direction = 'row',
    justify = 'start',
    align = 'start',
    wrap = false,
    gap = '0'
  } = config;

  return `
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justify};
    align-items: ${align};
    flex-wrap: ${wrap ? 'wrap' : 'nowrap'};
    gap: ${gap};
  `;
}