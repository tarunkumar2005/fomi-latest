"use client"

export default function Demo() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-36 bg-background overflow-hidden" id="demo">
      {/* Enhanced layered background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Animated gradient orbs - Scaled down for mobile */}
      <div className="absolute top-1/4 -left-10 sm:-left-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-10 sm:-right-20 w-64 sm:w-80 md:w-[500px] h-64 sm:h-80 md:h-[500px] bg-accent/15 rounded-full blur-[100px] sm:blur-[120px] animate-pulse delay-1000" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20 lg:mb-24 space-y-4 sm:space-y-6">
          {/* Heading */}
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance">
            <span className="bg-linear-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              See Fomi in Action
            </span>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2 text-pretty">
            Watch how our AI transforms your ideas into beautiful, functional forms in seconds
          </p>
        </div>

        {/* Video Container - Better aspect ratio handling */}
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl bg-muted/20 border border-border/30">
            <div className="aspect-video">
              <video autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover">
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}