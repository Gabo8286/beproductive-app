import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  QrCode,
  Download,
  Copy,
  RefreshCw,
  Clock,
  Users,
  Shield,
  Sparkles,
  Calendar,
  Link,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdminAccess } from '@/hooks/useSupeRadminAccess';
import { toast } from 'sonner';

interface QRInvitation {
  id: string;
  token: string;
  url: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  description: string;
  created_at: string;
  qr_code_data_url: string;
}

export const SuperAdminQRGenerator: React.FC = () => {
  const { user } = useAuth();
  const { hasAccess, loading } = useSuperAdminAccess();

  const [qrInvitations, setQRInvitations] = useState<QRInvitation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Form state
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState(10);
  const [expiryDays, setExpiryDays] = useState(30);

  // Load existing QR invitations
  useEffect(() => {
    if (hasAccess) {
      loadQRInvitations();
    }
  }, [hasAccess]);

  const loadQRInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQRInvitations(data || []);
    } catch (error) {
      console.error('Error loading QR invitations:', error);
      toast.error('Failed to load QR invitations');
    } finally {
      setLoadingInvitations(false);
    }
  };

  const generateQRInvitation = async () => {
    if (!user?.id || !hasAccess) return;

    setIsGenerating(true);
    try {
      // Generate unique token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Create invitation URL
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/invitation/${token}?qr=true&auto_approve=true`;

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Store in database
      const { data, error } = await supabase
        .from('qr_invitations')
        .insert({
          token,
          url: invitationUrl,
          expires_at: expiresAt.toISOString(),
          max_uses: maxUses,
          current_uses: 0,
          description: description || 'Super Admin QR Invitation',
          created_by: user.id,
          qr_code_data_url: qrCodeDataUrl,
          auto_approve: true,
          invitation_source: 'qr_code'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setQRInvitations(prev => [data, ...prev]);

      // Reset form
      setDescription('');
      setMaxUses(10);
      setExpiryDays(30);

      toast.success('QR invitation generated successfully!');
    } catch (error) {
      console.error('Error generating QR invitation:', error);
      toast.error('Failed to generate QR invitation');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadQRCode = (qrCodeDataUrl: string, description: string) => {
    const link = document.createElement('a');
    link.download = `qr-invitation-${description.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const revokeInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_invitations')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;

      setQRInvitations(prev =>
        prev.map(inv =>
          inv.id === id
            ? { ...inv, revoked: true, revoked_at: new Date().toISOString() }
            : inv
        )
      );

      toast.success('QR invitation revoked successfully');
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast.error('Failed to revoke invitation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Super Admin Access Required
          </h3>
          <p className="text-gray-600">
            You need super admin privileges to generate QR invitations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Generate QR Code Invitation
          </CardTitle>
          <CardDescription>
            Create QR codes that automatically approve users when scanned and used for signup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conference 2024, Team Onboarding..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                max="1000"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDays">Expires In (Days)</Label>
              <Input
                id="expiryDays"
                type="number"
                min="1"
                max="365"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Auto-Approval Benefits</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Users are automatically approved without manual review</li>
                  <li>• Immediate access to BeProductive with 14-day Professional trial</li>
                  <li>• Perfect for events, team onboarding, and trusted referrals</li>
                  <li>• Full tracking and analytics for QR usage</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={generateQRInvitation}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating QR Code...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code Invitation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              QR Code Invitations
            </span>
            <Badge variant="secondary">
              {qrInvitations.length} Total
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage and track your QR code invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : qrInvitations.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No QR invitations generated yet</p>
              <p className="text-sm text-gray-500">Generate your first QR code above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {qrInvitations.map((invitation) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <img
                        src={invitation.qr_code_data_url}
                        alt="QR Code"
                        className="w-24 h-24 border rounded"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {invitation.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          {isExpired(invitation.expires_at) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                          {(invitation as any).revoked && (
                            <Badge variant="outline">Revoked</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{invitation.current_uses}/{invitation.max_uses} uses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expires {formatDate(invitation.expires_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Created {formatDate(invitation.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link className="h-4 w-4" />
                          <span className="truncate">{invitation.token.slice(0, 8)}...</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.url, 'Invitation URL')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(invitation.qr_code_data_url, invitation.description)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download QR
                        </Button>
                        {!(invitation as any).revoked && !isExpired(invitation.expires_at) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeInvitation(invitation.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};