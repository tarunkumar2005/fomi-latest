"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Palette, ShieldCheck, Share2, BarChart3, Library, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Describe your form needs in plain English and watch Fomi create a complete, professional form with smart validation and logical flow.",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    hoverColor: "hover:border-chart-1/30",
    linkColor: "text-chart-1",
  },
  {
    icon: Palette,
    title: "Simple Customization",
    description:
      "Edit questions, adjust themes, and modify logic with an intuitive interface that feels as simple as editing a document.",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    hoverColor: "hover:border-chart-2/30",
    linkColor: "text-chart-2",
  },
  {
    icon: ShieldCheck,
    title: "Smart Validation",
    description:
      "Built-in intelligence ensures data quality with automatic validation, required field checking, and format verification.",
    color: "text-success",
    bgColor: "bg-success/10",
    hoverColor: "hover:border-success/30",
    linkColor: "text-success",
  },
  {
    icon: Share2,
    title: "Instant Sharing",
    description:
      "Every form gets a unique, shareable link. Send via email, embed on websites, or share on social media — just like Google Forms.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    hoverColor: "hover:border-chart-3/30",
    linkColor: "text-chart-3",
  },
  {
    icon: BarChart3,
    title: "Response Dashboard",
    description:
      "Track submissions in real-time with beautiful analytics, completion rates, and engagement insights to optimize your forms.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    hoverColor: "hover:border-chart-4/30",
    linkColor: "text-chart-4",
  },
  {
    icon: Library,
    title: "Template Library",
    description:
      "Start with pre-made forms for surveys, applications, feedback, events, and more. Customize to fit your exact needs.",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    hoverColor: "hover:border-chart-5/30",
    linkColor: "text-chart-5",
  },
]

export default function Features() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 bg-background overflow-hidden" id="features">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Everything you need to create intelligent forms
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 text-pretty">
            From AI generation to response analytics, Fomi provides all the tools you need to collect information
            efficiently and professionally.
          </p>
        </div>

        {/* Features Grid - Better responsive grid with single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`backdrop-blur-xl bg-card/40 border-border/50 shadow-md hover:shadow-lg ${feature.hoverColor} transition-all duration-300 group`}
              >
                <CardContent className="p-5 sm:p-6 md:p-8">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-2.5 sm:p-3 rounded-xl ${feature.bgColor} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-lg sm:text-xl mb-2 sm:mb-3">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <Button variant="link" className={`${feature.linkColor} p-0 h-auto font-medium group/link text-sm`}>
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}