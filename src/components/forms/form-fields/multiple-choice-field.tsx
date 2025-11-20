"use client";

import { useState, useCallback } from "react";
import {
  X,
  ListOrdered,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

interface Option {
  id: string;
  label: string;
  value: string;
  default?: boolean;
  image?: string;
}

interface MultipleChoiceFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    options?: Option[];
    randomizeOptions?: boolean;
    allowOther?: boolean;
  };
  index: number;
  onUpdate: (updates: Partial<MultipleChoiceFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function MultipleChoiceField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: MultipleChoiceFieldProps) {
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
  
  // Option editing state
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  // Initialize options if not present
  const options = field.options || [
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
  
  const handleRandomizeOptionsToggle = useCallback(() => {
    onUpdate({ randomizeOptions: !field.randomizeOptions });
  }, [field.randomizeOptions, onUpdate]);

  const handleAllowOtherToggle = useCallback(() => {
    onUpdate({ allowOther: !field.allowOther });
  }, [field.allowOther, onUpdate]);

  // Helper function to generate value from label
  const generateValueFromLabel = (label: string): string => {
    return (
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 50) || "option"
    );
  };

  // Handle adding new option
  const handleAddOption = useCallback(() => {
    const newOption: Option = {
      id: `opt-${Date.now()}`,
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
      default: false,
    };
    onUpdate({ options: [...options, newOption] });
  }, [options, onUpdate]);

  // Handle removing option
  const handleRemoveOption = useCallback(
    (optionId: string) => {
      if (options.length <= 1) {
        return; // Don't allow removing the last option
      }
      const updatedOptions = options.filter((opt) => opt.id !== optionId);
      onUpdate({ options: updatedOptions });
    },
    [options, onUpdate]
  );

  // Handle updating option
  const handleUpdateOption = useCallback(
    (optionId: string, updates: Partial<Option>) => {
      const updatedOptions = options.map((opt) => {
        if (opt.id === optionId) {
          // If label is updated and value hasn't been manually set, auto-sync value
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

  // Handle setting default option (single selection only)
  const handleSetDefault = useCallback(
    (optionId: string) => {
      // For single selection, only one can be default
      const updatedOptions = options.map((opt) => ({
        ...opt,
        default: opt.id === optionId,
      }));
      onUpdate({ options: updatedOptions });
    },
    [options, onUpdate]
  );

  // Handle reordering options
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
        fieldType="Multiple Choice"
        fieldIcon={ListOrdered}
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
      >
        {/* Options List - Field-Specific Content */}
        <div className="space-y-2">
          {field.placeholder && (
            <p className="text-sm text-muted-foreground/60 mb-2">
              {field.placeholder}
            </p>
          )}

          {options.map((option, idx) => (
            <div
              key={option.id}
              className="group/option flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 px-3 py-2 transition-all hover:border-primary/30 hover:bg-background"
            >
              {/* Selection Indicator - Radio button for single selection */}
              <div
                onClick={() => handleSetDefault(option.id)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors"
              >
                {option.default && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>

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
                        if (e.key === "Enter") setEditingOptionId(null);
                        if (e.key === "Escape") setEditingOptionId(null);
                      }}
                      autoFocus
                      placeholder="Option label"
                      className="h-8 text-sm"
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
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingOptionId(option.id)}
                    className="cursor-text"
                  >
                    <p className="text-sm text-foreground truncate">
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground/50 truncate font-mono">
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
                  className="h-6 w-6"
                  title="Move up"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveOption(option.id, "down")}
                  disabled={idx === options.length - 1}
                  className="h-6 w-6"
                  title="Move down"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(option.id)}
                  disabled={options.length <= 1}
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  title="Remove option"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Option Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full h-8 border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>
      </FieldWrapper>

      {/* Advanced Settings Panel */}
      <AdvancedPanel
        isOpen={(isAdvancedOpen ?? false)}
        onClose={handleAdvancedClose}
        title="Multiple Choice Settings"
        subtitle="Configure options behavior"
      >
        {/* Placeholder */}
        <div className="space-y-2">
          <Label htmlFor="placeholder" className="text-sm font-medium">
            Placeholder Text
          </Label>
          <Input
            id="placeholder"
            value={field.placeholder || ""}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            placeholder="e.g., Choose one option"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Optional hint text shown above the options
          </p>
        </div>

        {/* Randomize Options */}
        <div className="pt-4 border-t border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="randomize-options"
                checked={field.randomizeOptions || false}
                onCheckedChange={handleRandomizeOptionsToggle}
                className="rounded"
              />
              <Label
                htmlFor="randomize-options"
                className="text-sm font-medium cursor-pointer"
              >
                Randomize Option Order
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Display options in random order for each respondent
            </p>
          </div>
        </div>

        {/* Allow Other Option */}
        <div className="pt-4 border-t border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-other"
                checked={field.allowOther || false}
                onCheckedChange={handleAllowOtherToggle}
                className="rounded"
              />
              <Label
                htmlFor="allow-other"
                className="text-sm font-medium cursor-pointer"
              >
                Add "Other" Option
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Allow respondents to enter a custom answer
            </p>
          </div>
        </div>
      </AdvancedPanel>
    </>
  );
}
