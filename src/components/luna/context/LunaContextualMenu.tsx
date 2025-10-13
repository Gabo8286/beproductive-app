import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  CheckSquare,
  Calendar,
  Settings,
  MessageCircle,
  User,
  LogOut,
  CreditCard,
  Crown,
  Brain,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLuna } from './LunaContext';
import { LunaAvatar } from '../core/LunaAvatar';

interface LunaContextualMenuProps {
  children?: React.ReactNode;
  className?: string;
  showLabel?: boolean;
}

export const LunaContextualMenu: React.FC<LunaContextualMenuProps> = ({
  children,
  className,
  showLabel = false,
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { currentExpression, openChat } = useLuna();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChatOpen = () => {
    openChat();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button 
            className={cn(
              'cursor-pointer transition-all duration-200 hover:scale-105 border-0 bg-transparent p-0',
              className
            )}
            aria-label="Open Luna navigation menu"
          >
            <LunaAvatar
              size="medium"
              expression={currentExpression}
              animated={true}
              className="ring-2 ring-white shadow-lg"
            />
            {showLabel && (
              <span className="text-xs text-muted-foreground mt-1">Luna</span>
            )}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-white/20 shadow-2xl z-50"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium">
          <div className="flex items-center gap-2">
            <LunaAvatar size="small" expression={currentExpression} animated={false} />
            <span>Luna Navigation</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Luna Actions - Most Prominent */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Luna Assistant
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleChatOpen}
          className="cursor-pointer hover:bg-orange-50 border border-orange-200/50 mb-2"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-orange-600" />
          <span className="font-medium">Chat with Luna</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Primary Navigation */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Main Navigation
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer hover:bg-blue-50"
        >
          <Home className="mr-2 h-4 w-4 text-blue-600" />
          <span>Home</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/tasks')}
          className="cursor-pointer hover:bg-green-50"
        >
          <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
          <span>Tasks</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/calendar')}
          className="cursor-pointer hover:bg-purple-50"
        >
          <Calendar className="mr-2 h-4 w-4 text-purple-600" />
          <span>Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="cursor-pointer hover:bg-gray-50"
        >
          <Settings className="mr-2 h-4 w-4 text-gray-600" />
          <span>Settings</span>
        </DropdownMenuItem>


        <DropdownMenuSeparator />

        {/* Account & Profile */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Account & Settings
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="cursor-pointer hover:bg-indigo-50"
        >
          <User className="mr-2 h-4 w-4 text-indigo-600" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/profile-assessment')}
          className="cursor-pointer hover:bg-cyan-50"
        >
          <Brain className="mr-2 h-4 w-4 text-cyan-600" />
          <span>Productivity Quiz</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/accessibility')}
          className="cursor-pointer hover:bg-pink-50"
        >
          <Palette className="mr-2 h-4 w-4 text-pink-600" />
          <span>Accessibility</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/billing')}
          className="cursor-pointer hover:bg-yellow-50"
        >
          <CreditCard className="mr-2 h-4 w-4 text-yellow-600" />
          <span>Billing & Usage</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/pricing')}
          className="cursor-pointer hover:bg-amber-50"
        >
          <Crown className="mr-2 h-4 w-4 text-amber-600" />
          <span>Upgrade Plan</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer hover:bg-red-50 text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LunaContextualMenu;