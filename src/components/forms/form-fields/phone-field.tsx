"use client"

import { useCallback, memo } from "react"
import { Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FieldWrapper from "../edit/shared/FieldWrapper"
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel"
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers"
import { cn } from "@/lib/utils"

interface PhoneFieldProps {
  field: {
    id: string
    question: string
    description?: string
    placeholder?: string
    required: boolean
    countryCode?: string
    formatTemplate?: string
  }
  index: number
  onUpdate: (updates: Partial<PhoneFieldProps["field"]>) => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void
}

const PhoneField = memo(
  function PhoneField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: PhoneFieldProps) {
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

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required })
    }, [field.required, onUpdate])

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value })
      },
      [onUpdate],
    )

    const handleCountryCodeChange = useCallback(
      (value: string) => {
        onUpdate({ countryCode: value })
      },
      [onUpdate],
    )

    const handleFormatTemplateChange = useCallback(
      (value: string) => {
        onUpdate({ formatTemplate: value })
      },
      [onUpdate],
    )

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
          <div className="relative group/input">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Phone
                className={cn(
                  "h-4 w-4 text-muted-foreground/60",
                  "group-hover/input:text-primary/60 transition-colors",
                )}
              />
            </div>
            <Input
              type="tel"
              value=""
              placeholder={field.placeholder || "(555) 123-4567"}
              disabled
              className="pl-10 bg-muted/30 border-border/50 cursor-not-allowed text-muted-foreground/50"
            />
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Phone Settings"
          subtitle="Configure phone format and validation"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Example phone format shown before user types"
          >
            <Input
              id="placeholder"
              type="tel"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Phone Format">
            <AdvancedPanelFieldGroup
              label="Country/Region"
              htmlFor="countryCode"
              description="Restrict to specific country code or allow international"
            >
              <Select value={field.countryCode || "INTERNATIONAL"} onValueChange={handleCountryCodeChange}>
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
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Format Template"
              htmlFor="formatTemplate"
              description="Phone number display format"
            >
              <Select value={field.formatTemplate || "STANDARD"} onValueChange={handleFormatTemplateChange}>
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
      prevProps.field.countryCode === nextProps.field.countryCode &&
      prevProps.field.formatTemplate === nextProps.field.formatTemplate &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    )
  },
)

export default PhoneField