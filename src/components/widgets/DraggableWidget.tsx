import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  config?: Record<string, any>;
}

interface DraggableWidgetProps {
  widget: Widget;
  index: number;
  onRemove: () => void;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  index,
  onRemove,
}) => {
  const [isHovering, setIsHovering] = React.useState(false);
  const { component: WidgetComponent } = widget;

  return (
    <Draggable draggableId={widget.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={cn(
            "relative group",
            snapshot.isDragging && "rotate-3 shadow-2xl ring-2 ring-primary/20",
          )}
        >
          <Card
            className={cn(
              "h-full transition-all duration-200",
              "hover:shadow-lg hover:border-primary/20",
              snapshot.isDragging && "shadow-2xl",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{widget.title}</h3>
                <div className="flex items-center gap-1">
                  {isHovering && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          // Navigate to full widget view
                          window.location.href = `/${widget.type}`;
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={onRemove}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <WidgetComponent {...widget.config} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Draggable>
  );
};
