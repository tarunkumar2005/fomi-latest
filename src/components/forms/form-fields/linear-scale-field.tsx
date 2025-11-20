"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface LinearScaleFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
  };
  index: number;
  onUpdate: (updates: Partial<LinearScaleFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function LinearScaleField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: LinearScaleFieldProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

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

  const min = field.min ?? 1;
  const max = field.max ?? 5;
  const minLabel = field.minLabel || "";
  const maxLabel = field.maxLabel || "";

  const handleMinChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num < (field.max ?? 10)) {
      onUpdate({ min: num });
    }
  };

  const handleMaxChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > (field.min ?? 0) && num <= 10) {
      onUpdate({ max: num });
    }
  };

  const handleMinLabelChange = (value: string) => {
    onUpdate({ minLabel: value });
  };

  const handleMaxLabelChange = (value: string) => {
    onUpdate({ maxLabel: value });
  };

  const renderScaleButtons = () => {
    const buttons = [];
    for (let i = min; i <= max; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          onClick={() => setSelectedValue(i)}
          disabled
          className={`
            h-12 min-w-[3rem] px-4 rounded-lg border-2 font-semibold text-base
            transition-all duration-150 cursor-pointer
            ${
              selectedValue === i
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/50"
            }
          `}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Linear Scale"
        fieldIcon={Ruler}
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
        {/* Linear Scale Preview */}
        <div className="mb-5">
          {/* Scale with labels */}
          <div className="space-y-3">
            {/* Min Label (if provided) */}
            {minLabel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {min}
                </span>
                <span className="text-sm text-muted-foreground">{minLabel}</span>
              </div>
            )}

            {/* Scale Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {renderScaleButtons()}
            </div>

            {/* Max Label (if provided) */}
            {maxLabel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {max}
                </span>
                <span className="text-sm text-muted-foreground">{maxLabel}</span>
              </div>
            )}

            {/* Helper text */}
            {!minLabel && !maxLabel && (
              <p className="text-xs text-muted-foreground/60 mt-2">
                Scale from {min} to {max}
              </p>
            )}
          </div>
        </div>
      </FieldWrapper>

      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="Advanced Settings"
        subtitle="Configure scale range and labels"
      >
        {/* Scale Range Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Scale Range</h4>

          {/* Minimum Value */}
          <div className="space-y-2">
            <Label htmlFor="min" className="text-sm font-medium text-foreground">
              Minimum Value
            </Label>
            <Input
              id="min"
              type="number"
              min="0"
              max="9"
              value={min}
              onChange={(e) => handleMinChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Starting point of the scale (0-9)
            </p>
          </div>

          {/* Maximum Value */}
          <div className="space-y-2">
            <Label htmlFor="max" className="text-sm font-medium text-foreground">
              Maximum Value
            </Label>
            <Input
              id="max"
              type="number"
              min="1"
              max="10"
              value={max}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              End point of the scale (1-10)
            </p>
          </div>
        </div>

        {/* Labels Section */}
        <div className="pt-4 border-t border-border/50 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Scale Labels (Optional)
          </h4>

          {/* Minimum Label */}
          <div className="space-y-2">
            <Label
              htmlFor="minLabel"
              className="text-sm font-medium text-foreground"
            >
              Label for {min}
            </Label>
            <Input
              id="minLabel"
              value={minLabel}
              onChange={(e) => handleMinLabelChange(e.target.value)}
              placeholder="e.g., Not satisfied"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Description for minimum value
            </p>
          </div>

          {/* Maximum Label */}
          <div className="space-y-2">
            <Label
              htmlFor="maxLabel"
              className="text-sm font-medium text-foreground"
            >
              Label for {max}
            </Label>
            <Input
              id="maxLabel"
              value={maxLabel}
              onChange={(e) => handleMaxLabelChange(e.target.value)}
              placeholder="e.g., Very satisfied"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Description for maximum value
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">Preview</h4>
          <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
            {minLabel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {min}
                </span>
                <span className="text-sm text-muted-foreground">{minLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {renderScaleButtons()}
            </div>
            {maxLabel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {max}
                </span>
                <span className="text-sm text-muted-foreground">{maxLabel}</span>
              </div>
            )}
          </div>
        </div>
      </AdvancedPanel>
    </>
  );
}
