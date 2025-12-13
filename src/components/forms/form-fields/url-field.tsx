"use client";

import { useCallback, memo } from "react";
import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

interface UrlFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    requireHttps?: boolean;
    allowedDomains?: string; // Comma-separated domains like "example.com, company.org"
  };
  index: number;
  onUpdate: (updates: Partial<UrlFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const UrlField = memo(function UrlField({
  field,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  isAdvancedOpen,
  onAdvancedToggle,
}: UrlFieldProps) {
  console.log(`UrlField rendering for ${field.id}:`, {
    question: field.question,
    description: field.description,
    placeholder: field.placeholder,
  });

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

  const handleRequireHttpsToggle = useCallback(() => {
    onUpdate({ requireHttps: !field.requireHttps });
  }, [field.requireHttps, onUpdate]);

  const handleAllowedDomainsChange = useCallback(
    (value: string) => {
      onUpdate({ allowedDomains: value || undefined });
    },
    [onUpdate]
  );

  return (
    <>
      <FieldWrapper
        index={index}
        fieldType="URL"
        fieldIcon={Link}
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
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Link className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <Input
            type="url"
            value=""
            placeholder={field.placeholder || "https://example.com"}
            disabled
            className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50 pl-10"
          />
        </div>
      </FieldWrapper>

      <AdvancedPanel
        isOpen={isAdvancedOpen ?? false}
        onClose={handleAdvancedClose}
        title="URL Field Settings"
        subtitle="Configure URL validation and behavior"
      >
        {/* Placeholder Text */}
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
            placeholder="https://example.com"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Text shown before user types
          </p>
        </div>

        {/* Require HTTPS */}
        <div className="flex items-start space-x-3 pt-4 border-t border-border/50">
          <Checkbox
            id="requireHttps"
            checked={field.requireHttps ?? false}
            onCheckedChange={handleRequireHttpsToggle}
          />
          <div className="flex-1">
            <Label
              htmlFor="requireHttps"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Require HTTPS
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Only accept secure URLs (https://)
            </p>
          </div>
        </div>

        {/* Allowed Domains */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Label
            htmlFor="allowedDomains"
            className="text-sm font-medium text-foreground"
          >
            Allowed Domains
          </Label>
          <Input
            id="allowedDomains"
            value={field.allowedDomains || ""}
            onChange={(e) => handleAllowedDomainsChange(e.target.value)}
            placeholder="example.com, company.org"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed domains (leave empty for any domain)
          </p>
        </div>
      </AdvancedPanel>
    </>
  );
});

export default UrlField;
