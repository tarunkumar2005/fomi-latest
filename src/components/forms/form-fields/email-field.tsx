"use client"

import { useCallback, memo } from "react"
import { Mail, AtSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import FieldWrapper from "../edit/shared/FieldWrapper"
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel"
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers"

interface EmailFieldProps {
  field: {
    id: string
    question: string
    description?: string
    placeholder?: string
    required: boolean
    allowedDomains?: string
    blockedDomains?: string
  }
  index: number
  onUpdate: (updates: Partial<EmailFieldProps["field"]>) => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void
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
    } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle)

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value })
      },
      [onUpdate],
    )

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required })
    }, [field.required, onUpdate])

    const handleAllowedDomainsChange = useCallback(
      (value: string) => {
        onUpdate({ allowedDomains: value || undefined })
      },
      [onUpdate],
    )

    const handleBlockedDomainsChange = useCallback(
      (value: string) => {
        onUpdate({ blockedDomains: value || undefined })
      },
      [onUpdate],
    )

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
          <div className="relative group/input">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <AtSign className="h-4 w-4 text-muted-foreground/60 group-hover/input:text-primary/60 transition-colors" />
            </div>
            <Input
              type="email"
              value=""
              placeholder={field.placeholder || "name@example.com"}
              disabled
              className="pl-10 bg-muted/30 border-border/50 cursor-not-allowed text-muted-foreground/50"
            />
          </div>
        </FieldWrapper>

        {/* Advanced Settings Panel */}
        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Email Settings"
          subtitle="Configure email validation and behavior"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Example email shown before user types"
          >
            <Input
              id="placeholder"
              type="email"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="name@example.com"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Domain Restrictions">
            <AdvancedPanelFieldGroup
              label="Allowed Domains (optional)"
              htmlFor="allowedDomains"
              description="Only accept emails from these domains (comma-separated). Leave empty to allow all."
            >
              <Input
                id="allowedDomains"
                value={field.allowedDomains || ""}
                onChange={(e) => handleAllowedDomainsChange(e.target.value)}
                placeholder="company.com, example.org"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Blocked Domains (optional)"
              htmlFor="blockedDomains"
              description="Reject emails from these domains (comma-separated)"
            >
              <Input
                id="blockedDomains"
                value={field.blockedDomains || ""}
                onChange={(e) => handleBlockedDomainsChange(e.target.value)}
                placeholder="spam.com, tempmail.org"
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>
        </AdvancedPanel>
      </>
    )
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
    )
  },
)

export default EmailField