import { useState } from "react";
import { Notebook, Plus, Clock, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Note, NoteType } from "@/types/notes";
import { useNotes } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface NotesWidgetProps {
  className?: string;
}

export const NotesWidget = ({ className }: NotesWidgetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { notes, isLoading } = useNotes();
  const navigate = useNavigate();

  // Get recent notes (last 5)
  const recentNotes = notes.slice(0, 5);

  // Filter notes based on search
  const filteredNotes = searchQuery
    ? notes
        .filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 5)
    : recentNotes;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: NoteType) => {
    switch (type) {
      case "permanent":
        return "bg-success/10 text-success border-success/20";
      case "literature":
        return "bg-primary/10 text-primary border-primary/20";
      case "fleeting":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const handleNoteClick = (note: Note) => {
    navigate(`/notes?note=${note.id}&edit=true`);
  };

  const handleCreateNote = () => {
    navigate("/notes?edit=true");
  };

  const handleViewAll = () => {
    navigate("/notes");
  };

  return (
    <Card className={cn("journey-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Notebook className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Knowledge Notes</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNote}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              View All
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-6">
            {searchQuery ? (
              <div>
                <Notebook className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notes found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div>
                <Notebook className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No notes yet
                </p>
                <Button
                  size="sm"
                  onClick={handleCreateNote}
                  className="apple-button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Note
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="group cursor-pointer p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-all duration-200"
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title || "Untitled Note"}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      getTypeColor(note.note_type),
                    )}
                  >
                    {note.note_type}
                  </Badge>
                </div>

                {note.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {truncateContent(note.content)}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                  {note.content.includes("[[") && (
                    <span className="text-primary">Linked</span>
                  )}
                </div>
              </div>
            ))}

            {notes.length > 5 && !searchQuery && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAll}
                  className="w-full text-xs"
                >
                  View all {notes.length} notes
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
