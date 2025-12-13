"use client";

import { useCallback, memo } from "react";
import { AlignLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface ParagraphFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    rows?: number;
  };
  index: number;
  onUpdate: (updates: Partial<ParagraphFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const ParagraphField = memo(
  function ParagraphField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: ParagraphFieldProps) {
    const {
      isEditingQuestion,
      isEditingDescription,
      isHovered,
      localQuestion,
      localDescription,
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

    const handleRowsChange = useCallback(
      (value: string) => {
        const num = Number.parseInt(value);
        onUpdate({ rows: isNaN(num) || num < 1 ? 4 : num });
      },
      [onUpdate]
    );

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Paragraph"
          fieldIcon={AlignLeft}
          fieldId={field.id}
          question={localQuestion}
          description={localDescription}
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
          <Textarea
            value=""
            placeholder={field.placeholder || "Your answer here..."}
            rows={field.rows || 4}
            disabled
            className="cursor-not-allowed resize-none"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--preview-card, hsl(var(--muted))) 30%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--preview-border, hsl(var(--border))) 50%, transparent)",
              color:
                "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 50%, transparent)",
              fontSize: "var(--preview-input-font-size, 14px)",
              borderRadius: "var(--preview-radius, 8px)",
            }}
          />
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Paragraph Settings"
          subtitle="Configure validation and textarea behavior"
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

          <AdvancedPanelFieldGroup
            label="Textarea Height (Rows)"
            htmlFor="rows"
            description="Number of visible text rows (1-20)"
          >
            <Input
              id="rows"
              type="number"
              min="1"
              max="20"
              value={field.rows || 4}
              onChange={(e) => handleRowsChange(e.target.value)}
              placeholder="4"
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
      prevProps.field.rows === nextProps.field.rows &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default ParagraphField;
