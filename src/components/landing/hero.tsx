"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Sparkles, Play, CheckCircle2 } from "lucide-react"

export default function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background pt-20 md:pt-24">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        {/* Top Badge with Sparkles */}
        <div className="flex justify-center mb-6 md:mb-10">
          <Badge
            variant="secondary"
            className="text-primary px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium backdrop-blur-xl bg-card/60 border border-primary/20 shadow-lg hover:shadow-primary/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Beta v2.0 - Free 10 credits per day!</span>
          </Badge>
        </div>

        {/* Main Heading - Improved responsive typography */}
        <div className="text-center max-w-4xl mx-auto mb-4 md:mb-6 relative">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 text-balance">
            Create Forms{" "}
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-primary via-primary/80 to-chart-2 bg-clip-text text-transparent">
                Instantly with AI
              </span>
            </span>
          </h1>
        </div>

        {/* Description - Better responsive text sizing */}
        <p className="text-center text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-2 text-pretty">
          Describe what you need, and Fomi generates a professional form in seconds. No coding, no complex setup — just
          intelligent forms that work beautifully.
        </p>

        {/* CTA Buttons - Full width on mobile, better spacing */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 md:mb-8 relative z-10 px-4 sm:px-0">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group relative overflow-hidden"
            onClick={() => router.push("/dashboard")}
          >
            <span className="relative z-10 flex items-center justify-center">
              Generate Your First Form
              <svg
                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto font-medium px-6 py-5 sm:py-6 text-sm sm:text-base hover:bg-accent/10 border border-border/50 hover:border-primary/30 transition-all duration-300"
            onClick={() => router.push("#demo")}
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo (2 min)
          </Button>
        </div>

        {/* Trust Indicators - Better mobile layout with wrapping */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground mb-12 md:mb-16 lg:mb-20 relative z-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span>Free forever</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <div className="flex items-center gap-2">
            <span>No credit card required</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <div className="flex items-center gap-2">
            <span>10,000+ forms created</span>
          </div>
        </div>

        {/* Demo Cards Section - Better stacking on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto relative z-10">
          {/* Left Card - AI Form Generator */}
          <Card className="backdrop-blur-2xl bg-card/50 border-border/50 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group">
            <CardContent className="p-4 sm:p-6 md:p-8">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive/80 group-hover:bg-destructive transition-colors" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-warning/80 group-hover:bg-warning transition-colors" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success/80 group-hover:bg-success transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 truncate">fomi.ai/create</span>
              </div>

              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-base sm:text-lg mb-1">AI Form Generator</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Describe your form and watch it build itself
                  </p>
                </div>
              </div>

              {/* Input Section */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Tell me what form you need:</label>
                  <div className="relative">
                    <Input
                      placeholder="Create a job application form..."
                      className="bg-background/60 border-border/50 hover:border-primary/30 focus:border-primary/50 pr-4 py-5 sm:py-6 text-xs sm:text-sm transition-colors"
                      defaultValue="Create a job application form for a marketing manager position with experience, portfoli"
                    />
                  </div>
                </div>

                {/* Generating Status */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
                  </div>
                  <span>Generating your form...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Generated Form Preview */}
          <Card className="backdrop-blur-2xl bg-card/50 border-border/50 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="font-heading font-semibold text-lg sm:text-xl mb-4 sm:mb-6">
                Marketing Manager Application
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    className="bg-background/60 border-border/50 hover:border-primary/30 focus:border-primary/50 transition-colors py-2.5 sm:py-3"
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Years of Experience</label>
                  <Input
                    className="bg-background/60 border-border/50 hover:border-primary/30 focus:border-primary/50 transition-colors py-2.5 sm:py-3"
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Portfolio URL</label>
                  <Input
                    className="bg-background/60 border-border/50 hover:border-primary/30 focus:border-primary/50 transition-colors py-2.5 sm:py-3"
                    placeholder=""
                  />
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5 sm:py-6 mt-2 sm:mt-4 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}