"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { X, Palette, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CanvasSidebarProps {
  side: "left" | "right"
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon: "palette" | "sparkles"
  children: React.ReactNode
}

export default function CanvasSidebar({ side, isOpen, onClose, title, subtitle, icon, children }: CanvasSidebarProps) {
  const Icon = icon === "palette" ? Palette : Sparkles

  return (
    <div
      className={cn(
        "absolute top-0 h-full z-20",
        "bg-card/98 backdrop-blur-xl border-border/50 shadow-2xl",
        "transition-transform duration-300 ease-out",
        "w-[320px] lg:w-[380px]",
        // Position and animation
        side === "left" && "left-0 border-r",
        side === "right" && "right-0 border-l",
        side === "left" && (isOpen ? "translate-x-0" : "-translate-x-full"),
        side === "right" && (isOpen ? "translate-x-0" : "translate-x-full"),
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-base lg:text-lg font-semibold text-foreground">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-muted"
            aria-label={`Close ${title}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}