// Main App component - Force rebuild
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProductivityCycleProvider } from "@/modules/productivity-cycle/contexts/ProductivityCycleContext";
import { GlobalViewProvider } from "@/contexts/GlobalViewContext";
import { LunaProvider } from "@/components/luna/context/LunaContext";
import { LunaFrameworkProvider } from "@/components/luna/context/LunaFrameworkContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { TagFilterModal } from "@/components/filters/TagFilterModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PageErrorFallback } from "@/components/errors/ErrorFallbacks";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { useKeyboardShortcutsDialog } from "@/hooks/useKeyboardShortcutsDialog";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { lazy, Suspense, useEffect } from "react";
import { LoadingSkeleton } from "@/components/ai/LoadingSkeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Eagerly loaded routes (critical path)
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DashboardMinimal from "@/pages/Dashboard-Minimal";
import DashboardContextTester from "@/pages/Dashboard-ContextTester";
import DashboardPerformanceComparison from "@/pages/Dashboard-PerformanceComparison";

// Lazy loaded routes (code splitting)
const Signup = lazy(() => import("@/pages/Signup"));
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
            path="/forgot-password"
            element={
              <Suspense fallback={<PageLoading />}>
                <ForgotPassword />
              </Suspense>
            }
          />
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
            {/* Redirect /app to /app/capture by default */}
            <Route index element={<Navigate to="/app/capture" replace />} />
          </Route>

          {/* Protected routes - legacy AppLayout for detailed views */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Navigate to="/app/capture" replace />} />
            <Route path="/dashboard-minimal" element={<DashboardMinimal />} />
            <Route path="/dashboard-context-test" element={<DashboardContextTester />} />
            <Route path="/dashboard-performance" element={<DashboardPerformanceComparison />} />
            <Route path="/plan" element={<Navigate to="/app/plan" replace />} />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="/goals"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Goals />
                </Suspense>
              }
            />
            <Route
              path="/goals/new"
              element={
                <Suspense fallback={<PageLoading />}>
                  <NewGoal />
                </Suspense>
              }
            />
            <Route
              path="/goals/:id"
              element={
                <Suspense fallback={<PageLoading />}>
                  <GoalDetail />
                </Suspense>
              }
            />
            <Route
              path="/tasks"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Tasks />
                </Suspense>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <Suspense fallback={<PageLoading />}>
                  <TaskDetail />
                </Suspense>
              }
            />
            <Route
              path="/templates"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Templates />
                </Suspense>
              }
            />
            <Route
              path="/recurring-tasks"
              element={
                <Suspense fallback={<PageLoading />}>
                  <RecurringTasks />
                </Suspense>
              }
            />
            <Route
              path="/tags"
              element={
                <Suspense fallback={<PageLoading />}>
                  <TagManagement />
                </Suspense>
              }
            />
            <Route
              path="/automation"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Automation />
                </Suspense>
              }
            />
            <Route
              path="/quick-todos"
              element={
                <Suspense fallback={<PageLoading />}>
                  <QuickTodos />
                </Suspense>
              }
            />
            <Route
              path="/habits"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Habits />
                </Suspense>
              }
            />
            <Route
              path="/habits/:id"
              element={
                <Suspense fallback={<PageLoading />}>
                  <HabitDetail />
                </Suspense>
              }
            />
            <Route
              path="/reflections"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Reflections />
                </Suspense>
              }
            />
            <Route
              path="/reflections/:id"
              element={
                <Suspense fallback={<PageLoading />}>
                  <ReflectionDetail />
                </Suspense>
              }
            />
            <Route
              path="/projects"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Projects />
                </Suspense>
              }
            />
            <Route
              path="/notes"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Notes />
                </Suspense>
              }
            />
            <Route
              path="/gamification"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Gamification />
                </Suspense>
              }
            />
            <Route
              path="/profile-assessment"
              element={
                <Suspense fallback={<PageLoading />}>
                  <ProfileAssessment />
                </Suspense>
              }
            />
            <Route
              path="/ai-insights"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AIInsights />
                </Suspense>
              }
            />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Analytics />
                </Suspense>
              }
            />
            <Route
              path="/calendar"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Calendar />
                </Suspense>
              }
            />
            <Route
              path="/pomodoro"
              element={
                <Suspense fallback={<PageLoading />}>
                  <PomodoroTimer />
                </Suspense>
              }
            />
            <Route
              path="/time-blocking"
              element={
                <Suspense fallback={<PageLoading />}>
                  <TimeBlocking />
                </Suspense>
              }
            />
            <Route
              path="/calendar/settings"
              element={
                <Suspense fallback={<PageLoading />}>
                  <CalendarSettings />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="/account-settings"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AccountSettings />
                </Suspense>
              }
            />
            <Route
              path="/billing"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Billing />
                </Suspense>
              }
            />
            <Route
              path="/pricing"
              element={
                <Suspense fallback={<PageLoading />}>
                  <PricingPlans />
                </Suspense>
              }
            />
            <Route
              path="/settings/accessibility"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AccessibilitySettingsPage />
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
              path="/luna"
              element={
                <Suspense fallback={<PageLoading />}>
                  <LunaCommandCenterPage />
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
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AuthProvider>
          <ModulesProvider>
            <AccessibilityProvider>
              <ProductivityCycleProvider>
                <GlobalViewProvider>
                  <LunaFrameworkProvider>
                    <ErrorBoundary
                      fallback={
                        <div className="fixed bottom-4 right-4 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2">
                          Luna Assistant loading...
                        </div>
                      }
                      onError={(error) => console.warn('Luna initialization error:', error)}
                    >
                      <LunaProvider>
                        <BrowserRouter>
                          <RouteAnnouncer />
                          <AppContent />
                          <TagFilterModal />
                        </BrowserRouter>
                      </LunaProvider>
                    </ErrorBoundary>
                  </LunaFrameworkProvider>
                </GlobalViewProvider>
              </ProductivityCycleProvider>
            </AccessibilityProvider>
          </ModulesProvider>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
