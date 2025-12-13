"use client"

import { useCallback, memo } from "react"
import { Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import FieldWrapper from "../edit/shared/FieldWrapper"
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel"
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers"

interface NumberFieldProps {
  field: {
    id: string
    question: string
    description?: string
    placeholder?: string
    required: boolean
    min?: number
    max?: number
    step?: number
  }
  index: number
  onUpdate: (updates: Partial<NumberFieldProps["field"]>) => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void
}

const NumberField = memo(
  function NumberField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: NumberFieldProps) {
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

    const handleMinChange = useCallback(
      (value: string) => {
        const num = Number.parseFloat(value)
        onUpdate({ min: isNaN(num) ? undefined : num })
      },
      [onUpdate],
    )

    const handleMaxChange = useCallback(
      (value: string) => {
        const num = Number.parseFloat(value)
        onUpdate({ max: isNaN(num) ? undefined : num })
      },
      [onUpdate],
    )

    const handleStepChange = useCallback(
      (value: string) => {
        const num = Number.parseFloat(value)
        onUpdate({ step: isNaN(num) || num <= 0 ? undefined : num })
      },
      [onUpdate],
    )

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Number"
          fieldIcon={Hash}
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
              <Hash className="h-4 w-4 text-muted-foreground/60 group-hover/input:text-primary/60 transition-colors" />
            </div>
            <Input
              type="number"
              value=""
              placeholder={field.placeholder || "Enter a number"}
              min={field.min}
              max={field.max}
              step={field.step}
              disabled
              className="pl-10 bg-muted/30 border-border/50 cursor-not-allowed text-muted-foreground/50"
            />
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Number Settings"
          subtitle="Configure numeric validation and behavior"
        >
          <AdvancedPanelFieldGroup
            label="Placeholder Text"
            htmlFor="placeholder"
            description="Text shown before user enters a value"
          >
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="Enter a number"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Numeric Constraints">
            <AdvancedPanelFieldGroup
              label="Minimum Value"
              htmlFor="min"
              description="Minimum allowed value (inclusive)"
            >
              <Input
                id="min"
                type="number"
                value={field.min !== undefined ? field.min : ""}
                onChange={(e) => handleMinChange(e.target.value)}
                placeholder="No minimum"
                className="w-full"
                step="any"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Value"
              htmlFor="max"
              description="Maximum allowed value (inclusive)"
            >
              <Input
                id="max"
                type="number"
                value={field.max !== undefined ? field.max : ""}
                onChange={(e) => handleMaxChange(e.target.value)}
                placeholder="No maximum"
                className="w-full"
                step="any"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Step Increment"
              htmlFor="step"
              description="Increment value for number input (e.g., 0.1, 1, 10)"
            >
              <Input
                id="step"
                type="number"
                value={field.step !== undefined ? field.step : ""}
                onChange={(e) => handleStepChange(e.target.value)}
                placeholder="1"
                className="w-full"
                min="0"
                step="any"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          {/* Range Preview */}
          {(field.min !== undefined || field.max !== undefined) && (
            <>
              <AdvancedPanelDivider />
              <AdvancedPanelSection title="Allowed Range">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    {field.min !== undefined && field.max !== undefined
                      ? `${field.min} to ${field.max}`
                      : field.min !== undefined
                        ? `${field.min} or greater`
                        : `${field.max} or less`}
                  </p>
                  {field.step && <p className="text-xs text-muted-foreground mt-1">In steps of {field.step}</p>}
                </div>
              </AdvancedPanelSection>
            </>
          )}
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
      prevProps.field.min === nextProps.field.min &&
      prevProps.field.max === nextProps.field.max &&
      prevProps.field.step === nextProps.field.step &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    )
  },
)

export default NumberField