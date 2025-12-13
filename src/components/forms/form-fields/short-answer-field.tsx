"use client";

import { useCallback, memo } from "react";
import { Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
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

const ShortAnswerField = memo(
  function ShortAnswerField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: ShortAnswerFieldProps) {
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

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value });
      },
      [onUpdate]
    );

    const handleMinLengthChange = useCallback(
      (value: string) => {
        const num = Number.parseInt(value);
        onUpdate({ minLength: isNaN(num) || num < 0 ? undefined : num });
      },
      [onUpdate]
    );

    const handleMaxLengthChange = useCallback(
      (value: string) => {
        const num = Number.parseInt(value);
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
          <Input
            value=""
            placeholder={field.placeholder || "Your answer here..."}
            disabled
            className="cursor-not-allowed"
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
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Short Answer Settings"
          subtitle="Configure validation and behavior"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Text shown before user types"
          >
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="Your answer here..."
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Validation Rules">
            <AdvancedPanelFieldGroup
              label="Minimum Length"
              htmlFor="minLength"
              description="Minimum characters required"
            >
              <Input
                id="minLength"
                type="number"
                min="0"
                value={field.minLength || ""}
                onChange={(e) => handleMinLengthChange(e.target.value)}
                placeholder="No minimum"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Length"
              htmlFor="maxLength"
              description="Maximum characters allowed"
            >
              <Input
                id="maxLength"
                type="number"
                min="0"
                value={field.maxLength || ""}
                onChange={(e) => handleMaxLengthChange(e.target.value)}
                placeholder="No maximum"
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
      prevProps.field.placeholder === nextProps.field.placeholder &&
      prevProps.field.required === nextProps.field.required &&
      prevProps.field.minLength === nextProps.field.minLength &&
      prevProps.field.maxLength === nextProps.field.maxLength &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default ShortAnswerField;
