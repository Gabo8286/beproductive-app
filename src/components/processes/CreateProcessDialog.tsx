import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Workflow } from "lucide-react";
import { ProcessCategory, ProcessComplexity, ProcessPriority } from "@/types/processes";
import { useProcesses } from "@/hooks/useProcesses";
import { useAuth } from "@/contexts/AuthContext";

const createProcessSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  category: z.enum(["operational", "administrative", "strategic", "compliance", "quality", "hr", "finance", "it", "other"]),
  complexity: z.enum(["simple", "moderate", "complex", "very_complex"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  triggers: z.array(z.string()).optional(),
  inputs: z.array(z.string()).optional(),
  outputs: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  controls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type CreateProcessForm = z.infer<typeof createProcessSchema>;

interface CreateProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProcessDialog({ open, onOpenChange }: CreateProcessDialogProps) {
  const { user } = useAuth();
  const { createProcess } = useProcesses();

  const [triggers, setTriggers] = useState<string[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [controls, setControls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [newTrigger, setNewTrigger] = useState("");
  const [newInput, setNewInput] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newRisk, setNewRisk] = useState("");
  const [newControl, setNewControl] = useState("");
  const [newTag, setNewTag] = useState("");

  const form = useForm<CreateProcessForm>({
    resolver: zodResolver(createProcessSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "operational",
      complexity: "moderate",
      priority: "medium",
      triggers: [],
      inputs: [],
      outputs: [],
      risks: [],
      controls: [],
      tags: [],
    },
  });

  const onSubmit = async (data: CreateProcessForm) => {
    if (!user?.id) return;

    try {
      await createProcess.mutateAsync({
        workspace_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        complexity: data.complexity,
        priority: data.priority,
        triggers,
        inputs,
        outputs,
        risks,
        controls,
        tags,
      });

      form.reset();
      setTriggers([]);
      setInputs([]);
      setOutputs([]);
      setRisks([]);
      setControls([]);
      setTags([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create process:", error);
    }
  };

  const addItem = (item: string, setter: (items: string[]) => void, items: string[], inputSetter: (value: string) => void) => {
    if (item.trim() && !items.includes(item.trim())) {
      setter([...items, item.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (item: string, setter: (items: string[]) => void, items: string[]) => {
    setter(items.filter(i => i !== item));
  };

  const ListInput = ({
    items,
    setItems,
    newItem,
    setNewItem,
    placeholder,
    label
  }: {
    items: string[];
    setItems: (items: string[]) => void;
    newItem: string;
    setNewItem: (value: string) => void;
    placeholder: string;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem(newItem, setItems, items, setNewItem);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem(newItem, setItems, items, setNewItem)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item, setItems, items)}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            Create New Process
          </DialogTitle>
          <DialogDescription>
            Document a new business process with its steps, requirements, and controls.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter process title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose and scope of this process..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="administrative">Administrative</SelectItem>
                          <SelectItem value="strategic">Strategic</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complexity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                          <SelectItem value="very_complex">Very Complex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ListInput
                  items={triggers}
                  setItems={setTriggers}
                  newItem={newTrigger}
                  setNewItem={setNewTrigger}
                  placeholder="e.g., Customer request"
                  label="Process Triggers"
                />

                <ListInput
                  items={tags}
                  setItems={setTags}
                  newItem={newTag}
                  setNewItem={setNewTag}
                  placeholder="e.g., customer-service"
                  label="Tags"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ListInput
                  items={inputs}
                  setItems={setInputs}
                  newItem={newInput}
                  setNewItem={setNewInput}
                  placeholder="e.g., Customer information"
                  label="Required Inputs"
                />

                <ListInput
                  items={outputs}
                  setItems={setOutputs}
                  newItem={newOutput}
                  setNewItem={setNewOutput}
                  placeholder="e.g., Completed order"
                  label="Expected Outputs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ListInput
                  items={risks}
                  setItems={setRisks}
                  newItem={newRisk}
                  setNewItem={setNewRisk}
                  placeholder="e.g., Data loss risk"
                  label="Identified Risks"
                />

                <ListInput
                  items={controls}
                  setItems={setControls}
                  newItem={newControl}
                  setNewItem={setNewControl}
                  placeholder="e.g., Regular backups"
                  label="Risk Controls"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProcess.isPending}>
                {createProcess.isPending ? "Creating..." : "Create Process"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}