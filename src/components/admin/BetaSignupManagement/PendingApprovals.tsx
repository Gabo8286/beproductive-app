import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BetaSignup {
  id: string;
  email: string;
  name: string;
  comments: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PendingApprovals: React.FC = () => {
  const [selectedSignups, setSelectedSignups] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [emailLanguage, setEmailLanguage] = useState("en");
  const [viewingSignup, setViewingSignup] = useState<BetaSignup | null>(null);

  // Mock data - will be replaced with real API calls
  const pendingSignups: BetaSignup[] = [
    {
      id: "1",
      email: "sarah.developer@gmail.com",
      name: "Sarah Johnson",
      comments: "I'm a frontend developer working on productivity tools. Very excited to try BeProductive!",
      created_at: "2025-01-15T10:30:00Z",
      status: "pending"
    },
    {
      id: "2",
      email: "mike.startup@innovate.io",
      name: "Mike Chen",
      comments: "CEO of a tech startup. Need better team productivity solutions.",
      created_at: "2025-01-15T08:15:00Z",
      status: "pending"
    },
    {
      id: "3",
      email: "alex.freelancer@email.com",
      name: "Alex Rodriguez",
      comments: "Freelance project manager looking for tools to organize multiple client projects.",
      created_at: "2025-01-14T16:45:00Z",
      status: "pending"
    },
    {
      id: "4",
      email: "jennifer.student@university.edu",
      name: "Jennifer Kim",
      comments: "Computer science student interested in productivity apps and time management.",
      created_at: "2025-01-14T14:20:00Z",
      status: "pending"
    },
  ];

  const handleSelectSignup = (signupId: string) => {
    setSelectedSignups(prev =>
      prev.includes(signupId)
        ? prev.filter(id => id !== signupId)
        : [...prev, signupId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSignups.length === pendingSignups.length) {
      setSelectedSignups([]);
    } else {
      setSelectedSignups(pendingSignups.map(signup => signup.id));
    }
  };

  const handleApproveSelected = () => {
    console.log("Approving signups:", selectedSignups);
    console.log("Email language:", emailLanguage);
    // TODO: Implement API call to approve signups and send emails
    setSelectedSignups([]);
  };

  const handleRejectSelected = () => {
    console.log("Rejecting signups:", selectedSignups);
    console.log("Rejection reason:", rejectionReason);
    // TODO: Implement API call to reject signups
    setSelectedSignups([]);
    setRejectionReason("");
  };

  const handleApproveIndividual = (signupId: string) => {
    console.log("Approving individual signup:", signupId);
    // TODO: Implement API call
  };

  const handleRejectIndividual = (signupId: string, reason: string) => {
    console.log("Rejecting individual signup:", signupId, "Reason:", reason);
    // TODO: Implement API call
  };

  return (
    <div className="space-y-6">
      {/* Header with Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Approvals ({pendingSignups.length})
              </CardTitle>
              <CardDescription>
                Review and approve beta signup requests to send invitation emails
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={emailLanguage} onValueChange={setEmailLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedSignups.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {selectedSignups.length} selected
              </Badge>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={handleApproveSelected}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Send Invites
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Selected
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Selected Signups</DialogTitle>
                      <DialogDescription>
                        Provide a reason for rejecting these {selectedSignups.length} signup requests.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Reason for rejection (optional)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRejectionReason("")}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleRejectSelected}>
                        Reject Signups
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signups Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedSignups.length === pendingSignups.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSignups.map((signup) => (
                <TableRow key={signup.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedSignups.includes(signup.id)}
                      onChange={() => handleSelectSignup(signup.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{signup.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {signup.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      {signup.comments ? (
                        <div className="space-y-1">
                          <p className="text-sm line-clamp-2">{signup.comments}</p>
                          {signup.comments.length > 100 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="h-auto p-0 text-xs">
                                  Read more...
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{signup.name}'s Comments</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm leading-relaxed">
                                    {signup.comments}
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No comments provided
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(signup.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Beta Signup Details</DialogTitle>
                            <DialogDescription>
                              Review signup information for {signup.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Name
                                </label>
                                <p className="text-sm">{signup.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Email
                                </label>
                                <p className="text-sm">{signup.email}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Comments
                              </label>
                              <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                                {signup.comments || "No comments provided"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Submitted
                              </label>
                              <p className="text-sm">
                                {new Date(signup.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <div className="flex items-center gap-2 w-full">
                              <Button
                                onClick={() => handleApproveIndividual(signup.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve & Send Invite
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" className="flex-1">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Signup</DialogTitle>
                                    <DialogDescription>
                                      Provide a reason for rejecting {signup.name}'s signup request.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Reason for rejection (optional)"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setRejectionReason("")}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRejectIndividual(signup.id, rejectionReason)}
                                    >
                                      Reject Signup
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        onClick={() => handleApproveIndividual(signup.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pendingSignups.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-muted-foreground">
                No pending beta signup requests at the moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};