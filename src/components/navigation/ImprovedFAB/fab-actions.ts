import { NavigateFunction } from 'react-router-dom';
import type { ViewMode, SortBy, SortOrder, GroupBy } from '@/contexts/GlobalViewContext';

// Global view actions interface for external dependency injection
interface GlobalViewActions {
  setViewMode: (mode: ViewMode) => void;
  setFilter: (filter: any) => void;
  clearFilters: () => void;
  setSort: (sortBy: SortBy, order?: SortOrder) => void;
  toggleSortOrder: () => void;
  setGroup: (groupBy: GroupBy) => void;
  setCategoryFilter: (category: string | null) => void;
}

// Global view actions instance (will be set by FABContainer)
let globalViewActions: GlobalViewActions | null = null;

export function setGlobalViewActions(actions: GlobalViewActions) {
  globalViewActions = actions;
}

export function executeAction(action: string, value: any, navigate: NavigateFunction, currentTab?: 'capture' | 'plan' | 'engage') {
  switch (action) {
    case 'SET_VIEW':
      if (globalViewActions) {
        globalViewActions.setViewMode(value);
      }
      break;

    case 'SET_FILTER':
      if (globalViewActions) {
        globalViewActions.setFilter(value);
      }
      break;

    case 'CLEAR_FILTERS':
      if (globalViewActions) {
        globalViewActions.clearFilters();
      }
      break;

    case 'SET_SORT':
      if (globalViewActions) {
        globalViewActions.setSort(value.by, value.order);
      }
      break;

    case 'TOGGLE_SORT_ORDER':
      if (globalViewActions) {
        globalViewActions.toggleSortOrder();
      }
      break;

    case 'SET_GROUP':
      if (globalViewActions) {
        globalViewActions.setGroup(value);
      }
      break;

    case 'SET_CATEGORY_FILTER':
      if (globalViewActions) {
        globalViewActions.setCategoryFilter(value);
      }
      break;

    case 'CREATE':
      // Navigate to create new item
      if (value === 'project') {
        navigate('/projects');
      } else if (value === 'task') {
        navigate('/tasks');
      } else if (value === 'goal') {
        navigate('/goals/new');
      }
      break;

    case 'USE_TEMPLATE':
      // Load template for capture
      if (value === 'note') {
        navigate('/notes');
      } else if (value === 'task') {
        navigate('/tasks');
      } else if (value === 'project') {
        navigate('/projects');
      } else if (value === 'goal') {
        navigate('/goals/new');
      } else if (value === 'habit') {
        navigate('/habits');
      }
      break;

    case 'CAPTURE':
      // Open capture method
      if (value === 'voice') {
        // TODO: Implement voice capture
        console.log('Starting voice capture');
      } else if (value === 'photo') {
        // TODO: Implement photo capture
        console.log('Starting photo capture');
      } else if (value === 'quick') {
        navigate('/quick-todos');
      }
      break;

    case 'IMPORT':
      // Open import dialog
      console.log('Opening import for:', value);
      // TODO: Implement import functionality
      break;

    case 'NAVIGATE':
      // Direct navigation
      navigate(value);
      break;

    case 'START_TIMER':
      // TODO: Implement timer functionality
      console.log('Starting timer');
      break;

    case 'ADD_TO_TODAY':
      // TODO: Implement add to today functionality
      console.log('Adding to today');
      break;

    case 'COMPLETE':
      // TODO: Implement mark complete functionality
      console.log('Marking complete');
      break;

    case 'OPEN_TAG_FILTER':
      window.dispatchEvent(new CustomEvent('open-tag-filter-modal'));
      break;

    case 'EDIT_TIME':
      // TODO: Implement time editing
      console.log('Opening time editor');
      break;

    case 'TOGGLE_DND':
      // TODO: Implement do not disturb
      console.log('Toggling do not disturb');
      break;

    case 'SET_FOCUS_GOAL':
      // TODO: Implement focus goal setting
      console.log('Setting focus goal');
      break;

    default:
      console.warn('Unknown action:', action);
  }
}