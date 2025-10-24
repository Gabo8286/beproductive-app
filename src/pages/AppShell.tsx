import { Outlet } from 'react-router-dom';
import { NotificationContainer, useNotifications } from '@/components/notifications/MinimalNotification';
import { LunaChatModal } from '@/components/luna/modal/LunaChatModal';
import { useLunaRouteContext } from '@/components/luna/hooks/useLunaRouteContext';
import { PageErrorBoundary } from '@/components/errors/CascadingErrorBoundary';
import { UniversalBreadcrumbs } from '@/components/navigation/UniversalBreadcrumbs';
import { CompactLanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { LunaFABProvider } from '@/components/luna/providers/LunaFABProvider';

function AppShellContent() {
  const { notifications, removeNotification } = useNotifications();

  // Auto-set Luna context based on route
  useLunaRouteContext();

  return (
    <PageErrorBoundary pageName="AppShell">
      <div className="min-h-screen bg-background">
        {/* Main content area with padding for breadcrumbs only */}
        <main className="pb-16">
          <Outlet />
        </main>

        {/* Enhanced Universal Breadcrumbs - Now primary navigation */}
        <UniversalBreadcrumbs
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t"
          showBackButton={true}
        />

        {/* Floating Language Switcher */}
        <div className="fixed top-4 right-4 z-30">
          <CompactLanguageSwitcher />
        </div>


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
  return (
    <LunaFABProvider
      fabSize="medium"
      fabClassName="shadow-lg"
    >
      <AppShellContent />
    </LunaFABProvider>
  );
}