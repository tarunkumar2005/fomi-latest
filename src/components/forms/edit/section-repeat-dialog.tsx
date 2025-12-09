"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Info,
  Repeat,
  Users,
  Package,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionRepeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  currentIsRepeatable: boolean;
  currentRepeatCount: number | null;
  hasConditionalLogic: boolean;
  onSave: (isRepeatable: boolean, repeatCount: number) => Promise<void>;
}

export default function SectionRepeatDialog({
  open,
  onOpenChange,
  sectionId,
  sectionTitle,
  currentIsRepeatable,
  currentRepeatCount,
  hasConditionalLogic,
  onSave,
}: SectionRepeatDialogProps) {
  const [isRepeatable, setIsRepeatable] = useState(currentIsRepeatable);
  const [repeatCount, setRepeatCount] = useState(currentRepeatCount || 3);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsRepeatable(currentIsRepeatable);
      setRepeatCount(currentRepeatCount || 3);
      setError(null);
    }
  }, [open, currentIsRepeatable, currentRepeatCount]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate repeat count
      if (isRepeatable && (repeatCount < 1 || repeatCount > 10)) {
        setError("Repeat count must be between 1 and 10");
        setIsSaving(false);
        return;
      }

      await onSave(isRepeatable, repeatCount);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving repeatability:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const useCaseExamples = [
    {
      icon: Users,
      title: "Family Members",
      description: "Let users add multiple family members with same details",
      color: "text-chart-1",
    },
    {
      icon: Package,
      title: "Product Items",
      description: "Allow adding multiple products to an order",
      color: "text-success",
    },
    {
      icon: Briefcase,
      title: "Work Experience",
      description: "Collect multiple job history entries",
      color: "text-chart-5",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Repeatable Section Settings
          </DialogTitle>
          <DialogDescription>
            Allow form respondents to add multiple instances of "{sectionTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Conditional Logic Conflict Warning */}
          {hasConditionalLogic && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This section has conditional navigation logic. You must remove
                conditional logic before enabling repeatability, as they cannot
                work together.
              </AlertDescription>
            </Alert>
          )}

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="repeatable-toggle"
                className="text-base font-semibold cursor-pointer"
              >
                Make this section repeatable
              </Label>
              <p className="text-sm text-muted-foreground">
                Users can add multiple instances of this section when filling
                the form
              </p>
            </div>
            <Switch
              id="repeatable-toggle"
              checked={isRepeatable}
              onCheckedChange={setIsRepeatable}
              disabled={hasConditionalLogic}
            />
          </div>

          {/* Repeat Count Setting */}
          {isRepeatable && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Maximum Instances
              </Label>
              <p className="text-sm text-muted-foreground">
                How many times can users repeat this section? (1-10)
              </p>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={repeatCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setRepeatCount(Math.min(Math.max(val, 1), 10));
                    }
                  }}
                  className="w-32"
                />
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(repeatCount / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {repeatCount} max
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {isRepeatable && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Preview</Label>
              <p className="text-sm text-muted-foreground">
                How it will appear to form respondents
              </p>
              <div className="rounded-lg border-2 border-dashed border-border p-6 bg-muted/30">
                <div className="space-y-3">
                  {/* Instance 1 */}
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {sectionTitle} #1
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      [Form fields will appear here]
                    </p>
                  </div>

                  {/* Add More Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Add Another {sectionTitle}
                    {repeatCount > 1 && ` (up to ${repeatCount})`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Users can add up to {repeatCount} instances
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Use Cases Info */}
          {!hasConditionalLogic && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Common use cases:</p>
                <div className="space-y-2">
                  {useCaseExamples.map((example, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <example.icon
                        className={cn("h-4 w-4 mt-0.5", example.color)}
                      />
                      <div>
                        <p className="text-sm font-medium">{example.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {example.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || hasConditionalLogic}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
