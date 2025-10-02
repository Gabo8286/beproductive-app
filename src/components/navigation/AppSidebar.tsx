import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Target, CheckSquare, Repeat, Folder, BookOpen, Sparkles, Users, Workflow, Tags, FileText, Calendar, Zap, StickyNote } from "lucide-react";
import { useModules } from "@/contexts/ModulesContext";
import { cn } from "@/lib/utils";
import { brandConfig, getMotivationalMessage } from "@/lib/brand";

const navigation = [
  { 
    name: "Dashboard", 
    displayName: "Dashboard",
    href: "/dashboard", 
    icon: Home, 
    moduleId: null,
    description: "Your journey overview",
    color: "text-foreground"
  },
  { 
    name: "Destinations", 
    displayName: "Goals",
    href: "/goals", 
    icon: Target, 
    moduleId: "goals" as const,
    description: "Where you want to go",
    color: "text-primary"
  },
  { 
    name: "Next Steps", 
    displayName: "Tasks",
    href: "/tasks", 
    icon: CheckSquare, 
    moduleId: "tasks" as const,
    description: "What needs to be done",
    color: "text-warning"
  },
  { 
    name: "Travel Notes", 
    displayName: "Quick To-Dos",
    href: "/quick-todos", 
    icon: StickyNote, 
    moduleId: "tasks" as const,
    description: "Quick capture",
    color: "text-warning"
  },
  { 
    name: "Templates", 
    displayName: "Templates",
    href: "/templates", 
    icon: FileText, 
    moduleId: "tasks" as const,
    description: "Reusable patterns",
    color: "text-muted-foreground"
  },
  { 
    name: "Recurring", 
    displayName: "Recurring",
    href: "/recurring-tasks", 
    icon: Calendar, 
    moduleId: "tasks" as const,
    description: "Regular rhythms",
    color: "text-muted-foreground"
  },
  { 
    name: "Tags", 
    displayName: "Tags",
    href: "/tags", 
    icon: Tags, 
    moduleId: "tasks" as const,
    description: "Organize your path",
    color: "text-muted-foreground"
  },
  { 
    name: "Automation", 
    displayName: "Automation",
    href: "/automation", 
    icon: Zap, 
    moduleId: "tasks" as const,
    description: "Smart workflows",
    color: "text-warning"
  },
  { 
    name: "Daily Routines", 
    displayName: "Habits",
    href: "/habits", 
    icon: Repeat, 
    moduleId: "habits" as const,
    description: "How you travel",
    color: "text-secondary"
  },
  { 
    name: "Projects", 
    displayName: "Projects",
    href: "/projects", 
    icon: Folder, 
    moduleId: "projects" as const,
    description: "Major expeditions",
    color: "text-muted-foreground"
  },
  { 
    name: "Route Adjustments", 
    displayName: "Reflections",
    href: "/reflections", 
    icon: BookOpen, 
    moduleId: "reflections" as const,
    description: "Learning from the path",
    color: "text-success"
  },
  { 
    name: "AI Insights", 
    displayName: "AI Insights",
    href: "/ai-insights", 
    icon: Sparkles, 
    moduleId: "ai-insights" as const,
    description: "Smart guidance",
    color: "text-primary"
  },
  { 
    name: "Team Journey", 
    displayName: "Team",
    href: "/team", 
    icon: Users, 
    moduleId: "team-collaboration" as const,
    description: "Traveling together",
    color: "text-secondary"
  },
  { 
    name: "Travel Guides", 
    displayName: "Processes",
    href: "/processes", 
    icon: Workflow, 
    moduleId: "process-inventory" as const,
    description: "Documented workflows",
    color: "text-muted-foreground"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isModuleEnabled } = useModules();

  const visibleNavigation = navigation.filter(
    (item) => !item.moduleId || isModuleEnabled(item.moduleId)
  );

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={cn(isCollapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarContent className="scrollbar-brand">
        {/* Enhanced Brand Header */}
        <div className="flex h-16 items-center justify-center border-b bg-gradient-subtle px-4">
          {isCollapsed ? (
            <Sparkles className="h-6 w-6 text-primary journey-float" />
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary journey-float" />
                <span className="text-lg font-bold text-gradient-brand">
                  BeProductive
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5">
                {brandConfig.tagline}
              </span>
            </div>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Your Journey</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        title={isCollapsed ? `${item.displayName} - ${item.description}` : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 transition-all duration-200",
                          "hover:shadow-sm apple-button",
                          isCollapsed ? "py-2 justify-center" : "py-2.5",
                          isActive
                            ? "bg-gradient-primary text-primary-foreground shadow-md relative"
                            : "text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        {isActive && !isCollapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-primary-foreground" : item.color
                        )} />
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0 text-left">
                            <span className="block text-sm font-medium leading-tight">
                              {item.displayName}
                            </span>
                            <span className={cn(
                              "block text-xs leading-tight mt-0.5",
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                            )}>
                              {item.description}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Journey Inspiration Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="journey-card p-3 rounded-lg text-center">
              <p className="text-xs font-medium text-muted-foreground">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
