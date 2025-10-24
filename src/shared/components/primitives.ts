/**
 * Primitive Components Module
 * Basic building blocks for the component library
 */

// MARK: - Core Form Primitives

export { Button } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Textarea } from '@/components/ui/textarea';
export { Label } from '@/components/ui/label';
export { Checkbox } from '@/components/ui/checkbox';
export { Switch } from '@/components/ui/switch';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { Slider } from '@/components/ui/slider';

// MARK: - Layout Primitives

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
export { Separator } from '@/components/ui/separator';
export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// MARK: - Display Primitives

export { Badge } from '@/components/ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export { Progress } from '@/components/ui/progress';
export { Skeleton } from '@/components/ui/skeleton';

// MARK: - Interactive Primitives

export { Toggle } from '@/components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

// MARK: - Primitive Component Types

export interface PrimitiveComponentProps {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

export interface VariantProps {
  variant?: string;
  size?: string;
}

export interface StateProps {
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
}

// MARK: - Design System Integration

/**
 * Primitive components are the atomic building blocks of our design system.
 * They should:
 *
 * 1. Be highly reusable across different contexts
 * 2. Follow design token specifications
 * 3. Have minimal business logic
 * 4. Support theming and customization
 * 5. Be fully accessible
 */

export const PRIMITIVE_COMPONENTS = {
  form: ['Button', 'Input', 'Textarea', 'Label', 'Checkbox', 'Switch', 'RadioGroup', 'Slider'],
  layout: ['Card', 'Separator', 'ScrollArea'],
  display: ['Badge', 'Avatar', 'Progress', 'Skeleton'],
  interactive: ['Toggle', 'ToggleGroup', 'Collapsible']
} as const;

/**
 * Get primitive component categories
 */
export function getPrimitiveCategories() {
  return PRIMITIVE_COMPONENTS;
}