"use client";

import { useCallback } from "react";
import { Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface ShortAnswerFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
  };
  index: number;
  onUpdate: (updates: Partial<ShortAnswerFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function ShortAnswerField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: ShortAnswerFieldProps) {
  // Use the custom hook for common field handlers
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

  // Field-specific handlers
  const handleRequiredToggle = useCallback(() => {
    onUpdate({ required: !field.required });
  }, [field.required, onUpdate]);

  const handlePlaceholderChange = useCallback(
    (value: string) => {
      onUpdate({ placeholder: value });
    },
    [onUpdate]
  );

  const handleMinLengthChange = useCallback(
    (value: string) => {
      const num = parseInt(value);
      onUpdate({ minLength: isNaN(num) || num < 0 ? undefined : num });
    },
    [onUpdate]
  );

  const handleMaxLengthChange = useCallback(
    (value: string) => {
      const num = parseInt(value);
      onUpdate({ maxLength: isNaN(num) || num < 0 ? undefined : num });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Short Answer"
        fieldIcon={Type}
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
        {/* Field-Specific Preview Content */}
        <Input
          value=""
          placeholder={field.placeholder || "Your answer here..."}
          disabled
          className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50"
        />
      </FieldWrapper>

      {/* Advanced Settings Panel */}
      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="Advanced Settings"
        subtitle="Configure validation and behavior"
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
            placeholder="Your answer here..."
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Text shown before user types
          </p>
        </div>

        {/* Validation Section */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Validation Rules
          </h4>

          {/* Min Length */}
          <div className="space-y-2 mb-4">
            <Label
              htmlFor="minLength"
              className="text-sm font-medium text-foreground"
            >
              Minimum Length
            </Label>
            <Input
              id="minLength"
              type="number"
              min="0"
              value={field.minLength || ""}
              onChange={(e) => handleMinLengthChange(e.target.value)}
              placeholder="No minimum"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum characters required
            </p>
          </div>

          {/* Max Length */}
          <div className="space-y-2">
            <Label
              htmlFor="maxLength"
              className="text-sm font-medium text-foreground"
            >
              Maximum Length
            </Label>
            <Input
              id="maxLength"
              type="number"
              min="0"
              value={field.maxLength || ""}
              onChange={(e) => handleMaxLengthChange(e.target.value)}
              placeholder="No maximum"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum characters allowed
            </p>
          </div>
        </div>
      </AdvancedPanel>
    </>
  );
}
