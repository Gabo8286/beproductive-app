/**
 * Workspace Configuration Panel
 * Personalized workspace templates and configuration management
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Copy,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  Layout,
  Zap,
  Users,
  BarChart3,
  Clock,
  Target,
  User,
  Shield,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useScreenReader } from '@/hooks/useScreenReader';
import { useRoleBasedNavigation, useWorkspaceTemplates } from '@/hooks/useRoleBasedNavigation';
import { WorkspaceTemplate } from '@/services/RoleBasedNavigationService';
import { NavigationHubId } from '@/types/navigation';

interface WorkspaceConfigurationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface CustomWorkspace {
  id: string;
  name: string;
  description: string;
  hubLayout: NavigationHubId[];
  quickActions: string[];
  automations: string[];
  defaultSettings: Record<string, any>;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

export const WorkspaceConfigurationPanel: React.FC<WorkspaceConfigurationPanelProps> = ({
  isVisible,
  onClose,
  className
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { announce } = useScreenReader();
  const { availableTemplates, currentTemplate, switchTemplate } = useWorkspaceTemplates();
  const { roleConfig, adaptedHubs } = useRoleBasedNavigation();

  // State
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'automations'>('templates');
  const [customWorkspaces, setCustomWorkspaces] = useState<CustomWorkspace[]>([]);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [selectedHubs, setSelectedHubs] = useState<NavigationHubId[]>([]);
  const [selectedQuickActions, setSelectedQuickActions] = useState<string[]>([]);

  // Available quick actions
  const availableQuickActions = [
    'New Task',
    'Quick Note',
    'Start Focus',
    'Schedule Meeting',
    'Daily Review',
    'Team Check-in',
    'Project Update',
    'Time Block',
    'Weekly Planning',
    'Goal Review',
    'Analytics Review',
    'System Health Check',
    'User Management',
    'Export Data',
    'Backup Settings',
  ];

  // Load custom workspaces
  useEffect(() => {
    if (isVisible) {
      loadCustomWorkspaces();
    }
  }, [isVisible]);

  // Load custom workspaces from localStorage
  const loadCustomWorkspaces = useCallback(() => {
    try {
      const stored = localStorage.getItem('luna-custom-workspaces');
      if (stored) {
        const workspaces = JSON.parse(stored).map((w: any) => ({
          ...w,
          lastUsed: new Date(w.lastUsed),
          createdAt: new Date(w.createdAt),
        }));
        setCustomWorkspaces(workspaces);
      }
    } catch (error) {
      console.error('Failed to load custom workspaces:', error);
    }
  }, []);

  // Save custom workspaces to localStorage
  const saveCustomWorkspaces = useCallback((workspaces: CustomWorkspace[]) => {
    try {
      localStorage.setItem('luna-custom-workspaces', JSON.stringify(workspaces));
      setCustomWorkspaces(workspaces);
    } catch (error) {
      console.error('Failed to save custom workspaces:', error);
    }
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    switchTemplate(templateId);
    triggerHaptic('medium');
    announce(`Switched to ${availableTemplates.find(t => t.id === templateId)?.name} workspace`, { priority: 'polite' });
  }, [switchTemplate, availableTemplates, triggerHaptic, announce]);

  // Start creating custom workspace
  const startCreatingWorkspace = useCallback(() => {
    setIsCreatingWorkspace(true);
    setWorkspaceName('');
    setWorkspaceDescription('');
    setSelectedHubs(adaptedHubs.slice(0, 4).map(h => h.id));
    setSelectedQuickActions(availableQuickActions.slice(0, 3));
  }, [adaptedHubs]);

  // Save custom workspace
  const saveCustomWorkspace = useCallback(() => {
    if (!workspaceName.trim()) return;

    const newWorkspace: CustomWorkspace = {
      id: editingWorkspace || `custom-${Date.now()}`,
      name: workspaceName.trim(),
      description: workspaceDescription.trim(),
      hubLayout: selectedHubs,
      quickActions: selectedQuickActions,
      automations: [],
      defaultSettings: {},
      isActive: false,
      lastUsed: new Date(),
      createdAt: new Date(),
    };

    const updatedWorkspaces = editingWorkspace
      ? customWorkspaces.map(w => w.id === editingWorkspace ? newWorkspace : w)
      : [...customWorkspaces, newWorkspace];

    saveCustomWorkspaces(updatedWorkspaces);

    setIsCreatingWorkspace(false);
    setEditingWorkspace(null);
    triggerHaptic('medium');
    announce(`${editingWorkspace ? 'Updated' : 'Created'} workspace: ${newWorkspace.name}`, { priority: 'polite' });
  }, [workspaceName, workspaceDescription, selectedHubs, selectedQuickActions, editingWorkspace, customWorkspaces, saveCustomWorkspaces, triggerHaptic, announce]);

  // Edit workspace
  const editWorkspace = useCallback((workspace: CustomWorkspace) => {
    setEditingWorkspace(workspace.id);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description);
    setSelectedHubs(workspace.hubLayout);
    setSelectedQuickActions(workspace.quickActions);
    setIsCreatingWorkspace(true);
  }, []);

  // Delete workspace
  const deleteWorkspace = useCallback((workspaceId: string) => {
    const updatedWorkspaces = customWorkspaces.filter(w => w.id !== workspaceId);
    saveCustomWorkspaces(updatedWorkspaces);
    triggerHaptic('medium');
    announce('Workspace deleted', { priority: 'polite' });
  }, [customWorkspaces, saveCustomWorkspaces, triggerHaptic, announce]);

  // Apply custom workspace
  const applyCustomWorkspace = useCallback((workspace: CustomWorkspace) => {
    // Update last used time
    const updatedWorkspace = { ...workspace, lastUsed: new Date(), isActive: true };
    const updatedWorkspaces = customWorkspaces.map(w => ({
      ...w,
      isActive: w.id === workspace.id,
      ...(w.id === workspace.id ? { lastUsed: new Date() } : {})
    }));

    saveCustomWorkspaces(updatedWorkspaces);

    // Apply workspace configuration
    // This would integrate with the navigation preferences system
    console.log('Applying workspace:', workspace);

    triggerHaptic('medium');
    announce(`Applied workspace: ${workspace.name}`, { priority: 'polite' });
  }, [customWorkspaces, saveCustomWorkspaces, triggerHaptic, announce]);

  // Toggle hub selection
  const toggleHubSelection = useCallback((hubId: NavigationHubId) => {
    setSelectedHubs(prev =>
      prev.includes(hubId)
        ? prev.filter(id => id !== hubId)
        : [...prev, hubId]
    );
  }, []);

  // Toggle quick action selection
  const toggleQuickActionSelection = useCallback((action: string) => {
    setSelectedQuickActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  }, []);

  // Render template card
  const renderTemplateCard = useCallback((template: WorkspaceTemplate) => {
    const isActive = currentTemplate?.id === template.id;

    const getTemplateIcon = (templateId: string) => {
      switch (templateId) {
        case 'personal-productivity': return Target;
        case 'team-collaboration': return Users;
        case 'administration': return Shield;
        case 'enterprise-productivity': return BarChart3;
        default: return Layout;
      }
    };

    const Icon = getTemplateIcon(template.id);

    return (
      <motion.div
        key={template.id}
        className={cn(
          'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
          isActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'
        )}
        onClick={() => handleTemplateSelect(template.id)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start space-x-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isActive ? 'bg-blue-500' : 'bg-gray-700'
          )}>
            <Icon size={20} className="text-white" />
          </div>

          <div className="flex-1">
            <h4 className="text-white font-medium">{template.name}</h4>
            <p className="text-sm text-gray-400 mt-1">{template.description}</p>

            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {template.hubLayout.slice(0, 4).map((hubId) => (
                  <span
                    key={hubId}
                    className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                  >
                    {hubId.split('-')[0]}
                  </span>
                ))}
                {template.hubLayout.length > 4 && (
                  <span className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                    +{template.hubLayout.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <Zap size={12} className="mr-1" />
                {template.quickActions.length} quick actions
              </div>
            </div>
          </div>

          {isActive && (
            <motion.div
              className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Check size={14} className="text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }, [currentTemplate, handleTemplateSelect]);

  // Render custom workspace card
  const renderCustomWorkspaceCard = useCallback((workspace: CustomWorkspace) => {
    return (
      <motion.div
        key={workspace.id}
        className={cn(
          'p-4 rounded-lg border-2 transition-all duration-200',
          workspace.isActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'
        )}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-white font-medium flex items-center">
              {workspace.name}
              <Sparkles size={14} className="ml-2 text-purple-400" />
            </h4>
            <p className="text-sm text-gray-400 mt-1">{workspace.description}</p>

            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {workspace.hubLayout.slice(0, 4).map((hubId) => (
                  <span
                    key={hubId}
                    className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                  >
                    {hubId.split('-')[0]}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Last used: {workspace.lastUsed.toLocaleDateString()}</span>
                <span>{workspace.quickActions.length} actions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-3">
            <button
              onClick={() => applyCustomWorkspace(workspace)}
              className="p-2 hover:bg-purple-600 text-purple-400 hover:text-white rounded transition-colors"
              title="Apply workspace"
            >
              <Check size={14} />
            </button>

            <button
              onClick={() => editWorkspace(workspace)}
              className="p-2 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition-colors"
              title="Edit workspace"
            >
              <Edit size={14} />
            </button>

            <button
              onClick={() => deleteWorkspace(workspace.id)}
              className="p-2 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors"
              title="Delete workspace"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }, [applyCustomWorkspace, editWorkspace, deleteWorkspace]);

  // Render templates tab
  const renderTemplatesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Role-Based Templates</h3>
        <div className="text-sm text-gray-400">
          {roleConfig?.displayName || 'Standard User'}
        </div>
      </div>

      <div className="space-y-3">
        {availableTemplates.map(renderTemplateCard)}
      </div>

      {availableTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Layout size={32} className="mx-auto mb-2" />
          <p>No workspace templates available for your role.</p>
        </div>
      )}
    </div>
  );

  // Render custom workspaces tab
  const renderCustomTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Custom Workspaces</h3>
        <button
          onClick={startCreatingWorkspace}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={14} />
          <span>Create</span>
        </button>
      </div>

      <div className="space-y-3">
        {customWorkspaces.map(renderCustomWorkspaceCard)}
      </div>

      {customWorkspaces.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Sparkles size={32} className="mx-auto mb-2" />
          <p>No custom workspaces created yet.</p>
          <button
            onClick={startCreatingWorkspace}
            className="mt-2 text-purple-400 hover:text-purple-300"
          >
            Create your first custom workspace
          </button>
        </div>
      )}
    </div>
  );

  // Render automations tab
  const renderAutomationsTab = () => (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Workspace Automations</h3>

      <div className="text-sm text-gray-400 p-4 bg-gray-800/50 rounded-lg">
        <p className="mb-2">Automations allow your workspace to adapt based on:</p>
        <ul className="space-y-1 ml-4">
          <li>• Time of day and schedule</li>
          <li>• Current workflow state</li>
          <li>• Team activity and collaboration needs</li>
          <li>• Project deadlines and priorities</li>
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          Coming soon: Custom automation rules and triggers
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'custom', label: 'Custom', icon: Sparkles },
    { id: 'automations', label: 'Automations', icon: Zap },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed right-4 top-4 bottom-4 w-96 max-w-[90vw]',
              'bg-gray-900/95 backdrop-blur-md border border-white/20',
              'rounded-xl shadow-2xl z-[85] overflow-hidden flex flex-col',
              className
            )}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="text-green-400" size={20} />
                  <h2 className="text-white font-semibold">Workspaces</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                        activeTab === tab.id
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      )}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'templates' && renderTemplatesTab()}
              {activeTab === 'custom' && renderCustomTab()}
              {activeTab === 'automations' && renderAutomationsTab()}
            </div>
          </motion.div>

          {/* Create/Edit Workspace Modal */}
          <AnimatePresence>
            {isCreatingWorkspace && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gray-800 rounded-lg w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-4">
                      {editingWorkspace ? 'Edit Workspace' : 'Create Custom Workspace'}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Workspace Name
                        </label>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          placeholder="e.g., My Productivity Setup"
                          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={workspaceDescription}
                          onChange={(e) => setWorkspaceDescription(e.target.value)}
                          placeholder="Describe your workspace..."
                          rows={3}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Navigation Hubs ({selectedHubs.length}/6)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {adaptedHubs.map((hub) => (
                            <button
                              key={hub.id}
                              onClick={() => toggleHubSelection(hub.id)}
                              className={cn(
                                'p-3 rounded-lg border transition-colors text-left',
                                selectedHubs.includes(hub.id)
                                  ? 'border-purple-500 bg-purple-500/20 text-white'
                                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                              )}
                            >
                              <div className="text-sm font-medium">{hub.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Quick Actions ({selectedQuickActions.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {availableQuickActions.map((action) => (
                            <button
                              key={action}
                              onClick={() => toggleQuickActionSelection(action)}
                              className={cn(
                                'p-2 rounded text-xs text-left transition-colors',
                                selectedQuickActions.includes(action)
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              )}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={saveCustomWorkspace}
                        disabled={!workspaceName.trim() || selectedHubs.length === 0}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <Save size={16} />
                        <span>{editingWorkspace ? 'Update' : 'Create'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsCreatingWorkspace(false);
                          setEditingWorkspace(null);
                        }}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};