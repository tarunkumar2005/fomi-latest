"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface UnpublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPublishing?: boolean
}

export default function UnpublishDialog({ open, onOpenChange, onConfirm, isPublishing }: UnpublishDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-lg font-heading">Unpublish Form?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                This form will no longer be accessible to respondents. Any shared links will stop working until you
                publish it again.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Info Box */}
        <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> You can republish this form at any time. All your
            form data and responses will be preserved.
          </p>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
            disabled={isPublishing}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            {isPublishing ? "Unpublishing..." : "Unpublish Form"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}