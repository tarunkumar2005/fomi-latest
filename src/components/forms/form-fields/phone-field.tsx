"use client";

import { useCallback, memo } from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

interface PhoneFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    countryCode?: string; // e.g., "US", "UK", "IN", "INTERNATIONAL"
    formatTemplate?: string; // e.g., "US", "INTERNATIONAL", "CUSTOM"
  };
  index: number;
  onUpdate: (updates: Partial<PhoneFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const PhoneField = memo(function PhoneField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: PhoneFieldProps) {
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

  const handleCountryCodeChange = useCallback(
    (value: string) => {
      onUpdate({ countryCode: value });
    },
    [onUpdate]
  );

  const handleFormatTemplateChange = useCallback(
    (value: string) => {
      onUpdate({ formatTemplate: value });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="Phone"
        fieldIcon={Phone}
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
        <Input
          type="tel"
          value=""
          placeholder={field.placeholder || "Enter phone number"}
          disabled
          className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50"
        />
      </FieldWrapper>

      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="Phone Field Settings"
        subtitle="Configure phone format and validation"
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
            type="tel"
            value={field.placeholder || ""}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Example phone format shown before user types
          </p>
        </div>

        {/* Phone Format Section */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Phone Format
          </h4>

          {/* Country/Region */}
          <div className="space-y-2 mb-4">
            <Label
              htmlFor="countryCode"
              className="text-sm font-medium text-foreground"
            >
              Country/Region
            </Label>
            <Select
              value={field.countryCode || "INTERNATIONAL"}
              onValueChange={handleCountryCodeChange}
            >
              <SelectTrigger id="countryCode" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNATIONAL">International</SelectItem>
                <SelectItem value="US">United States (+1)</SelectItem>
                <SelectItem value="UK">United Kingdom (+44)</SelectItem>
                <SelectItem value="IN">India (+91)</SelectItem>
                <SelectItem value="AU">Australia (+61)</SelectItem>
                <SelectItem value="CA">Canada (+1)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Restrict to specific country code or allow international
            </p>
          </div>

          {/* Format Template */}
          <div className="space-y-2">
            <Label
              htmlFor="formatTemplate"
              className="text-sm font-medium text-foreground"
            >
              Format Template
            </Label>
            <Select
              value={field.formatTemplate || "STANDARD"}
              onValueChange={handleFormatTemplateChange}
            >
              <SelectTrigger id="formatTemplate" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard (###) ###-####</SelectItem>
                <SelectItem value="INTERNATIONAL">International +## ### ### ####</SelectItem>
                <SelectItem value="COMPACT">Compact ##########</SelectItem>
                <SelectItem value="DASHES">Dashes ###-###-####</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Phone number display format
            </p>
          </div>
        </div>
      </AdvancedPanel>
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.field.id === nextProps.field.id &&
    prevProps.field.question === nextProps.field.question &&
    prevProps.field.description === nextProps.field.description &&
    prevProps.field.placeholder === nextProps.field.placeholder &&
    prevProps.field.required === nextProps.field.required &&
    prevProps.field.countryCode === nextProps.field.countryCode &&
    prevProps.field.formatTemplate === nextProps.field.formatTemplate &&
    prevProps.index === nextProps.index &&
    prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
  );
});

export default PhoneField;
