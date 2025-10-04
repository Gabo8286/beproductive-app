import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  GitBranch
} from "lucide-react";
import { Process, ProcessApproval, ApprovalStatus } from "@/types/processes";
import { useProcesses } from "@/hooks/useProcesses";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ProcessApprovalSystemProps {
  process: Process;
  onVersionCreated?: () => void;
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  needs_revision: RotateCcw,
};

const statusColors = {
  pending: "text-yellow-600 bg-yellow-100",
  approved: "text-green-600 bg-green-100",
  rejected: "text-red-600 bg-red-100",
  needs_revision: "text-orange-600 bg-orange-100",
};

export function ProcessApprovalSystem({ process, onVersionCreated }: ProcessApprovalSystemProps) {
  const { user } = useAuth();
  const { updateProcessStatus, createProcessVersion } = useProcesses();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'revision'>('approve');
  const [reviewComments, setReviewComments] = useState("");
  const [showVersionAlert, setShowVersionAlert] = useState(false);

  const canReview = user?.id && process.owner_id !== user.id; // Can't review own process
  const canEdit = user?.id === process.owner_id || user?.id === process.created_by;
  const isOwner = user?.id === process.owner_id;

  const handleReview = async () => {
    if (!user?.id) return;

    const newStatus = reviewAction === 'approve' ? 'approved' :
                     reviewAction === 'reject' ? 'deprecated' : 'draft';

    try {
      await updateProcessStatus.mutateAsync({
        id: process.id,
        status: newStatus
      });

      // Here you would also create an approval record in the database
      // This would require extending the useProcesses hook with approval functionality

      setReviewDialogOpen(false);
      setReviewComments("");
    } catch (error) {
      console.error("Failed to review process:", error);
    }
  };

  const handleCreateVersion = async () => {
    try {
      await createProcessVersion.mutateAsync({
        processId: process.id,
        updates: {} // Would include any changes in a real implementation
      });

      setVersionDialogOpen(false);
      onVersionCreated?.();
    } catch (error) {
      console.error("Failed to create version:", error);
    }
  };

  const submitForReview = async () => {
    try {
      await updateProcessStatus.mutateAsync({
        id: process.id,
        status: 'review'
      });
    } catch (error) {
      console.error("Failed to submit for review:", error);
    }
  };

  const getStatusBadge = (status: Process['status']) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || FileText;
    const colorClass = statusColors[status as keyof typeof statusColors] || "text-gray-600 bg-gray-100";

    return (
      <Badge variant="outline" className={`${colorClass} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Approval Status
              </CardTitle>
              <CardDescription>
                Process version {process.version} • Last updated {format(new Date(process.updated_at), 'PPp')}
              </CardDescription>
            </div>
            {getStatusBadge(process.status)}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Status Description */}
            <div className="p-4 rounded-lg bg-muted">
              {process.status === 'draft' && (
                <div>
                  <h4 className="font-medium mb-2">Draft Status</h4>
                  <p className="text-sm text-muted-foreground">
                    This process is in draft mode. Complete the documentation and submit for review when ready.
                  </p>
                </div>
              )}
              {process.status === 'review' && (
                <div>
                  <h4 className="font-medium mb-2">Under Review</h4>
                  <p className="text-sm text-muted-foreground">
                    This process is currently being reviewed by stakeholders and approvers.
                  </p>
                </div>
              )}
              {process.status === 'approved' && (
                <div>
                  <h4 className="font-medium mb-2">Approved</h4>
                  <p className="text-sm text-muted-foreground">
                    This process has been approved and is ready for implementation.
                    {process.approved_at && process.approved_by && (
                      <span className="block mt-1">
                        Approved on {format(new Date(process.approved_at), 'PPp')}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {process.status === 'active' && (
                <div>
                  <h4 className="font-medium mb-2">Active</h4>
                  <p className="text-sm text-muted-foreground">
                    This process is currently active and being used in operations.
                  </p>
                </div>
              )}
              {process.status === 'deprecated' && (
                <div>
                  <h4 className="font-medium mb-2">Deprecated</h4>
                  <p className="text-sm text-muted-foreground">
                    This process has been deprecated and should no longer be used.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Owner/Editor Actions */}
              {isOwner && process.status === 'draft' && (
                <Button onClick={submitForReview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Submit for Review
                </Button>
              )}

              {canEdit && process.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={() => setShowVersionAlert(true)}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create New Version
                </Button>
              )}

              {canEdit && process.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={() => updateProcessStatus.mutateAsync({ id: process.id, status: 'active' })}
                >
                  Activate Process
                </Button>
              )}

              {/* Reviewer Actions */}
              {canReview && process.status === 'review' && (
                <>
                  <Button
                    onClick={() => {
                      setReviewAction('approve');
                      setReviewDialogOpen(true);
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewAction('revision');
                      setReviewDialogOpen(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setReviewAction('reject');
                      setReviewDialogOpen(true);
                    }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>
            Track changes and versions of this process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  v{process.version}
                </div>
                <div>
                  <p className="font-medium">Current Version</p>
                  <p className="text-sm text-muted-foreground">
                    Updated {format(new Date(process.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(process.status)}
                <Badge variant="secondary">Current</Badge>
              </div>
            </div>

            {/* Placeholder for previous versions */}
            {process.version > 1 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Previous versions would be displayed here
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
          <CardDescription>
            Review comments and approval decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            No approval history available yet
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Process' :
               reviewAction === 'reject' ? 'Reject Process' : 'Request Revision'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' ? 'Approve this process for implementation.' :
               reviewAction === 'reject' ? 'Reject this process and provide feedback.' :
               'Request revisions to this process before approval.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder={
                  reviewAction === 'approve' ? 'Optional approval comments...' :
                  reviewAction === 'reject' ? 'Explain why this process is being rejected...' :
                  'Specify what changes are needed...'
                }
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
              disabled={updateProcessStatus.isPending}
            >
              {updateProcessStatus.isPending ? 'Processing...' :
               reviewAction === 'approve' ? 'Approve' :
               reviewAction === 'reject' ? 'Reject' : 'Request Revision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Creation Alert */}
      <AlertDialog open={showVersionAlert} onOpenChange={setShowVersionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Version</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new version of the process in draft status. The current approved version will remain active until the new version is approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateVersion}>
              Create Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}