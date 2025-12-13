"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { useState, memo } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Chrome, Globe2, Monitor, Smartphone, Tablet, MapPin, Laptop, TrendingUp } from "lucide-react"

// Constants
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🌍"
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const countryCodeToId: Record<string, string> = {
  US: "840",
  CA: "124",
  MX: "484",
  BR: "076",
  GB: "826",
  FR: "250",
  DE: "276",
  ES: "724",
  IT: "380",
  RU: "643",
  CN: "156",
  IN: "356",
  JP: "392",
  AU: "036",
  ZA: "710",
  NG: "566",
  EG: "818",
  KE: "404",
  AR: "032",
  CL: "152",
  CO: "170",
  PE: "604",
  SE: "752",
  NO: "578",
  FI: "246",
  DK: "208",
  PL: "616",
  UA: "804",
  TR: "792",
  SA: "682",
  AE: "784",
  IL: "376",
  KR: "410",
  TH: "764",
  VN: "704",
  ID: "360",
  PH: "608",
  MY: "458",
  SG: "702",
  NZ: "554",
  PK: "586",
  BD: "050",
}

const deviceColors: Record<string, string> = {
  Mobile: "var(--chart-1)",
  Desktop: "var(--chart-2)",
  Tablet: "var(--success)",
}

const deviceIcons: Record<string, any> = {
  Mobile: Smartphone,
  Desktop: Monitor,
  Tablet: Tablet,
}

const browserConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  Chrome: { color: "text-primary", bgColor: "bg-primary/10", icon: Chrome },
  Safari: { color: "text-sky-500", bgColor: "bg-sky-500/10", icon: Globe2 },
  Firefox: { color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Globe2 },
  Edge: { color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: Globe2 },
  Other: { color: "text-muted-foreground", bgColor: "bg-muted", icon: Globe2 },
}

const trafficSourceConfig: Record<string, { color: string; gradient: string }> = {
  Direct: { color: "bg-primary", gradient: "from-primary to-primary/70" },
  "Organic Search": { color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-500/70" },
  Social: { color: "bg-pink-500", gradient: "from-pink-500 to-pink-500/70" },
  Referral: { color: "bg-amber-500", gradient: "from-amber-500 to-amber-500/70" },
  "Paid/Campaign": { color: "bg-sky-500", gradient: "from-sky-500 to-sky-500/70" },
}

// Types
interface CountryMetric {
  country: string
  countryCode: string
  views: number
}

export interface DeviceMetric {
  deviceType: string
  count: number
  percentage: number
}

export interface BrowserMetric {
  browser: string
  count: number
  percentage: number
}

export interface TrafficSourceMetric {
  source: string
  count: number
  percentage: number
}

interface AudienceData {
  geographicData?: CountryMetric[]
  deviceTypeData?: DeviceMetric[]
  browserData?: BrowserMetric[]
  trafficSourceData?: TrafficSourceMetric[]
}

interface AudienceProps {
  isLoading?: boolean
  audienceData?: AudienceData
}

// Custom Pie Tooltip
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const DeviceIcon = deviceIcons[payload[0].name] || Monitor
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${payload[0].payload.color}20` }}>
            <DeviceIcon className="h-4 w-4" style={{ color: payload[0].payload.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
            <p className="text-xs text-muted-foreground">{payload[0].value.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// World Map Component
const WorldMap = memo(({ countriesData }: { countriesData: any[] }) => {
  const [tooltipContent, setTooltipContent] = useState<{
    name: string
    views: number
    flag: string
  } | null>(null)

  const dataByCountryId = countriesData.reduce(
    (acc, country) => {
      const id = countryCodeToId[country.countryCode]
      if (id) {
        acc[id] = country
      }
      return acc
    },
    {} as Record<string, any>,
  )

  const maxViews = Math.max(...countriesData.map((c) => c.views), 1)

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] bg-muted/20 rounded-xl border border-border/50 overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 180, center: [10, 10] }}
        width={980}
        height={551}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} center={[0, 0]}>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const countryId = geo.id
                const countryData = dataByCountryId[countryId]
                const isActive = !!countryData
                const fillOpacity = isActive ? 0.5 + (countryData.views / maxViews) * 0.4 : 0

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isActive ? "var(--primary)" : "var(--muted)"}
                    fillOpacity={isActive ? fillOpacity : 0.3}
                    stroke="var(--border)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: isActive ? "var(--primary)" : "var(--muted)",
                        fillOpacity: isActive ? Math.min(fillOpacity + 0.2, 1) : 0.4,
                        outline: "none",
                        cursor: isActive ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => {
                      if (countryData) {
                        setTooltipContent({
                          name: countryData.country,
                          views: countryData.views,
                          flag: countryData.flag,
                        })
                      }
                    }}
                    onMouseLeave={() => setTooltipContent(null)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 pointer-events-none z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tooltipContent.flag}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{tooltipContent.name}</p>
              <p className="text-xs text-muted-foreground">
                {tooltipContent.views.toLocaleString()} visitor{tooltipContent.views !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-2">Density</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-primary/40 rounded-sm" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-primary rounded-sm" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  )
})

WorldMap.displayName = "WorldMap"

// Empty State Component
function EmptyState({ icon: Icon, message, subtext }: { icon: any; message: string; subtext: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center space-y-3 max-w-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Icon className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
    </div>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border/50 bg-card">
              <CardHeader className="pb-4">
                <div className="h-5 w-32 bg-muted rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Audience({ isLoading = false, audienceData }: AudienceProps) {
  const { geographicData = [], deviceTypeData = [], browserData = [], trafficSourceData = [] } = audienceData || {}

  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Transform data
  const chartData = geographicData.map((item) => ({
    country: item.country,
    countryCode: item.countryCode,
    views: item.views,
    flag: getFlagEmoji(item.countryCode),
  }))

  const deviceChartData = deviceTypeData.map((item) => ({
    name: item.deviceType,
    value: item.percentage,
    count: item.count,
    color: deviceColors[item.deviceType] || "var(--muted-foreground)",
  }))

  const totalViews = chartData.reduce((sum, item) => sum + item.views, 0)

  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight font-heading">
            Audience Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Understand your visitors and where they come from</p>
        </div>

        {/* Geographic Distribution */}
        <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground font-heading">
                  Geographic Distribution
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Where your visitors are located</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            {chartData.length === 0 ? (
              <EmptyState
                icon={MapPin}
                message="No geographic data available"
                subtext="Location data will appear once visitors start viewing your forms"
              />
            ) : (
              <div className="space-y-6">
                <WorldMap countriesData={chartData} />

                {/* Top Countries */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Top Countries</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {chartData.slice(0, 8).map((country, index) => {
                      const percentage = ((country.views / totalViews) * 100).toFixed(0)
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-border/30 hover:border-border/50"
                        >
                          <span className="text-2xl">{country.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{country.country}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-lg font-bold text-foreground tabular-nums">
                                {country.views.toLocaleString()}
                              </p>
                              <span className="text-xs text-muted-foreground">({percentage}%)</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device & Browsers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Types */}
          <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10">
                  <Laptop className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground font-heading">Device Types</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Breakdown by device</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              {deviceChartData.length === 0 ? (
                <EmptyState icon={Monitor} message="No device data" subtext="Device data will appear with traffic" />
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {deviceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {deviceChartData.map((device, index) => {
                      const DeviceIcon = deviceIcons[device.name] || Monitor
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center p-3 rounded-xl bg-muted/30 border border-border/30"
                        >
                          <DeviceIcon className="h-5 w-5 mb-2" style={{ color: device.color }} />
                          <p className="text-xs text-muted-foreground mb-0.5">{device.name}</p>
                          <p className="text-sm font-bold text-foreground">{device.value.toFixed(1)}%</p>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Browsers */}
          <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Chrome className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground font-heading">Top Browsers</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Browser distribution</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4 space-y-3">
              {browserData.length === 0 ? (
                <EmptyState icon={Globe2} message="No browser data" subtext="Browser data will appear with traffic" />
              ) : (
                browserData.slice(0, 5).map((browser, index) => {
                  const config = browserConfig[browser.browser] || browserConfig.Other
                  const Icon = config.icon

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-lg", config.bgColor)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{browser.browser}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={cn("h-full rounded-full", config.bgColor.replace("/10", ""))}
                            style={{ width: `${browser.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground tabular-nums w-14 text-right">
                          {browser.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources */}
        <Card className="border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground font-heading">Traffic Sources</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">How visitors find your forms</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            {trafficSourceData.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                message="No traffic data"
                subtext="Traffic source data will appear with visitors"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {trafficSourceData.map((source, index) => {
                  const config = trafficSourceConfig[source.source] || {
                    color: "bg-muted-foreground",
                    gradient: "from-muted-foreground to-muted-foreground/70",
                  }
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground">{source.source}</span>
                        <span className="text-sm font-bold text-foreground">{source.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", config.gradient)}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{source.count.toLocaleString()} visits</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}