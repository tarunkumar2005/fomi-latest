"use client";

import { useCallback, memo } from "react";
import { AlignLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

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

    const handleRowsChange = useCallback(
      (value: string) => {
        const num = parseInt(value);
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
          <Textarea
            value=""
            placeholder={field.placeholder || "Your answer here..."}
            rows={field.rows || 4}
            disabled
            className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50 resize-none"
          />
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Paragraph Field Settings"
          subtitle="Configure validation and textarea behavior"
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

          {/* Textarea Rows */}
          <div className="space-y-2">
            <Label
              htmlFor="rows"
              className="text-sm font-medium text-foreground"
            >
              Textarea Height (Rows)
            </Label>
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
            <p className="text-xs text-muted-foreground">
              Number of visible text rows (1-20)
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
