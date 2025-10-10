# BeProductive v2 - Screen Tree View Documentation

## Application Architecture Overview

### Main Application Structure
```
App (src/App.tsx)
├── Providers
│   ├── QueryClientProvider (React Query)
│   ├── AuthProvider (Authentication Context)
│   ├── ModulesProvider (Feature Modules)
│   └── AccessibilityProvider (A11y Features)
├── Router (BrowserRouter)
│   ├── RouteAnnouncer (Accessibility)
│   └── AppContent
└── Global Components
    ├── Toaster (Notifications)
    ├── Sonner (Toast Messages)
    └── KeyboardShortcutsDialog
```

## Screen Breakdown by Route

### 1. Landing Page (/) - `src/pages/Index.tsx`
**Purpose**: Entry point for unauthenticated users, showcases non-developer success story

**Components Tree**:
```
Index
├── LandingPage (src/components/landing/LandingPage.tsx)
│   ├── Navigation (Glass Morphism)
│   │   ├── Brand Logo (Sparkles + "BeProductive")
│   │   ├── Sign In Button
│   │   └── Get Started Button
│   ├── Hero Section
│   │   ├── Success Story Badge ("Non-Developer Success Story")
│   │   ├── Main Headline (H1)
│   │   ├── Description Paragraph
│   │   ├── CTA Buttons
│   │   │   ├── "See How I Did It" (Primary)
│   │   │   └── "Try The App I Built" (Secondary)
│   │   ├── Stats Bar
│   │   │   ├── "Built in 3 weeks"
│   │   │   ├── "AI Agents added in 30 min"
│   │   │   └── "Zero breaking changes"
│   │   └── Tool Showcase Card
│   │       ├── Lovable.dev (Visual Development)
│   │       ├── Claude AI (Code Generation)
│   │       └── Grok AI (Problem Solving)
│   ├── Build Journey Section
│   │   └── BuildStory Component
│   ├── Interactive Demo Section
│   │   ├── Demo Introduction
│   │   ├── Feature Badges
│   │   │   ├── "100% AI-Generated"
│   │   │   ├── "Enterprise Features"
│   │   │   └── "Zero Coding Required"
│   │   └── DemoContainer Component
│   ├── Interactive Builder Section
│   │   └── InteractiveJourneyBuilder Component
│   ├── Core Features Section
│   │   ├── "Set Your Destinations" Card (Goals)
│   │   ├── "Build Daily Routines" Card (Habits)
│   │   └── "Track Your Progress" Card (Analytics)
│   ├── Lessons Learned Section
│   │   ├── Key Insights Column
│   │   │   ├── "AI tools are conversation partners"
│   │   │   ├── "Start simple, iterate quickly"
│   │   │   └── "Multiple AI tools are better than one"
│   │   ├── Honest Challenges Column
│   │   │   ├── "Learning AI prompting takes practice"
│   │   │   ├── "Integration complexity was surprising"
│   │   │   └── "Documentation becomes essential"
│   │   └── CTA Card
│   │       ├── "Want to Build Your Own App?"
│   │       ├── "Start with Lovable.dev" Button
│   │       └── "Try My App" Button
│   └── Footer
```

### 2. Authentication Screens

#### Login Page (/login) - `src/pages/Login.tsx`
```
Login
├── Login Form
│   ├── Email Input
│   ├── Password Input
│   ├── "Remember me" Checkbox
│   ├── Sign In Button
│   └── "Forgot Password?" Link
├── Social Login Options
└── "Don't have an account?" Link
```

#### Signup Page (/signup) - `src/pages/Signup.tsx`
```
Signup
├── Registration Form
│   ├── Name Input
│   ├── Email Input
│   ├── Password Input
│   ├── Confirm Password Input
│   └── Create Account Button
├── Terms & Privacy Links
└── "Already have an account?" Link
```

#### Forgot Password (/forgot-password) - `src/pages/ForgotPassword.tsx`
```
ForgotPassword
├── Reset Request Form
│   ├── Email Input
│   └── Send Reset Link Button
└── "Back to Login" Link
```

### 3. Dashboard (/dashboard) - `src/pages/Dashboard.tsx`
**Purpose**: Main productivity workspace with customizable widgets

**Components Tree**:
```
Dashboard
├── GreetingHeader
│   ├── Time-based Greeting ("Good Morning/Afternoon/Evening")
│   └── Motivational Insight
├── WidgetGrid (src/components/widgets/WidgetGrid.tsx)
│   ├── Header Row
│   │   ├── "Dashboard" Title
│   │   └── "Add Widget" Button (if under 6 widgets)
│   ├── DragDropContext (React Beautiful DnD)
│   │   └── Droppable Area
│   │       ├── DraggableWidget Components (up to 6)
│   │       │   ├── TasksWidget (Default)
│   │       │   ├── GoalsWidget (Default)
│   │       │   ├── AI Insights Widget (Default)
│   │       │   ├── CalendarWidget (Optional)
│   │       │   ├── TimeTrackingWidget (Optional)
│   │       │   ├── NotesWidget (Optional)
│   │       │   └── AnalyticsWidget (Optional)
│   │       └── Empty State (if no widgets)
│   │           ├── Welcome Message
│   │           └── "Add Your First Widget" Button
│   ├── Widget Limit Notice (if 6 widgets reached)
│   └── WidgetSelector Modal
│       ├── Available Widget Types Grid
│       ├── Widget Preview Cards
│       └── Selection Actions
├── CommandPalette (⌘K shortcut)
│   ├── Search Input
│   ├── Quick Actions List
│   └── Navigation Commands
└── Pro Tips Section
    ├── Command Palette Shortcut (⌘K)
    ├── Drag & Drop Instructions
    ├── Widget Expansion Info
    └── Maximum Widgets Notice
```

### 4. Protected Application Routes (Under AppLayout)

#### Goals Module (/goals) - `src/pages/Goals.tsx`
```
Goals
├── Goals Header
│   ├── Page Title
│   ├── "New Goal" Button
│   └── Filter/Sort Controls
├── Goals Grid/List
│   └── GoalCard Components
│       ├── Goal Title & Description
│       ├── Progress Visualization
│       ├── Milestone Indicators
│       ├── Due Date
│       └── Action Menu
└── Empty State (if no goals)
```

#### Goal Detail (/goals/:id) - `src/pages/GoalDetail.tsx`
```
GoalDetail
├── Goal Header
│   ├── Goal Title
│   ├── Status Badge
│   └── Action Buttons (Edit, Delete, Share)
├── Progress Section
│   ├── ProgressChart Component
│   ├── ProgressVisualization Component
│   └── ProgressHistory Component
├── Milestones Section
│   ├── MilestoneTimeline Component
│   ├── MilestoneCard Components
│   └── MilestoneCreator Component
├── Sub-Goals Section
│   └── SubGoalsList Component
├── Reflections Tab
│   └── GoalReflectionsTab Component
└── Analytics Section
    └── MilestoneAnalytics Component
```

#### Tasks Module (/tasks) - `src/pages/Tasks.tsx`
```
Tasks
├── Tasks Header
│   ├── Page Title
│   ├── "New Task" Button
│   └── View Controls (List/Board/Calendar)
├── Filter & Sort Bar
│   ├── Status Filters
│   ├── Priority Filters
│   ├── Date Filters
│   └── Tag Filters
├── Tasks Display
│   ├── Task Cards/Items
│   │   ├── Task Title
│   │   ├── Description (truncated)
│   │   ├── Priority Indicator
│   │   ├── Due Date
│   │   ├── Tags
│   │   └── Completion Checkbox
│   └── Drag & Drop Support
└── Bulk Actions Bar (when items selected)
```

#### Habits Module (/habits) - `src/pages/Habits.tsx`
```
Habits
├── Habits Header
│   ├── Page Title
│   └── "New Habit" Button
├── Today's Tracker Section
│   └── TodayTracker Component
│       └── HabitCard Components (Today's Focus)
├── Habits Overview
│   ├── HabitFilters Component
│   ├── HabitCard Components
│   │   ├── Habit Name & Icon
│   │   ├── Current Streak
│   │   ├── Progress Ring
│   │   ├── Quick Complete Button
│   │   └── View Details Link
│   └── HabitEmpty State
├── Analytics Section
│   ├── HabitAnalyticsDashboard Component
│   ├── CompletionTrends Component
│   └── StreakDisplay Component
└── Templates Section
    └── HabitTemplates Component
```

#### Analytics (/analytics) - `src/pages/Analytics.tsx`
```
Analytics
├── Executive Dashboard
│   └── ExecutiveDashboard Component
├── Real-Time Analytics
│   └── RealTimeAnalytics Component
├── Predictive Analytics
│   └── PredictiveAnalytics Component
├── Data Export Tools
│   └── DataExport Component
└── Custom Dashboard Builder
    └── DashboardBuilder Component
```

#### AI Insights (/ai-insights) - `src/pages/AIInsights.tsx`
```
AIInsights
├── AI Overview Dashboard
├── Insight Cards Grid
│   └── AIInsightCard Components
├── Recommendations Section
│   └── AIRecommendationCard Components
├── Usage Analytics
│   └── AIUsageWidget Component
└── Behavioral Insights
    └── BehavioralInsightsWidget Component
```

### 5. Widget System Architecture

#### Available Widget Types (from useWidgetLayout.ts):
```
Widget Registry
├── TasksWidget - Task management preview
├── GoalsWidget - Goals progress overview
├── TimeTrackingWidget - Time tracking interface
├── NotesWidget - Quick notes capture
├── AnalyticsWidget (JourneyProgressWidget) - Progress analytics
├── AI Insights Widget (SmartRecommendationsWidget) - AI recommendations
└── CalendarWidget - Calendar view with events
```

#### Widget Component Structure:
```
BaseWidget / DraggableWidget
├── Widget Header
│   ├── Widget Title
│   ├── Widget Actions Menu
│   │   ├── Expand to Full Page
│   │   ├── Refresh Data
│   │   ├── Configure Widget
│   │   └── Remove Widget
│   └── Loading/Error States
├── Widget Content (Varies by Type)
└── Widget Footer (Optional)
```

### 6. Layout Components

#### AppLayout (for protected routes)
```
AppLayout
├── Navigation Sidebar
│   ├── Brand Logo
│   ├── Main Navigation Links
│   │   ├── Dashboard
│   │   ├── Goals
│   │   ├── Tasks
│   │   ├── Habits
│   │   ├── Analytics
│   │   └── Profile
│   ├── Secondary Navigation
│   │   ├── Templates
│   │   ├── Automation
│   │   └── Settings
│   └── User Menu
│       ├── Profile Settings
│       ├── Accessibility Settings
│       └── Sign Out
├── Main Content Area
│   ├── Breadcrumb Navigation
│   ├── Page Content (Outlet)
│   └── Scroll Area
└── Command Palette Trigger (⌘K)
```

### 7. Common UI Patterns

#### Error Boundaries
- AppErrorBoundary (Application level)
- WidgetErrorBoundary (Widget level)
- CascadingErrorBoundary (Nested components)

#### Loading States
- LoadingSkeleton (AI components)
- Spinner (General loading)
- Progressive Loading (Large datasets)

#### Accessibility Features
- SkipNavigation
- Screen Reader Announcements
- Keyboard Navigation Support
- High Contrast Mode
- Focus Management

## Key Features per Screen

### Dashboard Widgets Capabilities:
1. **Drag & Drop Reordering** - Widgets can be rearranged
2. **Dynamic Widget Selection** - Add from 7 available types
3. **Widget Limit Management** - Maximum 6 widgets
4. **Persistent Layout** - Saved to localStorage
5. **Expand to Full Module** - Each widget links to full page
6. **Real-time Updates** - Live data refresh
7. **Error Handling** - Individual widget error boundaries

### Navigation Features:
1. **Command Palette** - ⌘K global search and actions
2. **Responsive Design** - Mobile-first approach
3. **Breadcrumb Navigation** - Context awareness
4. **Keyboard Shortcuts** - Full keyboard navigation
5. **Progressive Enhancement** - Works without JavaScript

### Authentication Flow:
1. **Automatic Redirection** - Auth state-based routing
2. **Local Development Mode** - Docker/localhost detection
3. **Error Recovery** - Graceful auth failure handling
4. **Session Management** - Persistent login state

This documentation reflects the current state of the BeProductive v2 application as analyzed from the codebase structure and component implementations.