import { LogOut, User, Sparkles, Settings } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { SkipNavigation } from "@/components/accessibility/SkipNavigation";
import { NotificationCenter } from "@/components/automation/NotificationCenter";
import { ConfigPanel } from "@/components/config/ConfigPanel";
import { useLunaRouteContext } from "@/components/luna/hooks/useLunaRouteContext";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { MinimalSidebar } from "@/components/navigation/MinimalSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Timer } from "@/components/time/Timer";
import { useConfigPanel } from "@/hooks/useConfigPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { UnifiedBottomNav } from "@/components/navigation/UnifiedBottomNav";
import { UniversalBreadcrumbs } from "@/components/navigation/UniversalBreadcrumbs";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

type NavigationMode = 'minimal-sidebar' | 'top-navigation' | 'full-sidebar';

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('top-navigation');
  const configPanel = useConfigPanel();

  // Auto-set Luna context based on route
  useLunaRouteContext();

  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  const handleSignOut = async () => {
    await signOut();
    // Use setTimeout to ensure navigation happens after auth state fully clears
    // and use replace: true to bypass ProtectedRoute redirect logic
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 250);
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  // Top Navigation Layout (New Default)
  if (navigationMode === 'top-navigation') {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <SkipNavigation />

        {/* Top Navigation Bar */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
          role="banner"
          aria-label="Main header"
        >
            {/* Brand */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline text-lg font-bold">BeProductive</span>
            </div>


            <div className="flex-1" />

            {/* Navigation moved to Luna contextual menu */}
            <div className="flex items-center gap-2">

              {/* Settings moved to Luna contextual menu */}
              <LanguageSwitcher />

              <NotificationCenter />

              {/* User Avatar with Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={profile?.avatar_url || ""}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </header>

        {/* Universal Breadcrumbs - Below Header */}
        <UniversalBreadcrumbs />

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1 space-y-4 p-4 md:p-8 pb-20 md:pb-16 scrollbar-brand"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>

        {/* Unified Bottom Navigation */}
        <UnifiedBottomNav />
        <Timer />

        {/* Configuration Panel */}
        <ConfigPanel isOpen={configPanel.isOpen} onClose={configPanel.close} />
      </div>
    );
  }

  // Sidebar-based layouts
  return (
    <SidebarProvider>
      <SkipNavigation />
      <div className="flex min-h-screen w-full">
        {navigationMode === 'minimal-sidebar' ? <MinimalSidebar /> : <AppSidebar />}
        <div className="flex flex-1 flex-col">
          <header
            className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
            role="banner"
            aria-label="Main header"
          >
            <SidebarTrigger
              className="md:hidden"
              aria-label="Toggle sidebar navigation"
            />


            {/* Navigation Mode Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Navigation
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setNavigationMode('top-navigation')}>
                  Top Navigation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNavigationMode('minimal-sidebar')}>
                  Minimal Sidebar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNavigationMode('full-sidebar')}>
                  Full Sidebar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full apple-button"
                  aria-label="User menu"
                  data-voice-command="profile menu"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt={profile?.full_name || ""}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Universal Breadcrumbs - Below Header */}
          <UniversalBreadcrumbs />

          <main
            id="main-content"
            className="flex-1 space-y-4 p-4 md:p-8 pb-20 md:pb-16 scrollbar-brand"
            role="main"
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
        <UnifiedBottomNav />
      </div>
      <Timer />

      {/* Configuration Panel */}
      <ConfigPanel isOpen={configPanel.isOpen} onClose={configPanel.close} />
    </SidebarProvider>
  );
}
