"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Describe Your Form",
    description:
      'Tell Fomi what kind of form you need in plain English. "Create a customer feedback survey" or "Build a job application form."',
    example: {
      label: "Example prompt:",
      text: '"Create a restaurant reservation form with date, time, party size, and special requests"',
    },
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/20",
  },
  {
    number: "2",
    title: "Customize & Perfect",
    description:
      "Edit questions, adjust styling, and fine-tune the logic. Our intuitive editor makes customization effortless.",
    features: [
      { icon: "✏️", text: "Edit questions", color: "text-chart-5" },
      { icon: "🎨", text: "Choose theme", color: "text-chart-4" },
      { icon: "⚡", text: "Add logic", color: "text-warning" },
    ],
    color: "bg-chart-2/10",
    textColor: "text-chart-2",
    borderColor: "border-chart-2/20",
  },
  {
    number: "3",
    title: "Share & Collect",
    description:
      "Get your unique form link instantly. Share it anywhere and watch responses flow into your dashboard in real-time.",
    link: {
      label: "Your form link:",
      url: "fomi-forms.vercel.app/forms/form-xyz",
    },
    color: "bg-success/10",
    textColor: "text-success",
    borderColor: "border-success/20",
  },
]

export default function Steps() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 via-background to-muted/30" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Create forms in three simple steps
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 text-pretty">
            From idea to deployed form in under 30 seconds. No technical skills required.
          </p>
        </div>

        {/* Steps Grid - Stack vertically on mobile, horizontal on tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Step Number Badge */}
              <div className="mb-4 sm:mb-6">
                <div
                  className={`${step.color} ${step.textColor} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-heading text-xl sm:text-2xl font-bold shadow-sm`}
                >
                  {step.number}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="font-heading font-semibold text-lg sm:text-xl md:text-2xl text-center mb-3 sm:mb-4">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base text-center leading-relaxed mb-4 sm:mb-6 max-w-xs md:max-w-none">
                {step.description}
              </p>

              {/* Step Content Card */}
              <Card className="backdrop-blur-xl bg-card/40 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 w-full">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  {/* Step 1: Example */}
                  {step.example && (
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {step.example.label}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/50">
                        <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                          {step.example.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Features */}
                  {step.features && (
                    <div className="space-y-2 sm:space-y-2.5">
                      {step.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 bg-muted/30 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-sm sm:text-base">{feature.icon}</span>
                            <span className="text-xs sm:text-sm font-medium text-foreground">{feature.text}</span>
                          </div>
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Link */}
                  {step.link && (
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {step.link.label}
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/50 group hover:bg-muted/70 transition-colors">
                        <span className="text-xs sm:text-sm text-primary font-medium flex-1 truncate">
                          {step.link.url}
                        </span>
                        <button
                          className="p-1.5 sm:p-2 hover:bg-background/50 rounded-md transition-colors shrink-0"
                          aria-label="Copy link"
                        >
                          <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
    </section>
  )
}