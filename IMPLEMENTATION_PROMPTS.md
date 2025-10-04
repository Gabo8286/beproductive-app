# Implementation Prompts for AI Development
# BeProductive v2: Spark Bloom Flow

**Version**: 2.0.0
**Date**: January 2025
**Purpose**: Detailed prompts for implementing user stories with AI tools (Claude, Grok, Lovable)

---

## 🎯 NAVIGATION TRANSFORMATION PROMPTS

### Prompt NAV-1.1: Customizable Widget Dashboard
```
I need to transform my React TypeScript productivity app to use a widget-based dashboard instead of traditional navigation. Here are the requirements:

CURRENT STATE:
- App has traditional sidebar navigation at `/src/components/navigation/AppSidebar.tsx`
- Dashboard at `/src/pages/Dashboard.tsx` has basic layout
- Uses shadcn/ui components and Tailwind CSS

REQUIREMENTS:
1. Create a customizable widget grid (max 6 widgets visible)
2. Drag-and-drop functionality for widget arrangement
3. Persistent layout preferences (localStorage + Supabase)
4. Add/remove widgets with smooth animations
5. Mobile-responsive stacking

TECHNICAL SPECS:
- Use CSS Grid for layout
- Implement with react-beautiful-dnd or @dnd-kit
- Store preferences in both localStorage and user profile
- Smooth animations with framer-motion
- Mobile-first responsive design

COMPONENTS TO CREATE:
- `WidgetGrid.tsx` - Main grid container
- `DraggableWidget.tsx` - Individual widget wrapper
- `WidgetSelector.tsx` - Widget picker modal
- `useWidgetLayout.ts` - Custom hook for layout management

Please provide complete implementation with TypeScript interfaces, proper error handling, and accessibility features.
```

### Prompt NAV-1.2: Smart Module Cards
```
Create smart, interactive widget cards for my productivity app dashboard. Each card should display relevant information and provide quick actions.

REQUIREMENTS:
1. Tasks Widget: Shows today's count, next urgent task, "Add Task" button
2. Goals Widget: Current progress, streak counter, quick update
3. Habits Widget: Today's habits, completion status, quick mark
4. Notes Widget: Recent notes count, quick create note
5. Time Widget: Current session, today's total, start/stop timer

FEATURES:
- Hover effects with action buttons (desktop)
- Tap-and-hold for mobile quick actions
- Real-time data updates
- Loading and error states
- Progressive disclosure of information

TECHNICAL REQUIREMENTS:
- Each widget max 200px height
- Use React Query for data fetching
- Implement optimistic updates
- Smooth animations with Tailwind
- Accessibility with proper ARIA labels

COMPONENTS:
- `ModuleCard.tsx` - Base card component
- `TasksWidget.tsx`, `GoalsWidget.tsx`, etc.
- `QuickActions.tsx` - Hover action overlay
- `WidgetData.tsx` - Data fetching logic

Include proper TypeScript types, error boundaries, and loading states.
```

### Prompt NAV-1.3: Universal Search & Quick Actions
```
Implement a command palette / universal search system inspired by VS Code and Linear's command palette.

REQUIREMENTS:
1. Triggered by Cmd+K (Ctrl+K on Windows)
2. Searches across tasks, goals, notes, habits
3. Supports action commands like "create task", "new goal"
4. Keyboard navigation with arrow keys
5. Real-time results with fuzzy search

FEATURES:
- Search results grouped by type
- Command execution (create, edit, delete, navigate)
- Recent searches and suggestions
- Keyboard shortcuts display
- Smart context-aware results

TECHNICAL IMPLEMENTATION:
- Global event listener for keyboard shortcuts
- Fuzzy search algorithm (fuse.js or similar)
- Command registry system
- Portal-based modal rendering
- Focus management and accessibility

COMPONENTS:
- `CommandPalette.tsx` - Main search interface
- `SearchResults.tsx` - Results display
- `CommandRegistry.ts` - Command definitions
- `useGlobalShortcuts.ts` - Keyboard handling
- `useFuzzySearch.ts` - Search logic

Ensure proper focus trapping, escape handling, and screen reader support.
```

---

## 🌙 THEME SYSTEM PROMPTS

### Prompt THEME-2.1: Seamless Theme Switching
```
Implement a perfect dark/light mode system for my React productivity app with zero flash and accessibility compliance.

CURRENT STATE:
- App uses Tailwind CSS with shadcn/ui components
- Some basic theming exists but needs complete overhaul
- Uses React 18 with TypeScript

REQUIREMENTS:
1. Instant theme switching (<100ms) with no FOUC
2. System preference detection and sync
3. Persistent preferences (local + cloud)
4. WCAG AAA contrast compliance (7:1 ratio)
5. Support for custom color schemes

TECHNICAL APPROACH:
- CSS custom properties for all colors
- React Context for theme state
- prefers-color-scheme media query detection
- localStorage and Supabase sync
- Tailwind dark mode configuration

COLOR SYSTEM:
- Define complete color palette for both themes
- Ensure 7:1 contrast for all text
- Test with color blindness simulation
- Support high contrast mode

COMPONENTS:
- `ThemeProvider.tsx` - Context provider
- `ThemeToggle.tsx` - Toggle button component
- `useTheme.ts` - Theme hook
- `theme-config.ts` - Color definitions
- `theme.css` - CSS custom properties

Include comprehensive testing for contrast ratios and provide documentation for maintaining theme consistency.
```

### Prompt THEME-2.2: Accessibility-First Color System
```
Create an accessibility-compliant color system that works for users with visual impairments and color vision deficiency.

REQUIREMENTS:
1. Multiple contrast levels (AA, AAA, High Contrast)
2. Color-blind friendly indicator system
3. Screen reader compatibility
4. Reduced motion support
5. Focus indicators in all themes

ACCESSIBILITY FEATURES:
- Status indicators that don't rely only on color
- High contrast mode with 7:1+ ratios
- Proper ARIA labels for theme controls
- Respect user's motion preferences
- Clear focus indicators

TECHNICAL IMPLEMENTATION:
- WCAG compliance testing automation
- Color contrast validation functions
- Alternative indicators (icons, patterns, text)
- CSS prefers-reduced-motion support
- Comprehensive keyboard navigation

TESTING REQUIREMENTS:
- Automated contrast checking
- Color blindness simulation testing
- Screen reader validation
- Keyboard-only navigation testing
- Real user testing with visually impaired users

Provide tools for maintaining accessibility standards and clear documentation for contributors.
```

---

## 🌍 INTERNATIONALIZATION PROMPTS

### Prompt I18N-3.1: Multi-Language Support
```
Implement comprehensive internationalization for my React productivity app supporting 5 languages at launch.

LANGUAGES TO SUPPORT:
1. English (en) - Base language
2. Spanish (es) - Latin American variant
3. French (fr) - International French
4. German (de) - German standard
5. Portuguese (pt) - Brazilian Portuguese

REQUIREMENTS:
1. react-i18next implementation with namespace organization
2. Automatic browser language detection
3. Language switcher component with flags
4. Cultural adaptations (dates, numbers, currency)
5. Dynamic content translation

TECHNICAL SETUP:
- Namespace organization by feature (common, dashboard, tasks, etc.)
- Lazy loading of translation files
- Interpolation for dynamic content
- Pluralization rules for all languages
- Missing key fallback system

CULTURAL ADAPTATIONS:
- Date formats per locale
- Number formatting
- Currency display
- Time formats (12/24 hour)
- First day of week preferences

TRANSLATION STRUCTURE:
```
/locales/
  /en/
    common.json
    dashboard.json
    tasks.json
    goals.json
  /es/ [same structure]
  /fr/ [same structure]
  /de/ [same structure]
  /pt/ [same structure]
```

Include translation management workflow and instructions for adding new languages.
```

### Prompt I18N-3.2: RTL Language Support
```
Add proper RTL (Right-to-Left) language support for Arabic and Hebrew to my React productivity app.

REQUIREMENTS:
1. Complete layout flip for RTL languages
2. Proper text direction handling
3. Icon and image adjustments
4. Bidirectional text support
5. RTL-aware animations and transitions

TECHNICAL IMPLEMENTATION:
- CSS logical properties instead of physical ones
- dir="rtl" attribute management
- RTL-aware component design
- Icon direction adjustments
- Text input direction handling

COMPONENTS TO UPDATE:
- All layout components for direction
- Navigation components
- Form inputs with proper text direction
- Widget layouts and spacing
- Animation directions

RTL TESTING:
- Arabic text rendering
- Hebrew text rendering
- Mixed LTR/RTL content
- Form inputs and validation
- Navigation and user flows

Provide guidelines for maintaining RTL compatibility in future development.
```

---

## 🤖 AI ASSISTANT PROMPTS

### Prompt AI-4.1: Conversational Task Management
```
Build an AI-powered conversational interface for task management in my productivity app.

CURRENT SETUP:
- React TypeScript app with Supabase backend
- Existing task management system
- OpenAI/Claude API access available

REQUIREMENTS:
1. Natural language task creation
2. Context-aware task suggestions
3. Multi-turn conversations
4. Action confirmation system
5. Voice input support (future-ready)

NATURAL LANGUAGE PROCESSING:
- Parse commands like "remind me to call John tomorrow at 2pm"
- Extract dates, times, priorities, and assignments
- Handle ambiguous requests with clarification
- Support follow-up commands and corrections

AI CAPABILITIES:
- Task analysis and suggestions
- Priority recommendations
- Deadline conflict detection
- Workload balancing advice
- Productivity pattern insights

TECHNICAL IMPLEMENTATION:
- Chat interface with message history
- Real-time streaming responses
- Optimistic UI updates
- Error handling and retries
- Context preservation across sessions

COMPONENTS:
- `AIChat.tsx` - Chat interface
- `AIMessage.tsx` - Message components
- `AITaskParser.ts` - NLP logic
- `AIActionHandler.ts` - Action execution
- `useAIConversation.ts` - Chat state management

Include comprehensive examples of supported commands and edge case handling.
```

### Prompt AI-4.2: Predictive Productivity Insights
```
Create an AI system that analyzes user behavior patterns and provides actionable productivity insights.

DATA ANALYSIS REQUIREMENTS:
1. Task completion patterns
2. Time usage analytics
3. Goal progress tracking
4. Energy and focus patterns
5. Productivity bottleneck identification

INSIGHT GENERATION:
- Peak productivity hours identification
- Task duration prediction
- Goal achievement probability
- Workload capacity warnings
- Habit effectiveness analysis

MACHINE LEARNING FEATURES:
- Pattern recognition algorithms
- Predictive modeling for task completion
- Anomaly detection for unusual patterns
- Personalized recommendation engine
- Continuous learning from user feedback

TECHNICAL IMPLEMENTATION:
- Client-side analytics processing
- Privacy-preserving data analysis
- Real-time insight generation
- Trend visualization components
- Actionable recommendation system

INSIGHTS TO PROVIDE:
- "You're 73% more productive in mornings"
- "This task usually takes you 2.3x longer on Fridays"
- "You're likely to miss this deadline without schedule adjustment"
- "Consider blocking focus time from 9-11am for deep work"

Include comprehensive privacy considerations and user control over data analysis.
```

---

## 🧪 TESTING FRAMEWORK PROMPTS

### Prompt TEST-5.1: Multi-Persona Test Scenarios
```
Create comprehensive test scenarios for each user persona in my productivity app.

USER PERSONAS:
1. Sarah Chen (Busy Executive) - Mobile-first, quick actions
2. Marcus Rodriguez (Developer) - Keyboard shortcuts, dark mode
3. Elena Petrov (Project Manager) - Collaboration, reporting
4. James Thompson (Freelancer) - Time tracking, client management
5. Aisha Williams (Student) - Mobile usage, habit tracking

TESTING REQUIREMENTS:
1. Persona-specific user journeys
2. Realistic test data for each persona
3. Cross-device testing scenarios
4. Performance validation per use case
5. Accessibility testing for all personas

SARAH'S TEST SCENARIOS:
- Quick task creation on mobile during commute
- Dashboard customization for executive view
- Voice note creation and transcription
- Meeting preparation workflows
- Mobile-optimized goal tracking

MARCUS'S TEST SCENARIOS:
- Keyboard-only navigation testing
- Dark mode consistency across all components
- Developer workflow integration
- Technical task management
- Performance monitoring and optimization

TEST DATA GENERATION:
- Realistic task and goal data for each persona
- Different completion patterns and work styles
- Various project types and complexities
- Time zone and cultural variations
- Edge cases and error scenarios

TECHNICAL IMPLEMENTATION:
- Playwright E2E tests with persona-specific flows
- Jest unit tests with persona-based mocking
- Visual regression testing across personas
- Performance testing with realistic data loads
- Accessibility testing with assistive technologies

Include detailed test scripts and data generation functions for each persona.
```

### Prompt TEST-5.2: Automated Quality Assurance
```
Build a comprehensive automated testing system that ensures 99% production reliability.

TESTING LAYERS:
1. Unit Tests (>90% coverage)
2. Integration Tests
3. E2E Tests
4. Visual Regression Tests
5. Performance Tests
6. Accessibility Tests
7. Security Tests

AUTOMATED TESTING PIPELINE:
- Pre-commit hooks for immediate feedback
- CI/CD pipeline with parallel test execution
- Automated deployment testing
- Production monitoring and alerting
- Rollback automation on failures

QUALITY GATES:
- Code coverage thresholds
- Performance budget enforcement
- Accessibility compliance validation
- Security vulnerability scanning
- Bundle size monitoring

TESTING TOOLS SETUP:
- Vitest for unit testing
- Playwright for E2E testing
- Chromatic for visual regression
- Lighthouse CI for performance
- axe-core for accessibility
- OWASP ZAP for security

TEST CATEGORIES:
- Component rendering and behavior
- API integration and error handling
- User workflow completion
- Cross-browser compatibility
- Mobile responsiveness
- Internationalization validation

MONITORING AND REPORTING:
- Test result dashboards
- Coverage reporting
- Performance trend analysis
- Error tracking and alerting
- User satisfaction metrics

Include comprehensive test configuration files and CI/CD pipeline setup.
```

---

## 🔧 IMPLEMENTATION GUIDELINES

### Prompt Structure Standards
Each prompt should include:
1. **Context**: Current state and background
2. **Requirements**: Specific functionality needed
3. **Technical Specs**: Implementation details
4. **Components**: Files and functions to create
5. **Testing**: Validation requirements
6. **Accessibility**: Compliance standards

### AI Tool Usage Strategy
- **Claude**: Complex logic and architectural decisions
- **Grok**: Creative UI/UX solutions and user experience
- **Lovable**: Rapid prototyping and visual components
- **GitHub Copilot**: Code completion and suggestions

### Code Quality Standards
- TypeScript for all new code
- Comprehensive error handling
- Accessibility compliance (WCAG AA minimum)
- Performance optimization
- Mobile-first responsive design
- Comprehensive testing coverage

### Rollback Procedures
For each implementation:
1. Create feature branch
2. Implement with feature flags
3. Test in isolation
4. Gradual rollout
5. Monitor for issues
6. Quick rollback capability

---

## 📋 PROMPT USAGE CHECKLIST

Before using any prompt:
- [ ] Review current codebase state
- [ ] Understand existing patterns and conventions
- [ ] Identify dependencies and prerequisites
- [ ] Plan for backwards compatibility
- [ ] Prepare test scenarios
- [ ] Consider mobile and accessibility impacts

After implementation:
- [ ] Run full test suite
- [ ] Validate accessibility compliance
- [ ] Test on multiple devices and browsers
- [ ] Review code for consistency
- [ ] Update documentation
- [ ] Deploy to staging for validation

---

**Document Status**: Ready for implementation
**Next Review**: After each epic completion
**Contact**: Gabriel Soto Morales

*These prompts are designed to maintain consistency while allowing AI tools to apply their unique strengths to different aspects of the development process.*