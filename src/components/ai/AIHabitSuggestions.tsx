import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Clock, Target, TrendingUp, CheckCircle, X, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { useAIHabitSuggestions, AIHabitSuggestionRecord } from '@/hooks/useAIHabitSuggestions';
import { APIProviderType } from '@/types/api-management';
import { cn } from '@/lib/utils';

interface AIHabitSuggestionsProps {
  goalId: string;
  goalTitle: string;
  goalDescription: string;
  workspaceId: string;
  className?: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/10 text-green-600 border-green-200';
    case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'hard': return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'extreme': return 'bg-red-500/10 text-red-600 border-red-200';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
  }
};

const getFrequencyDisplay = (frequency: string, customFrequency?: any) => {
  if (frequency === 'custom' && customFrequency) {
    return customFrequency.description || customFrequency.pattern;
  }
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
};

function SuggestionCard({
  suggestion,
  onApprove,
  onReject,
  onConvert,
  isUpdating,
  isConverting
}: {
  suggestion: AIHabitSuggestionRecord;
  onApprove: () => void;
  onReject: () => void;
  onConvert: () => void;
  isUpdating: boolean;
  isConverting: boolean;
}) {
  const { suggestion_data: habit, status, ai_confidence } = suggestion;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      status === 'approved' && "border-green-200 bg-green-50/50",
      status === 'rejected' && "border-red-200 bg-red-50/50",
      status === 'converted' && "border-blue-200 bg-blue-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{habit.title}</CardTitle>
            <CardDescription className="text-sm">
              {habit.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Badge variant="outline" className="text-xs">
              {Math.round(ai_confidence * 100)}% confidence
            </Badge>
            {status === 'converted' && (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Created
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Habit Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Frequency</div>
            <div className="font-medium">
              {getFrequencyDisplay(habit.frequency, habit.customFrequency)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground">Difficulty</div>
            <Badge className={getDifficultyColor(habit.difficulty)}>
              {habit.difficulty}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground">Best Time</div>
            <div className="font-medium capitalize">{habit.time_of_day}</div>
          </div>

          {habit.duration_minutes && (
            <div className="space-y-1">
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {habit.duration_minutes}m
              </div>
            </div>
          )}
        </div>

        {/* AI Reasoning */}
        {habit.reasoning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Why this helps
            </div>
            <p className="text-sm bg-muted/50 p-3 rounded-lg border">
              {habit.reasoning}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Category: <span className="capitalize">{habit.category}</span>
          </div>

          <div className="flex gap-2">
            {status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}

            {status === 'approved' && (
              <Button
                size="sm"
                onClick={onConvert}
                disabled={isConverting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConverting ? (
                  "Creating..."
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Create Habit
                  </>
                )}
              </Button>
            )}

            {status === 'rejected' && (
              <Badge variant="destructive">
                <X className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RejectReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Why are you rejecting this suggestion?</DialogTitle>
          <DialogDescription>
            Your feedback helps improve future AI suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Not realistic for my schedule, doesn't align with my preferences..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            Reject Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AIHabitSuggestions({
  goalId,
  goalTitle,
  goalDescription,
  workspaceId,
  className
}: AIHabitSuggestionsProps) {
  const [selectedProvider, setSelectedProvider] = useState<APIProviderType>('openai');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState<string | null>(null);

  const {
    suggestions,
    isLoading,
    generateSuggestions,
    isGeneratingSuggestions,
    updateStatus,
    isUpdatingStatus,
    convertToHabit,
    isConvertingToHabit
  } = useAIHabitSuggestions(goalId);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');
  const convertedSuggestions = suggestions.filter(s => s.status === 'converted');

  const handleGenerateSuggestions = () => {
    generateSuggestions({
      goalId,
      goalTitle,
      goalDescription,
      workspaceId,
      provider: selectedProvider
    });
  };

  const handleReject = (suggestionId: string) => {
    setRejectionTarget(suggestionId);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectionTarget) {
      updateStatus({
        suggestionId: rejectionTarget,
        status: 'rejected',
        rejectedReason: reason || undefined
      });
    }
    setRejectDialogOpen(false);
    setRejectionTarget(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI Habit Suggestions</h3>
        </div>

        <p className="text-muted-foreground text-sm">
          Get personalized habit recommendations to help achieve your goal: <strong>"{goalTitle}"</strong>
        </p>

        {/* Generate Suggestions */}
        {suggestions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Target className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h4 className="font-medium">No suggestions yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-powered habit suggestions to help achieve your goal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={selectedProvider} onValueChange={(value: APIProviderType) => setSelectedProvider(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleGenerateSuggestions}
                    disabled={isGeneratingSuggestions}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingSuggestions ? (
                      "Generating..."
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Suggestions
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regenerate Button */}
        {suggestions.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} generated
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedProvider} onValueChange={(value: APIProviderType) => setSelectedProvider(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateSuggestions}
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading suggestions...</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-6">
          {/* Pending Suggestions */}
          {pendingSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium">Pending Review ({pendingSuggestions.length})</h4>
              </div>
              <div className="space-y-3">
                {pendingSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApprove={() => updateStatus({ suggestionId: suggestion.id, status: 'approved' })}
                    onReject={() => handleReject(suggestion.id)}
                    onConvert={() => convertToHabit(suggestion)}
                    isUpdating={isUpdatingStatus}
                    isConverting={isConvertingToHabit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Approved Suggestions */}
          {approvedSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Approved ({approvedSuggestions.length})</h4>
              </div>
              <div className="space-y-3">
                {approvedSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApprove={() => {}}
                    onReject={() => {}}
                    onConvert={() => convertToHabit(suggestion)}
                    isUpdating={isUpdatingStatus}
                    isConverting={isConvertingToHabit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Converted Suggestions */}
          {convertedSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Created Habits ({convertedSuggestions.length})</h4>
              </div>
              <div className="space-y-3">
                {convertedSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApprove={() => {}}
                    onReject={() => {}}
                    onConvert={() => {}}
                    isUpdating={false}
                    isConverting={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rejected Suggestions */}
          {rejectedSuggestions.length > 0 && (
            <details className="space-y-3">
              <summary className="flex items-center gap-2 cursor-pointer">
                <X className="h-4 w-4 text-red-500" />
                <h4 className="font-medium">Rejected ({rejectedSuggestions.length})</h4>
              </summary>
              <div className="space-y-3 mt-3">
                {rejectedSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApprove={() => {}}
                    onReject={() => {}}
                    onConvert={() => {}}
                    isUpdating={false}
                    isConverting={false}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Reject Reason Dialog */}
      <RejectReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleConfirmReject}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}