"use client"

import { cn } from "@/lib/utils"

interface MobileOverlayProps {
  isVisible: boolean
  onClose: () => void
}

export default function MobileOverlay({ isVisible, onClose }: MobileOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      className={cn("md:hidden fixed inset-0 z-10", "bg-black/60 backdrop-blur-sm", "animate-in fade-in duration-200")}
      onClick={onClose}
      aria-hidden="true"
    />
  )
}