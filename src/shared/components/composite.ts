/**
 * Composite Components Module
 * Complex UI patterns built from primitive components
 */

// MARK: - Navigation Composites

export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// MARK: - Form Composites

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField
} from '@/components/ui/form';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';

// MARK: - Overlay Composites

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
export {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

// MARK: - Data Display Composites

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from '@/components/ui/table';
export { Calendar } from '@/components/ui/calendar';

// MARK: - Menu Composites

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
} from '@/components/ui/dropdown-menu';

// MARK: - Feedback Composites

export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { toast, useToast } from '@/components/ui/toast';
export { Toaster } from '@/components/ui/toaster';

// MARK: - Enhanced Application Composites

export { EnhancedSkeleton } from '@/components/ui/EnhancedSkeleton';
export { ThemeToggle } from '@/components/ui/ThemeToggle';
export { LanguageSwitcher } from '@/components/ui/language-switcher';

// MARK: - Composite Component Types

export interface CompositeComponentProps {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
  onValueChange?: (value: any) => void;
}

export interface TriggerComponentProps {
  asChild?: boolean;
  disabled?: boolean;
}

export interface ContentComponentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

// MARK: - Composite Component Patterns

/**
 * Common patterns for composite components:
 *
 * 1. **Compound Components** - Components that work together
 *    - Dialog + DialogTrigger + DialogContent
 *    - Table + TableHeader + TableBody + TableRow
 *
 * 2. **Render Props** - Components that accept render functions
 *    - Form field components with custom rendering
 *    - Command components with custom item rendering
 *
 * 3. **Controlled/Uncontrolled** - Components with dual modes
 *    - Select with value prop (controlled) or defaultValue (uncontrolled)
 *    - Form fields that can be managed externally or internally
 *
 * 4. **Portal Components** - Components that render outside normal flow
 *    - Dialog, Sheet, Popover, Tooltip
 *    - Positioned absolutely or in portal containers
 */

export const COMPOSITE_CATEGORIES = {
  navigation: ['Tabs', 'Breadcrumb'],
  forms: ['Form', 'Select', 'Command'],
  overlays: ['Dialog', 'Sheet', 'Popover', 'Tooltip', 'AlertDialog'],
  dataDisplay: ['Table', 'Calendar'],
  menus: ['DropdownMenu'],
  feedback: ['Alert', 'Toast'],
  enhanced: ['EnhancedSkeleton', 'ThemeToggle', 'LanguageSwitcher']
} as const;

/**
 * Accessibility requirements for composite components
 */
export const COMPOSITE_A11Y_REQUIREMENTS = {
  navigation: [
    'Keyboard navigation support',
    'Focus management',
    'ARIA labels for screen readers'
  ],
  forms: [
    'Proper form labeling',
    'Error state announcements',
    'Validation feedback'
  ],
  overlays: [
    'Focus trapping',
    'Escape key handling',
    'ARIA dialog roles'
  ],
  dataDisplay: [
    'Table headers association',
    'Sortable column announcements',
    'Row/cell navigation'
  ],
  menus: [
    'Arrow key navigation',
    'Submenu handling',
    'Selection announcements'
  ],
  feedback: [
    'Screen reader announcements',
    'Auto-dismiss timing',
    'Action button accessibility'
  ]
} as const;

/**
 * Get composite component information
 */
export function getCompositeInfo() {
  return {
    categories: COMPOSITE_CATEGORIES,
    accessibilityRequirements: COMPOSITE_A11Y_REQUIREMENTS,
    totalComponents: Object.values(COMPOSITE_CATEGORIES).flat().length
  };
}