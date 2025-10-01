import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Demo from "@/components/landing/demo";
import Templates from "@/components/landing/template";
import Analytics from "@/components/landing/analytics";
import Testimonials from "@/components/landing/testemonials";
import FAQ from "@/components/landing/faq";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <Steps />
      <Demo />
      <Templates />
      <Analytics />
      <Testimonials />
      <FAQ />
    </main>
  );
}