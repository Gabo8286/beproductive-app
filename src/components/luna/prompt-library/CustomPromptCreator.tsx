import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  TestTube,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  Target,
  CheckSquare,
  Calendar,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomPrompts } from '@/hooks/usePromptLibrary';
import { PromptCategory, PromptOutputFormat, PromptComplexity } from '@/types/promptLibrary';
import { useLuna } from '@/components/luna/context/LunaContext';

interface CustomPromptCreatorProps {
  onSave?: (promptId: string) => void;
  onCancel?: () => void;
  className?: string;
  initialData?: Partial<CustomPromptData>;
}

interface CustomPromptData {
  name: string;
  description: string;
  category: PromptCategory;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: PromptOutputFormat;
  complexity: PromptComplexity;
  keywords: string[];
  isPublic: boolean;
}

const CATEGORY_OPTIONS: Array<{ value: PromptCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'task_management', label: 'Task Management', icon: CheckSquare },
  { value: 'goal_setting', label: 'Goal Setting', icon: Target },
  { value: 'planning', label: 'Planning', icon: Calendar },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'habit_formation', label: 'Habit Formation', icon: Zap },
  { value: 'workflow', label: 'Workflow', icon: Brain },
  { value: 'general', label: 'General', icon: MessageCircle }
];

const OUTPUT_FORMAT_OPTIONS: Array<{ value: PromptOutputFormat; label: string; description: string }> = [
  { value: 'structured', label: 'Structured', description: 'Organized lists, steps, or sections' },
  { value: 'conversational', label: 'Conversational', description: 'Natural, friendly dialogue' },
  { value: 'analytical', label: 'Analytical', description: 'Data-driven insights and recommendations' },
  { value: 'creative', label: 'Creative', description: 'Innovative and inspirational responses' }
];

const COMPLEXITY_OPTIONS: Array<{ value: PromptComplexity; label: string; description: string }> = [
  { value: 'simple', label: 'Simple', description: 'Basic, straightforward assistance' },
  { value: 'moderate', label: 'Moderate', description: 'Multi-step guidance with context' },
  { value: 'complex', label: 'Complex', description: 'Advanced analysis and comprehensive solutions' }
];

export const CustomPromptCreator: React.FC<CustomPromptCreatorProps> = ({
  onSave,
  onCancel,
  className,
  initialData
}) => {
  const [formData, setFormData] = useState<CustomPromptData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'general',
    systemPrompt: initialData?.systemPrompt || '',
    userPromptTemplate: initialData?.userPromptTemplate || '',
    outputFormat: initialData?.outputFormat || 'conversational',
    complexity: initialData?.complexity || 'moderate',
    keywords: initialData?.keywords || [],
    isPublic: initialData?.isPublic || false
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { createCustomPrompt } = useCustomPrompts();
  const { sendMessage } = useLuna();

  const handleInputChange = (field: keyof CustomPromptData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      handleInputChange('keywords', [...formData.keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    handleInputChange('keywords', formData.keywords.filter(k => k !== keyword));
  };

  const handleTestPrompt = async () => {
    setIsTesting(true);
    try {
      // Test the prompt by sending it to Luna
      const testMessage = `Test this custom prompt: "${formData.name}" - ${formData.description}. System prompt: ${formData.systemPrompt}`;
      await sendMessage(testMessage);
      setTestResult('Prompt test sent to Luna successfully!');
    } catch (error) {
      setTestResult('Failed to test prompt. Please check your configuration.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promptData = {
        ...formData,
        author: 'user',
        tags: formData.keywords,
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          usage_count: 0,
          avg_rating: 0
        }
      };

      const promptId = await createCustomPrompt(promptData);
      onSave?.(promptId);
    } catch (error) {
      console.error('Failed to save custom prompt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name && formData.description && formData.systemPrompt;

  const selectedCategory = CATEGORY_OPTIONS.find(cat => cat.value === formData.category);
  const CategoryIcon = selectedCategory?.icon || MessageCircle;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Create Custom Prompt</h2>
          <p className="text-sm text-muted-foreground">
            Design a personalized prompt template for your specific needs
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>
            Provide the essential details for your custom prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Prompt Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Daily Task Prioritizer"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value as PromptCategory)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4" />
                      {selectedCategory?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this prompt helps with and when to use it..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompt Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompt Configuration</CardTitle>
          <CardDescription>
            Define how your prompt should behave and respond
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt *</Label>
            <Textarea
              id="systemPrompt"
              placeholder="You are a helpful assistant that helps users prioritize their daily tasks. Focus on urgency, importance, and available time..."
              value={formData.systemPrompt}
              onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This defines the AI's behavior and personality for this specific task
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userPromptTemplate">User Prompt Template</Label>
            <Textarea
              id="userPromptTemplate"
              placeholder="Help me prioritize these tasks: {user_input}. Consider my available time: {time_available} and energy level: {energy_level}"
              value={formData.userPromptTemplate}
              onChange={(e) => handleInputChange('userPromptTemplate', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{variable_name}'} for dynamic content. Leave empty to use user input directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={formData.outputFormat}
                onValueChange={(value) => handleInputChange('outputFormat', value as PromptOutputFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMAT_OPTIONS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Complexity Level</Label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => handleInputChange('complexity', value as PromptComplexity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITY_OPTIONS.map((complexity) => (
                    <SelectItem key={complexity.value} value={complexity.value}>
                      <div>
                        <div className="font-medium">{complexity.label}</div>
                        <div className="text-xs text-muted-foreground">{complexity.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keywords & Discovery</CardTitle>
          <CardDescription>
            Add keywords to help users find this prompt easier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <Button variant="outline" onClick={handleAddKeyword}>
              Add
            </Button>
          </div>

          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-sm",
          testResult.includes('successfully')
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {testResult.includes('successfully') ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {testResult}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestPrompt}
            disabled={!isFormValid || isTesting}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? 'Testing...' : 'Test Prompt'}
          </Button>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Prompt'}
          </Button>
        </div>
      </div>
    </div>
  );
};