import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Users,
  Trash2,
  Save,
  Building,
  User,
  Shield,
  Calendar
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { toast } from 'sonner';

interface WorkspaceSettingsProps {
  workspaceId: string;
}

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const {
    workspace,
    members,
    userRole,
    canEditWorkspace,
    isLoading,
    updateWorkspace,
    deleteWorkspace
  } = useWorkspace(workspaceId);

  const [editForm, setEditForm] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    type: workspace?.type || 'team'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form when workspace data loads
  useState(() => {
    if (workspace) {
      setEditForm({
        name: workspace.name,
        description: workspace.description || '',
        type: workspace.type
      });
    }
  }, [workspace]);

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!workspace) return;

    try {
      await updateWorkspace.mutateAsync({
        id: workspace.id,
        data: {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          settings: {
            ...workspace.settings,
            type: editForm.type
          }
        }
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    try {
      await deleteWorkspace.mutateAsync(workspace.id);
      // Navigation will be handled by the parent component
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <User className="h-4 w-4" />;
      case 'organization':
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Workspace Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your workspace configuration and settings
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {userRole}
        </Badge>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Basic information about your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={editForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={!canEditWorkspace}
                placeholder="Enter workspace name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-type">Workspace Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => handleFormChange('type', value)}
                disabled={!canEditWorkspace}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team
                    </div>
                  </SelectItem>
                  <SelectItem value="organization">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Organization
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              value={editForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              disabled={!canEditWorkspace}
              placeholder="Describe the purpose of this workspace"
              rows={3}
            />
          </div>

          {canEditWorkspace && hasUnsavedChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSaveChanges} disabled={updateWorkspace.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspace Information */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Information</CardTitle>
          <CardDescription>
            Overview of workspace details and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              {getWorkspaceIcon(workspace.type)}
              <div>
                <p className="font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {workspace.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              <div>
                <p className="font-medium">Members</p>
                <p className="text-sm text-muted-foreground">
                  {members.length} active members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(workspace.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Management */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Current members and their roles in this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user?.full_name || member.user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {userRole === 'owner' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this workspace and all its data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{workspace.name}"? This will permanently
                          delete the workspace and all associated data including goals, tasks, and member
                          information. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteWorkspace}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Workspace
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}