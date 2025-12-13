"use client";

import { useCallback, memo } from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";
import { cn } from "@/lib/utils";

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

const TimeField = memo(
  function TimeField({
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
          <div className="relative group/input">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Clock
                className={cn(
                  "h-4 w-4 text-muted-foreground/60",
                  "group-hover/input:text-primary/60 transition-colors"
                )}
              />
            </div>
            <Input
              type="time"
              value=""
              disabled
              className="pl-10 cursor-not-allowed"
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
          title="Time Settings"
          subtitle="Configure time input options"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Hint text shown when field is empty"
          >
            <Input
              id="placeholder"
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="e.g., Select time"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelFieldGroup
            label="Time Format"
            htmlFor="timeFormat"
            description="Display format for time input"
          >
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
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Time Constraints">
            <AdvancedPanelFieldGroup
              label="Minimum Time"
              htmlFor="minTime"
              description="Earliest selectable time"
            >
              <Input
                id="minTime"
                type="time"
                value={field.minTime || ""}
                onChange={(e) => handleMinTimeChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Time"
              htmlFor="maxTime"
              description="Latest selectable time"
            >
              <Input
                id="maxTime"
                type="time"
                value={field.maxTime || ""}
                onChange={(e) => handleMaxTimeChange(e.target.value)}
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
      prevProps.field.placeholder === nextProps.field.placeholder &&
      prevProps.field.timeFormat === nextProps.field.timeFormat &&
      prevProps.field.minTime === nextProps.field.minTime &&
      prevProps.field.maxTime === nextProps.field.maxTime &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default TimeField;
