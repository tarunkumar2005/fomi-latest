"use client"

import { Plus, LayoutTemplate, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyCanvasStateProps {
  onAddBlankSection: () => void
  onOpenTemplates: () => void
}

export default function EmptyCanvasState({ onAddBlankSection, onOpenTemplates }: EmptyCanvasStateProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
      {/* Decorative header */}
      <div className="h-2 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <div className="p-8 sm:p-12 text-center">
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          {/* Decorative sparkle */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-5 w-5 text-primary/60" />
          </div>
        </div>

        {/* Text */}
        <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">Start building your form</h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          Add your first section to start collecting responses. Choose from templates or start with a blank section.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={onAddBlankSection}
            className={cn(
              "min-w-[180px] h-12 rounded-xl",
              "border-2 border-border hover:border-primary/40",
              "hover:bg-muted/50 transition-all duration-200",
              "font-medium shadow-sm hover:shadow-md",
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Blank Section
          </Button>
          <Button
            onClick={onOpenTemplates}
            className={cn(
              "min-w-[180px] h-12 rounded-xl",
              "bg-primary hover:bg-primary/90",
              "font-medium shadow-md hover:shadow-lg",
              "transition-all duration-200",
            )}
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>

        {/* Helper text */}
        <p className="mt-6 text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">S</kbd> to quickly add a
          section
        </p>
      </div>
    </div>
  )
}