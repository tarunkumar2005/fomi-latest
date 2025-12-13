"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lock, Sparkles, Brain, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AIInsights() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight font-heading">AI Insights</h2>
          <p className="text-sm text-muted-foreground mt-1">Intelligent analytics and recommendations powered by AI</p>
        </div>

        <Card className="relative overflow-hidden border-border/50 bg-card min-h-[450px]">
          {/* Animated border effect */}
          <div
            className="absolute inset-0 rounded-lg p-px bg-gradient-to-r from-primary/50 via-chart-5/50 to-primary/50 animate-pulse"
            style={{ animationDuration: "3s" }}
          >
            <div className="absolute inset-px rounded-lg bg-card" />
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-5/5" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-chart-5/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <CardContent className="relative z-10 flex flex-col items-center justify-center min-h-[450px] p-6 sm:p-12 text-center">
            {/* Lock Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-chart-5/20 blur-xl" />
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-muted/80 to-muted/50 border border-border/50 backdrop-blur-sm">
                <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-chart-5/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Coming Soon</span>
            </div>

            {/* Content */}
            <div className="max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-heading">AI-Powered Insights</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
                Get intelligent recommendations, automated analysis, and actionable insights to optimize your forms and
                boost conversion rates.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 hover:border-border transition-colors">
                  <Brain className="h-4 w-4 text-chart-1" />
                  <span className="text-xs font-medium text-foreground">Smart Analysis</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 hover:border-border transition-colors">
                  <Zap className="h-4 w-4 text-chart-2" />
                  <span className="text-xs font-medium text-foreground">Auto Optimization</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 hover:border-border transition-colors">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-foreground">Growth Tips</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="outline"
                disabled
                className={cn("opacity-60 bg-transparent rounded-xl", "border-border/50 hover:border-border")}
              >
                Notify Me When Available
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}