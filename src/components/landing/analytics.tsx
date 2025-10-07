"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import dashboardImage from "@/assets/dashboard.png";

export default function Analytics() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/40 via-background to-muted/40" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Powerful analytics built-in
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Track form performance, analyze responses, and gain insights with real-time dashboards and detailed reporting.
          </p>
        </div>

        {/* Analytics Dashboard Image */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-card border border-border/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group">
            {/* Dashboard Image Container */}
            <div className="relative w-full aspect-16/10 bg-linear-to-br from-muted/20 to-muted/40">
              <Image
                src={dashboardImage}
                alt="Fomi Analytics Dashboard - Track form performance and responses"
                fill
                className="object-cover object-top"
                priority
              />

              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-border/20" />
            </div>
          </Card>

          {/* Decorative glow effect */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-r from-primary/20 via-accent/20 to-primary/20" />
          </div>
        </div>
      </div>
    </section>
  );
}