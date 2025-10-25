import React from "react";
import { Navigate } from "react-router-dom";

import { LandingPage } from "@/components/landing/LandingPage";
import { RedesignedLandingPage } from "@/components/landing/RedesignedLandingPage";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

const Index = () => {
  console.log('[Index] Index page rendering - START');

  const { user, authLoading } = useAuth();

  console.log('[Index] Auth state:', {
    hasUser: !!user,
    authLoading,
    userEmail: user?.email || 'none',
    userObject: user
  });

  // Check if we should use the redesigned landing page
  const useRedesign = true; // Set to true to use the new design

  // Wait for auth state to stabilize before making routing decisions
  // This prevents premature redirects during logout when user state is clearing
  if (authLoading) {
    console.log('[Index] Rendering auth loading spinner');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we have a valid user and auth is not loading
  if (user) {
    console.log('[Index] Redirecting authenticated user to /app/capture');
    return <Navigate to="/app/capture" replace />;
  }

  console.log('[Index] Rendering landing page - useRedesign:', useRedesign);

  return (
    <ErrorBoundary>
      {useRedesign ? <RedesignedLandingPage /> : <LandingPage />}
    </ErrorBoundary>
  );
};

export default Index;
