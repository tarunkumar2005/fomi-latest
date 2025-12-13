"use client";

import { useState } from "react";
import { useCreateWorkspace } from "@/hooks/useDashboard";
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
import { Building2, Loader2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createWorkspace = useCreateWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a workspace name");
      return;
    }

    try {
      await createWorkspace.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // Reset form and close modal
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create workspace"
      );
    }
  };

  const handleClose = () => {
    if (!createWorkspace.isPending) {
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Create Workspace</DialogTitle>
            </div>
            <DialogDescription>
              Workspaces help you organize your forms and collaborate with your
              team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workspace-name"
                type="text"
                placeholder="e.g., Acme Corp, Marketing Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createWorkspace.isPending}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a name that identifies your organization or team.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="workspace-description"
                className="text-sm font-medium"
              >
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="workspace-description"
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createWorkspace.isPending}
                className="resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/200 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWorkspace.isPending || !name.trim()}
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
