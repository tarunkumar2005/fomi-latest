"use client";

import { useState } from "react";
import {
  Plus,
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Link,
  ListOrdered,
  CheckSquare,
  ChevronDownIcon,
  Star,
  Sliders,
  Calendar,
  Clock,
  CalendarRange,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FieldType as PrismaFieldType } from "@/app/generated/prisma/enums";

interface FieldTypeDefinition {
  id: PrismaFieldType;
  label: string;
  description: string;
  icon: typeof Type;
  category: "text" | "choice" | "advanced" | "date" | "file";
}

const fieldTypes: FieldTypeDefinition[] = [
  // Text Input Fields
  {
    id: "SHORT_ANSWER",
    label: "Short Answer",
    description: "Single line text input",
    icon: Type,
    category: "text",
  },
  {
    id: "PARAGRAPH",
    label: "Paragraph",
    description: "Multi-line text area",
    icon: AlignLeft,
    category: "text",
  },
  {
    id: "EMAIL",
    label: "Email",
    description: "Email address input",
    icon: Mail,
    category: "text",
  },
  {
    id: "NUMBER",
    label: "Number",
    description: "Numeric input field",
    icon: Hash,
    category: "text",
  },
  {
    id: "PHONE",
    label: "Phone",
    description: "Phone number input",
    icon: Phone,
    category: "text",
  },
  {
    id: "URL",
    label: "URL",
    description: "Website link input",
    icon: Link,
    category: "text",
  },
  // Choice Fields
  {
    id: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    description: "Single selection from options",
    icon: ListOrdered,
    category: "choice",
  },
  {
    id: "CHECKBOXES",
    label: "Checkboxes",
    description: "Multiple selection allowed",
    icon: CheckSquare,
    category: "choice",
  },
  {
    id: "DROPDOWN",
    label: "Dropdown",
    description: "Select from dropdown menu",
    icon: ChevronDownIcon,
    category: "choice",
  },
  // Advanced Fields
  {
    id: "RATING",
    label: "Rating",
    description: "Star, number, or emoji rating",
    icon: Star,
    category: "advanced",
  },
  {
    id: "LINEAR_SCALE",
    label: "Linear Scale",
    description: "Numeric scale selection",
    icon: Sliders,
    category: "advanced",
  },
  // Date & Time Fields
  {
    id: "DATE",
    label: "Date",
    description: "Single date picker",
    icon: Calendar,
    category: "date",
  },
  {
    id: "TIME",
    label: "Time",
    description: "Time selection",
    icon: Clock,
    category: "date",
  },
  {
    id: "DATE_RANGE",
    label: "Date Range",
    description: "Start and end dates",
    icon: CalendarRange,
    category: "date",
  },
  // File Upload
  {
    id: "FILE_UPLOAD",
    label: "File Upload",
    description: "File attachment field",
    icon: Upload,
    category: "file",
  },
];

interface AddQuestionButtonProps {
  onAddQuestion: (fieldType: PrismaFieldType, sectionId?: string) => void;
  sectionId?: string;
}

export default function AddQuestionButton({
  onAddQuestion,
  sectionId,
}: AddQuestionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "text":
        return "Text Inputs";
      case "choice":
        return "Choice Fields";
      case "advanced":
        return "Interactive";
      case "date":
        return "Date & Time";
      case "file":
        return "File Upload";
      default:
        return "";
    }
  };

  const groupedFields = fieldTypes.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldType[]>);

  const categoryOrder: Array<FieldType["category"]> = [
    "text",
    "choice",
    "advanced",
    "date",
    "file",
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "w-full max-w-sm mx-auto py-2.5 sm:py-3 px-4",
            "border-2 border-dashed rounded-xl",
            "transition-all duration-200 text-sm flex items-center justify-center gap-2",
            "group",
            isOpen
              ? "border-primary/50 bg-primary/5 text-primary"
              : "border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary"
          )}
        >
          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add Question</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-[300px] sm:w-[340px] p-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto rounded-xl border-border/60 shadow-2xl"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-2">
          Select Field Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {categoryOrder.map((category, categoryIndex) => {
          const fields = groupedFields[category];
          if (!fields || fields.length === 0) return null;

          return (
            <div key={category}>
              {categoryIndex > 0 && (
                <DropdownMenuSeparator className="my-1.5" />
              )}

              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-muted-foreground">
                  {getCategoryLabel(category)}
                </p>
              </div>

              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => {
                      onAddQuestion(field.id, sectionId);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-lg",
                      "transition-all duration-200 group/item",
                      "hover:bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        "bg-primary/10 text-primary border border-primary/20",
                        "transition-all duration-200",
                        "group-hover/item:bg-primary/15 group-hover/item:border-primary/30 group-hover/item:scale-105"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 group-hover/item:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight transition-colors duration-200 group-hover/item:text-primary">
                        {field.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight transition-colors duration-200 group-hover/item:text-foreground/70">
                        {field.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
