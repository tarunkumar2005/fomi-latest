"use client"

import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
}

export default function LoadingState({ message = "Loading sections...", className }: LoadingStateProps) {
  return (
    <div
      className={cn("bg-card rounded-2xl border border-border/60 p-8 sm:p-12 shadow-sm", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center justify-center">
        {/* Animated loader */}
        <div className="relative mb-4">
          <div className="h-12 w-12 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>

        {/* Skeleton content */}
        <div className="space-y-3 w-full max-w-xs">
          <div className="h-4 bg-muted rounded-full animate-pulse" />
          <div className="h-4 bg-muted rounded-full animate-pulse w-3/4 mx-auto" />
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground mt-4 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Full page loading state
export function FullPageLoading({ message = "Loading your workspace..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated rings */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div
            className="absolute inset-2 h-16 w-16 rounded-full border-4 border-primary/30 border-b-transparent animate-spin animation-delay-150"
            style={{ animationDirection: "reverse" }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}