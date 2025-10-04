import { useState, useMemo } from "react";
import { FileText, Clock, Link2, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Note, NoteType } from "@/types/notes";
import { cn } from "@/lib/utils";

interface NotesGridProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onNewNote: () => void;
  isLoading?: boolean;
}

export const NotesGrid = ({
  notes,
  onNoteClick,
  onNewNote,
  isLoading = false,
}: NotesGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<NoteType | "all">("all");

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || note.note_type === filterType;

      return matchesSearch && matchesType;
    });
  }, [notes, searchQuery, filterType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getTypeDescription = (type: NoteType) => {
    switch (type) {
      case "permanent":
        return "Permanent knowledge";
      case "literature":
        return "Literature notes";
      case "fleeting":
        return "Fleeting thoughts";
      default:
        return "";
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  if (notes.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="journey-card max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-subtle flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Start Your Knowledge Journey
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first note and begin building your personal knowledge
              base using the Zettelkasten method.
            </p>
            <Button onClick={onNewNote} className="apple-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Note
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">
            Knowledge Notes
          </h1>
          <p className="text-muted-foreground">
            Organize your thoughts with the Zettelkasten method
          </p>
        </div>
        <Button onClick={onNewNote} className="apple-button">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as NoteType | "all")}
        >
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="fleeting">Fleeting</SelectItem>
            <SelectItem value="literature">Literature</SelectItem>
            <SelectItem value="permanent">Permanent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md apple-button",
                "journey-card group",
              )}
              onClick={() => onNoteClick(note)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {note.title || "Untitled Note"}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      getTypeColor(note.note_type),
                    )}
                    title={getTypeDescription(note.note_type)}
                  >
                    {note.note_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {truncateContent(note.content)}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                  {note.content.includes("[[") && (
                    <div
                      className="flex items-center gap-1"
                      title="Contains links"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Linked</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && !isLoading && searchQuery && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};
