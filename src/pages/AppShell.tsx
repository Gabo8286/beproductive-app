import { Outlet } from 'react-router-dom';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { LunaChatModal } from '@/components/luna/modal/LunaChatModal';
import { useLunaRouteContext } from '@/components/luna/hooks/useLunaRouteContext';
import { PageErrorBoundary } from '@/components/errors/CascadingErrorBoundary';
import { BeProductiveTabBar } from '@/components/navigation/BeProductiveTabBar';

function AppShellContent() {
  const { notifications, removeNotification } = useNotifications();

  // Auto-set Luna context based on route
  useLunaRouteContext();

  return (
    <PageErrorBoundary pageName="AppShell">
      <div className="min-h-screen bg-background">
        {/* Main content area with padding for tab bar */}
        <main className="pb-20">
          <Outlet />
        </main>

        {/* BeProductive iOS Tab Bar - Primary navigation */}
        <BeProductiveTabBar />

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