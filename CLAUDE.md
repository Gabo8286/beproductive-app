# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:8080
- `npm run dev:mobile` - Mobile-sized floating window (distraction-free mobile development)
- `npm run dev:iphone` - iPhone 14 Pro sized window (393×852)
- `npm run dev:android` - Google Pixel 7 sized window (412×915)
- `npm run build` - Build for production
- `npm run type-check` - TypeScript type checking (run before commits)
- `npm run lint` - ESLint code linting
- `npm run lint:fix` - Auto-fix linting issues

### Testing
- `npm run test:run` - Run unit tests once (83% coverage)
- `npm run test:e2e` - End-to-end tests with Playwright
- `npm run test:performance` - Performance and Web Vitals testing
- `npm run test:production-readiness` - Full production readiness validation

### Production Quality Gates
- `npm run gates:check` - Pre-deployment validation (lint + tests + bundle analysis)
- `npm run quality:full` - Complete quality check (lint + coverage + analysis)
- `npm run production:ready` - Full production readiness check

## Architecture Overview

### Core Stack
- **React 18** with TypeScript in strict mode
- **Vite** as build tool with React SWC plugin
- **Supabase** for authentication and PostgreSQL database
- **Tailwind CSS** with Radix UI components
- **TanStack Query** for server state management
- **Framer Motion** for animations

### Key Architectural Patterns

#### Widget-Based Dashboard System
The application centers around a modular widget system:
- `src/components/widgets/WidgetGrid.tsx` - Main container with drag-and-drop
- `src/components/widgets/DraggableWidget.tsx` - Individual widget wrapper
- `src/hooks/useWidgetLayout.tsx` - Widget state management
- Widgets are dynamically loaded and support real-time reordering

#### Multi-Context Architecture
The app uses a layered context system:
```
QueryClient > ConfigProvider > AuthProvider > ModulesProvider >
AccessibilityProvider > ProductivityCycleProvider > GlobalViewProvider >
LunaFrameworkProvider > LunaProvider > BrowserRouter
```

#### Authentication & Authorization
- Supports Supabase Cloud, Local Auth, and Guest Mode
- Row-level security enabled on all database tables
- Guest mode with persona-based demo data (Executive, Developer, PM, Freelancer, Student)
- Local mode for Docker/offline development

#### Route Structure
- `/app/*` - Modern Apple-inspired tab navigation (Capture, Plan, Engage, Profile)
- Legacy routes with traditional sidebar for detailed views
- Lazy loading for all non-critical routes
- Protected routes with authentication wrapper

### Module System
Modules are defined in `src/config/modules.ts` with:
- Role-based access control
- Dynamic enabling/disabling
- Icon and path configuration
- Integration with the widget system

### AI Integration
- Multi-provider support (OpenAI, Anthropic Claude, Google Gemini)
- User-controlled API keys stored securely
- AI agents system for monitoring, security, and backup
- Natural language processing for task extraction

### Internationalization
- 7 languages supported with react-i18next
- RTL support for Arabic and Hebrew
- Cultural number and date formatting
- Dynamic language switching

### Accessibility
- WCAG AAA compliance (7:1 contrast ratios)
- Comprehensive screen reader support
- Keyboard navigation throughout
- Three theme modes: Light, Dark, High Contrast

## Development Guidelines

### File Paths & Aliases
- Use `@/` alias for src imports (configured in tsconfig.json and vite.config.ts)
- Absolute imports required - no relative imports outside immediate directory

### Component Structure
- UI components in `src/components/ui/` (shadcn/ui based)
- Business logic components organized by feature
- Widgets in `src/components/widgets/`
- Pages in `src/pages/`

### State Management
- React Context for global state
- TanStack Query for server state
- Local storage utilities in `src/utils/storage/`
- Guest mode state persisted across sessions

### Error Handling
- Global error boundary in `src/components/errors/`
- Comprehensive error logging and diagnostics
- Graceful fallbacks for network issues
- Browser-specific diagnostics (especially Brave browser)

### Testing Strategy
- Unit tests with Vitest and Testing Library
- E2E tests with Playwright
- Accessibility testing with axe-core
- Performance testing with Web Vitals
- Production readiness test suites

### Performance Considerations
- Code splitting with React.lazy()
- Bundle analysis with `npm run build:analyze`
- Web Vitals monitoring
- Image optimization and lazy loading
- Component memoization where appropriate

### Security
- Input validation with Zod schemas
- Sanitization of user content
- Secure API key storage
- Rate limiting for AI calls
- Comprehensive audit scripts

## Mobile Development Mode

The application supports mobile-first development with smartphone-sized floating windows for authentic mobile testing and distraction-free development.

### Usage
```bash
# Default mobile window (390×844 - Modern smartphone)
npm run dev:mobile

# iPhone 14 Pro simulation (393×852)
npm run dev:iphone

# Google Pixel 7 simulation (412×915)
npm run dev:android

# Full-screen development (unchanged)
npm run dev
```

### Device Presets
- **Modern Mobile (Default)**: 390×844 pixels - Average modern smartphone
- **iPhone 14 Pro**: 393×852 pixels - Apple's latest flagship
- **iPhone SE**: 375×667 pixels - Compact iPhone experience
- **Google Pixel 7**: 412×915 pixels - Modern Android flagship
- **Galaxy S23**: 384×854 pixels - Samsung flagship

### Features
- **Floating Window**: Centered on screen, simulates real mobile device
- **Device Simulation**: Multiple smartphone presets for realistic testing
- **Cross-Platform**: Supports macOS, Windows, and Linux
- **Browser Optimization**: Chrome dev tools ready for mobile debugging
- **Responsive Testing**: Triggers mobile CSS breakpoints automatically
- **Server Detection**: Waits for development server before opening browser

### Benefits
- **Authentic Mobile Experience**: Real smartphone dimensions for accurate testing
- **Distraction-Free**: Small floating window reduces screen clutter
- **Mobile-First Development**: Perfect for responsive design workflows
- **Device Testing**: Test across different mobile form factors
- **Maximizable**: Can be expanded to full screen when needed
- **Professional Workflow**: Ideal for mobile app development

### Technical Details
- Uses `scripts/open-mobile-window.js` for cross-platform mobile window launching
- Centered positioning calculated for floating window effect
- Device scale factor optimization for consistent mobile rendering
- Falls back gracefully to system default browser if specific browsers not found

### Advanced Usage
```bash
# Run with specific device preset
node scripts/open-mobile-window.js iphone14
node scripts/open-mobile-window.js pixel7

# Show all available device presets
node scripts/open-mobile-window.js --help
```

## Common Patterns

### Adding a New Widget
1. Create component in `src/components/widgets/`
2. Add to widget registry in `src/hooks/useWidgetLayout.tsx`
3. Update module configuration if needed
4. Add tests for the widget

### Adding a New Route
1. Create page component in `src/pages/`
2. Add lazy import in `src/App.tsx`
3. Add route definition with proper protection
4. Update navigation if needed

### Database Operations
- Use Supabase client with proper error handling
- Always check for local mode vs cloud mode
- Implement Row Level Security policies
- Handle offline scenarios gracefully

### AI Feature Integration
- Check user API key availability
- Implement fallback providers
- Rate limiting and cost tracking
- User permission controls

## Environment Variables
Required for development:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_LOCAL_MODE=true` - For local development

## Important Notes
- Local mode supports Docker development environments
- All components support dark mode and RTL languages
- Performance gates must pass before deployment
- Accessibility compliance is mandatory for all new features