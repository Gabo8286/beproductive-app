import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APIKey, UpdateAPIKeyRequest, API_KEY_STATUS_LABELS, PROVIDER_CONFIGS } from '@/types/api-management';

interface EditAPIKeyDialogProps {
  apiKey: APIKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAPIKeyDialog: React.FC<EditAPIKeyDialogProps> = ({
  apiKey,
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState<UpdateAPIKeyRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setFormData({
        key_name: apiKey.key_name,
        description: apiKey.description,
        status: apiKey.status,
        monthly_limit_usd: apiKey.monthly_limit_usd,
        daily_request_limit: apiKey.daily_request_limit,
        monthly_token_limit: apiKey.monthly_token_limit,
        model_name: apiKey.model_name,
        api_version: apiKey.api_version,
        base_url: apiKey.base_url,
        tags: apiKey.tags,
      });
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to update the key
      console.log('Updating API key:', apiKey.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerConfig = PROVIDER_CONFIGS[apiKey.provider];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the configuration and limits for this API key.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key_name">Key Name</Label>
              <Input
                id="key_name"
                value={formData.key_name || ''}
                onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(API_KEY_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_name">Model</Label>
            <Select
              value={formData.model_name || ''}
              onValueChange={(value) => setFormData({ ...formData, model_name: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerConfig.available_models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_limit">Monthly Limit ($)</Label>
              <Input
                id="monthly_limit"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_limit_usd || 0}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_limit_usd: parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_requests">Daily Requests</Label>
              <Input
                id="daily_requests"
                type="number"
                min="0"
                value={formData.daily_request_limit || 0}
                onChange={(e) =>
                  setFormData({ ...formData, daily_request_limit: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_tokens">Monthly Tokens</Label>
              <Input
                id="monthly_tokens"
                type="number"
                min="0"
                value={formData.monthly_token_limit || 0}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_token_limit: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_url">Base URL (Optional)</Label>
            <Input
              id="base_url"
              value={formData.base_url || ''}
              onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
              placeholder={providerConfig.base_url}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.key_name}>
              {isSubmitting ? 'Updating...' : 'Update API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};