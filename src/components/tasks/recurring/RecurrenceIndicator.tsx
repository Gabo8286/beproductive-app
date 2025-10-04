import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RecurrencePattern } from "@/hooks/useRecurringTasks";

interface RecurrenceIndicatorProps {
  pattern: RecurrencePattern;
  size?: "sm" | "md" | "lg";
}

export function RecurrenceIndicator({
  pattern,
  size = "md",
}: RecurrenceIndicatorProps) {
  const getFrequencyLabel = () => {
    const { frequency, interval } = pattern;

    if (interval === 1) {
      return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }

    return `Every ${interval} ${frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : frequency === "monthly" ? "months" : "years"}`;
  };

  const getDetailedDescription = () => {
    const parts = [getFrequencyLabel()];

    if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      parts.push(`on ${pattern.daysOfWeek.map((d) => dayNames[d]).join(", ")}`);
    }

    if (pattern.dayOfMonth) {
      parts.push(`on day ${pattern.dayOfMonth}`);
    }

    if (pattern.endDate) {
      parts.push(`until ${new Date(pattern.endDate).toLocaleDateString()}`);
    } else if (pattern.maxOccurrences) {
      parts.push(`for ${pattern.maxOccurrences} times`);
    }

    return parts.join(" ");
  };

  const iconSize =
    size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-1">
            <Repeat className={iconSize} />
            <span className="text-xs">{getFrequencyLabel()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getDetailedDescription()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
