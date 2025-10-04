import { useState, useEffect, useRef } from "react";
import {
  Save,
  X,
  Mic,
  MicOff,
  Clock,
  Link2,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Note, NoteType, CreateNoteData, UpdateNoteData } from "@/types/notes";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NoteEditorProps {
  note?: Note | null;
  onSave: (noteData: CreateNoteData | UpdateNoteData) => Promise<void>;
  onClose: () => void;
  onDelete?: (noteId: string) => Promise<void>;
  isLoading?: boolean;
}

export const NoteEditor = ({
  note,
  onSave,
  onClose,
  onDelete,
  isLoading = false,
}: NoteEditorProps) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [noteType, setNoteType] = useState<NoteType>(
    note?.note_type || "fleeting",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Track changes
  useEffect(() => {
    const hasChanges =
      title !== (note?.title || "") ||
      content !== (note?.content || "") ||
      noteType !== (note?.note_type || "fleeting");
    setHasUnsavedChanges(hasChanges);
  }, [title, content, noteType, note]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && note) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timer);
    }
  }, [title, content, noteType, hasUnsavedChanges]);

  const generateId = () => {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0")
    );
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Cannot save empty note",
        description: "Please add a title or content before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        note_type: noteType,
      };

      await onSave(noteData);
      setHasUnsavedChanges(false);

      toast({
        title: "Note saved",
        description: note
          ? "Your changes have been saved."
          : "New note has been created.",
      });
    } catch (error) {
      toast({
        title: "Failed to save note",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !onDelete) return;

    if (
      confirm(
        "Are you sure you want to delete this note? This action cannot be undone.",
      )
    ) {
      try {
        await onDelete(note.id);
        toast({
          title: "Note deleted",
          description: "The note has been permanently deleted.",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Failed to delete note",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const insertLinkSyntax = () => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const linkText = selectedText || "Note Title";
    const newContent =
      content.substring(0, start) + `[[${linkText}]]` + content.substring(end);

    setContent(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition =
        start + (selectedText ? `[[${selectedText}]]`.length : 2);
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
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
        return "Atomic, evergreen knowledge";
      case "literature":
        return "Notes from books, articles, etc.";
      case "fleeting":
        return "Quick thoughts and ideas";
      default:
        return "";
    }
  };

  // Extract potential links from content
  const extractLinks = (text: string) => {
    const linkRegex = /\[\[(.*?)\]\]/g;
    const matches = [];
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const detectedLinks = extractLinks(content);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={cn(isRecording && "text-red-500")}
              title="Voice input (coming soon)"
              disabled
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || isLoading || (!title.trim() && !content.trim())
              }
              className="apple-button gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{note?.id || generateId()}</span>
          </div>

          <Select
            value={noteType}
            onValueChange={(value) => setNoteType(value as NoteType)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fleeting">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getTypeColor("fleeting"),
                    )}
                  />
                  Fleeting
                </div>
              </SelectItem>
              <SelectItem value="literature">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getTypeColor("literature"),
                    )}
                  />
                  Literature
                </div>
              </SelectItem>
              <SelectItem value="permanent">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getTypeColor("permanent"),
                    )}
                  />
                  Permanent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            {getTypeDescription(noteType)}
          </p>
        </div>

        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={insertLinkSyntax}
                className="gap-2"
              >
                <Link2 className="w-4 h-4" />
                Insert Link
              </Button>
              <span className="text-xs text-muted-foreground">
                Use [[Note Title]] to link to other notes
              </span>
            </div>
          </div>

          <Textarea
            ref={contentRef}
            placeholder="Start writing your note...

Use [[Note Title]] to link to other notes.

Zettelkasten Tips:
• Keep notes atomic (one idea per note)
• Write in your own words
• Connect ideas through links
• Use permanent notes for evergreen knowledge"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none border-none focus-visible:ring-0 p-4 min-h-[400px]"
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-card/30 p-4 space-y-4">
          {/* Note Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Note Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge className={cn("text-xs", getTypeColor(noteType))}>
                  {noteType}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Words</span>
                <span>
                  {
                    content.split(/\s+/).filter((word) => word.length > 0)
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Characters</span>
                <span>{content.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Detected Links */}
          {detectedLinks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Detected Links ({detectedLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detectedLinks.map((link, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-muted/50 rounded border text-primary"
                    >
                      {link}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {note && onDelete && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full"
                >
                  Delete Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
