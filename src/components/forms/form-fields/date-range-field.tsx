"use client";

import { useCallback } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface DateRangeFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
  };
  index: number;
  onUpdate: (updates: Partial<DateRangeFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function DateRangeField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: DateRangeFieldProps) {
  const {
    isEditingQuestion,
    isEditingDescription,
    isHovered,
    questionRef,
    descriptionRef,
    handleQuestionClick,
    handleQuestionChange,
    handleQuestionBlur,
    handleQuestionKeyDown,
    handleDescriptionClick,
    handleDescriptionChange,
    handleDescriptionBlur,
    handleDescriptionKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    handleAdvancedClick,
    handleAdvancedClose,
  } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle);

  const handleRequiredToggle = useCallback(() => {
    onUpdate({ required: !field.required });
  }, [field.required, onUpdate]);

  const handlePlaceholderChange = useCallback(
    (value: string) => {
      onUpdate({ placeholder: value || undefined });
    },
    [onUpdate]
  );

  const handleMinDateChange = useCallback(
    (value: string) => {
      onUpdate({ minDate: value || undefined });
    },
    [onUpdate]
  );

  const handleMaxDateChange = useCallback(
    (value: string) => {
      onUpdate({ maxDate: value || undefined });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Date Range"
        fieldIcon={Calendar}
        fieldId={field.id}
        question={field.question}
        description={field.description}
        required={field.required}
        isEditingQuestion={isEditingQuestion}
        isEditingDescription={isEditingDescription}
        isHovered={isHovered}
        onQuestionClick={handleQuestionClick}
        onDescriptionClick={handleDescriptionClick}
        onQuestionChange={handleQuestionChange}
        onDescriptionChange={handleDescriptionChange}
        onQuestionBlur={handleQuestionBlur}
        onDescriptionBlur={handleDescriptionBlur}
        onQuestionKeyDown={handleQuestionKeyDown}
        onDescriptionKeyDown={handleDescriptionKeyDown}
        onRequiredToggle={handleRequiredToggle}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onEnhance={onEnhance}
        onAdvancedClick={handleAdvancedClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        questionRef={questionRef}
        descriptionRef={descriptionRef}
        showAdvanced={true}
      >
        {/* Preview Date Range Inputs */}
        <div className="space-y-3">
          {/* Start Date */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Start Date
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <Input
                type="date"
                value=""
                placeholder="Select start date"
                disabled
                className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50 pl-10"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              End Date
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <Input
                type="date"
                value=""
                placeholder="Select end date"
                disabled
                className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50 pl-10"
              />
            </div>
          </div>
        </div>
      </FieldWrapper>

      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="Advanced Settings"
        subtitle="Configure date range options"
      >
        {/* Placeholder */}
        <div className="space-y-2">
          <Label
            htmlFor="placeholder"
            className="text-sm font-medium text-foreground"
          >
            Placeholder Text
          </Label>
          <Input
            id="placeholder"
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            placeholder="e.g., Select date range"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Hint text shown when field is empty
          </p>
        </div>

        {/* Date Constraints */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Date Constraints
          </h4>

          {/* Minimum Date */}
          <div className="space-y-2 mb-4">
            <Label
              htmlFor="minDate"
              className="text-sm font-medium text-foreground"
            >
              Minimum Date
            </Label>
            <Input
              id="minDate"
              type="date"
              value={field.minDate || ""}
              onChange={(e) => handleMinDateChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Earliest selectable date (applies to start date)
            </p>
          </div>

          {/* Maximum Date */}
          <div className="space-y-2">
            <Label
              htmlFor="maxDate"
              className="text-sm font-medium text-foreground"
            >
              Maximum Date
            </Label>
            <Input
              id="maxDate"
              type="date"
              value={field.maxDate || ""}
              onChange={(e) => handleMaxDateChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Latest selectable date (applies to end date)
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Note:</strong> The end date
            will automatically be validated to ensure it comes after the
            start date.
          </p>
        </div>
      </AdvancedPanel>
    </>
  );
}
