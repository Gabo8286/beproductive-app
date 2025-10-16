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
  Mail,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Send,
  Globe,
  CheckCircle,
  Clock,
  MousePointer,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EmailRecord {
  id: string;
  beta_signup_id: string;
  recipient_email: string;
  recipient_name: string;
  email_type: 'invitation' | 'reminder' | 'welcome';
  language_code: 'en' | 'es';
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  subject: string;
  template_used: string;
}

export const EmailHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  // Mock data - will be replaced with real API calls
  const emailHistory: EmailRecord[] = [
    {
      id: "1",
      beta_signup_id: "signup-1",
      recipient_email: "john.pm@startup.co",
      recipient_name: "John Thompson",
      email_type: "invitation",
      language_code: "en",
      sent_at: "2025-01-14T15:35:00Z",
      delivered_at: "2025-01-14T15:35:45Z",
      opened_at: "2025-01-14T16:20:00Z",
      clicked_at: "2025-01-14T16:22:00Z",
      subject: "Welcome to BeProductive Beta - Your Invitation Inside! 🚀",
      template_used: "invitation_en_v1",
    },
    {
      id: "2",
      beta_signup_id: "signup-2",
      recipient_email: "maria.designer@agency.com",
      recipient_name: "Maria Garcia",
      email_type: "invitation",
      language_code: "es",
      sent_at: "2025-01-13T11:25:00Z",
      delivered_at: "2025-01-13T11:25:30Z",
      opened_at: "2025-01-13T14:10:00Z",
      clicked_at: "2025-01-13T14:12:00Z",
      subject: "¡Bienvenida al Beta de BeProductive - Tu Invitación Aquí! 🚀",
      template_used: "invitation_es_v1",
    },
    {
      id: "3",
      beta_signup_id: "signup-3",
      recipient_email: "alex.freelancer@email.com",
      recipient_name: "Alex Rodriguez",
      email_type: "invitation",
      language_code: "en",
      sent_at: "2025-01-12T14:15:00Z",
      delivered_at: "2025-01-12T14:15:20Z",
      opened_at: null,
      clicked_at: null,
      subject: "Welcome to BeProductive Beta - Your Invitation Inside! 🚀",
      template_used: "invitation_en_v1",
    },
    {
      id: "4",
      beta_signup_id: "signup-3",
      recipient_email: "alex.freelancer@email.com",
      recipient_name: "Alex Rodriguez",
      email_type: "reminder",
      language_code: "en",
      sent_at: "2025-01-14T14:15:00Z",
      delivered_at: "2025-01-14T14:15:25Z",
      opened_at: "2025-01-14T18:30:00Z",
      clicked_at: null,
      subject: "Don't Miss Out - Your BeProductive Beta Access Expires Soon",
      template_used: "reminder_en_v1",
    },
  ];

  const getEmailTypeBadge = (type: string) => {
    switch (type) {
      case "invitation":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Send className="h-3 w-3 mr-1" />
            Invitation
          </Badge>
        );
      case "reminder":
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <Clock className="h-3 w-3 mr-1" />
            Reminder
          </Badge>
        );
      case "welcome":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Welcome
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getDeliveryStatus = (email: EmailRecord) => {
    if (email.clicked_at) {
      return (
        <Badge className="bg-green-100 text-green-700">
          <MousePointer className="h-3 w-3 mr-1" />
          Clicked
        </Badge>
      );
    } else if (email.opened_at) {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Eye className="h-3 w-3 mr-1" />
          Opened
        </Badge>
      );
    } else if (email.delivered_at) {
      return (
        <Badge className="bg-gray-100 text-gray-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Sending
        </Badge>
      );
    }
  };

  const getLanguageFlag = (code: string) => {
    switch (code) {
      case "en":
        return "🇺🇸";
      case "es":
        return "🇪🇸";
      default:
        return "🌐";
    }
  };

  const filteredEmails = emailHistory.filter(email => {
    const matchesSearch = email.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || email.email_type === filterType;
    const matchesLanguage = filterLanguage === "all" || email.language_code === filterLanguage;

    return matchesSearch && matchesType && matchesLanguage;
  });

  // Calculate email stats
  const totalEmails = emailHistory.length;
  const deliveredEmails = emailHistory.filter(e => e.delivered_at).length;
  const openedEmails = emailHistory.filter(e => e.opened_at).length;
  const clickedEmails = emailHistory.filter(e => e.clicked_at).length;

  const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails * 100).toFixed(1) : "0";
  const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails * 100).toFixed(1) : "0";
  const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{totalEmails}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{deliveryRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold text-blue-600">{openRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold text-purple-600">{clickRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Email History ({totalEmails})
              </CardTitle>
              <CardDescription>
                Track all beta invitation emails and their engagement metrics
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invitation">Invitations</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-32">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email History Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{email.recipient_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {email.recipient_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEmailTypeBadge(email.email_type)}
                      <span className="text-lg">
                        {getLanguageFlag(email.language_code)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm line-clamp-2">{email.subject}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getDeliveryStatus(email)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(email.sent_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Email Details</DialogTitle>
                          <DialogDescription>
                            Complete delivery information for this email
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Recipient
                              </label>
                              <p className="text-sm">{email.recipient_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {email.recipient_email}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Type & Language
                              </label>
                              <div className="flex items-center gap-2">
                                {getEmailTypeBadge(email.email_type)}
                                <span>{getLanguageFlag(email.language_code)} {email.language_code.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Subject
                            </label>
                            <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                              {email.subject}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Template
                              </label>
                              <p className="text-sm">{email.template_used}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Current Status
                              </label>
                              <div className="mt-1">
                                {getDeliveryStatus(email)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Delivery Timeline</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                <Send className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Sent</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(email.sent_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {email.delivered_at && (
                                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Delivered</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(email.delivered_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {email.opened_at && (
                                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                                  <Eye className="h-4 w-4 text-purple-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Opened</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(email.opened_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {email.clicked_at && (
                                <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                                  <MousePointer className="h-4 w-4 text-orange-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Clicked</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(email.clicked_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEmails.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No emails found
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== "all" || filterLanguage !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Email history will appear here once you start sending invitations."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};