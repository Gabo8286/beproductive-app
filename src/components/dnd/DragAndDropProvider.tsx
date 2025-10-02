import React, { createContext, useContext, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface DragAndDropContextType {
  activeTask: Task | null;
  isDragging: boolean;
}

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(undefined);

export function useDragAndDrop() {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop must be used within DragAndDropProvider');
  }
  return context;
}

interface DragAndDropProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  overlay?: React.ReactNode;
}

export function DragAndDropProvider({
  children,
  onDragEnd,
  onDragStart,
  onDragOver,
  overlay,
}: DragAndDropProviderProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Touch and hold for 250ms
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current?.task as Task || null);
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    onDragEnd(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(event);
  };

  return (
    <DragAndDropContext.Provider value={{ activeTask, isDragging: !!activeTask }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {children}
        <DragOverlay>
          {activeTask && overlay}
        </DragOverlay>
      </DndContext>
    </DragAndDropContext.Provider>
  );
}
