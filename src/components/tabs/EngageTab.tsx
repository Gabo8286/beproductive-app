import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
// Empty state data - real data should be fetched from API
const todayStats: any[] = [];
const todayFocus: any[] = [];
const weeklyOverview = {
  tasksCompleted: { current: 0, total: 0 },
  habitStreak: 0,
  goalsProgress: "0%",
  aiInteractions: 0,
  automationWorkflows: 0,
};

interface EngageTabProps {
  className?: string;
}

export const EngageTab: React.FC<EngageTabProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleFocusItemClick = (item: any) => {
    switch (item.type.toLowerCase()) {
      case 'habit':
        navigate('/habits');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'event':
        navigate('/calendar');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleStatClick = (statLabel: string) => {
    switch (statLabel.toLowerCase()) {
      case 'tasks done':
        navigate('/tasks');
        break;
      case 'habits':
        navigate('/habits');
        break;
      case 'focus time':
        navigate('/analytics');
        break;
      case 'on track':
        navigate('/analytics');
        break;
      default:
        navigate('/analytics');
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  const handleToggleItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle completion toggle
    console.log('Toggle item:', itemId);
  };

  return (
    <div className={cn('p-5 md:p-8 max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="apple-page-title">Today</h1>
        <p className="apple-page-subtitle">{getCurrentDate()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {todayStats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => handleStatClick(stat.label)}
            className="apple-stats-card hover:scale-105 transition-transform duration-200"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="apple-stat-value">{stat.value}</div>
            <div className="apple-stat-label">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Today's Focus */}
      <div className="mb-8">
        <h2 className="apple-section-title">Today's Focus</h2>
        <div className="space-y-2">
          {todayFocus.map((item) => (
            <div
              key={item.id}
              className={cn(
                'apple-list-item group cursor-pointer transition-all duration-200',
                item.current && 'ring-2 ring-[#007aff] bg-[#007aff]/5'
              )}
              onClick={() => handleFocusItemClick(item)}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={(e) => handleToggleItem(item.id, e)}
                  className={cn(
                    'apple-checkbox',
                    item.completed && 'checked'
                  )}
                  aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                >
                  {item.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'font-semibold text-sm',
                    item.completed
                      ? 'text-[#86868b] line-through'
                      : 'text-[#1d1d1f] group-hover:text-[#007aff]'
                  )}>
                    {item.title}
                  </div>
                  <div className="text-xs text-[#86868b]">
                    {item.type}
                    {item.duration && ` • ${item.duration}`}
                    {item.priority && ` • ${item.priority}`}
                    {item.time && ` • ${item.time}`}
                  </div>
                </div>
              </div>
              {item.current && (
                <span className="text-xs font-bold text-[#007aff] px-2 py-1 bg-[#007aff]/10 rounded">
                  NOW
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="apple-card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="font-semibold text-[#1d1d1f] mb-2">
          No activity data yet
        </h3>
        <p className="text-[#86868b] text-sm mb-6">
          Start using the app to see your daily focus items, stats, and weekly progress here.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/tasks')}
            className="apple-button-primary py-3 text-sm"
          >Add Tasks</button>
          <button
            onClick={() => navigate('/goals')}
            className="apple-button-secondary py-3 text-sm"
          >Set Goals</button>
        </div>
      </div>
    </div>
  );
};