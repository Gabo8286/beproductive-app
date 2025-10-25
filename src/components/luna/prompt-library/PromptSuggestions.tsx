import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  CheckSquare,
  Calendar,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePromptSearch } from '@/hooks/usePromptLibrary';
import { PromptTemplate, PromptCategory } from '@/types/promptLibrary';
import { useLuna } from '@/components/luna/context/LunaContext';

interface PromptSuggestionsProps {
  context?: string;
  onPromptSelect?: (prompt: PromptTemplate) => void;
  className?: string;
  maxSuggestions?: number;
}

const CONTEXT_TO_CATEGORY: Record<string, PromptCategory> = {
  'capture': 'task_management',
  'tasks': 'task_management',
  'plan': 'planning',
  'calendar': 'planning',
  'engage': 'goal_setting',
  'goals': 'goal_setting',
  'habits': 'habit_formation',
  'analytics': 'analytics',
  'projects': 'workflow'
};

const CATEGORY_ICONS: Record<PromptCategory, React.ComponentType<{ className?: string }>> = {
  'task_management': CheckSquare,
  'goal_setting': Target,
  'planning': Calendar,
  'analytics': BarChart3,
  'habit_formation': Zap,
  'workflow': Brain,
  'general': Sparkles
};

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  context,
  onPromptSelect,
  className,
  maxSuggestions = 4
}) => {
  const [suggestions, setSuggestions] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getPrompts } = usePromptSearch();
  const { currentContext, sendMessage } = useLuna();

  // Determine the most relevant category based on context
  const getRelevantCategory = (): PromptCategory => {
    const contextKey = context || currentContext || 'general';
    return CONTEXT_TO_CATEGORY[contextKey] || 'general';
  };

  // Load contextual suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        const category = getRelevantCategory();
        const response = await getPrompts({
          category,
          limit: maxSuggestions,
          sortBy: 'popularity'
        });

        if (response.success) {
          setSuggestions(response.data.slice(0, maxSuggestions));
        }
      } catch (error) {
        console.error('Failed to load prompt suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [context, currentContext, maxSuggestions, getPrompts]);

  const handlePromptClick = (prompt: PromptTemplate) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    } else {
      // Default behavior: send a contextual message to Luna
      const message = `Help me with ${prompt.description.toLowerCase()}`;
      sendMessage(message, currentContext);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Loading suggestions...</span>
        </div>
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const relevantCategory = getRelevantCategory();
  const CategoryIcon = CATEGORY_ICONS[relevantCategory];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <CategoryIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Suggested prompts</span>
        <Badge variant="secondary" className="text-xs">
          {relevantCategory.replace('_', ' ')}
        </Badge>
      </div>

      <ScrollArea className="w-full">
        <div className="grid gap-2">
          {suggestions.map((prompt) => {
            const IconComponent = CATEGORY_ICONS[prompt.category];

            return (
              <Card
                key={prompt.id}
                className="cursor-pointer hover:shadow-sm transition-all duration-200 hover:scale-[1.02] group"
                onClick={() => handlePromptClick(prompt)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {prompt.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {prompt.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {suggestions.length >= maxSuggestions && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            // This would open the full prompt library
            console.log('Open full prompt library');
          }}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          View all prompts
        </Button>
      )}
    </div>
  );
};