import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";
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
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Timer } from "@/components/time/Timer";
import { NotificationCenter } from "@/components/automation/NotificationCenter";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SkipNavigation } from "@/components/accessibility/SkipNavigation";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <SidebarProvider>
      <SkipNavigation />
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header 
            className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
            role="banner"
            aria-label="Main header"
          >
            <SidebarTrigger className="md:hidden" aria-label="Toggle sidebar navigation" />
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
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
...
            </DropdownMenu>
          </header>
          <main 
            id="main-content" 
            className="flex-1 space-y-4 p-4 md:p-8 scrollbar-brand"
            role="main"
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
        <MobileNavigation />
      </div>
      <Timer />
    </SidebarProvider>
  );
}
