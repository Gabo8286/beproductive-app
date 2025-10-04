import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Command, Keyboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: "navigation" | "actions" | "lists" | "accessibility";
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    keys: ["Cmd/Ctrl", "Shift", "D"],
    description: "Navigate to Dashboard",
    category: "navigation",
  },
  {
    keys: ["Cmd/Ctrl", "Shift", "G"],
    description: "Navigate to Goals",
    category: "navigation",
  },
  {
    keys: ["Cmd/Ctrl", "Shift", "T"],
    description: "Navigate to Quick To-Dos",
    category: "navigation",
  },
  {
    keys: ["Cmd/Ctrl", "Shift", "K"],
    description: "Navigate to Tasks",
    category: "navigation",
  },
  {
    keys: ["Cmd/Ctrl", "Shift", "H"],
    description: "Navigate to Habits",
    category: "navigation",
  },
  {
    keys: ["Cmd/Ctrl", "Shift", "R"],
    description: "Navigate to Reflections",
    category: "navigation",
  },

  // Universal Actions
  { keys: ["Tab"], description: "Move to next element", category: "actions" },
  {
    keys: ["Shift", "Tab"],
    description: "Move to previous element",
    category: "actions",
  },
  {
    keys: ["Enter"],
    description: "Activate button or link",
    category: "actions",
  },
  {
    keys: ["Space"],
    description: "Activate button or checkbox",
    category: "actions",
  },
  { keys: ["Escape"], description: "Close modal or menu", category: "actions" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "actions" },

  // List Navigation
  { keys: ["↑"], description: "Move to previous item", category: "lists" },
  { keys: ["↓"], description: "Move to next item", category: "lists" },
  {
    keys: ["←"],
    description: "Move to previous item (horizontal)",
    category: "lists",
  },
  {
    keys: ["→"],
    description: "Move to next item (horizontal)",
    category: "lists",
  },
  { keys: ["Home"], description: "Jump to first item", category: "lists" },
  { keys: ["End"], description: "Jump to last item", category: "lists" },

  // Drag and Drop
  {
    keys: ["Space/Enter"],
    description: "Grab or drop item",
    category: "actions",
  },
  {
    keys: ["Arrow Keys"],
    description: "Move grabbed item",
    category: "actions",
  },
  {
    keys: ["Escape"],
    description: "Cancel drag operation",
    category: "actions",
  },

  // Accessibility
  {
    keys: ["Alt", "0"],
    description: "Skip to main content",
    category: "accessibility",
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    const matchesSearch =
      search === "" ||
      shortcut.description.toLowerCase().includes(search.toLowerCase()) ||
      shortcut.keys.some((key) =>
        key.toLowerCase().includes(search.toLowerCase()),
      );

    const matchesCategory =
      activeTab === "all" || shortcut.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "navigation":
        return "Navigation";
      case "actions":
        return "Actions";
      case "lists":
        return "Lists";
      case "accessibility":
        return "Accessibility";
      default:
        return "All";
    }
  };

  const categoryColors = {
    navigation: "bg-primary/10 text-primary border-primary/20",
    actions: "bg-secondary/10 text-secondary border-secondary/20",
    lists: "bg-success/10 text-success border-success/20",
    accessibility: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[80vh]"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Boost your productivity with these keyboard shortcuts. Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              ?
            </kbd>{" "}
            anytime to view this dialog.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search keyboard shortcuts"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="accessibility">A11y</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredShortcuts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No shortcuts found matching "{search}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{shortcut.description}</p>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${categoryColors[shortcut.category]}`}
                        >
                          {getCategoryLabel(shortcut.category)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div
                            key={keyIndex}
                            className="flex items-center gap-1"
                          >
                            <kbd className="px-3 py-1.5 text-sm font-semibold bg-muted border border-border rounded shadow-sm min-w-[2.5rem] text-center">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-sm">
                                +
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg text-sm">
          <Command className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <strong>Tip:</strong> On Mac, use{" "}
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Cmd</kbd>{" "}
            instead of{" "}
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd>.
            These shortcuts won't interfere with screen reader commands.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
