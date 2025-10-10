import { NavigateFunction } from 'react-router-dom';
import type { ViewMode, SortBy, SortOrder, GroupBy } from '@/contexts/GlobalViewContext';

// Luna actions interface for external dependency injection
interface LunaActions {
  openChat: () => void;
  closeChat: () => void;
  setContext: (context: 'capture' | 'plan' | 'engage' | 'general') => void;
  showFloat: () => void;
  hideFloat: () => void;
}

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

// Global Luna actions instance (will be set by FABContainer)
let lunaActions: LunaActions | null = null;
let globalViewActions: GlobalViewActions | null = null;

export function setLunaActions(actions: LunaActions) {
  lunaActions = actions;
}

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

    case 'OPEN_LUNA':
      if (lunaActions) {
        // Set the appropriate context based on current tab
        if (currentTab) {
          lunaActions.setContext(currentTab);
        }
        lunaActions.openChat();
        lunaActions.showFloat();
      } else {
        console.warn('Luna actions not available');
      }
      break;

    case 'LUNA_HELP':
      if (lunaActions) {
        lunaActions.setContext(currentTab || 'general');
        lunaActions.openChat();
        // Pre-populate with help request based on context
        // This would require extending the Luna context to accept initial messages
      } else {
        console.warn('Luna actions not available');
      }
      break;

    case 'LUNA_SUGGEST':
      if (lunaActions) {
        lunaActions.setContext(currentTab || 'general');
        lunaActions.openChat();
        // This could trigger Luna to provide proactive suggestions
      } else {
        console.warn('Luna actions not available');
      }
      break;

    case 'TOGGLE_LUNA_FLOAT':
      if (lunaActions) {
        // This would toggle the floating Luna visibility
        // Implementation depends on Luna context having a toggle method
        lunaActions.showFloat();
      } else {
        console.warn('Luna actions not available');
      }
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