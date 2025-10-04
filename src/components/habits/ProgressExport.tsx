import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useHabitEntries } from "@/hooks/useHabitEntries";
import { format } from "date-fns";

interface ProgressExportProps {
  habitId: string;
  habitTitle: string;
}

export function ProgressExport({ habitId, habitTitle }: ProgressExportProps) {
  const { data: entries } = useHabitEntries(habitId);

  const exportToCSV = () => {
    if (!entries || entries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Status",
      "Duration (min)",
      "Mood",
      "Energy",
      "Notes",
    ];
    const csvContent = [
      headers.join(","),
      ...entries.map((e) =>
        [
          e.date,
          e.status,
          e.duration_minutes || "",
          e.mood || "",
          e.energy_level || "",
          `"${(e.notes || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${habitTitle.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Exported to CSV");
  };

  const exportToJSON = () => {
    if (!entries || entries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const jsonData = {
      habit: habitTitle,
      exported_at: new Date().toISOString(),
      entries: entries,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${habitTitle.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Exported to JSON");
  };

  const shareProgress = () => {
    const completionRate = entries?.length
      ? (
          (entries.filter((e) => e.status === "completed").length /
            entries.length) *
          100
        ).toFixed(1)
      : "0";

    const text = `I've been tracking my "${habitTitle}" habit with ${entries?.length || 0} entries and a ${completionRate}% completion rate! 🎯`;

    if (navigator.share) {
      navigator
        .share({
          title: "My Habit Progress",
          text: text,
        })
        .catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={exportToCSV} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>

          <Button variant="outline" onClick={exportToJSON} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Export to JSON
          </Button>

          <Button variant="outline" onClick={shareProgress} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>

          <Button variant="outline" disabled className="w-full">
            <ImageIcon className="h-4 w-4 mr-2" />
            Export Image
            <span className="ml-2 text-xs">(Coming Soon)</span>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Export your habit data or share your progress with others.
        </p>
      </CardContent>
    </Card>
  );
}
