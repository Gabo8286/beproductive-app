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
import { Home, Target, CheckSquare, Repeat, Folder, BookOpen, Sparkles, Users, Workflow, Tags, FileText, Calendar, Zap } from "lucide-react";
import { useModules } from "@/contexts/ModulesContext";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, moduleId: null },
  { name: "Goals", href: "/goals", icon: Target, moduleId: "goals" as const },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, moduleId: "tasks" as const },
  { name: "Templates", href: "/templates", icon: FileText, moduleId: "tasks" as const },
  { name: "Recurring", href: "/recurring-tasks", icon: Calendar, moduleId: "tasks" as const },
  { name: "Tags", href: "/tags", icon: Tags, moduleId: "tasks" as const },
  { name: "Automation", href: "/automation", icon: Zap, moduleId: "tasks" as const },
  { name: "Habits", href: "/habits", icon: Repeat, moduleId: "habits" as const },
  { name: "Projects", href: "/projects", icon: Folder, moduleId: "projects" as const },
  { name: "Reflections", href: "/reflections", icon: BookOpen, moduleId: "reflections" as const },
  { name: "AI Insights", href: "/ai-insights", icon: Sparkles, moduleId: "ai-insights" as const },
  { name: "Team", href: "/team", icon: Users, moduleId: "team-collaboration" as const },
  { name: "Processes", href: "/processes", icon: Workflow, moduleId: "process-inventory" as const },
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
    <Sidebar className={cn(isCollapsed ? "w-14" : "w-60")} collapsible="icon">
      <SidebarContent>
        <div className="flex h-16 items-center border-b px-4">
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BeProductive
            </span>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
