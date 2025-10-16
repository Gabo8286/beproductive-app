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
import { Input } from "@/components/ui/input";
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
  UserCheck,
  Mail,
  Calendar,
  Eye,
  Send,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApprovedUser {
  id: string;
  email: string;
  name: string;
  comments: string;
  approved_at: string;
  approved_by: string;
  invitation_sent_at: string | null;
  invitation_token: string;
  token_expires_at: string;
  account_created: boolean;
  last_login: string | null;
}

export const ApprovedUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data - will be replaced with real API calls
  const approvedUsers: ApprovedUser[] = [
    {
      id: "1",
      email: "john.pm@startup.co",
      name: "John Thompson",
      comments: "Product manager at a growing startup. Need team collaboration features.",
      approved_at: "2025-01-14T15:30:00Z",
      approved_by: "Super Admin",
      invitation_sent_at: "2025-01-14T15:35:00Z",
      invitation_token: "abc123def456",
      token_expires_at: "2025-01-21T15:35:00Z",
      account_created: true,
      last_login: "2025-01-15T09:20:00Z",
    },
    {
      id: "2",
      email: "maria.designer@agency.com",
      name: "Maria Garcia",
      comments: "UX designer working with multiple clients. Love the productivity focus!",
      approved_at: "2025-01-13T11:20:00Z",
      approved_by: "Super Admin",
      invitation_sent_at: "2025-01-13T11:25:00Z",
      invitation_token: "def456ghi789",
      token_expires_at: "2025-01-20T11:25:00Z",
      account_created: true,
      last_login: "2025-01-14T16:45:00Z",
    },
    {
      id: "3",
      email: "alex.freelancer@email.com",
      name: "Alex Rodriguez",
      comments: "Freelance project manager looking for tools to organize multiple client projects.",
      approved_at: "2025-01-12T14:10:00Z",
      approved_by: "Super Admin",
      invitation_sent_at: "2025-01-12T14:15:00Z",
      invitation_token: "ghi789jkl012",
      token_expires_at: "2025-01-19T14:15:00Z",
      account_created: false,
      last_login: null,
    },
    {
      id: "4",
      email: "david.exec@company.com",
      name: "David Wilson",
      comments: "Executive looking for team productivity solutions.",
      approved_at: "2025-01-11T10:00:00Z",
      approved_by: "Super Admin",
      invitation_sent_at: null,
      invitation_token: "jkl012mno345",
      token_expires_at: "2025-01-18T10:00:00Z",
      account_created: false,
      last_login: null,
    },
  ];

  const getStatusBadge = (user: ApprovedUser) => {
    if (user.account_created) {
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else if (user.invitation_sent_at) {
      const isExpired = new Date(user.token_expires_at) < new Date();
      if (isExpired) {
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      }
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Mail className="h-3 w-3 mr-1" />
          Invited
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-700">
          <Clock className="h-3 w-3 mr-1" />
          Pending Invite
        </Badge>
      );
    }
  };

  const filteredUsers = approvedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && user.account_created;
    if (filterStatus === "invited") return matchesSearch && user.invitation_sent_at && !user.account_created;
    if (filterStatus === "pending") return matchesSearch && !user.invitation_sent_at;

    return matchesSearch;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSendInvitations = () => {
    console.log("Sending invitations to:", selectedUsers);
    // TODO: Implement API call to send invitations
    setSelectedUsers([]);
  };

  const handleResendInvitation = (userId: string) => {
    console.log("Resending invitation to:", userId);
    // TODO: Implement API call to resend invitation
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                Approved Users ({approvedUsers.length})
              </CardTitle>
              <CardDescription>
                Manage approved beta users and their invitation status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="pending">Pending Invite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {selectedUsers.length} selected
              </Badge>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" onClick={handleSendInvitations}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(user.approved_at), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {user.approved_by}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.last_login ? (
                        <div>
                          <div>Last login:</div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(user.last_login), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      ) : user.invitation_sent_at ? (
                        <div>
                          <div>Invited:</div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(user.invitation_sent_at), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No activity</span>
                      )}
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
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Name
                                </label>
                                <p className="text-sm">{user.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Email
                                </label>
                                <p className="text-sm">{user.email}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Comments
                              </label>
                              <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                                {user.comments}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Approved
                                </label>
                                <p className="text-sm">
                                  {new Date(user.approved_at).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Status
                                </label>
                                <div className="mt-1">
                                  {getStatusBadge(user)}
                                </div>
                              </div>
                            </div>
                            {user.invitation_sent_at && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Invitation Sent
                                  </label>
                                  <p className="text-sm">
                                    {new Date(user.invitation_sent_at).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Token Expires
                                  </label>
                                  <p className="text-sm">
                                    {new Date(user.token_expires_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                            {user.last_login && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Last Login
                                </label>
                                <p className="text-sm">
                                  {new Date(user.last_login).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!user.invitation_sent_at ? (
                        <Button
                          size="sm"
                          onClick={() => handleResendInvitation(user.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Invite
                        </Button>
                      ) : !user.account_created && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(user.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No approved users found
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Approved users will appear here once you approve beta signups."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};