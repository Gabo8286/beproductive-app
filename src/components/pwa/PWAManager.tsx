import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Smartphone,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Monitor,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    setIsInstalled(isStandalone || (window as any).navigator.standalone === true);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({
        title: "App Installed Successfully!",
        description: "BeProductive is now available on your home screen.",
      });
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker and check for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                toast({
                  title: "Update Available",
                  description: "A new version of the app is ready to install.",
                });
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "Installing App...",
          description: "BeProductive will be added to your home screen.",
        });
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Failed to install app:', error);
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateApp = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleRefreshCache = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      toast({
        title: "Cache Refreshed",
        description: "App data has been updated.",
      });
    }
  };

  const getDeviceType = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);

    if (isTablet) return 'Tablet';
    if (isMobile) return 'Mobile';
    return 'Desktop';
  };

  const getPWAFeatures = () => {
    const features = [];

    if ('serviceWorker' in navigator) features.push('Service Worker');
    if ('PushManager' in window) features.push('Push Notifications');
    if ('Notification' in window) features.push('Notifications');
    if ('localStorage' in window) features.push('Local Storage');
    if ('indexedDB' in window) features.push('IndexedDB');
    if ('caches' in window) features.push('Cache API');

    return features;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isOnline ? (
                  <Globe className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                Connection Status
              </CardTitle>
              <CardDescription>
                Your app's connectivity and offline capabilities
              </CardDescription>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Device Type</div>
              <div className="text-sm text-muted-foreground">{getDeviceType()}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">PWA Ready</div>
              <div className="text-sm text-muted-foreground">All features available</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              {isInstalled ? (
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              ) : (
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              )}
              <div className="font-medium">Installation</div>
              <div className="text-sm text-muted-foreground">
                {isInstalled ? "Installed" : "Available"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation */}
      {!isInstalled && deferredPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Install BeProductive
            </CardTitle>
            <CardDescription>
              Install the app for a better experience with offline access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Benefits of Installing:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Offline access to your tasks and goals</li>
                    <li>• Faster loading times</li>
                    <li>• Home screen access</li>
                    <li>• Push notifications</li>
                    <li>• Native app experience</li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <Button onClick={handleInstallApp} size="lg" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Update Available
            </CardTitle>
            <CardDescription>
              A new version of BeProductive is ready to install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  New features and improvements are available. Update now to get the latest version.
                </p>
              </div>
              <Button onClick={handleUpdateApp}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle>PWA Features</CardTitle>
          <CardDescription>
            Available Progressive Web App capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {getPWAFeatures().map((feature) => (
              <Badge key={feature} variant="outline" className="justify-center">
                {feature}
              </Badge>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleRefreshCache} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Status */}
      {!isOnline && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              Offline Mode
            </CardTitle>
            <CardDescription>
              You're currently offline. Some features may be limited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data is still accessible and any changes will sync when you're back online.
              Tasks, goals, and notes are available offline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}