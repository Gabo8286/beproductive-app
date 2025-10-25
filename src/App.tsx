/*
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

// Main App component - Force rebuild
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { I18nextProvider } from 'react-i18next';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ai/LoadingSkeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TagFilterModal } from "@/components/filters/TagFilterModal";
import { LunaProvider, useLunaUnifiedMenu } from "@/components/luna/context/LunaContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";


import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { GlobalViewProvider } from "@/contexts/GlobalViewContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ProductivityCycleProvider } from "@/modules/productivity-cycle/contexts/ProductivityCycleContext";
import { LunaFrameworkProvider } from "@/components/luna/context/LunaFrameworkContext";
import { UnifiedLunaMenu } from "@/components/luna/UnifiedLunaMenu";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PageErrorFallback } from "@/components/errors/ErrorFallbacks";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { useKeyboardShortcutsDialog } from "@/hooks/useKeyboardShortcutsDialog";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { Spinner } from "@/components/ui/spinner";


import i18n from '@/lib/i18n';

// Eagerly loaded routes (critical path)
import DashboardContextTester from "@/pages/Dashboard-ContextTester";
import DashboardMinimal from "@/pages/Dashboard-Minimal";
import DashboardPerformanceComparison from "@/pages/Dashboard-PerformanceComparison";
import Index from "@/pages/Index";
import Login from "@/pages/Login";

// Lazy loaded routes (code splitting)
const Signup = lazy(() => import("@/pages/Signup"));
const InvitationSignup = lazy(() => import("@/pages/InvitationSignup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
// Legacy Plan component removed - now redirects to /app/plan
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
// AIInsights page temporarily disabled
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

// Lead Generation pages - TEMPORARILY COMMENTED OUT FOR DEBUGGING
// const LeadGenerationAssessment = lazy(() => import("@/pages/LeadGenerationAssessment"));
// const PersonalizedResults = lazy(() => import("@/pages/PersonalizedResults"));
// const LeadManagement = lazy(() => import("@/pages/admin/LeadManagement"));

// AI components are exported from widgets/index.ts

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
    document.title = `${pageName} - BeProductive`;
  }, [location]);

  return null;
}

function AppContent() {

  const { isOpen, close } = useKeyboardShortcutsDialog();
  const { authLoading, authError } = useAuth();
  const { isUnifiedMenuOpen, closeUnifiedMenu } = useLunaUnifiedMenu();



  useOfflineDetection();

  // Show error banner if auth fails (non-blocking)
  useEffect(() => {
    if (authError && !authLoading) {
      toast.error(authError, {
        description: "Try refreshing the page or continue in guest mode.",
        duration: 5000,
      });
    }
  }, [authError, authLoading]);

  // Show loading spinner only during initial auth (max 3s)
  if (authLoading) {
    return <Spinner message="Initializing..." size="md" />;
  }

  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<PageLoading />}>
                <Signup />
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
            path="/forgot-password"
            element={
              <Suspense fallback={<PageLoading />}>
                <ForgotPassword />
              </Suspense>
            }
          />

          {/* Lead Generation Assessment - TEMPORARILY COMMENTED OUT FOR DEBUGGING */}
          {/*
          <Route
            path="/assessment"
            element={
              <Suspense fallback={<PageLoading />}>
                <LeadGenerationAssessment />
              </Suspense>
            }
          />
          <Route
            path="/assessment/results"
            element={
              <Suspense fallback={<PageLoading />}>
                <PersonalizedResults />
              </Suspense>
            }
          />
          */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <OnboardingFlow />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* New Apple-inspired app shell with tab navigation */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}>
                  <AppShell />
                </Suspense>
              </ProtectedRoute>
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
              <Suspense fallback={<PageLoading />}>
                <SuperAdminHub />
              </Suspense>
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
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
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
                <Suspense fallback={<PageLoading />}>
                  <APIManagementDashboard />
                </Suspense>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AgentDashboard />
                </Suspense>
              }
            />
            <Route
              path="/admin/beta-signups"
              element={
                <Suspense fallback={<PageLoading />}>
                  <BetaSignupManagement />
                </Suspense>
              }
            />
            {/* TEMPORARILY COMMENTED OUT FOR DEBUGGING */}
            {/*
            <Route
              path="/admin/leads"
              element={
                <Suspense fallback={<PageLoading />}>
                  <LeadManagement />
                </Suspense>
              }
            />
            */}
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
  console.error('[App] DEBUG: App component started rendering at', new Date().toISOString());

  // Fixed provider hierarchy - BrowserRouter moved higher to provide router context to all providers
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
