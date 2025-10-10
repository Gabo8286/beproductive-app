import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { MinimalSidebar } from "@/components/navigation/MinimalSidebar";
import { CyclePrimaryNavigation } from "@/components/navigation/CyclePrimaryNavigation";
import { FloatingActionMenu } from "@/components/navigation/FloatingActionMenu";
import { PhaseContextMenu } from "@/components/navigation/PhaseContextMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Sparkles, Home, CheckSquare, Settings as SettingsIcon, Calendar, CreditCard, Shield, Crown, Brain } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { Timer } from "@/components/time/Timer";
import { NotificationCenter } from "@/components/automation/NotificationCenter";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SkipNavigation } from "@/components/accessibility/SkipNavigation";
import { UnifiedBottomNav } from "@/components/navigation/UnifiedBottomNav";
import GuestModeIndicator from "@/components/auth/GuestModeIndicator";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavigationMode = 'minimal-sidebar' | 'top-navigation' | 'full-sidebar';

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('top-navigation');

  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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

            {/* Guest Mode Indicator */}
            <GuestModeIndicator />

            <div className="flex-1" />

            {/* Secondary Navigation */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    "p-2 rounded-lg transition-colors hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <Home className="h-5 w-5" />
              </NavLink>

              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  cn(
                    "p-2 rounded-lg transition-colors hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <CheckSquare className="h-5 w-5" />
              </NavLink>

              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  cn(
                    "p-2 rounded-lg transition-colors hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <Calendar className="h-5 w-5" />
              </NavLink>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setNavigationMode('top-navigation')}>
                    Top Navigation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNavigationMode('minimal-sidebar')}>
                    Minimal Sidebar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNavigationMode('full-sidebar')}>
                    Full Sidebar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Settings & Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account-settings')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Account & Security
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile-assessment')}>
                    <Brain className="mr-2 h-4 w-4" />
                    Productivity Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/billing')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Usage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NotificationCenter />

              {/* User Avatar */}
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || ""}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </div>
        </header>

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1 space-y-4 p-4 md:p-8 pb-20 md:pb-16 scrollbar-brand"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>

        {/* Floating Action Menu */}
        <FloatingActionMenu />

        {/* Unified Bottom Navigation */}
        <UnifiedBottomNav />
        <Timer />
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

            {/* Guest Mode Indicator */}
            <GuestModeIndicator />

            {/* Navigation Mode Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
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
    </SidebarProvider>
  );
}
