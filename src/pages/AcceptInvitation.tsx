import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  User,
  ArrowRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationDetails {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  workspace: {
    name: string;
    description?: string;
    type: string;
  };
  inviter: {
    full_name?: string;
    email: string;
  };
}

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { acceptInvitation } = useTeamInvitations();

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          workspace:workspaces(name, description, type),
          inviter:profiles!invited_by(full_name, email)
        `)
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Invitation not found or expired');
        } else {
          setError('Failed to load invitation details');
        }
        return;
      }

      setInvitation(data);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;

    try {
      await acceptInvitation.mutateAsync(token);
      toast.success('Successfully joined the workspace!');
      navigate('/team');
    } catch (error: any) {
      // Error handling is done in the mutation
    }
  };

  const handleDeclineInvitation = () => {
    navigate('/');
  };

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <User className="h-5 w-5" />;
      case 'organization':
        return <Building className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {error || 'This invitation link is not valid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAlreadyProcessed = invitation.status !== 'pending';

  // Check if user email matches invitation
  const emailMismatch = user && user.email !== invitation.email;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Workspace Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {getWorkspaceIcon(invitation.workspace.type)}
              <div>
                <h3 className="font-semibold text-lg">{invitation.workspace.name}</h3>
                <Badge variant="outline" className="capitalize">
                  {invitation.workspace.type}
                </Badge>
              </div>
            </div>
            {invitation.workspace.description && (
              <p className="text-sm text-muted-foreground">
                {invitation.workspace.description}
              </p>
            )}
          </div>

          {/* Invitation Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Invited as:</span>
              <Badge variant="outline" className="capitalize">
                {invitation.role}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Invited by:</span>
              <span className="text-sm">
                {invitation.inviter.full_name || invitation.inviter.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{invitation.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Expires:</span>
              <span className="text-sm">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status Alerts */}
          {!user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign In Required</AlertTitle>
              <AlertDescription>
                You need to sign in to accept this invitation. Please sign in with the email address: {invitation.email}
              </AlertDescription>
            </Alert>
          )}

          {emailMismatch && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Email Mismatch</AlertTitle>
              <AlertDescription>
                This invitation was sent to {invitation.email}, but you're signed in as {user?.email}.
                Please sign in with the correct email address.
              </AlertDescription>
            </Alert>
          )}

          {isExpired && (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Invitation Expired</AlertTitle>
              <AlertDescription>
                This invitation expired on {new Date(invitation.expires_at).toLocaleDateString()}.
                Please request a new invitation from the workspace administrator.
              </AlertDescription>
            </Alert>
          )}

          {isAlreadyProcessed && (
            <Alert>
              {getStatusIcon(invitation.status)}
              <AlertTitle>Invitation {invitation.status}</AlertTitle>
              <AlertDescription>
                This invitation has already been {invitation.status}.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {user && !emailMismatch && !isExpired && !isAlreadyProcessed && (
              <>
                <Button
                  className="w-full"
                  onClick={handleAcceptInvitation}
                  disabled={acceptInvitation.isPending}
                >
                  {acceptInvitation.isPending ? (
                    'Accepting...'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDeclineInvitation}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            )}

            {!user && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => navigate('/login', {
                    state: {
                      returnTo: `/accept-invitation?token=${token}`,
                      email: invitation.email
                    }
                  })}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Sign In to Accept
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/signup', {
                    state: {
                      returnTo: `/accept-invitation?token=${token}`,
                      email: invitation.email
                    }
                  })}
                >
                  Create Account
                </Button>
              </div>
            )}

            {(emailMismatch || isExpired || isAlreadyProcessed) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact the workspace administrator or{' '}
              <a href="mailto:support@beproductive.com" className="text-blue-600 hover:underline">
                support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}