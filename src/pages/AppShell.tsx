import React from 'react';
import { Outlet } from 'react-router-dom';
import { UnifiedBottomNav } from '@/components/navigation/UnifiedBottomNav';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { useAuth } from '@/contexts/AuthContext';
import { LunaProvider } from '@/components/luna/context/LunaContext';
import { LunaFloat } from '@/components/luna/float/LunaFloat';
import { FABContainer } from '@/components/navigation/ImprovedFAB/FABContainer';

export default function AppShell() {
  const { notifications, removeNotification } = useNotifications();
  const { profile } = useAuth();

  return (
    <LunaProvider>
      <div className="min-h-screen bg-background">
        {/* Main content area with padding for bottom nav */}
        <main className="pb-20 md:pb-16">
          <Outlet />
        </main>

        {/* Unified Bottom Navigation */}
        <UnifiedBottomNav />

        {/* FAB - positioned above bottom nav */}
        <FABContainer />

        {/* Luna Floating Assistant - positioned above bottom nav */}
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
    </LunaProvider>
  );
}