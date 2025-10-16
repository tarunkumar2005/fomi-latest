"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            AI Insights
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Intelligent analytics and recommendations
          </p>
        </div>

        {/* Locked Card */}
        <Card className="border-border bg-card relative overflow-hidden min-h-[400px] flex items-center justify-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-linear-to-br from-muted/30 to-muted/10" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <CardContent className="relative z-10 text-center p-12">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <Lock className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="font-body text-xs font-semibold text-primary">
                  Coming Soon
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                AI-Powered Insights
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Get intelligent recommendations and automated insights to optimize your forms. This feature is currently in development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}