import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Target,
  CheckSquare,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  Plus,
  BarChart3,
  Globe,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModules } from "@/contexts/ModulesContext";

const mobileNavItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    color: "text-blue-600",
    moduleId: null,
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
    color: "text-green-600",
    moduleId: "goals" as const,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    color: "text-orange-600",
    moduleId: "tasks" as const,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-purple-600",
    moduleId: "analytics" as const,
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Globe,
    color: "text-indigo-600",
    moduleId: "integrations" as const,
  },
  {
    name: "Enterprise",
    href: "/enterprise",
    icon: Building,
    color: "text-gray-600",
    moduleId: "enterprise" as const,
  },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState(3);
  const location = useLocation();
  const { isModuleEnabled } = useModules();

  const visibleItems = mobileNavItems.filter(
    (item) => !item.moduleId || isModuleEnabled(item.moduleId),
  );

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsOpen(false);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", handleOrientationChange);
  }, []);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t md:hidden">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {visibleItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  "active:scale-95 touch-manipulation",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : item.color,
                  )}
                />
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full" />
                )}
              </NavLink>
            );
          })}

          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]",
                  "active:scale-95 touch-manipulation",
                  isOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">More</span>
                {activeNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                  >
                    {activeNotifications}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[80vh] rounded-t-xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader>
                <SheetTitle>Quick Access</SheetTitle>
                <SheetDescription>
                  Navigate to different sections of your productivity journey
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">New Task</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Target className="h-5 w-5" />
                      <span className="text-sm">New Goal</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Search className="h-5 w-5" />
                      <span className="text-sm">Search</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-2 relative"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="text-sm">Notifications</span>
                      {activeNotifications > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                        >
                          {activeNotifications}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>

                {/* All Navigation Items */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Navigation
                  </h3>
                  <div className="space-y-2">
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                            "active:scale-[0.98] touch-manipulation",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-accent/50",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary" : item.color,
                            )}
                          />
                          <span className="font-medium">{item.name}</span>
                          {isActive && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              Active
                            </Badge>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Settings */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Settings
                  </h3>
                  <div className="space-y-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors active:scale-[0.98] touch-manipulation"
                    >
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Profile</span>
                    </NavLink>
                    <NavLink
                      to="/settings/accessibility"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors active:scale-[0.98] touch-manipulation"
                    >
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Settings</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Safe area spacing for content */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
