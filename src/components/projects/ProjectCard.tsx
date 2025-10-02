// Project Card Component
// Display project information in a card format with actions

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Folder,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectWithRelations, PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from '@/types/projects';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: ProjectWithRelations;
  onEdit?: (project: ProjectWithRelations) => void;
  onDelete?: (project: ProjectWithRelations) => void;
  onDuplicate?: (project: ProjectWithRelations) => void;
  showActions?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true
}: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  const priorityConfig = PROJECT_PRIORITY_CONFIG[project.priority];

  const isOverdue = project.target_date &&
    new Date(project.target_date) < new Date() &&
    project.status !== 'completed';

  const getDaysRemaining = () => {
    if (!project.target_date) return null;
    const targetDate = new Date(project.target_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div
              className="w-3 h-3 rounded-full mt-1"
              style={{ backgroundColor: project.color }}
            />
            <div className="flex-1 min-w-0">
              <Link
                to={`/projects/${project.id}`}
                className="font-semibold text-lg hover:text-blue-600 transition-colors"
              >
                {project.title}
              </Link>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/projects/${project.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(project)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center space-x-2 mt-3">
          <Badge
            variant={statusConfig.color === 'green' ? 'default' : 'secondary'}
            className={`
              ${statusConfig.color === 'blue' && 'bg-blue-100 text-blue-800'}
              ${statusConfig.color === 'green' && 'bg-green-100 text-green-800'}
              ${statusConfig.color === 'yellow' && 'bg-yellow-100 text-yellow-800'}
              ${statusConfig.color === 'red' && 'bg-red-100 text-red-800'}
              ${statusConfig.color === 'gray' && 'bg-gray-100 text-gray-800'}
            `}
          >
            {statusConfig.label}
          </Badge>

          <Badge
            variant="outline"
            className={`
              ${priorityConfig.color === 'gray' && 'border-gray-300 text-gray-600'}
              ${priorityConfig.color === 'blue' && 'border-blue-300 text-blue-600'}
              ${priorityConfig.color === 'orange' && 'border-orange-300 text-orange-600'}
              ${priorityConfig.color === 'red' && 'border-red-300 text-red-600'}
            `}
          >
            {priorityConfig.label}
          </Badge>

          {project.tags && project.tags.length > 0 && (
            <div className="flex space-x-1">
              {project.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress_percentage}%</span>
          </div>
          <Progress value={project.progress_percentage} className="h-2" />
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-lg">{project.tasks_count || 0}</div>
            <div className="text-gray-600">Tasks</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{project.total_members || 0}</div>
            <div className="text-gray-600">Members</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{project.goals_count || 0}</div>
            <div className="text-gray-600">Goals</div>
          </div>
        </div>

        {/* Timeline and Members */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {project.target_date ? (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Due {format(new Date(project.target_date), 'MMM d, yyyy')}
                {daysRemaining !== null && (
                  <span className="ml-1">
                    ({daysRemaining > 0 ? `${daysRemaining} days left` :
                      daysRemaining === 0 ? 'Due today' :
                      `${Math.abs(daysRemaining)} days overdue`})
                  </span>
                )}
              </span>
            ) : (
              <span>No due date</span>
            )}
          </div>

          {/* Team Members Avatars */}
          {project.members && project.members.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-600" />
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={member.user_profile?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {member.user_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.members.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{project.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Project Manager */}
        {project.project_manager_profile && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2 border-t">
            <span>Manager:</span>
            <Avatar className="h-5 w-5">
              <AvatarImage src={project.project_manager_profile.avatar_url} />
              <AvatarFallback className="text-xs">
                {project.project_manager_profile.full_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            <span>{project.project_manager_profile.full_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}