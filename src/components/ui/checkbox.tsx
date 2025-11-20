"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles
        "peer size-4 shrink-0 rounded-lg shadow-xs transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50",
        
        // Border and background logic
        "border dark:bg-input/30 border-input bg-background",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        
        // New enhancement for visibility when unchecked
        "data-[state=unchecked]:border-primary/40 hover:data-[state=unchecked]:border-primary focus-visible:data-[state=unchecked]:border-primary",
        
        // Focus and invalid styles
        "focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
