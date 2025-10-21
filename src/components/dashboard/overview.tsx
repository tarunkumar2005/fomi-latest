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
import { useDashboard } from "@/hooks/useDashboard";

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

export default function Overview() {
  const { overviewMetrics } = useDashboard();

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
            <Select defaultValue={"Last 7 days"}>
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
          {overviewMetrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}