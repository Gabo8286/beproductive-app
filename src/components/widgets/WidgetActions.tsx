import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WidgetActionsProps {
  onRefresh?: () => void;
  onConfigure?: () => void;
  onRemove?: () => void;
  isRefreshing?: boolean;
}

export function WidgetActions({ 
  onRefresh, 
  onConfigure, 
  onRemove,
  isRefreshing = false 
}: WidgetActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 w-8 p-0 apple-button hover:bg-primary/10"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 apple-button hover:bg-primary/10"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-effect">
          {onConfigure && (
            <DropdownMenuItem onClick={onConfigure}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </DropdownMenuItem>
          )}
          {onRemove && (
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              Remove Widget
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
