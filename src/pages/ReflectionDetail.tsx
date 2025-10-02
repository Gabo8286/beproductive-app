import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useReflection } from "@/hooks/useReflections";
import { useDeleteReflection } from "@/hooks/useReflections";
import { GoalReflectionLinker } from "@/components/reflections/GoalReflectionLinker";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReflectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reflection, isLoading } = useReflection(id!);
  const { mutate: deleteReflection } = useDeleteReflection();

  const moodEmojis = {
    amazing: '🤩',
    great: '😊',
    good: '🙂',
    neutral: '😐',
    bad: '😔',
    terrible: '😢',
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      deleteReflection(id!, {
        onSuccess: () => navigate('/reflections'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="container mx-auto p-6">
        <p>Reflection not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/reflections')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reflections
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-8 space-y-6">
        {/* Title & Meta */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">{reflection.title}</h1>
            {reflection.mood && (
              <span className="text-4xl">{moodEmojis[reflection.mood]}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <time>{format(new Date(reflection.reflection_date), 'EEEE, MMMM d, yyyy')}</time>
            <span>•</span>
            <Badge variant="secondary">{reflection.reflection_type}</Badge>
            {!reflection.is_private && (
              <>
                <span>•</span>
                <Badge variant="outline">Shared</Badge>
              </>
            )}
          </div>
        </div>

        {/* Wellness Metrics */}
        {(reflection.energy_level || reflection.stress_level || reflection.satisfaction_level) && (
          <>
            <Separator />
            <div className="grid grid-cols-3 gap-6">
              {reflection.energy_level && (
                <div>
                  <p className="text-sm font-medium mb-2">⚡ Energy</p>
                  <p className="text-2xl font-bold">{reflection.energy_level}/10</p>
                </div>
              )}
              {reflection.stress_level && (
                <div>
                  <p className="text-sm font-medium mb-2">😰 Stress</p>
                  <p className="text-2xl font-bold">{reflection.stress_level}/10</p>
                </div>
              )}
              {reflection.satisfaction_level && (
                <div>
                  <p className="text-sm font-medium mb-2">😊 Satisfaction</p>
                  <p className="text-2xl font-bold">{reflection.satisfaction_level}/10</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Main Content */}
        <Separator />
        <div>
          <h2 className="text-lg font-semibold mb-3">Reflection</h2>
          <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {reflection.content}
          </p>
        </div>

        {/* Structured Sections */}
        {reflection.gratitude_items.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">💝 Gratitude</h2>
              <ul className="list-disc list-inside space-y-1">
                {reflection.gratitude_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {reflection.wins.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">🎯 Wins</h2>
              <ul className="list-disc list-inside space-y-1">
                {reflection.wins.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {reflection.challenges.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">💪 Challenges</h2>
              <ul className="list-disc list-inside space-y-1">
                {reflection.challenges.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {reflection.learnings.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">💡 Learnings</h2>
              <ul className="list-disc list-inside space-y-1">
                {reflection.learnings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {reflection.tomorrow_focus.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">🌟 Tomorrow's Focus</h2>
              <ul className="list-disc list-inside space-y-1">
                {reflection.tomorrow_focus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Tags */}
        {reflection.tags.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {reflection.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Linked Goals */}
        <Separator />
        <div>
          <h2 className="text-lg font-semibold mb-3">Linked Goals</h2>
          <GoalReflectionLinker reflectionId={id!} reflectionContent={reflection.content} />
        </div>
      </Card>
    </div>
  );
}
