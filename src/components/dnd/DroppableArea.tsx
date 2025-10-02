import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableAreaProps {
  id: string;
  children: ReactNode;
  className?: string;
  data?: any;
}

export function DroppableArea({ id, children, className = '', data }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? 'ring-2 ring-primary ring-offset-2 bg-accent/5' : ''
      } transition-all duration-200`}
    >
      {children}
    </div>
  );
}
