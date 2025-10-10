import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  CheckSquare,
  Settings,
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { getPhaseInfo } from '@/modules/productivity-cycle/types/cycle';
import { cn } from '@/lib/utils';
import { brandConfig } from '@/lib/brand';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Minimal core navigation - only essential items
const coreNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Your daily overview',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    description: 'Manage your tasks',
  },
];

// Secondary features accessible via dropdown
const secondaryNavigation = [
  { name: 'Goals', href: '/goals', description: 'Long-term objectives' },
  { name: 'Habits', href: '/habits', description: 'Daily routines' },
  { name: 'Projects', href: '/projects', description: 'Major initiatives' },
  { name: 'Notes', href: '/notes', description: 'Knowledge capture' },
  { name: 'Analytics', href: '/analytics', description: 'Progress insights' },
  { name: 'Reflections', href: '/reflections', description: 'Daily reviews' },
  { name: 'Templates', href: '/templates', description: 'Saved patterns' },
  { name: 'Quick To-Dos', href: '/quick-todos', description: 'Fast capture' },
  { name: 'Automation', href: '/automation', description: 'Smart workflows' },
  { name: 'Time Tracking', href: '/time-tracking', description: 'Time insights' },
];

export function MinimalSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { state: cycleState } = useProductivityCycle();

  const isCollapsed = state === 'collapsed';
  const currentPhaseInfo = getPhaseInfo(cycleState.currentPhase);

  return (
    <Sidebar className={cn(isCollapsed ? 'w-16' : 'w-64')} collapsible="icon">
      <SidebarContent className="bg-white dark:bg-gray-900 border-r">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-center border-b px-4">
          {isCollapsed ? (
            <Sparkles className="h-6 w-6 text-primary" />
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-foreground">
                  BeProductive
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5">
                {brandConfig.tagline}
              </span>
            </div>
          )}
        </div>

        {/* Current Phase Indicator */}
        {!isCollapsed && (
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="text-lg">{currentPhaseInfo.icon}</div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {currentPhaseInfo.title} Phase
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(cycleState.phaseProgress)}% complete
                </div>
              </div>
            </div>
            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${cycleState.phaseProgress}%` }}
              />
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Core Navigation */}
              {coreNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                          'hover:bg-accent/50',
                          isCollapsed ? 'justify-center' : '',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                        {!isCollapsed && (
                          <div className="flex-1 text-left">
                            <span className="block text-sm font-medium">
                              {item.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* More Features Dropdown */}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                          'hover:bg-accent/50 text-foreground cursor-pointer w-full',
                          isCollapsed ? 'justify-center' : ''
                        )}
                      >
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        {!isCollapsed && (
                          <div className="flex-1 text-left">
                            <span className="block text-sm font-medium">
                              More Features
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              Additional tools
                            </span>
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={isCollapsed ? 'right' : 'bottom'}
                    align="start"
                    className="w-56"
                  >
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Additional Features
                    </div>
                    <DropdownMenuSeparator />
                    {secondaryNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <NavLink
                          to={item.href}
                          className="flex flex-col items-start py-2 cursor-pointer"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                        Settings & Profile
                      </NavLink>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-3 rounded-lg">
              <div className="text-xs font-medium text-foreground mb-2">
                Today's Progress
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Goals:</span>
                  <span className="ml-1 font-medium">{cycleState.dailyGoals.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phase:</span>
                  <span className="ml-1 font-medium">{Math.round(cycleState.phaseProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}