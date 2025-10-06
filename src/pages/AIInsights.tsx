import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, TrendingUp, AlertTriangle, Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AIInsights: React.FC = () => {
  const { insights, isLoading: insightsLoading } = useAIInsights();
  const { recommendations, isLoading: recsLoading } = useAIRecommendations();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-insights');
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'New insights generated successfully!',
      });
      
      window.location.reload();
    } catch (error: any) {
      console.error('Generate insights error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity_pattern':
        return <TrendingUp className="h-4 w-4" />;
      case 'recommendation':
        return <Sparkles className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'productivity_pattern':
        return 'bg-blue-500/10 text-blue-500';
      case 'recommendation':
        return 'bg-green-500/10 text-green-500';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'achievement':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Insights</h1>
          <p className="text-muted-foreground">
            Get personalized insights about your productivity patterns
          </p>
        </div>
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate New Insights
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insightsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : insights && insights.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
                            {getTypeIcon(insight.type)}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{insight.title}</CardTitle>
                            <CardDescription>
                              {new Date(insight.generated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Math.round((insight.confidence_score || 0) * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{insight.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No insights yet. Generate your first insights!
                </p>
                <Button onClick={handleGenerateInsights} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Insights'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <CardTitle>{rec.title}</CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        <Badge>Priority: {rec.priority}</Badge>
                        <Badge variant="outline">{rec.status}</Badge>
                      </div>
                      {rec.implementation_steps && Array.isArray(rec.implementation_steps) && (
                        <div>
                          <p className="font-medium mb-2">Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {rec.implementation_steps.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recommendations available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;
