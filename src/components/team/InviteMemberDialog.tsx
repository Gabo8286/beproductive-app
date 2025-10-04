import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  UserPlus,
  Mail,
  Users,
  Shield,
  User,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { toast } from 'sonner';

interface InviteMemberDialogProps {
  workspaceId: string;
  workspaceName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  trigger,
  open,
  onOpenChange
}: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'member' | 'admin'
  });
  const [inviteEmails, setInviteEmails] = useState<Array<{ email: string; role: 'member' | 'admin' }>>([]);

  const { inviteTeamMember, invitations, isLoading } = useTeamInvitations(workspaceId);

  const handleOpen = (openState: boolean) => {
    setIsOpen(openState);
    onOpenChange?.(openState);
    if (!openState) {
      // Reset form when closing
      setInviteForm({ email: '', role: 'member' });
      setInviteEmails([]);
    }
  };

  const handleAddEmail = () => {
    const email = inviteForm.email.trim().toLowerCase();

    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (inviteEmails.some(invite => invite.email === email)) {
      toast.error('Email already added to the list');
      return;
    }

    // Check if email is already invited or is a member
    const existingInvitation = invitations.find(inv =>
      inv.email === email && inv.status === 'pending'
    );

    if (existingInvitation) {
      toast.error('This email already has a pending invitation');
      return;
    }

    setInviteEmails(prev => [...prev, { email, role: inviteForm.role }]);
    setInviteForm({ email: '', role: 'member' });
  };

  const handleRemoveEmail = (index: number) => {
    setInviteEmails(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendInvitations = async () => {
    if (inviteEmails.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }

    try {
      // Send invitations sequentially to handle potential errors per invitation
      const results = await Promise.allSettled(
        inviteEmails.map(invite =>
          inviteTeamMember.mutateAsync({
            workspaceId,
            email: invite.email,
            role: invite.role
          })
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`${successful} invitation${successful === 1 ? '' : 's'} sent successfully`);
      }

      if (failed > 0) {
        toast.error(`${failed} invitation${failed === 1 ? '' : 's'} failed to send`);
      }

      if (successful === inviteEmails.length) {
        handleOpen(false);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage workspace settings and members';
      case 'member':
        return 'Can participate in workspace activities';
      default:
        return '';
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Invite new members to join "{workspaceName}" workspace. They'll receive an email invitation
            with instructions to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Email Form */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="colleague@company.com"
                  className="flex-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm(prev => ({
                    ...prev,
                    role: value as 'member' | 'admin'
                  }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddEmail} disabled={!inviteForm.email.trim()}>
                  Add
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {getRoleDescription(inviteForm.role)}
            </div>
          </div>

          {/* Email List */}
          {inviteEmails.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h4 className="font-medium mb-3">
                  Invitations to Send ({inviteEmails.length})
                </h4>
                <div className="space-y-2">
                  {inviteEmails.map((invite, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {getRoleIcon(invite.role)}
                                {invite.role}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmail(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending Invitations */}
          {invitations.filter(inv => inv.status === 'pending').length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Pending Invitations
                </h4>
                <div className="space-y-2">
                  {invitations
                    .filter(inv => inv.status === 'pending')
                    .map((invitation) => (
                      <Card key={invitation.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  {getRoleIcon(invitation.role)}
                                  {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitations}
              disabled={inviteEmails.length === 0 || inviteTeamMember.isPending}
            >
              {inviteTeamMember.isPending
                ? 'Sending...'
                : `Send ${inviteEmails.length} Invitation${inviteEmails.length === 1 ? '' : 's'}`
              }
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">About Invitations</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Invitations expire after 7 days</li>
                  <li>• Recipients will receive an email with a link to join</li>
                  <li>• You can resend or cancel pending invitations anytime</li>
                  <li>• Members can be promoted to admin later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}