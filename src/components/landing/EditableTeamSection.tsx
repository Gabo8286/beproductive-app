import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  X,
  Users,
  Sparkles,
  CheckCircle,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TeamContent {
  id?: string;
  title: string;
  subtitle: string;
  leftColumn: {
    title: string;
    content: string;
  };
  rightColumn: {
    title: string;
    content: string;
  };
}

interface EditableTeamSectionProps {
  showEditControls?: boolean;
  className?: string;
}

const DEFAULT_CONTENT: TeamContent = {
  title: "Meet Our Team",
  subtitle: "The minds behind BeProductive",
  leftColumn: {
    title: "Our Mission",
    content: "We believe productivity should feel natural, not forced. Our team combines expertise in psychology, technology, and design to create tools that work with your brain, not against it."
  },
  rightColumn: {
    title: "Our Approach",
    content: "Every feature is built on research-backed productivity science. We test with real users to ensure our solutions actually solve the challenges you face every day."
  }
};

export const EditableTeamSection: React.FC<EditableTeamSectionProps> = ({
  showEditControls = false,
  className = ""
}) => {
  const [content, setContent] = useState<TeamContent>(DEFAULT_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    // Only attempt to fetch content if user is authenticated or if we're showing edit controls
    // For unauthenticated users on public landing page, use default content
    if (profile || showEditControls) {
      fetchContent();
    } else {
      // For unauthenticated users, use default content and skip loading
      setContent(DEFAULT_CONTENT);
      setIsLoading(false);
    }
  }, [profile, showEditControls]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase
        .from('landing_page_content' as any) as any)
        .select('*')
        .eq('section_key', 'team-section')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data?.content) {
        const parsedContent = typeof data.content === 'string'
          ? JSON.parse(data.content)
          : data.content;

        setContent({
          id: data?.id,
          title: data?.title || DEFAULT_CONTENT.title,
          subtitle: data?.subtitle || DEFAULT_CONTENT.subtitle,
          leftColumn: {
            title: parsedContent.left_column?.title || DEFAULT_CONTENT.leftColumn.title,
            content: parsedContent.left_column?.content || DEFAULT_CONTENT.leftColumn.content
          },
          rightColumn: {
            title: parsedContent.right_column?.title || DEFAULT_CONTENT.rightColumn.title,
            content: parsedContent.right_column?.content || DEFAULT_CONTENT.rightColumn.content
          }
        });
      }
    } catch (error) {
      console.error('Error fetching team content:', error);

      // Only show error toast for authenticated users who should have access
      // For public users, silently fall back to default content
      if (profile || showEditControls) {
        toast({
          title: "Error",
          description: "Failed to load team content",
          variant: "destructive"
        });
      }

      // Always fall back to default content on error
      setContent(DEFAULT_CONTENT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const contentData = {
        left_column: {
          title: content.leftColumn.title,
          content: content.leftColumn.content
        },
        right_column: {
          title: content.rightColumn.title,
          content: content.rightColumn.content
        }
      };

      const updateData = {
        title: content.title,
        subtitle: content.subtitle,
        content: contentData,
        updated_at: new Date().toISOString()
      };

      const { error } = content.id
        ? await (supabase
            .from('landing_page_content' as any) as any)
            .update(updateData)
            .eq('id', content.id)
        : await (supabase
            .from('landing_page_content' as any) as any)
            .insert({
              ...updateData,
              section_key: 'team-section',
              column_layout: 'two-column',
              is_active: true
            });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Team section updated successfully",
      });
    } catch (error) {
      console.error('Error saving team content:', error);
      toast({
        title: "Error",
        description: "Failed to save team content",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchContent(); // Reset to original content
  };

  const handleContentChange = (field: string, value: string) => {
    setContent(prev => {
      if (field === 'title' || field === 'subtitle') {
        return { ...prev, [field]: value };
      }

      const [column, subfield] = field.split('.');
      return {
        ...prev,
        [column]: {
          ...prev[column as keyof Pick<TeamContent, 'leftColumn' | 'rightColumn'>],
          [subfield]: value
        }
      };
    });
  };

  if (isLoading) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="text-center space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-br from-secondary/5 to-primary/5 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          {/* Admin Controls */}
          {showEditControls && isAdmin && (
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Team Section
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            {isEditing ? (
              <>
                <Input
                  value={content.title}
                  onChange={(e) => handleContentChange('title', e.target.value)}
                  className="text-center text-3xl font-bold max-w-md mx-auto"
                  placeholder="Section title"
                />
                <Input
                  value={content.subtitle}
                  onChange={(e) => handleContentChange('subtitle', e.target.value)}
                  className="text-center text-lg max-w-lg mx-auto"
                  placeholder="Section subtitle"
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {content.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {content.subtitle}
                </p>
              </>
            )}

            {isEditing && (
              <Badge variant="secondary" className="gap-2">
                <Settings className="h-4 w-4" />
                Editing Mode
              </Badge>
            )}
          </div>

          {/* Two-Column Content */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Left Column */}
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  {isEditing ? (
                    <Input
                      value={content.leftColumn.title}
                      onChange={(e) => handleContentChange('leftColumn.title', e.target.value)}
                      className="text-lg font-semibold"
                      placeholder="Left column title"
                    />
                  ) : (
                    content.leftColumn.title
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={content.leftColumn.content}
                    onChange={(e) => handleContentChange('leftColumn.content', e.target.value)}
                    rows={6}
                    className="resize-none"
                    placeholder="Left column content"
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {content.leftColumn.content}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Right Column */}
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Sparkles className="h-5 w-5" />
                  {isEditing ? (
                    <Input
                      value={content.rightColumn.title}
                      onChange={(e) => handleContentChange('rightColumn.title', e.target.value)}
                      className="text-lg font-semibold"
                      placeholder="Right column title"
                    />
                  ) : (
                    content.rightColumn.title
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={content.rightColumn.content}
                    onChange={(e) => handleContentChange('rightColumn.content', e.target.value)}
                    rows={6}
                    className="resize-none"
                    placeholder="Right column content"
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {content.rightColumn.content}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Success Indicators */}
          {!isEditing && (
            <div className="mt-12 text-center">
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Research-backed approach</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>10+ years combined experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>User-tested solutions</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};