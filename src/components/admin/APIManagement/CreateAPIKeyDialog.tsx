import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateAPIKeyRequest,
  APIProviderType,
  PROVIDER_LABELS,
  PROVIDER_CONFIGS,
} from "@/types/api-management";

interface CreateAPIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAPIKeyDialog: React.FC<CreateAPIKeyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState<Partial<CreateAPIKeyRequest>>({
    provider: "openai",
    key_name: "",
    api_key: "",
    description: "",
    monthly_limit_usd: 100,
    daily_request_limit: 1000,
    monthly_token_limit: 100000,
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create the key
      console.log("Creating API key:", formData);

      // Reset form and close dialog
      setFormData({
        provider: "openai",
        key_name: "",
        api_key: "",
        description: "",
        monthly_limit_usd: 100,
        daily_request_limit: 1000,
        monthly_token_limit: 100000,
        tags: [],
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating API key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProviderConfig = formData.provider
    ? PROVIDER_CONFIGS[formData.provider]
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New API Key</DialogTitle>
          <DialogDescription>
            Add a new API key for one of the supported providers. The key will
            be encrypted and stored securely.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value: APIProviderType) =>
                  setFormData({ ...formData, provider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_name">Key Name</Label>
              <Input
                id="key_name"
                value={formData.key_name}
                onChange={(e) =>
                  setFormData({ ...formData, key_name: e.target.value })
                }
                placeholder="Production API Key"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              type="password"
              value={formData.api_key}
              onChange={(e) =>
                setFormData({ ...formData, api_key: e.target.value })
              }
              placeholder="Enter your API key"
              required
            />
            <p className="text-xs text-gray-500">
              Your API key will be encrypted before storage and never displayed
              in plain text.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the purpose of this API key"
              rows={3}
            />
          </div>

          {selectedProviderConfig && (
            <div className="space-y-2">
              <Label htmlFor="model_name">Default Model</Label>
              <Select
                value={
                  formData.model_name || selectedProviderConfig.default_model
                }
                onValueChange={(value) =>
                  setFormData({ ...formData, model_name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderConfig.available_models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_limit">Monthly Limit ($)</Label>
              <Input
                id="monthly_limit"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_limit_usd}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthly_limit_usd: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_requests">Daily Requests</Label>
              <Input
                id="daily_requests"
                type="number"
                min="0"
                value={formData.daily_request_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_request_limit: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_tokens">Monthly Tokens</Label>
              <Input
                id="monthly_tokens"
                type="number"
                min="0"
                value={formData.monthly_token_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthly_token_limit: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.key_name || !formData.api_key}
            >
              {isSubmitting ? "Creating..." : "Create API Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
