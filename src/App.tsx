import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PageErrorFallback } from "@/components/errors/ErrorFallbacks";
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog";
import { useKeyboardShortcutsDialog } from "@/hooks/useKeyboardShortcutsDialog";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { lazy, Suspense, useEffect } from "react";
import { LoadingSkeleton } from "@/components/ai/LoadingSkeleton";

// Eagerly loaded routes (critical path)
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

// Lazy loaded routes (code splitting)
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const Goals = lazy(() => import("@/pages/Goals"));
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
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const AccessibilitySettingsPage = lazy(() => import("@/pages/AccessibilitySettings"));
const AccessibilityStatement = lazy(() => import("@/pages/AccessibilityStatement"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const APIManagementDashboard = lazy(() => import("@/components/admin/APIManagement/APIManagementDashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const SystemStatus = lazy(() => import("@/pages/SystemStatus"));

// Lazy loaded AI components
export const SmartRecommendationsWidget = lazy(() =>
  import("@/components/widgets/SmartRecommendationsWidget").then(module => ({
    default: module.SmartRecommendationsWidget
  }))
);

export const TimeTrackingWidget = lazy(() =>
  import("@/components/widgets/TimeTrackingWidget").then(module => ({
    default: module.TimeTrackingWidget
  }))
);

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
    const pageName = location.pathname.split('/').pop() || 'home';
    document.title = `${pageName} - BeProductive`;
  }, [location]);

  return null;
}

function AppContent() {
  const { isOpen, close } = useKeyboardShortcutsDialog();
  useOfflineDetection();

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
            path="/accept-invitation"
            element={
              <Suspense fallback={<PageLoading />}>
                <AcceptInvitation />
              </Suspense>
            }
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
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
              path="/team"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Team />
                </Suspense>
              }
            />
            <Route
              path="/processes"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Processes />
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
              path="/system/status"
              element={
                <Suspense fallback={<PageLoading />}>
                  <SystemStatus />
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

        <KeyboardShortcutsDialog open={isOpen} onOpenChange={(open) => open ? undefined : close()} />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModulesProvider>
          <AccessibilityProvider>
            <BrowserRouter>
              <RouteAnnouncer />
              <AppContent />
            </BrowserRouter>
          </AccessibilityProvider>
        </ModulesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;