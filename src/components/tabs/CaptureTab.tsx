import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Target,
  CheckSquare,
  MessageCircle,
  Zap,
  FolderOpen,
  RotateCcw,
  Tag,
  Edit,
  Archive,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SwipeableListItem, createSwipeActions } from '@/components/ui/SwipeableListItem';

interface QuickAddItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

const quickAddItems: QuickAddItem[] = [
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

// Empty initial state - will load from database
const recentCaptures: any[] = [];

interface CaptureTabProps {
  className?: string;
}

export const CaptureTab: React.FC<CaptureTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const { taskCreate, buttonPress, loadingComplete, success, warning } = useHapticFeedback();
  const [refreshKey, setRefreshKey] = useState(0);
  const [captures, setCaptures] = useState(recentCaptures);

  const handleQuickAddClick = (href: string) => {
    taskCreate();
    navigate(href);
  };

  const handleRecentItemClick = (item: typeof recentCaptures[0]) => {
    buttonPress();
    // Navigate to appropriate detail view based on type
    switch (item.type) {
      case 'goal':
        navigate('/goals');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'reflection':
        navigate('/reflections');
        break;
      default:
        navigate('/app/capture');
    }
  };

  const handleRefresh = async () => {
    // Simulate refresh with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Trigger completion haptic
    loadingComplete();

    // Force re-render of content
    setRefreshKey(prev => prev + 1);
  };

  const handleEditCapture = (item: typeof recentCaptures[0]) => {
    success();
    // Navigate to edit view
    switch (item.type) {
      case 'goal':
        navigate(`/goals/${item.id}/edit`);
        break;
      case 'task':
        navigate(`/tasks/${item.id}/edit`);
        break;
      case 'note':
        navigate(`/notes/${item.id}/edit`);
        break;
      case 'reflection':
        navigate(`/reflections/${item.id}/edit`);
        break;
    }
  };

  const handleArchiveCapture = (item: typeof recentCaptures[0]) => {
    warning();
    // Remove from recent captures
    setCaptures(prev => prev.filter(capture => capture.id !== item.id));
  };

  const handleDeleteCapture = (item: typeof recentCaptures[0]) => {
    warning();
    // Remove from recent captures
    setCaptures(prev => prev.filter(capture => capture.id !== item.id));
  };

  const handleCompleteCapture = (item: typeof recentCaptures[0]) => {
    success();
    // Mark as completed and remove from recent
    setCaptures(prev => prev.filter(capture => capture.id !== item.id));
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className="h-full"
    >
      <div className={cn('p-5 md:p-8 max-w-4xl mx-auto', className)} key={refreshKey}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="apple-page-title">Capture</h1>
        <p className="apple-page-subtitle">What would you like to add?</p>
      </div>

      {/* Quick Add Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger-children">
        {quickAddItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleQuickAddClick(item.href)}
              className="apple-quick-add-btn group haptic-medium apple-lift-on-hover"
              aria-label={`Add new ${item.label.toLowerCase()}: ${item.description}`}
            >
              <div className="apple-quick-add-icon text-[#007aff] group-hover:scale-110 transition-transform duration-200">
                <Icon className="w-8 h-8 mx-auto" />
              </div>
              <div className="apple-quick-add-label">{item.label}</div>
            </button>
          );
        })}
      </div>

      {/* Recent Captures */}
      <div>
        <h2 className="apple-section-title">Recent Captures</h2>

        <div className="space-y-3 pb-20 stagger-children">
          {captures.map((item) => {
            // Create swipe actions based on item type
            const getSwipeActions = () => {
              switch (item.type) {
                case 'task':
                  return [
                    {
                      id: 'complete',
                      label: 'Done',
                      icon: CheckSquare,
                      color: 'green' as const,
                      position: 'right' as const,
                      onAction: () => handleCompleteCapture(item),
                    },
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: Trash2,
                      color: 'red' as const,
                      position: 'right' as const,
                      onAction: () => handleDeleteCapture(item),
                    },
                  ];
                case 'goal':
                  return [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: Edit,
                      color: 'blue' as const,
                      position: 'left' as const,
                      onAction: () => handleEditCapture(item),
                    },
                    {
                      id: 'complete',
                      label: 'Achieve',
                      icon: Target,
                      color: 'green' as const,
                      position: 'right' as const,
                      onAction: () => handleCompleteCapture(item),
                    },
                  ];
                case 'note':
                  return [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: Edit,
                      color: 'blue' as const,
                      position: 'left' as const,
                      onAction: () => handleEditCapture(item),
                    },
                    {
                      id: 'archive',
                      label: 'Archive',
                      icon: Archive,
                      color: 'gray' as const,
                      position: 'right' as const,
                      onAction: () => handleArchiveCapture(item),
                    },
                  ];
                case 'reflection':
                  return [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: Edit,
                      color: 'blue' as const,
                      position: 'left' as const,
                      onAction: () => handleEditCapture(item),
                    },
                    {
                      id: 'archive',
                      label: 'Archive',
                      icon: Archive,
                      color: 'gray' as const,
                      position: 'right' as const,
                      onAction: () => handleArchiveCapture(item),
                    },
                  ];
                default:
                  return [];
              }
            };

            return (
              <SwipeableListItem
                key={item.id}
                actions={getSwipeActions()}
                className="mb-2"
              >
                <button
                  onClick={() => handleRecentItemClick(item)}
                  className="apple-list-item w-full text-left group apple-magnetic-hover haptic-light"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1d1d1f] group-hover:text-[#007aff] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-sm text-[#86868b] truncate">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="text-xs text-[#86868b] font-medium">
                      {item.timestamp}
                    </div>
                  </div>
                </button>
              </SwipeableListItem>
            );
          })}
        </div>

        {/* Empty State (if no recent captures) */}
        {captures.length === 0 && (
          <div className="apple-card p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">
              No recent captures
            </h3>
            <p className="text-[#86868b] text-sm">
              Start capturing your thoughts, goals, and tasks using the quick add buttons above.
            </p>
          </div>
        )}

        {/* View All Button */}
        {captures.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/app/plan')}
              className="apple-button-secondary px-6 py-3 font-semibold"
            >
              View All Items
            </button>
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
};