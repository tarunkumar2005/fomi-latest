"use client";

import { useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Ruler } from "lucide-react";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";
import { cn } from "@/lib/utils";

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

const LinearScaleField = memo(
  function LinearScaleField({
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

    const min = field.min ?? 1;
    const max = field.max ?? 5;
    const minLabel = field.minLabel || "";
    const maxLabel = field.maxLabel || "";

    const handleMinChange = (value: string) => {
      const num = Number.parseInt(value);
      if (!isNaN(num) && num >= 0 && num < (field.max ?? 10)) {
        onUpdate({ min: num });
      }
    };

    const handleMaxChange = (value: string) => {
      const num = Number.parseInt(value);
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

    const renderScaleButtons = (interactive = false) => {
      const buttons = [];
      for (let i = min; i <= max; i++) {
        const isSelected = selectedValue === i;
        buttons.push(
          <button
            key={i}
            type="button"
            onClick={() => interactive && setSelectedValue(i)}
            disabled={!interactive}
            className={cn(
              "h-11 min-w-[2.75rem] px-3 font-semibold text-sm",
              "transition-all duration-150",
              isSelected && "shadow-md",
              !interactive && "cursor-not-allowed opacity-60"
            )}
            style={{
              borderWidth: "2px",
              borderStyle: "solid",
              borderRadius: "var(--preview-radius, 8px)",
              borderColor: isSelected
                ? "var(--preview-primary, hsl(var(--primary)))"
                : "var(--preview-border, hsl(var(--border)))",
              backgroundColor: isSelected
                ? "var(--preview-primary, hsl(var(--primary)))"
                : "var(--preview-card, hsl(var(--card)))",
              color: isSelected
                ? "white"
                : "var(--preview-text, hsl(var(--foreground)))",
            }}
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
          {/* Linear Scale Preview */}
          <div className="space-y-3">
            {/* Labels row */}
            <div
              className="flex items-center justify-between text-sm"
              style={{ fontFamily: "var(--preview-font-body, inherit)" }}
            >
              {minLabel && (
                <span
                  className="flex items-center gap-2"
                  style={{
                    color:
                      "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                  }}
                >
                  <span
                    className="text-xs font-medium px-2 py-0.5"
                    style={{
                      backgroundColor: "var(--preview-card, hsl(var(--muted)))",
                      color:
                        "color-mix(in srgb, var(--preview-text, hsl(var(--foreground))) 60%, transparent)",
                      borderRadius: "var(--preview-radius, 4px)",
                    }}
                  >
                    {min}
                  </span>
                  {minLabel}
                </span>
              )}
              {!minLabel && !maxLabel && (
                <span
                  className="text-xs"
                  style={{
                    color:
                      "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                  }}
                >
                  Scale: {min} to {max}
                </span>
              )}
              {maxLabel && (
                <span
                  className="flex items-center gap-2 ml-auto"
                  style={{
                    color:
                      "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                  }}
                >
                  {maxLabel}
                  <span
                    className="text-xs font-medium px-2 py-0.5"
                    style={{
                      backgroundColor: "var(--preview-card, hsl(var(--muted)))",
                      color:
                        "color-mix(in srgb, var(--preview-text, hsl(var(--foreground))) 60%, transparent)",
                      borderRadius: "var(--preview-radius, 4px)",
                    }}
                  >
                    {max}
                  </span>
                </span>
              )}
            </div>

            {/* Scale Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {renderScaleButtons()}
            </div>
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Linear Scale Settings"
          subtitle="Configure scale range and labels"
        >
          <AdvancedPanelSection title="Scale Range">
            <AdvancedPanelFieldGroup
              label="Minimum Value"
              htmlFor="min"
              description="Starting point of the scale (0-9)"
            >
              <Input
                id="min"
                type="number"
                min="0"
                max="9"
                value={min}
                onChange={(e) => handleMinChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Value"
              htmlFor="max"
              description="End point of the scale (1-10)"
            >
              <Input
                id="max"
                type="number"
                min="1"
                max="10"
                value={max}
                onChange={(e) => handleMaxChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Scale Labels (Optional)">
            <AdvancedPanelFieldGroup
              label={`Label for ${min}`}
              htmlFor="minLabel"
              description="Description for minimum value"
            >
              <Input
                id="minLabel"
                value={minLabel}
                onChange={(e) => handleMinLabelChange(e.target.value)}
                placeholder="e.g., Not satisfied"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label={`Label for ${max}`}
              htmlFor="maxLabel"
              description="Description for maximum value"
            >
              <Input
                id="maxLabel"
                value={maxLabel}
                onChange={(e) => handleMaxLabelChange(e.target.value)}
                placeholder="e.g., Very satisfied"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          <AdvancedPanelDivider />

          {/* Preview Section */}
          <AdvancedPanelSection title="Preview">
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
              {minLabel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground min-w-[2rem] text-center">
                    {min}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {minLabel}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {renderScaleButtons(true)}
              </div>
              {maxLabel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground min-w-[2rem] text-center">
                    {max}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {maxLabel}
                  </span>
                </div>
              )}
            </div>
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
      prevProps.field.min === nextProps.field.min &&
      prevProps.field.max === nextProps.field.max &&
      prevProps.field.minLabel === nextProps.field.minLabel &&
      prevProps.field.maxLabel === nextProps.field.maxLabel &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default LinearScaleField;
