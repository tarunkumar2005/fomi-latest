"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export default function FunnelAnalysis() {
  const { funnelStages, topForms } = useDashboard();

  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Funnel & Behavior Analytics
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Visualize user journey and identify drop-off points
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Funnel Visualization */}
          <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="space-y-3">
                {funnelStages.map((stage, index) => {
                  const widthPercentage = stage.percentage;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-semibold text-foreground">
                            {stage.stage}
                          </span>
                          {stage.dropoff > 0 && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              -{stage.dropoff}%
                            </span>
                          )}
                        </div>
                        <span className="font-body text-xs text-muted-foreground">
                          {stage.value.toLocaleString()} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="relative h-14 bg-muted/20 rounded-xl overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 flex items-center justify-between px-4"
                          style={{
                            width: `${widthPercentage}%`,
                            background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`
                          }}
                        >
                          <span className="font-heading text-sm font-bold text-white">
                            {stage.value.toLocaleString()}
                          </span>
                          <span className="font-body text-xs font-semibold text-white/90">
                            {stage.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Forms - Podium Style */}
          <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base font-semibold text-foreground">
                  Top Performing Forms
                </CardTitle>
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              {/* Podium Layout */}
              <div className="flex items-end justify-center gap-3">
                {topForms.map((form, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    {/* Card */}
                    <div className="w-full mb-2">
                      <div
                        className={cn(
                          "p-3 rounded-lg border border-border bg-card hover:shadow-md transition-all cursor-pointer",
                          form.rank === 1 && "border-yellow-300 bg-linear-to-br from-yellow-50 to-amber-50",
                          form.rank === 2 && "border-gray-300 bg-linear-to-br from-gray-50 to-slate-50",
                          form.rank === 3 && "border-orange-300 bg-linear-to-br from-orange-50 to-amber-50"
                        )}
                      >
                        <div className="flex justify-center mb-2">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold",
                            form.rank === 1 && "bg-yellow-100 text-yellow-700 text-2xl",
                            form.rank === 2 && "bg-gray-100 text-gray-700 text-xl",
                            form.rank === 3 && "bg-orange-100 text-orange-700 text-xl"
                          )}>
                            {form.rank}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-body text-xs font-semibold text-foreground mb-1.5">
                            {form.name}
                          </p>
                          <p className={cn(
                            "font-heading font-bold text-foreground mb-1",
                            form.rank === 1 ? "text-2xl" : "text-xl"
                          )}>
                            {form.conversionRate}%
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {form.avgTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Podium Base */}
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        form.height,
                        form.rank === 1 && "bg-linear-to-t from-yellow-400 to-yellow-300",
                        form.rank === 2 && "bg-linear-to-t from-gray-400 to-gray-300",
                        form.rank === 3 && "bg-linear-to-t from-orange-400 to-orange-300"
                      )}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}