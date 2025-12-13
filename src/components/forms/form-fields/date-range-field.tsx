"use client"

import { useCallback, memo } from "react"
import { CalendarRange, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FieldWrapper from "../edit/shared/FieldWrapper"
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelInfoBox,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel"
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers"
import { Info } from "lucide-react"

interface DateRangeFieldProps {
  field: {
    id: string
    question: string
    description?: string
    required: boolean
    placeholder?: string
    minDate?: string
    maxDate?: string
  }
  index: number
  onUpdate: (updates: Partial<DateRangeFieldProps["field"]>) => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void
}

const DateRangeField = memo(
  function DateRangeField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: DateRangeFieldProps) {
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
    } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle)

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required })
    }, [field.required, onUpdate])

    const handlePlaceholderChange = useCallback(
      (value: string) => {
        onUpdate({ placeholder: value || undefined })
      },
      [onUpdate],
    )

    const handleMinDateChange = useCallback(
      (value: string) => {
        onUpdate({ minDate: value || undefined })
      },
      [onUpdate],
    )

    const handleMaxDateChange = useCallback(
      (value: string) => {
        onUpdate({ maxDate: value || undefined })
      },
      [onUpdate],
    )

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Date Range"
          fieldIcon={CalendarRange}
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
          {/* Preview Date Range Inputs */}
          <div className="flex items-center gap-3">
            {/* Start Date */}
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <CalendarRange className="h-4 w-4 text-muted-foreground/60 group-hover/input:text-primary/60 transition-colors" />
                </div>
                <Input
                  type="date"
                  value=""
                  disabled
                  className="pl-10 bg-muted/30 border-border/50 cursor-not-allowed text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center mt-6">
              <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            </div>

            {/* End Date */}
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <CalendarRange className="h-4 w-4 text-muted-foreground/60 group-hover/input:text-primary/60 transition-colors" />
                </div>
                <Input
                  type="date"
                  value=""
                  disabled
                  className="pl-10 bg-muted/30 border-border/50 cursor-not-allowed text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Date Range Settings"
          subtitle="Configure date range options"
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
              placeholder="e.g., Select date range"
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Date Constraints">
            <AdvancedPanelFieldGroup
              label="Minimum Date"
              htmlFor="minDate"
              description="Earliest selectable date (applies to start date)"
            >
              <Input
                id="minDate"
                type="date"
                value={field.minDate || ""}
                onChange={(e) => handleMinDateChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Maximum Date"
              htmlFor="maxDate"
              description="Latest selectable date (applies to end date)"
            >
              <Input
                id="maxDate"
                type="date"
                value={field.maxDate || ""}
                onChange={(e) => handleMaxDateChange(e.target.value)}
                className="w-full"
              />
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          <AdvancedPanelInfoBox icon={Info}>
            <p>
              <strong className="text-foreground">Note:</strong> The end date will automatically be validated to ensure
              it comes after the start date.
            </p>
          </AdvancedPanelInfoBox>
        </AdvancedPanel>
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.field.question === nextProps.field.question &&
      prevProps.field.description === nextProps.field.description &&
      prevProps.field.required === nextProps.field.required &&
      prevProps.field.placeholder === nextProps.field.placeholder &&
      prevProps.field.minDate === nextProps.field.minDate &&
      prevProps.field.maxDate === nextProps.field.maxDate &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    )
  },
)

export default DateRangeField