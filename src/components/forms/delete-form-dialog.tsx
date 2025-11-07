"use client";

import { useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";

interface DeleteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formName: string;
  onDelete?: (formId: string) => Promise<void>;
}

export default function DeleteFormDialog({
  open,
  onOpenChange,
  formId,
  formName,
  onDelete,
}: DeleteFormDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== formName) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(formId);
      } else {
        // TODO: Implement API call to delete form
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        console.log(`Deleting form: ${formId}`);
      }
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Failed to delete form:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  const isConfirmValid = confirmText === formName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl">
                Delete Form
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="font-body pt-2">
            This action cannot be undone. This will permanently delete the form
            and all associated data including responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Form Info */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="font-body text-sm text-muted-foreground mb-1">
              Form to be deleted:
            </p>
            <p className="font-heading text-base font-semibold text-foreground">
              {formName}
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label
              htmlFor="confirm-delete"
              className="font-body text-sm font-medium"
            >
              Type{" "}
              <span className="font-semibold text-foreground">{formName}</span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter form name"
              className="font-body"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Form"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
