"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Chrome,
  Globe2,
  Users,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

// ===========================
// CONSTANTS & UTILITIES
// ===========================

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

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
};

const deviceColors: Record<string, string> = {
  Mobile: "#3b82f6",
  Desktop: "#8b5cf6",
  Tablet: "#10b981",
};

const browserConfig: Record<
  string,
  { color: string; bgColor: string; icon: any }
> = {
  Chrome: { color: "text-blue-600", bgColor: "bg-blue-50", icon: Chrome },
  Safari: { color: "text-blue-500", bgColor: "bg-blue-50", icon: Globe2 },
  Firefox: { color: "text-orange-600", bgColor: "bg-orange-50", icon: Globe2 },
  Edge: { color: "text-blue-700", bgColor: "bg-blue-50", icon: Globe2 },
  Other: { color: "text-gray-600", bgColor: "bg-gray-50", icon: Globe2 },
};

const trafficSourceColors: Record<string, string> = {
  Direct: "bg-blue-500",
  "Organic Search": "bg-green-500",
  Social: "bg-purple-500",
  Referral: "bg-orange-500",
  "Paid/Campaign": "bg-pink-500",
};

// ===========================
// TYPES
// ===========================

interface CountryMetric {
  country: string;
  countryCode: string;
  views: number;
}

export interface DeviceMetric {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface BrowserMetric {
  browser: string;
  count: number;
  percentage: number;
}

export interface TrafficSourceMetric {
  source: string;
  count: number;
  percentage: number;
}

interface AudienceData {
  geographicData?: CountryMetric[];
  deviceTypeData?: DeviceMetric[];
  browserData?: BrowserMetric[];
  trafficSourceData?: TrafficSourceMetric[];
}

interface AudienceProps {
  isLoading?: boolean;
  audienceData?: AudienceData;
}

// ===========================
// COMPONENTS
// ===========================

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-xl p-3">
        <p className="font-body text-sm font-semibold text-foreground">
          {payload[0].name}
        </p>
        <p className="font-body text-xs text-muted-foreground">
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

// World Map Component with react-simple-maps
const WorldMap = memo(({ countriesData }: { countriesData: any[] }) => {
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    views: number;
    flag: string;
  } | null>(null);

  // Create lookup map for quick access
  const dataByCountryId = countriesData.reduce((acc, country) => {
    const id = countryCodeToId[country.countryCode];
    if (id) {
      acc[id] = country;
    }
    return acc;
  }, {} as Record<string, any>);

  const maxViews = Math.max(...countriesData.map((c) => c.views), 1);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-background rounded-lg border border-border overflow-hidden">
      <ComposableMap
        projectionConfig={{
          scale: 180,
          center: [10, 10],
        }}
        width={980}
        height={551}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup zoom={1} center={[0, 0]}>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const countryId = geo.id;
                const countryData = dataByCountryId[countryId];
                const isActive = !!countryData;

                // Calculate fill opacity based on visitor count
                const fillOpacity = isActive
                  ? 0.5 + (countryData.views / maxViews) * 0.4
                  : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isActive ? "#3b82f6" : "hsl(var(--muted))"}
                    fillOpacity={isActive ? fillOpacity : 0.2}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.75}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: isActive ? "#2563eb" : "hsl(var(--muted))",
                        fillOpacity: isActive
                          ? Math.min(fillOpacity + 0.2, 1)
                          : 0.25,
                        outline: "none",
                        cursor: isActive ? "pointer" : "default",
                        strokeWidth: 1.5,
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => {
                      if (countryData) {
                        setTooltipContent({
                          name: countryData.country,
                          views: countryData.views,
                          flag: countryData.flag,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-6 left-6 bg-card border border-border rounded-lg shadow-xl p-4 pointer-events-none z-10 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tooltipContent.flag}</span>
            <div>
              <p className="font-body text-base font-semibold text-foreground">
                {tooltipContent.name}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {tooltipContent.views.toLocaleString()} visitor
                {tooltipContent.views !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
        <p className="text-sm font-semibold text-foreground mb-3">
          Visitor Density
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-blue-500 opacity-50 rounded-sm" />
            <span className="text-sm text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-blue-500 opacity-90 rounded-sm" />
            <span className="text-sm text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  );
});

WorldMap.displayName = "WorldMap";

// ===========================
// EMPTY STATE COMPONENT
// ===========================

const EmptyState = ({
  message,
  subtext,
}: {
  message: string;
  subtext: string;
}) => (
  <div className="h-[500px] md:h-[600px] flex items-center justify-center">
    <div className="text-center space-y-3">
      <svg
        className="mx-auto h-16 w-16 text-muted-foreground/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="font-body text-base font-medium text-muted-foreground">
        {message}
      </p>
      <p className="font-body text-sm text-muted-foreground/70">{subtext}</p>
    </div>
  </div>
);

// ===========================
// MAIN COMPONENT
// ===========================

export default function Audience({
  isLoading = false,
  audienceData,
}: AudienceProps) {
  // Extract data with fallbacks
  const {
    geographicData = [],
    deviceTypeData = [],
    browserData = [],
    trafficSourceData = [],
  } = audienceData || {};

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border bg-card">
                <CardHeader className="pb-4">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-64 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Transform geographic data for charts
  const chartData = geographicData.map((item, index) => ({
    country: item.country,
    countryCode: item.countryCode,
    views: item.views,
    flag: getFlagEmoji(item.countryCode),
  }));

  // Transform device data for pie chart
  const deviceChartData = deviceTypeData.map((item) => ({
    name: item.deviceType,
    value: item.percentage,
    count: item.count,
    color: deviceColors[item.deviceType] || "#6b7280",
  }));

  const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);

  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== GEOGRAPHIC DISTRIBUTION ===== */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {chartData.length === 0 ? (
              <EmptyState
                message="No geographic data available"
                subtext="Location data will appear once visitors start viewing your forms"
              />
            ) : (
              <div className="space-y-6">
                {/* World Map */}
                <WorldMap countriesData={chartData} />

                {/* Top Countries List */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Top Countries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {chartData.slice(0, 8).map((country, index) => {
                      const percentage = (
                        (country.views / totalViews) *
                        100
                      ).toFixed(0);

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <span className="text-3xl">{country.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold text-foreground truncate">
                              {country.country}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="font-body text-lg font-bold text-foreground">
                                {country.views}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== DEVICE TYPES AND BROWSERS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Types */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {deviceChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No device data available
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {deviceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {deviceChartData.map((device, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-3 h-3 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: device.color }}
                        />
                        <p className="font-body text-xs text-muted-foreground mb-0.5">
                          {device.name}
                        </p>
                        <p className="font-body text-sm font-bold text-foreground">
                          {device.value.toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Browsers */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Top Browsers
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              {browserData.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No browser data available
                  </p>
                </div>
              ) : (
                browserData.slice(0, 5).map((browser, index) => {
                  const config =
                    browserConfig[browser.browser] || browserConfig.Other;
                  const Icon = config.icon;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <span className="font-body text-sm text-foreground">
                          {browser.browser}
                        </span>
                      </div>
                      <span className="font-body text-sm font-semibold text-foreground">
                        {browser.percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== TRAFFIC SOURCES ===== */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-4">
            {trafficSourceData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No traffic source data available
                </p>
              </div>
            ) : (
              trafficSourceData.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-foreground">
                      {source.source}
                    </span>
                    <span className="font-body text-sm font-semibold text-foreground">
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        trafficSourceColors[source.source] || "bg-gray-500"
                      )}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
