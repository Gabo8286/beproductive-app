import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Settings, Users, Building, User, MoreHorizontal } from 'lucide-react';
import { useWorkspaces, type CreateWorkspaceData } from '@/hooks/useWorkspaces';
import { toast } from 'sonner';

interface WorkspaceSelectorProps {
  value?: string;
  onValueChange: (workspaceId: string) => void;
  className?: string;
}

export function WorkspaceSelector({ value, onValueChange, className }: WorkspaceSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateWorkspaceData>({
    name: '',
    description: '',
    type: 'team'
  });

  const { workspaces, isLoading, createWorkspace } = useWorkspaces();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      await createWorkspace.mutateAsync(createForm);
      setCreateDialogOpen(false);
      setCreateForm({ name: '', description: '', type: 'team' });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

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

  const selectedWorkspace = workspaces.find(w => w.id === value);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select workspace">
            {selectedWorkspace && (
              <div className="flex items-center gap-2">
                {getWorkspaceIcon(selectedWorkspace.type)}
                <span>{selectedWorkspace.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {selectedWorkspace.user_role}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getWorkspaceIcon(workspace.type)}
                  <div>
                    <div className="font-medium">{workspace.name}</div>
                    {workspace.description && (
                      <div className="text-xs text-muted-foreground">
                        {workspace.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="capitalize">
                    {workspace.user_role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {workspace.member_count} members
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your team and projects.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workspace name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this workspace"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Workspace Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) => setCreateForm(prev => ({
                  ...prev,
                  type: value as 'personal' | 'team' | 'organization'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Personal</div>
                        <div className="text-xs text-muted-foreground">
                          For individual use
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Team</div>
                        <div className="text-xs text-muted-foreground">
                          For small teams and projects
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="organization">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Organization</div>
                        <div className="text-xs text-muted-foreground">
                          For large organizations
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWorkspace.isPending}>
                {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {selectedWorkspace && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Workspace Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}