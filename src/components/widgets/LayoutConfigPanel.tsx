import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWidgets } from "@/contexts/WidgetContext";
import { Layout, RotateCcw, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LayoutConfigPanel() {
  const { widgets, updateWidget, resetLayout } = useWidgets();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleWidget = (widgetId: string, visible: boolean) => {
    updateWidget(widgetId, { visible });
  };

  const handleSizeChange = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    updateWidget(widgetId, { size });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="apple-button">
          <Settings className="h-4 w-4 mr-2" />
          Layout
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Widget Visibility */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Widget Visibility</h4>
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label htmlFor={`widget-${widget.id}`} className="text-sm">
                    {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {widget.size}
                  </Badge>
                </div>
                <Switch
                  id={`widget-${widget.id}`}
                  checked={widget.visible}
                  onCheckedChange={(checked) => handleToggleWidget(widget.id, checked)}
                />
              </div>
            ))}
          </div>

          {/* Widget Sizes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Widget Sizes</h4>
            {widgets.filter(w => w.visible).map((widget) => (
              <div key={widget.id} className="space-y-2">
                <Label className="text-sm">
                  {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
                </Label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={widget.size === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSizeChange(widget.id, size)}
                      className="flex-1 text-xs apple-button"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reset Layout */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetLayout}
              className="w-full apple-button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
