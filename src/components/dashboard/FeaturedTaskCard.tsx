import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface FeaturedTask {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  dueDate: string;
  teamMembers: TeamMember[];
}

interface FeaturedTaskCardProps {
  task: FeaturedTask | null;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export const FeaturedTaskCard: React.FC<FeaturedTaskCardProps> = ({ task }) => {
  if (!task) {
    return (
      <div className="bg-muted/30 rounded-2xl p-6 mb-8 border border-border/50">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No active tasks today
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a new task to get started with your productive day
          </p>
        </div>
      </div>
    );
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
      {/* Header with title and See All link */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white/90">Today Tasks</h2>
        <Link
          to="/tasks"
          className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4"
        >
          See All
        </Link>
      </div>

      {/* Priority badge */}
      <div className="mb-4">
        <Badge
          variant="secondary"
          className={`${getPriorityColor(task.priority)} border-0 font-medium px-3 py-1`}
        >
          {task.priority}
        </Badge>
      </div>

      {/* Task title and description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
          {task.title}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Bottom row: team members and due date */}
      <div className="flex items-center justify-between">
        {/* Team member avatars */}
        <div className="flex items-center space-x-2">
          {task.teamMembers.slice(0, 4).map((member, index) => (
            <Avatar key={member.id} className="h-8 w-8 border-2 border-white/20">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-slate-600 text-white text-xs">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.teamMembers.length > 4 && (
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center text-xs text-white font-medium">
              +{task.teamMembers.length - 4}
            </div>
          )}
        </div>

        {/* Due date */}
        <div className="flex items-center space-x-2 text-white/70">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">
            Due: {formatDueDate(task.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
};