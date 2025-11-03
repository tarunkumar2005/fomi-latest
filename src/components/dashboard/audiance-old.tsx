"use client";

import React, { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { useState } from "react";
import { Globe } from "lucide-react";

// Country code to flag emoji mapping
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Generate color based on index
const getColorForIndex = (index: number): string => {
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#f97316", "#84cc16", "#6366f1"];
  return colors[index % colors.length];
};

interface CountryMetric {
  country: string;
  countryCode: string;
  views: number;
}

interface AudienceProps {
  isLoading?: boolean;
  geographicData?: CountryMetric[];
}

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-body text-sm font-semibold text-foreground">
          {payload[0].name}
        </p>
        <p className="font-body text-xs text-muted-foreground">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

// World Map Component (SVG based)
const WorldMap = ({ countriesData }: { countriesData: any[] }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Get country data by code
  const getCountryData = (code: string) => {
    return countriesData.find(c => c.countryCode === code);
  };

  // Country paths with their codes (simplified world map - key countries)
  const countryPaths = [
    { code: "US", d: "M120,80 L180,80 L180,120 L120,120 Z", name: "United States" },
    { code: "IN", d: "M480,160 L520,160 L520,200 L480,200 Z", name: "India" },
    { code: "GB", d: "M240,60 L260,60 L260,80 L240,80 Z", name: "United Kingdom" },
    { code: "CA", d: "M80,40 L160,40 L160,80 L80,80 Z", name: "Canada" },
    { code: "AU", d: "M560,220 L600,220 L600,260 L560,260 Z", name: "Australia" },
    { code: "DE", d: "M280,70 L300,70 L300,90 L280,90 Z", name: "Germany" },
    { code: "FR", d: "M260,80 L280,80 L280,100 L260,100 Z", name: "France" },
    { code: "BR", d: "M200,180 L240,180 L240,240 L200,240 Z", name: "Brazil" },
    { code: "JP", d: "M580,100 L600,100 L600,130 L580,130 Z", name: "Japan" },
    { code: "CN", d: "M500,80 L560,80 L560,140 L500,140 Z", name: "China" },
  ];

  const handleMouseMove = (e: React.MouseEvent, country: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredCountry(country.code);
  };

  return (
    <div className="relative w-full h-64 bg-muted/10 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 600 300"
        className="w-full h-full"
        onMouseLeave={() => setHoveredCountry(null)}
      >
        {/* Background */}
        <rect width="600" height="300" fill="hsl(var(--muted))" fillOpacity="0.1" />
        
        {/* Countries */}
        {countryPaths.map((country) => {
          const data = getCountryData(country.code);
          const isActive = data !== undefined;
          const isHovered = hoveredCountry === country.code;
          
          return (
            <g key={country.code}>
              <path
                d={country.d}
                fill={isActive ? "#3b82f6" : "hsl(var(--muted))"}
                fillOpacity={isActive ? (isHovered ? 0.9 : 0.6) : 0.2}
                stroke={isActive ? "#2563eb" : "hsl(var(--border))"}
                strokeWidth="1"
                className="transition-all duration-200 cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, country)}
                onMouseEnter={() => setHoveredCountry(country.code)}
              />
              {isActive && (
                <text
                  x={parseInt(country.d.split(" ")[0].substring(1)) + 20}
                  y={parseInt(country.d.split(",")[1]) + 20}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {getFlagEmoji(country.code)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredCountry && getCountryData(hoveredCountry) && (
        <div
          className="absolute bg-card border border-border rounded-lg shadow-lg p-3 pointer-events-none z-10"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFlagEmoji(hoveredCountry)}</span>
            <div>
              <p className="font-body text-sm font-semibold text-foreground">
                {getCountryData(hoveredCountry)?.country}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {getCountryData(hoveredCountry)?.views} visitors
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Audience({ isLoading = false, geographicData }: AudienceProps) {
  const { deviceData, browsersData, trafficSources } = useDashboard();

  // Transform API data to chart format
  const chartData = geographicData?.map((item, index) => ({
    country: item.country,
    countryCode: item.countryCode,
    views: item.views,
    flag: getFlagEmoji(item.countryCode),
    color: getColorForIndex(index),
  })) || [];

  // Loading state for geographic section
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Audience & Device Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[280px] flex items-center justify-center">
                  <div className="space-y-3 w-full">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                        <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Keep other sections as-is during loading */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-60 flex items-center justify-center">
                  <div className="w-32 h-32 bg-muted rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base font-semibold text-foreground">
                    Top Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for geographic data
  const hasNoGeoData = !chartData || chartData.length === 0;

  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-1">
              Audience Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Understand where your visitors come from and how they interact
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Live Data</span>
          </div>
        </div>

        {/* Main Grid - Premium Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Geographic Distribution (Spans 2 columns) */}
          <div className="xl:col-span-2">
            <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-lg font-bold text-foreground">
                        Geographic Distribution
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Visitor locations worldwide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                    <span className="text-xs font-semibold text-foreground">
                      {chartData.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {chartData.length === 1 ? 'country' : 'countries'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                {hasNoGeoData ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="p-4 bg-muted/30 rounded-full inline-block">
                        <Globe className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                      <p className="font-body text-base font-medium text-muted-foreground">
                        No geographic data available
                      </p>
                      <p className="font-body text-sm text-muted-foreground/70 max-w-sm mx-auto">
                        Location data will appear once visitors start viewing your forms
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* World Map */}
                    <div className="relative">
                      <WorldMap countriesData={chartData} />
                      <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-1">Total Visitors</p>
                        <p className="text-xl font-bold text-foreground">
                          {chartData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Top Countries Grid */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Top Locations
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {chartData.slice(0, 6).map((country, index) => {
                          const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);
                          const percentage = ((country.views / totalViews) * 100).toFixed(1);
                          
                          return (
                            <div
                              key={index}
                              className="group relative flex items-start gap-3 p-4 rounded-xl bg-Linear-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md"
                            >
                              <div className="shrink-0">
                                <div className="w-12 h-12 flex items-center justify-center bg-background rounded-lg shadow-sm">
                                  <span className="text-2xl">{country.flag}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-sm font-semibold text-foreground truncate mb-0.5">
                                  {country.country}
                                </p>
                                <p className="font-body text-xs text-muted-foreground mb-2">
                                  {percentage}% of traffic
                                </p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-foreground">
                                    {country.views.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">views</span>
                                </div>
                              </div>
                              {/* Rank Badge */}
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                {index + 1}
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
          </div>

          {/* Right Column - Device Types */}
          <div className="xl:col-span-1">
            <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg">
                    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg font-bold text-foreground">
                      Device Breakdown
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      How users access your forms
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-6">
                  {/* Pie Chart */}
                  <div className="flex items-center justify-center">
                    <div className="relative h-56 w-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold text-foreground">100%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device Stats */}
                  <div className="space-y-3">
                    {deviceData.map((device, index) => {
                      const isTop = device.value === Math.max(...deviceData.map(d => d.value));
                      
                      return (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg border transition-all duration-300",
                            isTop 
                              ? "bg-linear-to-r from-purple-500/10 to-transparent border-purple-500/30" 
                              : "bg-muted/20 border-border/50 hover:border-border"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: device.color }}
                              />
                              <span className="font-body text-sm font-semibold text-foreground">
                                {device.name}
                              </span>
                              {isTop && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-600 text-xs font-semibold rounded-full">
                                  Most Popular
                                </span>
                              )}
                            </div>
                            <span className="font-body text-lg font-bold text-foreground">
                              {device.value}%
                            </span>
                          </div>
                          <div className="relative h-2 bg-background/80 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                              style={{
                                background: `linear-gradient(to right, ${device.color}, ${device.color}cc)`,
                                width: `${device.value}%`,
                                animation: 'slideIn 700ms ease-out'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Browsers and Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Browsers */}
          <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 rounded-lg">
                    <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg font-bold text-foreground">
                      Browser Distribution
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Most used browsers
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 space-y-4">
              {browsersData.slice(0, 4).map((browser, index) => {
                const Icon = browser.icon;
                const gradients: Record<string, string> = {
                  Chrome: "linear-gradient(135deg, #4285f4 0%, #ea4335 100%)",
                  Safari: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  Firefox: "linear-gradient(135deg, #ff6611 0%, #ff4500 100%)",
                  Edge: "linear-gradient(135deg, #0078d7 0%, #00bcf2 100%)",
                };

                return (
                  <div key={index} className="group relative">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={cn("p-3 rounded-xl shadow-md", browser.bgColor)}>
                        <Icon className={cn("h-6 w-6", browser.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-base font-semibold text-foreground">
                            {browser.name}
                          </span>
                          <span className="font-body text-xl font-bold text-foreground">
                            {browser.percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ≈ {Math.round(browser.percentage * 100)} sessions
                        </p>
                      </div>
                    </div>
                    <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out group-hover:shadow-lg"
                        style={{
                          background: gradients[browser.name] || browser.color,
                          width: `${browser.percentage}%`,
                          animation: `slideIn ${700 + index * 100}ms ease-out`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-lg">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg font-bold text-foreground">
                      Traffic Sources
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Where visitors come from
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Visits</p>
                  <p className="text-lg font-bold text-foreground">
                    {(trafficSources.reduce((sum, s) => sum + s.percentage, 0) * 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 space-y-6">
              {/* Segmented Bar */}
              <div>
                <div className="relative h-4 bg-muted/20 rounded-full overflow-hidden flex shadow-inner">
                  {trafficSources.map((source, index) => {
                    const colorMap: Record<string, string> = {
                      "bg-blue-500": "#3b82f6",
                      "bg-purple-500": "#a855f7",
                      "bg-green-500": "#22c55e",
                      "bg-orange-500": "#f97316",
                    };
                    const bgColor = colorMap[source.color] || "#3b82f6";
                    
                    return (
                      <div
                        key={index}
                        className="group/segment relative transition-all duration-700 ease-out hover:brightness-110 cursor-pointer"
                        style={{
                          width: `${source.percentage}%`,
                          backgroundColor: bgColor,
                          animationDelay: `${index * 150}ms`,
                          animation: 'slideIn 700ms ease-out'
                        }}
                      >
                        <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-card border border-border rounded-lg shadow-xl px-4 py-2 opacity-0 group-hover/segment:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <p className="font-body text-sm font-bold text-foreground">
                            {source.name}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {source.percentage}% • {Math.round(source.percentage * 1000)} visits
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {trafficSources.map((source, index) => (
                    <span key={index} className="text-xs text-muted-foreground">
                      {source.percentage}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Source Details */}
              <div className="grid grid-cols-2 gap-3">
                {trafficSources.map((source, index) => {
                  const icons: Record<string, ReactElement> = {
                    Direct: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    ),
                    "Social Media": (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                    Email: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    Referral: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ),
                  };

                  const colorMap: Record<string, string> = {
                    "bg-blue-500": "text-blue-500",
                    "bg-purple-500": "text-purple-500",
                    "bg-green-500": "text-green-500",
                    "bg-orange-500": "text-orange-500",
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-muted/30 to-transparent hover:from-muted/50 hover:to-muted/20 border border-border/30 hover:border-border transition-all duration-300"
                    >
                      <div className={cn("p-2.5 rounded-lg", source.color, "bg-opacity-10")}>
                        <span className={colorMap[source.color] || "text-blue-500"}>
                          {icons[source.name]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-foreground truncate">
                          {source.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {source.percentage}% share
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}