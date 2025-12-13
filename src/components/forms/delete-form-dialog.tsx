"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeleteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formId: string
  formName: string
  onDelete?: (formId: string) => Promise<void>
}

export default function DeleteFormDialog({ open, onOpenChange, formId, formName, onDelete }: DeleteFormDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmValid = confirmText === formName

  const handleDelete = async () => {
    if (!isConfirmValid) return

    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(formId)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      onOpenChange(false)
      setConfirmText("")
    } catch (error) {
      console.error("Failed to delete form:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setConfirmText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/60 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle className="font-heading text-xl">Delete Form</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-0.5">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Warning</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deleting this form will permanently remove all associated data including responses, settings, and
                integrations.
              </p>
            </div>
          </div>

          {/* Form Info */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Form to be deleted:</p>
            <p className="font-heading text-base font-semibold text-foreground">{formName}</p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              Type{" "}
              <code className="font-mono text-xs font-semibold text-foreground px-2 py-1 bg-muted rounded-md border border-border/60">
                {formName}
              </code>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter form name to confirm"
              className={cn(
                "rounded-xl h-11 transition-all",
                isConfirmValid && "border-destructive/50 focus-visible:ring-destructive/30",
              )}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-muted-foreground">Text doesn&apos;t match. Please type the exact form name.</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="rounded-xl h-10 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="rounded-xl h-10 min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Form
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}