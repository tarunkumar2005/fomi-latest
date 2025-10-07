"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MessageSquare,
  Calendar,
  Megaphone,
  GraduationCap,
  FileText,
  ArrowRight
} from "lucide-react";

const categories = ["All", "Business", "HR", "Education", "Events", "Feedback"];

const templates = [
  {
    icon: User,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    category: "HR",
    categoryBg: "bg-blue-100",
    categoryColor: "text-blue-600",
    title: "Job Application Form",
    description: "Comprehensive application form with resume upload, experience questions, and availability.",
    fields: "12 fields",
    pages: "3 pages"
  },
  {
    icon: MessageSquare,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    category: "Feedback",
    categoryBg: "bg-green-100",
    categoryColor: "text-green-600",
    title: "Customer Feedback Survey",
    description: "Gather valuable customer insights with rating scales and open-ended questions.",
    fields: "8 fields",
    pages: "1 page"
  },
  {
    icon: Calendar,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    category: "Events",
    categoryBg: "bg-purple-100",
    categoryColor: "text-purple-600",
    title: "Event Registration",
    description: "Complete event signup with attendee details, preferences, and payment options.",
    fields: "15 fields",
    pages: "2 pages"
  },
  {
    icon: Megaphone,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    category: "Business",
    categoryBg: "bg-orange-100",
    categoryColor: "text-orange-600",
    title: "Lead Generation Form",
    description: "Capture qualified leads with company info, needs assessment, and contact details.",
    fields: "10 fields",
    pages: "1 page"
  },
  {
    icon: GraduationCap,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    category: "Education",
    categoryBg: "bg-pink-100",
    categoryColor: "text-pink-600",
    title: "Course Registration",
    description: "Student enrollment form with course selection, academic background, and payment.",
    fields: "14 fields",
    pages: "2 pages"
  },
  {
    icon: FileText,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    category: "Business",
    categoryBg: "bg-cyan-100",
    categoryColor: "text-cyan-600",
    title: "Project Brief Form",
    description: "Detailed project intake form for agencies and freelancers with scope and timeline.",
    fields: "18 fields",
    pages: "3 pages"
  }
];

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTemplates = activeCategory === "All"
    ? templates
    : templates.filter(t => t.category === activeCategory);

  return (
    <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden" id="templatesw">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Start with a template
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Choose from our library of professionally designed templates, then customize them to match your exact needs.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12 md:mb-16">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 ${activeCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border/50"
                }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-12 md:mb-16">
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="space-y-4 pb-4">
                  {/* Icon and Category */}
                  <div className="flex items-start justify-between">
                    <div className={`${template.iconBg} p-3 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${template.iconColor}`} />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${template.categoryBg} ${template.categoryColor} border-0 font-medium text-xs`}
                    >
                      {template.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <CardTitle className="font-heading text-lg">
                    {template.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-4">
                  {/* Description */}
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {template.description}
                  </CardDescription>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{template.fields}</span>
                    <span>•</span>
                    <span>{template.pages}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary p-0 h-auto font-semibold group/btn"
                  >
                    Use Template
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Browse All Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="font-semibold px-8 py-6 rounded-lg border-border text-foreground hover:text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-300 group"
          >
            Browse All Templates
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}