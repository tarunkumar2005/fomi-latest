"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Kim",
    role: "Product Manager at Stripe",
    avatar: "",
    initials: "SK",
    rating: 5,
    content:
      "Fomi completely transformed how we collect user feedback. What used to take hours now takes minutes. The AI suggestions are incredibly accurate and save us so much time.",
  },
  {
    name: "David Park",
    role: "Founder at TechStart",
    avatar: "",
    initials: "DP",
    rating: 5,
    content:
      "As a non-technical founder, I was struggling with complex form builders. Fomi's AI understands exactly what I need and creates professional forms instantly. Game changer!",
  },
  {
    name: "Maria Santos",
    role: "HR Director at Growth Co",
    avatar: "",
    initials: "MS",
    rating: 5,
    content:
      "We use Fomi for all our job applications and employee surveys. The analytics dashboard gives us insights we never had before. Our hiring process is now 3x faster.",
  },
  {
    name: "Alex Thompson",
    role: "Marketing Lead at Notion",
    avatar: "",
    initials: "AT",
    rating: 5,
    content:
      "The template library is fantastic, but the real magic happens when you describe your custom needs. Fomi creates forms that look like they were designed by a professional UX team.",
  },
  {
    name: "Lisa Wang",
    role: "Event Organizer",
    avatar: "",
    initials: "LW",
    rating: 5,
    content:
      "I organize 20+ events per year and need different registration forms for each. Fomi's AI creates perfect forms every time, and the analytics help me understand my attendees better.",
  },
]

export default function Testimonials() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Loved by teams worldwide
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 text-pretty">
            See what our users are saying about their experience with Fomi
          </p>
        </div>

        {/* Testimonials Grid - Better responsive layout */}
        <div className="max-w-7xl mx-auto">
          {/* First Row - Single column on mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-5 md:p-6">
                  {/* Avatar and Info */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-base">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm mb-0.5 sm:mb-1">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Second Row - Single column on mobile, 2 cols on tablet+ centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {testimonials.slice(3, 5).map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-5 md:p-6">
                  {/* Avatar and Info */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-base">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm mb-0.5 sm:mb-1">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}