import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Minimize2, Maximize2 } from "lucide-react";
import ConversationalInterface from "@/components/ai/ConversationalInterface";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

interface AIChatWidgetProps {
  className?: string;
  defaultExpanded?: boolean;
  onTaskCreated?: (task: any) => void;
  onInsightGenerated?: (insight: any) => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  className,
  defaultExpanded = false,
  onTaskCreated,
  onInsightGenerated,
}) => {
  const { t } = useI18n("ai");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!isExpanded) {
    return (
      <Card className={cn("w-80 h-16 cursor-pointer", className)}>
        <CardContent
          className="flex items-center justify-between p-4"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {t("aiAssistant", "AI Assistant")}
            </span>
          </div>
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-80 h-96 flex flex-col", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("aiAssistant", "AI Assistant")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsExpanded(false)}
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ConversationalInterface
          onTaskCreated={onTaskCreated}
          onInsightGenerated={onInsightGenerated}
        />
      </CardContent>
    </Card>
  );
};

export default AIChatWidget;
