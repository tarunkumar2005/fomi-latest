"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  Phone,
  FileText,
  ListChecks,
  ChevronDown,
  Hash,
  Star,
  Calendar,
  Clock,
  Upload,
  LinkIcon,
  CalendarRange,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateField {
  id: string
  type: string
  question: string
  description: string | null
  required: boolean
  order: number
  options: any
}

interface TemplatePreviewProps {
  templateName: string
  fields: TemplateField[]
  className?: string
}

// Field type icon mapping
const FIELD_TYPE_ICONS: Record<string, any> = {
  "short-answer": FileText,
  email: Mail,
  phone: Phone,
  url: LinkIcon,
  paragraph: FileText,
  "multiple-choice": ListChecks,
  checkboxes: ListChecks,
  dropdown: ChevronDown,
  number: Hash,
  rating: Star,
  "linear-scale": Minus,
  date: Calendar,
  "date-range": CalendarRange,
  time: Clock,
  "file-upload": Upload,
}

// Field type labels
const FIELD_TYPE_LABELS: Record<string, string> = {
  "short-answer": "Short Answer",
  email: "Email",
  phone: "Phone",
  url: "URL",
  paragraph: "Paragraph",
  "multiple-choice": "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  number: "Number",
  rating: "Rating",
  "linear-scale": "Linear Scale",
  date: "Date",
  "date-range": "Date Range",
  time: "Time",
  "file-upload": "File Upload",
}

export default function TemplatePreview({ templateName, fields, className }: TemplatePreviewProps) {
  // Pre-process options to avoid JSON.parse in render loop
  const processedFields = useMemo(() => {
    return fields.map((field) => {
      let parsedOptions = null
      if (field.options) {
        if (typeof field.options === "string") {
          try {
            parsedOptions = JSON.parse(field.options)
          } catch {
            parsedOptions = null
          }
        } else {
          parsedOptions = field.options
        }
      }
      return { ...field, parsedOptions }
    })
  }, [fields])

  const sortedFields = useMemo(() => {
    return [...processedFields].sort((a, b) => a.order - b.order)
  }, [processedFields])

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 shrink-0 bg-muted/30">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <h3 className="font-semibold text-sm text-foreground">{templateName}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </p>
      </div>

      {/* Fields List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 space-y-3">
            {sortedFields.map((field, index) => {
              const IconComponent = FIELD_TYPE_ICONS[field.type] || FileText
              const fieldTypeLabel = FIELD_TYPE_LABELS[field.type] || field.type

              return (
                <div
                  key={field.id}
                  className="p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm"
                >
                  {/* Field Header */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug">
                        {field.question}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                    </div>
                  </div>

                  {/* Field Type Badge */}
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-muted text-muted-foreground border border-border/50 font-medium rounded-md h-5"
                  >
                    {fieldTypeLabel}
                  </Badge>

                  {/* Show options for choice fields */}
                  {field.parsedOptions &&
                    Array.isArray(field.parsedOptions) &&
                    (field.type === "multiple-choice" || field.type === "checkboxes" || field.type === "dropdown") && (
                      <div className="mt-2.5 pl-3 border-l-2 border-primary/20">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Options:</p>
                        <ul className="space-y-1">
                          {field.parsedOptions.slice(0, 3).map((opt: any, i: number) => (
                            <li key={i} className="text-xs text-foreground flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span className="truncate">{opt.label || opt.value || opt}</span>
                            </li>
                          ))}
                          {field.parsedOptions.length > 3 && (
                            <li className="text-[10px] text-muted-foreground italic pl-3.5">
                              +{field.parsedOptions.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}