import {
  FileText,
  Target,
  CheckSquare,
  MessageCircle,
  Zap,
  FolderOpen,
  RotateCcw,
  Tag,
  Home,
  Calendar,
  Settings,
  User,
  LogOut,
  CreditCard,
  Crown,
  Brain,
  Palette,
  X,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

import { useLuna } from '@/components/luna/context/LunaContext';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { PromptLibraryModal } from '@/components/luna/prompt-library/PromptLibraryModal';
import { LunaActionSheetSettingsModal } from '@/components/luna/settings/LunaActionSheetSettingsModal';

interface UnifiedLunaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickCaptureItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  colorClass: string;
}

interface AccountItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  colorClass: string;
}

const quickCaptureItems: QuickCaptureItem[] = [
  {
    id: 'notes',
    label: 'Note',
    icon: FileText,
    href: '/notes',
    description: 'Capture thoughts quickly',
  },
  {
    id: 'goals',
    label: 'Goal',
    icon: Target,
    href: '/goals/new',
    description: 'Set a new objective',
  },
  {
    id: 'tasks',
    label: 'Task',
    icon: CheckSquare,
    href: '/tasks',
    description: 'Add to your todo list',
  },
  {
    id: 'reflections',
    label: 'Reflection',
    icon: MessageCircle,
    href: '/reflections',
    description: 'Record an insight',
  },
  {
    id: 'quick-todos',
    label: 'Quick To-Do',
    icon: Zap,
    href: '/quick-todos',
    description: 'Rapid task capture',
  },
  {
    id: 'projects',
    label: 'Project',
    icon: FolderOpen,
    href: '/projects',
    description: 'Start something new',
  },
  {
    id: 'habits',
    label: 'Habit',
    icon: RotateCcw,
    href: '/habits',
    description: 'Build a routine',
  },
  {
    id: 'tags',
    label: 'Tag',
    icon: Tag,
    href: '/tags',
    description: 'Create organization',
  },
];

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    colorClass: 'text-blue-600 hover:bg-blue-50',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/tasks',
    colorClass: 'text-green-600 hover:bg-green-50',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar',
    colorClass: 'text-purple-600 hover:bg-purple-50',
  },
  {
    id: 'prompt-library',
    label: 'Prompt Library',
    icon: Sparkles,
    href: '#prompt-library',
    colorClass: 'text-indigo-600 hover:bg-indigo-50',
  },
  {
    id: 'luna-settings',
    label: 'Luna Interaction',
    icon: Settings,
    href: '#luna-settings',
    colorClass: 'text-orange-600 hover:bg-orange-50',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    colorClass: 'text-gray-600 hover:bg-gray-50',
  },
];

const accountItems: AccountItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
    colorClass: 'text-indigo-600 hover:bg-indigo-50',
  },
  {
    id: 'assessment',
    label: 'Productivity Quiz',
    icon: Brain,
    href: '/profile-assessment',
    colorClass: 'text-cyan-600 hover:bg-cyan-50',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Palette,
    href: '/accessibility',
    colorClass: 'text-pink-600 hover:bg-pink-50',
  },
  {
    id: 'billing',
    label: 'Billing & Usage',
    icon: CreditCard,
    href: '/billing',
    colorClass: 'text-yellow-600 hover:bg-yellow-50',
  },
  {
    id: 'upgrade',
    label: 'Upgrade Plan',
    icon: Crown,
    href: '/pricing',
    colorClass: 'text-amber-600 hover:bg-amber-50',
  },
];

export const UnifiedLunaMenu: React.FC<UnifiedLunaMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { currentExpression, openChat } = useLuna();
  const { buttonPress, taskCreate, success } = useHapticFeedback();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isActionSheetSettingsOpen, setIsActionSheetSettingsOpen] = useState(false);

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleQuickCaptureClick = (href: string) => {
    taskCreate();
    navigate(href);
    onClose();
  };

  const handleNavigationClick = (href: string, id?: string) => {
    buttonPress();

    if (id === 'prompt-library') {
      setIsPromptLibraryOpen(true);
      onClose();
    } else if (id === 'luna-settings') {
      setIsActionSheetSettingsOpen(true);
      onClose();
    } else {
      navigate(href);
      onClose();
    }
  };

  const handleChatOpen = () => {
    buttonPress();
    openChat();
    onClose();
  };

  const handleSignOut = async () => {
    success();
    await signOut();
    // Use setTimeout to ensure navigation happens after auth state fully clears
    // and use replace: true to bypass ProtectedRoute redirect logic
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 250);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        className={cn(
          'fixed bottom-20 md:bottom-18 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl z-50',
          'w-80 max-h-96 overflow-y-auto',
          'animate-in slide-in-from-bottom-2 fade-in duration-200 ease-out'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LunaAvatar size="small" expression={currentExpression} animated={true} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Luna</h2>
                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* Luna Chat - Primary Action */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              🤖 AI Assistant
            </h3>
            <button
              onClick={handleChatOpen}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl',
                'bg-gradient-to-r from-orange-50 to-orange-100',
                'border border-orange-200 hover:border-orange-300',
                'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              <div className="p-1.5 rounded-lg bg-orange-200">
                <MessageCircle className="h-4 w-4 text-orange-700" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-orange-900">Chat with Luna</div>
                <div className="text-xs text-orange-700">Get AI assistance</div>
              </div>
            </button>
          </div>

          {/* Quick Capture */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              ⚡ Quick Capture
            </h3>
            <div className="space-y-1">
              {quickCaptureItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleQuickCaptureClick(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg',
                      'bg-gray-50 hover:bg-gray-100 border border-gray-200',
                      'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'
                    )}
                  >
                    <div className="p-1.5 rounded-md bg-blue-100">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              🧭 Navigation
            </h3>
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigationClick(item.href, item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg',
                      'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]',
                      item.colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Settings */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              👤 Account
            </h3>
            <div className="space-y-1">
              {accountItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigationClick(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg',
                      'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]',
                      item.colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg',
                'text-red-600 hover:bg-red-50',
                'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
      />

      {/* Luna Action Sheet Settings Modal */}
      <LunaActionSheetSettingsModal
        isOpen={isActionSheetSettingsOpen}
        onClose={() => setIsActionSheetSettingsOpen(false)}
      />
    </>
  );
};

export default UnifiedLunaMenu;