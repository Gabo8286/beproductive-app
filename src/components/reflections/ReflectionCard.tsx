import { useState } from "react";
import { MoreVertical, Heart, Lightbulb, TrendingUp, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import type { ReflectionWithRelations } from "@/types/reflections";
import { format } from "date-fns";

interface ReflectionCardProps {
  reflection: ReflectionWithRelations;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export default function ReflectionCard({
  reflection,
  onEdit,
  onDelete,
  onDuplicate,
}: ReflectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const moodEmojis = {
    amazing: '🤩',
    great: '😊',
    good: '🙂',
    neutral: '😐',
    bad: '😔',
    terrible: '😢',
  };

  const typeColors = {
    daily: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    weekly: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    monthly: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    project: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    goal: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    habit: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const contentPreview = reflection.content.length > 150
    ? reflection.content.substring(0, 150) + '...'
    : reflection.content;

  return (
    <Card 
      className="p-6 hover-scale cursor-pointer transition-all"
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{reflection.title}</h3>
            {reflection.mood && (
              <span className="text-2xl">{moodEmojis[reflection.mood]}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time>{format(new Date(reflection.reflection_date), 'MMM d, yyyy')}</time>
            <span>•</span>
            <Badge variant="secondary" className={typeColors[reflection.reflection_type]}>
              {reflection.reflection_type}
            </Badge>
            {!reflection.is_private && (
              <>
                <span>•</span>
                <Badge variant="outline">Shared</Badge>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              navigate(`/reflections/${reflection.id}`);
            }}>
              View Details
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}>
                Edit
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}>
                Duplicate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mood & Energy Indicators */}
      {(reflection.energy_level || reflection.stress_level || reflection.satisfaction_level) && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {reflection.energy_level && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>Energy</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(reflection.energy_level / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
          {reflection.stress_level && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Stress</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(reflection.stress_level / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
          {reflection.satisfaction_level && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>Satisfaction</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(reflection.satisfaction_level / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground/80 whitespace-pre-wrap">
          {isExpanded ? reflection.content : contentPreview}
        </p>
        {reflection.content.length > 150 && !isExpanded && (
          <Button 
            variant="link" 
            className="p-0 h-auto mt-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            Read more
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 mb-4">
        {reflection.gratitude_items.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-pink-500" />
            <span>{reflection.gratitude_items.length} grateful for</span>
          </div>
        )}
        {reflection.wins.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Target className="h-4 w-4 text-green-500" />
            <span>{reflection.wins.length} wins</span>
          </div>
        )}
        {reflection.learnings.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>{reflection.learnings.length} learnings</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {reflection.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {reflection.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Linked Goals/Habits */}
      {(reflection.goal_links?.length > 0 || reflection.habit_links?.length > 0) && (
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {reflection.goal_links?.map((link) => (
            <Badge key={link.id} variant="secondary" className="text-xs">
              🎯 {link.goal?.title}
            </Badge>
          ))}
          {reflection.habit_links?.map((link) => (
            <Badge key={link.id} variant="secondary" className="text-xs">
              ⚡ {link.habit?.title}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
