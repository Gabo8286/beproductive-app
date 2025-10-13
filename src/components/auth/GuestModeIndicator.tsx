import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TestTube, Crown, User, LogOut, Info, AlertTriangle } from "lucide-react";
import { isGuestModeEnabled } from "@/utils/auth/guestMode";

export default function GuestModeIndicator() {
  const { isGuestMode, guestUserType, clearGuestMode, user } = useAuth();

  // Only show if guest mode is enabled and user is in guest mode
  if (!isGuestModeEnabled() || !isGuestMode || !user) {
    return null;
  }

  const isAdmin = guestUserType === 'admin';

  const handleExitGuestMode = () => {
    clearGuestMode();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Guest Mode Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={`flex items-center gap-1 text-xs ${
                isAdmin
                  ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
              }`}
            >
              <TestTube className="h-3 w-3" />
              Demo Mode
              {isAdmin ? (
                <Crown className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>You are using {isAdmin ? 'Super Admin' : 'Regular User'} demo mode</p>
          </TooltipContent>
        </Tooltip>

        {/* Info Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-orange-500" />
                Demo Mode Active
              </DialogTitle>
              <DialogDescription>
                You are currently exploring BeProductive in demo mode.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                {isAdmin ? (
                  <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
                ) : (
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">
                    {isAdmin ? 'Super Admin Account' : 'Regular User Account'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isAdmin
                      ? 'Full access to all features, administrative functions, and system configuration.'
                      : 'Standard user experience with core productivity features and personal workspace.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Demo Mode</h4>
                  <p className="text-sm text-orange-700">
                    You are using demo mode for testing purposes.
                    Changes will not be saved when you exit demo mode.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Demo account: {user.email}
                </p>
                <Button
                  onClick={handleExitGuestMode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  Exit Demo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}