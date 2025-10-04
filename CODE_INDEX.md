# BeProductive v2 - Code Index

## Overview
This document provides a comprehensive index of the BeProductive v2 codebase after the major transformation to a widget-based, internationally accessible, AI-powered productivity application.

## Project Structure

### 📁 Root Files
- **package.json** - Dependencies and scripts with 73+ npm commands
- **tsconfig.json** - TypeScript configuration with strict settings
- **vite.config.ts** - Vite build configuration with performance optimizations
- **tailwind.config.js** - Tailwind CSS configuration with custom theme
- **eslint.config.js** - ESLint configuration for code quality
- **playwright.config.ts** - Playwright testing configuration

### 📁 Source Code (`src/`)

#### 🎨 Components (`src/components/`)

##### UI Components (`src/components/ui/`)
- **Button.tsx** - Customizable button component with variants
- **Card.tsx** - Container component for content sections
- **Input.tsx** - Form input with validation support
- **Select.tsx** - Dropdown selection component
- **Switch.tsx** - Toggle switch for boolean settings
- **Badge.tsx** - Status indicators and labels
- **Avatar.tsx** - User profile image component
- **Separator.tsx** - Visual dividers
- **Tooltip.tsx** - Hover information display
- **Dialog.tsx** - Modal dialogs and popups
- **Popover.tsx** - Floating content containers
- **Tabs.tsx** - Tabbed interface components
- **Progress.tsx** - Progress bars and indicators
- **Slider.tsx** - Range input controls
- **LanguageSwitcher.tsx** - International language selection
- **ThemeToggle.tsx** - Dark/light/high-contrast mode switcher
- **index.ts** - Centralized UI component exports

##### Widget System (`src/components/widgets/`)
- **WidgetGrid.tsx** - Main widget container with drag-and-drop
- **DraggableWidget.tsx** - Individual draggable widget wrapper
- **WidgetSelector.tsx** - Widget selection and configuration
- **CommandPalette.tsx** - Quick action search interface
- **TaskWidget.tsx** - Task management widget
- **GoalWidget.tsx** - Goal tracking widget
- **HabitWidget.tsx** - Habit tracking widget
- **AnalyticsWidget.tsx** - Analytics and insights widget
- **TimeTrackingWidget.tsx** - Time tracking widget
- **NotesWidget.tsx** - Notes and documentation widget
- **CalendarWidget.tsx** - Calendar integration widget
- **WeatherWidget.tsx** - Weather information widget
- **QuoteWidget.tsx** - Motivational quotes widget
- **SmartRecommendationsWidget.tsx** - AI-powered recommendations
- **index.ts** - Centralized widget exports

##### AI Components (`src/components/ai/`)
- **AIAssistant.tsx** - Main AI chat interface
- **ConversationView.tsx** - Chat message display
- **MessageInput.tsx** - AI message input with NLP
- **InsightCard.tsx** - AI-generated insights display
- **SuggestionsList.tsx** - AI recommendations list
- **LoadingIndicator.tsx** - AI processing status
- **index.ts** - Centralized AI component exports

#### 🔧 Library Code (`src/lib/`)
- **utils.ts** - General utility functions and helpers
- **cn.ts** - Class name utility for Tailwind
- **ai-service.ts** - AI integration with Claude/GPT APIs
- **supabase.ts** - Database connection and configuration
- **predictive-insights.ts** - Advanced productivity analytics
- **nlp-utils.ts** - Natural language processing utilities
- **i18n.ts** - Internationalization configuration (7 languages)
- **accessibility.ts** - WCAG AAA accessibility utilities
- **theme-utils.ts** - Theme management and CSS custom properties
- **widget-config.ts** - Widget system configuration
- **performance-monitor.ts** - Performance tracking utilities
- **index.ts** - Centralized library exports

#### 🎯 Hooks (`src/hooks/`)
- **useAI.ts** - AI functionality and conversation management
- **useTheme.ts** - Theme switching and persistence
- **useLanguage.ts** - Language switching and RTL support
- **useLocalStorage.ts** - Browser storage management
- **useKeyboardShortcuts.ts** - Keyboard navigation
- **useAccessibility.ts** - Accessibility features
- **usePerformance.ts** - Performance monitoring
- **useWidgets.ts** - Widget state management
- **index.ts** - Centralized hook exports

#### 📊 Data (`src/data/`)
- **demo/** - Realistic demo data for all personas
  - **sarah-demo-data.json** - Executive persona data
  - **marcus-demo-data.json** - Developer persona data
  - **elena-demo-data.json** - Project Manager persona data
  - **james-demo-data.json** - Freelancer persona data
  - **aisha-demo-data.json** - Student persona data
  - **consolidated-demo-data.json** - Combined persona data
  - **types.ts** - TypeScript types for demo data

#### 🎨 Styles (`src/styles/`)
- **globals.css** - Global styles with theme system
  - Light mode color scheme
  - Dark mode color scheme
  - High contrast mode for accessibility
  - CSS custom properties for theming
  - WCAG AAA compliant color ratios

#### 📱 Pages (`src/pages/`)
- **Dashboard.tsx** - Main dashboard with widget grid
- **Settings.tsx** - Application settings and preferences
- **Analytics.tsx** - Detailed analytics and insights
- **Profile.tsx** - User profile management

### 📁 Testing (`src/__tests__/`)

#### Unit Tests (`src/__tests__/unit/`)
- **components/** - Component unit tests
- **hooks/** - Hook unit tests
- **lib/** - Library function tests
- **widgets/** - Widget functionality tests

#### Integration Tests (`src/__tests__/integration/`)
- **ai/** - AI service integration tests
- **theme/** - Theme system integration tests
- **i18n/** - Internationalization tests
- **widgets/** - Widget system integration tests

#### E2E Tests (`tests/`)
- **e2e/** - End-to-end user journey tests
- **performance/** - Performance testing suite
- **accessibility/** - Accessibility compliance tests

### 📁 Scripts (`scripts/`)
- **ux-navigation-agent.cjs** - UX research and navigation transformation
- **theme-accessibility-agent.cjs** - Theme and accessibility implementation
- **i18n-agent.cjs** - Internationalization setup
- **ai-interface-agent.cjs** - AI assistant implementation
- **testing-quality-agent.cjs** - Comprehensive testing framework
- **demo-data-generator.cjs** - Realistic demo data generation
- **codebase-cleanup-agent.cjs** - Code optimization and cleanup
- **bundle-analyzer.js** - Bundle size analysis
- **code-quality-analyzer.js** - Code quality metrics
- **5s-agent.js** - 5S methodology organization
- **test-orchestrator.js** - Test execution orchestration

### 📁 Localization (`public/locales/`)
- **en/** - English translations
- **es/** - Spanish translations
- **fr/** - French translations
- **de/** - German translations
- **pt/** - Portuguese translations
- **ar/** - Arabic translations (RTL)
- **he/** - Hebrew translations (RTL)

## Key Features Implemented

### 🎯 Widget-Based Navigation
- Replaced traditional sidebar with customizable widget grid
- Drag-and-drop widget positioning
- Widget selector for personalized dashboard
- Command palette for quick actions
- Responsive grid layout

### 🎨 Perfect Theme System
- Light, dark, and high-contrast modes
- WCAG AAA accessibility compliance (7:1 contrast ratios)
- CSS custom properties for consistent theming
- System theme detection and persistence
- Smooth theme transitions

### 🌍 International Support
- 7 languages: English, Spanish, French, German, Portuguese, Arabic, Hebrew
- RTL (Right-to-Left) support for Arabic and Hebrew
- Cultural number and date formatting
- Automatic language detection
- Dynamic direction switching

### 🤖 AI Assistant
- Conversational productivity interface
- Natural language task extraction
- Predictive insights and recommendations
- Multi-provider AI support (Claude, GPT)
- Context-aware suggestions

### 🧪 Comprehensive Testing
- Unit tests with Vitest
- E2E tests with Playwright
- Accessibility testing with axe-core
- Performance testing with Lighthouse
- Persona-based test scenarios

## User Personas Supported

1. **Sarah (Executive)** - High-level strategic planning and delegation
2. **Marcus (Developer)** - Technical project management and time tracking
3. **Elena (Project Manager)** - Team coordination and milestone tracking
4. **James (Freelancer)** - Client work and income tracking
5. **Aisha (Student)** - Academic planning and study habits

## Technology Stack

### Frontend
- **React 18** - UI framework with modern hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### State Management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Local Storage** - Client-side persistence

### Internationalization
- **react-i18next** - Translation framework
- **chrono-node** - Natural language date parsing
- **Intl API** - Native internationalization

### AI Integration
- **Anthropic Claude** - Primary AI provider
- **OpenAI GPT** - Secondary AI provider
- **Natural** - NLP processing
- **Sentiment** - Text sentiment analysis

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **Testing Library** - Component testing
- **axe-core** - Accessibility testing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Knip** - Unused code detection

## Performance Optimizations

### Bundle Optimization
- Code splitting by routes
- Dynamic imports for widgets
- Tree shaking for unused code
- Gzip compression enabled

### Runtime Performance
- Virtual scrolling for large lists
- Memoized components and calculations
- Optimized re-renders with React.memo
- Efficient state updates

### Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management
- ARIA labels and descriptions

## Scripts and Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Production build
npm run preview          # Preview production build
npm run type-check       # TypeScript checking
npm run lint             # Code linting
npm run format           # Code formatting
```

### Testing
```bash
npm run test             # Unit tests
npm run test:ui          # Test UI
npm run test:coverage    # Test coverage
npm run test:e2e         # E2E tests
npm run test:performance # Performance tests
```

### Quality Assurance
```bash
npm run quality:analyze  # Code quality analysis
npm run quality:full     # Full quality check
npm run gates:check      # Pre-deployment gates
npm run gates:deploy     # Deployment readiness
```

### AI and Analytics
```bash
npm run ai:validate      # AI system validation
npm run bundle:analyze   # Bundle analysis
npm run 5s:analyze       # 5S organization analysis
```

This codebase represents a modern, accessible, and internationally-ready productivity application built with AI assistance and comprehensive testing coverage.