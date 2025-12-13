"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddSectionButtonProps {
  onClick: () => void
}

export default function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full max-w-md mx-auto py-4 px-5",
        "border-2 border-dashed border-border/50 rounded-xl",
        "hover:border-primary/40 hover:bg-primary/5",
        "transition-all duration-200 ease-out",
        "text-muted-foreground hover:text-primary",
        "text-sm font-medium",
        "flex items-center justify-center gap-2",
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
    >
      <div className="h-7 w-7 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
      </div>
      <span>Add Section</span>
    </button>
  )
}