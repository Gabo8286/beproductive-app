import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Plus,
  Save,
  Copy,
  Trash2,
  Edit3,
  MoreHorizontal,
  Calendar,
  Target,
  Brain,
  Coffee,
  Briefcase,
  BookOpen,
  Dumbbell,
  Home,
  Users,
  Settings,
  BarChart3,
  Layout,
  Timer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Zap,
  AlertCircle,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  format,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  addMinutes,
  differenceInMinutes,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

type BlockType = 'focus' | 'meeting' | 'break' | 'admin' | 'learning' | 'exercise' | 'personal' | 'travel';
type BlockStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  type: BlockType;
  startTime: Date;
  endTime: Date;
  status: BlockStatus;
  color?: string;
  taskId?: string;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  notes?: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
}

interface TimeBlockTemplate {
  id: string;
  name: string;
  description: string;
  blocks: Omit<TimeBlock, 'id' | 'startTime' | 'endTime'>[];
  tags: string[];
}

const BLOCK_TYPES: Record<BlockType, { label: string; color: string; icon: any }> = {
  focus: { label: 'Focus Work', color: 'bg-red-500', icon: Target },
  meeting: { label: 'Meeting', color: 'bg-blue-500', icon: Users },
  break: { label: 'Break', color: 'bg-green-500', icon: Coffee },
  admin: { label: 'Admin Tasks', color: 'bg-gray-500', icon: Briefcase },
  learning: { label: 'Learning', color: 'bg-purple-500', icon: BookOpen },
  exercise: { label: 'Exercise', color: 'bg-orange-500', icon: Dumbbell },
  personal: { label: 'Personal', color: 'bg-pink-500', icon: Home },
  travel: { label: 'Travel', color: 'bg-yellow-500', icon: Clock },
};

const PRIORITY_COLORS = {
  low: 'border-green-300',
  medium: 'border-yellow-300',
  high: 'border-red-300',
};

// Sample templates
const SAMPLE_TEMPLATES: TimeBlockTemplate[] = [
  {
    id: '1',
    name: 'Deep Work Day',
    description: 'Focused day for important project work',
    blocks: [
      {
        title: 'Morning Focus Block',
        type: 'focus',
        priority: 'high',
        description: 'Most important work of the day',
        status: 'planned',
      },
      {
        title: 'Mid-morning Break',
        type: 'break',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Second Focus Block',
        type: 'focus',
        priority: 'high',
        status: 'planned',
      },
      {
        title: 'Lunch Break',
        type: 'break',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Admin & Email',
        type: 'admin',
        priority: 'medium',
        status: 'planned',
      },
    ],
    tags: ['productivity', 'focus'],
  },
  {
    id: '2',
    name: 'Meeting-Heavy Day',
    description: 'Schedule for days with many meetings',
    blocks: [
      {
        title: 'Quick Planning',
        type: 'admin',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Team Standup',
        type: 'meeting',
        priority: 'high',
        status: 'planned',
      },
      {
        title: 'Client Meeting',
        type: 'meeting',
        priority: 'high',
        status: 'planned',
      },
      {
        title: 'Lunch Break',
        type: 'break',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Project Review',
        type: 'meeting',
        priority: 'medium',
        status: 'planned',
      },
    ],
    tags: ['meetings', 'collaboration'],
  },
  {
    id: '3',
    name: 'Balanced Day',
    description: 'Mix of work, learning, and personal time',
    blocks: [
      {
        title: 'Exercise',
        type: 'exercise',
        priority: 'high',
        status: 'planned',
      },
      {
        title: 'Focus Work',
        type: 'focus',
        priority: 'high',
        status: 'planned',
      },
      {
        title: 'Learning Session',
        type: 'learning',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Lunch Break',
        type: 'break',
        priority: 'medium',
        status: 'planned',
      },
      {
        title: 'Personal Time',
        type: 'personal',
        priority: 'medium',
        status: 'planned',
      },
    ],
    tags: ['balanced', 'wellness'],
  },
];

export default function TimeBlocking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [templates, setTemplates] = useState<TimeBlockTemplate[]>(SAMPLE_TEMPLATES);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<TimeBlock | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<BlockType | 'all'>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Time slots (every 30 minutes from 6 AM to 11 PM)
  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const hour = Math.floor((i * 30 + 6 * 60) / 60);
    const minute = (i * 30 + 6 * 60) % 60;
    return setMinutes(setHours(new Date(), hour), minute);
  });

  // Load saved data
  useEffect(() => {
    const savedBlocks = localStorage.getItem('time_blocks');
    const savedTemplates = localStorage.getItem('time_block_templates');

    if (savedBlocks) {
      const parsedBlocks = JSON.parse(savedBlocks).map((block: any) => ({
        ...block,
        startTime: new Date(block.startTime),
        endTime: new Date(block.endTime),
        actualStartTime: block.actualStartTime ? new Date(block.actualStartTime) : undefined,
        actualEndTime: block.actualEndTime ? new Date(block.actualEndTime) : undefined,
      }));
      setTimeBlocks(parsedBlocks);
    }

    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save data when changed
  useEffect(() => {
    localStorage.setItem('time_blocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  useEffect(() => {
    localStorage.setItem('time_block_templates', JSON.stringify(templates));
  }, [templates]);

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getBlocksForDate = (date: Date): TimeBlock[] => {
    return timeBlocks.filter(block => isSameDay(block.startTime, date));
  };

  const getFilteredBlocks = (): TimeBlock[] => {
    let blocks = getBlocksForDate(selectedDate);

    if (searchQuery) {
      blocks = blocks.filter(block =>
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      blocks = blocks.filter(block => block.type === filterType);
    }

    return blocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const createTimeBlock = (blockData: Partial<TimeBlock>) => {
    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      title: blockData.title || 'New Time Block',
      description: blockData.description || '',
      type: blockData.type || 'focus',
      startTime: blockData.startTime || setHours(selectedDate, 9),
      endTime: blockData.endTime || setHours(selectedDate, 10),
      status: blockData.status || 'planned',
      priority: blockData.priority || 'medium',
      tags: blockData.tags || [],
      notes: blockData.notes || '',
      color: BLOCK_TYPES[blockData.type || 'focus'].color,
    };

    setTimeBlocks([...timeBlocks, newBlock]);
    toast.success('Time block created successfully');
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(blocks => blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
    toast.success('Time block updated successfully');
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks(blocks => blocks.filter(block => block.id !== id));
    toast.success('Time block deleted successfully');
  };

  const duplicateTimeBlock = (block: TimeBlock) => {
    const duplicatedBlock = {
      ...block,
      id: Date.now().toString(),
      title: `${block.title} (Copy)`,
      status: 'planned' as BlockStatus,
      startTime: addDays(block.startTime, 1),
      endTime: addDays(block.endTime, 1),
    };
    setTimeBlocks([...timeBlocks, duplicatedBlock]);
    toast.success('Time block duplicated successfully');
  };

  const applyTemplate = (template: TimeBlockTemplate) => {
    const baseDate = selectedDate;
    const newBlocks: TimeBlock[] = [];
    let currentTime = setHours(baseDate, 9); // Start at 9 AM

    template.blocks.forEach((templateBlock, index) => {
      const duration = index === 0 ? 90 : index === 1 ? 15 : index === 2 ? 90 : index === 3 ? 60 : 30; // Default durations
      const endTime = addMinutes(currentTime, duration);

      const newBlock: TimeBlock = {
        id: `${Date.now()}-${index}`,
        ...templateBlock,
        startTime: currentTime,
        endTime,
        color: BLOCK_TYPES[templateBlock.type].color,
      };

      newBlocks.push(newBlock);
      currentTime = addMinutes(endTime, 15); // 15-minute buffer between blocks
    });

    setTimeBlocks([...timeBlocks, ...newBlocks]);
    toast.success(`Template "${template.name}" applied successfully`);
    setIsTemplateDialogOpen(false);
  };

  const getBlockAtTime = (time: Date): TimeBlock | null => {
    return getFilteredBlocks().find(block =>
      time >= block.startTime && time < block.endTime
    ) || null;
  };

  const getTimeBlockStats = () => {
    const todayBlocks = getBlocksForDate(new Date());
    const completedBlocks = todayBlocks.filter(b => b.status === 'completed');
    const totalPlannedTime = todayBlocks.reduce((total, block) =>
      total + differenceInMinutes(block.endTime, block.startTime), 0
    );
    const completedTime = completedBlocks.reduce((total, block) =>
      total + differenceInMinutes(block.endTime, block.startTime), 0
    );

    const typeStats = Object.keys(BLOCK_TYPES).map(type => {
      const typeBlocks = todayBlocks.filter(b => b.type === type);
      const typeTime = typeBlocks.reduce((total, block) =>
        total + differenceInMinutes(block.endTime, block.startTime), 0
      );
      return {
        type: type as BlockType,
        count: typeBlocks.length,
        time: typeTime,
        percentage: totalPlannedTime > 0 ? (typeTime / totalPlannedTime) * 100 : 0,
      };
    }).filter(stat => stat.count > 0);

    return {
      totalBlocks: todayBlocks.length,
      completedBlocks: completedBlocks.length,
      totalPlannedTime: Math.round(totalPlannedTime / 60 * 10) / 10, // hours
      completedTime: Math.round(completedTime / 60 * 10) / 10, // hours
      completionRate: todayBlocks.length > 0 ? (completedBlocks.length / todayBlocks.length) * 100 : 0,
      typeStats,
    };
  };

  const handleDragStart = (e: React.DragEvent, block: TimeBlock) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTime: Date) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const duration = differenceInMinutes(draggedBlock.endTime, draggedBlock.startTime);
    const newStartTime = targetTime;
    const newEndTime = addMinutes(newStartTime, duration);

    updateTimeBlock(draggedBlock.id, {
      startTime: newStartTime,
      endTime: newEndTime,
    });

    setDraggedBlock(null);
    toast.success('Time block moved successfully');
  };

  const stats = getTimeBlockStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Blocking</h1>
          <p className="text-muted-foreground">
            Plan and manage your day with visual time blocks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>

          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <TemplateDialog
              templates={templates}
              onApply={applyTemplate}
              onClose={() => setIsTemplateDialogOpen(false)}
            />
          </Dialog>

          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedBlock(null);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Block
              </Button>
            </DialogTrigger>
            <BlockDialog
              block={selectedBlock}
              isCreating={isCreating}
              selectedDate={selectedDate}
              onSave={createTimeBlock}
              onUpdate={updateTimeBlock}
              onDelete={deleteTimeBlock}
              onClose={() => setIsBlockDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Date Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>

          <div className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <Select value={filterType} onValueChange={(value: BlockType | 'all') => setFilterType(value)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(BLOCK_TYPES).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Blocking Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {format(selectedDate, 'EEEE, MMM d')}
                {isToday(selectedDate) && (
                  <Badge variant="secondary">Today</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[700px] overflow-y-auto">
                {timeSlots.map((timeSlot, index) => {
                  const currentBlock = getBlockAtTime(timeSlot);
                  const isOccupied = !!currentBlock;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex border-b border-border/50 min-h-[40px] hover:bg-accent/30 transition-colors',
                        isOccupied && 'bg-muted/30'
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, timeSlot)}
                    >
                      {/* Time Label */}
                      <div className="w-20 p-3 text-right text-sm text-muted-foreground border-r flex-shrink-0">
                        {format(timeSlot, 'HH:mm')}
                      </div>

                      {/* Time Block Content */}
                      <div className="flex-1 p-2">
                        {currentBlock ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              'p-3 rounded-lg text-white cursor-pointer group relative',
                              currentBlock.color,
                              PRIORITY_COLORS[currentBlock.priority],
                              'border-2'
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, currentBlock)}
                            onClick={() => {
                              setSelectedBlock(currentBlock);
                              setIsCreating(false);
                              setIsBlockDialogOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium truncate">{currentBlock.title}</span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {BLOCK_TYPES[currentBlock.type].label}
                                  </Badge>
                                </div>
                                <div className="text-xs opacity-90 flex items-center gap-2">
                                  <span>
                                    {format(currentBlock.startTime, 'HH:mm')} - {format(currentBlock.endTime, 'HH:mm')}
                                  </span>
                                  <span>
                                    ({differenceInMinutes(currentBlock.endTime, currentBlock.startTime)}m)
                                  </span>
                                </div>
                                {currentBlock.description && (
                                  <div className="text-xs opacity-80 mt-1 truncate">
                                    {currentBlock.description}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center">
                                  {currentBlock.status === 'completed' && (
                                    <CheckCircle className="w-4 h-4 text-green-300" />
                                  )}
                                  {currentBlock.status === 'in-progress' && (
                                    <PlayCircle className="w-4 h-4 text-blue-300" />
                                  )}
                                  {currentBlock.status === 'cancelled' && (
                                    <AlertCircle className="w-4 h-4 text-red-300" />
                                  )}
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBlock(currentBlock);
                                        setIsCreating(false);
                                        setIsBlockDialogOpen(true);
                                      }}
                                    >
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateTimeBlock(currentBlock);
                                      }}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTimeBlock(currentBlock.id);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div
                            className="h-8 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground hover:border-muted-foreground/40 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedBlock({
                                id: '',
                                title: '',
                                type: 'focus',
                                startTime: timeSlot,
                                endTime: addMinutes(timeSlot, 30),
                                status: 'planned',
                                priority: 'medium',
                              });
                              setIsCreating(true);
                              setIsBlockDialogOpen(true);
                            }}
                          >
                            Click to add time block
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Today's Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.totalBlocks}</div>
                  <div className="text-xs text-muted-foreground">Blocks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalPlannedTime}h</div>
                  <div className="text-xs text-muted-foreground">Planned</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{Math.round(stats.completionRate)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const currentBlock = getFilteredBlocks().find(block =>
                        now >= block.startTime && now <= block.endTime
                      );
                      if (currentBlock) {
                        updateTimeBlock(currentBlock.id, { status: 'in-progress' });
                      }
                    }}
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const currentBlock = getFilteredBlocks().find(block =>
                        now >= block.startTime && now <= block.endTime
                      );
                      if (currentBlock) {
                        updateTimeBlock(currentBlock.id, { status: 'completed' });
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Done
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Types Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Time Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.typeStats.map((stat) => {
                const config = BLOCK_TYPES[stat.type];
                const Icon = config.icon;
                return (
                  <div key={stat.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded', config.color)} />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(stat.time / 60 * 10) / 10}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(stat.percentage)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Analytics */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">{stats.completedBlocks}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{stats.completedTime}h</div>
                        <div className="text-xs text-muted-foreground">Actual Time</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">This Week</div>
                      <div className="text-xs text-muted-foreground">
                        Weekly analytics would show here with more data
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface BlockDialogProps {
  block: TimeBlock | null;
  isCreating: boolean;
  selectedDate: Date;
  onSave: (block: Partial<TimeBlock>) => void;
  onUpdate: (id: string, updates: Partial<TimeBlock>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function BlockDialog({ block, isCreating, selectedDate, onSave, onUpdate, onDelete, onClose }: BlockDialogProps) {
  const [formData, setFormData] = useState<Partial<TimeBlock>>({
    title: '',
    description: '',
    type: 'focus',
    priority: 'medium',
    status: 'planned',
    startTime: setHours(selectedDate, 9),
    endTime: setHours(selectedDate, 10),
    tags: [],
    notes: '',
  });

  useEffect(() => {
    if (block && !isCreating) {
      setFormData(block);
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'focus',
        priority: 'medium',
        status: 'planned',
        startTime: block?.startTime || setHours(selectedDate, 9),
        endTime: block?.endTime || setHours(selectedDate, 10),
        tags: [],
        notes: '',
      });
    }
  }, [block, isCreating, selectedDate]);

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error('Please enter a title for the time block');
      return;
    }

    if (isCreating) {
      onSave(formData);
    } else if (block) {
      onUpdate(block.id, formData);
    }
    onClose();
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      return differenceInMinutes(formData.endTime, formData.startTime);
    }
    return 0;
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isCreating ? 'Create Time Block' : 'Edit Time Block'}
        </DialogTitle>
        <DialogDescription>
          Plan your time effectively with structured blocks
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What will you work on?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details (optional)"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: BlockType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BLOCK_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BlockStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime ? format(formData.startTime, 'HH:mm') : ''}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newStartTime = setMinutes(setHours(selectedDate, parseInt(hours)), parseInt(minutes));
                setFormData({ ...formData, startTime: newStartTime });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime ? format(formData.endTime, 'HH:mm') : ''}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newEndTime = setMinutes(setHours(selectedDate, parseInt(hours)), parseInt(minutes));
                setFormData({ ...formData, endTime: newEndTime });
              }}
            />
          </div>
        </div>

        {formData.startTime && formData.endTime && (
          <div className="text-sm text-muted-foreground text-center">
            Duration: {calculateDuration()} minutes
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes or context"
            rows={2}
          />
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {!isCreating && block && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(block.id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create Block' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

interface TemplateDialogProps {
  templates: TimeBlockTemplate[];
  onApply: (template: TimeBlockTemplate) => void;
  onClose: () => void;
}

function TemplateDialog({ templates, onApply, onClose }: TemplateDialogProps) {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Time Block Templates</DialogTitle>
        <DialogDescription>
          Apply pre-built templates to quickly structure your day
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onApply(template)}
                >
                  Apply
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                {template.blocks.map((block, index) => {
                  const config = BLOCK_TYPES[block.type];
                  const Icon = config.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={cn('w-3 h-3 rounded', config.color)} />
                      <Icon className="w-4 h-4" />
                      <span>{block.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </DialogContent>
  );
}