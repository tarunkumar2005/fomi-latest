"use client";

import type React from "react";
import {
  FileText,
  CheckCircle2,
  Eye,
  Play,
  Send,
  XCircle,
  Percent,
  Clock,
  TrendingUp,
  Target,
  RotateCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
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

interface OverviewMetric {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
  changeColor: "positive" | "negative";
  iconBg: string;
  iconColor: string;
}

interface OverviewProps {
  metrics?: OverviewMetric[];
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  timeRange?: string;
}

export default function Overview({
  metrics,
  title = "Overview Analytics",
  subtitle = "Track your form analytics and performance metrics",
  onRefresh,
  timeRange = "Last 30 days",
}: OverviewProps) {
  const defaultMetrics: OverviewMetric[] = [
    {
      id: "total-forms",
      icon: <FileText className="h-5 w-5" />,
      label: "Total Forms",
      value: "24",
      change: 12,
      changeColor: "positive",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "published",
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Published",
      value: "18",
      change: 8,
      changeColor: "positive",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: "total-views",
      icon: <Eye className="h-5 w-5" />,
      label: "Total Views",
      value: "12.4K",
      change: 24,
      changeColor: "positive",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: "total-starts",
      icon: <Play className="h-5 w-5" />,
      label: "Total Starts",
      value: "8.7K",
      change: 18,
      changeColor: "positive",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      id: "submissions",
      icon: <Send className="h-5 w-5" />,
      label: "Submissions",
      value: "5.2K",
      change: 22,
      changeColor: "positive",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      id: "dropoffs",
      icon: <XCircle className="h-5 w-5" />,
      label: "Drop-offs",
      value: "3.5K",
      change: 5,
      changeColor: "negative",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      id: "dropoff-rate",
      icon: <Percent className="h-5 w-5" />,
      label: "Drop-off Rate",
      value: "40.2%",
      change: 3,
      changeColor: "positive",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      id: "avg-time",
      icon: <Clock className="h-5 w-5" />,
      label: "Avg. Time",
      value: "3.2m",
      change: 15,
      changeColor: "positive",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      id: "conversion",
      icon: <Target className="h-5 w-5" />,
      label: "Conversion",
      value: "59.8%",
      change: 4,
      changeColor: "positive",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      id: "weekly-growth",
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Weekly Growth",
      value: "+18%",
      change: 2,
      changeColor: "positive",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="pt-30 px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading text-xl font-semibold text-foreground">
              {title}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 w-9 p-0 text-foreground hover:text-foreground"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Select defaultValue={timeRange}>
              <SelectTrigger className="w-[140px] h-9 font-body text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                <SelectItem value="Last year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayMetrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}