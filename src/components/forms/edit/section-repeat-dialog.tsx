"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Info, Repeat, Users, Package, Briefcase, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionRepeatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionTitle: string
  isRepeatable: boolean
  repeatCount: number | null
  onSave: (isRepeatable: boolean, repeatCount?: number) => Promise<void>
}

const useCaseExamples = [
  {
    icon: Users,
    title: "Family Members",
    description: "Let users add multiple family members with same details",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Package,
    title: "Product Items",
    description: "Allow adding multiple products to an order",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: Briefcase,
    title: "Work Experience",
    description: "Collect multiple job history entries",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
]

export default function SectionRepeatDialog({
  open,
  onOpenChange,
  sectionTitle,
  isRepeatable: currentIsRepeatable,
  repeatCount: currentRepeatCount,
  onSave,
}: SectionRepeatDialogProps) {
  const [isRepeatable, setIsRepeatable] = useState(currentIsRepeatable)
  const [repeatCount, setRepeatCount] = useState(currentRepeatCount || 3)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setIsRepeatable(currentIsRepeatable)
      setRepeatCount(currentRepeatCount || 3)
      setError(null)
    }
  }, [open, currentIsRepeatable, currentRepeatCount])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      if (isRepeatable && (repeatCount < 1 || repeatCount > 10)) {
        setError("Repeat count must be between 1 and 10")
        setIsSaving(false)
        return
      }

      await onSave(isRepeatable, repeatCount)
      onOpenChange(false)
    } catch (err) {
      console.error("Error saving repeatability:", err)
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Repeat className="h-5 w-5 text-warning" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold">Repeatable Section Settings</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Allow respondents to add multiple instances of "{sectionTitle}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Enable/Disable Toggle */}
            <div
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border-2 p-4 transition-all duration-200",
                isRepeatable ? "border-warning bg-warning/5" : "border-border/50 hover:border-border",
              )}
            >
              <div className="flex-1 space-y-1">
                <Label htmlFor="repeatable-toggle" className="text-sm sm:text-base font-semibold cursor-pointer">
                  Make this section repeatable
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Users can add multiple instances of this section when filling the form
                </p>
              </div>
              <Switch id="repeatable-toggle" checked={isRepeatable} onCheckedChange={setIsRepeatable} />
            </div>

            {/* Repeat Count Setting */}
            {isRepeatable && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-sm sm:text-base font-semibold">Maximum Instances</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  How many times can users repeat this section? (1-10)
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={repeatCount}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val)) {
                        setRepeatCount(Math.min(Math.max(val, 1), 10))
                      }
                    }}
                    className="w-full sm:w-28 h-10 rounded-lg"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-2.5 flex-1 sm:w-32 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warning to-warning/70 transition-all duration-300 rounded-full"
                        style={{ width: `${(repeatCount / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap">
                      {repeatCount} max
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {isRepeatable && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-sm sm:text-base font-semibold">Preview</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">How it will appear to form respondents</p>
                <div className="rounded-xl border-2 border-dashed border-border/50 p-4 sm:p-6 bg-muted/20">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border/50 bg-card p-3 sm:p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">{sectionTitle} #1</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">[Form fields will appear here]</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-9 rounded-lg border-dashed bg-transparent"
                      disabled
                    >
                      <Repeat className="h-3.5 w-3.5 mr-2" />
                      <span className="text-xs sm:text-sm">
                        Add Another {sectionTitle}
                        {repeatCount > 1 && ` (up to ${repeatCount})`}
                      </span>
                    </Button>

                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      Users can add up to {repeatCount} instances
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Use Cases Info */}
            {!isRepeatable && (
              <Alert className="rounded-xl border-chart-2/20 bg-chart-2/5">
                <Info className="h-4 w-4 text-chart-2" />
                <AlertDescription>
                  <p className="font-medium mb-3 text-xs sm:text-sm text-chart-2">Common use cases:</p>
                  <div className="space-y-2.5">
                    {useCaseExamples.map((example, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className={cn("p-1.5 rounded-lg", example.bg)}>
                          <example.icon className={cn("h-3.5 w-3.5", example.color)} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-foreground">{example.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{example.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-9 px-4 text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-5 text-sm rounded-lg min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}