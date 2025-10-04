import { useState, useEffect } from "react";
import { Bell, BellOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  requestNotificationPermission,
  getNotificationPermission,
  canSendNotifications,
} from "@/utils/notifications";
import { toast } from "sonner";

export function NotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Notifications enabled!");
      } else if (result === "denied") {
        toast.error("Notification permission denied");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const openBrowserSettings = () => {
    toast.info("Please check your browser settings to enable notifications");
  };

  if (permission === "granted" && canSendNotifications()) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          Notifications are enabled. You'll receive reminders for your habits.
        </AlertDescription>
      </Alert>
    );
  }

  if (permission === "denied") {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <BellOff className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              Notifications are blocked. To receive habit reminders, you'll need
              to enable notifications in your browser settings.
            </p>
            <Button variant="outline" size="sm" onClick={openBrowserSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Browser Settings
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enable Notifications
        </CardTitle>
        <CardDescription>
          Get reminded to complete your habits at the right time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Why enable notifications?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Stay consistent with daily reminders</li>
              <li>Get motivated by streak milestones</li>
              <li>Never miss an important habit</li>
              <li>Celebrate your achievements</li>
            </ul>
          </div>

          <Button
            onClick={handleRequest}
            disabled={isRequesting}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
