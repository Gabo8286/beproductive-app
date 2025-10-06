import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Upload, Settings, Shield, User, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({ full_name: fullName });

    if (error) {
      toast.error(error.message || "Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await updateProfile({
        avatar_url: data.publicUrl,
      });

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.full_name || ""}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("avatar")?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Personal Information</CardTitle>
            <Badge variant="secondary">Essential</Badge>
          </div>
          <CardDescription>Update your basic profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value={profile?.role || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your role
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Profile Settings - Progressive Disclosure */}
      <Card>
        <CardContent className="pt-6">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full py-2">
                <div className="flex items-center gap-2 text-left">
                  <Settings className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Advanced Profile Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Additional profile customization and privacy options
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-6 pt-4">
                <Separator />

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <h4 className="font-medium">Display Preferences</h4>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        type="text"
                        value="UTC"
                        disabled
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Automatically detected from your system
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        type="text"
                        value="English"
                        disabled
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Change language in the header menu
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="font-medium">Privacy & Data</h4>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="user-id">User ID</Label>
                      <Input
                        id="user-id"
                        type="text"
                        value={profile?.id || ""}
                        disabled
                        className="text-sm font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your unique identifier in the system
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="created-at">Account Created</Label>
                      <Input
                        id="created-at"
                        type="text"
                        value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                        disabled
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        When your account was first created
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm">
                        <Shield className="mr-2 h-4 w-4" />
                        Download My Data
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Export all your profile data and activity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
