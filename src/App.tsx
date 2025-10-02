import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PageErrorFallback } from "@/components/errors/ErrorFallbacks";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { announceRouteChange } from "@/utils/accessibility/focusManagement";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Goals from "@/pages/Goals";
import NewGoal from "@/pages/NewGoal";
import GoalDetail from "@/pages/GoalDetail";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Templates from "@/pages/Templates";
import RecurringTasks from "@/pages/RecurringTasks";
import TagManagement from "@/pages/TagManagement";
import Automation from "@/pages/Automation";
import QuickTodos from "@/pages/QuickTodos";
import Habits from "@/pages/Habits";
import HabitDetail from "@/pages/HabitDetail";
import Reflections from "@/pages/Reflections";
import ReflectionDetail from "@/pages/ReflectionDetail";
import AccessibilitySettingsPage from "@/pages/AccessibilitySettings";
import AccessibilityStatement from "@/pages/AccessibilityStatement";
import NotFound from "@/pages/NotFound";
import { useMemo } from "react";

const AppContent = () => {
  // Enable offline detection
  useOfflineDetection();
  
  const location = useLocation();

  // Announce route changes to screen readers
  useEffect(() => {
    announceRouteChange(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {/* ARIA Live Regions for screen reader announcements */}
      <div 
        id="aria-live-polite" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
      />
      <div 
        id="aria-live-assertive" 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only" 
      />
      
      <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/accessibility" element={<AccessibilityStatement />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="goals" element={<Goals />} />
        <Route path="goals/new" element={<NewGoal />} />
        <Route path="goals/:id" element={<GoalDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="quick-todos" element={<QuickTodos />} />
        <Route path="templates" element={<Templates />} />
        <Route path="recurring-tasks" element={<RecurringTasks />} />
        <Route path="tags" element={<TagManagement />} />
        <Route path="automation" element={<Automation />} />
        <Route path="habits" element={<Habits />} />
        <Route path="habits/:id" element={<HabitDetail />} />
        <Route path="reflections" element={<Reflections />} />
        <Route path="reflections/:id" element={<ReflectionDetail />} />
        <Route path="settings/accessibility" element={<AccessibilitySettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

const App = () => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <ErrorBoundary fallback={PageErrorFallback} level="page">
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <ModulesProvider>
                  <AppContent />
                </ModulesProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
