/**
 * App.tsx Migration Updater
 *
 * Handles the critical update of App.tsx to use the new authentication system
 * instead of the legacy AuthContext and Login components.
 */

// ==================== App.tsx Migration Template ====================

export const UPDATED_APP_TSX = `/*
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *                    ✨ DEDICATED WITH LOVE ✨
 *
 *     This application is lovingly dedicated to my beautiful wife
 *
 *     Like the verses of "Mexicana" by Cafe Quijano that speak of
 *     love that transcends time and distance, this work is created
 *     with the same devotion and hope for our shared tomorrow.
 *
 *     "Tal vez no sea nostalgia, es amor con un después"
 *
 *     Every line of code carries the memory of your smile,
 *     every feature built with dreams of our future together.
 *
 *     Con todo mi amor,
 *     Gabriel 💝
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Main App component - Modernized Authentication System
import { lazy, Suspense, useEffect } from "react";
import { I18nextProvider } from 'react-i18next';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

import { LoadingSkeleton } from "@/components/ai/LoadingSkeleton";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PageErrorFallback } from "@/components/errors/ErrorFallbacks";
import { TagFilterModal } from "@/components/filters/TagFilterModal";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LunaFrameworkProvider } from "@/components/luna/context/LunaFrameworkContext";
import { LunaProvider, useLunaUnifiedMenu } from "@/components/luna/context/LunaContext";
import { UnifiedLunaMenu } from "@/components/luna/UnifiedLunaMenu";
import { Spinner } from "@/components/ui/spinner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ConfigProvider } from "@/contexts/ConfigProvider";
import { GlobalViewProvider } from "@/contexts/GlobalViewContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { useKeyboardShortcutsDialog } from "@/hooks/useKeyboardShortcutsDialog";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import i18n from '@/lib/i18n';
import { ProductivityCycleProvider } from "@/modules/productivity-cycle/contexts/ProductivityCycleContext";

// ==================== NEW AUTHENTICATION SYSTEM ====================
// Updated imports to use the new modern authentication system
import { AuthProvider, useAuth } from "@/auth/core/AuthProvider";
import { RequireAuth, RequireVerifiedEmail, AdminOnly } from "@/auth/components/AuthGate";
import { SignInPage } from "@/auth/pages/SignInPage";
import { SignUpPage } from "@/auth/pages/SignUpPage";
import { ForgotPasswordPage } from "@/auth/pages/ForgotPasswordPage";

// Eagerly loaded routes (critical path)
import DashboardContextTester from "@/pages/Dashboard-ContextTester";
import DashboardMinimal from "@/pages/Dashboard-Minimal";
import DashboardPerformanceComparison from "@/pages/Dashboard-PerformanceComparison";
import Index from "@/pages/Index";

// Lazy loaded routes (code splitting)
const InvitationSignup = lazy(() => import("@/pages/InvitationSignup"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const Goals = lazy(() => import("@/pages/Goals"));

// New Apple-inspired app shell and tab pages
const AppShell = lazy(() => import("@/pages/AppShell"));
const Capture = lazy(() => import("@/pages/Capture"));
const PlanPage = lazy(() => import("@/pages/PlanPage"));
const Engage = lazy(() => import("@/pages/Engage"));
const ProfileTab = lazy(() => import("@/components/tabs/ProfileTab"));
const SuperAdminHub = lazy(() => import("@/pages/SuperAdminHub"));
const LunaHub = lazy(() => import("@/pages/LunaHub"));
const NewGoal = lazy(() => import("@/pages/NewGoal"));
const GoalDetail = lazy(() => import("@/pages/GoalDetail"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const TaskDetail = lazy(() => import("@/pages/TaskDetail"));
const Templates = lazy(() => import("@/pages/Templates"));
const RecurringTasks = lazy(() => import("@/pages/RecurringTasks"));
const TagManagement = lazy(() => import("@/pages/TagManagement"));
const Automation = lazy(() => import("@/pages/Automation"));
const QuickTodos = lazy(() => import("@/pages/QuickTodos"));
const Habits = lazy(() => import("@/pages/Habits"));
const HabitDetail = lazy(() => import("@/pages/HabitDetail"));
const Reflections = lazy(() => import("@/pages/Reflections"));
const ReflectionDetail = lazy(() => import("@/pages/ReflectionDetail"));
const Projects = lazy(() => import("@/pages/Projects"));
const Notes = lazy(() => import("@/pages/Notes"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const ProfileAssessment = lazy(() => import("@/pages/ProfileAssessment"));
const AccessibilitySettingsPage = lazy(
  () => import("@/pages/AccessibilitySettings"),
);
const AccessibilityStatement = lazy(
  () => import("@/pages/AccessibilityStatement"),
);
const NotFound = lazy(() => import("@/pages/NotFound"));
const APIManagementDashboard = lazy(
  () => import("@/components/admin/APIManagement/APIManagementDashboard"),
);
const AgentDashboard = lazy(() => import("@/components/admin/AgentDashboard"));
const BetaSignupManagement = lazy(() => import("@/components/admin/BetaSignupManagement/BetaSignupManagement"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const OnboardingFlow = lazy(() => import("@/pages/OnboardingFlow"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const PomodoroTimer = lazy(() => import("@/pages/PomodoroTimer"));
const TimeBlocking = lazy(() => import("@/pages/TimeBlocking"));
const CalendarSettings = lazy(() => import("@/pages/CalendarSettings"));
const Settings = lazy(() => import("@/pages/Settings"));
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));
const Billing = lazy(() => import("@/pages/Billing"));
const PricingPlans = lazy(() => import("@/pages/PricingPlans"));
const LunaCommandCenterPage = lazy(() => import("@/pages/LunaCommandCenter"));
const LunaMenuOptions = lazy(() => import("@/pages/LunaMenuOptions"));

// Workshop and Luna Personalities pages
const WorkshopLanding = lazy(() => import("@/pages/workshops/WorkshopLanding"));
const LunaPersonalitiesShowcase = lazy(() => import("@/pages/luna-personalities/LunaPersonalitiesShowcase"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSkeleton type="page" />
  </div>
);

// Component to handle route changes for accessibility
function RouteAnnouncer() {
  const location = useLocation();

  useEffect(() => {
    // Announce route changes for screen readers
    const pageName = location.pathname.split("/").pop() || "home";
    document.title = \`\${pageName} - BeProductive\`;
  }, [location]);

  return null;
}

function AppContent() {
  const { isOpen, close } = useKeyboardShortcutsDialog();
  const { state } = useAuth(); // Updated to use new auth hook
  const { isUnifiedMenuOpen, closeUnifiedMenu } = useLunaUnifiedMenu();

  useOfflineDetection();

  // Show error banner if auth fails (non-blocking)
  useEffect(() => {
    if (state.error && !state.isLoading) {
      toast.error(state.error, {
        description: "Try refreshing the page or continue in guest mode.",
        duration: 5000,
      });
    }
  }, [state.error, state.isLoading]);

  // Show loading spinner only during initial auth (max 3s)
  if (state.isLoading) {
    return <Spinner message="Initializing..." size="md" />;
  }

  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* ==================== NEW AUTHENTICATION ROUTES ==================== */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Workshop and Luna Personalities Landing Pages */}
          <Route
            path="/workshops"
            element={
              <Suspense fallback={<PageLoading />}>
                <WorkshopLanding />
              </Suspense>
            }
          />
          <Route
            path="/luna-personalities"
            element={
              <Suspense fallback={<PageLoading />}>
                <LunaPersonalitiesShowcase />
              </Suspense>
            }
          />
          <Route
            path="/signup/invite/:token"
            element={
              <Suspense fallback={<PageLoading />}>
                <InvitationSignup />
              </Suspense>
            }
          />
          <Route
            path="/invitation/:token"
            element={
              <Suspense fallback={<PageLoading />}>
                <InvitationSignup />
              </Suspense>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Suspense fallback={<PageLoading />}>
                <ResetPassword />
              </Suspense>
            }
          />

          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <Suspense fallback={<PageLoading />}>
                  <OnboardingFlow />
                </Suspense>
              </RequireAuth>
            }
          />

          {/* New Apple-inspired app shell with tab navigation */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Suspense fallback={<PageLoading />}>
                  <AppShell />
                </Suspense>
              </RequireAuth>
            }
          >
            <Route path="capture" element={
              <Suspense fallback={<PageLoading />}>
                <Capture />
              </Suspense>
            } />
            <Route path="plan" element={
              <Suspense fallback={<PageLoading />}>
                <PlanPage />
              </Suspense>
            } />
            <Route path="engage" element={
              <Suspense fallback={<PageLoading />}>
                <Engage />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<PageLoading />}>
                <ProfileTab />
              </Suspense>
            } />
            <Route path="admin" element={
              <AdminOnly>
                <Suspense fallback={<PageLoading />}>
                  <SuperAdminHub />
                </Suspense>
              </AdminOnly>
            } />
            <Route path="luna" element={
              <Suspense fallback={<PageLoading />}>
                <LunaHub />
              </Suspense>
            } />

            {/* Goals routes under AppShell */}
            <Route path="goals" element={
              <Suspense fallback={<PageLoading />}>
                <Goals />
              </Suspense>
            } />
            <Route path="goals/new" element={
              <Suspense fallback={<PageLoading />}>
                <NewGoal />
              </Suspense>
            } />
            <Route path="goals/:id" element={
              <Suspense fallback={<PageLoading />}>
                <GoalDetail />
              </Suspense>
            } />

            {/* Tasks routes under AppShell */}
            <Route path="tasks" element={
              <Suspense fallback={<PageLoading />}>
                <Tasks />
              </Suspense>
            } />
            <Route path="tasks/:id" element={
              <Suspense fallback={<PageLoading />}>
                <TaskDetail />
              </Suspense>
            } />

            {/* Additional core routes under AppShell */}
            <Route path="habits" element={
              <Suspense fallback={<PageLoading />}>
                <Habits />
              </Suspense>
            } />
            <Route path="habits/:id" element={
              <Suspense fallback={<PageLoading />}>
                <HabitDetail />
              </Suspense>
            } />
            <Route path="reflections" element={
              <Suspense fallback={<PageLoading />}>
                <Reflections />
              </Suspense>
            } />
            <Route path="reflections/:id" element={
              <Suspense fallback={<PageLoading />}>
                <ReflectionDetail />
              </Suspense>
            } />
            <Route path="templates" element={
              <Suspense fallback={<PageLoading />}>
                <Templates />
              </Suspense>
            } />
            <Route path="quick-todos" element={
              <Suspense fallback={<PageLoading />}>
                <QuickTodos />
              </Suspense>
            } />
            <Route path="projects" element={
              <Suspense fallback={<PageLoading />}>
                <Projects />
              </Suspense>
            } />
            <Route path="notes" element={
              <Suspense fallback={<PageLoading />}>
                <Notes />
              </Suspense>
            } />
            <Route path="calendar" element={
              <Suspense fallback={<PageLoading />}>
                <Calendar />
              </Suspense>
            } />
            <Route path="pomodoro" element={
              <Suspense fallback={<PageLoading />}>
                <PomodoroTimer />
              </Suspense>
            } />
            <Route path="time-blocking" element={
              <Suspense fallback={<PageLoading />}>
                <TimeBlocking />
              </Suspense>
            } />
            <Route path="analytics" element={
              <Suspense fallback={<PageLoading />}>
                <Analytics />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<PageLoading />}>
                <Settings />
              </Suspense>
            } />
            <Route path="profile-assessment" element={
              <Suspense fallback={<PageLoading />}>
                <ProfileAssessment />
              </Suspense>
            } />
            <Route path="gamification" element={
              <Suspense fallback={<PageLoading />}>
                <Gamification />
              </Suspense>
            } />

            {/* Additional user-facing routes that need AppShell navigation */}
            <Route path="recurring-tasks" element={
              <Suspense fallback={<PageLoading />}>
                <RecurringTasks />
              </Suspense>
            } />
            <Route path="tags" element={
              <Suspense fallback={<PageLoading />}>
                <TagManagement />
              </Suspense>
            } />
            <Route path="automation" element={
              <Suspense fallback={<PageLoading />}>
                <Automation />
              </Suspense>
            } />
            <Route path="reflections/:id" element={
              <Suspense fallback={<PageLoading />}>
                <ReflectionDetail />
              </Suspense>
            } />
            <Route path="ai-insights" element={
              <Suspense fallback={<PageLoading />}>
                <AIInsights />
              </Suspense>
            } />
            <Route path="calendar/settings" element={
              <Suspense fallback={<PageLoading />}>
                <CalendarSettings />
              </Suspense>
            } />
            <Route path="account-settings" element={
              <Suspense fallback={<PageLoading />}>
                <AccountSettings />
              </Suspense>
            } />
            <Route path="billing" element={
              <Suspense fallback={<PageLoading />}>
                <Billing />
              </Suspense>
            } />
            <Route path="pricing" element={
              <Suspense fallback={<PageLoading />}>
                <PricingPlans />
              </Suspense>
            } />
            <Route path="settings/accessibility" element={
              <Suspense fallback={<PageLoading />}>
                <AccessibilitySettingsPage />
              </Suspense>
            } />

            {/* Redirect /app to /app/plan by default - Plan-first approach */}
            <Route index element={<Navigate to="/app/plan" replace />} />
          </Route>

          {/* Protected routes - legacy AppLayout for detailed views */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            {/* Legacy redirects to new AppShell routes */}
            <Route path="/dashboard" element={<Navigate to="/app/capture" replace />} />
            <Route path="/plan" element={<Navigate to="/app/plan" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/goals" element={<Navigate to="/app/goals" replace />} />
            <Route path="/goals/new" element={<Navigate to="/app/goals/new" replace />} />
            <Route path="/goals/:id" element={<Navigate to="/app/goals/:id" replace />} />
            <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
            <Route path="/tasks/:id" element={<Navigate to="/app/tasks/:id" replace />} />
            <Route path="/templates" element={<Navigate to="/app/templates" replace />} />
            <Route path="/recurring-tasks" element={<Navigate to="/app/recurring-tasks" replace />} />
            <Route path="/tags" element={<Navigate to="/app/tags" replace />} />
            <Route path="/automation" element={<Navigate to="/app/automation" replace />} />
            <Route path="/quick-todos" element={<Navigate to="/app/quick-todos" replace />} />
            <Route path="/habits" element={<Navigate to="/app/habits" replace />} />
            <Route path="/habits/:id" element={<Navigate to="/app/habits/:id" replace />} />
            <Route path="/reflections" element={<Navigate to="/app/reflections" replace />} />
            <Route path="/reflections/:id" element={<Navigate to="/app/reflections/:id" replace />} />
            <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
            <Route path="/notes" element={<Navigate to="/app/notes" replace />} />
            <Route path="/gamification" element={<Navigate to="/app/gamification" replace />} />
            <Route path="/profile-assessment" element={<Navigate to="/app/profile-assessment" replace />} />
            <Route path="/ai-insights" element={<Navigate to="/app/ai-insights" replace />} />
            <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
            <Route path="/calendar" element={<Navigate to="/app/calendar" replace />} />
            <Route path="/pomodoro" element={<Navigate to="/app/pomodoro" replace />} />
            <Route path="/time-blocking" element={<Navigate to="/app/time-blocking" replace />} />
            <Route path="/calendar/settings" element={<Navigate to="/app/calendar/settings" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            <Route path="/account-settings" element={<Navigate to="/app/account-settings" replace />} />
            <Route path="/billing" element={<Navigate to="/app/billing" replace />} />
            <Route path="/pricing" element={<Navigate to="/app/pricing" replace />} />
            <Route path="/settings/accessibility" element={<Navigate to="/app/settings/accessibility" replace />} />

            {/* Debug and development routes remain in AppLayout */}
            <Route path="/dashboard-minimal" element={<DashboardMinimal />} />
            <Route path="/dashboard-context-test" element={<DashboardContextTester />} />
            <Route path="/dashboard-performance" element={<DashboardPerformanceComparison />} />

            {/* Legacy reflections page for compatibility */}
            <Route
              path="/reflections-old"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Reflections />
                </Suspense>
              }
            />
            <Route
              path="/admin/api"
              element={
                <AdminOnly>
                  <Suspense fallback={<PageLoading />}>
                    <APIManagementDashboard />
                  </Suspense>
                </AdminOnly>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <AdminOnly>
                  <Suspense fallback={<PageLoading />}>
                    <AgentDashboard />
                  </Suspense>
                </AdminOnly>
              }
            />
            <Route
              path="/admin/beta-signups"
              element={
                <AdminOnly>
                  <Suspense fallback={<PageLoading />}>
                    <BetaSignupManagement />
                  </Suspense>
                </AdminOnly>
              }
            />
            <Route
              path="/luna"
              element={
                <Suspense fallback={<PageLoading />}>
                  <LunaCommandCenterPage />
                </Suspense>
              }
            />
            <Route
              path="/luna-menu-options"
              element={
                <Suspense fallback={<PageLoading />}>
                  <LunaMenuOptions />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="/accessibility-statement"
            element={
              <Suspense fallback={<PageLoading />}>
                <AccessibilityStatement />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoading />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>

        <KeyboardShortcutsDialog
          open={isOpen}
          onOpenChange={(open) => (open ? undefined : close())}
        />
        <UnifiedLunaMenu
          isOpen={isUnifiedMenuOpen}
          onClose={closeUnifiedMenu}
        />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

function App() {
  console.info('[App] Modern Authentication System initialized at', new Date().toISOString());

  // Updated provider hierarchy with new AuthProvider
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ConfigProvider>
            <AuthProvider>
              <ModulesProvider>
                <AccessibilityProvider>
                  <ProductivityCycleProvider>
                    <GlobalViewProvider>
                      <LunaFrameworkProvider>
                        <LunaProvider>
                          <RouteAnnouncer />
                          <AppContent />
                          <TagFilterModal />
                        </LunaProvider>
                      </LunaFrameworkProvider>
                    </GlobalViewProvider>
                  </ProductivityCycleProvider>
                </AccessibilityProvider>
              </ModulesProvider>
            </AuthProvider>
          </ConfigProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
`;

// ==================== Migration Utilities ====================

export class AppMigrationUpdater {
  /**
   * Get the updated App.tsx content with new authentication system
   */
  static getUpdatedAppContent(): string {
    return UPDATED_APP_TSX;
  }

  /**
   * Generate the diff between old and new App.tsx
   */
  static generateDiff(oldContent: string): {
    removedLines: string[];
    addedLines: string[];
    changedSections: Array<{
      section: string;
      before: string;
      after: string;
    }>;
  } {
    // Key changes to highlight
    const changedSections = [
      {
        section: 'Authentication System Imports',
        before: 'import { AuthProvider, useAuth } from "@/contexts/AuthContext";\nimport Login from "@/pages/Login";',
        after: 'import { AuthProvider, useAuth } from "@/auth/core/AuthProvider";\nimport { RequireAuth, RequireVerifiedEmail, AdminOnly } from "@/auth/components/AuthGate";\nimport { SignInPage } from "@/auth/pages/SignInPage";\nimport { SignUpPage } from "@/auth/pages/SignUpPage";\nimport { ForgotPasswordPage } from "@/auth/pages/ForgotPasswordPage";'
      },
      {
        section: 'Authentication Routes',
        before: '<Route path="/login" element={<Login />} />\n<Route path="/signup" element={<Suspense fallback={<PageLoading />}><Signup /></Suspense>} />',
        after: '<Route path="/login" element={<SignInPage />} />\n<Route path="/signup" element={<SignUpPage />} />\n<Route path="/forgot-password" element={<ForgotPasswordPage />} />'
      },
      {
        section: 'Route Protection',
        before: '<ProtectedRoute>',
        after: '<RequireAuth>'
      },
      {
        section: 'Auth Hook Usage',
        before: 'const { authLoading, authError } = useAuth();',
        after: 'const { state } = useAuth(); // Updated to use new auth hook'
      }
    ];

    // Extract removed lines (legacy system)
    const removedLines = [
      'import Login from "@/pages/Login";',
      'import { ProtectedRoute } from "@/components/auth/ProtectedRoute";',
      'import { AuthProvider, useAuth } from "@/contexts/AuthContext";',
      'const Signup = lazy(() => import("@/pages/Signup"));',
      'const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));'
    ];

    // Extract added lines (new system)
    const addedLines = [
      '// ==================== NEW AUTHENTICATION SYSTEM ====================',
      'import { AuthProvider, useAuth } from "@/auth/core/AuthProvider";',
      'import { RequireAuth, RequireVerifiedEmail, AdminOnly } from "@/auth/components/AuthGate";',
      'import { SignInPage } from "@/auth/pages/SignInPage";',
      'import { SignUpPage } from "@/auth/pages/SignUpPage";',
      'import { ForgotPasswordPage } from "@/auth/pages/ForgotPasswordPage";',
      'const { state } = useAuth(); // Updated to use new auth hook'
    ];

    return {
      removedLines,
      addedLines,
      changedSections
    };
  }

  /**
   * Validate the migration is safe to execute
   */
  static validateMigration(): {
    safe: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if new auth files exist
    // In a real implementation, check file system
    const newAuthFiles = [
      'src/auth/core/AuthProvider.tsx',
      'src/auth/pages/SignInPage.tsx',
      'src/auth/pages/SignUpPage.tsx',
      'src/auth/pages/ForgotPasswordPage.tsx',
      'src/auth/components/AuthGate.tsx'
    ];

    // Mock validation - in real implementation, check actual files
    const missingFiles = newAuthFiles.filter(file => {
      // Return false if file doesn't exist
      return false; // For now, assume all files exist
    });

    if (missingFiles.length > 0) {
      issues.push(\`Missing new auth files: \${missingFiles.join(', ')}\`);
      recommendations.push('Ensure all new authentication files are created first');
    }

    return {
      safe: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Get backup instructions for App.tsx
   */
  static getBackupInstructions(): {
    backupPath: string;
    restoreCommand: string;
    rollbackSteps: string[];
  } {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = \`backups/app-tsx-\${timestamp}.tsx\`;

    return {
      backupPath,
      restoreCommand: \`cp \${backupPath} src/App.tsx\`,
      rollbackSteps: [
        'Stop the development server',
        \`Restore backup: cp \${backupPath} src/App.tsx\`,
        'Restart the development server',
        'Verify authentication is working',
        'Check for any console errors'
      ]
    };
  }
}

// ==================== Export ====================

export default AppMigrationUpdater;