"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RangeOption } from "@/types/dashboard";
import {
  FileText,
  Send,
  Eye,
  PlayCircle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Clock,
} from "lucide-react";

// Static metric configuration
interface MetricConfig {
  key: string;
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  iconColor: string;
}

// Dynamic data from API
interface MetricData {
  value: string | number;
  change: number;
  changeColor: "positive" | "negative";
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
  changeColor: "positive" | "negative";
  iconBg: string;
  iconColor: string;
}

function MetricCard({
  icon,
  label,
  value,
  change,
  changeColor,
  iconBg,
  iconColor,
}: MetricCardProps) {
  const isPositive = changeColor === "positive";
  const changeSign = isPositive ? "+" : "";

  return (
    <Card className="border-border bg-card hover:shadow-md transition-all duration-200 h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", iconBg)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <span
            className={cn(
              "font-body text-xs font-bold px-2.5 py-1 rounded-md",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {changeSign}
            {change}%
          </span>
        </div>
        <div className="space-y-1">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="font-heading text-3xl font-bold text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Default metric configurations - these are static and defined in the component
const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "totalForms",
    label: "Total Forms",
    icon: <FileText className="w-5 h-5" />,
    iconBg: "bg-chart-1/10",
    iconColor: "text-chart-1",
  },
  {
    key: "publishedForms",
    label: "Published Forms",
    icon: <Send className="w-5 h-5" />,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    key: "totalViews",
    label: "Total Views",
    icon: <Eye className="w-5 h-5" />,
    iconBg: "bg-chart-5/10",
    iconColor: "text-chart-5",
  },
  {
    key: "formStarts",
    label: "Form Starts",
    icon: <PlayCircle className="w-5 h-5" />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "formSubmissions",
    label: "Form Submissions",
    icon: <CheckCircle className="w-5 h-5" />,
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
  {
    key: "dropoffs",
    label: "Dropoffs",
    icon: <XCircle className="w-5 h-5" />,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    key: "dropoffRate",
    label: "Dropoff Rate",
    icon: <TrendingDown className="w-5 h-5" />,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    key: "avgCompletionTime",
    label: "Avg. Completion Time",
    icon: <Clock className="w-5 h-5" />,
    iconBg: "bg-chart-2/10",
    iconColor: "text-chart-2",
  },
];

export default function Overview({
  range,
  setRange,
  overviewData,
  isLoading = false,
  isFetching = false,
}: {
  range?: RangeOption;
  setRange?: (range: RangeOption) => void;
  overviewData?: Record<string, MetricData>;
  isLoading?: boolean;
  isFetching?: boolean;
}) {
  return (
    <div className="pt-30 px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Overview Analytics
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Track your form analytics and performance metrics.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Loading indicator when refetching */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-body text-xs">Updating...</span>
              </div>
            )}

            <Select
              defaultValue={range}
              onValueChange={(value) => {
                if (setRange) setRange(value as RangeOption);
              }}
              disabled={isFetching}
            >
              <SelectTrigger className="w-[140px] h-9 font-body text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            const data = overviewData?.[config.key];

            if (isLoading) {
              return (
                <Card key={config.key} className="border-border bg-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-xl", config.iconBg)}>
                        <div className={config.iconColor}>{config.icon}</div>
                      </div>
                      <div className="h-6 w-12 bg-muted rounded-md animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                        {config.label}
                      </p>
                      <div className="h-9 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              );
            }

            if (!data) {
              return (
                <Card key={config.key} className="border-border bg-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-xl", config.iconBg)}>
                        <div className={config.iconColor}>{config.icon}</div>
                      </div>
                      <span className="font-body text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                        N/A
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                        {config.label}
                      </p>
                      <p className="font-heading text-3xl font-bold text-muted-foreground">
                        -
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <MetricCard
                key={config.key}
                icon={config.icon}
                label={config.label}
                iconBg={config.iconBg}
                iconColor={config.iconColor}
                value={data.value}
                change={data.change}
                changeColor={data.changeColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
