"use client";

import { useState, useCallback, memo } from "react";
import {
  X,
  CheckSquare,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  value: string;
  default?: boolean;
  image?: string;
}

interface CheckboxesFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    options?: Option[];
    minSelections?: number;
    maxSelections?: number;
    randomizeOptions?: boolean;
    allowOther?: boolean;
  };
  index: number;
  onUpdate: (updates: Partial<CheckboxesFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const CheckboxesField = memo(
  function CheckboxesField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: CheckboxesFieldProps) {
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

    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

    const options: Option[] = Array.isArray(field.options)
      ? field.options
      : [
          { id: "opt-1", label: "Option 1", value: "option_1", default: false },
          { id: "opt-2", label: "Option 2", value: "option_2", default: false },
          { id: "opt-3", label: "Option 3", value: "option_3", default: false },
        ];

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value });
      },
      [onUpdate]
    );

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required });
    }, [field.required, onUpdate]);

    const handleMinSelectionsChange = useCallback(
      (value: string) => {
        const num = Number.parseInt(value);
        onUpdate({ minSelections: isNaN(num) || num < 0 ? undefined : num });
      },
      [onUpdate]
    );

    const handleMaxSelectionsChange = useCallback(
      (value: string) => {
        const num = Number.parseInt(value);
        onUpdate({ maxSelections: isNaN(num) || num < 0 ? undefined : num });
      },
      [onUpdate]
    );

    const handleRandomizeOptionsToggle = useCallback(() => {
      onUpdate({ randomizeOptions: !field.randomizeOptions });
    }, [field.randomizeOptions, onUpdate]);

    const handleAllowOtherToggle = useCallback(() => {
      onUpdate({ allowOther: !field.allowOther });
    }, [field.allowOther, onUpdate]);

    const generateValueFromLabel = (label: string): string => {
      return (
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .substring(0, 50) || "option"
      );
    };

    const handleAddOption = useCallback(() => {
      const newOption: Option = {
        id: `opt-${Date.now()}`,
        label: `Option ${options.length + 1}`,
        value: `option_${options.length + 1}`,
        default: false,
      };
      onUpdate({ options: [...options, newOption] });
    }, [options, onUpdate]);

    const handleRemoveOption = useCallback(
      (optionId: string) => {
        if (options.length <= 1) return;
        const updatedOptions = options.filter((opt) => opt.id !== optionId);
        onUpdate({ options: updatedOptions });
      },
      [options, onUpdate]
    );

    const handleUpdateOption = useCallback(
      (optionId: string, updates: Partial<Option>) => {
        const updatedOptions = options.map((opt) => {
          if (opt.id === optionId) {
            if (updates.label !== undefined && updates.value === undefined) {
              return {
                ...opt,
                ...updates,
                value: generateValueFromLabel(updates.label),
              };
            }
            return { ...opt, ...updates };
          }
          return opt;
        });
        onUpdate({ options: updatedOptions });
      },
      [options, onUpdate]
    );

    const handleToggleDefault = useCallback(
      (optionId: string) => {
        const updatedOptions = options.map((opt) =>
          opt.id === optionId ? { ...opt, default: !opt.default } : opt
        );
        onUpdate({ options: updatedOptions });
      },
      [options, onUpdate]
    );

    const handleMoveOption = useCallback(
      (optionId: string, direction: "up" | "down") => {
        const idx = options.findIndex((opt) => opt.id === optionId);
        if (
          (direction === "up" && idx === 0) ||
          (direction === "down" && idx === options.length - 1)
        ) {
          return;
        }

        const newOptions = [...options];
        const targetIndex = direction === "up" ? idx - 1 : idx + 1;
        [newOptions[idx], newOptions[targetIndex]] = [
          newOptions[targetIndex],
          newOptions[idx],
        ];
        onUpdate({ options: newOptions });
      },
      [options, onUpdate]
    );

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Checkboxes"
          fieldIcon={CheckSquare}
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
        >
          {/* Options List */}
          <div className="space-y-2">
            {field.placeholder && (
              <p className="text-sm text-muted-foreground/70 mb-3">
                {field.placeholder}
              </p>
            )}

            {options.map((option, idx) => (
              <div
                key={option.id ?? `option-${idx}`}
                className={cn(
                  "group/option flex items-center gap-2 px-3 py-2.5",
                  "transition-all duration-150"
                )}
                style={{
                  backgroundColor: "var(--preview-card, hsl(var(--card)))",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "var(--preview-border, hsl(var(--border)))",
                  borderRadius: "var(--preview-radius, 8px)",
                }}
              >
                {/* Drag Handle */}
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />

                {/* Checkbox Indicator */}
                <button
                  type="button"
                  onClick={() => handleToggleDefault(option.id)}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border-2",
                    "transition-colors duration-150"
                  )}
                  style={{
                    borderColor: option.default
                      ? "var(--preview-primary, hsl(var(--primary)))"
                      : "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 30%, transparent)",
                    backgroundColor: option.default
                      ? "var(--preview-primary, hsl(var(--primary)))"
                      : "transparent",
                    borderRadius: "4px",
                  }}
                >
                  {option.default && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                  {editingOptionId === option.id ? (
                    <div className="space-y-2">
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          handleUpdateOption(option.id, {
                            label: e.target.value,
                          })
                        }
                        onBlur={() => setEditingOptionId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape")
                            setEditingOptionId(null);
                        }}
                        autoFocus
                        placeholder="Option label"
                        className="h-8 text-sm"
                        style={{
                          fontFamily: "var(--preview-font-body, inherit)",
                          borderRadius: "var(--preview-radius, 8px)",
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Value:
                        </span>
                        <Input
                          value={option.value}
                          onChange={(e) =>
                            handleUpdateOption(option.id, {
                              value: e.target.value,
                            })
                          }
                          placeholder="auto-generated"
                          className="h-7 text-xs text-muted-foreground font-mono"
                          style={{
                            borderRadius: "var(--preview-radius, 8px)",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingOptionId(option.id)}
                      className="cursor-text"
                    >
                      <p
                        className="text-sm truncate"
                        style={{
                          fontFamily: "var(--preview-font-body, inherit)",
                          color: "var(--preview-text, hsl(var(--foreground)))",
                        }}
                      >
                        {option.label}
                      </p>
                      <p
                        className="text-xs truncate font-mono"
                        style={{
                          color:
                            "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 50%, transparent)",
                        }}
                      >
                        {option.value}
                      </p>
                    </div>
                  )}
                </div>

                {/* Option Actions */}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/option:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveOption(option.id, "up")}
                    disabled={idx === 0}
                    className="h-7 w-7"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveOption(option.id, "down")}
                    disabled={idx === options.length - 1}
                    className="h-7 w-7"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(option.id)}
                    disabled={options.length <= 1}
                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Option Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="w-full h-9 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 bg-transparent"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Option
            </Button>
          </div>
        </FieldWrapper>

        {/* Advanced Settings Panel */}
        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Checkboxes Settings"
          subtitle="Configure validation and behavior"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Optional hint text shown above the options"
          >
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="e.g., Select all that apply"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Selection Limits">
            <AdvancedPanelFieldGroup
              label="Minimum Selections"
              htmlFor="minSelections"
              description="Minimum number of options that must be selected"
            >
              <Input
                id="minSelections"
                type="number"
                min="0"
                value={field.minSelections || ""}
                onChange={(e) => handleMinSelectionsChange(e.target.value)}
                placeholder="No minimum"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Selections"
              htmlFor="maxSelections"
              description="Maximum number of options that can be selected"
            >
              <Input
                id="maxSelections"
                type="number"
                min="0"
                value={field.maxSelections || ""}
                onChange={(e) => handleMaxSelectionsChange(e.target.value)}
                placeholder="No maximum"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          <AdvancedPanelDivider />

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="randomize-options"
                checked={field.randomizeOptions || false}
                onCheckedChange={handleRandomizeOptionsToggle}
              />
              <div className="flex-1">
                <label
                  htmlFor="randomize-options"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Randomize Option Order
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display options in random order for each respondent
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="allow-other"
                checked={field.allowOther || false}
                onCheckedChange={handleAllowOtherToggle}
              />
              <div className="flex-1">
                <label
                  htmlFor="allow-other"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Add "Other" Option
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Allow respondents to enter a custom answer
                </p>
              </div>
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
      JSON.stringify(prevProps.field.options) ===
        JSON.stringify(nextProps.field.options) &&
      prevProps.field.minSelections === nextProps.field.minSelections &&
      prevProps.field.maxSelections === nextProps.field.maxSelections &&
      prevProps.field.randomizeOptions === nextProps.field.randomizeOptions &&
      prevProps.field.allowOther === nextProps.field.allowOther &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default CheckboxesField;
