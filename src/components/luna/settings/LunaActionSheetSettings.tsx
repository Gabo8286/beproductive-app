import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  Circle,
  Smartphone,
  Layers,
  RotateCcw,
  Menu,
  Grid3X3,
  Navigation,
  List,
  MoreHorizontal,
  Zap,
  Hand,
  Eye,
  Accessibility
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionSheetType, ActionSheetConfig } from '@/components/luna/actionsheets/types';
import { useLuna } from '@/components/luna/context/LunaContext';

interface LunaActionSheetSettingsProps {
  className?: string;
  onClose?: () => void;
  currentType?: ActionSheetType;
  onTypeChange?: (type: ActionSheetType) => void;
}

// Configuration for each action sheet type
const ACTION_SHEET_CONFIGS: Record<ActionSheetType, ActionSheetConfig & {
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
  pros: string[];
  cons: string[];
}> = {
  'classic-ios': {
    type: 'classic-ios',
    label: 'Classic iOS',
    description: 'Traditional iOS action sheet with slide-up animation',
    bestFor: ['iOS users', 'Simple actions', 'Familiar interface'],
    gestureSupport: ['tap'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: Smartphone,
    preview: 'Bottom sheet that slides up from the bottom edge',
    pros: ['Familiar to iOS users', 'Clean and simple', 'Great accessibility'],
    cons: ['Limited visual hierarchy', 'Less space for complex actions']
  },
  'floating-panel': {
    type: 'floating-panel',
    label: 'Floating Panel',
    description: 'Modern floating panel with contextual positioning',
    bestFor: ['Modern design', 'Contextual actions', 'Visual appeal'],
    gestureSupport: ['tap', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: Layers,
    preview: 'Card-style panel that appears near the Luna button',
    pros: ['Contextual positioning', 'Modern appearance', 'Good for quick actions'],
    cons: ['May feel disconnected', 'Less space than full sheet']
  },
  'radial-menu': {
    type: 'radial-menu',
    label: 'Radial Menu',
    description: 'Circular menu with actions arranged around Luna',
    bestFor: ['Quick access', 'Gesture-heavy users', 'Creative workflows'],
    gestureSupport: ['tap', 'drag', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: false,
      reducedMotion: false
    },
    icon: RotateCcw,
    preview: 'Actions fan out in a circle around the Luna button',
    pros: ['Fast gesture access', 'Visually distinctive', 'Space efficient'],
    cons: ['Learning curve', 'Less accessible', 'Limited text space']
  },
  'contextual-sheet': {
    type: 'contextual-sheet',
    label: 'Contextual Cards',
    description: 'Smart cards that adapt based on current context',
    bestFor: ['Intelligent assistance', 'Context-aware actions', 'Personalization'],
    gestureSupport: ['tap', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: Zap,
    preview: 'Cards with relevant actions based on what you\'re doing',
    pros: ['Context-aware', 'Intelligent suggestions', 'Reduces decision fatigue'],
    cons: ['May feel unpredictable', 'Requires learning user patterns']
  },
  'expandable-tab': {
    type: 'expandable-tab',
    label: 'Expandable Tab',
    description: 'Tab that expands to reveal organized action categories',
    bestFor: ['Organized workflows', 'Many actions', 'Category-based thinking'],
    gestureSupport: ['tap'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: Menu,
    preview: 'Tab expands to show categorized sections of actions',
    pros: ['Well organized', 'Scales with many actions', 'Clear hierarchy'],
    cons: ['Extra step to access actions', 'May feel complex']
  },
  'popup-grid': {
    type: 'popup-grid',
    label: 'Grid Layout',
    description: 'Grid of action tiles for visual organization',
    bestFor: ['Visual users', 'Many actions', 'Icon-heavy interfaces'],
    gestureSupport: ['tap'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: Grid3X3,
    preview: 'Grid of tiles showing all available actions at once',
    pros: ['Visual overview', 'Good for many actions', 'Clear action icons'],
    cons: ['Can feel overwhelming', 'Requires good icons', 'More screen space']
  },
  'multi-level': {
    type: 'multi-level',
    label: 'Multi-Level Menu',
    description: 'Hierarchical menu with expandable sub-sections',
    bestFor: ['Complex workflows', 'Power users', 'Detailed organization'],
    gestureSupport: ['tap'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: List,
    preview: 'Menu with expandable sections and sub-categories',
    pros: ['Handles complexity well', 'Very organized', 'Scalable structure'],
    cons: ['Can be overwhelming', 'Requires navigation', 'Learning curve']
  },
  'side-strip': {
    type: 'side-strip',
    label: 'Side Strip',
    description: 'Vertical strip of actions along the screen edge',
    bestFor: ['Quick access', 'Minimal interfaces', 'Gesture navigation'],
    gestureSupport: ['tap', 'swipe'],
    accessibility: {
      screenReader: true,
      keyboardNav: true,
      reducedMotion: true
    },
    icon: MoreHorizontal,
    preview: 'Vertical strip of actions that slides in from the side',
    pros: ['Always accessible', 'Minimal visual impact', 'Quick access'],
    cons: ['Limited space', 'May interfere with content', 'Less discoverable']
  }
};

export const LunaActionSheetSettings: React.FC<LunaActionSheetSettingsProps> = ({
  className,
  onClose,
  currentType,
  onTypeChange
}) => {
  const { actionSheetType, setActionSheetType } = useLuna();
  const effectiveCurrentType = currentType ?? actionSheetType;
  const [selectedType, setSelectedType] = useState<ActionSheetType>(effectiveCurrentType);
  const [previewType, setPreviewType] = useState<ActionSheetType | null>(null);

  const handleSelectionChange = (type: ActionSheetType) => {
    setSelectedType(type);
    if (onTypeChange) {
      onTypeChange(type);
    } else {
      setActionSheetType(type);
    }
  };

  const configs = Object.values(ACTION_SHEET_CONFIGS);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Hand className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Luna Interaction Style</h2>
            <p className="text-sm text-muted-foreground">
              Choose how Luna's quick actions appear when you tap the Luna button
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Current Selection Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Currently Selected</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {React.createElement(ACTION_SHEET_CONFIGS[selectedType].icon, {
              className: "h-5 w-5 text-primary"
            })}
            <div>
              <p className="font-medium">{ACTION_SHEET_CONFIGS[selectedType].label}</p>
              <p className="text-sm text-muted-foreground">
                {ACTION_SHEET_CONFIGS[selectedType].description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            ACTION_SHEET_CONFIGS['classic-ios'],
            ACTION_SHEET_CONFIGS['floating-panel'],
            ACTION_SHEET_CONFIGS['expandable-tab']
          ].map((config) => {
            const IconComponent = config.icon;
            const isSelected = selectedType === config.type;

            return (
              <Card
                key={config.type}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected && "ring-2 ring-primary border-primary"
                )}
                onClick={() => handleSelectionChange(config.type)}
              >
                <CardContent className="p-4 text-center">
                  <div className={cn(
                    "p-3 rounded-lg mb-3 mx-auto w-fit",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h4 className="font-medium mb-1">{config.label}</h4>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All Options Grid */}
      <div>
        <h3 className="text-lg font-medium mb-4">All Styles</h3>
        <ScrollArea className="h-[600px]">
          <div className="grid gap-4">
            {configs.map((config) => {
              const IconComponent = config.icon;
              const isSelected = selectedType === config.type;
              const isPreview = previewType === config.type;

              return (
                <Card
                  key={config.type}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-primary border-primary",
                    isPreview && "shadow-lg transform scale-[1.02]"
                  )}
                  onClick={() => handleSelectionChange(config.type)}
                  onMouseEnter={() => setPreviewType(config.type)}
                  onMouseLeave={() => setPreviewType(null)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{config.label}</CardTitle>
                          <CardDescription className="text-sm">
                            {config.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Preview Description */}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          📱 {config.preview}
                        </p>
                      </div>

                      {/* Best For */}
                      <div>
                        <p className="text-sm font-medium mb-2">Best for:</p>
                        <div className="flex flex-wrap gap-1">
                          {config.bestFor.map((item) => (
                            <Badge key={item} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">✓ Pros</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {config.pros.map((pro, index) => (
                              <li key={index}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-600 mb-1">⚠ Considerations</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {config.cons.map((con, index) => (
                              <li key={index}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Accessibility & Features */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className={config.accessibility.screenReader ? "text-green-600" : "text-orange-600"}>
                            {config.accessibility.screenReader ? "Screen reader" : "Limited SR"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Accessibility className="h-3 w-3" />
                          <span className={config.accessibility.keyboardNav ? "text-green-600" : "text-orange-600"}>
                            {config.accessibility.keyboardNav ? "Keyboard nav" : "Touch only"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hand className="h-3 w-3" />
                          <span className="text-muted-foreground">
                            {config.gestureSupport.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Changes are saved automatically
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Reset to default
              handleSelectionChange('floating-panel');
            }}
          >
            Reset to Default
          </Button>
          {onClose && (
            <Button onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};