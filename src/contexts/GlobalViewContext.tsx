import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ViewMode = 'grid' | 'list' | 'board' | 'calendar' | 'projects' | 'status';
export type SortBy = 'created_at' | 'priority' | 'status' | 'title' | 'due_date';
export type SortOrder = 'asc' | 'desc';
export type GroupBy = 'none' | 'status' | 'priority' | 'due_date';

export interface FilterValue {
  type: 'all' | 'priority' | 'status' | 'dueDate' | 'category' | 'tags';
  value?: any;
}

interface GlobalViewState {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  groupBy: GroupBy;
  filters: FilterValue[];
  activeCategory: string | null;
  activeTags: string[];
  searchTerm: string;
}

interface GlobalViewContextType extends GlobalViewState {
  setViewMode: (mode: ViewMode) => void;
  setSort: (sortBy: SortBy, order?: SortOrder) => void;
  toggleSortOrder: () => void;
  setGroup: (groupBy: GroupBy) => void;
  setFilter: (filter: FilterValue) => void;
  clearFilters: () => void;
  setCategoryFilter: (category: string | null) => void;
  setTagFilters: (tags: string[]) => void;
  setSearchTerm: (term: string) => void;
  activeFilterCount: number;
}

const defaultState: GlobalViewState = {
  viewMode: 'list',
  sortBy: 'created_at',
  sortOrder: 'desc',
  groupBy: 'none',
  filters: [],
  activeCategory: null,
  activeTags: [],
  searchTerm: '',
};

const GlobalViewContext = createContext<GlobalViewContextType | undefined>(undefined);

export function GlobalViewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalViewState>(defaultState);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSort = useCallback((sortBy: SortBy, order?: SortOrder) => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder: order || prev.sortOrder,
    }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setGroup = useCallback((groupBy: GroupBy) => {
    setState(prev => ({ ...prev, groupBy }));
  }, []);

  const setFilter = useCallback((filter: FilterValue) => {
    setState(prev => {
      // Remove existing filter of same type, then add new one
      const filtered = prev.filters.filter(f => f.type !== filter.type);
      return {
        ...prev,
        filters: filter.type === 'all' ? [] : [...filtered, filter],
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: [],
      activeCategory: null,
      activeTags: [],
      searchTerm: '',
    }));
  }, []);

  const setCategoryFilter = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, activeCategory: category }));
  }, []);

  const setTagFilters = useCallback((tags: string[]) => {
    setState(prev => ({ ...prev, activeTags: tags }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const activeFilterCount = 
    state.filters.length + 
    (state.activeCategory ? 1 : 0) + 
    state.activeTags.length + 
    (state.searchTerm ? 1 : 0);

  const value: GlobalViewContextType = {
    ...state,
    setViewMode,
    setSort,
    toggleSortOrder,
    setGroup,
    setFilter,
    clearFilters,
    setCategoryFilter,
    setTagFilters,
    setSearchTerm,
    activeFilterCount,
  };

  return (
    <GlobalViewContext.Provider value={value}>
      {children}
    </GlobalViewContext.Provider>
  );
}

export function useGlobalView() {
  const context = useContext(GlobalViewContext);
  if (context === undefined) {
    throw new Error('useGlobalView must be used within a GlobalViewProvider');
  }
  return context;
}
