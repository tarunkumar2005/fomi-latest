"use client";

import { useCallback, memo } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldWrapper from "@/components/forms/edit/shared/FieldWrapper";
import AdvancedPanel from "@/components/forms/edit/shared/AdvancedPanel";
import { useFieldHandlers } from "@/components/forms/edit/hooks/useFieldHandlers";

interface EmailFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    allowedDomains?: string; // Comma-separated domains like "company.com, example.org"
    blockedDomains?: string; // Comma-separated domains to reject
  };
  index: number;
  onUpdate: (updates: Partial<EmailFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const EmailField = memo(
  function EmailField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: EmailFieldProps) {
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

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value });
      },
      [onUpdate]
    );

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required });
    }, [field.required, onUpdate]);

    const handleAllowedDomainsChange = useCallback(
      (value: string) => {
        onUpdate({ allowedDomains: value || undefined });
      },
      [onUpdate]
    );

    const handleBlockedDomainsChange = useCallback(
      (value: string) => {
        onUpdate({ blockedDomains: value || undefined });
      },
      [onUpdate]
    );

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Email"
          fieldIcon={Mail}
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onAdvancedClick={handleAdvancedClick}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onEnhance={onEnhance}
          questionRef={questionRef}
          descriptionRef={descriptionRef}
          showAdvanced={true}
        >
          {/* Field-specific preview content */}
          <Input
            type="email"
            value=""
            placeholder={field.placeholder || "name@example.com"}
            disabled
            className="bg-background border-border/50 cursor-not-allowed text-muted-foreground/50"
          />
        </FieldWrapper>

        {/* Advanced Settings Panel */}
        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Advanced Settings"
          subtitle="Configure email validation and behavior"
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
              type="email"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="name@example.com"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Example email shown before user types
            </p>
          </div>

          {/* Domain Restrictions */}
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Domain Restrictions
            </h4>

            {/* Allowed Domains */}
            <div className="space-y-2 mb-4">
              <Label
                htmlFor="allowedDomains"
                className="text-sm font-medium text-foreground"
              >
                Allowed Domains (optional)
              </Label>
              <Input
                id="allowedDomains"
                value={field.allowedDomains || ""}
                onChange={(e) => handleAllowedDomainsChange(e.target.value)}
                placeholder="company.com, example.org"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only accept emails from these domains (comma-separated). Leave
                empty to allow all.
              </p>
            </div>

            {/* Blocked Domains */}
            <div className="space-y-2">
              <Label
                htmlFor="blockedDomains"
                className="text-sm font-medium text-foreground"
              >
                Blocked Domains (optional)
              </Label>
              <Input
                id="blockedDomains"
                value={field.blockedDomains || ""}
                onChange={(e) => handleBlockedDomainsChange(e.target.value)}
                placeholder="spam.com, tempmail.org"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Reject emails from these domains (comma-separated)
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
      prevProps.field.allowedDomains === nextProps.field.allowedDomains &&
      prevProps.field.blockedDomains === nextProps.field.blockedDomains &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default EmailField;
