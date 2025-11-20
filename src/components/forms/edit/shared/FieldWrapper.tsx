"use client";

import { ReactNode, useContext } from "react";
import {
  GripVertical,
  Copy,
  Trash2,
  Settings,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createContext } from "react";

// Context for drag handle - provided by DraggableFieldWrapper
export const DragHandleContext = createContext<{
  listeners?: any;
  attributes?: any;
} | null>(null);


export interface FieldWrapperProps {
  // Field identification
  index: number;
  fieldType: string;
  fieldIcon?: LucideIcon;
  fieldId: string;

  // Content
  question: string;
  description?: string;
  required: boolean;

  // Edit states
  isEditingQuestion: boolean;
  isEditingDescription: boolean;
  isHovered: boolean;

  // Handlers
  onQuestionClick: () => void;
  onDescriptionClick: () => void;
  onQuestionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onQuestionBlur: () => void;
  onDescriptionBlur: () => void;
  onQuestionKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onDescriptionKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRequiredToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  onAdvancedClick?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;

  // Refs
  questionRef?: React.RefObject<HTMLInputElement | null>;
  descriptionRef?: React.RefObject<HTMLInputElement | null>;

  // Slots for field-specific content
  children: ReactNode; // Preview area content

  // Optional features
  showAdvanced?: boolean;
  advancedLabel?: string;
}

export default function FieldWrapper({
  index,
  fieldType,
  fieldIcon: FieldIcon,
  fieldId,
  question,
  description,
  required,
  isEditingQuestion,
  isEditingDescription,
  isHovered,
  onQuestionClick,
  onDescriptionClick,
  onQuestionChange,
  onDescriptionChange,
  onQuestionBlur,
  onDescriptionBlur,
  onQuestionKeyDown,
  onDescriptionKeyDown,
  onRequiredToggle,
  onDelete,
  onDuplicate,
  onEnhance,
  onAdvancedClick,
  onMouseEnter,
  onMouseLeave,
  questionRef,
  descriptionRef,
  children,
  showAdvanced = true,
  advancedLabel = "Advanced",
}: FieldWrapperProps) {
  // Try to get drag handle context if available
  const dragHandleContext = useContext(DragHandleContext);
  
  return (
    <div className="relative">
      {/* Main Card */}
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 ease-out"
      >
        <div className="p-6">
          {/* Header Row with Type Badge and Actions */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Index Pill */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {index}
              </div>

              {/* Field Type Badge with Optional Icon */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary px-2.5 py-1 rounded-md bg-primary/10">
                {FieldIcon && <FieldIcon className="h-3.5 w-3.5" />}
                <span>{fieldType}</span>
              </div>
            </div>

            {/* Action Icons - Show on Hover */}
            <div
              className={`
                flex items-center gap-1 transition-opacity duration-200
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
                {...(dragHandleContext?.listeners || {})}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                className="h-8 w-8"
                aria-label="Duplicate field"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete field"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Title */}
          <div className="mb-3">
            {isEditingQuestion ? (
              <Input
                ref={questionRef}
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                onBlur={onQuestionBlur}
                onKeyDown={onQuestionKeyDown}
                className="text-base font-semibold text-foreground border-2 border-primary h-auto py-2"
                placeholder="Enter your question"
              />
            ) : (
              <h3
                onClick={onQuestionClick}
                className="text-base font-semibold text-foreground cursor-text hover:text-primary/80 transition-colors duration-150 leading-relaxed"
              >
                {question || "Click to add question"}
              </h3>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            {isEditingDescription ? (
              <Input
                ref={descriptionRef}
                value={description || ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                onBlur={onDescriptionBlur}
                onKeyDown={onDescriptionKeyDown}
                className="text-sm text-muted-foreground border-2 border-primary h-auto py-1.5"
                placeholder="Add description (optional)"
              />
            ) : (
              <p
                onClick={onDescriptionClick}
                className="text-sm text-muted-foreground/70 cursor-text hover:text-muted-foreground transition-colors duration-150 leading-relaxed"
              >
                {description || "Add description (optional)"}
              </p>
            )}
          </div>

          {/* Field-Specific Preview Content */}
          <div className="mb-5">{children}</div>

          {/* Footer Row */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            {/* Left: Required & Advanced */}
            <div className="flex items-center gap-4">
              {/* Required Toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`required-${fieldId}`}
                  checked={required}
                  onCheckedChange={onRequiredToggle}
                  className="rounded"
                />
                <Label
                  htmlFor={`required-${fieldId}`}
                  className="text-sm font-medium text-foreground cursor-pointer select-none"
                >
                  Required
                </Label>
              </div>

              {/* Advanced Button */}
              {showAdvanced && onAdvancedClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAdvancedClick}
                  className="h-8 px-3 text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  {advancedLabel}
                </Button>
              )}
            </div>

            {/* Right: AI Enhance */}
            {onEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhance}
                className="h-8 px-3 text-sm font-medium border-primary/30 text-primary hover:bg-primary/10 hover:border-primary hover:text-primary group"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:scale-110" />
                <span>AI Enhance</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
