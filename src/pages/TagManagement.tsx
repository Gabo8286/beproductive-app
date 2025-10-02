import { TagManager } from "@/components/tags/TagManager";

export default function TagManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
        <p className="text-muted-foreground">
          Create and manage your task tags and categories
        </p>
      </div>

      <TagManager />
    </div>
  );
}
