import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalView } from '@/contexts/GlobalViewContext';
import { useTasks, useToggleTaskCompletion } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useProjects } from '@/hooks/useProjects';

interface PlanTabProps {
  className?: string;
}

export const PlanTab: React.FC<PlanTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const { viewMode } = useGlobalView();

  // Fetch real data
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { goals = [], isLoading: goalsLoading } = useGoals();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const toggleTaskCompletion = useToggleTaskCompletion();

  const isLoading = tasksLoading || goalsLoading || projectsLoading;

  const handleTaskToggle = (task: any) => {
    toggleTaskCompletion.mutate(task);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn('p-5 md:p-8 max-w-6xl mx-auto', className)}>
        <div className="mb-6">
          <h1 className="apple-page-title">Plan</h1>
          <p className="apple-page-subtitle">Organize your work</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#007aff]" />
          <span className="ml-2 text-[#86868b]">Loading your data...</span>
        </div>
      </div>
    );
  }

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
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="apple-card p-4 w-full text-left hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{project.icon || '📁'}</span>
                        <span className="font-semibold text-[#1d1d1f]">
                          {project.name || project.title}
                        </span>
                      </div>
                      <span className="apple-stat-value text-sm">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="text-sm text-[#86868b] mb-3">
                      {project.tasks || 0} tasks • Due {project.due_date || 'TBD'}
                    </div>
                    <div className="w-full bg-[#f5f5f7] h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007aff] transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="apple-card p-6 text-center">
                <div className="text-4xl mb-3">📁</div>
                <h3 className="font-semibold text-[#1d1d1f] mb-2">
                  No Projects Yet
                </h3>
                <p className="text-[#86868b] text-sm mb-4">
                  Projects feature is coming soon. Create goals and tasks to organize your work.
                </p>
                <button
                  onClick={() => navigate('/goals/new')}
                  className="apple-button-primary px-4 py-2 text-sm"
                >
                  Create Goal
                </button>
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div>
            <h2 className="apple-section-title">Goals</h2>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.slice(0, 5).map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    className="apple-card p-4 w-full text-left hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎯</span>
                        <span className="font-semibold text-[#1d1d1f]">
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#86868b] capitalize">
                          {goal.status}
                        </span>
                        {goal.progress !== undefined && (
                          <span className="apple-stat-value text-sm">
                            {goal.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                    {goal.description && (
                      <div className="text-sm text-[#86868b] mb-3 line-clamp-2">
                        {goal.description}
                      </div>
                    )}
                    <div className="text-xs text-[#86868b] mb-2">
                      {goal.target_date
                        ? `Target: ${new Date(goal.target_date).toLocaleDateString()}`
                        : 'No target date'
                      }
                    </div>
                    {goal.progress !== undefined && (
                      <div className="w-full bg-[#f5f5f7] h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#34c759] transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    )}
                  </button>
                ))}
                {goals.length > 5 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => navigate('/goals')}
                      className="apple-button-secondary px-4 py-2 text-sm"
                    >
                      View All {goals.length} Goals
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="apple-card p-6 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-[#1d1d1f] mb-2">
                  No Goals Yet
                </h3>
                <p className="text-[#86868b] text-sm mb-4">
                  Set your first goal to start working towards your objectives.
                </p>
                <button
                  onClick={() => navigate('/goals/new')}
                  className="apple-button-primary px-4 py-2 text-sm"
                >
                  Create Goal
                </button>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div>
            <h2 className="apple-section-title">Tasks</h2>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="apple-list-item group cursor-pointer"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskToggle(task);
                        }}
                        className={cn(
                          'apple-checkbox',
                          task.status === 'done' && 'checked'
                        )}
                        aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
                      >
                        {task.status === 'done' && '✓'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-semibold text-sm',
                          task.status === 'done'
                            ? 'text-[#86868b] line-through'
                            : 'text-[#1d1d1f] group-hover:text-[#007aff]'
                        )}>
                          {task.title}
                        </div>
                        <div className="text-xs text-[#86868b]">
                          {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                        </div>
                      </div>
                    </div>
                    {task.status !== 'done' && task.priority !== 'low' && (
                      <span className={cn(
                        'text-xs font-bold px-2 py-1 rounded',
                        getPriorityColor(task.priority)
                      )}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    )}
                  </div>
                ))}
                {tasks.length > 10 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={() => navigate('/tasks')}
                      className="apple-button-secondary px-4 py-2 text-sm"
                    >
                      View All {tasks.length} Tasks
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="apple-card p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold text-[#1d1d1f] mb-2">
                  No Tasks Yet
                </h3>
                <p className="text-[#86868b] text-sm mb-4">
                  Create your first task to start organizing your work.
                </p>
                <button
                  onClick={() => navigate('/tasks')}
                  className="apple-button-primary px-4 py-2 text-sm"
                >
                  Create Task
                </button>
              </div>
            )}
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