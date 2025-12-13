"use client"

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormEditErrorStateProps {
  error: string
  onRetry: () => void
  onBack: () => void
}

export default function FormEditErrorState({ error, onRetry, onBack }: FormEditErrorStateProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Error Icon */}
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          {/* Decorative rings */}
          <div
            className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl border-2 border-destructive/20 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* Error Content */}
        <h2 className="text-2xl font-heading font-semibold mb-3 text-foreground">Failed to Load Form</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {error || "Something went wrong while loading your form. Please try again."}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-8">If this problem persists, please contact support.</p>
      </div>
    </div>
  )
}