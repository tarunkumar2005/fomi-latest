"use client"

export default function FormEditLoadingState() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Loading Header Skeleton */}
      <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 sm:w-20 h-9 bg-muted/60 animate-pulse rounded-lg" />
          <div className="h-6 w-px bg-border/50 hidden sm:block" />
          <div className="w-32 sm:w-48 h-6 bg-muted/60 animate-pulse rounded-lg" />
          <div className="w-14 sm:w-16 h-5 bg-muted/60 animate-pulse rounded-full hidden sm:block" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 bg-muted/60 animate-pulse rounded-lg sm:hidden" />
          <div className="hidden sm:block w-20 h-9 bg-muted/60 animate-pulse rounded-lg" />
          <div className="w-20 sm:w-24 h-9 bg-primary/20 animate-pulse rounded-lg" />
          <div className="hidden sm:block w-9 h-9 bg-muted/60 animate-pulse rounded-lg" />
          <div className="hidden sm:block w-9 h-9 bg-muted/60 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Loading Canvas Content */}
      <div className="flex-1 overflow-hidden" role="status" aria-busy="true" aria-live="polite">
        <div className="h-full flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-4xl w-full mx-auto space-y-4 sm:space-y-6">
            {/* Form Header Skeleton */}
            <div className="w-full bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
              <div className="h-40 sm:h-56 lg:h-64 bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40 animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>

              <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-8 sm:h-10 lg:h-12 bg-muted/60 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-8 sm:h-10 lg:h-12 bg-muted/40 rounded-lg w-1/2 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <div className="h-4 sm:h-5 bg-muted/50 rounded-md w-full animate-pulse" />
                  <div className="h-4 sm:h-5 bg-muted/40 rounded-md w-5/6 animate-pulse" />
                  <div className="h-4 sm:h-5 bg-muted/30 rounded-md w-4/6 animate-pulse" />
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                    <div className="w-14 sm:w-16 h-4 bg-muted/40 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                    <div className="w-20 sm:w-24 h-4 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Skeletons */}
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-lg animate-pulse" />
                      <div className="h-5 sm:h-6 bg-muted/60 rounded-md w-2/3 animate-pulse" />
                    </div>
                    <div className="h-4 bg-muted/40 rounded-md w-1/2 animate-pulse" />
                    <div className="h-10 bg-muted/30 rounded-lg w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Spinner */}
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
              <div className="relative" aria-hidden="true">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div
                  className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-b-primary/40 rounded-full animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                />
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <p className="text-base sm:text-lg font-semibold text-foreground">Loading your form</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Please wait while we fetch your data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}