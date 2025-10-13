import React, { memo, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { OptimizedAuthProvider } from "@/contexts/OptimizedAuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProductivityCycleProvider } from "@/modules/productivity-cycle/contexts/ProductivityCycleContext";
import { GlobalViewProvider } from "@/contexts/GlobalViewContext";
import { ConfigProvider } from "@/contexts/ConfigContext";

// Memoized query client to prevent recreation
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Core providers that rarely change - memoized for performance
const CoreProviders = memo(({ children }: { children: React.ReactNode }) => {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <OptimizedAuthProvider>
          {children}
        </OptimizedAuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
});

CoreProviders.displayName = 'CoreProviders';

// Feature providers that may change based on user state
const FeatureProviders = memo(({ children }: { children: React.ReactNode }) => (
  <ModulesProvider>
    <AccessibilityProvider>
      <ProductivityCycleProvider>
        <GlobalViewProvider>
          {children}
        </GlobalViewProvider>
      </ProductivityCycleProvider>
    </AccessibilityProvider>
  </ModulesProvider>
));

FeatureProviders.displayName = 'FeatureProviders';

// Lazy-loaded providers that don't block initial render
const LazyProviders = React.lazy(() =>
  import('./LazyProviders').then(module => ({ default: module.LazyProviders }))
);

// Main optimized provider wrapper
export const OptimizedProviders = memo(({ children }: { children: React.ReactNode }) => (
  <CoreProviders>
    <FeatureProviders>
      <BrowserRouter>
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyProviders>
            {children}
          </LazyProviders>
        </React.Suspense>
      </BrowserRouter>
    </FeatureProviders>
  </CoreProviders>
));

OptimizedProviders.displayName = 'OptimizedProviders';