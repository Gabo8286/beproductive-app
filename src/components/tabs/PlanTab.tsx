import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Calendar, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gabrielPersona } from '@/data/demo/gabriel-persona-data';

type ViewMode = 'list' | 'board' | 'calendar';

interface FilterChip {
  id: string;
  label: string;
  active: boolean;
}

// Gabriel's AI Entrepreneur Demo Data
const mockProjects = gabrielPersona.projects;

// Transform tasks for display
const mockTasks = gabrielPersona.tasks.map(task => ({
  id: task.id,
  title: task.title,
  project: task.category.charAt(0).toUpperCase() + task.category.slice(1),
  priority: task.priority,
  dueDate: new Date(task.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }),
  completed: task.completed,
}));

interface PlanTabProps {
  className?: string;
}

export const PlanTab: React.FC<PlanTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: 'all', label: 'All', active: true },
    { id: 'ai', label: 'AI & Claude', active: false },
    { id: 'product', label: 'Product', active: false },
    { id: 'marketing', label: 'Marketing', active: false },
    { id: 'high-priority', label: 'High Priority', active: false },
    { id: 'today', label: 'Due Today', active: false },
  ]);

  const handleFilterToggle = (filterId: string) => {
    setFilters(prev => prev.map(filter => ({
      ...filter,
      active: filter.id === filterId ? !filter.active : filter.id === 'all' ? false : filter.active
    })));
  };

  const handleTaskToggle = (taskId: string) => {
    // TODO: Implement task completion toggle in state management
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-[#ff3b30]';
      case 'medium': return 'text-[#ff9500]';
      case 'low': return 'text-[#86868b]';
      default: return 'text-[#86868b]';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'HIGH';
      case 'medium': return 'MED';
      case 'low': return 'LOW';
      default: return '';
    }
  };

  return (
    <div className={cn('p-5 md:p-8 max-w-6xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="apple-page-title">Plan</h1>
        <p className="apple-page-subtitle">Organize your work</p>
      </div>

      {/* View Selector */}
      <div className="apple-card p-1 mb-5 inline-flex rounded-apple-button">
        {[
          { id: 'list', label: 'List', icon: LayoutGrid },
          { id: 'board', label: 'Board', icon: LayoutGrid },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewMode(id as ViewMode)}
            className={cn(
              'px-4 py-2 rounded-apple-small text-sm font-medium transition-all duration-200',
              'flex items-center gap-2',
              viewMode === id
                ? 'bg-[#007aff] text-white'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mb-6 overflow-x-auto apple-scrollbar">
        <div className="flex gap-2 pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              className={cn(
                'apple-filter-chip',
                filter.active && 'active'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Projects Section */}
          <div>
            <h2 className="apple-section-title">Projects</h2>
            <div className="space-y-3">
              {mockProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="apple-card p-4 w-full text-left hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{project.icon}</span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {project.title}
                      </span>
                    </div>
                    <span className="apple-stat-value text-sm">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="text-sm text-[#86868b] mb-3">
                    {project.tasks} tasks • Due {project.dueDate}
                  </div>
                  <div className="w-full bg-[#f5f5f7] h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#007aff] transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <h2 className="apple-section-title">Tasks</h2>
            <div className="space-y-2">
              {mockTasks.map((task) => (
                <div
                  key={task.id}
                  className="apple-list-item group cursor-pointer"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskToggle(task.id);
                      }}
                      className={cn(
                        'apple-checkbox',
                        task.completed && 'checked'
                      )}
                      aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                    >
                      {task.completed && '✓'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-semibold text-sm',
                        task.completed
                          ? 'text-[#86868b] line-through'
                          : 'text-[#1d1d1f] group-hover:text-[#007aff]'
                      )}>
                        {task.title}
                      </div>
                      <div className="text-xs text-[#86868b]">
                        {task.project} • {task.dueDate}
                      </div>
                    </div>
                  </div>
                  {!task.completed && task.priority !== 'low' && (
                    <span className={cn(
                      'text-xs font-bold px-2 py-1 rounded',
                      getPriorityColor(task.priority)
                    )}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Board and Calendar views placeholder */}
      {viewMode === 'board' && (
        <div className="apple-card p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-semibold text-[#1d1d1f] mb-2">Board View</h3>
          <p className="text-[#86868b]">Kanban board view coming soon</p>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="apple-card p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="font-semibold text-[#1d1d1f] mb-2">Calendar View</h3>
          <p className="text-[#86868b]">Calendar integration coming soon</p>
        </div>
      )}
    </div>
  );
};