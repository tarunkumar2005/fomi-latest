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
  ChevronDown as ChevronDownIcon,
  Star,
  Sliders,
  Calendar,
  Clock,
  CalendarRange,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FieldType {
  id: string;
  label: string;
  description: string;
  icon: typeof Type;
  category: "text" | "choice" | "advanced" | "date" | "file";
}

const fieldTypes: FieldType[] = [
  // Text Input Fields
  {
    id: "short-answer",
    label: "Short Answer",
    description: "Single line text input",
    icon: Type,
    category: "text",
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Multi-line text area",
    icon: AlignLeft,
    category: "text",
  },
  {
    id: "email",
    label: "Email",
    description: "Email address input",
    icon: Mail,
    category: "text",
  },
  {
    id: "number",
    label: "Number",
    description: "Numeric input field",
    icon: Hash,
    category: "text",
  },
  {
    id: "phone",
    label: "Phone",
    description: "Phone number input",
    icon: Phone,
    category: "text",
  },
  {
    id: "url",
    label: "URL",
    description: "Website link input",
    icon: Link,
    category: "text",
  },

  // Choice Fields
  {
    id: "multiple-choice",
    label: "Multiple Choice",
    description: "Single selection from options",
    icon: ListOrdered,
    category: "choice",
  },
  {
    id: "checkboxes",
    label: "Checkboxes",
    description: "Multiple selection allowed",
    icon: CheckSquare,
    category: "choice",
  },
  {
    id: "dropdown",
    label: "Dropdown",
    description: "Select from dropdown menu",
    icon: ChevronDownIcon,
    category: "choice",
  },

  // Advanced Fields
  {
    id: "rating",
    label: "Rating",
    description: "Star, number, or emoji rating",
    icon: Star,
    category: "advanced",
  },
  {
    id: "linear-scale",
    label: "Linear Scale",
    description: "Numeric scale selection",
    icon: Sliders,
    category: "advanced",
  },

  // Date & Time Fields
  {
    id: "date",
    label: "Date",
    description: "Single date picker",
    icon: Calendar,
    category: "date",
  },
  {
    id: "time",
    label: "Time",
    description: "Time selection",
    icon: Clock,
    category: "date",
  },
  {
    id: "date-range",
    label: "Date Range",
    description: "Start and end dates",
    icon: CalendarRange,
    category: "date",
  },

  // File Upload
  {
    id: "file-upload",
    label: "File Upload",
    description: "File attachment field",
    icon: Upload,
    category: "file",
  },
];

interface AddQuestionButtonProps {
  onAddQuestion: (fieldType: string) => void;
}

export default function AddQuestionButton({
  onAddQuestion,
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
        <Button
          variant={"default"}
          className={cn(
            "w-full h-auto py-4 px-6 rounded-xl",
            "border-2 border-dashed",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isOpen
              ? "border-primary/50 bg-primary/10"
              : "border-primary/30 bg-transparent hover:bg-primary/8 hover:border-primary/50"
          )}
        >
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Plus className="h-4.5 w-4.5" />
            </div>
            <span className="font-medium text-base text-primary">
              Add Question
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-[320px] p-2 max-h-[600px] overflow-y-auto"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          Select Field Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {categoryOrder.map((category, categoryIndex) => {
          const fields = groupedFields[category];
          if (!fields || fields.length === 0) return null;

          return (
            <div key={category}>
              {categoryIndex > 0 && <DropdownMenuSeparator className="my-1" />}

              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  {getCategoryLabel(category)}
                </p>
              </div>

              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => {
                      onAddQuestion(field.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-lg",
                      "transition-all duration-200 group/item",
                      "hover:bg-primary/8"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        "bg-primary/10 text-primary border border-primary/20",
                        "transition-all duration-200",
                        "group-hover/item:bg-primary/20 group-hover/item:border-primary/40 group-hover/item:scale-105"
                      )}
                    >
                      <Icon className="h-4 w-4 transition-transform duration-200 group-hover/item:scale-110" />
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
