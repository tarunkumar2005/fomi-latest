"use client"

import type React from "react"

import { type ReactNode, useContext } from "react"
import { GripVertical, Copy, Trash2, Settings, Sparkles, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createContext } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import AIEnhance from "@/assets/icon/ai-enhance.png"

// Context for drag handle - provided by DraggableFieldWrapper
export const DragHandleContext = createContext<{
  listeners?: any
  attributes?: any
} | null>(null)

export interface FieldWrapperProps {
  // Field identification
  index: number
  fieldType: string
  fieldIcon?: LucideIcon
  fieldId: string

  // Content
  question: string
  description?: string
  required: boolean

  // Edit states
  isEditingQuestion: boolean
  isEditingDescription: boolean
  isHovered: boolean

  // Handlers
  onQuestionClick: () => void
  onDescriptionClick: () => void
  onQuestionChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onQuestionBlur: () => void
  onDescriptionBlur: () => void
  onQuestionKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onDescriptionKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRequiredToggle: () => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  onAdvancedClick?: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void

  // Refs
  questionRef?: React.RefObject<HTMLInputElement | null>
  descriptionRef?: React.RefObject<HTMLInputElement | null>

  // Slots for field-specific content
  children: ReactNode // Preview area content

  // Optional features
  showAdvanced?: boolean
  advancedLabel?: string
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
  const dragHandleContext = useContext(DragHandleContext)

  return (
    <div className="relative group">
      {/* Main Card */}
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "bg-card rounded-xl sm:rounded-2xl border border-border/50 shadow-sm transition-all duration-200 ease-out",
          isHovered && "shadow-md border-primary/30 ring-1 ring-primary/10",
        )}
      >
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Header Row with Type Badge and Actions */}
          <div className="flex items-start justify-between gap-2 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Index Pill */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm">
                {index}
              </div>

              {/* Field Type Badge with Optional Icon */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-primary px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                {FieldIcon && <FieldIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                <span className="hidden sm:inline">{fieldType}</span>
              </div>
            </div>

            {/* Action Icons - Show on Hover */}
            <div
              className={cn(
                "flex items-center gap-0.5 sm:gap-1 transition-all duration-200",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 cursor-grab active:cursor-grabbing rounded-lg hover:bg-muted/80"
                aria-label="Drag to reorder"
                {...(dragHandleContext?.listeners || {})}
              >
                <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-muted/80"
                aria-label="Duplicate field"
              >
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                aria-label="Delete field"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Question Title */}
          <div className="mb-2 sm:mb-3">
            {isEditingQuestion ? (
              <Input
                ref={questionRef}
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                onBlur={onQuestionBlur}
                onKeyDown={onQuestionKeyDown}
                className="text-sm sm:text-base font-semibold text-foreground border-2 border-primary h-auto py-2 px-3 rounded-lg"
                placeholder="Enter your question"
              />
            ) : (
              <h3
                onClick={onQuestionClick}
                className="text-sm sm:text-base font-semibold text-foreground cursor-text hover:text-primary/80 transition-colors duration-150 leading-relaxed"
              >
                {question || "Click to add question"}
                {required && <span className="text-destructive ml-1">*</span>}
              </h3>
            )}
          </div>

          {/* Description */}
          <div className="mb-3 sm:mb-4">
            {isEditingDescription ? (
              <Input
                ref={descriptionRef}
                value={description || ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                onBlur={onDescriptionBlur}
                onKeyDown={onDescriptionKeyDown}
                className="text-xs sm:text-sm text-muted-foreground border-2 border-primary h-auto py-1.5 px-3 rounded-lg"
                placeholder="Add description (optional)"
              />
            ) : (
              <p
                onClick={onDescriptionClick}
                className="text-xs sm:text-sm text-muted-foreground cursor-text hover:text-foreground/70 transition-colors duration-150 leading-relaxed"
              >
                {description || "Add description (optional)"}
              </p>
            )}
          </div>

          {/* Field-Specific Preview Content */}
          <div className="mb-4 sm:mb-5">{children}</div>

          {/* Footer Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 -mx-4 sm:-mx-5 lg:-mx-6 -mb-4 sm:-mb-5 lg:-mb-6 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/20 rounded-b-xl sm:rounded-b-2xl">
            {/* Left: Required & Advanced */}
            <div className="flex items-center gap-3 sm:gap-4">
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
                  className="text-xs sm:text-sm font-medium text-foreground cursor-pointer select-none"
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
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">{advancedLabel}</span>
                </Button>
              )}
            </div>

            {/* Right: AI Enhance */}
            {onEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhance}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium border-primary/30 text-primary hover:bg-primary/10 hover:border-primary hover:text-primary group rounded-lg w-full sm:w-auto bg-transparent"
              >
                <Image src={AIEnhance} alt="AI Enhance" className="h-4 w-4 mr-1 sm:mr-1.5 inline-block" />
                <span>AI Enhance</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}