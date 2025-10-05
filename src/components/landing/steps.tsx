"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Palette,
  Share2,
  Check,
  Copy
} from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Describe Your Form",
    description: 'Tell Fomi what kind of form you need in plain English. "Create a customer feedback survey" or "Build a job application form."',
    example: {
      label: "Example prompt:",
      text: '"Create a restaurant reservation form with date, time, party size, and special requests"'
    },
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/20"
  },
  {
    number: "2",
    title: "Customize & Perfect",
    description: "Edit questions, adjust styling, and fine-tune the logic. Our intuitive editor makes customization effortless.",
    features: [
      { icon: "✏️", text: "Edit questions", color: "text-orange-500" },
      { icon: "🎨", text: "Choose theme", color: "text-pink-500" },
      { icon: "⚡", text: "Add logic", color: "text-yellow-500" }
    ],
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/20"
  },
  {
    number: "3",
    title: "Share & Collect",
    description: "Get your unique form link instantly. Share it anywhere and watch responses flow into your dashboard in real-time.",
    link: {
      label: "Your form link:",
      url: "fomi-forms.vercel.app/forms/form-xyz"
    },
    color: "bg-green-500/10",
    textColor: "text-green-500",
    borderColor: "border-green-500/20"
  }
];

export default function Steps() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 via-background to-muted/30" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Create forms in three simple steps
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            From idea to deployed form in under 30 seconds. No technical skills required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Step Number Badge */}
              <div className="mb-6">
                <div className={`${step.color} ${step.textColor} w-16 h-16 rounded-2xl flex items-center justify-center font-heading text-2xl font-bold shadow-sm`}>
                  {step.number}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="font-heading font-semibold text-xl md:text-2xl text-center mb-4 min-h-14 flex items-center justify-center w-full">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-muted-foreground text-sm md:text-base text-center leading-relaxed mb-6 min-h-28 flex items-start justify-center w-full">
                {step.description}
              </p>

              {/* Step Content Card */}
              <Card className="glassmorphism-card backdrop-blur-xl bg-card/40 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 w-full">
                <CardContent className="p-6">
                  {/* Step 1: Example */}
                  {step.example && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {step.example.label}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50 min-h-24 flex items-center">
                        <p className="text-sm text-foreground font-medium leading-relaxed">
                          {step.example.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Features */}
                  {step.features && (
                    <div className="space-y-2.5">
                      {step.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-muted/30 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{feature.icon}</span>
                            <span className="text-sm font-medium text-foreground">
                              {feature.text}
                            </span>
                          </div>
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Link */}
                  {step.link && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {step.link.label}
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-4 border border-border/50 group hover:bg-muted/70 transition-colors min-h-24">
                        <span className="text-sm text-primary font-medium flex-1 truncate">
                          {step.link.url}
                        </span>
                        <button
                          className="p-2 hover:bg-background/50 rounded-md transition-colors shrink-0"
                          aria-label="Copy link"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
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