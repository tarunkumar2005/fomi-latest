"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingDown, Filter, Trophy, Eye, MousePointer, CheckCircle } from "lucide-react"

// Types
interface FunnelStage {
  stage: string
  value: number
  percentage: number
  color: string
  dropoff: number
}

interface TopForm {
  rank: number
  name: string
  slug: string
  conversionRate: number
  avgTime: string
  views: number
  starts: number
  submissions: number
}

interface FunnelData {
  conversionFunnel?: FunnelStage[]
  topForms?: TopForm[]
}

interface FunnelAnalysisProps {
  isLoading?: boolean
  funnelData?: FunnelData
}

// Helper Functions
const getPodiumHeight = (rank: number): string => {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" }
  return heights[rank as keyof typeof heights] || "h-14"
}

const getPodiumColors = (rank: number) => {
  const colors = {
    1: {
      border: "border-amber-400/50",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      badge: "bg-amber-400 text-amber-950",
      podium: "bg-amber-400",
    },
    2: {
      border: "border-slate-300/50",
      bg: "bg-slate-50 dark:bg-slate-500/10",
      badge: "bg-slate-300 text-slate-900",
      podium: "bg-slate-300",
    },
    3: {
      border: "border-orange-300/50",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      badge: "bg-orange-300 text-orange-900",
      podium: "bg-orange-300",
    },
  }
  return colors[rank as keyof typeof colors] || colors[3]
}

const stageIcons: Record<string, any> = {
  Views: Eye,
  Starts: MousePointer,
  Submissions: CheckCircle,
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="h-6 w-40 bg-muted rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent className="pt-6 pb-4">
                <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center space-y-3 max-w-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Filter className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  )
}

export default function FunnelAnalysis({ isLoading = false, funnelData }: FunnelAnalysisProps) {
  const { conversionFunnel = [], topForms = [] } = funnelData || {}

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const createEmptyForm = (rank: number): TopForm => ({
    rank,
    name: "No Form",
    slug: `empty-${rank}`,
    conversionRate: 0,
    avgTime: "0s",
    views: 0,
    starts: 0,
    submissions: 0,
  })

  const podiumForms: TopForm[] = [
    topForms.find((f) => f.rank === 1) || createEmptyForm(1),
    topForms.find((f) => f.rank === 2) || createEmptyForm(2),
    topForms.find((f) => f.rank === 3) || createEmptyForm(3),
  ]

  const podiumOrder = [podiumForms[1], podiumForms[0], podiumForms[2]]
  const hasAnyForms = topForms.length > 0

  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight font-heading">
            Funnel & Performance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Visualize user journey and identify top performers</p>
        </div>

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel Card */}
          <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground font-heading">
                    Conversion Funnel
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">User journey stages</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {conversionFunnel.length === 0 ? (
                <EmptyState message="No funnel data available" />
              ) : (
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => {
                    const StageIcon = stageIcons[stage.stage] || Eye
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StageIcon className="h-4 w-4" style={{ color: stage.color }} />
                            <span className="text-sm font-semibold text-foreground">{stage.stage}</span>
                            {stage.dropoff > 0 && (
                              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />-{stage.dropoff}%
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {stage.value.toLocaleString()} ({stage.percentage}%)
                          </span>
                        </div>

                        <div className="relative h-12 bg-muted/30 rounded-xl overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 flex items-center justify-between px-4"
                            style={{
                              width: `${Math.max(stage.percentage, 5)}%`,
                              background: `linear-gradient(90deg, ${stage.color}, ${stage.color}99)`,
                            }}
                          >
                            <span className="text-sm font-bold text-white drop-shadow-sm">
                              {stage.value.toLocaleString()}
                            </span>
                            {stage.percentage > 20 && (
                              <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
                                {stage.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Forms Card */}
          <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground font-heading">Top Performers</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Best converting forms</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {!hasAnyForms ? (
                <EmptyState message="Create a form to see performance data" />
              ) : (
                <div className="flex items-end justify-center gap-3 sm:gap-4">
                  {podiumOrder.map((form) => {
                    const colors = getPodiumColors(form.rank)
                    const height = getPodiumHeight(form.rank)
                    const isEmpty = form.name === "No Form"

                    return (
                      <div key={form.slug} className="flex flex-col items-center flex-1 max-w-[140px] outline-none">
                        {/* Form Card */}
                        <div className="w-full mb-2 outline-none">
                          <div
                            className={cn(
                              "p-3 rounded-xl border bg-card transition-all duration-300 outline-none",
                              colors.border,
                              colors.bg,
                              !isEmpty && "hover:shadow-lg cursor-pointer hover:scale-105",
                              isEmpty && "opacity-50",
                            )}
                          >
                            {/* Rank Badge */}
                            <div className="flex justify-center mb-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md",
                                  colors.badge,
                                )}
                              >
                                {form.rank}
                              </div>
                            </div>

                            {/* Form Details */}
                            <div className="text-center">
                              <p
                                className={cn(
                                  "text-xs font-semibold mb-2 truncate outline-none",
                                  isEmpty ? "text-muted-foreground italic" : "text-foreground",
                                )}
                                title={form.name}
                              >
                                {form.name}
                              </p>
                              {!isEmpty ? (
                                <>
                                  <p className="text-xl font-bold text-foreground mb-1 font-heading">
                                    {form.conversionRate}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Avg: {form.avgTime}</p>
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="grid grid-cols-3 gap-1 text-xs">
                                      <div>
                                        <p className="text-muted-foreground">Views</p>
                                        <p className="font-semibold text-foreground">{form.views}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Starts</p>
                                        <p className="font-semibold text-foreground">{form.starts}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Done</p>
                                        <p className="font-semibold text-foreground">{form.submissions}</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-muted-foreground italic mt-2">No data</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Podium Base */}
                        <div
                          className={cn(
                            "w-full rounded-t-lg outline-none",
                            height,
                            colors.podium,
                            isEmpty && "opacity-40",
                          )}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}