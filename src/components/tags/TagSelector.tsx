import { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tags/TagBadge";
import { useTags, useCreateTag } from "@/hooks/useTags";
import { Plus, X } from "lucide-react";
import { TagColorPicker } from "@/components/tags/TagColorPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [newTagCategory, setNewTagCategory] = useState("");

  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();

  const availableTags = tags.filter((tag) => !value.includes(tag.name));
  const selectedTags = tags.filter((tag) => value.includes(tag.name));

  const handleSelect = (tagName: string) => {
    if (!value.includes(tagName)) {
      onChange([...value, tagName]);
    }
    setSearchQuery("");
  };

  const handleRemove = (tagName: string) => {
    onChange(value.filter((t) => t !== tagName));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    await createTag.mutateAsync({
      name: newTagName.trim(),
      color: newTagColor,
      category: newTagCategory.trim() || null,
    });

    handleSelect(newTagName.trim());
    setCreateDialogOpen(false);
    setNewTagName("");
    setNewTagColor("#6366f1");
    setNewTagCategory("");
  };

  const filteredTags = searchQuery
    ? availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : availableTags;

  return (
    <div className="space-y-2">
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color || undefined}
              onRemove={() => handleRemove(tag.name)}
            />
          ))}
        </div>
      )}

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">Add tags...</span>
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    No tags found
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewTagName(searchQuery);
                      setCreateDialogOpen(true);
                      setOpen(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create "{searchQuery}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      handleSelect(tag.name);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: tag.color || "#6366f1" }}
                      />
                      <span>{tag.name}</span>
                      {tag.category && (
                        <span className="text-xs text-muted-foreground">
                          ({tag.category})
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {tag.usage_count || 0}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <TagColorPicker value={newTagColor} onChange={setNewTagColor} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-category">Category (Optional)</Label>
              <Input
                id="tag-category"
                placeholder="e.g., Work, Personal, Health"
                value={newTagCategory}
                onChange={(e) => setNewTagCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
