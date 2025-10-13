import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalView } from '@/contexts/GlobalViewContext';

// Empty state data - real data should be fetched from API
const mockProjects: any[] = [];
const mockTasks: any[] = [];

interface PlanTabProps {
  className?: string;
}

export const PlanTab: React.FC<PlanTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const { viewMode } = useGlobalView();

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