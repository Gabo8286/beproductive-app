import React from "react";
import { Navigate } from "react-router-dom";

import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, authLoading } = useAuth();

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

  return <LandingPage />;
};

export default Index;
