import { Outlet } from 'react-router-dom';
import { UnifiedBottomNav } from '@/components/navigation/UnifiedBottomNav';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { LunaChatModal } from '@/components/luna/modal/LunaChatModal';
import { useLunaRouteContext } from '@/components/luna/hooks/useLunaRouteContext';
import { PageErrorBoundary } from '@/components/errors/CascadingErrorBoundary';
import { UniversalBreadcrumbs } from '@/components/navigation/UniversalBreadcrumbs';
import { CompactLanguageSwitcher } from '@/components/ui/LanguageSwitcher';

function AppShellContent() {
  const { notifications, removeNotification } = useNotifications();
  
  // Auto-set Luna context based on route
  useLunaRouteContext();

  return (
    <PageErrorBoundary pageName="AppShell">
      <div className="min-h-screen bg-background">
        {/* Main content area with padding for bottom nav and breadcrumbs */}
        <main className="pb-32 md:pb-28">
          <Outlet />
        </main>

        {/* Universal Breadcrumbs - Above Bottom Navigation */}
        <UniversalBreadcrumbs />

        {/* Floating Language Switcher */}
        <div className="fixed top-4 right-4 z-30">
          <CompactLanguageSwitcher />
        </div>

        {/* Unified Bottom Navigation */}
        <UnifiedBottomNav />

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