"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { SiFirefoxbrowser as FirefoxIcon } from "react-icons/si";
import { SiGooglechrome as ChromeIcon } from "react-icons/si";
import { SiSafari as SafariIcon } from "react-icons/si";

// Geographic distribution data
const geographicData = [
  { country: "US", fullName: "United States", value: 2300, flag: "🇺🇸", color: "#3b82f6" },
  { country: "GB", fullName: "United Kingdom", value: 1300, flag: "🇬🇧", color: "#8b5cf6" },
  { country: "CA", fullName: "Canada", value: 780, flag: "🇨🇦", color: "#10b981" },
  { country: "AU", fullName: "Australia", value: 520, flag: "🇦🇺", color: "#f59e0b" },
  { country: "DE", fullName: "Germany", value: 260, flag: "🇩🇪", color: "#ef4444" },
];

// Device types data
const deviceData = [
  { name: "Mobile", value: 58.0, color: "#8b5cf6" },
  { name: "Desktop", value: 32.0, color: "#3b82f6" },
  { name: "Tablet", value: 10.0, color: "#10b981" },
];

// Top browsers data
const browsersData = [
  { name: "Chrome", percentage: 68, icon: ChromeIcon, color: "text-blue-600", bgColor: "bg-blue-50" },
  { name: "Safari", percentage: 18, icon: SafariIcon, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  { name: "Firefox", percentage: 8, icon: FirefoxIcon, color: "text-orange-600", bgColor: "bg-orange-50" },
  { name: "Edge", percentage: 6, icon: Globe, color: "text-indigo-600", bgColor: "bg-indigo-50" },
];

// Traffic sources data
const trafficSources = [
  { name: "Direct", percentage: 42, color: "bg-blue-500" },
  { name: "Social Media", percentage: 28, color: "bg-purple-500" },
  { name: "Email", percentage: 20, color: "bg-green-500" },
  { name: "Referral", percentage: 10, color: "bg-orange-500" },
];

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

// Custom tooltip for geographic bar chart
const CustomGeoTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{data.flag}</span>
          <p className="font-body text-sm font-semibold text-foreground">
            {data.fullName}
          </p>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {payload[0].value.toLocaleString()} visitors
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for bar chart
const CustomBarLabel = (props: any) => {
  const { x, y, width, value, flag } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="hsl(var(--foreground))"
      textAnchor="middle"
      fontSize={20}
    >
      {flag}
    </text>
  );
};

export default function Audience() {
  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Audience & Device Insights
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Geographic Distribution */}
          <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={geographicData}
                    margin={{ top: 30, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="country"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip content={<CustomGeoTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      label={<CustomBarLabel />}
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="font-body text-xs text-muted-foreground mb-1">
                      Total Visitors
                    </p>
                    <p className="font-body text-lg font-bold text-foreground">
                      {geographicData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-body text-xs text-muted-foreground mb-1">
                      Countries
                    </p>
                    <p className="font-body text-lg font-bold text-foreground">
                      {geographicData.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Types */}
          <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {deviceData.map((device, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: device.color }}
                    />
                    <p className="font-body text-xs text-muted-foreground mb-0.5">
                      {device.name}
                    </p>
                    <p className="font-body text-sm font-bold text-foreground">
                      {device.value}%
                    </p>
                  </div>
                ))}
              </div>
              {/* Additional Device Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground">
                      Most Popular
                    </span>
                    <span className="font-body text-xs font-semibold text-foreground">
                      {deviceData.reduce((max, device) => 
                        device.value > max.value ? device : max
                      ).name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground">
                      Total Sessions
                    </span>
                    <span className="font-body text-xs font-semibold text-foreground">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Browsers & Traffic Sources */}
          <div className="space-y-4">
            {/* Top Browsers */}
            <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Top Browsers
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                {browsersData.map((browser, index) => {
                  const Icon = browser.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg", browser.bgColor)}>
                          <Icon className={cn("h-4 w-4", browser.color)} />
                        </div>
                        <span className="font-body text-sm text-foreground">
                          {browser.name}
                        </span>
                      </div>
                      <span className="font-body text-sm font-semibold text-foreground">
                        {browser.percentage}%
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                {trafficSources.map((source, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground">
                        {source.name}
                      </span>
                      <span className="font-body text-sm font-semibold text-foreground">
                        {source.percentage}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                          source.color
                        )}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}