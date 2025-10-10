import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabAppShell } from '@/components/navigation/TabNavigationBar';
import { FABContainer } from '@/components/navigation/ImprovedFAB';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { useAuth } from '@/contexts/AuthContext';
import { LunaProvider } from '@/components/luna/context/LunaContext';
import { LunaFloat } from '@/components/luna/float/LunaFloat';

export default function AppShell() {
  const { notifications, removeNotification } = useNotifications();
  const { profile } = useAuth();

  return (
    <LunaProvider>
      <TabAppShell>
        {/* Tab content area */}
        <div className="min-h-screen">
          <Outlet />
        </div>

        {/* Improved FAB System with Luna Integration */}
        <FABContainer />

        {/* Luna Floating Assistant */}
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
      </TabAppShell>
    </LunaProvider>
  );
}