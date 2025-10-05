"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Palette,
  ShieldCheck,
  Share2,
  BarChart3,
  Library,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Describe your form needs in plain English and watch Fomi create a complete, professional form with smart validation and logical flow.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "hover:border-blue-500/30",
    linkColor: "text-blue-500"
  },
  {
    icon: Palette,
    title: "Simple Customization",
    description: "Edit questions, adjust themes, and modify logic with an intuitive interface that feels as simple as editing a document.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "hover:border-purple-500/30",
    linkColor: "text-purple-500"
  },
  {
    icon: ShieldCheck,
    title: "Smart Validation",
    description: "Built-in intelligence ensures data quality with automatic validation, required field checking, and format verification.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "hover:border-green-500/30",
    linkColor: "text-green-500"
  },
  {
    icon: Share2,
    title: "Instant Sharing",
    description: "Every form gets a unique, shareable link. Send via email, embed on websites, or share on social media — just like Google Forms.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    hoverColor: "hover:border-cyan-500/30",
    linkColor: "text-cyan-500"
  },
  {
    icon: BarChart3,
    title: "Response Dashboard",
    description: "Track submissions in real-time with beautiful analytics, completion rates, and engagement insights to optimize your forms.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    hoverColor: "hover:border-pink-500/30",
    linkColor: "text-pink-500"
  },
  {
    icon: Library,
    title: "Template Library",
    description: "Start with pre-made forms for surveys, applications, feedback, events, and more. Customize to fit your exact needs.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "hover:border-orange-500/30",
    linkColor: "text-orange-500"
  }
];

export default function Features() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden" id="features">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything you need to create intelligent forms
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            From AI generation to response analytics, Fomi provides all the tools you need to
            collect information efficiently and professionally.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`glassmorphism-card backdrop-blur-xl bg-card/40 border-border/50 shadow-lg hover:shadow-xl ${feature.hoverColor} transition-all duration-300 group`}
              >
                <CardContent className="p-6 md:p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-xl mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <Button
                    variant="link"
                    className={`${feature.linkColor} p-0 h-auto font-medium group/link`}
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Glassmorphism styles */}
      <style jsx global>{`
        .glassmorphism-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        @supports (backdrop-filter: blur(20px)) {
          .glassmorphism-card {
            background: hsl(var(--card) / 0.4);
          }
        }
      `}</style>
    </section>
  );
}