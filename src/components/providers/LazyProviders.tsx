import React, { memo } from 'react';
import { LunaFrameworkProvider } from "@/components/luna/context/LunaFrameworkContext";
import { LunaProvider } from "@/components/luna/context/LunaContext";

// Luna providers - loaded lazily since they're not critical for initial render
export const LazyProviders = memo(({ children }: { children: React.ReactNode }) => (
  <LunaFrameworkProvider>
    <LunaProvider>
      {children}
    </LunaProvider>
  </LunaFrameworkProvider>
));

LazyProviders.displayName = 'LazyProviders';