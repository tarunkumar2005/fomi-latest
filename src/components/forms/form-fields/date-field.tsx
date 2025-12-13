"use client";

import { useCallback, memo } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface DateFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    minDate?: string;
    maxDate?: string;
  };
  index: number;
  onUpdate: (updates: Partial<DateFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const DateField = memo(
  function DateField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: DateFieldProps) {
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
          fieldType="Date"
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
          {/* Preview Date Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <Input
              type="date"
              value=""
              disabled
              className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50 pl-10"
            />
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Advanced Settings"
          subtitle="Configure date constraints"
        >
          {/* Date Constraints */}
          <div>
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
                Earliest selectable date
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
                Latest selectable date
              </p>
            </div>
          </div>
        </AdvancedPanel>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.field.question === nextProps.field.question &&
      prevProps.field.description === nextProps.field.description &&
      prevProps.field.required === nextProps.field.required &&
      prevProps.field.minDate === nextProps.field.minDate &&
      prevProps.field.maxDate === nextProps.field.maxDate &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default DateField;
