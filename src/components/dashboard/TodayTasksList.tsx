import React from "react";
import { Link2, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  taskCount: number;
  isFavorite: boolean;
  href: string;
  iconBgColor: string;
  iconColor: string;
}

interface TodayTasksListProps {
  categories: TaskCategory[];
}

const defaultCategories: TaskCategory[] = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Budgets & bills',
    icon: '💰',
    taskCount: 1,
    isFavorite: true,
    href: '/tasks?category=finance',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'sport',
    name: 'Sport',
    description: 'Workouts & progress',
    icon: '🏋️',
    taskCount: 2,
    isFavorite: false,
    href: '/tasks?category=sport',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'home',
    name: 'Home',
    description: 'Chores & upkeep',
    icon: '🏠',
    taskCount: 7,
    isFavorite: false,
    href: '/tasks?category=home',
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Notes just for you',
    icon: 'P',
    taskCount: 12,
    isFavorite: false,
    href: '/notes',
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  }
];

export const TodayTasksList: React.FC<TodayTasksListProps> = ({
  categories = defaultCategories
}) => {
  const toggleFavorite = (categoryId: string) => {
    // This would typically update the state or call an API
    console.log(`Toggle favorite for category: ${categoryId}`);
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={category.href}
          className="block"
        >
          <div className="bg-white dark:bg-card rounded-2xl p-4 border border-border/50 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              {/* Left side: icon, name, description */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Icon */}
                <div className={`w-12 h-12 ${category.iconBgColor} rounded-xl flex items-center justify-center`}>
                  {typeof category.icon === 'string' ? (
                    <span className="text-lg">{category.icon}</span>
                  ) : (
                    <div className={category.iconColor}>
                      {category.icon}
                    </div>
                  )}
                </div>

                {/* Name and description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {/* Task count with chain icon */}
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.taskCount}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Right side: favorite star */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(category.id);
                }}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                aria-label={`${category.isFavorite ? 'Remove from' : 'Add to'} favorites`}
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    category.isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </Link>
      ))}

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="bg-white dark:bg-card rounded-2xl p-8 border border-border/50 text-center">
          <p className="text-muted-foreground">
            No task categories found. Create your first task to get started.
          </p>
        </div>
      )}
    </div>
  );
};