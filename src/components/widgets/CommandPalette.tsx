import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Target,
  CheckSquare,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: "Create" | "Navigate" | "Search";
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: "create-task",
      title: "Create Task",
      description: "Add a new task to your list",
      icon: Plus,
      action: () => {
        // Navigate to task creation
        window.location.href = "/tasks?create=true";
      },
      category: "Create",
      keywords: ["task", "todo", "create", "add", "new"],
    },
    {
      id: "create-goal",
      title: "Create Goal",
      description: "Set a new goal to achieve",
      icon: Target,
      action: () => {
        window.location.href = "/goals?create=true";
      },
      category: "Create",
      keywords: ["goal", "objective", "create", "add", "new", "target"],
    },
    {
      id: "nav-tasks",
      title: "Go to Tasks",
      description: "View all your tasks",
      icon: CheckSquare,
      action: () => {
        window.location.href = "/tasks";
      },
      category: "Navigate",
      keywords: ["tasks", "todo", "list", "navigate", "go"],
    },
    {
      id: "nav-goals",
      title: "Go to Goals",
      description: "View your goals and progress",
      icon: Target,
      action: () => {
        window.location.href = "/goals";
      },
      category: "Navigate",
      keywords: ["goals", "objectives", "progress", "navigate", "go"],
    },
    {
      id: "nav-time",
      title: "Go to Time Tracking",
      description: "Track your time and productivity",
      icon: Clock,
      action: () => {
        window.location.href = "/time-tracking";
      },
      category: "Navigate",
      keywords: ["time", "tracking", "productivity", "navigate", "go"],
    },
    {
      id: "nav-notes",
      title: "Go to Notes",
      description: "View and create notes",
      icon: FileText,
      action: () => {
        window.location.href = "/notes";
      },
      category: "Navigate",
      keywords: ["notes", "ideas", "writing", "navigate", "go"],
    },
  ];

  const filteredCommands = commands.filter((command) => {
    if (!query) return true;

    const searchTerm = query.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description?.toLowerCase().includes(searchTerm) ||
      command.keywords.some((keyword) => keyword.includes(searchTerm))
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onOpenChange(false);
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, onOpenChange],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onOpenChange]);

  const categories = ["Create", "Navigate", "Search"] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            autoFocus
          />
          <Badge variant="outline" className="ml-2 text-xs">
            ⌘K
          </Badge>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {categories.map((category) => {
                const categoryCommands = filteredCommands.filter(
                  (cmd) => cmd.category === category,
                );
                if (categoryCommands.length === 0) return null;

                return (
                  <div key={category} className="mb-3">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const IconComponent = command.icon;

                      return (
                        <button
                          key={command.id}
                          onClick={() => {
                            command.action();
                            onOpenChange(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm",
                            "flex items-center gap-3 transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            globalIndex === selectedIndex &&
                              "bg-accent text-accent-foreground",
                          )}
                        >
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.title}</div>
                            {command.description && (
                              <div className="text-xs text-muted-foreground">
                                {command.description}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Use ↑↓ to navigate, ↵ to select, ESC to close
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for global command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};
