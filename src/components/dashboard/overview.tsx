"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { RangeOption } from "@/types/dashboard"
import {
  FileText,
  Send,
  Eye,
  PlayCircle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react"

// Types
interface MetricConfig {
  key: string
  icon: React.ReactNode
  label: string
  iconBg: string
  iconColor: string
  gradient: string
}

interface MetricData {
  value: string | number
  change: number
  changeColor: "positive" | "negative"
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change: number
  changeColor: "positive" | "negative"
  iconBg: string
  iconColor: string
  gradient: string
}

// Metric Card Component
function MetricCard({ icon, label, value, change, changeColor, iconBg, iconColor, gradient }: MetricCardProps) {
  const isPositive = changeColor === "positive"
  const changeSign = isPositive ? "+" : ""

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
      {/* Top accent line */}
      <div className={cn("absolute inset-x-0 top-0 h-1 opacity-80", gradient)} />

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              "group-hover:scale-110 group-hover:shadow-lg",
              iconBg,
            )}
          >
            <div className={iconColor}>{icon}</div>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full",
              "transition-all duration-200",
              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {changeSign}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton Card
function MetricCardSkeleton({ config }: { config: MetricConfig }) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card">
      <div className="absolute inset-x-0 top-0 h-1 bg-muted animate-pulse" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", config.iconBg)}>
            <div className={config.iconColor}>{config.icon}</div>
          </div>
          <div className="h-7 w-16 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{config.label}</p>
          <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

// Metric Configurations
const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "totalForms",
    label: "Total Forms",
    icon: <FileText className="w-5 h-5" />,
    iconBg: "bg-chart-1/10",
    iconColor: "text-chart-1",
    gradient: "bg-gradient-to-r from-chart-1/60 to-chart-1/20",
  },
  {
    key: "publishedForms",
    label: "Published Forms",
    icon: <Send className="w-5 h-5" />,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    gradient: "bg-gradient-to-r from-success/60 to-success/20",
  },
  {
    key: "totalViews",
    label: "Total Views",
    icon: <Eye className="w-5 h-5" />,
    iconBg: "bg-chart-5/10",
    iconColor: "text-chart-5",
    gradient: "bg-gradient-to-r from-chart-5/60 to-chart-5/20",
  },
  {
    key: "formStarts",
    label: "Form Starts",
    icon: <PlayCircle className="w-5 h-5" />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    gradient: "bg-gradient-to-r from-primary/60 to-primary/20",
  },
  {
    key: "formSubmissions",
    label: "Submissions",
    icon: <CheckCircle className="w-5 h-5" />,
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
    gradient: "bg-gradient-to-r from-chart-3/60 to-chart-3/20",
  },
  {
    key: "dropoffs",
    label: "Dropoffs",
    icon: <XCircle className="w-5 h-5" />,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    gradient: "bg-gradient-to-r from-destructive/60 to-destructive/20",
  },
  {
    key: "dropoffRate",
    label: "Dropoff Rate",
    icon: <TrendingDown className="w-5 h-5" />,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    gradient: "bg-gradient-to-r from-warning/60 to-warning/20",
  },
  {
    key: "avgCompletionTime",
    label: "Avg. Time",
    icon: <Clock className="w-5 h-5" />,
    iconBg: "bg-chart-2/10",
    iconColor: "text-chart-2",
    gradient: "bg-gradient-to-r from-chart-2/60 to-chart-2/20",
  },
]

interface OverviewProps {
  range?: RangeOption
  setRange?: (range: RangeOption) => void
  overviewData?: Record<string, MetricData>
  isLoading?: boolean
  isFetching?: boolean
}

export default function Overview({
  range,
  setRange,
  overviewData,
  isLoading = false,
  isFetching = false,
}: OverviewProps) {
  return (
    <div className="pt-24 px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">
              Analytics Overview
            </h1>
            <p className="text-sm text-muted-foreground">Track your form performance and key metrics</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Loading indicator when refetching */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs font-medium">Updating...</span>
              </div>
            )}

            <Select
              defaultValue={range}
              onValueChange={(value) => setRange?.(value as RangeOption)}
              disabled={isFetching}
            >
              <SelectTrigger className="w-[160px] h-10 text-sm font-medium bg-muted/50 border-border/50 hover:bg-muted rounded-xl transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIC_CONFIGS.map((config) => {
            const data = overviewData?.[config.key]

            if (isLoading) {
              return <MetricCardSkeleton key={config.key} config={config} />
            }

            if (!data) {
              return (
                <Card key={config.key} className="relative overflow-hidden border-border/50 bg-card">
                  <div className="absolute inset-x-0 top-0 h-1 bg-muted" />
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-xl", config.iconBg)}>
                        <div className={config.iconColor}>{config.icon}</div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground">
                        N/A
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {config.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-muted-foreground font-heading">—</p>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <MetricCard
                key={config.key}
                icon={config.icon}
                label={config.label}
                iconBg={config.iconBg}
                iconColor={config.iconColor}
                gradient={config.gradient}
                value={data.value}
                change={data.change}
                changeColor={data.changeColor}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}