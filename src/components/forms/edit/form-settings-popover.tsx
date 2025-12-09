"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Settings, CalendarDays, Users, UserCheck, MessageSquare, Loader2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface FormSettings {
  closeDate?: Date | null
  responseLimit?: number | null
  oneResponsePerUser?: boolean
  thankYouMessage?: string | null
}

interface FormSettingsPopoverProps {
  settings: FormSettings
  onSave: (settings: FormSettings) => Promise<void>
  trigger?: React.ReactNode
}

export default function FormSettingsPopover({ settings, onSave, trigger }: FormSettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  // Local state for editing
  const [closeDate, setCloseDate] = useState<Date | null>(settings.closeDate ? new Date(settings.closeDate) : null)
  const [responseLimit, setResponseLimit] = useState<string>(settings.responseLimit?.toString() || "")
  const [oneResponsePerUser, setOneResponsePerUser] = useState(settings.oneResponsePerUser || false)
  const [thankYouMessage, setThankYouMessage] = useState(settings.thankYouMessage || "")

  // Reset local state when popover opens
  useEffect(() => {
    if (isOpen) {
      setCloseDate(settings.closeDate ? new Date(settings.closeDate) : null)
      setResponseLimit(settings.responseLimit?.toString() || "")
      setOneResponsePerUser(settings.oneResponsePerUser || false)
      setThankYouMessage(settings.thankYouMessage || "")
      setShowCalendar(false)
    }
  }, [isOpen, settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        closeDate,
        responseLimit: responseLimit ? Number.parseInt(responseLimit) : null,
        oneResponsePerUser,
        thankYouMessage: thankYouMessage || null,
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCloseDate = () => {
    setCloseDate(null)
    setShowCalendar(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[320px] sm:w-[360px] p-0 shadow-xl border-border/50 rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Form Settings</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-background rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {/* Close Date */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <Label className="text-sm font-medium">Close Date</Label>
            </div>
            <div className="pl-9">
              {showCalendar ? (
                <div className="space-y-2">
                  <Calendar
                    mode="single"
                    selected={closeDate || undefined}
                    onSelect={(date: Date | undefined) => {
                      setCloseDate(date || null)
                      setShowCalendar(false)
                    }}
                    disabled={(date: Date) => date < new Date()}
                    className="rounded-xl border border-border/50 bg-background p-2"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground text-xs h-8 rounded-lg"
                    onClick={() => setShowCalendar(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 justify-start text-left font-normal h-9 text-xs rounded-lg border-border/50",
                      !closeDate && "text-muted-foreground",
                    )}
                    onClick={() => setShowCalendar(true)}
                  >
                    {closeDate ? format(closeDate, "PPP") : "No close date set"}
                  </Button>
                  {closeDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      onClick={handleClearCloseDate}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">Form stops accepting responses after this date</p>
            </div>
          </div>

          <div className="h-px bg-border/30" />

          {/* Response Limit */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <Label className="text-sm font-medium">Response Limit</Label>
            </div>
            <div className="pl-9">
              <Input
                type="number"
                placeholder="No limit"
                value={responseLimit}
                onChange={(e) => setResponseLimit(e.target.value)}
                min={1}
                className="h-9 text-sm rounded-lg border-border/50"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Maximum number of responses allowed</p>
            </div>
          </div>

          <div className="h-px bg-border/30" />

          {/* One Response Per User */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-0.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div>
                <Label className="text-sm font-medium">One response per user</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">Limit each user to a single response</p>
              </div>
            </div>
            <Switch checked={oneResponsePerUser} onCheckedChange={setOneResponsePerUser} className="mt-0.5" />
          </div>

          <div className="h-px bg-border/30" />

          {/* Thank You Message */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <Label className="text-sm font-medium">Thank You Message</Label>
            </div>
            <div className="pl-9">
              <Textarea
                placeholder="Thank you for your response!"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                rows={2}
                className="resize-none text-sm rounded-lg border-border/50"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Shown after form submission</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/50 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="h-8 px-3 text-xs rounded-lg"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 px-4 text-xs min-w-20 rounded-lg"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}