"use client"

import type { ReactNode } from "react"
import { X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AdvancedPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  showFooter?: boolean
  footerButtonText?: string
  onFooterButtonClick?: () => void
}

export default function AdvancedPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showFooter = true,
  footerButtonText = "Done",
  onFooterButtonClick,
}: AdvancedPanelProps) {
  const handleFooterClick = () => {
    if (onFooterButtonClick) {
      onFooterButtonClick()
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Advanced Panel - Slide from Right */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[400px] md:w-[420px] bg-background border-l border-border/50 shadow-2xl z-50",
          "animate-in slide-in-from-right duration-300",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-muted/80"
              aria-label="Close advanced settings"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Panel Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">{children}</div>

          {/* Panel Footer */}
          {showFooter && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/20">
              <Button
                onClick={handleFooterClick}
                className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base font-medium"
                size="lg"
              >
                {footerButtonText}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
      />
    </>
  )
}