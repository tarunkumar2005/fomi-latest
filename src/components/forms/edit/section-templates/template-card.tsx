"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  MapPin,
  AlertCircle,
  Building2,
  Briefcase,
  Users,
  GraduationCap,
  Award,
  CreditCard,
  Receipt,
  Package,
  Share2,
  Upload,
  Heart,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateCardProps {
  id: string
  name: string
  description: string | null
  category: string
  icon: string | null
  fieldCount: number
  onSelect: (templateId: string) => void
  isSelected?: boolean
}

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  MapPin,
  AlertCircle,
  Building2,
  Briefcase,
  Users,
  GraduationCap,
  Award,
  CreditCard,
  Receipt,
  Package,
  Share2,
  Upload,
  Heart,
  Calendar,
  Sparkles,
  FileText,
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  personal: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  business: {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    border: "border-chart-2/20",
  },
  education: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  payment: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  other: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
}

export default function TemplateCard({
  id,
  name,
  description,
  category,
  icon,
  fieldCount,
  onSelect,
  isSelected = false,
}: TemplateCardProps) {
  const IconComponent = icon ? ICON_MAP[icon] || Sparkles : Sparkles
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.other

  return (
    <Card
      onClick={() => onSelect(id)}
      className={cn(
        "group relative cursor-pointer transition-all duration-200 flex flex-col overflow-hidden",
        "rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[100px] sm:min-h-[130px]",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md"
          : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Hover accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary/40 transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      />

      {/* Top Row: Icon and Category */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={cn(
            "p-2 sm:p-2.5 rounded-xl transition-all duration-200 shrink-0",
            isSelected
              ? "bg-primary/15 text-primary shadow-sm"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-[9px] sm:text-[10px] font-medium capitalize px-2 py-0.5 border rounded-md shrink-0",
            categoryStyle.bg,
            categoryStyle.text,
            categoryStyle.border,
          )}
        >
          {category}
        </Badge>
      </div>

      {/* Title and Description */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 leading-tight mb-1">{name}</h4>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/30">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
        </span>
      </div>
    </Card>
  )
}