"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "How does AI form generation work?",
    answer:
      'Simply describe what kind of form you need in plain English, like "Create a job application form for a marketing manager position." Our AI analyzes your request and generates a complete form with appropriate fields, validation rules, and professional styling. You can then customize any aspect of the generated form to match your exact needs.',
  },
  {
    question: "Can I customize the generated forms?",
    answer:
      "After AI generates your form, you can edit questions, change field types, adjust styling, add conditional logic, modify themes, and customize every aspect of your form. Our editor is designed to be as simple as editing a document while providing powerful customization options.",
  },
  {
    question: "How do I share my forms?",
    answer:
      "Each form gets a unique, shareable link that you can send via email, share on social media, or embed on your website. Recipients can fill out the form directly in their browser without needing to create an account. You'll receive responses in real-time in your dashboard.",
  },
  {
    question: "What kind of analytics do you provide?",
    answer:
      "Our analytics dashboard shows you form views, completion rates, drop-off points, average completion time, and response trends over time. You can see exactly where users are getting stuck and optimize your forms for better conversion. All data is presented in easy-to-understand charts and graphs.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! Our free plan includes 5 forms per month with up to 100 responses each, AI form generation, basic templates, and analytics. It's perfect for individuals and small projects. You can upgrade to a paid plan anytime for more forms, responses, and advanced features.",
  },
  {
    question: "Do you integrate with other tools?",
    answer:
      "Currently, Fomi focuses on being the best form creation and response collection tool. We provide CSV export and webhook support for connecting with your existing tools. We're working on direct integrations with popular platforms and will announce them as they become available.",
  },
]

export default function FAQ() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Better responsive typography */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2 text-pretty">
            Everything you need to know about Fomi and how it works
          </p>
        </div>

        {/* FAQ Accordion - Better mobile padding and spacing */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-4 sm:px-6 hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs sm:text-sm leading-relaxed pb-4 sm:pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support CTA */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">Still have questions?</p>
          <Link href="/support">
            <Button variant="link" className="text-primary hover:text-primary font-semibold group text-sm sm:text-base">
              Contact our support team
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}