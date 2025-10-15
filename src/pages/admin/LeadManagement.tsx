import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Users,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Building,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Lead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  team_size: string;
  main_challenge: string;
  urgency: string;
  lead_score: number;
  dominant_profile: string;
  status: string;
  converted_to_trial: boolean;
  converted_to_paid: boolean;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
}

interface LeadAnalytics {
  dominant_profile: string;
  total_leads: number;
  avg_lead_score: number;
  trial_conversions: number;
  paid_conversions: number;
  trial_conversion_rate: number;
  paid_conversion_rate: number;
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<LeadAnalytics[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    profile: '',
    status: '',
    urgency: '',
    search: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchLeads();
      fetchAnalytics();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_analytics')
        .select('*');

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (filters.profile) {
      filtered = filtered.filter(lead => lead.dominant_profile === filters.profile);
    }

    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.urgency) {
      filtered = filtered.filter(lead => lead.urgency === filters.urgency);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.first_name.toLowerCase().includes(searchLower) ||
        lead.last_name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status } : lead
      ));

      toast({
        title: "Success",
        description: "Lead status updated",
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          notes,
          last_contacted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead =>
        lead.id === leadId
          ? { ...lead, notes, last_contacted_at: new Date().toISOString() }
          : lead
      ));

      toast({
        title: "Success",
        description: "Lead notes updated",
      });
    } catch (error) {
      console.error('Error updating lead notes:', error);
      toast({
        title: "Error",
        description: "Failed to update lead notes",
        variant: "destructive"
      });
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 30) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 20) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'contacted': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'qualified': return "bg-green-100 text-green-700 border-green-200";
      case 'converted': return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Role', 'Team Size', 'Personality', 'Score', 'Status', 'Created'],
      ...filteredLeads.map(lead => [
        `${lead.first_name} ${lead.last_name}`,
        lead.email,
        lead.company || '',
        lead.role,
        lead.team_size,
        lead.dominant_profile,
        lead.lead_score,
        lead.status,
        format(new Date(lead.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access lead management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lead Management</h1>
            <p className="text-muted-foreground">Manage and track assessment leads</p>
          </div>
          <Button onClick={exportLeads} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{leads.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Lead Score</p>
                  <p className="text-2xl font-bold">
                    {leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.lead_score, 0) / leads.length) : 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trial Conversions</p>
                  <p className="text-2xl font-bold">
                    {leads.filter(lead => lead.converted_to_trial).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {leads.length > 0
                      ? Math.round((leads.filter(lead => lead.converted_to_trial).length / leads.length) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />

              <Select
                value={filters.profile}
                onValueChange={(value) => setFilters(prev => ({ ...prev, profile: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personality Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="strategist">Strategist</SelectItem>
                  <SelectItem value="executor">Executor</SelectItem>
                  <SelectItem value="collaborator">Collaborator</SelectItem>
                  <SelectItem value="optimizer">Optimizer</SelectItem>
                  <SelectItem value="explorer">Explorer</SelectItem>
                  <SelectItem value="perfectionist">Perfectionist</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="balancer">Balancer</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.urgency}
                onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilters({ profile: '', status: '', urgency: '', search: '' })}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Personality</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.dominant_profile}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreBadgeColor(lead.lead_score)}>
                          {lead.lead_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {lead.first_name} {lead.last_name}
                              </DialogTitle>
                              <DialogDescription>
                                Lead details and management
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLead && (
                              <LeadDetailsModal
                                lead={selectedLead}
                                onUpdateNotes={updateLeadNotes}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics by Personality Type */}
        {analytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Personality Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.map((item) => (
                  <Card key={item.dominant_profile} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold capitalize">{item.dominant_profile}</h4>
                        <Badge variant="outline">{item.total_leads} leads</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Score:</span>
                          <span className="font-medium">{Math.round(item.avg_lead_score)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trial Rate:</span>
                          <span className="font-medium">{item.trial_conversion_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid Rate:</span>
                          <span className="font-medium">{item.paid_conversion_rate}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Lead Details Modal Component
interface LeadDetailsModalProps {
  lead: Lead;
  onUpdateNotes: (leadId: string, notes: string) => void;
}

function LeadDetailsModal({ lead, onUpdateNotes }: LeadDetailsModalProps) {
  const [notes, setNotes] = useState(lead.notes || '');

  const handleSaveNotes = () => {
    onUpdateNotes(lead.id, notes);
  };

  return (
    <div className="space-y-6">
      {/* Lead Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="font-medium">{lead.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Company</label>
          <p className="font-medium">{lead.company || 'Not provided'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <p className="font-medium capitalize">{lead.role}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Team Size</label>
          <p className="font-medium">{lead.team_size}</p>
        </div>
      </div>

      {/* Challenge */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">Main Challenge</label>
        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{lead.main_challenge}</p>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this lead..."
          className="mt-1"
          rows={4}
        />
        <Button onClick={handleSaveNotes} className="mt-2" size="sm">
          Save Notes
        </Button>
      </div>
    </div>
  );
}