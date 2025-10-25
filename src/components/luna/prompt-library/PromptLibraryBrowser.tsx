import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Star,
  Clock,
  User,
  Brain,
  Zap,
  Target,
  CheckSquare,
  Calendar,
  BarChart3,
  FileText,
  Plus,
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePromptSearch, usePromptFeedback, useCustomPrompts } from '@/hooks/usePromptLibrary';
import { PromptTemplate, PromptCategory } from '@/types/promptLibrary';

interface PromptLibraryBrowserProps {
  onSelectPrompt?: (prompt: PromptTemplate) => void;
  onClose?: () => void;
  className?: string;
}

const CATEGORY_ICONS: Record<PromptCategory, React.ComponentType<{ className?: string }>> = {
  'task_management': CheckSquare,
  'goal_setting': Target,
  'planning': Calendar,
  'analytics': BarChart3,
  'habit_formation': Zap,
  'workflow': Brain,
  'general': MessageCircle
};

const CATEGORY_COLORS: Record<PromptCategory, string> = {
  'task_management': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'goal_setting': 'bg-green-500/10 text-green-600 border-green-200',
  'planning': 'bg-purple-500/10 text-purple-600 border-purple-200',
  'analytics': 'bg-orange-500/10 text-orange-600 border-orange-200',
  'habit_formation': 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  'workflow': 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  'general': 'bg-gray-500/10 text-gray-600 border-gray-200'
};

export const PromptLibraryBrowser: React.FC<PromptLibraryBrowserProps> = ({
  onSelectPrompt,
  onClose,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'custom' | 'popular'>('browse');

  const {
    searchPrompts,
    getPrompts,
    searchResults,
    isSearching
  } = usePromptSearch();

  const { submitFeedback } = usePromptFeedback();
  const { customPrompts, isLoading: customLoading } = useCustomPrompts();

  // Load prompts on mount and when filters change
  useEffect(() => {
    if (activeTab === 'browse') {
      if (searchQuery.trim()) {
        searchPrompts(searchQuery, {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20
        });
      } else {
        getPrompts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20
        });
      }
    }
  }, [searchQuery, selectedCategory, activeTab, searchPrompts, getPrompts]);

  const handlePromptSelect = (prompt: PromptTemplate) => {
    onSelectPrompt?.(prompt);
    onClose?.();
  };

  const handlePromptLike = async (promptId: string) => {
    try {
      await submitFeedback(promptId, 5, 'Liked this prompt', true);
    } catch (error) {
      console.error('Failed to like prompt:', error);
    }
  };

  const renderPromptCard = (prompt: PromptTemplate) => {
    const IconComponent = CATEGORY_ICONS[prompt.category];
    const categoryColor = CATEGORY_COLORS[prompt.category];

    return (
      <Card
        key={prompt.id}
        className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
        onClick={() => handlePromptSelect(prompt)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                  {prompt.name}
                </CardTitle>
                <Badge variant="outline" className={cn("text-xs mt-1 w-fit", categoryColor)}>
                  {prompt.category.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handlePromptLike(prompt.id);
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-3 line-clamp-2">
            {prompt.description}
          </CardDescription>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {prompt.metadata?.popularity || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {prompt.metadata?.lastUsed ? 'Recently used' : 'Never used'}
              </span>
            </div>
            {prompt.author === 'user' && (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Custom
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const categories: Array<{ value: PromptCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'all', label: 'All Prompts', icon: Sparkles },
    { value: 'task_management', label: 'Tasks', icon: CheckSquare },
    { value: 'goal_setting', label: 'Goals', icon: Target },
    { value: 'planning', label: 'Planning', icon: Calendar },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'habit_formation', label: 'Habits', icon: Zap },
    { value: 'workflow', label: 'Workflow', icon: Brain },
    { value: 'general', label: 'General', icon: MessageCircle }
  ];

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Prompt Library</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category Filter (for browse tab) */}
      {activeTab === 'browse' && (
        <div className="p-4 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          {/* Browse Tab */}
          <TabsContent value="browse" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Searching prompts...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No prompts found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or category filter
                        </p>
                      </div>
                    ) : (
                      searchResults.map(renderPromptCard)
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Your Custom Prompts</h3>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New
                  </Button>
                </div>

                {customLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {customPrompts.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No custom prompts yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create your own prompts tailored to your specific needs
                        </p>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create Your First Prompt
                        </Button>
                      </div>
                    ) : (
                      customPrompts.map(renderPromptCard)
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Popular Tab */}
          <TabsContent value="popular" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">Popular Prompts</h3>
                </div>

                <div className="grid gap-4">
                  {searchResults
                    .filter(prompt => (prompt.metadata?.popularity || 0) > 0)
                    .sort((a, b) => (b.metadata?.popularity || 0) - (a.metadata?.popularity || 0))
                    .map(renderPromptCard)}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};