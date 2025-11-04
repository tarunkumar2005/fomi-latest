"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Award, TrendingDown } from "lucide-react";

// ===========================
// TYPES
// ===========================

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  color: string;
  dropoff: number;
}

interface TopForm {
  rank: number;
  name: string;
  slug: string;
  conversionRate: number;
  avgTime: string;
  views: number;
  starts: number;
  submissions: number;
}

interface FunnelData {
  conversionFunnel?: FunnelStage[];
  topForms?: TopForm[];
}

interface FunnelAnalysisProps {
  isLoading?: boolean;
  funnelData?: FunnelData;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

const getPodiumHeight = (rank: number): string => {
  const heights = {
    1: "h-32",
    2: "h-24", 
    3: "h-20",
  };
  return heights[rank as keyof typeof heights] || "h-16";
};

const getPodiumColors = (rank: number) => {
  const colors = {
    1: {
      border: "border-yellow-300",
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      badge: "bg-yellow-100 text-yellow-700",
      podium: "bg-gradient-to-t from-yellow-400 to-yellow-300",
      badgeSize: "text-2xl",
      rateSize: "text-2xl",
    },
    2: {
      border: "border-gray-300",
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      badge: "bg-gray-100 text-gray-700",
      podium: "bg-gradient-to-t from-gray-400 to-gray-300",
      badgeSize: "text-xl",
      rateSize: "text-xl",
    },
    3: {
      border: "border-orange-300",
      bg: "bg-gradient-to-br from-orange-50 to-amber-50",
      badge: "bg-orange-100 text-orange-700",
      podium: "bg-gradient-to-t from-orange-400 to-orange-300",
      badgeSize: "text-xl",
      rateSize: "text-xl",
    },
  };
  return colors[rank as keyof typeof colors] || colors[3];
};

// ===========================
// COMPONENTS
// ===========================

const LoadingSkeleton = () => (
  <div className="px-4 sm:px-6 py-8 bg-background">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pb-5">
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-64 flex items-center justify-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// ===========================
// MAIN COMPONENT
// ===========================

export default function FunnelAnalysis({ 
  isLoading = false, 
  funnelData 
}: FunnelAnalysisProps) {
  // Extract data with fallbacks
  const {
    conversionFunnel = [],
    topForms = [],
  } = funnelData || {};

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Sort top forms for podium display (2nd, 1st, 3rd order)
  const podiumOrder = [
    topForms.find(f => f.rank === 2),
    topForms.find(f => f.rank === 1),
    topForms.find(f => f.rank === 3),
  ].filter(Boolean) as TopForm[];

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
          
          {/* ===== CONVERSION FUNNEL ===== */}
          <Card className="border-border bg-card hover:shadow-sm transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              {conversionFunnel.length === 0 ? (
                <EmptyState message="No funnel data available" />
              ) : (
                <div className="space-y-3">
                  {conversionFunnel.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      {/* Stage Header */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-semibold text-foreground">
                            {stage.stage}
                          </span>
                          {stage.dropoff > 0 && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" />
                              -{stage.dropoff}%
                            </span>
                          )}
                        </div>
                        <span className="font-body text-xs text-muted-foreground">
                          {stage.value.toLocaleString()} ({stage.percentage}%)
                        </span>
                      </div>
                      
                      {/* Funnel Bar */}
                      <div className="relative h-14 bg-muted/20 rounded-xl overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 flex items-center justify-between px-4"
                          style={{
                            width: `${stage.percentage}%`,
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ===== TOP PERFORMING FORMS ===== */}
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
              {topForms.length === 0 ? (
                <EmptyState message="No form performance data available" />
              ) : (
                <div className="flex items-end justify-center gap-3">
                  {podiumOrder.map((form) => {
                    const colors = getPodiumColors(form.rank);
                    const height = getPodiumHeight(form.rank);
                    
                    return (
                      <div key={form.slug} className="flex flex-col items-center flex-1">
                        {/* Form Card */}
                        <div className="w-full mb-2">
                          <div
                            className={cn(
                              "p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer",
                              colors.border,
                              colors.bg
                            )}
                          >
                            {/* Rank Badge */}
                            <div className="flex justify-center mb-2">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold",
                                colors.badge,
                                colors.badgeSize
                              )}>
                                {form.rank}
                              </div>
                            </div>
                            
                            {/* Form Details */}
                            <div className="text-center">
                              <p className="font-body text-xs font-semibold text-foreground mb-1.5 truncate" title={form.name}>
                                {form.name}
                              </p>
                              <p className={cn(
                                "font-heading font-bold text-foreground mb-1",
                                colors.rateSize
                              )}>
                                {form.conversionRate}%
                              </p>
                              <p className="font-body text-xs text-muted-foreground">
                                Avg: {form.avgTime}
                              </p>
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Views</p>
                                    <p className="font-semibold text-foreground">{form.views}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Starts</p>
                                    <p className="font-semibold text-foreground">{form.starts}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Done</p>
                                    <p className="font-semibold text-foreground">{form.submissions}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Podium Base */}
                        <div
                          className={cn(
                            "w-full rounded-t-lg transition-all",
                            height,
                            colors.podium
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}