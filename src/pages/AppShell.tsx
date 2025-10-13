import React from 'react';
import { Outlet } from 'react-router-dom';
import { UnifiedBottomNav } from '@/components/navigation/UnifiedBottomNav';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { useAuth } from '@/contexts/AuthContext';
import { LunaFloat } from '@/components/luna/float/LunaFloat';
import { LunaChatModal } from '@/components/luna/modal/LunaChatModal';
import { useLunaRouteContext } from '@/components/luna/hooks/useLunaRouteContext';
import { PageErrorBoundary } from '@/components/errors/CascadingErrorBoundary';

function AppShellContent() {
  const { notifications, removeNotification } = useNotifications();
  const { profile } = useAuth();
  
  // Auto-set Luna context based on route
  useLunaRouteContext();

  return (
    <PageErrorBoundary pageName="AppShell">
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

        {/* Luna Chat Modal */}
        <LunaChatModal />

        {/* Notification System */}
        <NotificationContainer
          notifications={notifications}
          onClose={removeNotification}
        />
      </div>
    </PageErrorBoundary>
  );
}

export default function AppShell() {
  return <AppShellContent />;
}