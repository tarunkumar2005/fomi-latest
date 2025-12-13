"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import { RangeOption } from "@/types/dashboard"
import { TrendingUp, BarChart3 } from "lucide-react"

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 min-w-[200px]">
        <p className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border/50">{label}</p>
        <div className="space-y-2.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shadow-sm ring-2 ring-background"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

// Custom Legend Component
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full ring-2 ring-background shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// Loading State Component
function LoadingState() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Engagement Trends</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Performance over time</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="h-80 w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-primary/50 border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Engagement Trends</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Performance over time</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="h-80 w-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-sm">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">No engagement data yet</p>
                  <p className="text-xs text-muted-foreground">
                    Data will appear here once you start receiving form interactions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface EngagementTrendsProps {
  isLoading?: boolean
  trendsChartData?: any[]
  range?: RangeOption
}

export default function EngagementTrends({ isLoading = false, trendsChartData, range }: EngagementTrendsProps) {
  // Decide label formatting based on selected range
  const intervalHours = range === RangeOption["24h"] ? 6 : 24

  const formattedData = trendsChartData?.map((item: any) => {
    const date = new Date(item.date)

    let formattedDate: string
    if (range === RangeOption["24h"]) {
      const startTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
      const endDate = new Date(date.getTime() + intervalHours * 60 * 60 * 1000)
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
      formattedDate = `${startTime} - ${endTime}`
    } else {
      formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }

    return {
      date: formattedDate,
      views: Number(item.views) || 0,
      starts: Number(item.starts) || 0,
      submissions: Number(item.submissions) || 0,
    }
  })

  if (isLoading) {
    return <LoadingState />
  }

  if (!formattedData || formattedData.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground font-heading">
                    Engagement Trends
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Performance over time</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="startsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "5 5" }}
                  />
                  <Legend content={<CustomLegend />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#viewsGradient)"
                    dot={{ fill: "var(--chart-1)", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="starts"
                    name="Starts"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    fill="url(#startsGradient)"
                    dot={{ fill: "var(--chart-2)", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="var(--success)"
                    strokeWidth={2.5}
                    fill="url(#submissionsGradient)"
                    dot={{ fill: "var(--success)", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}