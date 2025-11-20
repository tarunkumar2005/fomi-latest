"use client";

import { useState, useCallback } from "react";
import { Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

interface NumberFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    min?: number;
    max?: number;
    step?: number;
  };
  index: number;
  onUpdate: (updates: Partial<NumberFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function NumberField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: NumberFieldProps) {
  // Use shared field handlers hook
  const {
    isEditingQuestion,
    isEditingDescription,
    isHovered,
    questionRef,
    descriptionRef,
    handleQuestionClick,
    handleDescriptionClick,
    handleQuestionChange,
    handleDescriptionChange,
    handleQuestionBlur,
    handleDescriptionBlur,
    handleQuestionKeyDown,
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
      onUpdate({ placeholder: value });
    },
    [onUpdate]
  );

  const handleMinChange = useCallback(
    (value: string) => {
      const num = parseFloat(value);
      onUpdate({ min: isNaN(num) ? undefined : num });
    },
    [onUpdate]
  );

  const handleMaxChange = useCallback(
    (value: string) => {
      const num = parseFloat(value);
      onUpdate({ max: isNaN(num) ? undefined : num });
    },
    [onUpdate]
  );

  const handleStepChange = useCallback(
    (value: string) => {
      const num = parseFloat(value);
      onUpdate({ step: isNaN(num) || num <= 0 ? undefined : num });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Number"
        fieldIcon={Hash}
        fieldId={field.id}
        question={field.question}
        description={field.description}
        required={field.required}
        isEditingQuestion={isEditingQuestion}
        isEditingDescription={isEditingDescription}
        isHovered={isHovered}
        questionRef={questionRef}
        descriptionRef={descriptionRef}
        onQuestionClick={handleQuestionClick}
        onDescriptionClick={handleDescriptionClick}
        onQuestionChange={handleQuestionChange}
        onDescriptionChange={handleDescriptionChange}
        onQuestionBlur={handleQuestionBlur}
        onDescriptionBlur={handleDescriptionBlur}
        onQuestionKeyDown={handleQuestionKeyDown}
        onDescriptionKeyDown={handleDescriptionKeyDown}
        onRequiredToggle={handleRequiredToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onEnhance={onEnhance}
        onAdvancedClick={handleAdvancedClick}
      >
        <Input
          type="number"
          value=""
          placeholder={field.placeholder || "Enter a number"}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled
          className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50"
        />
      </FieldWrapper>

      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="Number Field Settings"
        subtitle="Configure numeric validation and behavior"
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
            value={field.placeholder || ""}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            placeholder="Enter a number"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Text shown before user enters a value
          </p>
        </div>

        {/* Numeric Validation Section */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Numeric Constraints
          </h4>

          {/* Minimum Value */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="min" className="text-sm font-medium text-foreground">
              Minimum Value
            </Label>
            <Input
              id="min"
              type="number"
              value={field.min !== undefined ? field.min : ""}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="No minimum"
              className="w-full"
              step="any"
            />
            <p className="text-xs text-muted-foreground">
              Minimum allowed value (inclusive)
            </p>
          </div>

          {/* Maximum Value */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="max" className="text-sm font-medium text-foreground">
              Maximum Value
            </Label>
            <Input
              id="max"
              type="number"
              value={field.max !== undefined ? field.max : ""}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder="No maximum"
              className="w-full"
              step="any"
            />
            <p className="text-xs text-muted-foreground">
              Maximum allowed value (inclusive)
            </p>
          </div>

          {/* Step Value */}
          <div className="space-y-2">
            <Label htmlFor="step" className="text-sm font-medium text-foreground">
              Step Increment
            </Label>
            <Input
              id="step"
              type="number"
              value={field.step !== undefined ? field.step : ""}
              onChange={(e) => handleStepChange(e.target.value)}
              placeholder="1"
              className="w-full"
              min="0"
              step="any"
            />
            <p className="text-xs text-muted-foreground">
              Increment value for number input (e.g., 0.1, 1, 10)
            </p>
          </div>
        </div>

        {/* Range Preview */}
        {(field.min !== undefined || field.max !== undefined) && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Allowed Range
            </h4>
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <p className="text-foreground">
                {field.min !== undefined && field.max !== undefined
                  ? `${field.min} to ${field.max}`
                  : field.min !== undefined
                  ? `${field.min} or greater`
                  : `${field.max} or less`}
              </p>
              {field.step && (
                <p className="text-muted-foreground text-xs mt-1">
                  In steps of {field.step}
                </p>
              )}
            </div>
          </div>
        )}
      </AdvancedPanel>
    </>
  );
}
