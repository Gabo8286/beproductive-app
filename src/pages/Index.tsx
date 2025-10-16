import React from "react";
import { Navigate } from "react-router-dom";

import { LandingPage } from "@/components/landing/LandingPage";
import { RedesignedLandingPage } from "@/components/landing/RedesignedLandingPage";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  console.log('[Index] Index page rendering...');

  const { user, authLoading } = useAuth();

  console.log('[Index] Auth state:', {
    hasUser: !!user,
    authLoading,
    userEmail: user?.email || 'none'
  });

  // Check if we should use the redesigned landing page
  const useRedesign = true; // Set to true to use the new design

  // Wait for auth state to stabilize before making routing decisions
  // This prevents premature redirects during logout when user state is clearing
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Only redirect if we have a valid user and auth is not loading
  if (user) {
    return <Navigate to="/app/capture" replace />;
  }

  return useRedesign ? <RedesignedLandingPage /> : <LandingPage />;
};

export default Index;
