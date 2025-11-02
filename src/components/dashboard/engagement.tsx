"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RangeOption } from "@/types/dashboard";

// Custom Tooltip for trend chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-xl p-3">
        <p className="font-body text-sm font-semibold text-foreground mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-body text-xs text-muted-foreground">
                {entry.name}:
              </span>
            </div>
            <span className="font-body text-xs font-semibold text-foreground">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementTrends({
  isLoading = false,
  trendsChartData,
  range,
}: {
  isLoading?: boolean;
  trendsChartData?: any[];
  range?: RangeOption;
}) {
  // Decide label formatting based on selected range (explicit)
  const intervalHours = range === RangeOption["24h"] ? 6 : 24;

  const formattedData = trendsChartData?.map((item: any) => {
    const date = new Date(item.date);

    let formattedDate: string;
    if (range === RangeOption["24h"]) {
      // For 24h view show half-day ranges (6 hour buckets)
      const startTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      const endDate = new Date(date.getTime() + intervalHours * 60 * 60 * 1000);
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      formattedDate = `${startTime} - ${endTime}`;
    } else {
      // For multi-day ranges show human friendly date
      formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return {
      date: formattedDate,
      views: Number(item.views) || 0,
      starts: Number(item.starts) || 0,
      submissions: Number(item.submissions) || 0,
    };
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Engagement Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="h-80 w-full flex items-center justify-center">
                <div className="space-y-4 w-full">
                  {/* Skeleton loading bars */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-end gap-2 h-12">
                      <div
                        className="bg-muted rounded animate-pulse flex-1"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                      <div
                        className="bg-muted rounded animate-pulse flex-1"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                      <div
                        className="bg-muted rounded animate-pulse flex-1"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!formattedData || formattedData.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Engagement Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="h-80 w-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-muted-foreground">
                    <svg
                      className="mx-auto h-12 w-12 text-muted-foreground/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="font-body text-sm font-medium text-muted-foreground">
                    No engagement data available
                  </p>
                  <p className="font-body text-xs text-muted-foreground/70">
                    Data will appear here once you start receiving form
                    interactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render chart with data
  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Engagement Trends Chart */}
        <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Engagement Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedData}
                  margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="starts"
                    name="Starts"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
