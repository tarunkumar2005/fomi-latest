"use client";

import { useCallback, memo } from "react";
import { Link, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";
import { cn } from "@/lib/utils";

interface UrlFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    requireHttps?: boolean;
    allowedDomains?: string;
  };
  index: number;
  onUpdate: (updates: Partial<UrlFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const UrlField = memo(
  function UrlField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: UrlFieldProps) {
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
          <div className="relative group/input">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Globe
                className={cn(
                  "h-4 w-4 text-muted-foreground/60",
                  "group-hover/input:text-primary/60 transition-colors"
                )}
              />
            </div>
            <Input
              type="url"
              value=""
              placeholder={field.placeholder || "https://example.com"}
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
          title="URL Settings"
          subtitle="Configure URL validation and behavior"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Text shown before user types"
          >
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="URL Validation">
            <div className="flex items-start space-x-3">
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

            <AdvancedPanelFieldGroup
              label="Allowed Domains"
              htmlFor="allowedDomains"
              description="Comma-separated list of allowed domains (leave empty for any domain)"
            >
              <Input
                id="allowedDomains"
                value={field.allowedDomains || ""}
                onChange={(e) => handleAllowedDomainsChange(e.target.value)}
                placeholder="example.com, company.org"
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
      prevProps.field.placeholder === nextProps.field.placeholder &&
      prevProps.field.required === nextProps.field.required &&
      prevProps.field.requireHttps === nextProps.field.requireHttps &&
      prevProps.field.allowedDomains === nextProps.field.allowedDomains &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default UrlField;
