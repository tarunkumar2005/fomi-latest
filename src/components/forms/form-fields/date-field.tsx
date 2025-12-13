"use client";

import { useCallback, memo } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
} from "../edit/shared/AdvancedPanel";
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
      localQuestion,
      localDescription,
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
          question={localQuestion}
          description={localDescription}
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
          <div className="relative group/input">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Calendar className="h-4 w-4 text-muted-foreground/60 group-hover/input:text-primary/60 transition-colors" />
            </div>
            <Input
              type="date"
              value=""
              disabled
              className="pl-10 cursor-not-allowed transition-colors"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--preview-card, hsl(var(--muted))) 30%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--preview-border, hsl(var(--border))) 50%, transparent)",
                color:
                  "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 50%, transparent)",
                height: "var(--preview-input-height, 40px)",
                fontSize: "var(--preview-input-font-size, 14px)",
                borderRadius: "var(--preview-radius, 8px)",
              }}
            />
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Date Settings"
          subtitle="Configure date constraints"
        >
          <AdvancedPanelSection title="Date Constraints">
            <AdvancedPanelFieldGroup
              label="Minimum Date"
              htmlFor="minDate"
              description="Earliest selectable date"
            >
              <Input
                id="minDate"
                type="date"
                value={field.minDate || ""}
                onChange={(e) => handleMinDateChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Date"
              htmlFor="maxDate"
              description="Latest selectable date"
            >
              <Input
                id="maxDate"
                type="date"
                value={field.maxDate || ""}
                onChange={(e) => handleMaxDateChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>
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
