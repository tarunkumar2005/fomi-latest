"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  fieldCount: number;
  onSelect: (templateId: string) => void;
  isSelected?: boolean;
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
};

// Category colors - Subtle styling
const CATEGORY_COLORS: Record<string, string> = {
  personal: "bg-chart-1/10 text-chart-1",
  business: "bg-chart-2/10 text-chart-2",
  education: "bg-success/10 text-success",
  payment: "bg-warning/10 text-warning",
  other: "bg-muted text-muted-foreground",
};

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
  const IconComponent = icon ? ICON_MAP[icon] || Sparkles : Sparkles;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
    <Card
      onClick={() => onSelect(id)}
      className={cn(
        "cursor-pointer transition-all duration-150 bg-background border rounded-xl flex flex-col group",
        "p-3 sm:p-4",
        "min-h-[100px] sm:min-h-[120px]",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-muted/20"
      )}
    >
      {/* Top Row: Icon and Category */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div
          className={cn(
            "p-1.5 sm:p-2 rounded-lg transition-colors shrink-0",
            isSelected
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-medium capitalize px-1.5 py-0.5 border-0 rounded-md shrink-0",
            categoryColor
          )}
        >
          {category}
        </Badge>
      </div>

      {/* Title and Description */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs sm:text-sm text-foreground line-clamp-1 leading-tight mb-0.5 sm:mb-1">
          {name}
        </h4>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-border/50">
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
        </span>
        {isSelected && (
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-medium text-primary hidden sm:inline">
              Selected
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
