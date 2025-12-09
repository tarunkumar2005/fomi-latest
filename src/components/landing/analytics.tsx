"use client"

import Image from "next/image";
import { Card } from "@/components/ui/card"
import dashboardImage from "@/assets/dashboard.png";

export default function Analytics() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/40 via-background to-muted/40" />

      {/* Decorative gradient orbs - Scaled for mobile */}
      <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-2xl sm:blur-3xl" />
      <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-2xl sm:blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Powerful analytics built-in
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 text-pretty">
            Track form performance, analyze responses, and gain insights with real-time dashboards and detailed
            reporting.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-card border border-border/60 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500 overflow-hidden group">
            {/* Dashboard Image Container - Using placeholder */}
            <div className="relative w-full aspect-16/10 bg-linear-to-br from-muted/40 to-muted/60">
              <Image
                src={dashboardImage}
                alt="Fomi Analytics Dashboard - Track form performance and responses"
                className="w-full h-full object-cover object-top"
                fill
                priority
              />

              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-border/20" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}