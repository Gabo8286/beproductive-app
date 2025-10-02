import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Key,
  Edit,
  RotateCw,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  AlertTriangle,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { APIKey, APIKeyStatus, APIProviderType, PROVIDER_LABELS, API_KEY_STATUS_LABELS } from '@/types/api-management';
import { CreateAPIKeyDialog } from './CreateAPIKeyDialog';
import { EditAPIKeyDialog } from './EditAPIKeyDialog';

export const APIKeyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<APIProviderType | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Mock data - will be replaced with real API calls
  const apiKeys: APIKey[] = [
    {
      id: '1',
      provider: 'openai',
      key_name: 'Production OpenAI',
      encrypted_key: 'encrypted_key_data_1',
      key_hash: 'hash_1',
      status: 'active',
      monthly_limit_usd: 500,
      current_month_cost: 247.32,
      total_lifetime_cost: 1247.89,
      daily_request_limit: 1000,
      current_day_requests: 456,
      monthly_token_limit: 1000000,
      current_month_tokens: 567890,
      model_name: 'gpt-4',
      description: 'Primary OpenAI key for production workloads',
      tags: ['production', 'critical'],
      additional_headers: {},
      provider_config: {},
      metadata: {},
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      last_used_at: '2024-01-20T14:22:00Z',
    },
    {
      id: '2',
      provider: 'claude',
      key_name: 'Development Claude',
      encrypted_key: 'encrypted_key_data_2',
      key_hash: 'hash_2',
      status: 'active',
      monthly_limit_usd: 200,
      current_month_cost: 89.45,
      total_lifetime_cost: 345.67,
      daily_request_limit: 500,
      current_day_requests: 123,
      monthly_token_limit: 500000,
      current_month_tokens: 234567,
      model_name: 'claude-3-sonnet',
      description: 'Development and testing key',
      tags: ['development', 'testing'],
      additional_headers: {},
      provider_config: {},
      metadata: {},
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z',
      last_used_at: '2024-01-20T11:45:00Z',
    },
  ];

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.key_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || key.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const getStatusBadge = (status: APIKeyStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={colors[status]}>
        {API_KEY_STATUS_LABELS[status]}
      </Badge>
    );
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return limit > 0 ? (current / limit) * 100 : 0;
  };

  const getUsageBadge = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-green-600';
  };

  const handleCopyKey = async (keyId: string) => {
    // In real implementation, this would decrypt and copy the key
    // For now, just show feedback
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRotateKey = (key: APIKey) => {
    // TODO: Implement key rotation
    console.log('Rotating key:', key.id);
  };

  const handleDeleteKey = (key: APIKey) => {
    // TODO: Implement key deletion with confirmation
    console.log('Deleting key:', key.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor your API keys for different providers
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value as APIProviderType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
          <option value="lovable">Lovable</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys ({filteredKeys.length})
          </CardTitle>
          <CardDescription>
            Manage API keys for different AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name & Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Monthly Cost</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.map((key) => {
                const costPercentage = getUsagePercentage(key.current_month_cost, key.monthly_limit_usd);
                const requestPercentage = getUsagePercentage(key.current_day_requests, key.daily_request_limit);
                const tokenPercentage = getUsagePercentage(key.current_month_tokens, key.monthly_token_limit);

                return (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{key.key_name}</span>
                          {key.tags.includes('production') && (
                            <Badge variant="secondary" className="text-xs">PROD</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{PROVIDER_LABELS[key.provider]}</span>
                          {key.model_name && (
                            <>
                              <span>•</span>
                              <span>{key.model_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(key.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3" />
                          <span className={getUsageBadge(costPercentage)}>
                            {costPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-3 w-3" />
                          <span className={getUsageBadge(requestPercentage)}>
                            {requestPercentage.toFixed(1)}%
                          </span>
                        </div>
                        {costPercentage >= 75 && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          ${key.current_month_cost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          / ${key.monthly_limit_usd.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {key.last_used_at ?
                          new Date(key.last_used_at).toLocaleDateString() :
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleCopyKey(key.id)}>
                            {copiedKeyId === key.id ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Key
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingKey(key)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRotateKey(key)}>
                            <RotateCw className="mr-2 h-4 w-4" />
                            Rotate Key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteKey(key)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedProvider !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first API key.'
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateAPIKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {editingKey && (
        <EditAPIKeyDialog
          apiKey={editingKey}
          open={!!editingKey}
          onOpenChange={(open) => !open && setEditingKey(null)}
        />
      )}
    </div>
  );
};