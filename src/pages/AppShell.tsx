import React from 'react';
import { Outlet } from 'react-router-dom';
import { UnifiedBottomNav } from '@/components/navigation/UnifiedBottomNav';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { useAuth } from '@/contexts/AuthContext';
import { LunaProvider } from '@/components/luna/context/LunaContext';
import { LunaFloat } from '@/components/luna/float/LunaFloat';
import { useLunaRouteContext } from '@/components/luna/hooks/useLunaRouteContext';

function AppShellContent() {
  const { notifications, removeNotification } = useNotifications();
  const { profile } = useAuth();
  
  // Auto-set Luna context based on route
  useLunaRouteContext();

  return (
      <div className="min-h-screen bg-background">
        {/* Main content area with padding for bottom nav */}
        <main className="pb-20 md:pb-16">
          <Outlet />
        </main>

        {/* Unified Bottom Navigation */}
        <UnifiedBottomNav />

        {/* Luna Floating Assistant - positioned in top-right */}
        <LunaFloat
          draggable={true}
          showTooltip={true}
          autoHide={false}
        />

        {/* Notification System */}
        <NotificationContainer
          notifications={notifications}
          onClose={removeNotification}
        />
      </div>
  );
}

export default function AppShell() {
  return (
    <LunaProvider>
      <AppShellContent />
    </LunaProvider>
  );
}