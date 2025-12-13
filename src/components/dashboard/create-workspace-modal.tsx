"use client"

import type React from "react"

import { useState } from "react"
import { useCreateWorkspace } from "@/hooks/useDashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const createWorkspace = useCreateWorkspace()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Please enter a workspace name")
      return
    }

    try {
      await createWorkspace.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      })

      setName("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating workspace:", error)
      alert(error instanceof Error ? error.message : "Failed to create workspace")
    }
  }

  const handleClose = () => {
    if (!createWorkspace.isPending) {
      setName("")
      setDescription("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/50">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-4 mb-2">
              {/* Icon with gradient background */}
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-xl font-heading font-semibold">Create Workspace</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                  Organize your forms and collaborate with your team
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-4">
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
                className={cn(
                  "h-11 rounded-xl bg-muted/50 border-border/50",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "transition-all duration-200",
                )}
              />
              <p className="text-xs text-muted-foreground">Choose a name that identifies your organization or team</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="workspace-description" className="text-sm font-medium">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="workspace-description"
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createWorkspace.isPending}
                className={cn(
                  "resize-none rounded-xl bg-muted/50 border-border/50",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "transition-all duration-200",
                )}
                rows={3}
                maxLength={200}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Brief description of the workspace purpose</p>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    description.length > 180 ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  {description.length}/200
                </span>
              </div>
            </div>

            {/* Pro tip */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span> You can invite team members and set
                permissions after creating the workspace.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createWorkspace.isPending}
              className="rounded-xl bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWorkspace.isPending || !name.trim()}
              className={cn(
                "rounded-xl",
                "bg-primary hover:bg-primary/90",
                "shadow-sm hover:shadow-md hover:shadow-primary/20",
                "transition-all duration-200",
              )}
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}