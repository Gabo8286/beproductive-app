import { createContext, useContext, useState } from 'react';

type ViewMode = 'grid' | 'list' | 'board' | 'calendar';
type SortBy = 'created_at' | 'due_date' | 'priority' | 'status' | 'title';
type SortOrder = 'asc' | 'desc';
type GroupBy = 'none' | 'status' | 'priority' | 'due_date';

interface TaskViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  groupBy: GroupBy;
  setGroupBy: (group: GroupBy) => void;
}

const TaskViewContext = createContext<TaskViewContextType | undefined>(undefined);

export function TaskViewProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  return (
    <TaskViewContext.Provider value={{
      viewMode,
      setViewMode,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
      groupBy,
      setGroupBy,
    }}>
      {children}
    </TaskViewContext.Provider>
  );
}

export const useTaskView = () => {
  const context = useContext(TaskViewContext);
  if (!context) {
    throw new Error('useTaskView must be used within TaskViewProvider');
  }
  return context;
};
