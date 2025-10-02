import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
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
import Habits from "@/pages/Habits";
import HabitDetail from "@/pages/HabitDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ModulesProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                <Route path="templates" element={<Templates />} />
                <Route path="recurring-tasks" element={<RecurringTasks />} />
                <Route path="tags" element={<TagManagement />} />
                <Route path="automation" element={<Automation />} />
                <Route path="habits" element={<Habits />} />
                <Route path="habits/:id" element={<HabitDetail />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ModulesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
