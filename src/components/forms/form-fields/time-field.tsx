"use client";

import { useCallback } from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface TimeFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    placeholder?: string;
    timeFormat?: "12" | "24";
    minTime?: string;
    maxTime?: string;
  };
  index: number;
  onUpdate: (updates: Partial<TimeFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

export default function TimeField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: TimeFieldProps) {
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

  const handlePlaceholderChange = useCallback(
    (value: string) => {
      onUpdate({ placeholder: value || undefined });
    },
    [onUpdate]
  );

  const handleTimeFormatChange = useCallback(
    (value: "12" | "24") => {
      onUpdate({ timeFormat: value });
    },
    [onUpdate]
  );

  const handleMinTimeChange = useCallback(
    (value: string) => {
      onUpdate({ minTime: value || undefined });
    },
    [onUpdate]
  );

  const handleMaxTimeChange = useCallback(
    (value: string) => {
      onUpdate({ maxTime: value || undefined });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Time"
        fieldIcon={Clock}
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
        {/* Preview Time Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Clock className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <Input
            type="time"
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
        subtitle="Configure time input options"
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
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            placeholder="e.g., Select time"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Hint text shown when field is empty
          </p>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <Label
            htmlFor="timeFormat"
            className="text-sm font-medium text-foreground"
          >
            Time Format
          </Label>
          <Select
            value={field.timeFormat || "24"}
            onValueChange={handleTimeFormatChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12-hour (e.g., 2:30 PM)</SelectItem>
              <SelectItem value="24">24-hour (e.g., 14:30)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Display format for time input
          </p>
        </div>

        {/* Time Constraints */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Time Constraints
          </h4>

          {/* Minimum Time */}
          <div className="space-y-2 mb-4">
            <Label
              htmlFor="minTime"
              className="text-sm font-medium text-foreground"
            >
              Minimum Time
            </Label>
            <Input
              id="minTime"
              type="time"
              value={field.minTime || ""}
              onChange={(e) => handleMinTimeChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Earliest selectable time
            </p>
          </div>

          {/* Maximum Time */}
          <div className="space-y-2">
            <Label
              htmlFor="maxTime"
              className="text-sm font-medium text-foreground"
            >
              Maximum Time
            </Label>
            <Input
              id="maxTime"
              type="time"
              value={field.maxTime || ""}
              onChange={(e) => handleMaxTimeChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Latest selectable time
            </p>
          </div>
        </div>
      </AdvancedPanel>
    </>
  );
}
