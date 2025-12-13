"use client"

import type React from "react"

import type { ReactNode } from "react"
import { Settings2, Info } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface AdvancedPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AdvancedPanel({ isOpen, onClose, title, subtitle, children }: AdvancedPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-md p-0",
          "border-l border-border/50",
          "bg-gradient-to-b from-card via-card to-muted/20",
        )}
      >
        {/* Header */}
        <SheetHeader
          className={cn(
            "px-6 py-5 border-b border-border/40",
            "bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-xl",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "border border-primary/20",
                "shadow-sm",
              )}
            >
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold text-foreground truncate">{title}</SheetTitle>
              {subtitle && (
                <SheetDescription className="text-sm text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-100px)]">
    Sheet <div className="p-6 space-y-6">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export function AdvancedPanelSection({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
          {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function AdvancedPanelInfoBox({
  icon: Icon = Info,
  children,
  variant = "default",
}: {
  icon?: React.ElementType
  children: ReactNode
  variant?: "default" | "warning" | "success"
}) {
  const variantStyles = {
    default: "bg-muted/50 border-border/50 [&_strong]:text-foreground",
    warning: "bg-warning/10 border-warning/30 [&_strong]:text-warning",
    success: "bg-success/10 border-success/30 [&_strong]:text-success",
  }

  const iconStyles = {
    default: "text-primary",
    warning: "text-warning",
    success: "text-success",
  }

  return (
    <div className={cn("p-4 rounded-xl border", "transition-colors duration-200", variantStyles[variant])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconStyles[variant])} />
        <div className="flex-1 text-xs leading-relaxed text-muted-foreground space-y-1.5">{children}</div>
      </div>
    </div>
  )
}

export function AdvancedPanelFieldGroup({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string
  htmlFor?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground block">
        {label}
      </label>
      {children}
      {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  )
}

export function AdvancedPanelDivider({ label }: { label?: string }) {
  if (label) {
    return (
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground font-medium">{label}</span>
        </div>
      </div>
    )
  }
  return <div className="border-t border-border/50 my-2" />
}