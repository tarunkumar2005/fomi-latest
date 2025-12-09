"use client"

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

// Icon mapping
const ICON_MAP: Record<string, any> = {
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
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  personal: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  business: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
  education: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  payment: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  other: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20" },
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
        "cursor-pointer transition-all duration-200 bg-card border rounded-xl sm:rounded-2xl flex flex-col group relative overflow-hidden",
        "p-3 sm:p-4",
        "min-h-[100px] sm:min-h-[120px]",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md"
          : "border-border/50 hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Top Row: Icon and Category */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div
          className={cn(
            "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 shrink-0",
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
            "text-[9px] sm:text-[10px] font-medium capitalize px-1.5 py-0.5 border rounded-md shrink-0",
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
        <h4 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 leading-tight mb-0.5 sm:mb-1">
          {name}
        </h4>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-border/30">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
        </span>
      </div>
    </Card>
  )
}